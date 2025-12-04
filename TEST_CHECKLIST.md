# ✅ Test Checklist - Danh Sách Kiểm Tra

## 🔑 Đăng Nhập Test

- [ ] Đăng nhập với `tvbh1` / `12345` ✅
- [ ] Đăng nhập với `saleadmin1` / `12345` ✅
- [ ] Đăng nhập với `admin` / `12345` ✅

---

## 📝 Test 1: Upload File CCCD & Tạo Đơn Hàng

### 1.1 Upload File CCCD
- [ ] Vào tab "Nhập Đơn Hàng"
- [ ] Click "Chọn file ảnh" CCCD mặt trước
- [ ] Chọn file ảnh và kiểm tra preview hiển thị
- [ ] Click "Chọn file ảnh" CCCD mặt sau
- [ ] Chọn file ảnh và kiểm tra preview hiển thị

### 1.2 Tạo Đơn Hàng Mới
- [ ] Nhập CCCD mới: `001234567890`
- [ ] Điền thông tin khách hàng:
  - [ ] Họ tên: "Nguyễn Văn Test"
  - [ ] SĐT: "0901234567"
  - [ ] Email: "test@example.com"
  - [ ] Địa chỉ: "123 Test Street"
- [ ] Điền thông tin đơn hàng:
  - [ ] Dòng Xe: "VF 5 Plus"
  - [ ] Phiên bản: "Plus"
  - [ ] Màu sắc: "Đỏ"
  - [ ] Hình thức thanh toán: "Tiền mặt"
- [ ] Click "Lưu Đơn Hàng"
- [ ] ✅ Kiểm tra: Thông báo "Đã tạo đơn hàng thành công!"
- [ ] ✅ Kiểm tra: Tự động chuyển sang tab "Quản Lý Đơn Hàng"

### 1.3 Kiểm Tra Đơn Hàng
- [ ] ✅ Đơn hàng xuất hiện trong danh sách
- [ ] ✅ Trạng thái: "Chờ cấp mã"
- [ ] ✅ Thông tin khách hàng hiển thị đúng
- [ ] ✅ Thông tin xe hiển thị đúng

---

## 👨‍💼 Test 2: SaleAdmin Cấp Mã Đơn Hàng

### 2.1 Đăng Nhập SaleAdmin
- [ ] Đăng xuất khỏi TVBH
- [ ] Đăng nhập với `saleadmin1` / `12345`
- [ ] ✅ Kiểm tra: Thấy tab "Quản Lý Đơn Hàng (Admin)"

### 2.2 Cấp Mã Đơn Hàng
- [ ] Vào tab "Quản Lý Đơn Hàng (Admin)"
- [ ] ✅ Kiểm tra: Thấy đơn hàng vừa tạo với trạng thái "Chờ cấp mã"
- [ ] Click button/input để cấp mã
- [ ] Nhập mã đơn hàng: `S10601001`
- [ ] Submit
- [ ] ✅ Kiểm tra: Thông báo thành công
- [ ] ✅ Kiểm tra: Đơn hàng chuyển sang trạng thái "Đã có mã"

### 2.3 Kiểm Tra Từ TVBH
- [ ] Đăng xuất khỏi SaleAdmin
- [ ] Đăng nhập lại với `tvbh1`
- [ ] Vào tab "Quản Lý Đơn Hàng"
- [ ] ✅ Kiểm tra: Đơn hàng hiển thị trạng thái "Đã có mã"
- [ ] ✅ Kiểm tra: Mã đơn hàng hiển thị: `S10601001`
- [ ] ✅ Kiểm tra: Các buttons "Tạo tờ trình", "Tạo HĐMB", "Thỏa thuận", "Đề nghị" hiển thị

---

## 📄 Test 3: Tạo HĐMB từ Đơn Hàng

### 3.1 Mở Modal HĐMB
- [ ] Chọn đơn hàng đã có mã
- [ ] Click button "Tạo HĐMB"
- [ ] ✅ Kiểm tra: Modal mở
- [ ] ✅ Kiểm tra: Thông tin khách hàng auto-fill (read-only)
- [ ] ✅ Kiểm tra: Số hợp đồng auto-fill = `S10601001`
- [ ] ✅ Kiểm tra: Ngày ký auto-fill = hôm nay
- [ ] ✅ Kiểm tra: Loại xe auto-fill = "VF 5 Plus"
- [ ] ✅ Kiểm tra: Phiên bản auto-fill = "Plus"
- [ ] ✅ Kiểm tra: Màu xe auto-fill = "Đỏ"

