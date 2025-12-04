-- Migration: Initial Schema for Hệ Thống Phê Duyệt Giá Xe
-- Created: 2024-12-04
-- Description: Tạo các bảng users, approvals, và logs

-- ======================================================
-- 1. BẢNG USERS
-- ======================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  fullname TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TVBH', 'SALE', 'TPKD', 'GDKD', 'BKS', 'BGD', 'KETOAN')),
  need_change_pass BOOLEAN DEFAULT true,
  phone TEXT,
  email TEXT,
  "group" TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho username để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- ======================================================
-- 2. BẢNG APPROVALS (Tờ trình phê duyệt)
-- ======================================================
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requester TEXT NOT NULL,
  contract_code TEXT,
  customer_name TEXT,
  phone TEXT,
  cccd TEXT,
  email TEXT,
  address TEXT,
  car_model TEXT,
  car_version TEXT,
  car_color TEXT,
  vin_no TEXT,
  payment_method TEXT,
  contract_price NUMERIC DEFAULT 0,
  discount_details TEXT,
  discount_amount NUMERIC DEFAULT 0,
  gift_details TEXT,
  gift_amount NUMERIC DEFAULT 0,
  final_price NUMERIC DEFAULT 0,
  current_step INTEGER DEFAULT 0 CHECK (current_step >= 0 AND current_step <= 6),
  status_text TEXT,
  history_log TEXT,
  other_requirements TEXT,
  max_cost_rate NUMERIC,
  productivity_bonus NUMERIC DEFAULT 0,
  approver_step0 TEXT,
  approver_step1 TEXT,
  approver_step2 TEXT,
  approver_step3 TEXT,
  approver_step4 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes cho approvals
CREATE INDEX IF NOT EXISTS idx_approvals_requester ON approvals(requester);
CREATE INDEX IF NOT EXISTS idx_approvals_current_step ON approvals(current_step);
CREATE INDEX IF NOT EXISTS idx_approvals_date ON approvals(date DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_contract_code ON approvals(contract_code);

-- ======================================================
-- 3. BẢNG LOGS (Lịch sử hoạt động)
-- ======================================================
CREATE TABLE IF NOT EXISTS logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "user" TEXT,
  action TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho logs
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs("user");

-- ======================================================
-- 4. FUNCTION: Tự động cập nhật updated_at
-- ======================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho approvals
CREATE TRIGGER update_approvals_updated_at
  BEFORE UPDATE ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ======================================================
-- 5. INSERT DỮ LIỆU MẪU (Users)
-- ======================================================
-- Lưu ý: Password được hash bằng MD5, mật khẩu mặc định là '12345'
-- Hash của '12345' = '827ccb0eea8a706c4c34a16891f84e7b'
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('admin', '827ccb0eea8a706c4c34a16891f84e7b', 'Quản Trị Viên', 'ADMIN', false, '', '', 'HQ', true),
  ('sale1', '827ccb0eea8a706c4c34a16891f84e7b', 'Nguyễn Văn Sale', 'TVBH', true, '', '', 'NHÓM 1', true),
  ('tpkd1', '827ccb0eea8a706c4c34a16891f84e7b', 'Trưởng Phòng KD', 'TPKD', true, '', '', 'TPKD', true),
  ('gdkd1', '827ccb0eea8a706c4c34a16891f84e7b', 'Giám Đốc KD', 'GDKD', true, '', '', 'GDKD', true),
  ('bks1', '827ccb0eea8a706c4c34a16891f84e7b', 'Ban Kiểm Soát', 'BKS', true, '', '', 'BKS', true),
  ('bgd1', '827ccb0eea8a706c4c34a16891f84e7b', 'Tổng Giám Đốc', 'BGD', true, '', '', 'BGD', true),
  ('ketoan1', '827ccb0eea8a706c4c34a16891f84e7b', 'Kế Toán Viên', 'KETOAN', true, '', '', 'KETOAN', true)
ON CONFLICT (username) DO NOTHING;

-- ======================================================
-- 6. ROW LEVEL SECURITY (RLS) - Tùy chọn
-- ======================================================
-- Bật RLS nếu cần bảo mật ở database level
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- ======================================================
-- 7. COMMENTS (Mô tả cho các bảng và cột)
-- ======================================================
COMMENT ON TABLE users IS 'Bảng quản lý người dùng hệ thống';
COMMENT ON TABLE approvals IS 'Bảng lưu trữ tờ trình phê duyệt giá xe';
COMMENT ON TABLE logs IS 'Bảng lưu lịch sử hoạt động hệ thống';

COMMENT ON COLUMN approvals.current_step IS 'Bước hiện tại trong workflow: 0=Chờ TPKD, 1=Chờ GDKD, 2=Chờ BKS, 3=Chờ BGD, 4=Chờ Kế Toán, >=4=Hoàn tất';
COMMENT ON COLUMN users.role IS 'Vai trò: ADMIN, TVBH, SALE, TPKD, GDKD, BKS, BGD, KETOAN';

