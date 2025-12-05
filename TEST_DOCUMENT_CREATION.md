# 📄 Hướng Dẫn Test Tạo Tài Liệu

## ✅ Upload File Đã Hoạt Động!

Upload file đã thành công. Bây giờ test các chức năng tạo tài liệu:

1. **HĐMB** - Hợp đồng Mua Bán
2. **TTLS** - Thỏa Thuận Lãi Suất  
3. **ĐNGN** - Đề Nghị Giải Ngân

## 🧪 Cách Test

### Cách 1: Test Bằng Trang Test Riêng

1. Mở file `test-document-creation.html` trong browser
2. Test từng chức năng:
   - Click "Test Tạo HĐMB"
   - Chọn ngân hàng và click "Test Tạo Thỏa Thuận"
   - Click "Test Tạo Đề Nghị Giải Ngân"
3. Xem kết quả và debug logs

### Cách 2: Test Từ Form Tạo Đơn Hàng (Thực Tế)

1. Đăng nhập với tài khoản TVBH
2. Vào "Nhập Đơn Hàng"
3. Tạo một đơn hàng mới
4. Vào "Quản Lý Đơn Hàng"
5. Tìm đơn hàng vừa tạo
6. Click các nút:
   - **"Tạo HĐMB"** - Mở modal tạo Hợp đồng Mua Bán
   - **"Thỏa thuận"** - Mở modal tạo Thỏa Thuận Lãi Suất
   - **"Đề nghị"** - Mở modal tạo Đề Nghị Giải Ngân

## ⚙️ Cấu Hình Cần Kiểm Tra

### 1. Template IDs trong Google Apps Script

File `google-scripts/docs-service.gs` cần có các Template ID:

```javascript
const CONFIG = {
  FOLDER_ID_HOP_DONG: "FOLDER_ID_HOP_DONG",      // Folder lưu hợp đồng
  FOLDER_ID_THOA_THUAN: "FOLDER_ID_THOA_THUAN",  // Folder lưu thỏa thuận
  FOLDER_ID_DE_NGHI: "FOLDER_ID_DE_NGHI",       // Folder lưu đề nghị
  
  TEMPLATE_ID_HDMB: "TEMPLATE_ID_HDMB",          // Template Hợp đồng Mua Bán
  TEMPLATE_ID_DNGN: "TEMPLATE_ID_DNGN",          // Template Đề nghị Giải ngân
  
  TEMPLATE_IDS_THOA_THUAN: {
    "techcom": "TEMPLATE_ID_TECHCOM",
    "vpbank": "TEMPLATE_ID_VPBANK",
    "tpbank": "TEMPLATE_ID_TPBANK",
    "bidv": "TEMPLATE_ID_BIDV",
    "sacombank": "TEMPLATE_ID_SACOMBANK"
  }
};
```

### 2. Các Bước Setup Templates

#### A. Tạo Templates trên Google Drive

1. Tạo Google Doc template cho HĐMB
2. Tạo Google Doc template cho ĐNGN
3. Tạo Google Doc template cho mỗi ngân hàng (TTLS)

#### B. Lấy Template IDs

1. Mở template trên Google Drive
2. Copy ID từ URL:
   - URL: `https://docs.google.com/document/d/TEMPLATE_ID_HERE/edit`
   - `TEMPLATE_ID_HERE` là Template ID

#### C. Lấy Folder IDs

1. Mở folder trên Google Drive
2. Copy ID từ URL:
   - URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - `FOLDER_ID_HERE` là Folder ID

#### D. Cập Nhật CONFIG

1. Mở `google-scripts/docs-service.gs`
2. Thay thế các `REPLACE_WITH_TEMPLATE_ID` và `REPLACE_WITH_FOLDER_ID`
3. Copy code mới vào Google Apps Script
4. Deploy lại

## 🔍 Các Lỗi Thường Gặp

### Lỗi 1: "Chưa cấu hình TEMPLATE_ID_HDMB"

**Nguyên nhân**: Template ID chưa được set trong CONFIG

**Giải pháp**:
1. Tạo template trên Google Drive
2. Lấy Template ID
3. Cập nhật vào CONFIG
4. Deploy lại Google Apps Script

### Lỗi 2: "Folder không tồn tại"

**Nguyên nhân**: Folder ID sai hoặc folder không có quyền truy cập

**Giải pháp**:
1. Kiểm tra Folder ID có đúng không
2. Đảm bảo Google Apps Script có quyền truy cập folder
3. Folder phải tồn tại trên Google Drive

### Lỗi 3: "Chưa cấu hình template cho ngân hàng"

**Nguyên nhân**: Template ID cho ngân hàng chưa được set

**Giải pháp**:
1. Tạo template cho ngân hàng đó
2. Lấy Template ID
3. Cập nhật vào `TEMPLATE_IDS_THOA_THUAN[bankKey]`
4. Deploy lại

### Lỗi 4: Template không có placeholder đúng

**Nguyên nhân**: Template không có các placeholder như `{{so_hop_dong}}`, `{{khach_hang}}`, etc.

**Giải pháp**:
1. Kiểm tra template có đầy đủ placeholders không
2. Tham khảo code trong `google-scripts/docs-service.gs` để biết placeholders cần thiết
3. Cập nhật template

## 📋 Checklist Test

### Test HĐMB
- [ ] Template ID đã được cấu hình
- [ ] Folder ID đã được cấu hình
- [ ] Template có đầy đủ placeholders
- [ ] Test tạo HĐMB thành công
- [ ] File được tạo trên Google Drive
- [ ] File có thể mở và xem

### Test TTLS
- [ ] Template IDs cho tất cả ngân hàng đã được cấu hình
- [ ] Folder ID đã được cấu hình
- [ ] Templates có đầy đủ placeholders
- [ ] Test tạo TTLS cho từng ngân hàng
- [ ] File được tạo trên Google Drive
- [ ] PDF được export (nếu có)

### Test ĐNGN
- [ ] Template ID đã được cấu hình
- [ ] Folder ID đã được cấu hình
- [ ] Template có đầy đủ placeholders
- [ ] Test tạo ĐNGN thành công
- [ ] File được tạo trên Google Drive

## 🎯 Next Steps

Sau khi test thành công:

1. ✅ Template IDs đã được cấu hình đúng
2. ✅ Folder IDs đã được cấu hình đúng
3. ✅ Có thể tạo tài liệu từ form đơn hàng
4. ✅ Files được lưu vào đúng folder trên Google Drive

## 💡 Tips

- Test từng chức năng một để dễ debug
- Xem debug logs trong browser console (F12)
- Kiểm tra Execution logs trong Google Apps Script
- Kiểm tra folder trên Google Drive để xem file đã được tạo chưa

