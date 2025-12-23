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
  FOLDER_ID_DON_HANG: "1lmJ-rnhK6J-EQvFHKtem7XDfbjvGEaRg",      // Folder lưu file đơn hàng (CCCD, đơn hàng)
  FOLDER_ID_HOP_DONG: "1zQRxBRnH5PNJ0mrU7loBpCDCziOJXwv6",      // Folder lưu hợp đồng
  FOLDER_ID_THOA_THUAN: "1SdP-6aZZCi_tmmrjNszt4v6fItOKdeEU",    // Folder lưu thỏa thuận
  FOLDER_ID_DE_NGHI: "1SdP-6aZZCi_tmmrjNszt4v6fItOKdeEU",       // Folder lưu đề nghị giải ngân
  FOLDER_ID_COC: "1lmJ-rnhK6J-EQvFHKtem7XDfbjvGEaRg",           // Folder lưu COC files (ảnh COC, biên bản bàn giao, giải ngân) - dùng chung với đơn hàng
  
  // Template IDs (Google Docs templates)
  TEMPLATE_ID_HDMB: "1LtX6VQDHMg3-AThj9HKr5MIN5phL5x526O2mUOzKwRE",      // Template Hợp đồng Mua Bán
  TEMPLATE_ID_DNGN: "1P0WUCjH60w93pD-O_nJy8twZfJMLWWvWx0mLltZhv_c",      // Template Đề nghị Giải ngân
  
  // Template IDs cho Thỏa thuận lãi suất (theo ngân hàng)
  TEMPLATE_IDS_THOA_THUAN: {
    "techcom": "1HtH6RiGrad2sUCLyK7Ere0Za6rT4GlbGlo0R5stDHVU",
    "vpbank": "1jWq25YMTsxTfNGjzYEnMdN0B4Y2NfiUTN07_nnHUQ7A",
    "tpbank": "1NMG_RnIyQ7KgeS_4oGfwLN2G6MykBGFZTGXl2BQf1DU",
    "bidv": "REPLACE_WITH_BIDV_DOC_ID",        // ⚠️ Cần cập nhật Template ID cho BIDV
    "sacombank": "1TePgLhNa0FWfbkj7ek4gi3pmTZTIstPz7Toxw8kNBL8"
  }
};

// ===============================================================
// === PUBLIC WEB APP ENTRY ===
// ===============================================================
// ===============================================================
// === RESPONSE HELPER ===
// ===============================================================
/**
 * Helper function để tạo JSON response
 * Lưu ý: Google Apps Script ContentService không hỗ trợ setHeaders()
 * CORS headers được xử lý bởi deployment settings (Who has access: Anyone)
 */
function createJSONResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return createJSONResponse({
    success: false,
    message: "This is a POST-only service. Use POST method."
  });
}

