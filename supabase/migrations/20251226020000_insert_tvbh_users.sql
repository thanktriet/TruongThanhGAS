-- Migration: Insert TVBH Users from Production List
-- Created: 2025-12-26
-- Description: Tạo tài khoản TVBH cho production theo danh sách thực tế
-- Password mặc định: '123456' -> MD5 hash: 'e10adc3949ba59abbe56e057f20f883e'
-- ⚠️ Tất cả user sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu

-- ======================================================
-- INSERT TVBH USERS
-- ======================================================

INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  -- Nhóm Rạch Giá
  ('hieutg', 'e10adc3949ba59abbe56e057f20f883e', 'Tân Giám Hiếu', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('luanbv', 'e10adc3949ba59abbe56e057f20f883e', 'Bùi Vũ Luân', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('Emdvt', 'e10adc3949ba59abbe56e057f20f883e', 'Đặng Văn Tuấn Em', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('TungVN', 'e10adc3949ba59abbe56e057f20f883e', 'Võ Ngọc Tùng', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('TanNH', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Hoàng Tấn', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('AnhLV', 'e10adc3949ba59abbe56e057f20f883e', 'Lê Việt Anh', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('DucTHT', 'e10adc3949ba59abbe56e057f20f883e', 'Trần Hoàng Thiện Đức', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('AnhQN', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Quốc Anh', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('DuyNT', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Trường Duy', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('TrangNTT', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Thị Thuỳ Trang', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('NhanLH', 'e10adc3949ba59abbe56e057f20f883e', 'Lê Hoàng Nhân', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('HaiLHN', 'e10adc3949ba59abbe56e057f20f883e', 'Lê Hoàng Ngọc Hải', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('HoaiNV', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Văn Hoài', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('NghiaCT', 'e10adc3949ba59abbe56e057f20f883e', 'Cao Trọng Nghĩa', 'TVBH', true, '', '', 'Rạch Giá', true),
  ('ThaoFr', 'e10adc3949ba59abbe56e057f20f883e', 'Thảo (FrNurwahidah)', 'TVBH', true, '', '', 'Rạch Giá', true),
  
  -- Nhóm Phú Quốc
  ('HuuDV', 'e10adc3949ba59abbe56e057f20f883e', 'Dương Văn Hữu', 'TVBH', true, '', '', 'Phú Quốc', true),
  
  -- Nhóm Tân Hiệp
  ('PhucPH', 'e10adc3949ba59abbe56e057f20f883e', 'Phạm Hoàng Phúc', 'TVBH', true, '', '', 'Tân Hiệp', true),
  
  -- Nhóm An Biên
  ('DaiVTP', 'e10adc3949ba59abbe56e057f20f883e', 'Võ Trương Phước Đại', 'TVBH', true, '', '', 'An Biên', true),
  ('NguyenPC', 'e10adc3949ba59abbe56e057f20f883e', 'Phạm Chí Nguyên', 'TVBH', true, '', '', 'An Biên', true),
  
  -- Nhóm Kiên Lương
  ('QuynhPD', 'e10adc3949ba59abbe56e057f20f883e', 'Phan Diễm Quỳnh', 'TVBH', true, '', '', 'Kiên Lương', true),
  ('DungBC', 'e10adc3949ba59abbe56e057f20f883e', 'Bùi Cao Dũng', 'TVBH', true, '', '', 'Kiên Lương', true)
  
ON CONFLICT (username) DO UPDATE SET
  fullname = EXCLUDED.fullname,
  role = EXCLUDED.role,
  "group" = EXCLUDED."group",
  active = EXCLUDED.active,
  -- Giữ nguyên password nếu user đã tồn tại (để tránh reset password của user đã đổi)
  password = CASE 
    WHEN users.need_change_pass = false THEN users.password 
    ELSE EXCLUDED.password 
  END,
  -- Chỉ reset need_change_pass nếu user đang ở trạng thái cần đổi mật khẩu
  need_change_pass = CASE 
    WHEN users.need_change_pass = false THEN false 
    ELSE true 
  END;

-- ======================================================
-- GHI CHÚ
-- ======================================================
-- ✅ Đã tạo 21 tài khoản TVBH
-- ⚠️ Password mặc định: '123456' (hash MD5: e10adc3949ba59abbe56e057f20f883e)
-- ⚠️ Tất cả user sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu
-- ✅ Phân nhóm theo địa điểm: Rạch Giá, Phú Quốc, Tân Hiệp, An Biên, Kiên Lương

