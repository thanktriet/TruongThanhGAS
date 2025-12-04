-- Migration: Add SALEADMIN role
-- Created: 2024-12-04
-- Description: Thêm role SALEADMIN vào constraint của bảng users

-- ======================================================
-- 1. CẬP NHẬT CONSTRAINT CHO ROLE
-- ======================================================
-- Xóa constraint cũ
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Thêm constraint mới với SALEADMIN
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('ADMIN', 'TVBH', 'SALE', 'TPKD', 'GDKD', 'BKS', 'BGD', 'KETOAN', 'SALEADMIN'));

-- ======================================================
-- 2. CẬP NHẬT COMMENT
-- ======================================================
COMMENT ON COLUMN users.role IS 'Vai trò: ADMIN, TVBH, SALE, TPKD, GDKD, BKS, BGD, KETOAN, SALEADMIN';

