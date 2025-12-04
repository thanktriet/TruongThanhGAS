# 🧪 Hướng Dẫn Test - Test Guide

## 🔑 Tài Khoản Test

### Tài khoản đã tạo (password: `12345`):
- **TVBH**: `tvbh1`, `tvbh2`, `tvbh3`, `tvbh4`, `tvbh5`
- **SaleAdmin**: `saleadmin1`, `saleadmin2`
- **TPKD**: `tpkd1`, `tpkd2`, `tpkd3`
- **GĐKD**: `gdkd1`, `gdkd2`
- **BGĐ**: `bgd1`, `bgd2`
- **BKS**: `bks1`, `bks2`
- **Kế Toán**: `ketoan1`, `ketoan2`
- **Admin**: `admin`

## 📝 Test Workflow Hoàn Chỉnh

### Bước 1: Test Upload File & Tạo Đơn Hàng

1. **Đăng nhập với TVBH**:
   - Username: `tvbh1`
   - Password: `12345`

2. **Tạo đơn hàng mới**:
   - Vào tab "Nhập Đơn Hàng"
   - Nhập CCCD mới (VD: `001234567890`)
   - Điền thông tin khách hàng:
     - Họ tên: "Nguyễn Văn A"
     - SĐT: "0901234567"
     - Email: "test@example.com"
     - Địa chỉ: "123 Đường ABC"
   - Upload file CCCD:
     - Click "Chọn file ảnh" cho mặt trước
     - Chọn file ảnh
     - Lặp lại cho mặt sau
   - Điền thông tin đơn hàng:
     - Dòng Xe: "VF 5 Plus"
     - Phiên bản: "Plus"
     - Màu sắc: "Đỏ"
     - Hình thức thanh toán: "Tiền mặt"
   - Click "Lưu Đơn Hàng"
   - ✅ Kiểm tra: Thông báo thành công

3. **Kiểm tra đơn hàng**:
   - Vào tab "Quản Lý Đơn Hàng"
   - ✅ Kiểm tra: Đơn hàng xuất hiện với trạng thái "Chờ cấp mã"

### Bước 2: Test SaleAdmin Cấp Mã Đơn Hàng

1. **Đăng nhập với SaleAdmin**:
   - Username: `saleadmin1`
   - Password: `12345`

2. **Cấp mã đơn hàng**:
   - Vào tab "Quản Lý Đơn Hàng (Admin)"
   - Tìm đơn hàng vừa tạo
   - Click button "Cấp mã" hoặc input để nhập mã
   - Nhập mã đơn hàng (VD: `S10601001`)
   - Submit
   - ✅ Kiểm tra: Mã được cấp thành công

3. **Kiểm tra từ TVBH**:
   - Đăng nhập lại với `tvbh1`
   - Vào tab "Quản Lý Đơn Hàng"
   - ✅ Kiểm tra: Đơn hàng hiện trạng thái "Đã có mã" và hiển thị mã đơn hàng

### Bước 3: Test Tạo HĐMB

1. **Với TVBH đăng nhập**:
   - Vào tab "Quản Lý Đơn Hàng"
   - Chọn đơn hàng đã có mã
   - Click button "Tạo HĐMB"

2. **Kiểm tra modal**:
   - ✅ Modal mở
   - ✅ Thông tin khách hàng auto-fill
   - ✅ Số hợp đồng auto-fill từ mã đơn hàng
   - ✅ Thông tin xe auto-fill

3. **Điền thông tin hợp đồng**:
   - Ngày ký: Chọn ngày hôm nay
   - Số lượng: 1
   - Đơn giá: 500000000 (500 triệu)
   - ✅ Kiểm tra: Tổng tiền tự động tính = 500000000
   - Tiền cọc: 100000000
   - Chính sách bán hàng: "Giảm giá 5%"

4. **Submit**:
   - Click "Tạo HĐMB"
   - ✅ Kiểm tra: Thông báo thành công
   - ✅ Kiểm tra: File HĐMB mở trong tab mới
   - ⚠️ Lưu ý: Cần cấu hình CONFIG trong Google Apps Script trước

### Bước 4: Test Tạo Thỏa Thuận Lãi Suất

1. **Chọn đơn hàng và mở modal**:
   - Chọn đơn hàng đã có mã
   - Click button "Thỏa thuận"
   - ✅ Kiểm tra: Modal mở

2. **Chọn ngân hàng**:
   - Click radio button chọn ngân hàng (VD: Techcombank)
   - ✅ Kiểm tra: Ngân hàng được chọn

3. **Điền thông tin vay**:
   - Số hợp đồng: Auto-fill từ đơn hàng
   - Giá trị hợp đồng: 500000000
   - Số tiền vay: 400000000
   - ✅ Kiểm tra: Tỷ lệ vay tự động tính = 80%
   - ✅ Kiểm tra: Số tiền bằng chữ tự động tính
   - Thời hạn vay: 36 (tháng)
   - Số khung: "VF5P123456"
   - Số máy: "ENG123456"

4. **Người đồng vay (optional)**:
   - Có thể bỏ qua hoặc điền đầy đủ

