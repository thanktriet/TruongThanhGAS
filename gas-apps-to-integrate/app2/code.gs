/**
 * TÊN CÁC SHEET
 */
const LOG_SHEET_NAME = "NhatKyBaoCao"; 
const TVBH_LIST_SHEET_NAME = "DanhSachTVBH";
const CAR_MODEL_SHEET_NAME = "DanhSachDongXe";
const TARGET_SHEET_NAME = "ChiTieu";

// ========================================================================
// PHẦN 1: WEB APP
// ========================================================================

function doGet(e) {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("Hệ Thống Báo Cáo TVBH")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getFormInitData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Lấy TVBH
    const tvbhSheet = ss.getSheetByName(TVBH_LIST_SHEET_NAME);
    if (!tvbhSheet) throw new Error(`Không tìm thấy sheet: ${TVBH_LIST_SHEET_NAME}`);
    const tvbhData = tvbhSheet.getRange(2, 1, tvbhSheet.getLastRow() - 1, 2).getValues();
    const groupData = {};
    tvbhData.forEach(row => {
      const group = row[0].toString().trim();
      const tvbh = row[1].toString().trim();
      if (group && tvbh) {
        if (!groupData[group]) groupData[group] = [];
        groupData[group].push(tvbh);
      }
    });

    // 2. Lấy Dòng Xe
    const carSheet = ss.getSheetByName(CAR_MODEL_SHEET_NAME);
    if (!carSheet) throw new Error(`Không tìm thấy sheet: ${CAR_MODEL_SHEET_NAME}`);
    const carData = carSheet.getRange(2, 1, carSheet.getLastRow() - 1, 1).getValues();
    const carModelList = carData.map(row => row[0].toString().trim()).filter(name => name !== "");

    return { groups: groupData, carModels: carModelList };
  } catch (error) {
    Logger.log(error);
    return { error: error.message };
  }
}

function submitDailyReport(formData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!sheet) throw new Error(`Không tìm thấy sheet: ${LOG_SHEET_NAME}`);
    
    const timeZone = ss.getSpreadsheetTimeZone();
    const todayStr = Utilities.formatDate(new Date(), timeZone, "dd/MM/yyyy");
    const group = formData.group;
    const tvbh = formData.tvbh;

    const data = sheet.getDataRange().getValues();
    const rowsToDelete = [];
    for (let i = data.length - 1; i >= 1; i--) { 
      const rowDateStr = (typeof data[i][0].getMonth === 'function') 
                         ? Utilities.formatDate(data[i][0], timeZone, "dd/MM/yyyy") 
                         : data[i][0].toString();
      if (rowDateStr === todayStr && data[i][2].toString().trim() === tvbh) {
        rowsToDelete.push(i + 1); 
      }
    }
    
    rowsToDelete.sort((a, b) => b - a).forEach(rowIndex => {
      sheet.deleteRow(rowIndex);
    });

    const newRows = [];
    const khtnValue = parseFloat(formData.khtn) || 0;
    if (khtnValue > 0) { 
      newRows.push([todayStr, group, tvbh, "KHTN", khtnValue, 0, 0, 0]);
    }

    formData.carModels.forEach(model => {
      const hopDong = parseFloat(model.hopDong) || 0;
      const xhd = parseFloat(model.xhd) || 0;
      const doanhThu = parseFloat(model.doanhThu) || 0;
      if (hopDong > 0 || xhd > 0 || doanhThu > 0) { 
        newRows.push([todayStr, group, tvbh, model.name, 0, hopDong, xhd, doanhThu]);
      }
    });

    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 8).setValues(newRows);
      return { success: true, message: `Đã lưu ${newRows.length} dòng báo cáo.` };
    } else {
      return { success: true, message: "Không có dữ liệu mới để lưu." };
    }
  } catch (error) {
    Logger.log(error);
    return { success: false, message: error.message };
  }
}