### 3.2 Điền Thông Tin Hợp Đồng
- [ ] Số lượng: `1`
- [ ] Đơn giá: `500000000`
- [ ] ✅ Kiểm tra: Tổng tiền tự động = 500,000,000 VNĐ
- [ ] Tiền cọc: `100000000`
- [ ] Chính sách bán hàng: "Giảm giá 5%"
- [ ] Tiền đợt 2 (Trả thẳng): `200000000`
- [ ] Tiền đợt 2 (Trả góp): `0`
- [ ] Tiền đợt 3: `200000000`

### 3.3 Submit & Kiểm Tra
- [ ] Click "Tạo HĐMB"
- [ ] ✅ Kiểm tra: Loading state hiển thị
- [ ] ✅ Kiểm tra: Thông báo "Tạo HĐMB thành công!"
- [ ] ✅ Kiểm tra: Modal đóng tự động
- [ ] ✅ Kiểm tra: File HĐMB mở trong tab mới
- [ ] ⚠️ Lưu ý: Cần cấu hình CONFIG trong Google Apps Script

---

## 🤝 Test 4: Tạo Thỏa Thuận Lãi Suất

### 4.1 Mở Modal Thỏa Thuận
- [ ] Chọn đơn hàng đã có mã
- [ ] Click button "Thỏa thuận"
- [ ] ✅ Kiểm tra: Modal mở

### 4.2 Chọn Ngân Hàng
- [ ] Click radio button "Techcombank"
- [ ] ✅ Kiểm tra: Ngân hàng được chọn

### 4.3 Điền Thông Tin Vay
- [ ] Số hợp đồng: ✅ Auto-fill = `S10601001`
- [ ] Loại xe: ✅ Auto-fill = "VF 5 Plus"
- [ ] Số khung: `VF5P123456`
- [ ] Số máy: `ENG123456`
- [ ] Giá trị hợp đồng: `500000000`
- [ ] Số tiền vay: `400000000`
- [ ] ✅ Kiểm tra: Tỷ lệ vay tự động tính = 80.00%
- [ ] ✅ Kiểm tra: Số tiền bằng chữ tự động tính
- [ ] Thời hạn vay: `36`

### 4.4 Người Đồng Vay (Optional)
- [ ] Tên người đồng vay: "Trần Thị B"
- [ ] CCCD: `098765432109`
- [ ] SĐT: "0907654321"
- [ ] Ngày cấp: Chọn ngày
- [ ] Nơi cấp: "Công An TP.HCM"
- [ ] Địa chỉ: "456 Test Street"

### 4.5 Export PDF (Optional)
- [ ] Check box "Xuất PDF"

### 4.6 Submit & Kiểm Tra
- [ ] Click "Tạo Thỏa Thuận"
- [ ] ✅ Kiểm tra: Loading state
- [ ] ✅ Kiểm tra: Thông báo "Tạo Thỏa thuận thành công!"
- [ ] ✅ Kiểm tra: File mở trong tab mới
- [ ] ✅ Kiểm tra: Có file PDF nếu đã chọn export

---

## 💰 Test 5: Tạo Đề Nghị Giải Ngân

### 5.1 Mở Modal Đề Nghị
- [ ] Chọn đơn hàng đã có mã
- [ ] Click button "Đề nghị"
- [ ] ✅ Kiểm tra: Modal mở
- [ ] ✅ Kiểm tra: Thông tin khách hàng auto-fill
- [ ] ✅ Kiểm tra: Số hợp đồng auto-fill = `S10601001`

### 5.2 Điền Thông Tin
- [ ] Tên ngân hàng vay: "Techcombank"
- [ ] Ngày cấp TBCV: Chọn ngày
- [ ] Loại xe: ✅ Auto-fill = "VF 5 Plus"
- [ ] Số tài khoản: `1234567890`
- [ ] Số tiền đối ứng: `100000000`
- [ ] Số tiền giải ngân: `300000000`

