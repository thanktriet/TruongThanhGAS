# 🧪 Hướng Dẫn Test Upload File

## 📋 Vấn Đề Hiện Tại

- ✅ Đơn hàng đã lưu được vào database
- ❌ Hình ảnh chưa upload được lên Google Drive

## 🔍 Cách Test Upload File Riêng

### 1. Mở Trang Test

Mở file `test-upload-file.html` trong browser:
- Local: `file:///path/to/test-upload-file.html`
- Hoặc: Deploy và mở qua URL (ví dụ: `https://app.vinfastkiengiang.vn/test-upload-file.html`)

### 2. Test Upload

1. Click vào "Choose File" và chọn một file ảnh (CCCD hoặc bất kỳ ảnh nào)
2. Xem preview ảnh (nếu có)
3. Click "Test Upload"
4. Xem kết quả:
   - **Debug Info**: Hiển thị logs chi tiết từng bước
   - **Kết quả**: Hiển thị success/error và link đến file

### 3. Kiểm Tra Debug Logs

Trang test sẽ hiển thị các thông tin sau:
- Google Docs API đã load chưa
- Google Apps Script URL
- File được chọn
- Request được gửi
- Response từ server
- Kết quả upload

## 🔧 Các Lỗi Thường Gặp và Cách Fix

### 1. Lỗi CORS

**Hiển thị:**
```
CORS error: Không thể kết nối đến Google Apps Script
```

**Giải pháp:**
1. Kiểm tra Google Apps Script đã được deploy với "Who has access: Anyone" chưa
2. Deploy lại Google Apps Script với đúng cấu hình
3. Xem `FIX_CORS_GOOGLE_SCRIPT.md` để biết chi tiết

### 2. Folder không tồn tại

**Hiển thị:**
```
Folder không tồn tại: 1lmJ-rnhK6J-EQvFHKtem7XDfbjvGEaRg
```

**Giải pháp:**
1. Kiểm tra folder ID có đúng không
2. Đảm bảo Google Apps Script có quyền truy cập folder
3. Copy code mới từ `google-scripts/docs-service.gs` vào Google Apps Script và deploy lại

### 3. Upload thành công nhưng không có URL

**Hiển thị:**
```
Upload successful nhưng không có URLs
```

**Nguyên nhân:**
- File đã được upload nhưng response không trả về URLs
- Kiểm tra code `uploadFilesToDrive` trong Google Apps Script

**Giải pháp:**
- Kiểm tra Google Drive folder xem file đã được upload chưa
- Kiểm tra logs trong Google Apps Script

### 4. HTTP Error

**Hiển thị:**
```
HTTP error! status: XXX
```

**Giải pháp:**
- Kiểm tra Google Apps Script có đang chạy không
- Kiểm tra code trong Google Apps Script có lỗi không
- Xem Execution log trong Google Apps Script

## 📝 Checklist Debug

Khi test upload file, kiểm tra:

- [ ] Google Docs API đã được load (`window.googleDocsAPI` có tồn tại)
- [ ] Google Apps Script URL đã được cấu hình đúng
- [ ] File được chọn và có size > 0
- [ ] Request được gửi đến Google Apps Script
- [ ] Response từ server (check Network tab)
- [ ] File đã được upload vào Google Drive folder
- [ ] URLs được trả về và hiển thị

## 🔍 Kiểm Tra Trong Browser Console

Mở Browser Console (F12) và kiểm tra:

1. **Errors**: Có lỗi nào màu đỏ không?
2. **Network Tab**: 
   - Request đến Google Apps Script có thành công không?
   - Status code là gì? (200 = OK, 500 = Server Error, etc.)
   - Response body là gì?

3. **Console Logs**:
   - `📤 Starting file upload...`
   - `✅ Upload successful` hoặc `❌ Error`

## 📊 Test Cases

### Test Case 1: Upload file nhỏ (< 1MB)
- Chọn file ảnh nhỏ
- Upload và kiểm tra kết quả

### Test Case 2: Upload file lớn (> 5MB)
- Chọn file ảnh lớn
- Kiểm tra có lỗi về size limit không

### Test Case 3: Upload không có file
- Không chọn file, click Upload
- Kiểm tra error message

### Test Case 4: Upload với folder ID sai
- Tạm thời đổi folder ID sai
- Upload và kiểm tra error message

## 🚀 Sau Khi Test Thành Công

Nếu test upload riêng thành công nhưng trong form tạo đơn hàng vẫn không được:

1. Kiểm tra lại code trong `components/order-create.html`
2. So sánh với code trong `test-upload-file.html`
3. Kiểm tra xem có lỗi JavaScript nào trong console không

## 📞 Liên Hệ

Nếu vẫn không giải quyết được, cung cấp:
- Screenshot của Debug Info trong trang test
- Console logs (copy/paste)
- Network tab (screenshot hoặc copy response)
- Error message chi tiết

