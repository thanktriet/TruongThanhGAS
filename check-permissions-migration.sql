-- =====================================================
-- SCRIPT KIỂM TRA MIGRATION PERMISSIONS
-- =====================================================
-- Chạy script này trên Supabase Dashboard > SQL Editor
-- để kiểm tra xem migration đã chạy thành công chưa
-- =====================================================

-- 1. Kiểm tra cột permissions
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'permissions';

-- 2. Kiểm tra index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users' 
  AND indexname = 'idx_users_permissions';

-- 3. Kiểm tra comment
SELECT 
    obj_description(c.oid) as column_comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid
WHERE c.relname = 'users' 
  AND a.attname = 'permissions'
  AND a.attnum > 0
  AND NOT a.attisdropped;

-- =====================================================
-- KẾT QUẢ MONG ĐỢI:
-- =====================================================
-- 1. Cột permissions: jsonb, default '{}'::jsonb
-- 2. Index: idx_users_permissions tồn tại
-- 3. Comment: Có mô tả về permissions
-- =====================================================

