-- Migration: vehicle_inspections, inspection_images, test_drive_approval_logs
-- Mô tả: Bảng kiểm tra xe (5 điểm) + ảnh + audit log theo spec

-- ======================================================
-- 1. VEHICLE_INSPECTIONS (5 điểm kiểm tra mỗi lần pre/post)
-- ======================================================
CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES test_drive_requests(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('pre', 'post')),
  point_key TEXT NOT NULL CHECK (point_key IN ('ben_trai', 'ben_phai', 'phia_truoc', 'phia_sau', 'noi_that')),
  status TEXT NOT NULL CHECK (status IN ('Tot', 'Xe_xuoc_tray_mop_dinh_dinh', 'Xe_do', 'Xe_bao_loi', 'tot', 'xuoc', 'do', 'bao_loi')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_request ON vehicle_inspections(request_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_type ON vehicle_inspections(request_id, inspection_type);

-- ======================================================
-- 2. INSPECTION_IMAGES (ảnh theo từng điểm kiểm tra)
-- ======================================================
CREATE TABLE IF NOT EXISTS inspection_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_inspection_id UUID NOT NULL REFERENCES vehicle_inspections(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspection_images_inspection ON inspection_images(vehicle_inspection_id);

-- ======================================================
-- 3. TEST_DRIVE_APPROVAL_LOGS (audit: ai duyệt, lúc nào, thay đổi gì)
-- ======================================================
CREATE TABLE IF NOT EXISTS test_drive_approval_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES test_drive_requests(id) ON DELETE CASCADE,
  approver_username TEXT,
  approver_role TEXT,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'completed')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_drive_approval_logs_request ON test_drive_approval_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_test_drive_approval_logs_created ON test_drive_approval_logs(created_at DESC);

-- ======================================================
-- 4. GRANT
-- ======================================================
GRANT ALL ON vehicle_inspections TO anon, authenticated;
GRANT ALL ON inspection_images TO anon, authenticated;
GRANT ALL ON test_drive_approval_logs TO anon, authenticated;
