# 🧪 HƯỚNG DẪN TEST NHANH HỆ THỐNG PHÂN QUYỀN

## 🚀 Test Nhanh (5 phút)

### Bước 1: Mở trang test

Mở file `test-permissions.html` trong browser:
- Nếu chạy local server: `http://localhost:PORT/test-permissions.html`
- Hoặc mở trực tiếp: `file:///path/to/test-permissions.html`

### Bước 2: Chạy tests tự động

Click button **"Chạy Tất Cả Tests"** để kiểm tra:
- ✅ Migration đã chạy thành công
- ✅ File permissions.js đã load
- ✅ Helper functions hoạt động
- ✅ Modal UI tồn tại
- ✅ API functions sẵn sàng

### Bước 3: Test trên ứng dụng thực tế

1. **Đăng nhập với ADMIN**
   - Username: `admin`
   - Password: `12345` (hoặc password bạn đã đổi)

2. **Vào Quản Lý Users**
   - Click tab "Quản Lý Users" (menu bên trái)
   - Xem danh sách users

3. **Test Modal Permissions**
   - Click button **"Quyền"** (màu tím) ở cột "Hành động" của một user
   - Modal sẽ hiển thị:
     - Thông tin user (username, họ tên, role)
     - Tất cả permissions được nhóm theo category
     - Checkbox để bật/tắt từng quyền

4. **Test Bật/Tắt Permissions**
   - Bật/tắt một vài quyền
   - Click **"Lưu Quyền"**
   - Kiểm tra có thông báo thành công không

5. **Test Reset Permissions**
   - Click **"Áp dụng quyền mặc định theo role"**
   - Permissions sẽ được reset về default theo role
   - Click **"Lưu Quyền"**

6. **Test với User Khác**
   - Đăng xuất
   - Đăng nhập với user vừa chỉnh permissions
   - Kiểm tra các quyền có hoạt động đúng không

## ✅ Checklist Test

### Migration
- [ ] Cột permissions đã tồn tại trong bảng users
- [ ] Index idx_users_permissions đã được tạo

### UI/UX
- [ ] Button "Quyền" xuất hiện trong user management table
- [ ] Modal permissions mở được
- [ ] Hiển thị đầy đủ permissions theo nhóm
- [ ] Checkbox hoạt động (bật/tắt)
- [ ] Nút "Áp dụng quyền mặc định" hoạt động
- [ ] Nút "Lưu Quyền" hoạt động và có thông báo

### Functionality
- [ ] Permissions được lưu vào database
- [ ] Permissions được load lại đúng khi mở modal
- [ ] Default permissions đúng theo role
- [ ] Custom permissions override default permissions

### Code
- [ ] File permissions.js load thành công
- [ ] Helper functions hoạt động (hasPermission, etc.)
- [ ] API update_user_permissions hoạt động
- [ ] Không có lỗi trong console

## 🐛 Troubleshooting

### Modal không hiển thị
- Kiểm tra file `components/modals-user-permissions.html` đã được load chưa
- Xem console có lỗi JavaScript không
- Kiểm tra `js/components.js` có load modal không

### Permissions không lưu được
- Kiểm tra console có lỗi API không
- Kiểm tra user đang đăng nhập có role ADMIN không
- Kiểm tra network tab xem request có được gửi không

### Button "Quyền" không xuất hiện
- Kiểm tra `js/app.js` có render button không
- Kiểm tra user đang đăng nhập có role ADMIN không
- Xem `js/auth.js` có hide/show menu đúng không

## 📊 Kết quả mong đợi

Sau khi test thành công:
- ✅ Modal permissions hoạt động mượt mà
- ✅ Admin có thể quản lý permissions dễ dàng
- ✅ Permissions được lưu và load đúng
- ✅ Hệ thống sẵn sàng cho production

## 🎯 Test với các scenarios

### Scenario 1: User mới tạo
1. Tạo user mới với role TVBH
2. Mở modal permissions
3. Kiểm tra có permissions mặc định theo role không

### Scenario 2: Custom permissions
1. Chọn user có permissions mặc định
2. Bật một vài quyền extra
3. Lưu và kiểm tra
4. Đăng nhập với user đó, kiểm tra quyền có hoạt động không

### Scenario 3: Reset permissions
1. User đã có custom permissions
2. Click "Áp dụng quyền mặc định"
3. Kiểm tra permissions được reset về default

## 📝 Ghi chú

- Tất cả tests đều pass → Hệ thống sẵn sàng ✅
- Có test fail → Xem chi tiết trong console và fix lỗi
- Cần hỗ trợ → Xem các file documentation trong project