function getTodaysReportForTvbh(tvbhName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return null;

    const timeZone = ss.getSpreadsheetTimeZone();
    const todayStr = Utilities.formatDate(new Date(), timeZone, "dd/MM/yyyy");
    
    const data = sheet.getDataRange().getValues();
    const reportData = { khtn: 0, carModels: {} };

    for (let i = data.length - 1; i >= 1; i--) {
      const rowDateStr = (typeof data[i][0].getMonth === 'function') 
                         ? Utilities.formatDate(data[i][0], timeZone, "dd/MM/yyyy") 
                         : data[i][0].toString();
      const tvbhInRow = data[i][2].toString().trim();

      if (rowDateStr === todayStr && tvbhInRow === tvbhName.trim()) {
        const dongXe = data[i][3].toString().trim();
        if (dongXe === "KHTN") {
          reportData.khtn += parseFloat(data[i][4]) || 0;
        } else {
          if (!reportData.carModels[dongXe]) {
            reportData.carModels[dongXe] = { hopDong: 0, xhd: 0, doanhThu: 0 };
          }
          reportData.carModels[dongXe].hopDong += parseFloat(data[i][5]) || 0;
          reportData.carModels[dongXe].xhd += parseFloat(data[i][6]) || 0;
          reportData.carModels[dongXe].doanhThu += parseFloat(data[i][7]) || 0;
        }
      }
    }
    
    if (reportData.khtn === 0 && Object.keys(reportData.carModels).length === 0) {
      return null;
    }
    return reportData;
  } catch (error) {
    Logger.log(error);
    return null;
  }
}


// ========================================================================
// PHẦN 2: TÍNH TOÁN BÁO CÁO (CORE LOGIC)
// ========================================================================

/**
 * Hàm xử lý dữ liệu thô.
 * @param {string} targetMonthStr - Chuỗi tháng cần lọc "yyyy-MM" (ví dụ "2025-11"). Nếu null, lấy tháng hiện tại.
 */
