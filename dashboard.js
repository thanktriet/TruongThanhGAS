/*
 * File: dashboard.js
 * ĐÃ VIẾT LẠI HOÀN TOÀN ĐỂ SỬ DỤNG API (FETCH) THAY VÌ GOOGLE.SCRIPT.RUN
 */

// ===================================
// CẤU HÌNH API
// ===================================
// Đây là link Web App của Code.gs (đã có từ các bước trước)
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyUS4aLRcEjqZfM_71ytnS4rH9mGOFoH-RrTQ_c5sgxlrNtmCQC7e_Ls5paCRt1eimPQQ/exec';

// Biến toàn cục
let groupData = {};
let carModelList = [];

// ===================================
// HÀM GỌI API TRỢ GIÚP (Hàm Mới)
// ===================================
/**
 * Hàm trợ giúp để gọi API (doPost) một cách nhất quán
 * @param {string} action - Tên hành động (vd: 'getDashboardData')
 * @param {Object} [payload={}] - Dữ liệu gửi lên (vd: { filters: {...} })
 * @returns {Promise<Object>} - Dữ liệu JSON trả về từ server
 */
async function callApi(action, payload = {}) {
  const token = localStorage.getItem('sessionToken');
  
  // 1. Kiểm tra Token (Bảo mật)
  if (!token) {
    console.error("Không tìm thấy token. Đang chuyển hướng về trang đăng nhập.");
    window.location.href = 'index.html';
    throw new Error('No token'); // Dừng hàm
  }

  // 2. Gọi API bằng Fetch
  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // Apps Script thường nhận text/plain
    },
    body: JSON.stringify({
      action: action,  // Hành động mà Code.gs router sẽ bắt
      token: token,    // Token xác thực
      payload: payload // Tất cả dữ liệu khác
    })
  });
  
  const result = await response.json();

  // 3. Xử lý phản hồi
  if (result.status === 'error') {
    // Nếu lỗi là token hết hạn, tự động đăng xuất
    if (result.message.includes('Phiên đăng nhập')) {
      localStorage.removeItem('sessionToken');
      window.location.href = 'index.html';
    }
    // Ném lỗi để hàm .catch() bên ngoài bắt được
    throw new Error(result.message);
  }

  return result; // Trả về dữ liệu nếu thành công (vd: result.daily, result.mtdTotal)
}


// ===================================
// KHỞI CHẠY KHI TẢI TRANG
// ===================================
document.addEventListener("DOMContentLoaded", function() {
  loadInitialData(); // Tải 2 báo cáo đầu
  loadMtdDetailReport({}); // Tải MTD Chi tiết (không lọc)
  loadFormInitData(); // Tải dữ liệu cho Form và Bộ Lọc
  
  document.getElementById('entry-title').innerText = 'Báo Cáo Ngày ' + new Date().toLocaleDateString('vi-VN');
  setDatePickerToToday(); // Đặt ngày mặc định
  showTab('daily'); // Bắt đầu ở tab 'daily'
});

