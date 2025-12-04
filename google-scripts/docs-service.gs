// ===============================================================
// === GOOGLE APPS SCRIPT SERVICE ===
// === Upload Files & Create Documents ===
// ===============================================================
// File này cần được deploy như một Web App trên Google Apps Script
// Sau khi deploy, lấy URL và cấu hình vào js/google-docs-api.js

// ===============================================================
// === CẤU HÌNH TRUNG TÂM ===
// ===============================================================
const CONFIG = {
  // !!! QUAN TRỌNG: CẬP NHẬT CÁC ID SAU KHI TẠO TRÊN GOOGLE DRIVE !!!
  
  // Folder IDs trên Google Drive
  FOLDER_ID_DON_HANG: "REPLACE_WITH_FOLDER_ID",      // Folder lưu file đơn hàng
  FOLDER_ID_HOP_DONG: "REPLACE_WITH_FOLDER_ID",      // Folder lưu hợp đồng
  FOLDER_ID_THOA_THUAN: "REPLACE_WITH_FOLDER_ID",    // Folder lưu thỏa thuận
  FOLDER_ID_DE_NGHI: "REPLACE_WITH_FOLDER_ID",       // Folder lưu đề nghị giải ngân
  
  // Template IDs (Google Docs templates)
  TEMPLATE_ID_HDMB: "REPLACE_WITH_TEMPLATE_ID",      // Template Hợp đồng Mua Bán
  TEMPLATE_ID_DNGN: "REPLACE_WITH_TEMPLATE_ID",      // Template Đề nghị Giải ngân
  
  // Template IDs cho Thỏa thuận lãi suất (theo ngân hàng)
  TEMPLATE_IDS_THOA_THUAN: {
    "techcom": "REPLACE_WITH_TEMPLATE_ID",
    "vpbank": "REPLACE_WITH_TEMPLATE_ID",
    "tpbank": "REPLACE_WITH_TEMPLATE_ID",
    "bidv": "REPLACE_WITH_TEMPLATE_ID",
    "sacombank": "REPLACE_WITH_TEMPLATE_ID"
  }
};

