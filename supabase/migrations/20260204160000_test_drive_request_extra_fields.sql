-- Thêm trường thông tin cho form đăng ký sử dụng xe lái thử
ALTER TABLE test_drive_requests
  ADD COLUMN IF NOT EXISTS so_dien_thoai TEXT,
  ADD COLUMN IF NOT EXISTS dia_diem_don TEXT,
  ADD COLUMN IF NOT EXISTS dia_diem_tra TEXT,
  ADD COLUMN IF NOT EXISTS so_km_du_kien INTEGER,
  ADD COLUMN IF NOT EXISTS ghi_chu TEXT;

COMMENT ON COLUMN test_drive_requests.so_dien_thoai IS 'Số điện thoại người đăng ký';
COMMENT ON COLUMN test_drive_requests.dia_diem_don IS 'Địa điểm lấy xe';
COMMENT ON COLUMN test_drive_requests.dia_diem_tra IS 'Địa điểm trả xe';
COMMENT ON COLUMN test_drive_requests.so_km_du_kien IS 'Số km dự kiến đi';
COMMENT ON COLUMN test_drive_requests.ghi_chu IS 'Ghi chú thêm';
