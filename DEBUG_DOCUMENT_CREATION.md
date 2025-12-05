# 🔍 Debug: Tạo Document Không Có Dữ Liệu Thay Thế

## ⚠️ Vấn Đề

Tạo HĐMB, TTLS, DNGN thành công (có link), nhưng document không có dữ liệu thay thế.

## 🔍 Nguyên Nhân Có Thể

### 1. Placeholders Trong Template Không Đúng Format

Code đang tìm các placeholders như:
- `{{so_hop_dong}}`
- `{{khach_hang}}`
- `{{TEN_KHACH_HANG}}`

Nếu template dùng format khác (ví dụ: `$so_hop_dong$`, `[so_hop_dong]`, hoặc chỉ `so_hop_dong`), sẽ không thay thế được.

### 2. replaceText() Không Hoạt Động

`body.replaceText()` trong Google Apps Script yêu cầu:
- Pattern phải là regex string
- Phải match chính xác trong document
- Case-sensitive

### 3. Dữ Liệu Không Được Map Đúng

Dữ liệu từ form có thể không khớp với field names trong code.

## ✅ Cách Kiểm Tra

### 1. Kiểm Tra Template Placeholders

Mở template trên Google Docs và xem format của placeholders:
- Có dùng `{{...}}` không?
- Hay dùng format khác?
- Có chính xác từng ký tự không?

### 2. Kiểm Tra Dữ Liệu Được Gửi

Mở Browser Console (F12) khi tạo document và xem:
- Dữ liệu formData được gửi như thế nào?
- Field names có đúng không?

### 3. Kiểm Tra Execution Logs

Vào Google Apps Script → Executions và xem logs:
- Có error gì không?
- Dữ liệu được nhận như thế nào?
- replaceText có chạy không?

## 🔧 Giải Pháp

### Option 1: Cập Nhật Template Placeholders

Nếu template dùng format khác, cần:
1. Cập nhật template để dùng `{{...}}` format
2. Hoặc cập nhật code để match format của template

### Option 2: Cải Thiện replaceText Logic

Thử nhiều cách replace:
- Exact match
- Case-insensitive
- Partial match

### Option 3: Debug và Log Chi Tiết

Thêm logging để xem:
- Dữ liệu nhận được
- Placeholders tìm thấy
- Kết quả replace

## 📝 Cần Kiểm Tra

- [ ] Format placeholders trong template
- [ ] Dữ liệu được gửi từ form
- [ ] Execution logs trong Google Apps Script
- [ ] Template có đúng format `{{...}}` không