// ===============================================================
// === PUBLIC WEB APP ENTRY ===
// ===============================================================
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: "This is a POST-only service. Use POST method."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch (action) {
      case 'upload_files':
        return ContentService.createTextOutput(JSON.stringify(uploadFilesToDrive(data.files, data.folderId || CONFIG.FOLDER_ID_DON_HANG))).setMimeType(ContentService.MimeType.JSON);
      
      case 'create_hdmb':
        return ContentService.createTextOutput(JSON.stringify(createHDMB(data.formData))).setMimeType(ContentService.MimeType.JSON);
      
      case 'create_thoa_thuan':
        return ContentService.createTextOutput(JSON.stringify(createThoaThuan(data.formData))).setMimeType(ContentService.MimeType.JSON);
      
      case 'create_de_nghi_giai_ngan':
        return ContentService.createTextOutput(JSON.stringify(createDeNghiGiaiNgan(data.formData))).setMimeType(ContentService.MimeType.JSON);
      
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: "Unknown action: " + action
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===============================================================
// === UPLOAD FILES TO GOOGLE DRIVE ===
// ===============================================================
/**
 * Upload files lên Google Drive
 * @param {Array} files - Array of {name, data (base64), mimeType}
 * @param {String} folderId - Folder ID để lưu file
 * @returns {Object} {success: boolean, urls: Array<string>}
 */
function uploadFilesToDrive(files, folderId) {
  try {
    if (!files || files.length === 0) {
      return { success: true, urls: [] };
    }
    
    const folder = DriveApp.getFolderById(folderId);
    if (!folder) {
      throw new Error('Folder không tồn tại: ' + folderId);
    }
    
    const fileUrls = [];
    
    files.forEach(file => {
      try {
        const blob = Utilities.newBlob(
          Utilities.base64Decode(file.data),
          file.mimeType,
          file.name
        );
        const savedFile = folder.createFile(blob);
        savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrls.push({
          name: file.name,
          url: savedFile.getUrl(),
          id: savedFile.getId()
        });
      } catch (fileError) {
        Logger.log('Error uploading file ' + file.name + ': ' + fileError.toString());
      }
    });
    
    return {
      success: true,
      urls: fileUrls,
      message: `Đã upload ${fileUrls.length} file thành công`
    };
  } catch (e) {
    Logger.log('Upload files error: ' + e.toString());
    return {
      success: false,
      message: 'Lỗi upload file: ' + e.toString()
    };
  }
}

// ===============================================================
// === CREATE HỢP ĐỒNG MUA BÁN (HĐMB) ===
// ===============================================================
/**
 * Tạo Hợp đồng Mua Bán từ template
 * @param {Object} formData - Dữ liệu form
 * @returns {Object} {success: boolean, fileUrl: string, fileId: string}
 */
function createHDMB(formData) {
  try {
    if (!CONFIG.TEMPLATE_ID_HDMB || CONFIG.TEMPLATE_ID_HDMB.startsWith("REPLACE")) {
      throw new Error('Chưa cấu hình TEMPLATE_ID_HDMB trong CONFIG');
    }
    
    const templateDoc = DocumentApp.openById(CONFIG.TEMPLATE_ID_HDMB);
    const contractName = "HĐMB_" + (formData.khach_hang || formData.customer_name || 'KH').replace(/\s+/g, "_") + "_" + (formData.so_hop_dong || formData.contract_code || '');
    const newFile = DriveApp.getFileById(templateDoc.getId()).makeCopy(contractName);
    const newDocId = newFile.getId();
    
    const doc = DocumentApp.openById(newDocId);
    const body = doc.getBody();
    
    // Tính toán các giá trị
    const soLuong = parseInt(formData.so_luong || formData.quantity || 1) || 1;
    const donGia = parseFloat(formData.don_gia || formData.unit_price || 0) || 0;
    const tongTien = soLuong * donGia;
    
    // Thay thế placeholders
    const replacements = {
      '{{so_hop_dong}}': formData.so_hop_dong || formData.contract_code || '',
      '{{ngay_ky}}': formatDate(formData.ngay_ky || new Date()),
      '{{khach_hang}}': formData.khach_hang || formData.customer_name || '',
      '{{dia_chi}}': formData.dia_chi || formData.address || '',
      '{{sdt}}': formData.sdt || formData.phone || '',
      '{{email}}': formData.email || '',
      '{{so_cccd}}': formData.so_cccd || formData.cccd || '',
      '{{ngay_cap}}': formatDate(formData.ngay_cap || formData.issue_date),
      '{{noi_cap}}': formData.noi_cap || formData.issue_place || '',
      '{{ma_so_thue}}': formData.ma_so_thue || '',
      '{{nguoi_dai_dien}}': formData.nguoi_dai_dien || '',
      '{{chuc_vu}}': formData.chuc_vu || '',
      '{{loai_xe}}': formData.loai_xe || formData.car_model || '',
      '{{phien_ban}}': formData.phien_ban || formData.car_version || '',
      '{{mau_xe}}': formData.mau_xe || formData.car_color || '',
      '{{chinh_sach_ban_hang}}': formData.chinh_sach_ban_hang || '',
      '{{so_luong}}': soLuong.toString(),
      '{{don_gia}}': formatCurrency(donGia),
      '{{tong_tien}}': formatCurrency(tongTien),
      '{{tong_tien_bang_chu}}': numberToWords(tongTien),
      '{{tien_coc}}': formatCurrency(parseFloat(formData.tien_coc || 0)),
      '{{tien_coc_bang_chu}}': numberToWords(parseFloat(formData.tien_coc || 0)),
      '{{tien_dot_2_TT}}': formatCurrency(parseFloat(formData.tien_dot_2_TT || 0)),
      '{{tien_dot_2_TT_bang_chu}}': numberToWords(parseFloat(formData.tien_dot_2_TT || 0)),
      '{{tien_dot_2_TG}}': formatCurrency(parseFloat(formData.tien_dot_2_TG || 0)),
      '{{tien_dot_2_TG_bang_chu}}': numberToWords(parseFloat(formData.tien_dot_2_TG || 0)),
      '{{tien_dot_3}}': formatCurrency(parseFloat(formData.tien_dot_3 || 0)),
      '{{tien_dot_3_bangchu}}': numberToWords(parseFloat(formData.tien_dot_3 || 0))
    };
    
    // Thực hiện replace
    for (var key in replacements) {
      body.replaceText(key, replacements[key] || '');
    }
    
    doc.saveAndClose();
    
    // Di chuyển file vào folder
    const file = DriveApp.getFileById(newDocId);
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID_HOP_DONG);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      fileUrl: file.getUrl(),
      fileId: file.getId(),
      fileName: contractName
    };
  } catch (e) {
    Logger.log('Create HDMB error: ' + e.toString());
    return {
      success: false,
      message: 'Lỗi tạo HĐMB: ' + e.toString()
    };
  }
}

