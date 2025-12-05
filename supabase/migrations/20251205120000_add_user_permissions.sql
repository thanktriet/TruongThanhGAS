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

