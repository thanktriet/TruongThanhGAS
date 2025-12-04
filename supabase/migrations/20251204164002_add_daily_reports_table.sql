-- Migration: Add Daily Reports Table
-- Created: 2024-12-04
-- Description: Tạo bảng daily_reports để lưu báo cáo ngày của TVBH

-- ======================================================
-- 1. BẢNG DAILY_REPORTS
-- ======================================================
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  tvbh TEXT NOT NULL, -- FK to users.username
  "group" TEXT,
  car_model TEXT, -- NULL nếu là KHTN, hoặc tên dòng xe
  khtn NUMERIC DEFAULT 0, -- Khách hàng tiếp nhận
  hop_dong NUMERIC DEFAULT 0, -- Số hợp đồng ký
  xhd NUMERIC DEFAULT 0, -- Số xuất hóa đơn
  doanh_thu NUMERIC DEFAULT 0, -- Doanh thu
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_daily_reports_tvbh FOREIGN KEY (tvbh) REFERENCES users(username) ON DELETE SET NULL
);

-- Indexes cho daily_reports
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_tvbh ON daily_reports(tvbh);
CREATE INDEX IF NOT EXISTS idx_daily_reports_group ON daily_reports("group");
CREATE INDEX IF NOT EXISTS idx_daily_reports_date_tvbh ON daily_reports(date DESC, tvbh);
CREATE INDEX IF NOT EXISTS idx_daily_reports_car_model ON daily_reports(car_model);

-- Trigger cho updated_at
CREATE TRIGGER update_daily_reports_updated_at
  BEFORE UPDATE ON daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE daily_reports IS 'Bảng lưu báo cáo ngày của TVBH (KHTN, HĐ, XHĐ, Doanh thu theo từng dòng xe)';
COMMENT ON COLUMN daily_reports.car_model IS 'Tên dòng xe (ví dụ: VF8, VF9...) hoặc NULL nếu là báo cáo KHTN';
COMMENT ON COLUMN daily_reports.khtn IS 'Số khách hàng tiếp nhận';
COMMENT ON COLUMN daily_reports.hop_dong IS 'Số hợp đồng đã ký';
COMMENT ON COLUMN daily_reports.xhd IS 'Số hóa đơn đã xuất';
COMMENT ON COLUMN daily_reports.doanh_thu IS 'Doanh thu (VND)';

