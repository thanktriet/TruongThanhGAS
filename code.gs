/**
 * ------------------------------------------------------------------
 * BACKEND API - HỆ THỐNG PHÊ DUYỆT GIÁ (FINAL)
 * ------------------------------------------------------------------
 */

// ======================================================
// 1. CẤU HÌNH (CONSTANTS)
// ======================================================

const EXTERNAL_DB_ID = '149V83jahNswbU82oVTAWKd9mHaG0jasS2DWJTTjPaKU'; 
const EXTERNAL_SHEET_NAME = 'DATA'; // Tên Sheet chứa dữ liệu Master

const SHEET_USERS = 'Users';
const SHEET_APPROVALS = 'Approvals';
const SHEET_LOGS = 'Logs';

const WORKFLOW = [
  { step: 0, role: 'TPKD',   label: 'Chờ TPKD duyệt',       next: 1 },
  { step: 1, role: 'GDKD',   label: 'Chờ GĐKD duyệt',       next: 2 },
  { step: 2, role: 'BKS',    label: 'Chờ Ban Kiểm Soát',    next: 3 },
  { step: 3, role: 'BGD',    label: 'Chờ Ban Giám Đốc',     next: 4 },
  { step: 4, role: 'KETOAN', label: 'Chờ Kế Toán kiểm tra', next: 6 } // next: 6 = Hoàn tất, có thể in
];

const USER_HEADERS = ['Username', 'Password', 'Fullname', 'Role', 'NeedChangePass', 'Phone', 'Email', 'Group', 'Active'];
const APPROVAL_HEADERS = ['ID', 'Date', 'Requester', 'ContractCode', 'CustomerName', 'Phone', 'CCCD', 'Email', 'Address', 'CarModel', 'CarVersion', 'CarColor', 'VinNo', 'PaymentMethod', 'ContractPrice', 'DiscountDetails', 'DiscountAmount', 'GiftDetails', 'GiftAmount', 'FinalPrice', 'CurrentStep', 'StatusText', 'HistoryLog', 'OtherRequirements', 'MaxCostRate', 'ProductivityBonus', 'ApproverStep0', 'ApproverStep1', 'ApproverStep2', 'ApproverStep3', 'ApproverStep4'];

// ======================================================
// 2. ROUTER & CORE
// ======================================================

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = {};
    
    // Xử lý cả JSON và FormData
    if (e.postData && e.postData.contents) {
      var contentType = e.postData.type || '';
      if (contentType.indexOf('application/json') !== -1) {
        // JSON request
      data = JSON.parse(e.postData.contents);
      } else {
        // FormData request - parse từ e.parameter
        data = e.parameter;
      }
    } else {
      // Fallback: lấy từ parameter (FormData hoặc URL params)
      data = e.parameter;
    }
    
    // Parse các field JSON nếu có (như gift_json)
    // Lưu ý: gift_json có thể đã là string JSON, cần parse để xử lý
    if (data.gift_json) {
      try {
        if (typeof data.gift_json === 'string') {
          data.gift_json = JSON.parse(data.gift_json);
        }
        // Nếu đã là object thì giữ nguyên
      } catch(e) {
        Logger.log('Error parsing gift_json in doPost: ' + e.toString());
        // Nếu parse lỗi, thử set về array rỗng
        data.gift_json = [];
      }
    } else {
      data.gift_json = [];
    }

    var action = data.action;
    var result = { success: false, message: 'Invalid Action' };

    if (action == 'login') result = handleLogin(data.username, data.password);
    else if (action == 'change_password') result = handleChangePassword(data.username, data.old_pass, data.new_pass);
    else if (action == 'lookup_contract') result = lookupContract(data.search_code);
    else if (action == 'submit_request') result = createRequest(data);
    else if (action == 'get_pending_list') result = getPendingList(data.username, data.role);
    else if (action == 'get_my_requests') result = getMyRequests(data.username, data.role);
    else if (action == 'get_request_detail') result = getRequestDetail(data.id, data.username);
    else if (action == 'update_request') result = updateRequest(data);
    else if (action == 'approve_reject') result = processApproval(data);
    else if (action == 'resubmit') result = resubmitRequest(data);
    else if (action == 'get_profile') result = getUserProfile(data);
    else if (action == 'update_profile') result = updateUserProfile(data);
    else if (action == 'list_users') result = listUsers(data);
    else if (action == 'create_user') result = createUser(data);
    else if (action == 'update_user') result = updateUser(data);
    else if (action == 'reset_user_password') result = resetUserPassword(data);
    else if (action == 'get_users_by_role') result = getUsersByRole(data.role);
    else if (action == 'update_productivity_bonus') result = updateProductivityBonus(data);

    return responseJSON(result);
  } catch (err) {
    return responseJSON({ success: false, message: 'Server Error: ' + err.toString() });
  }
}

function doGet(e) {
  return responseJSON({ status: 'active', message: 'Backend Ready!' });
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    });
}

// ======================================================
// 3. DATABASE SETUP
// ======================================================

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var defaultPassHash = hashPassword('12345'); 

  // Users
  var sheetUser = ss.getSheetByName(SHEET_USERS);
  if (!sheetUser) {
    sheetUser = ss.insertSheet(SHEET_USERS);
    sheetUser.appendRow(USER_HEADERS);
    var users = [
      ['admin',   defaultPassHash, 'Quản Trị Viên',   'ADMIN',  false, '', '', 'HQ', true],
      ['sale1',   defaultPassHash, 'Nguyễn Văn Sale', 'TVBH',   true,  '', '', 'NHÓM 1', true],
      ['tpkd1',   defaultPassHash, 'Trưởng Phòng KD', 'TPKD',   true,  '', '', 'TPKD', true],
      ['gdkd1',   defaultPassHash, 'Giám Đốc KD',     'GDKD',   true,  '', '', 'GDKD', true],
      ['bks1',    defaultPassHash, 'Ban Kiểm Soát',   'BKS',    true,  '', '', 'BKS', true],
      ['bgd1',    defaultPassHash, 'Tổng Giám Đốc',   'BGD',    true,  '', '', 'BGD', true],
      ['ketoan1', defaultPassHash, 'Kế Toán Viên',    'KETOAN', true,  '', '', 'KETOAN', true]
    ];
    users.forEach(u => sheetUser.appendRow(u));
  } else {
    migrateUserSheet();
  }

  // Approvals
  if (!ss.getSheetByName(SHEET_APPROVALS)) {
    var s = ss.insertSheet(SHEET_APPROVALS);
    // Cấu trúc: ID, Date, Requester, ContractCode, CustomerName, Phone, CCCD, Email, Address, 
    //           CarModel, CarVersion, CarColor, VinNo, PaymentMethod, 
    //           ContractPrice, DiscountDetails, DiscountAmount, GiftDetails, GiftAmount, FinalPrice, 
    //           CurrentStep, StatusText, HistoryLog, OtherRequirements, MaxCostRate, ProductivityBonus,
    //           ApproverStep0, ApproverStep1, ApproverStep2, ApproverStep3, ApproverStep4
    s.appendRow(['ID', 'Date', 'Requester', 'ContractCode', 'CustomerName', 'Phone', 'CCCD', 'Email', 'Address', 
                 'CarModel', 'CarVersion', 'CarColor', 'VinNo', 'PaymentMethod',
                 'ContractPrice', 'DiscountDetails', 'DiscountAmount', 'GiftDetails', 'GiftAmount', 'FinalPrice', 
                 'CurrentStep', 'StatusText', 'HistoryLog', 'OtherRequirements', 'MaxCostRate', 'ProductivityBonus',
                 'ApproverStep0', 'ApproverStep1', 'ApproverStep2', 'ApproverStep3', 'ApproverStep4']);
  } else {
    // Kiểm tra và migrate cấu trúc cũ nếu cần
    migrateApprovalsSheet();
  }

  // Logs
  if (!ss.getSheetByName(SHEET_LOGS)) {
    ss.insertSheet(SHEET_LOGS).appendRow(['Timestamp', 'User', 'Action', 'Details']);
  }
  Logger.log("Database initialized!");
}

