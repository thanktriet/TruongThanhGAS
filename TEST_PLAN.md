# 🧪 Test Plan - Kế Hoạch Test Toàn Diện

## 📋 Checklist Test

### 1. Test Upload File CCCD ✅
- [ ] Upload file CCCD mặt trước
- [ ] Upload file CCCD mặt sau
- [ ] Kiểm tra preview hiển thị đúng
- [ ] Kiểm tra file được upload lên Google Drive
- [ ] Kiểm tra URLs được lưu vào database

### 2. Test Tạo Đơn Hàng ✅
- [ ] Tìm kiếm khách hàng theo CCCD (khách hàng mới)
- [ ] Tìm kiếm khách hàng theo CCCD (khách hàng đã có)
- [ ] Điền đầy đủ thông tin khách hàng
- [ ] Upload file CCCD
- [ ] Điền thông tin đơn hàng
- [ ] Submit và kiểm tra đơn hàng được tạo thành công
- [ ] Kiểm tra đơn hàng xuất hiện trong danh sách

### 3. Test SaleAdmin Cấp Mã Đơn Hàng ✅
- [ ] Đăng nhập với tài khoản SaleAdmin
- [ ] Xem danh sách đơn hàng chờ cấp mã
- [ ] Cấp mã đơn hàng cho đơn hàng mới
- [ ] Kiểm tra mã đơn hàng là unique
- [ ] Kiểm tra đơn hàng chuyển sang trạng thái "Đã có mã"

### 4. Test Tạo HĐMB từ Đơn Hàng ✅
- [ ] Đăng nhập với tài khoản TVBH
- [ ] Chọn đơn hàng đã có mã
- [ ] Click button "Tạo HĐMB"
- [ ] Kiểm tra modal mở và auto-fill đúng thông tin
- [ ] Điền đầy đủ thông tin hợp đồng
- [ ] Kiểm tra tính toán tổng tiền tự động
- [ ] Submit và kiểm tra HĐMB được tạo thành công
- [ ] Kiểm tra file HĐMB mở trong tab mới

### 5. Test Tạo Thỏa Thuận Lãi Suất ✅
- [ ] Chọn đơn hàng đã có mã
- [ ] Click button "Thỏa thuận"
- [ ] Kiểm tra modal mở
- [ ] Chọn ngân hàng
- [ ] Điền đầy đủ thông tin vay
- [ ] Kiểm tra tính tỷ lệ vay tự động
- [ ] Kiểm tra tính số tiền bằng chữ tự động
- [ ] Điền thông tin người đồng vay (nếu có)
- [ ] Chọn Export PDF (optional)
- [ ] Submit và kiểm tra thỏa thuận được tạo thành công
- [ ] Kiểm tra file mở trong tab mới

### 6. Test Tạo Đề Nghị Giải Ngân ✅
- [ ] Chọn đơn hàng đã có mã
- [ ] Click button "Đề nghị"
- [ ] Kiểm tra modal mở và auto-fill đúng thông tin
- [ ] Điền đầy đủ thông tin đề nghị
- [ ] Submit và kiểm tra đề nghị được tạo thành công
- [ ] Kiểm tra file mở trong tab mới

### 7. Test Auto-fill Tạo Tờ Trình ✅
- [ ] Chọn đơn hàng đã có mã
- [ ] Click button "Tạo tờ trình"
- [ ] Kiểm tra chuyển sang tab "Tạo Yêu Cầu Mới"
- [ ] Kiểm tra auto-fill thông tin khách hàng
- [ ] Kiểm tra auto-fill thông tin xe
- [ ] Điền thêm thông tin còn thiếu (giá trị hợp đồng, lương năng suất...)
- [ ] Submit và kiểm tra tờ trình được tạo thành công

