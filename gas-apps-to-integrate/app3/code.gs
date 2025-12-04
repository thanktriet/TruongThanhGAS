// FILE: Code.gs
// Google Apps Script (Server-side)

// ====== CONFIG ======
// Thay các ID bên dưới bằng ID file Google Docs mẫu cho từng ngân hàng
const TEMPLATE_IDS = {
  "techcom": "1HtH6RiGrad2sUCLyK7Ere0Za6rT4GlbGlo0R5stDHVU",
  "vpbank":  "1jWq25YMTsxTfNGjzYEnMdN0B4Y2NfiUTN07_nnHUQ7A",
  "tpbank":  "1NMG_RnIyQ7KgeS_4oGfwLN2G6MykBGFZTGXl2BQf1DU",
  "bidv":    "REPLACE_WITH_BIDV_DOC_ID",
  "sacombank":"1TePgLhNa0FWfbkj7ek4gi3pmTZTIstPz7Toxw8kNBL8"
};

// Thư mục Drive để lưu file kết quả
const OUTPUT_FOLDER_ID = "1SdP-6aZZCi_tmmrjNszt4v6fItOKdeEU";

// ====== PUBLIC WEB APP ENTRY ======
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Tạo Thỏa thuận lãi suất - Auto')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ====== HELPERS ======
function _copyTemplate(bankKey, customerName) {
  const templateId = TEMPLATE_IDS[bankKey];
  if (!templateId || templateId.startsWith("REPLACE")) {
    throw new Error('Chưa cấu hình mẫu cho ngân hàng: ' + bankKey.toUpperCase() + '. Vui lòng cập nhật ID trong file Code.gs.');
  }
  const folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
  const templateFile = DriveApp.getFileById(templateId);
  const newName = `Thoả thuận - ${customerName} - ${bankKey.toUpperCase()} - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}`;
  const copy = templateFile.makeCopy(newName, folder);
  return copy.getId();
}

function _replacePlaceholders(docId, data) {
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();

  // Map placeholders -> fields (ensure placeholders in templates match these)
  const map = {
    '{{TEN_KHACH_HANG}}': data.TEN_KHACH_HANG || '',
    '{{DIA_CHI}}': data.DIA_CHI || '',
    '{{DIEN_THOAI}}': data.DIEN_THOAI || '',
    '{{CCCD}}': data.CCCD || '',
    '{{NGAY_CAP}}': data.NGAY_CAP ? Utilities.formatDate(new Date(data.NGAY_CAP), Session.getScriptTimeZone(), 'dd/MM/yyyy') : '',
    '{{NOI_CAP}}': data.NOI_CAP || '',
    '{{SO_HOP_DONG}}': data.SO_HOP_DONG || '',
    '{{LOAI_XE}}': data.LOAI_XE || '',
    '{{SO_KHUNG}}': data.SO_KHUNG || '',
    '{{SO_MAY}}': data.SO_MAY || '',

    // Người đồng vay
    '{{TEN_DONG_VAY}}': data.TEN_DONG_VAY || '',
    '{{DIA_CHI_DONG_VAY}}': data.DIA_CHI_DONG_VAY || '',
    '{{DIEN_THOAI_DONG_VAY}}': data.DIEN_THOAI_DONG_VAY || '',
    '{{CCCD_DONG_VAY}}': data.CCCD_DONG_VAY || '',
    '{{NGAY_CAP_DONG_VAY}}': data.NGAY_CAP_DONG_VAY ? Utilities.formatDate(new Date(data.NGAY_CAP_DONG_VAY), Session.getScriptTimeZone(), 'dd/MM/yyyy') : '',
    '{{NOI_CAP_DONG_VAY}}': data.NOI_CAP_DONG_VAY || '',

    // Thông tin hợp đồng vay
    '{{GIA_TRI_HOP_DONG}}': data.GIA_TRI_HOP_DONG ? Number(data.GIA_TRI_HOP_DONG).toLocaleString('vi-VN') : '',
    '{{SO_TIEN_VAY_SO}}': data.SO_TIEN_VAY_SO ? Number(data.SO_TIEN_VAY_SO).toLocaleString('vi-VN') : '',
    '{{SO_TIEN_VAY_CHU}}': data.SO_TIEN_VAY_CHU || '',
    '{{TY_LE_VAY}}': data.TY_LE_VAY || '',
    '{{THOI_HAN_VAY}}': data.THOI_HAN_VAY || ''
  };

  for (var key in map) {
    body.replaceText(key, map[key]);
  }

  doc.saveAndClose();
}

function _exportPdfFromDoc(docId) {
  const docFile = DriveApp.getFileById(docId);
  const blob = docFile.getAs('application/pdf');
  const folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
  const pdfFile = folder.createFile(blob).setName(docFile.getName() + '.pdf');
  return pdfFile.getId();
}

// ====== SERVER FUNCTIONS (CALLED FROM CLIENT) ======

/**
 * Validates form data.
 * @param {object} data The form data object.
 * @returns {string[]} An array of error messages. Empty if valid.
 */
function validateData(data) {
  const errors = [];
  if (!data.TEN_KHACH_HANG) errors.push('Tên khách hàng là bắt buộc.');
  if (!data.CCCD) errors.push('Số CCCD khách hàng là bắt buộc.');
  if (!data.SO_HOP_DONG) errors.push('Số hợp đồng là bắt buộc.');
  if (!data.BANK) errors.push('Phải chọn một ngân hàng.');
  return errors;
}

/**
 * Main function to generate the agreement document.
 * @param {object} data The form data from the client.
 * @returns {object} An object containing URLs and IDs of created files.
 */
function generateAgreement(data) {
  // 1. Validate data first
  const validationErrors = validateData(data);
  if (validationErrors.length > 0) {
    throw new Error('Dữ liệu không hợp lệ: ' + validationErrors.join(', '));
  }

  try {
    // 2. Process the request
    const copyId = _copyTemplate(data.BANK, data.TEN_KHACH_HANG || 'KH');
    _replacePlaceholders(copyId, data);

    const result = {
      docId: copyId,
      docUrl: DriveApp.getFileById(copyId).getUrl()
    };

    if (data.EXPORT_PDF === 'yes') {
      const pdfId = _exportPdfFromDoc(copyId);
      result.pdfId = pdfId;
      result.pdfUrl = DriveApp.getFileById(pdfId).getUrl();
    }

    return result; // Return the full result object
  } catch (err) {
    Logger.log('Lỗi khi tạo thoả thuận: ' + err.stack);
    throw new Error('Đã có lỗi xảy ra phía máy chủ: ' + err.message);
  }
}

/**
 * Gets the list of available banks.
 * @returns {object[]} Array of bank objects {key, name}.
 */
function getBanksAndTemplates() {
  return [
    { key: 'techcom', name: 'Techcombank' },
    { key: 'vpbank', name: 'VPBank' },
    { key: 'tpbank', name: 'TPBank' },
    { key: 'bidv', name: 'BIDV' },
    { key: 'sacombank', name: 'Sacombank' }
  ];
}
