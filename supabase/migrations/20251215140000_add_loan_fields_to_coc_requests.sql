-- Migration: Add loan fields to coc_requests table
-- Created: 2024-12-15
-- Description: Thêm các cột loan_bank_name và loan_amount để lưu thông tin vay khi phương thức thanh toán là Trả góp

-- Thêm cột loan_bank_name (tên ngân hàng cho vay)
ALTER TABLE coc_requests ADD COLUMN IF NOT EXISTS loan_bank_name TEXT;

-- Thêm cột loan_amount (số tiền vay)
ALTER TABLE coc_requests ADD COLUMN IF NOT EXISTS loan_amount NUMERIC DEFAULT 0;

-- Comments
COMMENT ON COLUMN coc_requests.loan_bank_name IS 'Tên ngân hàng cho vay (chỉ điền khi phương thức thanh toán là Trả góp)';
COMMENT ON COLUMN coc_requests.loan_amount IS 'Số tiền vay (chỉ điền khi phương thức thanh toán là Trả góp)';

