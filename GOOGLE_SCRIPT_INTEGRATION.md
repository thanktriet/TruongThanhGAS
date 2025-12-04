# 🚀 Google Apps Script Integration - Hướng Dẫn Hoàn Chỉnh

## 📋 Tổng Quan

Tài liệu này hướng dẫn cách tích hợp Google Apps Script service để:
1. ✅ Upload file lên Google Drive (CCCD images, attachments)
2. ✅ Tạo Hợp đồng Mua Bán (HĐMB) từ template
3. ✅ Tạo Thỏa thuận lãi suất từ template
4. ✅ Tạo Đề nghị giải ngân từ template

## 📁 Files Đã Tạo

### 1. Google Apps Script Code
- **File**: `google-scripts/docs-service.gs`
- **Chức năng**: Service backend xử lý upload và tạo documents

### 2. Frontend Wrapper
- **File**: `js/google-docs-api.js`
- **Chức năng**: Wrapper functions để gọi Google Apps Script API

### 3. Configuration
- **File**: `js/google-docs-config.js`
- **Chức năng**: Cấu hình URL của Google Apps Script Web App

### 4. Documentation
- **File**: `GOOGLE_APPS_SCRIPT_SETUP.md`
- **Chức năng**: Hướng dẫn setup chi tiết

## 🎯 Các Bước Thực Hiện

### Bước 1: Copy Code.gs

1. Mở file `google-scripts/docs-service.gs`
2. Copy toàn bộ nội dung
3. Tạo Google Apps Script project mới tại: https://script.google.com/
4. Paste code vào và lưu

### Bước 2: Cấu Hình CONFIG

Trong Google Apps Script, cập nhật phần CONFIG:

```javascript
const CONFIG = {
  FOLDER_ID_DON_HANG: "YOUR_FOLDER_ID",
  FOLDER_ID_HOP_DONG: "YOUR_FOLDER_ID",
  FOLDER_ID_THOA_THUAN: "YOUR_FOLDER_ID",
  FOLDER_ID_DE_NGHI: "YOUR_FOLDER_ID",
  TEMPLATE_ID_HDMB: "YOUR_TEMPLATE_ID",
  TEMPLATE_ID_DNGN: "YOUR_TEMPLATE_ID",
  TEMPLATE_IDS_THOA_THUAN: {
    "techcom": "YOUR_TEMPLATE_ID",
    "vpbank": "YOUR_TEMPLATE_ID",
    // ... các ngân hàng khác
  }
};
```

**Cách lấy ID:**
- **Folder ID**: Từ URL Google Drive folder
- **Template ID**: Từ URL Google Docs template

### Bước 3: Deploy Web App

1. Trong Google Apps Script Editor: **Deploy** → **New deployment**
2. Chọn type: **Web app**
3. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone** (hoặc **Anyone with Google account**)
4. Click **Deploy**
5. **Copy Web App URL**

### Bước 4: Cấu Hình Frontend

1. Mở file `js/google-docs-config.js`
2. Cập nhật:
   ```javascript
   const GOOGLE_DOCS_SCRIPT_URL = "YOUR_WEB_APP_URL";
   ```
3. Lưu file

### Bước 5: Gửi Link Script

Sau khi deploy xong, gửi lại **Web App URL** để tích hợp vào hệ thống.

## 📝 Template Placeholders

Các template Google Docs cần có các placeholders sau:

### HĐMB (Hợp đồng Mua Bán):
- `{{so_hop_dong}}`
- `{{ngay_ky}}`
- `{{khach_hang}}`
- `{{dia_chi}}`
- `{{sdt}}`
- `{{email}}`
- `{{so_cccd}}`
- `{{ngay_cap}}`
- `{{noi_cap}}`
- `{{ma_so_thue}}`
- `{{nguoi_dai_dien}}`
- `{{chuc_vu}}`
- `{{loai_xe}}`
- `{{phien_ban}}`
- `{{mau_xe}}`
- `{{chinh_sach_ban_hang}}`
- `{{so_luong}}`
- `{{don_gia}}`
- `{{tong_tien}}`
- `{{tong_tien_bang_chu}}`
- `{{tien_coc}}`
- `{{tien_coc_bang_chu}}`
- `{{tien_dot_2_TT}}`
- `{{tien_dot_2_TT_bang_chu}}`
- `{{tien_dot_2_TG}}`
- `{{tien_dot_2_TG_bang_chu}}`
- `{{tien_dot_3}}`
- `{{tien_dot_3_bangchu}}`