### 8. Test Báo Cáo Ngày ✅
- [ ] Đăng nhập với tài khoản TVBH
- [ ] Vào tab "Báo Cáo Ngày"
- [ ] Kiểm tra form load đúng
- [ ] Nhập số lượng KHTN
- [ ] Nhập báo cáo theo dòng xe
- [ ] Submit và kiểm tra báo cáo được lưu thành công
- [ ] Kiểm tra có thể xem lại báo cáo đã nhập

### 9. Test Error Handling ✅
- [ ] Test submit form không có file
- [ ] Test submit form thiếu thông tin bắt buộc
- [ ] Test submit với dữ liệu không hợp lệ
- [ ] Test khi Google Apps Script API lỗi
- [ ] Test khi không có kết nối mạng

## 🔍 Kiểm Tra Code

### Checklist Code Review:
- [ ] Tất cả functions được định nghĩa đúng
- [ ] Error handling đầy đủ
- [ ] Loading states hiển thị đúng
- [ ] Toast messages rõ ràng
- [ ] Validation forms đầy đủ

## 📝 Test Cases Chi Tiết

### Test Case 1: Upload File CCCD
```
Prerequisites: TVBH đã đăng nhập
Steps:
1. Vào tab "Nhập Đơn Hàng"
2. Click "Chọn file ảnh" cho CCCD mặt trước
3. Chọn file ảnh
4. Kiểm tra preview hiển thị
5. Lặp lại cho mặt sau
Expected: File được preview và sẵn sàng upload
```

### Test Case 2: Tạo Đơn Hàng Mới
```
Prerequisites: TVBH đã đăng nhập
Steps:
1. Vào tab "Nhập Đơn Hàng"
2. Tìm kiếm khách hàng bằng CCCD (khách hàng mới)
3. Điền thông tin khách hàng
4. Upload file CCCD
5. Điền thông tin đơn hàng
6. Click "Lưu Đơn Hàng"
Expected: 
- Thông báo thành công
- Đơn hàng xuất hiện trong danh sách với trạng thái "Chờ cấp mã"
- File được upload lên Google Drive
```

### Test Case 3: Cấp Mã Đơn Hàng
```
Prerequisites: SaleAdmin đã đăng nhập, có đơn hàng chờ cấp mã
Steps:
1. Vào tab "Quản Lý Đơn Hàng (Admin)"
2. Tìm đơn hàng chờ cấp mã
3. Click button cấp mã
4. Nhập mã đơn hàng (VD: S10601001)
5. Submit
Expected:
- Mã đơn hàng được cấp thành công
- Đơn hàng chuyển sang trạng thái "Đã có mã"
- TVBH có thể thấy mã đơn hàng
```

### Test Case 4: Tạo HĐMB
```
Prerequisites: TVBH đã đăng nhập, có đơn hàng đã có mã
Steps:
1. Vào tab "Quản Lý Đơn Hàng"
2. Chọn đơn hàng đã có mã
3. Click "Tạo HĐMB"
4. Kiểm tra modal mở và auto-fill
5. Điền đầy đủ thông tin hợp đồng
6. Click "Tạo HĐMB"
Expected:
- Thông báo thành công
- File HĐMB mở trong tab mới
- File được lưu trong Google Drive folder đã cấu hình
```

## 🐛 Known Issues & Fixes

### Issue 1: Modal không load
**Fix**: Kiểm tra components.js đã load đúng các modals

### Issue 2: Google Apps Script API lỗi
**Fix**: Kiểm tra CONFIG trong docs-service.gs đã được cấu hình

### Issue 3: Upload file thất bại
**Fix**: Kiểm tra Google Apps Script URL và permissions

## 📊 Test Results Template

```
Test Date: [Date]
Tester: [Name]
Environment: [Dev/Prod]

Test Case 1: Upload File CCCD
- Status: ✅ Pass / ❌ Fail
- Notes: [Any notes]

Test Case 2: Tạo Đơn Hàng
- Status: ✅ Pass / ❌ Fail
- Notes: [Any notes]

...
```

---

**Lưu ý**: Test tất cả các tính năng một cách có hệ thống và ghi lại kết quả!