### 5.3 Submit & Kiểm Tra
- [ ] Click "Tạo Đề Nghị"
- [ ] ✅ Kiểm tra: Loading state
- [ ] ✅ Kiểm tra: Thông báo "Tạo Đề nghị giải ngân thành công!"
- [ ] ✅ Kiểm tra: File mở trong tab mới

---

## 📋 Test 6: Auto-fill Tạo Tờ Trình

### 6.1 Mở Từ Đơn Hàng
- [ ] Chọn đơn hàng đã có mã
- [ ] Click button "Tạo tờ trình"
- [ ] ✅ Kiểm tra: Chuyển sang tab "Tạo Yêu Cầu Mới"

### 6.2 Kiểm Tra Auto-fill
- [ ] ✅ Mã Hợp Đồng = `S10601001`
- [ ] ✅ Họ tên Khách hàng = "Nguyễn Văn Test"
- [ ] ✅ Số điện thoại = "0901234567"
- [ ] ✅ CCCD = "001234567890"
- [ ] ✅ Email = "test@example.com"
- [ ] ✅ Địa chỉ = "123 Test Street"
- [ ] ✅ Dòng Xe = "VF 5 Plus"
- [ ] ✅ Phiên bản = "Plus"
- [ ] ✅ Màu sắc = "Đỏ"
- [ ] ✅ Hình thức thanh toán = "Tiền mặt"

### 6.3 Điền Thông Tin Còn Thiếu
- [ ] Giá trị Hợp đồng: `500000000`
- [ ] Chi tiết giảm giá: "Giảm 5%"
- [ ] Tiền giảm giá: `25000000`
- [ ] Lương năng suất: `5000000`
- [ ] Chọn TPKD duyệt

### 6.4 Submit & Kiểm Tra
- [ ] Click "Gửi Duyệt"
- [ ] ✅ Kiểm tra: Thông báo thành công
- [ ] ✅ Kiểm tra: Tờ trình được tạo và chuyển sang workflow duyệt

---

## 📊 Test 7: Báo Cáo Ngày

### 7.1 Vào Tab Báo Cáo
- [ ] Vào tab "Báo Cáo Ngày"
- [ ] ✅ Kiểm tra: Form load với ngày hôm nay
- [ ] ✅ Kiểm tra: TVBH và Nhóm auto-fill

### 7.2 Nhập Báo Cáo
- [ ] Số lượng KHTN: `5`
- [ ] Cho dòng xe "VF 5 Plus":
  - [ ] Số ký Hợp đồng: `2`
  - [ ] Số Xuất HĐ: `1`
  - [ ] Doanh thu: `1000000000`

### 7.3 Submit & Kiểm Tra
- [ ] Click "Lưu Báo Cáo"
- [ ] ✅ Kiểm tra: Thông báo "Đã lưu báo cáo ngày thành công!"
- [ ] ✅ Kiểm tra: Form được clear và reload với dữ liệu vừa nhập

---

## 🔍 Test 8: Error Handling

### 8.1 Test Validation
- [ ] Submit form không có file → ✅ Hiển thị warning
- [ ] Submit form thiếu thông tin bắt buộc → ✅ Hiển thị error
- [ ] Submit với dữ liệu không hợp lệ → ✅ Hiển thị error

### 8.2 Test Network Errors
- [ ] Tắt mạng và thử submit → ✅ Hiển thị error message
- [ ] Bật lại mạng và thử lại → ✅ Hoạt động bình thường

---

## 📝 Ghi Chú Test

**Test Date**: ___________
**Tester**: ___________
**Environment**: Dev / Prod

### Kết Quả Tổng Quan:
- Test 1 (Upload & Tạo Đơn): ✅ / ❌ / ⚠️
- Test 2 (Cấp Mã): ✅ / ❌ / ⚠️
- Test 3 (Tạo HĐMB): ✅ / ❌ / ⚠️
- Test 4 (Tạo Thỏa Thuận): ✅ / ❌ / ⚠️
- Test 5 (Tạo Đề Nghị): ✅ / ❌ / ⚠️
- Test 6 (Auto-fill Tờ Trình): ✅ / ❌ / ⚠️
- Test 7 (Báo Cáo): ✅ / ❌ / ⚠️
- Test 8 (Error Handling): ✅ / ❌ / ⚠️

### Bugs Phát Hiện:
1. _________________________________
2. _________________________________
3. _________________________________

### Notes:
_________________________________
_________________________________

---

**✅ Hoàn thành test!**

