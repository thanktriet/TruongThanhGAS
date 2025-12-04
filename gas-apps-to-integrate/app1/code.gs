// ===============================================================
// === CẤU HÌNH TRUNG TÂM (CONFIG) ===
// ===============================================================
const CONFIG = {
  // !!! QUAN TRỌNG: DÁN ID SPREADSHEET CỦA BẠN VÀO ĐÂY !!!
  SPREADSHEET_ID: "149V83jahNswbU82oVTAWKd9mHaG0jasS2DWJTTjPaKU",

  // --- Cấu hình cho Sheet ---
  SHEET_NAME_DATA: "DATA",      
  SHEET_NAME_HOP_DONG: "HOP_DONG", 

  // --- Cấu hình cho Drive & Docs ---
  TEMPLATE_ID_HDMB: '1LtX6VQDHMg3-AThj9HKr5MIN5phL5x526O2mUOzKwRE', 
  TEMPLATE_ID_DNGN: "1P0WUCjH60w93pD-O_nJy8twZfJMLWWvWx0mLltZhv_c",
  FOLDER_ID_DON_HANG: "11qw9XZZuFMMaXeCHUIT6hCF6heg2z_hp",         
  FOLDER_ID_HOP_DONG: '1zQRxBRnH5PNJ0mrU7loBpCDCziOJXwv6',           
  ADMIN_PASS: "123456" 
};

// ===============================================================
// === HÀM TRỢ GIÚP TỐI ƯU (HELPER FUNCTION) ===
// ===============================================================
/**
 * Hàm trợ giúp để mở và lấy một sheet cụ thể theo tên.
 * @param {string} sheetName Tên của sheet cần lấy.
 * @returns {Sheet} Đối tượng Sheet.
 */
function getSheetByName(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    if (!ss) {
      throw new Error("Không thể mở Spreadsheet. Kiểm tra lại SPREADSHEET_ID.");
    }
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error("Không tìm thấy Sheet có tên: '" + sheetName + "'.");
    }
    return sheet;
  } catch (e) {
    console.error("Lỗi nghiêm trọng trong getSheetByName: " + e.toString());
    throw e;
  }
}


// ===============================================================
// === HÀM CHÍNH & WEB APP ===
// ===============================================================
function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Hệ thống Quản lý Hợp đồng & Đơn hàng");
}

// ===============================================================
// === CÁC CHỨC NĂNG CHÍNH ===
// ===============================================================

function getOrderDataByCode(orderCode) {
    // Phiên bản tối ưu cho sheet lớn
    if (!orderCode) return { success: false, error: "Mã đơn hàng rỗng." };
    try {
        const sheet = getSheetByName(CONFIG.SHEET_NAME_DATA);
        const lastRow = sheet.getLastRow();
        if (lastRow < 2) { 
            return { success: false, error: "Sheet không có dữ liệu." };
        }

        // Tối ưu: Chỉ đọc cột Mã đơn hàng (cột M = 13) để tìm kiếm
        const codeColumnValues = sheet.getRange(1, 13, lastRow, 1).getValues();
        
        let foundRowIndex = -1;
        const searchTerm = orderCode.trim().toLowerCase();

        for (let i = 1; i < codeColumnValues.length; i++) { // Bắt đầu từ 1 để bỏ qua header
            if (codeColumnValues[i][0] && codeColumnValues[i][0].toString().trim().toLowerCase() === searchTerm) {
                foundRowIndex = i + 1; // Lưu lại số dòng thực tế trên Sheet (1-based)
                break;
            }
        }

        if (foundRowIndex !== -1) {
            const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
            const rowData = sheet.getRange(foundRowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

            const result = {};
            headers.forEach((header, index) => {
                const value = rowData[index];
                if (value instanceof Date) {
                    result[header] = value.toISOString();
                } else {
                    result[header] = value;
                }
            });
            return { success: true, data: result };
        }
        
        return { success: false, error: "Không tìm thấy mã đơn hàng khớp." };

    } catch (e) {
        return { success: false, error: "Lỗi hệ thống: " + e.toString() };
    }
}

function submitFormWithFiles(data, files) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    let sheet = getSheetByName(CONFIG.SHEET_NAME_DATA);
    if (sheet.getLastRow() === 0) {
      const headers = ["Ngày nhập", "Tên TVBH", "Tên Khách hàng", "SĐT", "CCCD", "Ngày cấp", "Nơi cấp", "Email khách", "Loại xe", "Phiên bản", "Màu xe", "Hình thức TT", "Mã đơn hàng", "File đính kèm", "Địa chỉ"];
      sheet.appendRow(headers);
    }

    let fileLinks = [];
    if (files && files.length > 0) {
      const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID_DON_HANG);
      files.forEach(file => {
        let blob = Utilities.newBlob(Utilities.base64Decode(file.data), file.mimeType, file.name);
        let savedFile = folder.createFile(blob);
        savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); 
        fileLinks.push(`${file.name}|${savedFile.getUrl()}`);
      });
    }

    sheet.appendRow([ new Date(), data.tvbh, data.khach, "'" + data.sdt, "'" + data.cccd, data.ngaycap, data.noicap, data.email, data.loaixe, data.phienban, data.mauxe, data.hinhthucthanhtoan, "", fileLinks.join(" , "), data.diachi ]);
    return "Lưu thông tin thành công!";
  } catch (e) {
    console.error("Lỗi tại submitFormWithFiles: " + e.toString());
    throw new Error("Có lỗi xảy ra phía máy chủ: " + e.message);
  } finally {
    lock.releaseLock();
  }
}