### Thỏa Thuận Lãi Suất:
- `{{TEN_KHACH_HANG}}`
- `{{DIA_CHI}}`
- `{{DIEN_THOAI}}`
- `{{CCCD}}`
- `{{NGAY_CAP}}`
- `{{NOI_CAP}}`
- `{{SO_HOP_DONG}}`
- `{{LOAI_XE}}`
- `{{SO_KHUNG}}`
- `{{SO_MAY}}`
- `{{TEN_DONG_VAY}}`
- `{{DIA_CHI_DONG_VAY}}`
- `{{DIEN_THOAI_DONG_VAY}}`
- `{{CCCD_DONG_VAY}}`
- `{{NGAY_CAP_DONG_VAY}}`
- `{{NOI_CAP_DONG_VAY}}`
- `{{GIA_TRI_HOP_DONG}}`
- `{{SO_TIEN_VAY_SO}}`
- `{{SO_TIEN_VAY_CHU}}`
- `{{TY_LE_VAY}}`
- `{{THOI_HAN_VAY}}`

### Đề Nghị Giải Ngân:
- `{{ngay_ky}}`
- `{{kinh_gui_ngan_hang}}`
- `{{ngay_captbcv}}`
- `{{ten_khach_hang}}`
- `{{so_hop_dong}}`
- `{{so_tai_khoan}}`
- `{{loai_xe}}`
- `{{so_tien_doi_ung}}`
- `{{so_tien_doi_ung_bang_chu}}`
- `{{so_tien_giai_ngan}}`
- `{{so_tien_giai_ngan_bang_chu}}`

## 🔧 Usage trong Frontend

### Upload Files:
```javascript
const files = document.getElementById('file-input').files;
const result = await window.googleDocsAPI.uploadFiles(files);
if (result.success) {
    console.log('Files uploaded:', result.urls);
}
```

### Tạo HĐMB:
```javascript
const formData = {
    so_hop_dong: 'HD001',
    khach_hang: 'Nguyễn Văn A',
    // ... các field khác
};
const result = await window.googleDocsAPI.createHDMB(formData);
if (result.success) {
    window.open(result.fileUrl, '_blank');
}
```

### Tạo Thỏa Thuận:
```javascript
const formData = {
    BANK: 'techcom',
    TEN_KHACH_HANG: 'Nguyễn Văn A',
    // ... các field khác
};
const result = await window.googleDocsAPI.createThoaThuan(formData);
if (result.success) {
    window.open(result.docUrl, '_blank');
}
```

## ✅ Checklist

- [ ] Đã tạo Google Apps Script project
- [ ] Đã copy code từ `docs-service.gs`
- [ ] Đã cấu hình CONFIG (Folders, Templates)
- [ ] Đã deploy Web App
- [ ] Đã copy Web App URL
- [ ] Đã cấu hình `google-docs-config.js`
- [ ] Đã test upload file
- [ ] Đã test tạo documents

## 📞 Hỗ Trợ

Sau khi hoàn thành:
1. Gửi **Web App URL** để tích hợp vào hệ thống
2. Test các tính năng upload và tạo documents
3. Báo cáo nếu có lỗi hoặc cần điều chỉnh

---

**File Code.gs sẵn sàng! Bạn chỉ cần:**
1. Copy code từ `google-scripts/docs-service.gs`
2. Paste vào Google Apps Script
3. Cấu hình CONFIG
4. Deploy và gửi lại URL!

