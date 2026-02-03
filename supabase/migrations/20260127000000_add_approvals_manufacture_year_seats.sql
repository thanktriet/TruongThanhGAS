-- Migration: Add manufacture_year and seats to approvals (tờ trình)
-- Description: Cho phép nhập và sửa năm sản xuất, số chỗ ngồi trong tờ trình (giống mã đơn hàng và số VIN)

ALTER TABLE approvals ADD COLUMN IF NOT EXISTS manufacture_year INTEGER;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS seats INTEGER;

COMMENT ON COLUMN approvals.manufacture_year IS 'Năm sản xuất xe';
COMMENT ON COLUMN approvals.seats IS 'Số chỗ ngồi';