function getOrders() {
  const sheet = getSheetByName(CONFIG.SHEET_NAME_DATA);
  if (sheet.getLastRow() < 2) return [];
  
  let data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getValues();
  
  // --- THAY ĐỔI Ở ĐÂY ---
  // Sắp xếp lại mảng dữ liệu: ưu tiên các dòng chưa có mã đơn hàng (cột 13, chỉ số 12) lên đầu
  data.sort((a, b) => {
    const aHasCode = a[12] ? 1 : 0; // Nếu dòng a có mã, giá trị là 1, không thì là 0
    const bHasCode = b[12] ? 1 : 0; // Tương tự cho dòng b
    return aHasCode - bHasCode; // Sắp xếp tăng dần, 0 sẽ đứng trước 1
  });

  return data.map((row, index) => ({
      // Dùng index gốc từ sheet để không bị ảnh hưởng bởi sắp xếp
      index: index + 2, 
      tvbh: row[1],
      khach: row[2],
      madon: row[12],
      trangthai: (row[12] && row[12].toString().trim() !== "") ? "✅ Đã tạo" : "⏳ Chờ tạo"
  }));
}

function adminLogin(pass) { return pass === CONFIG.ADMIN_PASS; }

function getAllOrdersForAdmin(pass) {
  if (pass !== CONFIG.ADMIN_PASS) return [];
  
  // Sử dụng hàm trợ giúp getSheetByName đã tối ưu
  const sheet = getSheetByName(CONFIG.SHEET_NAME_DATA);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  // Lấy toàn bộ dữ liệu và tiêu đề
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  // Tìm vị trí cột Mã đơn hàng để sắp xếp
  const madonColIndex = headers.indexOf("Mã đơn hàng");

  // BƯỚC 1: Chuyển đổi dữ liệu thô thành danh sách Object và GẮN SỐ DÒNG THỰC TẾ NGAY LẬP TỨC
  let processedData = data.map((row, i) => {
    let rowData = { 
      index: i + 2 // !!! QUAN TRỌNG: Lưu lại số dòng thực tế trong Sheet (dòng 1 là header nên bắt đầu từ 2)
    }; 
    
    // Ánh xạ dữ liệu theo tên cột
    headers.forEach((header, colIndex) => {
        rowData[header] = (row[colIndex] instanceof Date) ? row[colIndex].toLocaleDateString('vi-VN') : row[colIndex];
    });
    
    // Lưu thêm giá trị mã đơn hàng để dùng cho việc sắp xếp bên dưới
    rowData._sortKey = (madonColIndex !== -1) ? row[madonColIndex] : ""; 
    
    return rowData;
  });

  // BƯỚC 2: Sắp xếp danh sách dựa trên Object đã tạo (không ảnh hưởng đến số dòng 'index' đã lưu)
  processedData.sort((a, b) => {
    const aHasCode = a._sortKey ? 1 : 0;
    const bHasCode = b._sortKey ? 1 : 0;
    return aHasCode - bHasCode; // Đưa đơn chưa có mã lên đầu
  });

  return processedData;
}