/**
 * Migrate Approvals sheet từ cấu trúc cũ (19 cột) sang cấu trúc mới (23 cột)
 * HÀM NÀY SẼ TỰ ĐỘNG CHẠY KHI setupDatabase() được gọi
 * Hoặc bạn có thể chạy thủ công từ Google Apps Script Editor
 */
function migrateApprovalsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_APPROVALS);
  if (!sheet) {
    Logger.log("Sheet Approvals không tồn tại");
    return;
  }
  
  var numCols = sheet.getLastColumn();
  
  // Nếu đã có đủ 31 cột thì không cần migrate
  if (numCols >= 31) {
    Logger.log("✓ Sheet đã có cấu trúc mới (" + numCols + " cột), không cần migrate");
    return { success: true, message: "Sheet đã có cấu trúc mới" };
  }
  
  Logger.log("Bắt đầu migrate từ " + numCols + " cột sang 31 cột...");
  
  try {
    // Lưu toàn bộ dữ liệu hiện tại
    var allData = sheet.getDataRange().getValues();
    var lastRow = sheet.getLastRow();
    
    // Xóa header cũ và tạo header mới
    sheet.deleteRow(1);
    
    // Tạo header mới với đầy đủ 31 cột
    var newHeader = ['ID', 'Date', 'Requester', 'ContractCode', 'CustomerName', 'Phone', 'CCCD', 'Email', 'Address', 
                     'CarModel', 'CarVersion', 'CarColor', 'VinNo', 'PaymentMethod',
                     'ContractPrice', 'DiscountDetails', 'DiscountAmount', 'GiftDetails', 'GiftAmount', 'FinalPrice', 
                     'CurrentStep', 'StatusText', 'HistoryLog', 'OtherRequirements', 'MaxCostRate', 'ProductivityBonus',
                     'ApproverStep0', 'ApproverStep1', 'ApproverStep2', 'ApproverStep3', 'ApproverStep4'];
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, newHeader.length).setValues([newHeader]);
    
    // Migrate dữ liệu từ cấu trúc cũ sang mới
    if (lastRow > 1) {
      var newData = [];
      for (var i = 1; i < allData.length; i++) {
        var oldRow = allData[i];
        var newRow = [];
        
        // Cột 0-6: Giữ nguyên (ID, Date, Requester, ContractCode, CustomerName, Phone, CCCD)
        for (var j = 0; j <= 6; j++) {
          newRow.push(oldRow[j] || '');
        }
        
        // Cột 7: Email (mới, để trống)
        newRow.push('');
        
        // Cột 8: Address (từ cột 7 cũ)
        newRow.push(oldRow[7] || '');
        
        // Cột 9: CarModel (từ cột 8 cũ)
        newRow.push(oldRow[8] || '');
        
        // Cột 10: CarVersion (mới, để trống)
        newRow.push('');
        
        // Cột 11: CarColor (mới, để trống)
        newRow.push('');
        
        // Cột 12: VinNo (từ cột 9 cũ)
        newRow.push(oldRow[9] || '');
        
        // Cột 13: PaymentMethod (mới, để trống)
        newRow.push('');
        
        // Cột 14: ContractPrice (từ cột 10 cũ)
        newRow.push(oldRow[10] || 0);
        
        // Cột 15: DiscountDetails (từ cột 11 cũ)
        newRow.push(oldRow[11] || '');
        
        // Cột 16: DiscountAmount (từ cột 12 cũ)
        newRow.push(oldRow[12] || 0);
        
        // Cột 17: GiftDetails (từ cột 13 cũ)
        newRow.push(oldRow[13] || '');
        
        // Cột 18: GiftAmount (từ cột 14 cũ)
        newRow.push(oldRow[14] || 0);
        
        // Cột 19: FinalPrice (từ cột 15 cũ)
        newRow.push(oldRow[15] || 0);
        
        // Cột 20: CurrentStep (từ cột 16 cũ)
        newRow.push(oldRow[16] || 0);
        
        // Cột 21: StatusText (từ cột 17 cũ)
        newRow.push(oldRow[17] || '');
        
        // Cột 22: HistoryLog (từ cột 18 cũ hoặc 22 nếu đã có 23 cột)
        if (numCols >= 23) {
          newRow.push(oldRow[22] || '');
        } else {
          newRow.push(oldRow[18] || '');
        }
        
        // Cột 23: OtherRequirements (mới)
        newRow.push(numCols >= 24 ? (oldRow[23] || '') : '');
        
        // Cột 24: MaxCostRate (mới)
        newRow.push(numCols >= 25 ? (oldRow[24] || '') : '');
        
        // Cột 25: ProductivityBonus (mới)
        newRow.push(numCols >= 26 ? (oldRow[25] || '') : '');
        
        // Cột 26-30: ApproverStep0-4 (mới)
        newRow.push(numCols >= 27 ? (oldRow[26] || '') : '');
        newRow.push(numCols >= 28 ? (oldRow[27] || '') : '');
        newRow.push(numCols >= 29 ? (oldRow[28] || '') : '');
        newRow.push(numCols >= 30 ? (oldRow[29] || '') : '');
        newRow.push(numCols >= 31 ? (oldRow[30] || '') : '');
        
        newData.push(newRow);
      }
      
      // Ghi dữ liệu mới vào sheet (bắt đầu từ dòng 2)
      if (newData.length > 0) {
        sheet.getRange(2, 1, newData.length, newHeader.length).setValues(newData);
      }
    }
    
    Logger.log("✓ Migration hoàn tất! Sheet đã có " + sheet.getLastColumn() + " cột");
    return { success: true, message: "Migration thành công! Sheet đã có " + sheet.getLastColumn() + " cột" };
    
  } catch (e) {
    Logger.log("✗ Lỗi khi migrate: " + e.toString());
    return { success: false, message: "Lỗi: " + e.toString() };
  }
}

/**
 * Đảm bảo sheet Users có đầy đủ cột mới (Phone, Email, Group, Active)
 */
function migrateUserSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_USERS);
  if (!sheet) {
    Logger.log("Sheet Users không tồn tại");
    return;
  }
  
  var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headerMap = {};
  for (var i = 0; i < currentHeaders.length; i++) {
    headerMap[currentHeaders[i]] = i;
  }
  
  var needsMigration = currentHeaders.length < USER_HEADERS.length;
  if (!needsMigration) {
    // Kiểm tra xem đã có đầy đủ header mới chưa
    for (var j = 0; j < USER_HEADERS.length; j++) {
      if (currentHeaders[j] !== USER_HEADERS[j]) {
        needsMigration = true;
        break;
      }
    }
  }
  
  if (!needsMigration) {
    Logger.log("✓ Users sheet đã có cấu trúc mới");
    return;
  }
  
  Logger.log("Bắt đầu migrate Users sheet...");
  
  var allData = sheet.getDataRange().getValues();
  var newData = [];
  
  // Tạo map vị trí theo header hiện có
  var indexMap = {};
  for (var h = 0; h < currentHeaders.length; h++) {
    indexMap[currentHeaders[h]] = h;
  }
  
  for (var r = 1; r < allData.length; r++) {
    var row = allData[r];
    var newRow = [];
    newRow.push(row[indexMap['Username']] || '');
    newRow.push(row[indexMap['Password']] || '');
    newRow.push(row[indexMap['Fullname']] || '');
    newRow.push(row[indexMap['Role']] || '');
    newRow.push(row[indexMap['NeedChangePass']] === '' ? true : row[indexMap['NeedChangePass']]);
    newRow.push(indexMap['Phone'] != null ? (row[indexMap['Phone']] || '') : '');
    newRow.push(indexMap['Email'] != null ? (row[indexMap['Email']] || '') : '');
    newRow.push(indexMap['Group'] != null ? (row[indexMap['Group']] || '') : '');
    var activeVal = indexMap['Active'] != null ? row[indexMap['Active']] : true;
    if (activeVal === '' || activeVal === undefined) activeVal = true;
    newRow.push(activeVal);
    newData.push(newRow);
  }
  
  // Ghi lại sheet
  sheet.clear();
  sheet.getRange(1, 1, 1, USER_HEADERS.length).setValues([USER_HEADERS]);
  if (newData.length > 0) {
    sheet.getRange(2, 1, newData.length, USER_HEADERS.length).setValues(newData);
  }
  Logger.log("✓ Users sheet đã migrate thành công!");
}

function getUserSheetMeta() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var indexMap = {};
  for (var i = 0; i < headers.length; i++) {
    indexMap[headers[i]] = i;
  }
  return { sheet: sheet, headers: headers, index: indexMap };
}

function mapUserRow(row, indexMap) {
  return {
    username: row[indexMap['Username']] || '',
    fullname: row[indexMap['Fullname']] || '',
    role: row[indexMap['Role']] || '',
    need_change_pass: indexMap['NeedChangePass'] != null ? !!row[indexMap['NeedChangePass']] : false,
    phone: indexMap['Phone'] != null ? (row[indexMap['Phone']] || '') : '',
    email: indexMap['Email'] != null ? (row[indexMap['Email']] || '') : '',
    group: indexMap['Group'] != null ? (row[indexMap['Group']] || '') : '',
    active: indexMap['Active'] != null ? row[indexMap['Active']] !== false && row[indexMap['Active']] !== 'false' : true
  };
}

function findUserRow(username) {
  if (!username) return null;
  var meta = getUserSheetMeta();
  var data = meta.sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][meta.index['Username']]).toLowerCase() == String(username).toLowerCase()) {
      return { rowIndex: i + 1, row: data[i], meta: meta };
    }
  }
  return null;
}

// ======================================================
// 4. BUSINESS LOGIC
// ======================================================

/** A. ĐĂNG NHẬP */
function handleLogin(username, password) {
  var meta = getUserSheetMeta();
  var data = meta.sheet.getDataRange().getValues();
  var hash = hashPassword(password);
  var usernameLower = String(username || '').toLowerCase();
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[meta.index['Username']]).toLowerCase() == usernameLower) {
      var activeFlag = meta.index['Active'] != null ? row[meta.index['Active']] !== false && row[meta.index['Active']] !== 'false' : true;
      if (!activeFlag) {
        return { success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' };
      }
      if (row[meta.index['Password']] == hash) {
        var userObj = mapUserRow(row, meta.index);
        return { success: true, user: userObj };
      }
    }
  }
  return { success: false, message: 'Sai thông tin đăng nhập' };
}

/** B. TRA CỨU HỢP ĐỒNG */
function lookupContract(code) {
  if (!code) return { success: false, message: 'Thiếu mã đơn hàng' };
  try {
    var extSS = SpreadsheetApp.openById(EXTERNAL_DB_ID);
    var sheet = extSS.getSheetByName(EXTERNAL_SHEET_NAME);
    if (!sheet) return { success: false, message: 'Không tìm thấy sheet DATA' };

    var data = sheet.getDataRange().getValues();
    // Cột M (Index 12) là Key
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][12]).trim().toLowerCase() == String(code).trim().toLowerCase()) {
        return {
          success: true,
          data: {
            tvbh: data[i][1], name: data[i][2], phone: data[i][3], cccd: data[i][4],
            issueDate: formatDate(data[i][5]), issuePlace: data[i][6], email: data[i][7],
            carModel: data[i][8], carVersion: data[i][9], carColor: data[i][10],
            payment: data[i][11], address: data[i][14] 
          }
        };
      }
    }
    return { success: false, message: 'Không tìm thấy đơn hàng: ' + code };
  } catch (e) {
    return { success: false, message: 'Lỗi Data: ' + e.message };
  }
}

/** C. TẠO YÊU CẦU (XỬ LÝ QUÀ TẶNG ĐỘNG) */
function createRequest(d) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_APPROVALS);
  var id = 'REQ_' + new Date().getTime();
  
  var contractPrice = parseVND(d.contract_price);
  var discountAmount = parseVND(d.discount_amount);
  
  // Xử lý Quà tặng JSON
  var giftTotalMoney = 0;
  var giftDescriptionArr = [];
  try {
    // gift_json có thể là string hoặc đã được parse thành object
    var giftJsonStr = d.gift_json;
    if (typeof giftJsonStr === 'object') {
      giftJsonStr = JSON.stringify(giftJsonStr);
    }
    var gifts = JSON.parse(giftJsonStr || "[]");
    if (Array.isArray(gifts)) {
      for (var i = 0; i < gifts.length; i++) {
        var item = gifts[i];
        if (item.name) {
          var price = parseVND(item.price);
          giftTotalMoney += price;
          giftDescriptionArr.push(`- ${item.name} [${formatCurrency(price)}]`);
        }
      }
    }
  } catch (e) {
    Logger.log('Error parsing gift_json: ' + e.toString());
    Logger.log('gift_json value: ' + d.gift_json);
  }
  
  var finalGiftDetails = giftDescriptionArr.join('\n') || "Không có quà";
  var finalPrice = contractPrice - discountAmount;

  sheet.appendRow([
    id, new Date(), d.requester, d.contract_code, d.customer_name, "'" + d.phone, "'" + d.cccd, 
    d.email || '', d.address, 
    d.car_model || '', d.car_version || '', d.car_color || '', d.vin_no || '', d.payment_method || '',
    contractPrice, d.discount_details || '', discountAmount, 
    finalGiftDetails, giftTotalMoney, finalPrice, 0, 'Chờ TPKD duyệt', '',
    d.other_requirements || '', '', parseVND(d.productivity_bonus || '0'), // OtherRequirements, MaxCostRate (bỏ), ProductivityBonus
    d.approver_step0 || '', '', '', '', '' // ApproverStep0-4
  ]);
  
  return { success: true, message: 'Đã gửi yêu cầu thành công!' };
}