// ===============================================================
// === CREATE THỎA THUẬN LÃI SUẤT ===
// ===============================================================
/**
 * Tạo Thỏa thuận lãi suất từ template
 * @param {Object} formData - Dữ liệu form
 * @returns {Object} {success: boolean, docUrl: string, pdfUrl: string (optional)}
 */
function createThoaThuan(formData) {
  try {
    const bankKey = formData.bank || formData.BANK || 'techcom';
    const templateId = CONFIG.TEMPLATE_IDS_THOA_THUAN[bankKey];
    
    if (!templateId || templateId.startsWith("REPLACE")) {
      throw new Error('Chưa cấu hình template cho ngân hàng: ' + bankKey.toUpperCase());
    }
    
    const customerName = formData.TEN_KHACH_HANG || formData.customer_name || formData.khach_hang || 'KH';
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID_THOA_THUAN);
    const templateFile = DriveApp.getFileById(templateId);
    const newName = `Thoả thuận - ${customerName} - ${bankKey.toUpperCase()} - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}`;
    const copy = templateFile.makeCopy(newName, folder);
    const copyId = copy.getId();
    
    // Replace placeholders
    const doc = DocumentApp.openById(copyId);
    const body = doc.getBody();
    
    const replacements = {
      '{{TEN_KHACH_HANG}}': formData.TEN_KHACH_HANG || formData.customer_name || formData.khach_hang || '',
      '{{DIA_CHI}}': formData.DIA_CHI || formData.address || '',
      '{{DIEN_THOAI}}': formData.DIEN_THOAI || formData.phone || '',
      '{{CCCD}}': formData.CCCD || formData.cccd || '',
      '{{NGAY_CAP}}': formatDate(formData.NGAY_CAP || formData.issue_date),
      '{{NOI_CAP}}': formData.NOI_CAP || formData.issue_place || '',
      '{{SO_HOP_DONG}}': formData.SO_HOP_DONG || formData.contract_code || '',
      '{{LOAI_XE}}': formData.LOAI_XE || formData.car_model || '',
      '{{SO_KHUNG}}': formData.SO_KHUNG || formData.vin_no || '',
      '{{SO_MAY}}': formData.SO_MAY || '',
      '{{TEN_DONG_VAY}}': formData.TEN_DONG_VAY || '',
      '{{DIA_CHI_DONG_VAY}}': formData.DIA_CHI_DONG_VAY || '',
      '{{DIEN_THOAI_DONG_VAY}}': formData.DIEN_THOAI_DONG_VAY || '',
      '{{CCCD_DONG_VAY}}': formData.CCCD_DONG_VAY || '',
      '{{NGAY_CAP_DONG_VAY}}': formatDate(formData.NGAY_CAP_DONG_VAY),
      '{{NOI_CAP_DONG_VAY}}': formData.NOI_CAP_DONG_VAY || '',
      '{{GIA_TRI_HOP_DONG}}': formatCurrency(parseFloat(formData.GIA_TRI_HOP_DONG || 0)),
      '{{SO_TIEN_VAY_SO}}': formatCurrency(parseFloat(formData.SO_TIEN_VAY_SO || 0)),
      '{{SO_TIEN_VAY_CHU}}': formData.SO_TIEN_VAY_CHU || numberToWords(parseFloat(formData.SO_TIEN_VAY_SO || 0)),
      '{{TY_LE_VAY}}': formData.TY_LE_VAY || '',
      '{{THOI_HAN_VAY}}': formData.THOI_HAN_VAY || ''
    };
    
    for (var key in replacements) {
      body.replaceText(key, replacements[key] || '');
    }
    
    doc.saveAndClose();
    
    const file = DriveApp.getFileById(copyId);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const result = {
      success: true,
      docUrl: file.getUrl(),
      docId: copyId,
      fileName: newName
    };
    
    // Export PDF nếu được yêu cầu
    if (formData.EXPORT_PDF === 'yes' || formData.export_pdf === true) {
      const pdfBlob = file.getAs('application/pdf');
      const pdfFile = folder.createFile(pdfBlob).setName(newName + '.pdf');
      pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      result.pdfUrl = pdfFile.getUrl();
      result.pdfId = pdfFile.getId();
    }
    
    return result;
  } catch (e) {
    Logger.log('Create ThoaThuan error: ' + e.toString());
    return {
      success: false,
      message: 'Lỗi tạo Thỏa thuận: ' + e.toString()
    };
  }
}

