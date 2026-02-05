-- nguoi_tao = requester_fullname (họ tên), thêm requester_username cho logic phân quyền
ALTER TABLE test_drive_requests ADD COLUMN IF NOT EXISTS requester_username TEXT;
-- Cập nhật dữ liệu cũ: nếu nguoi_tao đang là username thì copy sang requester_username, nguoi_tao giữ nguyên (sẽ dùng fullname khi có)
UPDATE test_drive_requests SET requester_username = nguoi_tao WHERE requester_username IS NULL AND nguoi_tao IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_test_drive_requests_requester_username ON test_drive_requests(requester_username);