/** D. DANH SÁCH CHỜ DUYỆT */
function getPendingList(username, role) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_APPROVALS);
  var data = sheet.getDataRange().getValues();
  var resultList = [];
  var targetSteps = WORKFLOW.filter(w => w.role == role).map(w => w.step);
  
  for (var i = data.length - 1; i >= 1; i--) { 
    var row = data[i];
    
    // Cấu trúc mới: ID(0), Date(1), Requester(2), ContractCode(3), CustomerName(4), Phone(5), 
    //               CCCD(6), Email(7), Address(8), CarModel(9), CarVersion(10), CarColor(11), 
    //               VinNo(12), PaymentMethod(13), ContractPrice(14), DiscountDetails(15), 
    //               DiscountAmount(16), GiftDetails(17), GiftAmount(18), FinalPrice(19), 
    //               CurrentStep(20), StatusText(21), HistoryLog(22)
    
    // Kiểm tra số cột để tương thích với dữ liệu cũ
    var hasNewStructure = row.length >= 23;
    var hasFullStructure = row.length >= 26; // 26 cột với OtherRequirements, MaxCostRate, ProductivityBonus
    var currentStep = hasNewStructure ? (row[20] || 0) : (row[16] || 0);
    
    // Hiển thị đơn cho:
    // 1. Người tạo (TVBH/SALE) - đơn của họ (bao gồm cả đơn bị từ chối step=0)
    // 2. ADMIN - tất cả đơn
    // 3. Người có quyền duyệt ở bước hiện tại
    var isRequester = (role == 'TVBH' || role == 'SALE') && String(row[2]).toLowerCase() == String(username).toLowerCase();
    var isRejectedAndRequester = (currentStep == 0 && isRequester);
    
    var show = isRejectedAndRequester ||
               (role == 'ADMIN') ||
               (targetSteps.includes(currentStep)) ||
               (isRequester && currentStep >= 0); // Người tạo thấy đơn của mình ở mọi bước

    if (show) {
      
      var item = {
        id: row[0], date: formatDate(row[1]), requester: row[2], contract_code: row[3],
        customer: row[4], phone: row[5], cccd: row[6] || '', 
        email: hasNewStructure ? (row[7] || '') : '',
        address: hasNewStructure ? (row[8] || '') : (row[7] || ''),
        car_model: hasNewStructure ? (row[9] || '') : (row[8] || ''), 
        car_version: hasNewStructure ? (row[10] || '') : '',
        car_color: hasNewStructure ? (row[11] || '') : '',
        vin_no: hasNewStructure ? (row[12] || '') : (row[9] || ''),
        payment: hasNewStructure ? (row[13] || '') : '',
        contract_price: formatCurrency(hasNewStructure ? row[14] : row[10]), 
        discount_details: hasNewStructure ? (row[15] || '') : (row[11] || ''), 
        discount_amount: formatCurrency(hasNewStructure ? row[16] : row[12]),
        gift_details: hasNewStructure ? (row[17] || '') : (row[13] || ''), 
        gift_amount: formatCurrency(hasNewStructure ? row[18] : row[14]), 
        final_price: formatCurrency(hasNewStructure ? row[19] : row[15]),
        step: hasNewStructure ? (row[20] || 0) : (row[16] || 0), 
        status_text: hasNewStructure ? (row[21] || '') : (row[17] || ''), 
        logs: hasNewStructure ? (row[22] || '') : (row[18] || ''),
        other_requirements: hasFullStructure ? (row[23] || '') : '',
        max_cost_rate: hasFullStructure ? (row[24] ? formatCurrency(row[24]) : '') : '',
        productivity_bonus: hasFullStructure ? (row[25] ? formatCurrency(row[25]) : '') : ''
      };
      
      // Xác định có thể gửi lại không (step = 0 và là người tạo)
      item.can_resubmit = (currentStep == 0 && isRequester);
      
      // Xác định trạng thái duyệt tiếp theo
      // Step 4 (Kế Toán) là bước cuối, sau đó có thể in (step >= 6)
      var stepConfig = WORKFLOW.find(w => w.step == currentStep);
      if (currentStep >= 6 || (stepConfig && stepConfig.next >= 6)) {
        item.is_completed = true;
      } else if (stepConfig && stepConfig.next < 6) {
        var nextConfig = WORKFLOW.find(w => w.step == stepConfig.next);
        if (nextConfig) {
          item.next_status = nextConfig.label;
        }
      }
      
      // Parse logs thành format dễ hiển thị
      if (item.logs) {
        var logLines = item.logs.split('\n');
        var logEntries = [];
        for (var j = 0; j < logLines.length; j++) {
          var logLine = logLines[j].trim();
          if (!logLine) continue;
          
          // Parse log format: "HH:mm dd/MM/yyyy | username (role) | ACTION | Lý do: comment"
          var parts = logLine.split(' | ');
          if (parts.length >= 3) {
            var logEntry = {
              time: parts[0],
              user: parts[1].split(' (')[0],
              role: parts[1].split(' (')[1] ? parts[1].split(' (')[1].replace(')', '') : '',
              action: parts[2],
              comment: parts.length > 3 ? parts.slice(3).join(' | ').replace('Lý do: ', '') : '',
              is_approve: parts[2].indexOf('DUYỆT') !== -1,
              is_reject: parts[2].indexOf('TỪ CHỐI') !== -1
            };
            logEntries.push(logEntry);
          } else {
            // Fallback cho format cũ
            logEntries.push({
              time: '',
              user: '',
              role: '',
              action: logLine,
              comment: '',
              is_approve: false,
              is_reject: false
            });
          }
        }
        item.log_entries = logEntries;
      }
      
      // Tạo chuỗi JSON để frontend bật Modal
      item.json_string = encodeURIComponent(JSON.stringify(item));
      resultList.push(item);
    }
  }
  return { success: true, data: resultList };
}

