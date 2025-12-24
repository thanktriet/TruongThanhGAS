-- Migration: Add guarantee_bank_coc column to coc_requests
-- Created: 2024-12-15
-- Description: Thêm cột guarantee_bank_coc để lưu ngân hàng bảo lãnh COC (MB Bank, VPBank)

-- Thêm cột guarantee_bank_coc
ALTER TABLE coc_requests ADD COLUMN IF NOT EXISTS guarantee_bank_coc TEXT;

-- Comment
COMMENT ON COLUMN coc_requests.guarantee_bank_coc IS 'Ngân hàng bảo lãnh COC (MB Bank, VPBank) - do SaleAdmin/Kế toán điền';

-- Note: payment_method sẽ được lấy từ orders.payment_method, không cần lưu lại trong coc_requests

