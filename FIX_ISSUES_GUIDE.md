# 🔧 Hướng Dẫn Fix 2 Vấn Đề

## ⚠️ Vấn Đề 1: Upload File Không Có URL Trả Về

### Nguyên Nhân Có Thể:
1. Response format không đúng
2. Frontend không parse được response
3. File upload thành công nhưng không có URL trong response

### Cách Kiểm Tra:

#### 1. Kiểm Tra Google Apps Script Execution Logs
1. Vào [Google Apps Script Editor](https://script.google.com)
2. Click **Executions** (menu bên trái)
3. Xem execution logs:
   - File có được upload không?
   - URLs có được log không?
   - Response có đúng format không?

#### 2. Kiểm Tra Browser Console
Mở Browser Console (F12) khi upload và xem:
- Response từ server như thế nào?
- Có `urls` array không?
- Có `success: true` không?

### Giải Pháp:

Code đã được cải thiện với:
- ✅ Logging chi tiết URLs
- ✅ Đảm bảo URLs được trả về trong response
- ✅ Error handling tốt hơn

**Nếu vẫn không có URL**, có thể:
- File đã upload nhưng `getUrl()` không hoạt động
- Response bị CORS chặn
- Frontend không parse được response

## ⚠️ Vấn Đề 2: Document Không Có Dữ Liệu Thay Thế

### Nguyên Nhân Có Thể:
1. **Template placeholders không đúng format** - Template có thể dùng format khác `{{...}}`
2. **replaceText() không hoạt động** - Có thể cần escape regex
3. **Dữ liệu không được map đúng** - Field names không khớp

### Cách Kiểm Tra:

#### 1. Kiểm Tra Template Format
Mở template trên Google Docs và xem:
- Placeholders có format `{{so_hop_dong}}` không?
- Hay dùng format khác như `$so_hop_dong$`, `[so_hop_dong]`, `{so_hop_dong}`?
- Có chính xác từng ký tự không?

#### 2. Kiểm Tra Dữ Liệu Được Gửi
Mở Browser Console (F12) khi tạo document:
- `formData` được gửi có những field nào?
- Field names có đúng không?

#### 3. Kiểm Tra Execution Logs
Xem Google Apps Script Execution Logs:
- Dữ liệu nhận được như thế nào?
- Có log "Replacing: ..." không?
- Có lỗi khi replace không?

### Giải Pháp:

#### Option 1: Cập Nhật Template Placeholders

Nếu template dùng format khác, cần:
1. Cập nhật template để dùng `{{...}}` format
2. Hoặc cập nhật code để match format của template

#### Option 2: Cải Thiện replaceText Logic

Code đã được cải thiện với:
- ✅ Escape regex characters
- ✅ Logging chi tiết
- ✅ Error handling tốt hơn
- ✅ Thử nhiều cách nếu có lỗi

#### Option 3: Kiểm Tra Template và Code Match

Đảm bảo:
- Template có placeholders đúng format
- Code map đúng field names
- Dữ liệu có giá trị (không null/undefined)

## 📋 Checklist Debug

### Upload Files:
- [ ] Kiểm tra Execution logs - file có upload không?
- [ ] Kiểm tra Execution logs - URLs có được log không?
- [ ] Kiểm tra Browser console - response có đúng không?
- [ ] Kiểm tra file trong Google Drive folder
- [ ] Test lại với code mới

### Document Placeholders:
- [ ] Kiểm tra template format placeholders
- [ ] Kiểm tra Execution logs - có log "Replacing" không?
- [ ] Kiểm tra Browser console - dữ liệu gửi có đúng không?
- [ ] Kiểm tra document tạo ra - có thay thế được không?
- [ ] Thử với template có placeholders đúng format

## 🔧 Cần Làm Ngay

### 1. Copy Code Mới Vào Google Apps Script

File `google-scripts/docs-service.gs` đã được cập nhật. Cần:
1. Copy code mới
2. Paste vào Google Apps Script Editor
3. Save và Deploy lại

### 2. Kiểm Tra Template Format

Mở từng template và xem:
- HĐMB template: Placeholders có format `{{so_hop_dong}}` không?
- TTLS templates: Placeholders có format `{{TEN_KHACH_HANG}}` không?
- ĐNGN template: Placeholders có format `{{ten_khach_hang}}` không?

### 3. Test Lại

Sau khi copy code và kiểm tra templates:
1. Test upload file - xem có URLs không?
2. Test tạo HĐMB - xem có dữ liệu thay thế không?
3. Test tạo TTLS - xem có dữ liệu thay thế không?
4. Test tạo ĐNGN - xem có dữ liệu thay thế không?

## 💡 Tips

- Xem Execution logs để biết chính xác vấn đề
- Kiểm tra template format - đây thường là nguyên nhân
- Đảm bảo dữ liệu có giá trị (không null/empty)
- Test từng chức năng một để dễ debug