function _getProcessedData(targetMonthStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const timeZone = ss.getSpreadsheetTimeZone();

  // 1. Lấy danh sách TVBH
  const tvbhSheet = ss.getSheetByName(TVBH_LIST_SHEET_NAME);
  if (!tvbhSheet) throw new Error(`Không tìm thấy sheet: ${TVBH_LIST_SHEET_NAME}`);
  const tvbhListData = tvbhSheet.getRange("A2:B" + tvbhSheet.getLastRow()).getValues();
  const tvbhMap = {}; 
  tvbhListData.forEach(row => {
    if(row[0] && row[1]) tvbhMap[row[1].toString().trim()] = row[0].toString().trim();
  });
  const allTvbhNames = Object.keys(tvbhMap).sort();

  // 2. Lấy danh sách Dòng Xe
  const carSheet = ss.getSheetByName(CAR_MODEL_SHEET_NAME);
  if (!carSheet) throw new Error(`Không tìm thấy sheet: ${CAR_MODEL_SHEET_NAME}`);
  const carData = carSheet.getRange(2, 1, carSheet.getLastRow() - 1, 1).getValues();
  const allCarModels = carData.map(row => row[0].toString().trim()).filter(n => n !== "").sort();
    
  // 3. Lấy Chỉ Tiêu
  const targetSheet = ss.getSheetByName(TARGET_SHEET_NAME);
  if (!targetSheet) throw new Error(`Không tìm thấy sheet: ${TARGET_SHEET_NAME}`);
  const targetData = targetSheet.getRange(2, 1, targetSheet.getLastRow() - 1, 5).getValues();
  const targetMap = {}; 
  targetData.forEach(row => {
    const tvbh = row[0].toString().trim();
    if(tvbh) {
      targetMap[tvbh] = {
        khtn: parseFloat(row[1]) || 0, hopDong: parseFloat(row[2]) || 0,
        xhd: parseFloat(row[3]) || 0, doanhThu: parseFloat(row[4]) || 0
      };
    }
  });

  // 4. Xác định khoảng thời gian lọc (Start Date & End Date)
  let startDate, endDate;
  if (targetMonthStr) {
    // Nếu có tham số tháng (ví dụ từ date picker)
    const [year, month] = targetMonthStr.split('-').map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59); // Ngày cuối của tháng
  } else {
    // Mặc định tháng hiện tại
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  // 5. Lấy dữ liệu báo cáo
  const logSheet = ss.getSheetByName(LOG_SHEET_NAME);
  if (!logSheet || logSheet.getLastRow() < 2) {
    return { dailyStats: {}, mtdTotalStats: {}, mtdDetailStats: {}, tvbhMap, allTvbhNames, allCarModels, timeZone, targetMap };
  }
  const logData = logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 8).getValues();

  // 6. Khởi tạo cấu trúc
  const dailyStats = {}, mtdTotalStats = {}, mtdDetailStats = {};
  allTvbhNames.forEach(tvbh => {
    dailyStats[tvbh] = {}; 
    mtdTotalStats[tvbh] = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
    mtdDetailStats[tvbh] = {};
  });

  // 7. Duyệt và lọc dữ liệu
  logData.forEach(row => {
    const tvbh = row[2].toString().trim();
    if (!mtdTotalStats[tvbh]) return; 

    let ngayStr;
    const rawDate = row[0];
    if (rawDate && typeof rawDate.getMonth === 'function') {
      ngayStr = Utilities.formatDate(rawDate, timeZone, "dd/MM/yyyy");
    } else {
      ngayStr = rawDate ? rawDate.toString() : "";
    }
    
    const dateParts = ngayStr.split('/');
    if (dateParts.length !== 3) return;
    const timestamp = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    if (isNaN(timestamp.getTime())) return;

    // *** ĐIỀU KIỆN LỌC QUAN TRỌNG ***
    // Chỉ xử lý nếu ngày nằm trong khoảng thời gian đã chọn
    if (timestamp.getTime() >= startDate.getTime() && timestamp.getTime() <= endDate.getTime()) {
      
        const dongXe = row[3].toString().trim();
        const khtn = parseFloat(row[4]) || 0;
        const hopDong = parseFloat(row[5]) || 0;
        const xhd = parseFloat(row[6]) || 0;
        const doanhThu = parseFloat(row[7]) || 0;

        // Daily (Gom theo ngày trong tháng đó)
        if (!dailyStats[tvbh][ngayStr]) {
            dailyStats[tvbh][ngayStr] = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
        }
        dailyStats[tvbh][ngayStr].khtn += khtn;
        dailyStats[tvbh][ngayStr].hopDong += hopDong;
        dailyStats[tvbh][ngayStr].xhd += xhd;
        dailyStats[tvbh][ngayStr].doanhThu += doanhThu;

        // MTD Total
        mtdTotalStats[tvbh].khtn += khtn;
        mtdTotalStats[tvbh].hopDong += hopDong;
        mtdTotalStats[tvbh].xhd += xhd;
        mtdTotalStats[tvbh].doanhThu += doanhThu;
        
        // MTD Detail
        if (!mtdDetailStats[tvbh][dongXe]) {
          mtdDetailStats[tvbh][dongXe] = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
        }
        mtdDetailStats[tvbh][dongXe].khtn += khtn;
        mtdDetailStats[tvbh][dongXe].hopDong += hopDong;
        mtdDetailStats[tvbh][dongXe].xhd += xhd;
        mtdDetailStats[tvbh][dongXe].doanhThu += doanhThu;
    }
  });

  return { dailyStats, mtdTotalStats, mtdDetailStats, tvbhMap, allTvbhNames, allCarModels, timeZone, targetMap };
}

/**
 * HÀM 1: Tải Dashboard (Ngày + MTD Tổng)
 * @param {string} filterMonth - "yyyy-MM" (Nếu null thì lấy tháng hiện tại)
 */
