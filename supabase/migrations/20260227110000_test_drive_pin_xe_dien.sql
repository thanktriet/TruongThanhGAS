-- % pin xe điện: lưu khi hoàn trả và hiển thị trong quản lý xe lái thử
-- test_drive_requests: pin khi hoàn trả
ALTER TABLE test_drive_requests ADD COLUMN IF NOT EXISTS pin_sau_hoan_tra INTEGER CHECK (pin_sau_hoan_tra IS NULL OR (pin_sau_hoan_tra >= 0 AND pin_sau_hoan_tra <= 100));
COMMENT ON COLUMN test_drive_requests.pin_sau_hoan_tra IS '% pin xe điện khi hoàn trả (0-100, nullable nếu xe xăng)';

-- test_drive_vehicles: pin hiện tại (cập nhật khi hoàn trả hoặc nhập khi thêm xe)
ALTER TABLE test_drive_vehicles ADD COLUMN IF NOT EXISTS pin_hien_tai INTEGER CHECK (pin_hien_tai IS NULL OR (pin_hien_tai >= 0 AND pin_hien_tai <= 100));
COMMENT ON COLUMN test_drive_vehicles.pin_hien_tai IS '% pin hiện tại (xe điện, 0-100)';
