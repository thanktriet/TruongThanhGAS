-- =====================================================
-- QUICK MIGRATION: Add Permissions Column to Users
-- =====================================================
-- Copy và chạy 3 dòng SQL này trên Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Thêm cột permissions
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- 2. Tạo index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_users_permissions ON users USING GIN (permissions);

-- 3. Thêm comment mô tả
COMMENT ON COLUMN users.permissions IS 'Permissions chi tiết của user dạng JSONB. Nếu rỗng {}, sẽ dùng default permissions theo role';

-- =====================================================
-- ✅ XONG! Migration đã hoàn tất
-- =====================================================
-- Kiểm tra bằng cách chạy:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'permissions';
-- =====================================================