function getDashboardData(filterMonth = null) {
  try {
    const { dailyStats, mtdTotalStats, tvbhMap, allTvbhNames, timeZone, targetMap } = _getProcessedData(filterMonth);
    const todayStr = Utilities.formatDate(new Date(), timeZone, "dd/MM/yyyy");

    // --- Bảng 1: Báo cáo Ngày (Vẫn giữ logic chỉ hiện "Hôm nay") ---
    // (Nếu xem tháng cũ thì "Hôm nay" sẽ không có dữ liệu, nhưng cấu trúc bảng giữ nguyên)
    const dailyHeaders = ["Nhóm", "TVBH", "KHTN (Hôm nay)", "Số Ký HĐ (Hôm nay)", "Số XHĐ (Hôm nay)", "Doanh Thu (Hôm nay)"];
    const dailyData = [dailyHeaders];
    let dailyTotalKHTN = 0, dailyTotalHopDong = 0, dailyTotalXHD = 0, dailyTotalDoanhThu = 0;
    
    allTvbhNames.forEach(tvbh => {
      const stats = (dailyStats[tvbh] && dailyStats[tvbh][todayStr]) 
                    ? dailyStats[tvbh][todayStr]
                    : { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 }; 
      dailyData.push([
        tvbhMap[tvbh], tvbh,
        stats.khtn, stats.hopDong, stats.xhd,
        stats.doanhThu.toLocaleString('vi-VN')
      ]);
      dailyTotalKHTN += stats.khtn;
      dailyTotalHopDong += stats.hopDong;
      dailyTotalXHD += stats.xhd;
      dailyTotalDoanhThu += stats.doanhThu;
    });
    dailyData.push(["TỔNG CỘNG", "", dailyTotalKHTN, dailyTotalHopDong, dailyTotalXHD, dailyTotalDoanhThu.toLocaleString('vi-VN')]);


    // --- Bảng 2: Báo cáo MTD Tổng (CÓ CHỈ TIÊU & XẾP HẠNG) ---
    const calcPercent = (actual, target) => (!target || target === 0) ? 0 : (actual / target);

    const mtdTotalHeaders = [
      "Hạng", "Nhóm", "TVBH", 
      "KHTN (TĐ)", "KHTN (CT)", "KHTN (%)",
      "HĐ (TĐ)", "HĐ (CT)", "HĐ (%)",
      "XHĐ (TĐ)", "XHĐ (CT)", "XHĐ (%)",
      "Doanh Thu (TĐ)", "Doanh Thu (CT)", "Doanh Thu (%)"
    ];
    const mtdTotalData = [mtdTotalHeaders];
    
    const mtdStatsArray = [];
    let totalTargets = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 }; 
    let totalActuals = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 }; 

    allTvbhNames.forEach(tvbh => {
      const stats = mtdTotalStats[tvbh];
      const targets = targetMap[tvbh] || { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
      
      mtdStatsArray.push({
        nhom: tvbhMap[tvbh], tvbh: tvbh,
        khtn: { actual: stats.khtn, target: targets.khtn, percent: calcPercent(stats.khtn, targets.khtn) },
        hopDong: { actual: stats.hopDong, target: targets.hopDong, percent: calcPercent(stats.hopDong, targets.hopDong) },
        xhd: { actual: stats.xhd, target: targets.xhd, percent: calcPercent(stats.xhd, targets.xhd) },
        doanhThu: { actual: stats.doanhThu, target: targets.doanhThu, percent: calcPercent(stats.doanhThu, targets.doanhThu) }
      });
      
      totalActuals.khtn += stats.khtn;
      totalActuals.hopDong += stats.hopDong;
      totalActuals.xhd += stats.xhd;
      totalActuals.doanhThu += stats.doanhThu;
      totalTargets.khtn += targets.khtn;
      totalTargets.hopDong += targets.hopDong;
      totalTargets.xhd += targets.xhd;
      totalTargets.doanhThu += targets.doanhThu;
    });
    
    mtdStatsArray.sort((a, b) => b.doanhThu.actual - a.doanhThu.actual);

    mtdStatsArray.forEach((stats, index) => {
      const rank = index + 1;
      mtdTotalData.push([
        rank, stats.nhom, stats.tvbh,
        stats.khtn.actual, stats.khtn.target, (stats.khtn.percent * 100).toFixed(1) + "%",
        stats.hopDong.actual, stats.hopDong.target, (stats.hopDong.percent * 100).toFixed(1) + "%",
        stats.xhd.actual, stats.xhd.target, (stats.xhd.percent * 100).toFixed(1) + "%",
        stats.doanhThu.actual.toLocaleString('vi-VN'), stats.doanhThu.target.toLocaleString('vi-VN'), (stats.doanhThu.percent * 100).toFixed(1) + "%",
      ]);
    });

    mtdTotalData.push([
      "", "TỔNG CỘNG", "",
      totalActuals.khtn, totalTargets.khtn, (calcPercent(totalActuals.khtn, totalTargets.khtn) * 100).toFixed(1) + "%",
      totalActuals.hopDong, totalTargets.hopDong, (calcPercent(totalActuals.hopDong, totalTargets.hopDong) * 100).toFixed(1) + "%",
      totalActuals.xhd, totalTargets.xhd, (calcPercent(totalActuals.xhd, totalTargets.xhd) * 100).toFixed(1) + "%",
      totalActuals.doanhThu.toLocaleString('vi-VN'), totalTargets.doanhThu.toLocaleString('vi-VN'), (calcPercent(totalActuals.doanhThu, totalTargets.doanhThu) * 100).toFixed(1) + "%",
    ]);
    
    return { daily: dailyData, mtdTotal: mtdTotalData };
  } catch (error) {
    Logger.log(error);
    return { error: error.message };
  }
}

