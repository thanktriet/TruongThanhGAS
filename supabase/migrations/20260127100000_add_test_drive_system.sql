-- Migration: Add Test Drive Management System
-- Created: 2026-01-27
-- Description: test_drive_vehicles + test_drive_requests

-- ======================================================
-- 1. BẢNG TEST_DRIVE_VEHICLES
-- ======================================================
CREATE TABLE IF NOT EXISTS test_drive_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bien_so_xe TEXT UNIQUE NOT NULL,
  loai_xe TEXT,
  phien_ban TEXT,
  han_bao_hiem DATE,
  han_dang_kiem DATE,
  odo_hien_tai INTEGER DEFAULT 0,
  tong_quang_duong_da_di INTEGER DEFAULT 0,
  tinh_trang_hien_tai JSONB DEFAULT '{}'::jsonb,
  trang_thai_su_dung TEXT NOT NULL DEFAULT 'ranh' CHECK (trang_thai_su_dung IN ('ranh', 'dang_su_dung', 'tam_khoa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_drive_vehicles_bien_so ON test_drive_vehicles(bien_so_xe);
CREATE INDEX IF NOT EXISTS idx_test_drive_vehicles_trang_thai ON test_drive_vehicles(trang_thai_su_dung);
CREATE INDEX IF NOT EXISTS idx_test_drive_vehicles_han ON test_drive_vehicles(han_bao_hiem, han_dang_kiem);

CREATE TRIGGER update_test_drive_vehicles_updated_at
  BEFORE UPDATE ON test_drive_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ======================================================
-- 2. BẢNG TEST_DRIVE_REQUESTS
-- ======================================================
CREATE TABLE IF NOT EXISTS test_drive_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nguoi_tao TEXT NOT NULL,
  muc_dich_su_dung_xe TEXT,
  thoi_gian_di TIMESTAMP WITH TIME ZONE,
  thoi_gian_ve_du_kien TIMESTAMP WITH TIME ZONE,
  thoi_gian_ve_thuc_te TIMESTAMP WITH TIME ZONE,
  lo_trinh TEXT,
  vehicle_id UUID NOT NULL REFERENCES test_drive_vehicles(id) ON DELETE RESTRICT,
  trang_thai_to_trinh TEXT NOT NULL DEFAULT 'Draft' CHECK (trang_thai_to_trinh IN ('Draft', 'Cho_BKS_Duyet', 'Cho_BGD_Duyet', 'Da_Duyet_Dang_Su_Dung', 'Hoan_Thanh', 'Tu_Choi')),
  current_step INTEGER NOT NULL DEFAULT 0 CHECK (current_step >= 0 AND current_step <= 4),
  status_text TEXT,
  history_log TEXT,
  odo_truoc INTEGER,
  odo_sau INTEGER,
  quang_duong INTEGER,
  pre_check JSONB DEFAULT '{}'::jsonb,
  post_check JSONB DEFAULT '{}'::jsonb,
  approver_step1 TEXT,
  approver_step2 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_drive_requests_nguoi_tao ON test_drive_requests(nguoi_tao);
CREATE INDEX IF NOT EXISTS idx_test_drive_requests_vehicle ON test_drive_requests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_test_drive_requests_current_step ON test_drive_requests(current_step);
CREATE INDEX IF NOT EXISTS idx_test_drive_requests_ngay_tao ON test_drive_requests(ngay_tao DESC);
CREATE INDEX IF NOT EXISTS idx_test_drive_requests_trang_thai ON test_drive_requests(trang_thai_to_trinh);

CREATE TRIGGER update_test_drive_requests_updated_at
  BEFORE UPDATE ON test_drive_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ======================================================
-- 3. GRANT PERMISSIONS
-- ======================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON test_drive_vehicles TO anon, authenticated;
GRANT ALL ON test_drive_requests TO anon, authenticated;
