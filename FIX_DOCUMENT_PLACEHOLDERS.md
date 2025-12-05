# 🔧 Fix: Document Không Có Dữ Liệu Thay Thế

## ⚠️ Vấn Đề

Tạo HĐMB, TTLS, DNGN thành công (có link), nhưng document **không có dữ liệu thay thế** - placeholders vẫn còn nguyên.

## 🔍 Nguyên Nhân

### 1. replaceText() Cần Escape Regex Characters

`replaceText()` trong Google Apps Script dùng regex pattern. Các ký tự đặc biệt như `{`, `}` cần được escape.

### 2. Template Placeholders Format

Cần đảm bảo template có đúng format `{{...}}` như trong code.

### 3. Case Sensitivity

`replaceText()` là case-sensitive. Cần match chính xác.

## ✅ Giải Pháp

### 1. Escape Regex Characters

Thay vì dùng `'{{so_hop_dong}}'` trực tiếp, cần escape:
- `{{` → `\\{\\{`
- `}}` → `\\}\\}`

### 2. Thử Nhiều Format Placeholders

Template có thể dùng format khác:
- `{{so_hop_dong}}`
- `$so_hop_dong$`
- `[so_hop_dong]`
- `{so_hop_dong}`

### 3. Debug và Log

Thêm logging để xem:
- Placeholders nào được tìm thấy
- Dữ liệu nào được replace
- Có lỗi gì không

## 📋 Checklist

- [ ] Kiểm tra template format placeholders
- [ ] Escape regex characters trong replaceText
- [ ] Thử nhiều format nếu cần
- [ ] Debug logs trong Google Apps Script