5. **Export PDF (optional)**:
   - Check box nếu muốn xuất PDF

6. **Submit**:
   - Click "Tạo Thỏa Thuận"
   - ✅ Kiểm tra: Thông báo thành công
   - ✅ Kiểm tra: File mở trong tab mới

### Bước 5: Test Tạo Đề Nghị Giải Ngân

1. **Mở modal**:
   - Chọn đơn hàng đã có mã
   - Click button "Đề nghị"
   - ✅ Kiểm tra: Modal mở và auto-fill thông tin

2. **Điền thông tin**:
   - Tên ngân hàng vay: "Techcombank"
   - Ngày cấp TBCV: Chọn ngày
   - Loại xe: Auto-fill
   - Số tài khoản: "1234567890"
   - Số tiền đối ứng: 100000000
   - Số tiền giải ngân: 300000000

3. **Submit**:
   - Click "Tạo Đề Nghị"
   - ✅ Kiểm tra: Thông báo thành công
   - ✅ Kiểm tra: File mở trong tab mới

### Bước 6: Test Auto-fill Tạo Tờ Trình

1. **Mở từ đơn hàng**:
   - Chọn đơn hàng đã có mã
   - Click button "Tạo tờ trình"
   - ✅ Kiểm tra: Chuyển sang tab "Tạo Yêu Cầu Mới"

2. **Kiểm tra auto-fill**:
   - ✅ Mã Hợp Đồng: Auto-fill từ mã đơn hàng
   - ✅ Họ tên Khách hàng: Auto-fill
   - ✅ Số điện thoại: Auto-fill
   - ✅ CCCD: Auto-fill
   - ✅ Email: Auto-fill
   - ✅ Địa chỉ: Auto-fill
   - ✅ Dòng Xe: Auto-fill
   - ✅ Phiên bản: Auto-fill
   - ✅ Màu sắc: Auto-fill

3. **Điền thông tin còn thiếu**:
   - Giá trị Hợp đồng: 500000000
   - Tiền giảm giá: 25000000
   - Lương năng suất: 5000000
   - Chọn TPKD duyệt

4. **Submit**:
   - Click "Gửi Duyệt"
   - ✅ Kiểm tra: Tờ trình được tạo thành công

### Bước 7: Test Báo Cáo Ngày

1. **Vào tab Báo Cáo**:
   - Vào tab "Báo Cáo Ngày"
   - ✅ Kiểm tra: Form load với ngày hôm nay

2. **Nhập báo cáo**:
   - Số lượng KHTN: 5
   - Cho mỗi dòng xe:
     - Số ký Hợp đồng: 2
     - Số Xuất HĐ: 1
     - Doanh thu: 1000000000

3. **Submit**:
   - Click "Lưu Báo Cáo"
   - ✅ Kiểm tra: Thông báo thành công

## ⚠️ Lưu Ý Khi Test

### 1. Google Apps Script Configuration
Trước khi test tạo documents, cần:
- Cấu hình CONFIG trong `google-scripts/docs-service.gs`
- Tạo Google Docs templates với đúng placeholders
- Tạo folders trên Google Drive
- Deploy Google Apps Script như Web App

### 2. Common Issues

**Issue: Modal không mở**
- Kiểm tra console có lỗi JavaScript không
- Kiểm tra components.js đã load modals chưa
- Reload trang và thử lại

**Issue: Upload file thất bại**
- Kiểm tra Google Apps Script URL đã được cấu hình
- Kiểm tra permissions của Web App
- Kiểm tra kích thước file (không quá lớn)

**Issue: Tạo documents thất bại**
- Kiểm tra CONFIG trong docs-service.gs
- Kiểm tra Template IDs đã đúng chưa
- Kiểm tra Folder IDs đã đúng chưa
- Xem logs trong Google Apps Script Editor

### 3. Test Data

**Khách hàng mẫu**:
- CCCD: `001234567890`
- Tên: "Nguyễn Văn A"
- SĐT: "0901234567"

**Đơn hàng mẫu**:
- Dòng Xe: "VF 5 Plus"
- Phiên bản: "Plus"
- Màu: "Đỏ"

## 📊 Test Results Checklist

Sử dụng checklist này để ghi lại kết quả test:

```
✅ Pass - Tính năng hoạt động đúng
❌ Fail - Tính năng lỗi
⚠️ Skip - Bỏ qua (cần config)
```

### Test Results:
- [ ] Upload File CCCD: ✅/❌/⚠️
- [ ] Tạo Đơn Hàng: ✅/❌/⚠️
- [ ] Cấp Mã Đơn Hàng: ✅/❌/⚠️
- [ ] Tạo HĐMB: ✅/❌/⚠️
- [ ] Tạo Thỏa Thuận: ✅/❌/⚠️
- [ ] Tạo Đề Nghị: ✅/❌/⚠️
- [ ] Auto-fill Tờ Trình: ✅/❌/⚠️
- [ ] Báo Cáo Ngày: ✅/❌/⚠️

---

**Chúc test thành công!** 🚀

