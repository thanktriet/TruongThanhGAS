# 🚀 HƯỚNG DẪN CHẠY MIGRATION PERMISSIONS

## 📋 Cách 1: Chạy SQL trực tiếp trên Supabase Dashboard (DỄ NHẤT - KHUYÊN DÙNG)

### Bước 1: Mở Supabase Dashboard

1. Truy cập: https://supabase.com/dashboard
2. Đăng nhập tài khoản của bạn
3. Chọn project: **knrnlfsokkrtpvtkuuzr** (hoặc project của bạn)

### Bước 2: Mở SQL Editor

1. Click vào **SQL Editor** ở menu bên trái
2. Click nút **New Query** (màu xanh)

### Bước 3: Copy và chạy SQL

**Copy toàn bộ nội dung dưới đây:**

```sql
-- Migration: Add permissions column to users table
-- Created: 2024-12-05
-- Description: Thêm cột permissions JSONB để lưu quyền chi tiết cho từng user

-- ======================================================
-- 1. THÊM CỘT PERMISSIONS
-- ======================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- ======================================================
-- 2. TẠO INDEX CHO PERMISSIONS (GIN index cho JSONB)
-- ======================================================
CREATE INDEX IF NOT EXISTS idx_users_permissions ON users USING GIN (permissions);

-- ======================================================
-- 3. CẬP NHẬT COMMENT
-- ======================================================
COMMENT ON COLUMN users.permissions IS 'Permissions chi tiết của user dạng JSONB. Nếu rỗng {}, sẽ dùng default permissions theo role';
```

4. Paste vào SQL Editor
5. Click nút **Run** (hoặc nhấn `Ctrl+Enter` / `Cmd+Enter`)

### Bước 4: Kiểm tra kết quả

Bạn sẽ thấy thông báo:
```
Success. No rows returned
```

### Bước 5: Verify migration đã chạy thành công

Chạy query này để kiểm tra:

```sql
-- Kiểm tra cột permissions đã tồn tại
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'permissions';

-- Kiểm tra index
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'users' AND indexname = 'idx_users_permissions';
```

**Kết quả mong đợi:**
- Cột `permissions` với kiểu `jsonb` và default `'{}'::jsonb`
- Index `idx_users_permissions` đã tồn tại

---

## 📋 Cách 2: Sử dụng Supabase CLI (Nếu đã setup CLI)

### Bước 1: Đảm bảo đã login

```bash
supabase login
```

### Bước 2: Link project (nếu chưa)

```bash
supabase link --project-ref knrnlfsokkrtpvtkuuzr
```

### Bước 3: Push migration

```bash
supabase db push
```

---

## 📋 Cách 3: Sử dụng script tự động

### Nếu có file `push-to-supabase.sh`:

```bash
chmod +x push-to-supabase.sh
./push-to-supabase.sh
```

---

## ✅ Sau khi migration thành công

### 1. Kiểm tra trên Database

Vào **Database** > **Tables** > **users** và xem:
- Cột `permissions` đã xuất hiện
- Kiểu dữ liệu là `jsonb`
- Giá trị mặc định là `{}`

### 2. Test trên ứng dụng

1. Đăng nhập với ADMIN
2. Vào tab **"Quản Lý Users"**
3. Kiểm tra có button **"Quyền"** (màu tím) ở cột "Hành động"
4. Click vào button "Quyền" để test modal

---

## ❓ Troubleshooting

### Lỗi: "column already exists"

**Nguyên nhân:** Migration đã được chạy rồi

**Giải pháp:** 
- Migration đã thành công, không cần làm gì thêm
- Hoặc bỏ qua lỗi này

### Lỗi: "permission denied" hoặc "access denied"

**Nguyên nhân:** Không có quyền thực hiện ALTER TABLE

**Giải pháp:**
- Đảm bảo đang dùng tài khoản có quyền Admin/owner của project
- Hoặc liên hệ admin của project

### Lỗi: "relation 'users' does not exist"

**Nguyên nhân:** Bảng users chưa được tạo

**Giải pháp:**
- Kiểm tra xem bảng users đã tồn tại chưa
- Chạy các migration trước đó nếu cần

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra lại các bước trên
2. Xem log lỗi trong SQL Editor
3. Kiểm tra file migration: `supabase/migrations/20251205120000_add_user_permissions.sql`

---

## 🎯 Quick Copy SQL

Nếu bạn muốn copy nhanh SQL để chạy:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_users_permissions ON users USING GIN (permissions);
COMMENT ON COLUMN users.permissions IS 'Permissions chi tiết của user dạng JSONB. Nếu rỗng {}, sẽ dùng default permissions theo role';
```

**Copy 3 dòng trên và chạy là đủ!**