function updateOrder(pass, rowIndex, updateData) {
  if (pass !== CONFIG.ADMIN_PASS) throw new Error("Xác thực admin thất bại!");
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheetByName(CONFIG.SHEET_NAME_DATA);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const tvbhCol = headers.indexOf("Tên TVBH") + 1;
    const khachCol = headers.indexOf("Tên Khách hàng") + 1;
    const sdtCol = headers.indexOf("SĐT") + 1;
    const madonCol = headers.indexOf("Mã đơn hàng") + 1;

    if (tvbhCol > 0) sheet.getRange(rowIndex, tvbhCol).setValue(updateData.tvbh);
    if (khachCol > 0) sheet.getRange(rowIndex, khachCol).setValue(updateData.khach);
    if (sdtCol > 0) sheet.getRange(rowIndex, sdtCol).setValue(updateData.sdt);
    if (madonCol > 0) sheet.getRange(rowIndex, madonCol).setValue(updateData.madon);
    
    SpreadsheetApp.flush();
    return "Cập nhật thành công cho dòng " + rowIndex + "!";
  } catch (e) {
    console.error("Lỗi tại updateOrder: " + e.toString());
    throw new Error("Không thể cập nhật dòng " + rowIndex + ": " + e.message);
  } finally {
    lock.releaseLock();
  }
}

// ===============================================================
// === HÀM TẠO HỢP ĐỒNG (CÓ GỠ LỖI) ===
// ===============================================================

function createContract(formData) {
    try {
        Logger.log("--- BẮT ĐẦU HÀM createContract ---");

        Logger.log("Bước 1: Mở template và tạo bản sao...");
        const templateDoc = DocumentApp.openById(CONFIG.TEMPLATE_ID_HDMB);
        const contractName = "HĐMB_" + formData.khach_hang.replace(/\s+/g, "_") + "_" + formData.so_hop_dong;
        const newFile = DriveApp.getFileById(templateDoc.getId()).makeCopy(contractName);
        const newDocId = newFile.getId();
        Logger.log("=> Bước 1: Hoàn tất. ID file mới: " + newDocId);

        Logger.log("Bước 2: Mở file mới và bắt đầu thay thế text...");
        const doc = DocumentApp.openById(newDocId);
        const body = doc.getBody();
        
        var soLuong = parseInt(formData.so_luong) || 0;
        var donGia = parseInt(formData.don_gia) || 0;
        var tongTien = soLuong * donGia;

        body.replaceText('{{so_hop_dong}}', formData.so_hop_dong);
        body.replaceText('{{ngay_ky}}', formatDate(formData.ngay_ky));
        body.replaceText('{{khach_hang}}', formData.khach_hang);
        body.replaceText('{{dia_chi}}', formData.dia_chi);
        body.replaceText('{{sdt}}', formData.sdt);
        body.replaceText('{{email}}', formData.email);
        body.replaceText('{{so_cccd}}', formData.so_cccd);
        body.replaceText('{{ngay_cap}}', formatDate(formData.ngay_cap));
        body.replaceText('{{noi_cap}}', formData.noi_cap);
        replaceIfNotEmpty(body, '{{ma_so_thue}}', formData.ma_so_thue);
        replaceIfNotEmpty(body, '{{nguoi_dai_dien}}', formData.nguoi_dai_dien);
        replaceIfNotEmpty(body, '{{chuc_vu}}', formData.chuc_vu); 
        body.replaceText('{{loai_xe}}', formData.loai_xe);
        body.replaceText('{{phien_ban}}', formData.phien_ban);
        body.replaceText('{{mau_xe}}', formData.mau_xe);
        body.replaceText('{{chinh_sach_ban_hang}}', formData.chinh_sach_ban_hang);
        body.replaceText('{{so_luong}}', formData.so_luong);
        body.replaceText('{{don_gia}}', parseInt(formData.don_gia).toLocaleString("vi-VN"));
        body.replaceText('{{tong_tien}}', tongTien.toLocaleString("vi-VN"));
        body.replaceText('{{tong_tien_bang_chu}}', numberToWords(tongTien));
        body.replaceText('{{tien_coc}}', parseInt(formData.tien_coc).toLocaleString("vi-VN"));
        body.replaceText('{{tien_coc_bang_chu}}', numberToWords(formData.tien_coc));
        body.replaceText('{{tien_dot_2_TT}}', parseInt(formData.tien_dot_2_TT).toLocaleString("vi-VN"));
        body.replaceText('{{tien_dot_2_TT_bang_chu}}', numberToWords(formData.tien_dot_2_TT));
        body.replaceText('{{tien_dot_2_TG}}', parseInt(formData.tien_dot_2_TG).toLocaleString("vi-VN"));
        body.replaceText('{{tien_dot_2_TG_bang_chu}}', numberToWords(formData.tien_dot_2_TG));
        body.replaceText('{{tien_dot_3}}', parseInt(formData.tien_dot_3).toLocaleString("vi-VN"));
        body.replaceText('{{tien_dot_3_bangchu}}', numberToWords(formData.tien_dot_3));

        Logger.log("=> Bước 2: Hoàn tất thay thế text.");

        Logger.log("Bước 3: Lưu và đóng tài liệu...");
        doc.saveAndClose();
        Logger.log("=> Bước 3: Hoàn tất.");

        Logger.log("Bước 4: Di chuyển file vào thư mục...");
        const file = DriveApp.getFileById(newDocId);
        DriveApp.getFolderById(CONFIG.FOLDER_ID_HOP_DONG).addFile(file);
        DriveApp.getRootFolder().removeFile(file);
        Logger.log("=> Bước 4: Hoàn tất.");
        
        Logger.log("Bước 5: Bắt đầu lưu dữ liệu vào Sheet...");
        saveFinalContractData(formData, file.getUrl());

        Logger.log("--- HOÀN THÀNH createContract, chuẩn bị trả về URL. ---");
        return { success: true, fileUrl: file.getUrl() };

    } catch (e) {
        Logger.log("!!! LỖI NGHIÊM TRỌNG TRONG createContract: " + e.toString());
        return { success: false, message: e.toString() };
    }
}