// ===================================
// LOGIC TAB
// ===================================
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`).classList.add('active');
}

// ===================================
// LOGIC LỌC BÁO CÁO MTD CHI TIẾT
// ===================================
function applyFilters() {
  const filters = {
    group: document.getElementById('filter-group').value,
    tvbh: document.getElementById('filter-tvbh').value,
    carModel: document.getElementById('filter-car-model').value
  };
  loadMtdDetailReport(filters); // Chỉ gọi hàm tải MTD Chi tiết
}

function resetFilters() {
  document.getElementById('filter-group').value = "";
  document.getElementById('filter-tvbh').value = "";
  document.getElementById('filter-car-model').value = "";
  populateTvbhFilter(""); // Đặt lại bộ lọc TVBH
  loadMtdDetailReport({}); // Chỉ gọi hàm tải MTD Chi tiết (với bộ lọc rỗng)
}

function toggleFilterButtons(enabled, text = "Lọc") {
  document.getElementById('filter-btn').disabled = !enabled;
  document.getElementById('reset-btn').disabled = !enabled;
  document.getElementById('export-btn').disabled = !enabled; // Vô hiệu hóa cả nút Export
  document.getElementById('filter-btn').innerText = enabled ? "Lọc" : text;
}

function populateTvbhFilter(selectedGroup) {
  const tvbhSelect = document.getElementById("filter-tvbh");
  tvbhSelect.innerHTML = '<option value="">Tất cả TVBH</option>'; // Luôn có "Tất cả"

  if (selectedGroup && groupData[selectedGroup]) {
    const tvbhList = groupData[selectedGroup].sort();
    tvbhList.forEach(tvbh => {
      const option = document.createElement("option");
      option.value = tvbh; option.text = tvbh;
      tvbhSelect.appendChild(option);
    });
  } else if (!selectedGroup) {
    Object.keys(groupData).forEach(group => {
      const tvbhList = groupData[group].sort();
      tvbhList.forEach(tvbh => {
        const option = document.createElement("option");
        option.value = tvbh; option.text = tvbh;
        tvbhSelect.appendChild(option);
      });
    });
  }
}

// ===================================
// LOGIC TẢI DỮ LIỆU BÁO CÁO (ĐÃ CHUYỂN SANG API)
// ===================================

// Hàm tải Báo cáo Ngày (hôm nay) và MTD Tổng (Chạy 1 lần)
function loadInitialData() {
  document.getElementById("loading-daily").innerText = "Đang tải dữ liệu...";
  document.getElementById("loading-mtd-total").innerText = "Đang tải dữ liệu...";
  
  callApi('getDashboardData') // <--- ĐÃ SỬA
    .then(onInitialDataLoaded) // Hàm xử lý thành công
    .catch(onInitialDataFailed); // Hàm xử lý thất bại
}

// Hàm tải CHỈ Bảng MTD Chi tiết (Chạy khi lọc)
function loadMtdDetailReport(filters) {
  document.getElementById("mtd-detail-report-container").innerHTML = '<div id="loading-mtd-detail" class="loading-placeholder">Đang tải dữ liệu...</div>';
  toggleFilterButtons(false, "Đang tải...");

  callApi('getMtdDetailReport', { filters: filters }) // <--- ĐÃ SỬA
    .then(onMtdDetailDataLoaded)
    .catch(onMtdDetailDataFailed);
}

// Tải Báo cáo Ngày theo ngày được chọn
function loadDailyReportByDate() {
  const datePicker = document.getElementById("daily-date-picker");
  const dateString = datePicker.value; // "yyyy-MM-dd"
  if (!dateString) {
    alert("Vui lòng chọn ngày.");
    return;
  }

  document.getElementById("daily-report-container").innerHTML = '<div id="loading-daily" class="loading-placeholder">Đang tải dữ liệu ngày ' + dateString + '...</div>';
  document.getElementById("daily-filter-btn").disabled = true;
  
  callApi('getDailyReportForSpecificDate', { dateString: dateString }) // <--- ĐÃ SỬA
    .then(onDailyDataLoaded)
    .catch(onDailyDataFailed);
}

// Hàm xử lý cho 2 bảng ĐẦU TIÊN
function onInitialDataLoaded(result) { // Nhận 'result' từ API
  // Daily: dính 2 cột, tô đỏ
  document.getElementById("daily-report-container").innerHTML = createHtmlTable(result.daily, 2, true); 
  // MTD Total: dính 3 cột (Hạng, Nhóm, TVBH), không tô đỏ
  document.getElementById("mtd-total-report-container").innerHTML = createMtdTotalTable(result.mtdTotal); // **GỌI HÀM MỚI**
}

// Hàm xử lý lỗi cho 2 bảng ĐẦU TIÊN
function onInitialDataFailed(error) {
  const errorMsg = "Lỗi khi tải dữ liệu: " + error.message;
  document.getElementById("loading-daily").innerText = errorMsg;
  document.getElementById("loading-mtd-total").innerText = errorMsg;
}

// Hàm xử lý PHỤ: Chỉ cập nhật bảng MTD Chi tiết
function onMtdDetailDataLoaded(result) { // Nhận 'result' từ API
  toggleFilterButtons(true); // Kích hoạt lại nút
  // MTD Detail: dính 2 cột, không tô đỏ
  document.getElementById("mtd-detail-report-container").innerHTML = createHtmlTable(result.mtdDetail, 2, false);
}

// Hàm xử lý PHỤ: Chỉ báo lỗi ở bảng MTD Chi tiết
function onMtdDetailDataFailed(error) {
  toggleFilterButtons(true); // Kích hoạt lại nút
  const errorMsg = "Lỗi khi tải dữ liệu: " + error.message;
  document.getElementById("loading-mtd-detail").innerText = errorMsg;
}

// Xử lý Báo cáo Ngày (khi chọn ngày)
function onDailyDataLoaded(result) { // Nhận 'result' từ API
  document.getElementById("daily-filter-btn").disabled = false;
   // Daily (ngày cũ): dính 2 cột, tô đỏ
   document.getElementById("daily-report-container").innerHTML = createHtmlTable(result.daily, 2, true);
}

// Xử lý lỗi Báo cáo Ngày
function onDailyDataFailed(error) {
  document.getElementById("daily-filter-btn").disabled = false;
  document.getElementById("loading-daily").innerText = "Lỗi: " + error.message;
}


/**
 * HÀM TẠO BẢNG CHUẨN (CHO BC NGÀY & MTD CHI TIẾT)
 * (Giữ nguyên như code của bạn)
 */
function createHtmlTable(dataArray, stickyColCount = 0, checkNonReporters = false) {
  if (!dataArray || dataArray.length < 2) { 
    return "<p class='loading-placeholder'>Không có dữ liệu báo cáo (hoặc không tìm thấy kết quả lọc).</p>";
  }
  
  let html = "<table><thead><tr>";
  // Header
  dataArray[0].forEach((cell, index) => {
    let stickyClass = '';
    if (index < stickyColCount) stickyClass = `sticky-col-${index + 1}`;
    let colClass = cell.includes("(%)") ? 'percent-col' : ''; // Thêm class cho cột %
    html += `<th class="${stickyClass} ${colClass}">${cell}</th>`;
  });
  html += "</tr></thead><tbody>";
  
  // Body
  for (let i = 1; i < dataArray.length; i++) {
    const rowData = dataArray[i];
    const isTotalRow = (rowData[0] === "TỔNG CỘNG" || rowData[1] === "TỔNG CỘNG");
    let rowClass = isTotalRow ? 'total-row' : '';

    if (!isTotalRow && checkNonReporters) {
      let allZero = true;
      for (let j = stickyColCount; j < rowData.length; j++) {
        const numericValue = parseFloat(String(rowData[j]).replace(/[^0-9,-]/g, '').replace(',', '.'));
        if (numericValue !== 0) {
          allZero = false;
          break; 
        }
      }
      if (allZero) {
        rowClass = 'not-reported';
      }
    }

    html += `<tr class="${rowClass}">`; 
    rowData.forEach((cell, index) => {
      let stickyClass = '';
      if (index < stickyColCount) stickyClass = `sticky-col-${index + 1}`;
      let colClass = dataArray[0][index].includes("(%)") ? 'percent-col' : ''; // Thêm class cho cột %
      html += `<td class="${stickyClass} ${colClass}">${cell}</td>`;
    });
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

/**
 * HÀM MỚI: TẠO BẢNG MTD TỔNG HỢP (CÓ GỘP HEADER)
 * (Giữ nguyên như code của bạn)
 */
function createMtdTotalTable(dataArray) {
  if (!dataArray || dataArray.length < 2) { 
    return "<p class='loading-placeholder'>Không có dữ liệu báo cáo.</p>";
  }
  
  const headers = dataArray[0]; // ["Hạng", "Nhóm", "TVBH", "KHTN (TĐ)", "KHTN (CT)", ...]
  
  let html = "<table><thead>";
  
  // --- HÀNG TIÊU ĐỀ 1 (GỘP) ---
  html += "<tr>";
  html += `<th rowspan="2" class="sticky-col-1">${headers[0]}</th>`; // Hạng
  html += `<th rowspan="2" class="sticky-col-2">${headers[1]}</th>`; // Nhóm
  html += `<th rowspan="2" class="sticky-col-3">${headers[2]}</th>`; // TVBH
  html += `<th colspan="3">Khách Hàng Tiềm Năng</th>`;
  html += `<th colspan="3">Hợp Đồng</th>`;
  html += `<th colspan="3">Xuất Hóa Đơn</th>`;
  html += `<th colspan="3">Doanh Thu</th>`;
  html += "</tr>";
  
  // --- HÀNG TIÊU ĐỀ 2 (CON) ---
  html += "<tr class='sub-header'>";
  for (let i = 0; i < 4; i++) { // Lặp 4 nhóm (KHTN, HĐ, XHĐ, Doanh Thu)
    html += `<th>${headers[3 + i*3].split('(')[1].replace(')', '')}</th>`; // TĐ
    html += `<th>${headers[4 + i*3].split('(')[1].replace(')', '')}</th>`; // CT
    html += `<th class="percent-col">${headers[5 + i*3].split('(')[1].replace(')', '')}</th>`; // %
  }
  html += "</tr></thead>";
  
  // --- BODY ---
  html += "<tbody>";
  for (let i = 1; i < dataArray.length; i++) {
    const rowData = dataArray[i];
    const isTotalRow = (rowData[1] === "TỔNG CỘNG");
    let rowClass = isTotalRow ? 'total-row' : '';

    html += `<tr class="${rowClass}">`; 
    rowData.forEach((cell, index) => {
      let stickyClass = '';
      if (index < 3) stickyClass = `sticky-col-${index + 1}`; // Dính 3 cột
      let colClass = [5, 8, 11, 14].includes(index) ? 'percent-col' : ''; // Cột %
      html += `<td class="${stickyClass} ${colClass}">${cell}</td>`;
    });
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

// ===================================
// LOGIC XUẤT EXCEL (ĐÃ CHUYỂN SANG API)
// ===================================
function exportToExcel() {
  const filters = {
    group: document.getElementById('filter-group').value,
    tvbh: document.getElementById('filter-tvbh').value,
    carModel: document.getElementById('filter-car-model').value
  };

  const exportStatus = document.getElementById("export-status");
  exportStatus.innerText = "Đang chuẩn bị tệp, vui lòng chờ...";
  exportStatus.className = "success";
  
  toggleFilterButtons(false, "Lọc"); 
  document.getElementById("export-btn").innerText = "Đang xuất...";
  
  callApi('exportAllReports', { filters: filters }) // <--- ĐÃ SỬA
    .then(onExportSuccess)
    .catch(onExportFailed);
}

function onExportSuccess(result) { // Nhận 'result' từ API
  toggleFilterButtons(true); 
  document.getElementById("export-btn").innerText = "Excel";
  const exportStatus = document.getElementById("export-status");
  
  exportStatus.innerHTML = `Tệp <strong>${result.fileName}.xlsx</strong> đã sẵn sàng. <br>Đang tải xuống... (File tạm đã được tạo trong Google Drive của bạn.)`;
  exportStatus.className = "success";
  
  window.open(result.url, '_blank'); 
  
  setTimeout(() => {
    exportStatus.innerText = "";
    exportStatus.style.display = "none";
  }, 10000);
}

function onExportFailed(error) {
  toggleFilterButtons(true); 
  document.getElementById("export-btn").innerText = "Excel";
  const exportStatus = document.getElementById("export-status");
  exportStatus.innerText = "Lỗi khi xuất tệp: " + error.message;
  exportStatus.className = "error";
}

// ===================================
// LOGIC TAB 1: FORM NHẬP LIỆU (ĐÃ CHUYỂN SANG API)
// ===================================

function loadFormInitData() {
  callApi('getFormInitData') // <--- ĐÃ SỬA
    .then(result => {
        groupData = result.groups || {};
        const groupSelectEntry = document.getElementById("group"); 
        const groupSelectFilter = document.getElementById("filter-group"); 
        
        if (Object.keys(groupData).length === 0) {
          groupSelectEntry.innerHTML = '<option value="">Không tìm thấy nhóm</option>';
          groupSelectFilter.innerHTML = '<option value="">Không tìm thấy nhóm</option>';
        } else {
          groupSelectEntry.innerHTML = '<option value="">-- Chọn Nhóm --</option>'; 
          groupSelectFilter.innerHTML = '<option value="">Tất cả các Nhóm</option>';
          
          const groups = Object.keys(groupData).sort();
          groups.forEach(group => {
            const option = document.createElement("option");
            option.value = group; option.text = group;
            groupSelectEntry.appendChild(option);
            groupSelectFilter.appendChild(option.cloneNode(true));
          });
          populateTvbhFilter("");
        }
        
        carModelList = result.carModels || [];
        const carInputsContainer = document.getElementById("car-model-inputs");
        const carSelectFilter = document.getElementById("filter-car-model");
        
        if (carModelList.length === 0) {
          carInputsContainer.innerHTML = "<p class='loading-placeholder'>Không tìm thấy danh sách dòng xe.</p>";
          carSelectFilter.innerHTML = "<option value=''>Không tìm thấy xe</option>";
        } else {
          carInputsContainer.innerHTML = ""; 
          carSelectFilter.innerHTML = '<option value="">Tất cả Dòng Xe</option>';
          
          carModelList.sort().forEach(modelName => { 
            carInputsContainer.innerHTML += createCarModelInputHTML(modelName);
            const option = document.createElement("option");
            option.value = modelName; option.text = modelName;
            carSelectFilter.appendChild(option);
          });
        }
    })
    .catch(error => {
        // Lỗi nghiêm trọng khi tải dữ liệu form
        console.error("Lỗi tải FormInitData:", error.message);
        document.getElementById("entry").innerHTML = `<p class='loading-placeholder'>Lỗi nghiêm trọng khi tải dữ liệu form: ${error.message}</p>`;
    });
}

function createCarModelInputHTML(modelName) {
  const modelId = modelName.replace(/\s+/g, '-').toLowerCase();
  return `
    <div class="car-model-entry">
      <h3>${modelName}</h3>
      <div class="input-grid">
        <div class="form-group">
          <label for="hopDong-${modelId}">Số ký Hợp đồng</label>
          <input type="number" class="car-model-input" id="hopDong-${modelId}" data-model="${modelName}" data-field="hopDong" min="0" value="0">
        </div>
        <div class="form-group">
          <label for="xhd-${modelId}">Số Xuất HĐ</label>
          <input type="number" class="car-model-input" id="xhd-${modelId}" data-model="${modelName}" data-field="xhd" min="0" value="0">
        </div>
        <div class="form-group span-2">
          <label for="doanhThu-${modelId}">Doanh thu (từ XHĐ)</label>
          <input type="number" class="car-model-input" id="doanhThu-${modelId}" data-model="${modelName}" data-field="doanhThu" min="0" value="0">
        </div>
      </div>
    </div>
  `;
}

function populateTvbhEntryList(selectedGroup) {
  const tvbhSelect = document.getElementById("tvbh");
  const formFields = document.getElementById("form-fields");
  
  tvbhSelect.innerHTML = '<option value="">-- Chọn TVBH --</option>';
  tvbhSelect.disabled = true;
  formFields.style.display = "none";

  if (selectedGroup && groupData[selectedGroup]) {
    const tvbhList = groupData[selectedGroup].sort();
    tvbhList.forEach(tvbh => {
      const option = document.createElement("option");
      option.value = tvbh; option.text = tvbh;
      tvbhSelect.appendChild(option);
    });
    tvbhSelect.disabled = false;
  } else {
    tvbhSelect.innerHTML = '<option value="">-- Vui lòng chọn nhóm trước --</option>';
  }
}

function loadDailyData(tvbhName) {
  const formFields = document.getElementById("form-fields");
  const dataStatus = document.getElementById("form-data-status");

  if (!tvbhName) {
    formFields.style.display = "none";
    return;
  }
  
  formFields.style.display = "block";
  dataStatus.innerText = "Đang tải dữ liệu của bạn...";
  clearForm(); 

  callApi('getTodaysReportForTvbh', { tvbhName: tvbhName }) // <--- ĐÃ SỬA
    .then(populateForm) // Hàm populateForm sẽ nhận 'result'
    .catch(onMtdDetailDataFailed); // Dùng chung hàm báo lỗi
}

function populateForm(result) { // Nhận 'result' từ API
  const data = result.data; // Dữ liệu báo cáo nằm trong 'result.data'
  const dataStatus = document.getElementById("form-data-status");
  clearForm(); 

  if (data) {
    dataStatus.innerText = "Đã tìm thấy báo cáo hôm nay. Bạn có thể cập nhật:";
    document.getElementById('khtn').value = data.khtn || 0;
    if(data.carModels) {
      Object.keys(data.carModels).forEach(modelName => {
        const modelStats = data.carModels[modelName];
        const modelId = modelName.replace(/\s+/g, '-').toLowerCase();
        
        const hopDongInput = document.getElementById(`hopDong-${modelId}`);
        const xhdInput = document.getElementById(`xhd-${modelId}`);
        const doanhThuInput = document.getElementById(`doanhThu-${modelId}`);
        
        if(hopDongInput) hopDongInput.value = modelStats.hopDong || 0;
        if(xhdInput) xhdInput.value = modelStats.xhd || 0;
        if(doanhThuInput) doanhThuInput.value = modelStats.doanhThu || 0;
      });
    }
  } else {
    dataStatus.innerText = "Nhập báo cáo mới cho hôm nay:";
  }
}

function clearForm() {
  document.getElementById('khtn').value = 0;
  document.querySelectorAll('.car-model-input').forEach(input => {
    input.value = 0;
  });
}

function handleFormSubmit(event) {
  event.preventDefault(); 
  
  const form = document.getElementById("entry-form");
  const button = document.getElementById("submitButton");
  const status = document.getElementById("form-status");

  button.disabled = true; button.innerText = "Đang lưu...";
  status.innerText = ""; status.className = ""; status.style.display = "none";

  const formData = {
    group: form.group.value,
    tvbh: form.tvbh.value,
    khtn: form.khtn.value,
    carModels: []
  };
  
  document.querySelectorAll('.car-model-input').forEach(input => {
    const modelName = input.dataset.model;
    const field = input.dataset.field;
    let modelEntry = formData.carModels.find(m => m.name === modelName);
    if (!modelEntry) {
      modelEntry = { name: modelName, hopDong: 0, xhd: 0, doanhThu: 0 };
      formData.carModels.push(modelEntry);
    }
    modelEntry[field] = input.value;
  });

  callApi('submitDailyReport', formData) // <--- ĐÃ SỬA
    .then(onSubmissionSuccess)
    .catch(onSubmissionFailed);
}

function onSubmissionSuccess(result) { // Nhận 'result' từ API
  const button = document.getElementById("submitButton");
  const status = document.getElementById("form-status");
  
  button.disabled = false; button.innerText = "Lưu Báo Cáo";
  
  // API trả về { status: 'success', message: '...' }
  status.innerText = result.message;
  status.className = "success";
  status.style.display = "block";
  
  // LÀM MỚI TẤT CẢ CÁC BẢNG (Cách đơn giản nhất)
  loadInitialData(); // Tải lại 2 bảng chính
  applyFilters(); // Tải lại bảng chi tiết với bộ lọc
  
  setTimeout(() => {
    showTab('daily');
    status.innerText = "";
    status.style.display = "none";
  }, 1500);
}

function onSubmissionFailed(error) {
  const button = document.getElementById("submitButton");
  const status = document.getElementById("form-status");
  button.disabled = false; button.innerText = "Lưu Báo Cáo";
  status.innerText = "Lỗi: " + error.message;
  status.className = "error";
  status.style.display = "block";
}

function setDatePickerToToday() {
  const datePicker = document.getElementById('daily-date-picker');
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - (offset*60*1000));
  datePicker.value = localDate.toISOString().split('T')[0];
}