/** E. DUYỆT / TỪ CHỐI */
function processApproval(d) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_APPROVALS);
  var data = sheet.getDataRange().getValues();
  
  // Validate comment for reject
  if (d.decision == 'reject' && (!d.comment || d.comment.trim() == '')) {
    return { success: false, message: 'Vui lòng nhập lý do từ chối' };
  }
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) == String(d.id)) {
      // Kiểm tra số cột để tương thích với dữ liệu cũ
      var hasNewStructure = data[i].length >= 23;
      var currentStep = hasNewStructure ? (data[i][20] || 0) : (data[i][16] || 0);
      var stepConfig = WORKFLOW.find(w => w.step == currentStep);

      if (d.role != 'ADMIN' && (!stepConfig || stepConfig.role != d.role)) {
        return { success: false, message: 'Không có quyền duyệt!' };
      }

      var time = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm dd/MM/yyyy");
      var actionText = d.decision == 'approve' ? 'DUYỆT' : 'TỪ CHỐI';
      var commentText = d.comment && d.comment.trim() ? ' | Lý do: ' + d.comment.trim() : '';
      var newLog = time + ' | ' + d.username + ' (' + d.role + ') | ' + actionText + commentText;
      var logCol = hasNewStructure ? 23 : 19; // HistoryLog column
      var oldLog = data[i][logCol - 1] || '';
      sheet.getRange(i + 1, logCol).setValue(oldLog ? oldLog + "\n" + newLog : newLog);

      var stepCol = hasNewStructure ? 21 : 17; // CurrentStep column
      var statusCol = hasNewStructure ? 22 : 18; // StatusText column

      if (d.decision == 'reject') {
        // Trả về cho người tạo để chỉnh sửa (step = 0)
        sheet.getRange(i + 1, stepCol).setValue(0);
        var rejectMsg = 'Đã từ chối - Trả về cho người tạo chỉnh sửa';
        if (d.comment && d.comment.trim()) {
          rejectMsg += ' | Lý do: ' + d.comment.trim();
        }
        sheet.getRange(i + 1, statusCol).setValue(rejectMsg);
      } else {
        var nextStep = stepConfig.next;
        // Nếu nextStep = 6 thì đã hoàn tất, có thể in
        if (nextStep >= 6) {
          sheet.getRange(i + 1, stepCol).setValue(6);
          sheet.getRange(i + 1, statusCol).setValue('Hoàn tất - Có thể in');
        } else {
        var nextLabel = 'Hoàn tất';
        var nextConfig = WORKFLOW.find(w => w.step == nextStep);
        if (nextConfig) nextLabel = nextConfig.label;
          sheet.getRange(i + 1, stepCol).setValue(nextStep);
          sheet.getRange(i + 1, statusCol).setValue(nextLabel);
        }
        
        // Lưu lương năng suất nếu có điều chỉnh (chỉ khi có thay đổi)
        var hasFullStructure = data[i].length >= 26;
        if (hasFullStructure && d.productivity_bonus !== undefined && d.productivity_bonus !== null && d.productivity_bonus !== '') {
          var oldProductivityBonus = data[i][25] || '';
          var newProductivityBonus = parseVND(d.productivity_bonus);
          // Chỉ cập nhật nếu có thay đổi
          if (newProductivityBonus != oldProductivityBonus) {
            sheet.getRange(i + 1, 26).setValue(newProductivityBonus);
            // Ghi log điều chỉnh
            var time = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm dd/MM/yyyy");
            var oldFormatted = oldProductivityBonus ? formatCurrency(oldProductivityBonus) + ' VNĐ' : 'Chưa nhập';
            var newFormatted = d.productivity_bonus_formatted || (formatCurrency(newProductivityBonus) + ' VNĐ');
            var logEntry = time + ' | ' + d.username + ' (' + d.role + ') | ĐIỀU CHỈNH LƯƠNG NĂNG SUẤT | ' + oldFormatted + ' → ' + newFormatted;
            var logCol = hasNewStructure ? 23 : 19;
            var oldLog = data[i][logCol - 1] || '';
            sheet.getRange(i + 1, logCol).setValue(oldLog ? oldLog + "\n" + logEntry : logEntry);
          }
        }
        
        // Lưu người được chọn cho bước tiếp theo
        var hasApproverCols = data[i].length >= 31;
        if (hasApproverCols && d.next_approver) {
          var approverCol = 27 + nextStep; // ApproverStep0 = cột 27, ApproverStep1 = cột 28, ...
          if (approverCol <= 31) {
            sheet.getRange(i + 1, approverCol).setValue(d.next_approver);
          }
        }
      }
      return { success: true, message: 'Thao tác thành công' };
    }
  }
  return { success: false, message: 'Không tìm thấy đơn hàng' };
}

function handleChangePassword(username, oldPass, newPass) {
  if (!username) return { success: false, message: 'Thiếu username' };
  if (!newPass || newPass.trim().length < 6) {
    return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' };
  }
  
  var found = findUserRow(username);
  if (!found) return { success: false, message: 'Không tìm thấy người dùng' };
  
  var sheet = found.meta.sheet;
  var rowIndex = found.rowIndex;
  var indexMap = found.meta.index;
  
  // Nếu có oldPass, kiểm tra mật khẩu cũ
  if (oldPass) {
    var oldHash = hashPassword(oldPass);
    var currentHash = found.row[indexMap['Password']];
    if (oldHash != currentHash) {
      return { success: false, message: 'Mật khẩu cũ không đúng' };
    }
  }
  
  // Cập nhật mật khẩu mới
  var newHash = hashPassword(newPass);
  sheet.getRange(rowIndex, indexMap['Password'] + 1).setValue(newHash);
  
  // Set NeedChangePass = false
  sheet.getRange(rowIndex, indexMap['NeedChangePass'] + 1).setValue(false);
  
  // Cập nhật user object để trả về
  var updatedUser = mapUserRow(sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0], indexMap);
  
  return { success: true, message: 'Đã đổi mật khẩu thành công', user: updatedUser };
}

/** F. GỬI LẠI ĐƠN SAU KHI BỊ TỪ CHỐI */
function resubmitRequest(d) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_APPROVALS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) == String(d.id)) {
      // Kiểm tra số cột để tương thích với dữ liệu cũ
      var hasNewStructure = data[i].length >= 23;
      var currentStep = hasNewStructure ? (data[i][20] || 0) : (data[i][16] || 0);
      var requester = String(data[i][2]).toLowerCase();
      
      // Chỉ người tạo mới có thể gửi lại
      if (requester != String(d.username).toLowerCase() && d.role != 'ADMIN') {
        return { success: false, message: 'Chỉ người tạo đơn mới có thể gửi lại!' };
      }
      
      // Chỉ có thể gửi lại khi step = 0 (đã bị từ chối)
      if (currentStep != 0) {
        return { success: false, message: 'Đơn này không thể gửi lại!' };
      }
      
      // Reset về trạng thái ban đầu và gửi lại
      var time = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm dd/MM/yyyy");
      var newLog = time + ' | ' + d.username + ' (' + d.role + ') | GỬI LẠI ĐỂ DUYỆT';
      var logCol = hasNewStructure ? 23 : 19; // HistoryLog column
      var stepCol = hasNewStructure ? 21 : 17; // CurrentStep column
      var statusCol = hasNewStructure ? 22 : 18; // StatusText column
      
      var oldLog = data[i][logCol - 1] || '';
      sheet.getRange(i + 1, logCol).setValue(oldLog ? oldLog + "\n" + newLog : newLog);
      
      // Set lại step = 0 và status = "Chờ TPKD duyệt"
      sheet.getRange(i + 1, stepCol).setValue(0);
      sheet.getRange(i + 1, statusCol).setValue('Chờ TPKD duyệt');
      
      return { success: true, message: 'Đã gửi lại đơn thành công!' };
    }
  }
  return { success: false, message: 'Không tìm thấy đơn hàng' };
}