// ===============================================================
// === CREATE ĐỀ NGHỊ GIẢI NGÂN ===
// ===============================================================
/**
 * Tạo Đề nghị giải ngân từ template
 * @param {Object} requestData - Dữ liệu form
 * @returns {Object} {success: boolean, fileUrl: string, fileId: string}
 */
function createDeNghiGiaiNgan(requestData) {
  try {
    if (!CONFIG.TEMPLATE_ID_DNGN || CONFIG.TEMPLATE_ID_DNGN.startsWith("REPLACE")) {
      throw new Error('Chưa cấu hình TEMPLATE_ID_DNGN trong CONFIG');
    }
    
    const templateDoc = DocumentApp.openById(CONFIG.TEMPLATE_ID_DNGN);
    const docName = `DNGN_${(requestData.ten_khach_hang || requestData.customer_name || 'KH').replace(/\s+/g, "_")}_${requestData.so_hop_dong || requestData.contract_code || ''}`;
    const newFile = DriveApp.getFileById(templateDoc.getId()).makeCopy(docName);
    const doc = DocumentApp.openById(newFile.getId());
    const body = doc.getBody();
    
    // Tính toán số tiền
    const soTienDoiUng = parseInt(requestData.so_tien_doi_ung || 0) || 0;
    const soTienGiaiNgan = parseInt(requestData.so_tien_giai_ngan || 0) || 0;
    
    // Thay thế placeholders
    const replacements = {
      '{{ngay_ky}}': formatDate(new Date()),
      '{{kinh_gui_ngan_hang}}': "Kính gửi: " + (requestData.ten_ngan_hang_vay || requestData.bank_name || 'Ngân hàng'),
      '{{ngay_captbcv}}': formatDate(requestData.ngay_captbcv || requestData.ngay_cap_tbcv),
      '{{ten_khach_hang}}': requestData.ten_khach_hang || requestData.customer_name || '',
      '{{so_hop_dong}}': requestData.so_hop_dong || requestData.contract_code || '',
      '{{so_tai_khoan}}': requestData.so_tai_khoan || requestData.account_number || '',
      '{{loai_xe}}': requestData.loai_xe || requestData.car_model || '',
      '{{so_tien_doi_ung}}': formatCurrency(soTienDoiUng) + "VNĐ",
      '{{so_tien_doi_ung_bang_chu}}': numberToWords(soTienDoiUng),
      '{{so_tien_giai_ngan}}': formatCurrency(soTienGiaiNgan) + "VNĐ",
      '{{so_tien_giai_ngan_bang_chu}}': numberToWords(soTienGiaiNgan)
    };
    
    for (var key in replacements) {
      body.replaceText(key, replacements[key] || '');
    }
    
    doc.saveAndClose();
    
    // Di chuyển file vào folder
    const file = DriveApp.getFileById(newFile.getId());
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID_DE_NGHI);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      fileUrl: file.getUrl(),
      fileId: file.getId(),
      fileName: docName
    };
  } catch (e) {
    Logger.log('Create DeNghiGiaiNgan error: ' + e.toString());
    return {
      success: false,
      message: 'Lỗi tạo Đề nghị giải ngân: ' + e.toString()
    };
  }
}

