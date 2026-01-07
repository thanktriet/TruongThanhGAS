/**
 * API BACKEND - QUẢN LÝ KHO XE VINFAST (BẢN CHỐNG LỖI CORS)
 * Cấu trúc cột KhoXe (Index): 0:VIN, 1:Tên, 2:Màu, 3:Năm, 4:SốMáy, 5:Kho, 6:TrạngThái, 7:GhiChú
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();
const DATA_SHEET = "KhoXe";
const ACTUAL_SHEET = "khoxethucte";
const USER_SHEET = "Users";

/**
 * Hàm doPost xử lý mọi yêu cầu từ GitHub (Login, Load, Save, Delete)
 */
function doPost(e) {
  try {
    // Phân tích dữ liệu JSON gửi từ Frontend
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    let result;

    switch (action) {
      case "login":
        result = authenticateUser(request.user, request.pass);
        break;
      case "getVehicles":
        result = getVehiclesData();
        break;
      case "save":
        result = saveVehicle(request.data);
        break;
      case "delete":
        result = deleteVehicle(request.vin);
        break;
      case "finder":
        result = findVehicleInActualStock(request.query);
        break;
      default:
        result = { success: false, message: "Hành động không hợp lệ" };
    }

    // Trả về JSON thông qua ContentService (Bắt buộc để tránh lỗi CORS)
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Lỗi Server: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- HÀM NGHIỆP VỤ ---

function authenticateUser(user, pass) {
  const sheet = SS.getSheetByName(USER_SHEET);
  if (!sheet) return { success: false, message: "Thiếu sheet Users" };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(user) && String(data[i][1]) === String(pass)) {
      return { success: true, role: data[i][2], token: Utilities.base64Encode(user + ":" + Date.now()) };
    }
  }
  return { success: false, message: "Tài khoản hoặc mật khẩu không đúng" };
}

function getVehiclesData() {
  const sheet = SS.getSheetByName(DATA_SHEET);
  const actualSheet = SS.getSheetByName(ACTUAL_SHEET);
  if (!sheet) return [];

  // Lấy VIN bãi thực tế từ sheet 'khoxethucte' - Cột F (index 5)
  let actualVins = [];
  if (actualSheet) {
    const aData = actualSheet.getDataRange().getValues();
    actualVins = aData.slice(1).map(r => String(r[5] || "").trim().toUpperCase()).filter(v => v !== "");
  }

  const values = sheet.getDataRange().getValues().slice(1);
  return values.map(row => {
    const vin = String(row[0] || "").trim().toUpperCase();
    return {
      c0: vin, c1: row[1], c2: row[2], c3: row[3],
      c4: row[4], c5: row[5], c6: row[6], c7: row[7],
      match: actualVins.includes(vin) ? "Có" : "Không"
    };
  });
}

function saveVehicle(vArray) {
  const sheet = SS.getSheetByName(DATA_SHEET);
  if (!sheet) return { success: false };
  const data = sheet.getDataRange().getValues();
  const vin = String(vArray[0]).trim().toUpperCase();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === vin) { rowIndex = i + 1; break; }
  }

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, vArray.length).setValues([vArray]);
    return { success: true, message: "Đã cập nhật VIN: " + vin };
  } else {
    sheet.appendRow(vArray);
    return { success: true, message: "Đã thêm mới VIN: " + vin };
  }
}

function deleteVehicle(vin) {
  const sheet = SS.getSheetByName(DATA_SHEET);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === vin.toUpperCase()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Xóa thành công" };
    }
  }
  return { success: false, message: "Không tìm thấy VIN" };
}

/**
 * Hàm tra cứu xe trong bãi thực tế
 * Cấu trúc sheet: timestamp | Productname | Tình trạng | Ghi Chú | Vị Trí Kho | Số VIN
 */
function findVehicleInActualStock(query) {
  const actualSheet = SS.getSheetByName(ACTUAL_SHEET);
  if (!actualSheet) {
    return { success: false, message: "Không tìm thấy sheet khoxethucte" };
  }

  const data = actualSheet.getDataRange().getValues();
  const queryUpper = String(query).trim().toUpperCase();
  const results = [];

  // Duyệt từ dòng 2 (bỏ header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const vin = String(row[5] || "").trim().toUpperCase(); // Cột F (index 5) - Số VIN

    // Tìm theo VIN hoặc Productname (cột B - index 1)
    const productName = String(row[1] || "").trim().toUpperCase();

    if (vin.includes(queryUpper) || productName.includes(queryUpper)) {
      // Xử lý timestamp an toàn
      let formattedTimestamp = '';
      try {
        const rawTimestamp = row[0];
        if (rawTimestamp) {
          let dateObj;
          // Nếu là Date object
          if (rawTimestamp instanceof Date) {
            dateObj = rawTimestamp;
          } else {
            // Nếu là string hoặc number
            dateObj = new Date(rawTimestamp);
          }

          // Kiểm tra validity
          if (!isNaN(dateObj.getTime())) {
            // Format theo dd/mm/yyyy hh:mm:ss
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            const seconds = dateObj.getSeconds().toString().padStart(2, '0');

            formattedTimestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
          } else {
            // Nếu không parse được, dùng string gốc
            formattedTimestamp = String(rawTimestamp);
          }
        }
      } catch (e) {
        console.error('Error formatting timestamp:', row[0], e);
        formattedTimestamp = String(row[0] || '');
      }

      results.push({
        timestamp: formattedTimestamp, // Timestamp đã format
        model: row[1] || '',           // Cột B - Productname
        status: row[2] || '',          // Cột C - Tình trạng
        note: row[3] || '',            // Cột D - Ghi Chú
        location: row[4] || '',        // Cột E - Vị Trí Kho
        vin: vin                       // Cột F - Số VIN
      });
    }
  }

  return {
    success: true,
    data: results,
    message: results.length > 0 ? `Tìm thấy ${results.length} kết quả` : "Không tìm thấy xe nào"
  };
}
