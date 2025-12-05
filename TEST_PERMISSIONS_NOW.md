# 🧪 HƯỚNG DẪN TEST PERMISSIONS NGAY

## Cách 1: Test trên File HTML (Nhanh nhất)

1. Mở file `test-permissions.html` trong browser
2. Click các nút "Chạy Test" để kiểm tra từng phần
3. Xem kết quả và tổng kết

## Cách 2: Test trên Ứng Dụng Chính (Đầy đủ)

### Bước 1: Đăng nhập với ADMIN
- Username: `admin`
- Password: `12345` (hoặc password bạn đã đổi)

### Bước 2: Vào Quản Lý Users
- Click vào tab "Quản Lý Users" (hoặc menu "Quản lý User")

### Bước 3: Test Modal Quản Lý Quyền
1. Tìm một user (ví dụ: `tvbh1`)
2. Click button **"Quyền"** (màu tím) ở cột "Hành động"
3. Modal sẽ hiển thị:
   - ✅ Thông tin user (username, họ tên, role)
   - ✅ Tất cả permissions được nhóm theo category
   - ✅ Checkbox để bật/tắt từng quyền

### Bước 4: Test Bật/Tắt Permissions
1. Bật một vài quyền (ví dụ: `view_all_orders`)
2. Tắt một vài quyền
3. Click **"Lưu Quyền"**
4. Xem thông báo thành công

### Bước 5: Verify Permissions
1. Đăng xuất
2. Đăng nhập với user vừa cập nhật (ví dụ: `tvbh1`)
3. Kiểm tra:
   - Menu items hiển thị theo permissions
   - Chức năng hoạt động đúng với quyền đã set

### Bước 6: Test Reset về Default
1. Đăng nhập lại với ADMIN
2. Vào quản lý quyền của user đó
3. Click **"Áp dụng quyền mặc định theo role"**
4. Click **"Lưu Quyền"**
5. Permissions sẽ reset về default của role

## Checklist Test

- [ ] Modal quản lý quyền hiển thị đúng
- [ ] Tất cả permissions được hiển thị theo nhóm
- [ ] Bật/tắt permissions hoạt động
- [ ] Lưu permissions thành công
- [ ] Permissions được áp dụng đúng cho user
- [ ] Reset về default permissions hoạt động
- [ ] Menu items hiển thị đúng theo permissions

## Troubleshooting

### Modal không hiển thị
- Kiểm tra console có lỗi JavaScript không
- Kiểm tra file `permissions.js` và `modals-user-permissions.html` đã được load chưa

### Permissions không lưu được
- Kiểm tra user đang đăng nhập có role ADMIN không
- Kiểm tra console có lỗi API không
- Kiểm tra migration đã chạy thành công chưa

### Menu items không thay đổi
- Có thể cần refresh trang
- Kiểm tra logic trong `auth.js` đã dùng permission checks chưa

