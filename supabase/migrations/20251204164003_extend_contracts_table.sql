-- Migration: Extend Contracts Table
-- Created: 2024-12-04
-- Description: Mở rộng bảng contracts với các trường cần thiết từ app1 (HĐMB)

-- ======================================================
-- 1. THÊM CÁC CỘT MỚI VÀO BẢNG CONTRACTS
-- ======================================================
-- Thêm các trường từ form tạo HĐMB
-- Lưu ý: contract_code đã có sẵn, sẽ dùng làm so_hop_dong
ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS ngay_ky DATE,
  ADD COLUMN IF NOT EXISTS tien_coc NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chinh_sach_ban_hang TEXT,
  ADD COLUMN IF NOT EXISTS so_luong INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS don_gia NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thanh_tien NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tien_dot_2_TT NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tien_dot_2_TG NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tien_dot_3 NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_url TEXT, -- URL của file Google Docs HĐMB
  ADD COLUMN IF NOT EXISTS created_by TEXT; -- FK to users.username

-- Tạo index cho các trường mới
CREATE INDEX IF NOT EXISTS idx_contracts_ngay_ky ON contracts(ngay_ky DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON contracts(created_by);

-- Comments
COMMENT ON COLUMN contracts.ngay_ky IS 'Ngày ký hợp đồng';
COMMENT ON COLUMN contracts.tien_coc IS 'Tiền cọc';
COMMENT ON COLUMN contracts.chinh_sach_ban_hang IS 'Chính sách bán hàng áp dụng';
COMMENT ON COLUMN contracts.contract_url IS 'URL của file Google Docs hợp đồng mua bán';

