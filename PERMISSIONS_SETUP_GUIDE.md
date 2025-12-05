# HƯỚNG DẪN SETUP VÀ SỬ DỤNG HỆ THỐNG PHÂN QUYỀN

## 📋 Bước 1: Chạy Migration

### Cách 1: Chạy SQL trực tiếp trên Supabase Dashboard (Khuyên dùng)

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **SQL Editor** > **New Query**
4. Copy nội dung file `supabase/migrations/20251205120000_add_user_permissions.sql`
5. Paste vào SQL Editor và chạy (Run)

### Cách 2: Sử dụng Supabase CLI

```bash
# Đảm bảo đã login
supabase login

# Link project (nếu chưa)
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

### Cách 3: Chạy script tự động (nếu có)

```bash
# Nếu có script push-to-supabase.sh
chmod +x push-to-supabase.sh
./push-to-supabase.sh
```

### ✅ Kiểm tra migration đã chạy thành công

Chạy SQL query này trên Supabase Dashboard:

```sql
-- Kiểm tra cột permissions đã tồn tại
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'permissions';

-- Kiểm tra index
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'users' AND indexname = 'idx_users_permissions';
```

Kết quả mong đợi:
- Cột `permissions` với kiểu `jsonb`
- Index `idx_users_permissions` đã tồn tại

## 📋 Bước 2: Test tính năng

### 2.1. Đăng nhập với ADMIN

1. Đăng nhập với tài khoản ADMIN
2. Vào tab **"Quản Lý Users"**
3. Kiểm tra xem có button **"Quyền"** (màu tím) ở cột "Hành động"

### 2.2. Quản lý permissions cho user

1. Click button **"Quyền"** của một user (ví dụ: tvbh1)
2. Modal sẽ hiển thị:
   - Thông tin user (username, họ tên, role)
   - Tất cả permissions được nhóm theo category
   - Checkbox để bật/tắt từng quyền
3. Test các thao tác:
   - Bật/tắt một vài quyền
   - Click **"Áp dụng quyền mặc định theo role"** để reset
   - Click **"Lưu Quyền"** để lưu thay đổi
4. Kiểm tra:
   - Sau khi lưu, permissions có được cập nhật không
   - Đăng nhập với user đó để test permissions có hoạt động không

### 2.3. Test với các roles khác nhau

- Test với TVBH: Kiểm tra các quyền mặc định
- Test với SALEADMIN: Kiểm tra quyền quản lý đơn hàng
- Test với ADMIN: Đảm bảo có tất cả quyền

## 📋 Bước 3: Sử dụng trong code (Optional - sau này)

### Ví dụ: Cập nhật auth.js để dùng permissions

Hiện tại hệ thống vẫn dùng role checks. Sau này có thể cập nhật để dùng permission checks:

```javascript
// Thay vì:
if (user.role === 'TVBH' || user.role === 'SALE') {
    $('nav-order-create')?.classList.remove('hidden');
}

// Có thể dùng:
if (hasPermission(user, 'create_order')) {
    $('nav-order-create')?.classList.remove('hidden');
}
```

**Lưu ý:** Việc này là optional. Hệ thống hiện tại vẫn hoạt động tốt với role checks. Có thể cập nhật dần dần sau.

## ✅ Checklist Setup

- [ ] Đã chạy migration thành công
- [ ] Đã kiểm tra cột permissions trong database
- [ ] Đã test quản lý permissions với ADMIN
- [ ] Đã test permissions với các roles khác nhau
- [ ] Đã đọc file `PERMISSIONS_EXTEND_GUIDE.md` để hiểu cách thêm permission mới

## 🎯 Kết quả mong đợi

Sau khi setup xong:

1. ✅ Admin có thể quản lý permissions cho từng user
2. ✅ Permissions được lưu trong database (cột JSONB)
3. ✅ Hệ thống tự động fallback về default permissions theo role nếu user chưa có custom permissions
4. ✅ Dễ dàng thêm permission mới khi có chức năng mới (xem `PERMISSIONS_EXTEND_GUIDE.md`)

## ❓ Troubleshooting

### Lỗi: "permissions column does not exist"

**Nguyên nhân:** Migration chưa được chạy

**Giải pháp:**
1. Chạy lại migration SQL
2. Kiểm tra file migration có đúng cú pháp không

### Lỗi: Modal permissions không hiển thị

**Nguyên nhân:** 
- File `permissions.js` chưa được load
- Modal chưa được load

**Giải pháp:**
1. Kiểm tra `index.html` có load `permissions.js` không
2. Kiểm tra `components.js` có load `modals-user-permissions.html` không
3. Xem console browser có lỗi JavaScript không

### Lỗi: Permissions không lưu được

**Nguyên nhân:**
- API `update_user_permissions` chưa được implement
- Quyền ADMIN chưa đúng

**Giải pháp:**
1. Kiểm tra API function `supabaseUpdateUserPermissions` trong `js/supabase-api.js`
2. Kiểm tra case `update_user_permissions` trong router API
3. Kiểm tra user đang đăng nhập có role ADMIN không

## 📚 Tài liệu liên quan

- `PERMISSIONS_SYSTEM.md` - Tổng quan về hệ thống phân quyền
- `PERMISSIONS_EXTEND_GUIDE.md` - Hướng dẫn thêm permission mới
- `js/permissions.js` - Helper functions và định nghĩa permissions

