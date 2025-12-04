-- Migration: Fix step completion - Step hoàn thành là 4, không phải 6
-- Created: 2024-12-04
-- Description: Sửa tất cả tờ trình có current_step = 6 thành 4, và cập nhật constraint

-- ======================================================
-- 1. CẬP NHẬT TẤT CẢ TỜ TRÌNH CÓ STEP 6 THÀNH STEP 4
-- ======================================================
UPDATE approvals 
SET current_step = 4,
    status_text = 'Hoàn tất',
    updated_at = NOW()
WHERE current_step = 6;

-- ======================================================
-- 2. CẬP NHẬT CONSTRAINT ĐỂ CHỈ CHO PHÉP STEP 0-4
-- ======================================================
-- Xóa constraint cũ
ALTER TABLE approvals 
DROP CONSTRAINT IF EXISTS approvals_current_step_check;

-- Tạo constraint mới: chỉ cho phép step 0-4
ALTER TABLE approvals 
ADD CONSTRAINT approvals_current_step_check 
CHECK (current_step >= 0 AND current_step <= 4);