function saveFinalContractData(formData, fileUrl) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    Logger.log("  [saveFinalContractData] Bước 5a: Bắt đầu lấy sheet " + CONFIG.SHEET_NAME_HOP_DONG);
    const sheet = getSheetByName(CONFIG.SHEET_NAME_HOP_DONG);
    Logger.log("  [saveFinalContractData] Bước 5b: Lấy sheet thành công, chuẩn bị ghi dữ liệu.");
    
    const headers = [ "Timestamp", "Số hợp đồng", "Ngày ký", "Tên khách hàng", "SĐT", "CCCD", "Địa chỉ", "Email", "Loại xe", "Phiên bản", "Màu xe", "Thành tiền", "Tiền cọc", "Chính sách bán hàng", "URL Hợp đồng" ];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }
    const newRow = [ new Date(), formData.so_hop_dong, formData.ngay_ky, formData.khach_hang, formData.sdt, formData.so_cccd, formData.dia_chi, formData.email, formData.loai_xe, formData.phien_ban, formData.mau_xe, formData.thanh_tien, formData.tien_coc, formData.chinh_sach_ban_hang, fileUrl ];

    sheet.appendRow(newRow);
    Logger.log("  [saveFinalContractData] Bước 5c: Ghi dữ liệu thành công.");
  } catch(e) {
    Logger.log("  !!! LỖI trong saveFinalContractData: " + e.toString());
  } finally {
    lock.releaseLock();
    Logger.log("  [saveFinalContractData] => Bước 5: Hoàn tất.");
  }
}

// ===============================================================
// === CÁC HÀM TIỆN ÍCH (HELPER FUNCTIONS) ===
// ===============================================================
function formatDate(isoDate) {
  if (!isoDate) return "";
  var date = new Date(isoDate);
  return "Ngày " + date.getDate() + " tháng " + (date.getMonth() + 1) + " năm " + date.getFullYear();
}

