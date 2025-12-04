-- Migration: Sample Users for All Roles
-- Created: 2024-12-04
-- Description: Tạo tài khoản mẫu cho tất cả các role để quản lý luồng thông tin và phê duyệt
-- Password mặc định: '12345' -> MD5 hash: '827ccb0eea8a706c4c34a16891f84e7b'

-- ======================================================
-- 1. TÀI KHOẢN ADMIN
-- ======================================================
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('admin', '827ccb0eea8a706c4c34a16891f84e7b', 'Quản Trị Viên', 'ADMIN', false, '0901234567', 'admin@vinfast.vn', 'HQ', true)
ON CONFLICT (username) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  fullname = EXCLUDED.fullname,
  role = EXCLUDED.role;

-- ======================================================
-- 2. TÀI KHOẢN TVBH (Tư Vấn Bán Hàng) - 5 tài khoản
-- ======================================================
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('tvbh1', '827ccb0eea8a706c4c34a16891f84e7b', 'Nguyễn Văn An', 'TVBH', true, '0912345678', 'tvbh1@vinfast.vn', 'NHÓM 1', true),
  ('tvbh2', '827ccb0eea8a706c4c34a16891f84e7b', 'Trần Thị Bình', 'TVBH', true, '0923456789', 'tvbh2@vinfast.vn', 'NHÓM 1', true),
  ('tvbh3', '827ccb0eea8a706c4c34a16891f84e7b', 'Lê Văn Cường', 'TVBH', true, '0934567890', 'tvbh3@vinfast.vn', 'NHÓM 2', true),
  ('tvbh4', '827ccb0eea8a706c4c34a16891f84e7b', 'Phạm Thị Dung', 'TVBH', true, '0945678901', 'tvbh4@vinfast.vn', 'NHÓM 2', true),
  ('tvbh5', '827ccb0eea8a706c4c34a16891f84e7b', 'Hoàng Văn Em', 'TVBH', true, '0956789012', 'tvbh5@vinfast.vn', 'NHÓM 3', true)
ON CONFLICT (username) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  fullname = EXCLUDED.fullname,
  role = EXCLUDED.role,
  "group" = EXCLUDED."group";

-- ======================================================
-- 3. TÀI KHOẢN TPKD (Trưởng Phòng Kinh Doanh) - 3 tài khoản
-- ======================================================
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('tpkd1', '827ccb0eea8a706c4c34a16891f84e7b', 'Ngô Văn Phong', 'TPKD', true, '0967890123', 'tpkd1@vinfast.vn', 'TPKD', true),
  ('tpkd2', '827ccb0eea8a706c4c34a16891f84e7b', 'Đỗ Thị Quyên', 'TPKD', true, '0978901234', 'tpkd2@vinfast.vn', 'TPKD', true),
  ('tpkd3', '827ccb0eea8a706c4c34a16891f84e7b', 'Võ Văn Rạng', 'TPKD', true, '0989012345', 'tpkd3@vinfast.vn', 'TPKD', true)
ON CONFLICT (username) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  fullname = EXCLUDED.fullname,
  role = EXCLUDED.role,
  "group" = EXCLUDED."group";

-- ======================================================
-- 4. TÀI KHOẢN GDKD (Giám Đốc Kinh Doanh) - 2 tài khoản
-- ======================================================
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('gdkd1', '827ccb0eea8a706c4c34a16891f84e7b', 'Bùi Văn Sơn', 'GDKD', true, '0990123456', 'gdkd1@vinfast.vn', 'GDKD', true),
  ('gdkd2', '827ccb0eea8a706c4c34a16891f84e7b', 'Trương Thị Tuyết', 'GDKD', true, '0911234567', 'gdkd2@vinfast.vn', 'GDKD', true)
ON CONFLICT (username) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  fullname = EXCLUDED.fullname,
  role = EXCLUDED.role,
  "group" = EXCLUDED."group";

-- ======================================================
-- 5. TÀI KHOẢN BGD (Ban Giám Đốc) - 2 tài khoản
-- ======================================================
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('bgd1', '827ccb0eea8a706c4c34a16891f84e7b', 'Lý Văn Uyên', 'BGD', true, '0922345678', 'bgd1@vinfast.vn', 'BGD', true),
  ('bgd2', '827ccb0eea8a706c4c34a16891f84e7b', 'Đinh Thị Vinh', 'BGD', true, '0933456789', 'bgd2@vinfast.vn', 'BGD', true)
ON CONFLICT (username) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  fullname = EXCLUDED.fullname,
  role = EXCLUDED.role,
  "group" = EXCLUDED."group";

-- ======================================================
-- 6. TÀI KHOẢN BKS (Ban Kiểm Soát) - 2 tài khoản
-- ======================================================
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('bks1', '827ccb0eea8a706c4c34a16891f84e7b', 'Phan Văn Xuân', 'BKS', true, '0944567890', 'bks1@vinfast.vn', 'BKS', true),
  ('bks2', '827ccb0eea8a706c4c34a16891f84e7b', 'Vũ Thị Yến', 'BKS', true, '0955678901', 'bks2@vinfast.vn', 'BKS', true)
ON CONFLICT (username) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  fullname = EXCLUDED.fullname,
  role = EXCLUDED.role,
  "group" = EXCLUDED."group";

-- ======================================================
-- 7. TÀI KHOẢN SALEADMIN (Quản lý cấp mã đơn hàng) - 2 tài khoản
-- ======================================================
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('saleadmin1', '827ccb0eea8a706c4c34a16891f84e7b', 'Đặng Văn Anh', 'SALEADMIN', true, '0966789012', 'saleadmin1@vinfast.vn', 'SALEADMIN', true),
  ('saleadmin2', '827ccb0eea8a706c4c34a16891f84e7b', 'Bùi Thị Bảo', 'SALEADMIN', true, '0977890123', 'saleadmin2@vinfast.vn', 'SALEADMIN', true)
ON CONFLICT (username) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  fullname = EXCLUDED.fullname,
  role = EXCLUDED.role,
  "group" = EXCLUDED."group";

-- ======================================================
-- 8. TÀI KHOẢN KETOAN (Kế Toán) - 2 tài khoản
-- ======================================================
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('ketoan1', '827ccb0eea8a706c4c34a16891f84e7b', 'Nguyễn Văn Chiến', 'KETOAN', true, '0988901234', 'ketoan1@vinfast.vn', 'KETOAN', true),
  ('ketoan2', '827ccb0eea8a706c4c34a16891f84e7b', 'Trần Thị Dung', 'KETOAN', true, '0999012345', 'ketoan2@vinfast.vn', 'KETOAN', true)
ON CONFLICT (username) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  fullname = EXCLUDED.fullname,
  role = EXCLUDED.role,
  "group" = EXCLUDED."group";

-- ======================================================
-- TỔNG KẾT
-- ======================================================
-- Tổng số tài khoản đã tạo:
-- - 1 ADMIN
-- - 5 TVBH
-- - 3 TPKD
-- - 2 GDKD
-- - 2 BGD
-- - 2 BKS
-- - 2 SALEADMIN
-- - 2 KETOAN
-- TỔNG: 19 tài khoản