/**
 * HÀM 2: Tải Báo cáo cho 1 NGÀY CỤ THỂ
 */
function getDailyReportForSpecificDate(dateString) {
  try {
    // Lưu ý: Hàm này không cần filterMonth vì nó tìm đích danh 1 ngày cụ thể
    const { dailyStats, tvbhMap, allTvbhNames, timeZone } = _getProcessedData(dateString.substring(0, 7)); // Lấy dữ liệu của tháng đó để tối ưu
    
    const selectedDate = new Date(dateString + "T00:00:00");
    const selectedDateStr = Utilities.formatDate(selectedDate, timeZone, "dd/MM/yyyy");

    const dailyHeaders = ["Nhóm", "TVBH", `KHTN (${selectedDateStr})`, `Số Ký HĐ (${selectedDateStr})`, `Số XHĐ (${selectedDateStr})`, `Doanh Thu (${selectedDateStr})`];
    const dailyData = [dailyHeaders];
    let dailyTotalKHTN = 0, dailyTotalHopDong = 0, dailyTotalXHD = 0, dailyTotalDoanhThu = 0;
    
    allTvbhNames.forEach(tvbh => {
      const stats = (dailyStats[tvbh] && dailyStats[tvbh][selectedDateStr]) 
                    ? dailyStats[tvbh][selectedDateStr] 
                    : { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
      dailyData.push([
        tvbhMap[tvbh], tvbh,
        stats.khtn, stats.hopDong, stats.xhd,
        stats.doanhThu.toLocaleString('vi-VN')
      ]);
      dailyTotalKHTN += stats.khtn;
      dailyTotalHopDong += stats.hopDong;
      dailyTotalXHD += stats.xhd;
      dailyTotalDoanhThu += stats.doanhThu;
    });
    dailyData.push(["TỔNG CỘNG", "", dailyTotalKHTN, dailyTotalHopDong, dailyTotalXHD, dailyTotalDoanhThu.toLocaleString('vi-VN')]);

    return { daily: dailyData };
  } catch (error) {
    Logger.log(error);
    return { error: error.message };
  }
}

/**
 * HÀM 3: Tải MTD Chi tiết (Có bộ lọc + Lọc Tháng)
 */
function getMtdDetailReport(filters = {}) {
  try {
    // Truyền filterMonth (ví dụ: "2025-10") vào _getProcessedData
    const { mtdDetailStats, tvbhMap, allTvbhNames, allCarModels } = _getProcessedData(filters.filterMonth);

    const filteredTvbhNames = allTvbhNames.filter(tvbh => 
        (!filters.group || tvbhMap[tvbh] === filters.group) &&
        (!filters.tvbh || tvbh === filters.tvbh)
      );
    const filteredCarModelList = allCarModels.filter(model => 
        !filters.carModel || model === filters.carModel
      );

    const mtdDetailHeaders = ["Nhóm", "TVBH"];
    const totalStatsByCar = {}; 
    
    filteredCarModelList.forEach(model => {
      mtdDetailHeaders.push(`Ký HĐ (${model})`, `XHĐ (${model})`, `Doanh Thu (${model})`);
      totalStatsByCar[model] = { hopDong: 0, xhd: 0, doanhThu: 0 }; 
    });
    const mtdDetailData = [mtdDetailHeaders];

    filteredTvbhNames.forEach(tvbh => {
      const row = [tvbhMap[tvbh], tvbh]; 
      filteredCarModelList.forEach(model => {
        const stats = (mtdDetailStats[tvbh] && mtdDetailStats[tvbh][model]) 
                      ? mtdDetailStats[tvbh][model] 
                      : { hopDong: 0, xhd: 0, doanhThu: 0 }; 
        row.push(stats.hopDong, stats.xhd, stats.doanhThu.toLocaleString('vi-VN'));
        
        totalStatsByCar[model].hopDong += stats.hopDong;
        totalStatsByCar[model].xhd += stats.xhd;
        totalStatsByCar[model].doanhThu += stats.doanhThu;
      });
      mtdDetailData.push(row);
    });
    
    if (filteredTvbhNames.length > 1) { 
      const totalRow = ["TỔNG CỘNG", ""];
      filteredCarModelList.forEach(model => {
        const totalStats = totalStatsByCar[model];
        totalRow.push(totalStats.hopDong, totalStats.xhd, totalStats.doanhThu.toLocaleString('vi-VN'));
      });
      mtdDetailData.push(totalRow);
    }

    return { mtdDetail: mtdDetailData };
  } catch (error) {
    Logger.log(error);
    return { error: error.message };
  }
}

/**
 * HÀM 4: Xuất Excel (Có bộ lọc + Lọc Tháng)
 */
function exportAllReports(filters = {}) {
  try {
    // Truyền filterMonth vào _getProcessedData
    const { dailyStats, mtdTotalStats, mtdDetailStats, tvbhMap, allTvbhNames, allCarModels, timeZone, targetMap } = _getProcessedData(filters.filterMonth);
    
    // Nếu có chọn tháng, dùng tháng đó làm tên file, nếu không dùng hôm nay
    const dateStr = filters.filterMonth ? filters.filterMonth : Utilities.formatDate(new Date(), timeZone, "dd-MM-yyyy");
    const todayStr = Utilities.formatDate(new Date(), timeZone, "dd/MM/yyyy");

    const fileName = `BaoCaoTVBH_${dateStr}`;
    const tempSpreadsheet = SpreadsheetApp.create(fileName);
    const fileId = tempSpreadsheet.getId();
    
    // 1. BC NGÀY (Lấy theo ngày người dùng chọn hoặc hôm nay nếu không có filterMonth ngày cụ thể - Ở đây logic đơn giản lấy hôm nay nếu export All)
    // Để chính xác, nếu người dùng muốn export tháng cũ, bảng "Ngày" ở đây có thể không có ý nghĩa lắm, ta vẫn để mặc định là ngày hôm nay hoặc ngày cuối tháng đó.
    // Để đơn giản, ta giữ nguyên logic bảng Ngày là "Hôm nay" (thực tế lúc chạy báo cáo).
    const dailyHeaders = ["Nhóm", "TVBH", "KHTN (Hôm nay)", "Số Ký HĐ (Hôm nay)", "Số XHĐ (Hôm nay)", "Doanh Thu (Hôm nay)"];
    const dailyData = [dailyHeaders];
    let dailyTotalKHTN = 0, dailyTotalHopDong = 0, dailyTotalXHD = 0, dailyTotalDoanhThu = 0;
    const todayData = dailyStats[todayStr] || {}; 

    allTvbhNames.forEach(tvbh => {
      const stats = todayData[tvbh] || { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
      dailyData.push([
        tvbhMap[tvbh], tvbh,
        stats.khtn, stats.hopDong, stats.xhd, stats.doanhThu 
      ]);
      dailyTotalKHTN += stats.khtn; dailyTotalHopDong += stats.hopDong; dailyTotalXHD += stats.xhd; dailyTotalDoanhThu += stats.doanhThu;
    });
    dailyData.push(["TỔNG CỘNG", "", dailyTotalKHTN, dailyTotalHopDong, dailyTotalXHD, dailyTotalDoanhThu]);
    
    const dailySheet = tempSpreadsheet.getSheets()[0]; 
    dailySheet.setName("BC_Ngay_Hom_Nay");
    dailySheet.getRange(1, 1, dailyData.length, dailyData[0].length).setValues(dailyData);
    dailySheet.getRange(1, 1, 1, dailyData[0].length).setFontWeight("bold");
    dailySheet.getRange(2, 6, dailyData.length - 1, 1).setNumberFormat("#,##0"); 
    dailySheet.autoResizeColumns(1, dailyData[0].length);
    
    // 2. BC MTD TỔNG
    const calcPercent = (actual, target) => (!target || target === 0) ? 0 : (actual / target);
    const mtdTotalHeaders = [
      "Hạng", "Nhóm", "TVBH", 
      "KHTN (TĐ)", "KHTN (CT)", "KHTN (%)",
      "HĐ (TĐ)", "HĐ (CT)", "HĐ (%)",
      "XHĐ (TĐ)", "XHĐ (CT)", "XHĐ (%)",
      "Doanh Thu (TĐ)", "Doanh Thu (CT)", "Doanh Thu (%)"
    ];
    const mtdTotalData = [mtdTotalHeaders];
    const mtdStatsArray = [];
    let totalTargets = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 }; 
    let totalActuals = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 }; 

    allTvbhNames.forEach(tvbh => {
      const stats = mtdTotalStats[tvbh];
      const targets = targetMap[tvbh] || { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
      mtdStatsArray.push({
        nhom: tvbhMap[tvbh], tvbh: tvbh,
        khtn: { actual: stats.khtn, target: targets.khtn, percent: calcPercent(stats.khtn, targets.khtn) },
        hopDong: { actual: stats.hopDong, target: targets.hopDong, percent: calcPercent(stats.hopDong, targets.hopDong) },
        xhd: { actual: stats.xhd, target: targets.xhd, percent: calcPercent(stats.xhd, targets.xhd) },
        doanhThu: { actual: stats.doanhThu, target: targets.doanhThu, percent: calcPercent(stats.doanhThu, targets.doanhThu) }
      });
      totalActuals.khtn += stats.khtn; totalActuals.hopDong += stats.hopDong; totalActuals.xhd += stats.xhd; totalActuals.doanhThu += stats.doanhThu;
      totalTargets.khtn += targets.khtn; totalTargets.hopDong += targets.hopDong; totalTargets.xhd += targets.xhd; totalTargets.doanhThu += targets.doanhThu;
    });
    mtdStatsArray.sort((a, b) => b.doanhThu.actual - a.doanhThu.actual);

    mtdStatsArray.forEach((stats, index) => {
      const rank = index + 1;
      mtdTotalData.push([
        rank, stats.nhom, stats.tvbh,
        stats.khtn.actual, stats.khtn.target, stats.khtn.percent,
        stats.hopDong.actual, stats.hopDong.target, stats.hopDong.percent,
        stats.xhd.actual, stats.xhd.target, stats.xhd.percent,
        stats.doanhThu.actual, stats.doanhThu.target, stats.doanhThu.percent,
      ]);
    });
    mtdTotalData.push([
      "", "TỔNG CỘNG", "",
      totalActuals.khtn, totalTargets.khtn, calcPercent(totalActuals.khtn, totalTargets.khtn),
      totalActuals.hopDong, totalTargets.hopDong, calcPercent(totalActuals.hopDong, totalTargets.hopDong),
      totalActuals.xhd, totalTargets.xhd, calcPercent(totalActuals.xhd, totalTargets.xhd),
      totalActuals.doanhThu, totalTargets.doanhThu, calcPercent(totalActuals.doanhThu, totalTargets.doanhThu),
    ]);
    
    const mtdTotalSheet = tempSpreadsheet.insertSheet("BC_MTD_Tong");
    mtdTotalSheet.getRange(1, 1, mtdTotalData.length, mtdTotalData[0].length).setValues(mtdTotalData);
    mtdTotalSheet.getRange(1, 1, 1, mtdTotalData[0].length).setFontWeight("bold");
    mtdTotalSheet.getRange(2, 6, mtdTotalData.length - 1, 1).setNumberFormat("0.0%"); 
    mtdTotalSheet.getRange(2, 9, mtdTotalData.length - 1, 1).setNumberFormat("0.0%"); 
    mtdTotalSheet.getRange(2, 12, mtdTotalData.length - 1, 1).setNumberFormat("0.0%"); 
    mtdTotalSheet.getRange(2, 15, mtdTotalData.length - 1, 1).setNumberFormat("0.0%"); 
    mtdTotalSheet.getRange(2, 13, mtdTotalData.length - 1, 2).setNumberFormat("#,##0"); 
    mtdTotalSheet.autoResizeColumns(1, mtdTotalData[0].length);

    // 3. BC MTD CHI TIẾT
    const filteredTvbhNames = allTvbhNames.filter(tvbh => (!filters.group || tvbhMap[tvbh] === filters.group) && (!filters.tvbh || tvbh === filters.tvbh));
    const filteredCarModelList = allCarModels.filter(model => !filters.carModel || model === filters.carModel);
    const mtdDetailHeaders = ["Nhóm", "TVBH"];
    const totalStatsByCar = {}; 
    filteredCarModelList.forEach(model => {
      mtdDetailHeaders.push(`Ký HĐ (${model})`, `XHĐ (${model})`, `Doanh Thu (${model})`);
      totalStatsByCar[model] = { hopDong: 0, xhd: 0, doanhThu: 0 }; 
    });
    const mtdDetailData = [mtdDetailHeaders];

    filteredTvbhNames.forEach(tvbh => {
      const row = [tvbhMap[tvbh], tvbh]; 
      filteredCarModelList.forEach(model => {
        const stats = (mtdDetailStats[tvbh] && mtdDetailStats[tvbh][model]) ? mtdDetailStats[tvbh][model] : { hopDong: 0, xhd: 0, doanhThu: 0 }; 
        row.push(stats.hopDong, stats.xhd, stats.doanhThu); 
        totalStatsByCar[model].hopDong += stats.hopDong; totalStatsByCar[model].xhd += stats.xhd; totalStatsByCar[model].doanhThu += stats.doanhThu;
      });
      mtdDetailData.push(row);
    });
    if (filteredTvbhNames.length > 1) { 
      const totalRow = ["TỔNG CỘNG", ""];
      filteredCarModelList.forEach(model => {
        const totalStats = totalStatsByCar[model];
        totalRow.push(totalStats.hopDong, totalStats.xhd, totalStats.doanhThu);
      });
      mtdDetailData.push(totalRow);
    }

    const mtdDetailSheet = tempSpreadsheet.insertSheet("BC_MTD_ChiTiet");
    mtdDetailSheet.getRange(1, 1, mtdDetailData.length, mtdDetailData[0].length).setValues(mtdDetailData);
    mtdDetailSheet.getRange(1, 1, 1, mtdDetailData[0].length).setFontWeight("bold");
    for(let i = 0; i < filteredCarModelList.length; i++) {
        let colIndex = 3 + (i * 3) + 2; 
        mtdDetailSheet.getRange(2, colIndex, mtdDetailData.length - 1, 1).setNumberFormat("#,##0");
    }
    mtdDetailSheet.autoResizeColumns(1, mtdDetailData[0].length);

    // Cấp quyền
    const file = DriveApp.getFileById(fileId);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    SpreadsheetApp.flush(); 
    return { url: `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`, fileName: fileName };
  } catch (error) {
    Logger.log(error);
    return { error: error.message };
  }
}