function numberToWords(num) {
  // --- PHIÊN BẢN AN TOÀN HƠN ---
  // Thêm các dòng kiểm tra đầu vào để tránh lỗi
  if (num === null || num === undefined || num === '' || isNaN(num)) {
    return ""; // Trả về chuỗi rỗng nếu đầu vào không hợp lệ
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

function replaceIfNotEmpty(body, placeholder, value) {
  if (value && value.toString().trim() !== "") { body.replaceText(placeholder, value); } 
  else { body.replaceText(placeholder, ""); }
}
//ĐỀ NGHỊ GIẢI NGÂN
function createDisbursementRequest(requestData) {
  try {
    const templateDoc = DocumentApp.openById(CONFIG.TEMPLATE_ID_DNGN);
    const docName = `DNGN_${requestData.ten_khach_hang.replace(/\s+/g, "_")}_${requestData.so_hop_dong}`;
    const newFile = DriveApp.getFileById(templateDoc.getId()).makeCopy(docName);
    const doc = DocumentApp.openById(newFile.getId());
    const body = doc.getBody();

    // TÍNH TOÁN RIÊNG BIỆT CHO 2 LOẠI TIỀN
    const soTienDoiUng = parseInt(requestData.so_tien_doi_ung) || 0;
    const soTienDoiUngBangChu = numberToWords(soTienDoiUng);
    
    const soTienGiaiNgan = parseInt(requestData.so_tien_giai_ngan) || 0;
    const soTienGiaiNganBangChu = numberToWords(soTienGiaiNgan);
    
    // THAY THẾ CÁC PLACEHOLDER CHUNG
    body.replaceText('{{ngay_ky}}', formatDate(new Date().toISOString()));
    body.replaceText('{{kinh_gui_ngan_hang}}', "Kính gửi: " + requestData.ten_ngan_hang_vay);
    body.replaceText('{{ngay_captbcv}}', formatDate(requestData.ngay_captbcv));
    body.replaceText('{{ten_khach_hang}}', requestData.ten_khach_hang);
    body.replaceText('{{so_hop_dong}}', requestData.so_hop_dong);
    body.replaceText('{{so_tai_khoan}}', requestData.so_tai_khoan);
    body.replaceText('{{loai_xe}}', requestData.loai_xe);
    
    // THAY THẾ CÁC PLACEHOLDER TIỀN RIÊNG BIỆT
    body.replaceText('{{so_tien_doi_ung}}', soTienDoiUng.toLocaleString("vi-VN") + "VNĐ");
    body.replaceText('{{so_tien_doi_ung_bang_chu}}', soTienDoiUngBangChu);
    
    body.replaceText('{{so_tien_giai_ngan}}', soTienGiaiNgan.toLocaleString("vi-VN") + "VNĐ");
    body.replaceText('{{so_tien_giai_ngan_bang_chu}}', soTienGiaiNganBangChu);
    
    doc.saveAndClose();
    const file = DriveApp.getFileById(newFile.getId());
    DriveApp.getFolderById(CONFIG.FOLDER_ID_HOP_DONG).addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return { success: true, fileUrl: file.getUrl() };
  } catch (e) {
    console.error("Lỗi tại createDisbursementRequest: " + e.toString());
    return { success: false, message: e.toString() };
  }
}
//Danh sach don hang
/**
 * Lấy danh sách các tên TVBH duy nhất từ sheet DATA để làm bộ lọc.
 * @returns {Array<string>} Mảng chứa các tên TVBH duy nhất.
 */
function getUniqueSalespersons() {
  try {
    const sheet = getSheetByName(CONFIG.SHEET_NAME_DATA);
    if (sheet.getLastRow() < 2) return [];

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const tvbhColIndex = headers.indexOf("Tên TVBH");
    if (tvbhColIndex === -1) return []; // Không tìm thấy cột TVBH

    const tvbhData = sheet.getRange(2, tvbhColIndex + 1, sheet.getLastRow() - 1, 1).getValues();
    
    // Dùng Set để tự động loại bỏ các tên trùng lặp
    const uniqueNames = new Set(tvbhData.flat().filter(name => name)); // .filter(name => name) để loại bỏ các ô trống
    
    return Array.from(uniqueNames).sort(); // Sắp xếp theo alphabet
  } catch(e) {
    console.error("Lỗi tại getUniqueSalespersons: " + e.toString());
    return [];
  }
}

/**
 * Hàm xóa đơn hàng dựa trên số dòng
 */
function deleteOrder(pass, rowIndex) {
  if (pass !== CONFIG.ADMIN_PASS) {
    throw new Error("Xác thực admin thất bại!");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sheet = getSheetByName(CONFIG.SHEET_NAME_DATA);
    // Kiểm tra xem dòng có hợp lệ không (để tránh xóa nhầm header)
    if (rowIndex < 2 || rowIndex > sheet.getLastRow()) {
        throw new Error("Dòng cần xóa không tồn tại hoặc không hợp lệ.");
    }
    
    // Thực hiện xóa dòng
    sheet.deleteRow(rowIndex);
    
    return "Đã xóa đơn hàng thành công!";
  } catch (e) {
    console.error("Lỗi tại deleteOrder: " + e.toString());
    throw new Error("Không thể xóa: " + e.message);
  } finally {
    lock.releaseLock();
  }
}