/** G. LẤY DANH SÁCH TỜ TRÌNH CỦA USER */
function getMyRequests(username, role) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_APPROVALS);
  var data = sheet.getDataRange().getValues();
  var resultList = [];
  
  for (var i = data.length - 1; i >= 1; i--) { 
    var row = data[i];
    var requester = String(row[2]).toLowerCase();
    
    // Chỉ lấy đơn của user này
    if (requester != String(username).toLowerCase() && role != 'ADMIN') {
      continue;
    }
    
    var hasNewStructure = row.length >= 23;
    var currentStep = hasNewStructure ? (row[20] || 0) : (row[16] || 0);
    
    var item = {
      id: row[0], date: formatDate(row[1]), requester: row[2], contract_code: row[3],
      customer: row[4], phone: row[5], cccd: row[6] || '', 
      email: hasNewStructure ? (row[7] || '') : '',
      address: hasNewStructure ? (row[8] || '') : (row[7] || ''),
      car_model: hasNewStructure ? (row[9] || '') : (row[8] || ''), 
      car_version: hasNewStructure ? (row[10] || '') : '',
      car_color: hasNewStructure ? (row[11] || '') : '',
      vin_no: hasNewStructure ? (row[12] || '') : (row[9] || ''),
      payment: hasNewStructure ? (row[13] || '') : '',
      contract_price: formatCurrency(hasNewStructure ? row[14] : row[10]), 
      discount_details: hasNewStructure ? (row[15] || '') : (row[11] || ''), 
      discount_amount: formatCurrency(hasNewStructure ? row[16] : row[12]),
      gift_details: hasNewStructure ? (row[17] || '') : (row[13] || ''), 
      gift_amount: formatCurrency(hasNewStructure ? row[18] : row[14]), 
      final_price: formatCurrency(hasNewStructure ? row[19] : row[15]),
        step: currentStep, 
        status_text: hasNewStructure ? (row[21] || '') : (row[17] || ''), 
        logs: hasNewStructure ? (row[22] || '') : (row[18] || ''),
        other_requirements: row.length >= 24 ? (row[23] || '') : '',
        max_cost_rate: row.length >= 25 ? (row[24] ? formatCurrency(row[24]) : '') : '',
        productivity_bonus: row.length >= 26 ? (row[25] ? formatCurrency(row[25]) : '') : ''
      };
    
    // Xác định có thể sửa không (step = 0)
    item.can_resubmit = (currentStep == 0);
    
    // Xác định trạng thái duyệt tiếp theo
    // Step 4 (Kế Toán) là bước cuối, sau đó có thể in (step >= 6)
    var stepConfig = WORKFLOW.find(w => w.step == currentStep);
    if (currentStep >= 6 || (stepConfig && stepConfig.next >= 6)) {
      item.is_completed = true;
    } else if (stepConfig && stepConfig.next < 6) {
      var nextConfig = WORKFLOW.find(w => w.step == stepConfig.next);
      if (nextConfig) {
        item.next_status = nextConfig.label;
      }
    }
    
    // Parse logs
    if (item.logs) {
      var logLines = item.logs.split('\n');
      var logEntries = [];
      for (var j = 0; j < logLines.length; j++) {
        var logLine = logLines[j].trim();
        if (!logLine) continue;
        var parts = logLine.split(' | ');
        if (parts.length >= 3) {
          var logEntry = {
            time: parts[0],
            user: parts[1].split(' (')[0],
            role: parts[1].split(' (')[1] ? parts[1].split(' (')[1].replace(')', '') : '',
            action: parts[2],
            comment: parts.length > 3 ? parts.slice(3).join(' | ').replace('Lý do: ', '') : '',
            is_approve: parts[2].indexOf('DUYỆT') !== -1,
            is_reject: parts[2].indexOf('TỪ CHỐI') !== -1
          };
          logEntries.push(logEntry);
        }
      }
      item.log_entries = logEntries;
    }
    
    // Gift JSON
    try {
      var giftLines = item.gift_details.split('\n');
      var gifts = [];
      for (var g = 0; g < giftLines.length; g++) {
        var line = giftLines[g].trim();
        if (line && line.startsWith('- ')) {
          var match = line.match(/- (.+?) \[(.+?)\]/);
          if (match) {
            gifts.push({ name: match[1], price: match[2].replace(/\./g, '').replace(/[^\d]/g, '') });
          }
        }
      }
      item.gift_json = JSON.stringify(gifts);
    } catch (e) {
      item.gift_json = '[]';
    }
    
    item.json_string = encodeURIComponent(JSON.stringify(item));
    resultList.push(item);
  }
  return { success: true, data: resultList };
}

/** H. LẤY CHI TIẾT TỜ TRÌNH */
function getRequestDetail(id, username) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_APPROVALS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) == String(id)) {
      var row = data[i];
      var hasNewStructure = row.length >= 23;
      var currentStep = hasNewStructure ? (row[20] || 0) : (row[16] || 0);
      
      // Kiểm tra quyền (chỉ người tạo hoặc ADMIN)
      var requester = String(row[2]).toLowerCase();
      if (requester != String(username).toLowerCase() && username != 'admin') {
        return { success: false, message: 'Không có quyền xem tờ trình này' };
      }
      
      var hasFullStructure = row.length >= 26;
      
      // Lấy fullname của requester từ Users sheet
      var requesterUsername = row[2];
      var requesterFullname = requesterUsername; // Default to username if not found
      try {
        var userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
        if (userSheet) {
          var userData = userSheet.getDataRange().getValues();
          for (var u = 1; u < userData.length; u++) {
            if (String(userData[u][0]).toLowerCase() == String(requesterUsername).toLowerCase()) {
              requesterFullname = userData[u][3] || requesterUsername; // Column 3 is Fullname
              break;
            }
          }
        }
      } catch (e) {
        // If error, use username as fallback
        requesterFullname = requesterUsername;
      }
      
      var item = {
        id: row[0], date: formatDate(row[1]), requester: row[2], requester_fullname: requesterFullname, contract_code: row[3],
        customer: row[4], phone: row[5], cccd: row[6] || '', 
        email: hasNewStructure ? (row[7] || '') : '',
        address: hasNewStructure ? (row[8] || '') : (row[7] || ''),
        car_model: hasNewStructure ? (row[9] || '') : (row[8] || ''), 
        car_version: hasNewStructure ? (row[10] || '') : '',
        car_color: hasNewStructure ? (row[11] || '') : '',
        vin_no: hasNewStructure ? (row[12] || '') : (row[9] || ''),
        payment: hasNewStructure ? (row[13] || '') : '',
        contract_price: formatCurrency(hasNewStructure ? row[14] : row[10]), 
        discount_details: hasNewStructure ? (row[15] || '') : (row[11] || ''), 
        discount_amount: formatCurrency(hasNewStructure ? row[16] : row[12]),
        gift_details: hasNewStructure ? (row[17] || '') : (row[13] || ''), 
        gift_amount: formatCurrency(hasNewStructure ? row[18] : row[14]), 
        final_price: formatCurrency(hasNewStructure ? row[19] : row[15]),
        step: currentStep, 
        status_text: hasNewStructure ? (row[21] || '') : (row[17] || ''), 
        logs: hasNewStructure ? (row[22] || '') : (row[18] || ''),
        other_requirements: hasFullStructure ? (row[23] || '') : '',
        max_cost_rate: hasFullStructure ? (row[24] ? formatCurrency(row[24]) : '') : '',
        productivity_bonus: hasFullStructure ? (row[25] ? formatCurrency(row[25]) : '') : ''
      };
      
      // Gift JSON
      try {
        var giftLines = item.gift_details.split('\n');
        var gifts = [];
        for (var g = 0; g < giftLines.length; g++) {
          var line = giftLines[g].trim();
          if (line && line.startsWith('- ')) {
            var match = line.match(/- (.+?) \[(.+?)\]/);
            if (match) {
              gifts.push({ name: match[1], price: match[2].replace(/\./g, '').replace(/[^\d]/g, '') });
            }
          }
        }
        item.gift_json = JSON.stringify(gifts);
      } catch (e) {
        item.gift_json = '[]';
      }
      
      return { success: true, data: item };
    }
  }
  return { success: false, message: 'Không tìm thấy tờ trình' };
}