function doOptions(e) {
  // Handle CORS preflight requests
  // Google Apps Script tự động xử lý OPTIONS nếu deploy với "Anyone" access
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    let data = {};
    
    // Xử lý cả JSON và FormData và text/plain
    if (e.postData && e.postData.contents) {
      const contentType = e.postData.type || '';
      
      if (contentType.indexOf('application/json') !== -1 || contentType.indexOf('text/plain') !== -1) {
        // JSON request hoặc text/plain với JSON content
        try {
          data = JSON.parse(e.postData.contents);
        } catch (parseError) {
          Logger.log('Error parsing JSON from postData: ' + parseError.toString());
          // Fallback to parameter
          data = e.parameter || {};
        }
      } else {
        // FormData request - parse từ e.parameter
        data = e.parameter || {};
        Logger.log('FormData request detected');
        Logger.log('e.parameter keys: ' + Object.keys(data).join(', '));
        Logger.log('data.formData before parse: ' + (data.formData ? (typeof data.formData + ' - ' + data.formData.substring(0, 200)) : 'null'));
        
        // Parse JSON strings từ FormData
        if (data.files && typeof data.files === 'string') {
          try {
            data.files = JSON.parse(data.files);
            Logger.log('Parsed files successfully');
          } catch (e) {
            Logger.log('Error parsing files from FormData: ' + e.toString());
          }
        }
        if (data.formData && typeof data.formData === 'string') {
          try {
            data.formData = JSON.parse(data.formData);
            Logger.log('Parsed formData successfully');
            Logger.log('formData keys after parse: ' + Object.keys(data.formData).join(', '));
            Logger.log('formData.so_hop_dong: ' + data.formData.so_hop_dong);
            Logger.log('formData.khach_hang: ' + data.formData.khach_hang);
          } catch (e) {
            Logger.log('Error parsing formData from FormData: ' + e.toString());
            Logger.log('formData string value: ' + data.formData);
          }
        } else if (!data.formData) {
          Logger.log('⚠️ data.formData is null or undefined');
          Logger.log('Trying to use data directly...');
          // Nếu không có formData, thử dùng data trực tiếp (trừ action)
          var tempFormData = {};
          for (var key in data) {
            if (key !== 'action') {
              tempFormData[key] = data[key];
            }
          }
          if (Object.keys(tempFormData).length > 0) {
            data.formData = tempFormData;
            Logger.log('Created formData from data: ' + Object.keys(tempFormData).join(', '));
          }
        }
      }
    } else {
      // Fallback: lấy từ parameter (FormData hoặc URL params)
      data = e.parameter || {};
      Logger.log('No postData, using e.parameter');
      Logger.log('e.parameter keys: ' + Object.keys(data).join(', '));
      
      // Parse formData nếu có
      if (data.formData && typeof data.formData === 'string') {
        try {
          data.formData = JSON.parse(data.formData);
          Logger.log('Parsed formData from e.parameter');
        } catch (e) {
          Logger.log('Error parsing formData from e.parameter: ' + e.toString());
        }
      }
    }
    
    // Final check: Nếu không có postData và không có e.parameter, thử parse từ e
    if (!data || Object.keys(data).length === 0) {
      Logger.log('⚠️ No data found, trying e directly...');
      if (e.parameter) {
        data = e.parameter;
        Logger.log('Using e.parameter: ' + Object.keys(data).join(', '));
      }
    }
    
    const action = data.action;
    
    if (!action) {
      Logger.log('❌ No action found in data');
      Logger.log('data keys: ' + Object.keys(data).join(', '));
      return createJSONResponse({
        success: false,
        message: "Missing 'action' parameter"
      });
    }
    
    Logger.log('Action: ' + action);
    
    switch (action) {
      case 'upload_files':
        return createJSONResponse(uploadFilesToDrive(data.files, data.folderId || CONFIG.FOLDER_ID_DON_HANG));
      
      case 'create_hdmb':
        Logger.log('=== CREATE HDMB ACTION ===');
        Logger.log('data.formData type: ' + typeof data.formData);
        Logger.log('data.formData: ' + JSON.stringify(data.formData));
        Logger.log('data keys: ' + Object.keys(data).join(', '));
        Logger.log('data values: ' + JSON.stringify(data));
        
        // Đảm bảo formData có giá trị
        var formDataToUse = data.formData;
        
        // Nếu formData không có, thử tạo từ data (trừ action)
        if (!formDataToUse || typeof formDataToUse !== 'object' || formDataToUse === null) {
          Logger.log('⚠️ formData không có hoặc không đúng type, tạo từ data...');
          Logger.log('data có ' + Object.keys(data).length + ' keys');
          formDataToUse = {};
          for (var key in data) {
            if (key !== 'action') {
              formDataToUse[key] = data[key];
            }
          }
          Logger.log('Created formDataToUse with keys: ' + Object.keys(formDataToUse).join(', '));
          Logger.log('formDataToUse values: ' + JSON.stringify(formDataToUse));
        }
        
        if (!formDataToUse || Object.keys(formDataToUse).length === 0) {
          Logger.log('❌ formDataToUse is empty');
          return createJSONResponse({
            success: false,
            message: 'Không có dữ liệu formData. Vui lòng kiểm tra request. Data keys: ' + Object.keys(data).join(', ')
          });
        }
        
        Logger.log('Calling createHDMB with formDataToUse...');
        return createJSONResponse(createHDMB(formDataToUse));
      
      case 'create_thoa_thuan':
        return createJSONResponse(createThoaThuan(data.formData));
      
      case 'create_de_nghi_giai_ngan':
        return createJSONResponse(createDeNghiGiaiNgan(data.formData));
      
      default:
        return createJSONResponse({
          success: false,
          message: "Unknown action: " + action
        });
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return createJSONResponse({
      success: false,
      message: error.toString()
    });
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
    Logger.log('=== Upload Files To Drive ===');
    Logger.log('Files type: ' + typeof files);
    Logger.log('Files is array: ' + Array.isArray(files));
    Logger.log('Files value: ' + JSON.stringify(files));
    
    // Validate và convert files thành array
    if (!files) {
      Logger.log('No files provided');
      return { success: false, message: 'Không có file nào được cung cấp' };
    }
    
    // Nếu files là string, thử parse JSON
    if (typeof files === 'string') {
      try {
        Logger.log('Files is string, parsing JSON...');
        files = JSON.parse(files);
        Logger.log('Parsed files type: ' + typeof files);
        Logger.log('Parsed files is array: ' + Array.isArray(files));
      } catch (parseError) {
        Logger.log('Error parsing files string: ' + parseError.toString());
        return { success: false, message: 'Lỗi parse file data: ' + parseError.toString() };
      }
    }
    
    // Đảm bảo files là array
    if (!Array.isArray(files)) {
      Logger.log('Files is not an array, converting...');
      // Nếu là object với keys là numbers hoặc có length property, thử convert
      if (typeof files === 'object' && files !== null) {
        // Thử convert object thành array
        const filesArray = Object.keys(files).map(key => files[key]);
        files = filesArray;
        Logger.log('Converted to array, length: ' + files.length);
      } else {
        Logger.log('Cannot convert files to array');
        return { success: false, message: 'File data không đúng định dạng. Cần một array.' };
      }
    }
    
    Logger.log('Files count: ' + files.length);
    Logger.log('Folder ID: ' + folderId);
    
    if (files.length === 0) {
      Logger.log('No files to upload');
      return { success: false, message: 'Không có file nào để upload' };
    }
    
    if (!folderId) {
      throw new Error('Folder ID không được cung cấp');
    }
    
    const folder = DriveApp.getFolderById(folderId);
    if (!folder) {
      throw new Error('Folder không tồn tại: ' + folderId);
    }
    
    Logger.log('Folder found: ' + folder.getName());
    
    const fileUrls = [];
    const errors = [];
    
    files.forEach((file, index) => {
      try {
        Logger.log(`Processing file ${index + 1}/${files.length}: ${file.name}`);
        
        if (!file.data) {
          throw new Error('File data không tồn tại');
        }
        
        if (!file.mimeType) {
          file.mimeType = 'application/octet-stream';
        }
        
        // Decode base64 và tạo blob
        const blob = Utilities.newBlob(
          Utilities.base64Decode(file.data),
          file.mimeType,
          file.name
        );
        
        Logger.log(`Blob created: ${blob.getName()}, size: ${blob.getBytes().length}`);
        
        // Upload file
        const savedFile = folder.createFile(blob);
        Logger.log(`File created on Drive: ${savedFile.getName()}, ID: ${savedFile.getId()}`);
        
        // Set sharing
        savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // Get URL
        const fileUrl = savedFile.getUrl();
        const fileId = savedFile.getId();
        
        Logger.log(`File URL: ${fileUrl}`);
        
        fileUrls.push({
          name: file.name,
          url: fileUrl,
          id: fileId
        });
        
        Logger.log(`✅ Successfully uploaded: ${file.name}`);
      } catch (fileError) {
        const errorMsg = 'Error uploading file ' + file.name + ': ' + fileError.toString();
        Logger.log('❌ ' + errorMsg);
        errors.push({ fileName: file.name, error: errorMsg });
      }
    });
    
    Logger.log(`Upload completed. Success: ${fileUrls.length}, Errors: ${errors.length}`);
    
    // Chỉ return success nếu có ít nhất 1 file được upload
    if (fileUrls.length === 0) {
      Logger.log('❌ No files uploaded successfully');
      return {
        success: false,
        message: 'Không thể upload bất kỳ file nào. ' + (errors.length > 0 ? errors[0].error : 'Lỗi không xác định'),
        errors: errors
      };
    }
    
    // Nếu có file nào đó fail, vẫn return success nhưng có warning
    if (errors.length > 0) {
      Logger.log('⚠️ Some files failed to upload');
      return {
        success: true,
        urls: fileUrls,
        message: `Đã upload ${fileUrls.length}/${files.length} file thành công`,
        warnings: errors
      };
    }
    
    return {
      success: true,
      urls: fileUrls,
      message: `Đã upload ${fileUrls.length} file thành công`
    };
  } catch (e) {
    Logger.log('❌ Upload files error: ' + e.toString());
    Logger.log('Error stack: ' + e.stack);
    return {
      success: false,
      message: 'Lỗi upload file: ' + e.toString(),
      error: e.toString()
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
    Logger.log('=== CREATE HDMB START ===');
    Logger.log('formData type: ' + typeof formData);
    Logger.log('formData is null: ' + (formData === null));
    Logger.log('formData is undefined: ' + (formData === undefined));
    
    // Validate formData
    if (!formData || typeof formData !== 'object') {
      Logger.log('❌ formData không hợp lệ');
      Logger.log('formData value: ' + JSON.stringify(formData));
      throw new Error('formData không được cung cấp hoặc không đúng định dạng. Type: ' + typeof formData);
    }
    
    Logger.log('formData keys: ' + Object.keys(formData).join(', '));
    Logger.log('formData value: ' + JSON.stringify(formData));
    
    if (!CONFIG.TEMPLATE_ID_HDMB || CONFIG.TEMPLATE_ID_HDMB.startsWith("REPLACE")) {
      throw new Error('Chưa cấu hình TEMPLATE_ID_HDMB trong CONFIG');
    }
    
    Logger.log('Opening template: ' + CONFIG.TEMPLATE_ID_HDMB);
    const templateDoc = DocumentApp.openById(CONFIG.TEMPLATE_ID_HDMB);
    
    // Debug: Kiểm tra các giá trị để tạo tên file
    Logger.log('formData.khach_hang: ' + formData.khach_hang);
    Logger.log('formData.customer_name: ' + formData.customer_name);
    Logger.log('formData.so_hop_dong: ' + formData.so_hop_dong);
    Logger.log('formData.contract_code: ' + formData.contract_code);
    
    const khachHangName = (formData.khach_hang || formData.customer_name || 'KH').replace(/\s+/g, "_");
    const soHopDong = (formData.so_hop_dong || formData.contract_code || '');
    const contractName = "HĐMB_" + khachHangName + "_" + soHopDong;
    Logger.log('Contract name: ' + contractName);
    
    const newFile = DriveApp.getFileById(templateDoc.getId()).makeCopy(contractName);
    const newDocId = newFile.getId();
    Logger.log('New file created with ID: ' + newDocId);
    
    const doc = DocumentApp.openById(newDocId);
    const body = doc.getBody();
    
    // Lấy toàn bộ text để kiểm tra placeholder
    const fullText = body.getText();
    Logger.log('Document full text (first 500 chars): ' + fullText.substring(0, 500));
    
    // Tính toán các giá trị
    const soLuong = parseInt(formData.so_luong || formData.quantity || 1) || 1;
    const donGia = parseFloat(formData.don_gia || formData.unit_price || 0) || 0;
    const tongTien = soLuong * donGia;
    
    Logger.log('Calculated values: soLuong=' + soLuong + ', donGia=' + donGia + ', tongTien=' + tongTien);
    
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
    
    Logger.log('Total replacements: ' + Object.keys(replacements).length);
    
    // Thực hiện replace - thử nhiều cách
    var successCount = 0;
    var failCount = 0;
    
    for (var key in replacements) {
      try {
        var value = replacements[key] || '';
        Logger.log('--- Processing placeholder: ' + key + ' ---');
        Logger.log('Value: ' + value);
        
        // Cách 1: Thử replace trực tiếp với key gốc (không escape)
        try {
          var found1 = body.findText(key);
          if (found1) {
            Logger.log('✅ Found with original key, replacing...');
            body.replaceText(key, value);
            successCount++;
            Logger.log('✅ Successfully replaced: ' + key);
            continue;
          }
        } catch (e) {
          Logger.log('Method 1 failed: ' + e.toString());
        }
        
        // Cách 2: Thử escape các ký tự đặc biệt
        var escapedKey = key.replace(/[{}[\]()+\-*?.^$|\\]/g, '\\$&');
        Logger.log('Escaped key: ' + escapedKey);
        try {
          var found2 = body.findText(escapedKey);
          if (found2) {
            Logger.log('✅ Found with escaped key, replacing...');
            body.replaceText(escapedKey, value);
            successCount++;
            Logger.log('✅ Successfully replaced: ' + key);
            continue;
          }
        } catch (e) {
          Logger.log('Method 2 failed: ' + e.toString());
        }
        
        // Cách 3: Thử chỉ escape {}
        var simpleEscaped = key.replace(/[{}]/g, '\\$&');
        Logger.log('Simple escaped: ' + simpleEscaped);
        try {
          var found3 = body.findText(simpleEscaped);
          if (found3) {
            Logger.log('✅ Found with simple escaped, replacing...');
            body.replaceText(simpleEscaped, value);
            successCount++;
            Logger.log('✅ Successfully replaced: ' + key);
            continue;
          }
        } catch (e) {
          Logger.log('Method 3 failed: ' + e.toString());
        }
        
        // Không tìm thấy với bất kỳ cách nào
        Logger.log('❌ Placeholder not found in document: ' + key);
        failCount++;
      } catch (replaceError) {
        Logger.log('❌ Error replacing ' + key + ': ' + replaceError.toString());
        failCount++;
      }
    }
    
    Logger.log('=== REPLACE SUMMARY ===');
    Logger.log('Success: ' + successCount);
    Logger.log('Failed: ' + failCount);
    
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
    
    // Thực hiện replace - escape regex characters
    for (var key in replacements) {
      try {
        var value = replacements[key] || '';
        Logger.log('Replacing placeholder: ' + key);
        Logger.log('With value: ' + value);
        
        // Escape regex special characters
        var escapedKey = key.replace(/[{}[\]()+\-*?.^$|\\]/g, '\\$&');
        Logger.log('Escaped key: ' + escapedKey);
        
        // Thử replace với escaped key
        var found = body.findText(escapedKey);
        if (found) {
          Logger.log('Found placeholder in document, replacing...');
          body.replaceText(escapedKey, value);
          Logger.log('✅ Successfully replaced: ' + key);
        } else {
          // Thử với key gốc
          Logger.log('⚠️ Not found with escaped key, trying original key...');
          var found2 = body.findText(key);
          if (found2) {
            body.replaceText(key, value);
            Logger.log('✅ Successfully replaced with original key: ' + key);
          } else {
            Logger.log('❌ Placeholder not found in document: ' + key);
          }
        }
      } catch (replaceError) {
        Logger.log('Error replacing ' + key + ': ' + replaceError.toString());
        try {
          body.replaceText(key, replacements[key] || '');
          Logger.log('✅ Successfully replaced without escape: ' + key);
        } catch (e) {
          Logger.log('❌ Second attempt also failed for ' + key + ': ' + e.toString());
        }
      }
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
    
    // Thực hiện replace với logging và validation
    for (var key in replacements) {
      try {
        var value = replacements[key] || '';
        Logger.log('Replacing placeholder: ' + key);
        Logger.log('With value: ' + value);
        
        // Escape regex special characters
        var escapedKey = key.replace(/[{}[\]()+\-*?.^$|\\]/g, '\\$&');
        Logger.log('Escaped key: ' + escapedKey);
        
        // Thử replace với escaped key
        var found = body.findText(escapedKey);
        if (found) {
          Logger.log('Found placeholder in document, replacing...');
          body.replaceText(escapedKey, value);
          Logger.log('✅ Successfully replaced: ' + key);
        } else {
          // Thử với key gốc
          Logger.log('⚠️ Not found with escaped key, trying original key...');
          var found2 = body.findText(key);
          if (found2) {
            body.replaceText(key, value);
            Logger.log('✅ Successfully replaced with original key: ' + key);
          } else {
            Logger.log('❌ Placeholder not found in document: ' + key);
          }
        }
      } catch (replaceError) {
        Logger.log('Error replacing ' + key + ': ' + replaceError.toString());
        try {
          body.replaceText(key, replacements[key] || '');
          Logger.log('✅ Successfully replaced without escape: ' + key);
        } catch (e) {
          Logger.log('❌ Second attempt also failed for ' + key + ': ' + e.toString());
        }
      }
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