// ===============================================================
// === HELPER FUNCTIONS ===
// ===============================================================
/**
 * Format date to Vietnamese format
 */
function formatDate(isoDate) {
  if (!isoDate) return "";
  var date = isoDate instanceof Date ? isoDate : new Date(isoDate);
  if (isNaN(date.getTime())) return "";
  return "Ngày " + date.getDate() + " tháng " + (date.getMonth() + 1) + " năm " + date.getFullYear();
}

/**
 * Format currency to Vietnamese format
 */
function formatCurrency(num) {
  if (!num || isNaN(num)) return "0";
  return parseInt(num).toLocaleString("vi-VN");
}

/**
 * Convert number to words (Vietnamese)
 */
function numberToWords(num) {
  if (num === null || num === undefined || num === '' || isNaN(num)) {
    return "";
  }
  if (parseInt(num) === 0) {
    return "Không đồng";
  }

  var ChuSo = [" không", " một", " hai", " ba", " bốn", " năm", " sáu", " bảy", " tám", " chín"];
  var Tien = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];
  var s = num.toString().replace(/[^0-9]/g, '');
  if (s === '') return "";
  
  var i, j, str, len, ketQua = "", lan = 0;
  len = s.length;

  for (i = len; i > 0; i -= 3) {
    let tmp = "";
    str = s.substring(i - 3 > 0 ? i - 3 : 0, i);
    let tram = str.length > 2 ? parseInt(str[0]) : 0;
    let chuc = str.length > 1 ? parseInt(str[str.length - 2]) : 0;
    let donvi = parseInt(str[str.length - 1]);
    
    if (tram || chuc || donvi) {
      if (tram) tmp += ChuSo[tram] + " trăm";
      if ((!tram && chuc && donvi) || (tram && chuc && !donvi) || (tram && chuc && donvi)) {
         if(chuc === 0) tmp += " lẻ";
      }
      if (chuc > 1) {
        tmp += ChuSo[chuc] + " mươi";
      }
      if (chuc == 1) {
        tmp += " mười";
      }
      if (donvi) {
        if (chuc > 1 && donvi == 1) tmp += " mốt";
        else if( (chuc === 1 || chuc === 0) && donvi === 1) tmp += ChuSo[donvi];
        else if (chuc != 0 && donvi == 5) tmp += " lăm";
        else if (donvi > 1) tmp += ChuSo[donvi];
      }
      ketQua = tmp + Tien[lan] + ketQua;
    }
    lan++;
  }
  
  ketQua = ketQua.trim().charAt(0).toUpperCase() + ketQua.trim().slice(1);
  return ketQua ? ketQua + " đồng chẵn." : "Không đồng";
}