/** I. CẬP NHẬT TỜ TRÌNH */
function updateRequest(d) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_APPROVALS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) == String(d.id)) {
      var row = data[i];
      var hasNewStructure = row.length >= 23;
      var currentStep = hasNewStructure ? (row[20] || 0) : (row[16] || 0);
      var requester = String(row[2]).toLowerCase();
      
      // Chỉ cho phép sửa khi step = 0 và là người tạo
      if (currentStep != 0) {
        return { success: false, message: 'Chỉ có thể sửa tờ trình đã bị từ chối (trả về)' };
      }
      
      // Kiểm tra quyền: chỉ người tạo (TVBH/SALE) hoặc ADMIN mới có thể sửa
      var isRequester = (requester == String(d.username).toLowerCase());
      var isAdmin = (d.username == 'admin' || d.role == 'ADMIN');
      var isTVBH = (d.role == 'TVBH' || d.role == 'SALE');
      
      if (!isRequester && !isAdmin) {
        return { success: false, message: 'Chỉ người tạo mới có thể sửa tờ trình' };
      }
      
      if (isRequester && !isTVBH && !isAdmin) {
        return { success: false, message: 'Chỉ TVBH/SALE hoặc ADMIN mới có thể sửa tờ trình' };
      }
      
      // Tính toán lại giá trị
      var contractPrice = parseVND(d.contract_price);
      var discountAmount = parseVND(d.discount_amount);
      
      // Xử lý Quà tặng JSON
      var giftTotalMoney = 0;
      var giftDescriptionArr = [];
      try {
        // gift_json có thể là string hoặc đã được parse thành object
        var giftJsonStr = d.gift_json;
        if (typeof giftJsonStr === 'object') {
          giftJsonStr = JSON.stringify(giftJsonStr);
        }
        var gifts = JSON.parse(giftJsonStr || "[]");
        if (Array.isArray(gifts)) {
          for (var g = 0; g < gifts.length; g++) {
            var item = gifts[g];
            if (item.name) {
              var price = parseVND(item.price);
              giftTotalMoney += price;
              giftDescriptionArr.push(`- ${item.name} [${formatCurrency(price)}]`);
            }
          }
        }
      } catch (e) {
        Logger.log('Error parsing gift_json in updateRequest: ' + e.toString());
        Logger.log('gift_json value: ' + d.gift_json);
      }
      
      var finalGiftDetails = giftDescriptionArr.join('\n') || "Không có quà";
      var finalPrice = contractPrice - discountAmount;
      
      // Cập nhật dữ liệu
      var rowNum = i + 1;
      if (hasNewStructure) {
        sheet.getRange(rowNum, 4).setValue(d.contract_code); // ContractCode
        sheet.getRange(rowNum, 5).setValue(d.customer_name); // CustomerName
        sheet.getRange(rowNum, 6).setValue("'" + d.phone); // Phone
        sheet.getRange(rowNum, 7).setValue("'" + d.cccd); // CCCD
        sheet.getRange(rowNum, 8).setValue(d.email || ''); // Email
        sheet.getRange(rowNum, 9).setValue(d.address); // Address
        sheet.getRange(rowNum, 10).setValue(d.car_model || ''); // CarModel
        sheet.getRange(rowNum, 11).setValue(d.car_version || ''); // CarVersion
        sheet.getRange(rowNum, 12).setValue(d.car_color || ''); // CarColor
        sheet.getRange(rowNum, 13).setValue(d.vin_no || ''); // VinNo
        sheet.getRange(rowNum, 14).setValue(d.payment_method || ''); // PaymentMethod
        sheet.getRange(rowNum, 15).setValue(contractPrice); // ContractPrice
        sheet.getRange(rowNum, 16).setValue(d.discount_details || ''); // DiscountDetails
        sheet.getRange(rowNum, 17).setValue(discountAmount); // DiscountAmount
        sheet.getRange(rowNum, 18).setValue(finalGiftDetails); // GiftDetails
        sheet.getRange(rowNum, 19).setValue(giftTotalMoney); // GiftAmount
        sheet.getRange(rowNum, 20).setValue(finalPrice); // FinalPrice
        // Cột 24: OtherRequirements, Cột 26: ProductivityBonus
        if (row.length >= 24) {
          sheet.getRange(rowNum, 24).setValue(d.other_requirements || '');
        }
        if (row.length >= 26) {
          sheet.getRange(rowNum, 26).setValue(parseVND(d.productivity_bonus || '0'));
        }
      } else {
        // Fallback cho cấu trúc cũ (19 cột)
        sheet.getRange(rowNum, 4).setValue(d.contract_code);
        sheet.getRange(rowNum, 5).setValue(d.customer_name);
        sheet.getRange(rowNum, 6).setValue("'" + d.phone);
        sheet.getRange(rowNum, 7).setValue("'" + d.cccd);
        sheet.getRange(rowNum, 8).setValue(d.address);
        sheet.getRange(rowNum, 9).setValue(d.car_model || '');
        sheet.getRange(rowNum, 10).setValue(d.vin_no || '');
        sheet.getRange(rowNum, 11).setValue(contractPrice);
        sheet.getRange(rowNum, 12).setValue(d.discount_details || '');
        sheet.getRange(rowNum, 13).setValue(discountAmount);
        sheet.getRange(rowNum, 14).setValue(finalGiftDetails);
        sheet.getRange(rowNum, 15).setValue(giftTotalMoney);
        sheet.getRange(rowNum, 16).setValue(finalPrice);
      }
      
      return { success: true, message: 'Đã cập nhật tờ trình thành công!' };
    }
  }
  return { success: false, message: 'Không tìm thấy tờ trình' };
}

// ===================================
// 5. USER PROFILE & ADMIN MANAGEMENT
// ===================================

function isAdmin(role) {
  return String(role).toUpperCase() === 'ADMIN';
}

function getUserProfile(d) {
  if (!d.username) return { success: false, message: 'Thiếu username' };
  var found = findUserRow(d.username);
  if (!found) return { success: false, message: 'Không tìm thấy người dùng' };
  var profile = mapUserRow(found.row, found.meta.index);
  return { success: true, profile: profile };
}

function updateUserProfile(d) {
  if (!d.username) return { success: false, message: 'Thiếu username' };
  var found = findUserRow(d.username);
  if (!found) return { success: false, message: 'Không tìm thấy người dùng' };
  
  var sheet = found.meta.sheet;
  var idx = found.meta.index;
  var rowIndex = found.rowIndex;
  
  if (d.fullname !== undefined) sheet.getRange(rowIndex, idx['Fullname'] + 1).setValue(d.fullname);
  if (d.phone !== undefined && idx['Phone'] != null) sheet.getRange(rowIndex, idx['Phone'] + 1).setValue(d.phone);
  if (d.email !== undefined && idx['Email'] != null) sheet.getRange(rowIndex, idx['Email'] + 1).setValue(d.email);
  if (d.group !== undefined && idx['Group'] != null) sheet.getRange(rowIndex, idx['Group'] + 1).setValue(d.group);
  
  var updated = mapUserRow(sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0], idx);
  return { success: true, message: 'Đã cập nhật hồ sơ', profile: updated };
}

