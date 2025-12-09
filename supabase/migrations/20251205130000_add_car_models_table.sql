-- Migration: Add Car Models Table
-- Created: 2024-12-05
-- Description: Tạo bảng car_models để ADMIN quản lý danh sách dòng xe

-- ======================================================
-- 1. BẢNG CAR_MODELS
-- ======================================================
CREATE TABLE IF NOT EXISTS car_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- Tên dòng xe (ví dụ: VF 5 Plus, VF 8, VF 9...)
  display_order INTEGER DEFAULT 0, -- Thứ tự hiển thị
  is_active BOOLEAN DEFAULT true, -- Có đang sử dụng không
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT, -- Username của người tạo
  updated_by TEXT -- Username của người cập nhật
);

-- Indexes cho car_models
CREATE INDEX IF NOT EXISTS idx_car_models_name ON car_models(name);
CREATE INDEX IF NOT EXISTS idx_car_models_display_order ON car_models(display_order);
CREATE INDEX IF NOT EXISTS idx_car_models_is_active ON car_models(is_active);

-- Trigger cho updated_at
CREATE TRIGGER update_car_models_updated_at
  BEFORE UPDATE ON car_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE car_models IS 'Bảng quản lý danh sách dòng xe cho báo cáo';
COMMENT ON COLUMN car_models.name IS 'Tên dòng xe (ví dụ: VF 5 Plus, VF 6, VF 7, VF 8, VF 9, VF e34)';
COMMENT ON COLUMN car_models.display_order IS 'Thứ tự hiển thị trong form báo cáo';
COMMENT ON COLUMN car_models.is_active IS 'Có đang sử dụng trong báo cáo không';

-- ======================================================
-- 2. INSERT DỮ LIỆU MẪU
-- ======================================================
INSERT INTO car_models (name, display_order, is_active, created_by) VALUES
  ('VF 5 Plus', 1, true, 'admin'),
  ('VF 6', 2, true, 'admin'),
  ('VF 7', 3, true, 'admin'),
  ('VF 8', 4, true, 'admin'),
  ('VF 9', 5, true, 'admin'),
  ('VF e34', 6, true, 'admin')
ON CONFLICT (name) DO NOTHING;