function listUsers(d) {
  if (!isAdmin(d.role)) return { success: false, message: 'Chỉ ADMIN mới có quyền xem danh sách người dùng' };
  var meta = getUserSheetMeta();
  var data = meta.sheet.getDataRange().getValues();
  var users = [];
  for (var i = 1; i < data.length; i++) {
    users.push(mapUserRow(data[i], meta.index));
  }
  return { success: true, users: users };
}

function createUser(d) {
  if (!isAdmin(d.role)) return { success: false, message: 'Chỉ ADMIN mới có quyền tạo người dùng' };
  var username = (d.new_username || d.username).trim().toLowerCase();
  if (!username) return { success: false, message: 'Thiếu tên đăng nhập' };
  if (!d.new_fullname) return { success: false, message: 'Thiếu họ tên' };
  if (!d.new_role) return { success: false, message: 'Thiếu vai trò' };
  
  if (findUserRow(username)) {
    return { success: false, message: 'Tên đăng nhập đã tồn tại' };
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
  var passwordPlain = d.new_password || '123456';
  var hashed = hashPassword(passwordPlain);
  sheet.appendRow([
    username,
    hashed,
    d.new_fullname,
    d.new_role.toUpperCase(),
    true,
    d.new_phone || '',
    d.new_email || '',
    d.new_group || '',
    true
  ]);
  
  return { success: true, message: 'Đã tạo người dùng mới với mật khẩu tạm: ' + passwordPlain };
}

function updateUser(d) {
  if (!isAdmin(d.role)) return { success: false, message: 'Chỉ ADMIN mới có quyền chỉnh sửa người dùng' };
  if (!d.target_username) return { success: false, message: 'Thiếu username cần chỉnh sửa' };
  var found = findUserRow(d.target_username);
  if (!found) return { success: false, message: 'Không tìm thấy người dùng' };
  
  var sheet = found.meta.sheet;
  var idx = found.meta.index;
  var rowIndex = found.rowIndex;
  
  if (d.fullname !== undefined) sheet.getRange(rowIndex, idx['Fullname'] + 1).setValue(d.fullname);
  if (d.user_role !== undefined) sheet.getRange(rowIndex, idx['Role'] + 1).setValue(d.user_role.toUpperCase());
  if (d.phone !== undefined && idx['Phone'] != null) sheet.getRange(rowIndex, idx['Phone'] + 1).setValue(d.phone);
  if (d.email !== undefined && idx['Email'] != null) sheet.getRange(rowIndex, idx['Email'] + 1).setValue(d.email);
  if (d.group !== undefined && idx['Group'] != null) sheet.getRange(rowIndex, idx['Group'] + 1).setValue(d.group);
  if (d.active !== undefined && idx['Active'] != null) sheet.getRange(rowIndex, idx['Active'] + 1).setValue(!!d.active);
  
  var updated = mapUserRow(sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0], idx);
  return { success: true, message: 'Đã cập nhật người dùng', user: updated };
}

function resetUserPassword(d) {
  if (!isAdmin(d.role)) return { success: false, message: 'Chỉ ADMIN mới có quyền reset mật khẩu' };
  if (!d.target_username) return { success: false, message: 'Thiếu username cần reset' };
  var found = findUserRow(d.target_username);
  if (!found) return { success: false, message: 'Không tìm thấy người dùng' };
  
  var newPassword = d.new_password || '123456';
  var hashed = hashPassword(newPassword);
  found.meta.sheet.getRange(found.rowIndex, found.meta.index['Password'] + 1).setValue(hashed);
  found.meta.sheet.getRange(found.rowIndex, found.meta.index['NeedChangePass'] + 1).setValue(true);
  
  return { success: true, message: 'Đã reset mật khẩu về: ' + newPassword };
}

// --- UTILS ---
function hashPassword(str) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, String(str));
  var txtHash = ''; for (i = 0; i < rawHash.length; i++) { var h = rawHash[i]; if (h < 0) h += 256; if (h.toString(16).length == 1) txtHash += '0'; txtHash += h.toString(16); } return txtHash;
}
function formatDate(d) { if (!d) return ''; return Utilities.formatDate(new Date(d), Session.getScriptTimeZone(), "dd/MM/yyyy"); }
function parseVND(str) { if (!str) return 0; var cleanStr = String(str).replace(/[^0-9]/g, ''); var num = parseInt(cleanStr); return isNaN(num) ? 0 : num; }
function formatCurrency(num) { if (!num) return '0'; return new Number(num).toLocaleString('vi-VN'); }

function getUsersByRole(targetRole) {
  var meta = getUserSheetMeta();
  var data = meta.sheet.getDataRange().getValues();
  var users = [];
  for (var i = 1; i < data.length; i++) {
    var user = mapUserRow(data[i], meta.index);
    if (user.active && user.role === targetRole) {
      users.push({
        username: user.username,
        fullname: user.fullname,
        role: user.role,
        group: user.group || ''
      });
    }
  }
  return { success: true, users: users };
}

function updateProductivityBonus(d) {
  if (!d.id) return { success: false, message: 'Thiếu ID tờ trình' };
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_APPROVALS);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) == String(d.id)) {
      var hasFullStructure = data[i].length >= 26;
      if (!hasFullStructure) {
        return { success: false, message: 'Cấu trúc dữ liệu không đúng. Vui lòng chạy migrate.' };
      }
      
      var hasNewStructure = data[i].length >= 23;
      var logCol = hasNewStructure ? 23 : 19; // HistoryLog column
      var oldLog = data[i][logCol - 1] || '';
      
      // Lấy giá trị cũ để so sánh
      var oldProductivityBonus = hasFullStructure ? (data[i][25] || '') : '';
      
      // Cột 25: ProductivityBonus (VNĐ)
      if (d.productivity_bonus !== undefined && d.productivity_bonus !== null && d.productivity_bonus !== '') {
        var newProductivityBonus = parseVND(d.productivity_bonus);
        if (newProductivityBonus != oldProductivityBonus) {
          sheet.getRange(i + 1, 26).setValue(newProductivityBonus);
          var oldFormatted = oldProductivityBonus ? formatCurrency(oldProductivityBonus) + ' VNĐ' : 'Chưa nhập';
          var newFormatted = d.productivity_bonus_formatted || (formatCurrency(newProductivityBonus) + ' VNĐ');
          
          // Ghi log điều chỉnh
          var time = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm dd/MM/yyyy");
          var newLog = time + ' | ' + d.username + ' (' + d.role + ') | ĐIỀU CHỈNH LƯƠNG NĂNG SUẤT | ' + oldFormatted + ' → ' + newFormatted;
          sheet.getRange(i + 1, logCol).setValue(oldLog ? oldLog + "\n" + newLog : newLog);
        }
      }
      
      return { success: true, message: 'Đã cập nhật lương năng suất thành công' };
    }
  }
  
  return { success: false, message: 'Không tìm thấy tờ trình' };
}