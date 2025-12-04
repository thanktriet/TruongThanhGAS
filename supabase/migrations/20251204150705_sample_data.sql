-- Migration: Sample Data for Testing
-- Created: 2024-12-04
-- Description: Thêm dữ liệu mẫu cho users, approvals, và contracts

-- ======================================================
-- 1. INSERT THÊM USERS MẪU (nếu chưa có)
-- ======================================================
-- Password: '12345' -> MD5 hash: '827ccb0eea8a706c4c34a16891f84e7b'
INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  ('admin', '827ccb0eea8a706c4c34a16891f84e7b', 'Quản Trị Viên', 'ADMIN', false, '0901234567', 'admin@vinfast.vn', 'HQ', true),
  ('sale1', '827ccb0eea8a706c4c34a16891f84e7b', 'Nguyễn Văn Sale', 'TVBH', true, '0912345678', 'sale1@vinfast.vn', 'NHÓM 1', true),
  ('sale2', '827ccb0eea8a706c4c34a16891f84e7b', 'Trần Thị Sale', 'TVBH', true, '0923456789', 'sale2@vinfast.vn', 'NHÓM 2', true),
  ('tpkd1', '827ccb0eea8a706c4c34a16891f84e7b', 'Lê Văn TPKD', 'TPKD', true, '0934567890', 'tpkd1@vinfast.vn', 'TPKD', true),
  ('tpkd2', '827ccb0eea8a706c4c34a16891f84e7b', 'Phạm Thị TPKD', 'TPKD', true, '0945678901', 'tpkd2@vinfast.vn', 'TPKD', true),
  ('gdkd1', '827ccb0eea8a706c4c34a16891f84e7b', 'Hoàng Văn GDKD', 'GDKD', true, '0956789012', 'gdkd1@vinfast.vn', 'GDKD', true),
  ('bks1', '827ccb0eea8a706c4c34a16891f84e7b', 'Ngô Văn BKS', 'BKS', true, '0967890123', 'bks1@vinfast.vn', 'BKS', true),
  ('bgd1', '827ccb0eea8a706c4c34a16891f84e7b', 'Đỗ Thị BGD', 'BGD', true, '0978901234', 'bgd1@vinfast.vn', 'BGD', true),
  ('ketoan1', '827ccb0eea8a706c4c34a16891f84e7b', 'Võ Văn Kế Toán', 'KETOAN', true, '0989012345', 'ketoan1@vinfast.vn', 'KETOAN', true)
ON CONFLICT (username) DO UPDATE SET
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  fullname = EXCLUDED.fullname;

-- ======================================================
-- 2. INSERT SAMPLE APPROVALS
-- ======================================================
INSERT INTO approvals (
  id, date, requester, contract_code, customer_name, phone, cccd, email, address,
  car_model, car_version, car_color, vin_no, payment_method,
  contract_price, discount_details, discount_amount, gift_details, gift_amount, final_price,
  current_step, status_text, history_log, other_requirements, max_cost_rate, productivity_bonus,
  approver_step0, approver_step1, approver_step2, approver_step3, approver_step4
) VALUES
  -- Đơn 1: Đang chờ TPKD duyệt (step 0)
  (
    'APP001',
    NOW() - INTERVAL '2 days',
    'sale1',
    'S10601234',
    'Nguyễn Văn A',
    '0909123456',
    '079123456789',
    'nguyenvana@gmail.com',
    '123 Đường ABC, Quận 1, TP.HCM',
    'VF 5 Plus',
    'Plus',
    'Trắng',
    'LFV2B23R5R1234567',
    'Tiền mặt',
    420000000,
    'Giảm giá khuyến mãi tháng 12',
    20000000,
    'Bộ sàn lót, Chụp bánh xe',
    5000000,
    405000000,
    0,
    'Chờ TPKD duyệt',
    '2024-12-02 10:00:00 - sale1: Tạo đơn\n',
    'Khách hàng yêu cầu giao xe trong vòng 7 ngày',
    NULL,
    30000000,
    'tpkd1',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  -- Đơn 2: Đang chờ GDKD duyệt (step 1)
  (
    'APP002',
    NOW() - INTERVAL '5 days',
    'sale2',
    'S10601235',
    'Trần Thị B',
    '0912345678',
    '079234567890',
    'tranthib@gmail.com',
    '456 Đường XYZ, Quận 2, TP.HCM',
    'VF 8',
    'Eco',
    'Đen',
    'LFV2B23R5R2345678',
    'Trả góp',
    850000000,
    'Giảm giá đặc biệt cho khách VIP',
    50000000,
    'Cửa sổ trời, Ghế da cao cấp',
    15000000,
    815000000,
    1,
    'Chờ GDKD duyệt',
    '2024-11-29 14:30:00 - sale2: Tạo đơn\n2024-11-29 15:00:00 - tpkd1: Đã duyệt\n',
    'Khách hàng cần hỗ trợ thủ tục trả góp',
    NULL,
    40000000,
    'tpkd1',
    'gdkd1',
    NULL,
    NULL,
    NULL
  ),
  -- Đơn 3: Đã hoàn thành
  (
    'APP003',
    NOW() - INTERVAL '15 days',
    'sale1',
    'S10601230',
    'Lê Văn C',
    '0923456789',
    '079345678901',
    'levanc@gmail.com',
    '789 Đường DEF, Quận 3, TP.HCM',
    'VF 6',
    'Plus',
    'Xanh',
    'LFV2B23R5R3456789',
    'Tiền mặt',
    650000000,
    'Giảm giá khuyến mãi',
    30000000,
    'Phụ kiện cao cấp',
    10000000,
    630000000,
    6,
    'Đã hoàn thành',
    '2024-11-19 09:00:00 - sale1: Tạo đơn\n2024-11-19 10:00:00 - tpkd1: Đã duyệt\n2024-11-19 14:00:00 - gdkd1: Đã duyệt\n2024-11-20 09:00:00 - bks1: Đã duyệt\n2024-11-20 15:00:00 - bgd1: Đã duyệt\n2024-11-21 10:00:00 - ketoan1: Đã duyệt\n',
    'Khách hàng hài lòng với dịch vụ',
    NULL,
    35000000,
    'tpkd1',
    'gdkd1',
    'bks1',
    'bgd1',
    'ketoan1'
  ),
  -- Đơn 4: Đã từ chối ở bước TPKD
  (
    'APP004',
    NOW() - INTERVAL '3 days',
    'sale2',
    'S10601236',
    'Phạm Thị D',
    '0934567890',
    '079456789012',
    'phamthid@gmail.com',
    '321 Đường GHI, Quận 7, TP.HCM',
    'VF 5 Plus',
    'Eco',
    'Bạc',
    'LFV2B23R5R4567890',
    'Tiền mặt',
    380000000,
    'Giảm giá ưu đãi',
    15000000,
    'Bộ phụ kiện cơ bản',
    3000000,
    368000000,
    0,
    'Đã từ chối - Trả về cho người tạo chỉnh sửa | Lý do: Giá giảm quá nhiều, không phù hợp',
    '2024-12-01 11:00:00 - sale2: Tạo đơn\n2024-12-01 14:00:00 - tpkd1: Từ chối - Giá giảm quá nhiều, không phù hợp\n',
    'Khách hàng yêu cầu giảm giá thêm',
    NULL,
    28000000,
    'tpkd1',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  -- Đơn 5: Đang chờ BKS duyệt (step 2)
  (
    'APP005',
    NOW() - INTERVAL '1 day',
    'sale1',
    'S10601237',
    'Hoàng Văn E',
    '0945678901',
    '079567890123',
    'hoangvane@gmail.com',
    '654 Đường JKL, Quận Bình Thạnh, TP.HCM',
    'VF 8',
    'Plus',
    'Trắng',
    'LFV2B23R5R5678901',
    'Trả góp',
    920000000,
    'Giảm giá cho khách hàng thân thiết',
    40000000,
    'Gói phụ kiện cao cấp, Bảo hiểm',
    20000000,
    900000000,
    2,
    'Chờ BKS duyệt',
    '2024-12-03 08:00:00 - sale1: Tạo đơn\n2024-12-03 10:00:00 - tpkd1: Đã duyệt\n2024-12-03 15:00:00 - gdkd1: Đã duyệt\n',
    'Khách hàng đã từng mua xe ở đây',
    NULL,
    45000000,
    'tpkd1',
    'gdkd1',
    'bks1',
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ======================================================
-- 3. TẠO BẢNG CONTRACTS (nếu chưa có) và INSERT SAMPLE DATA
-- ======================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_code TEXT UNIQUE NOT NULL,
  tvbh TEXT,
  name TEXT,
  phone TEXT,
  cccd TEXT,
  issue_date DATE,
  issue_place TEXT,
  email TEXT,
  car_model TEXT,
  car_version TEXT,
  car_color TEXT,
  payment TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_contract_code ON contracts(contract_code);

-- Trigger cho updated_at
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- INSERT SAMPLE CONTRACTS
INSERT INTO contracts (
  contract_code, tvbh, name, phone, cccd, issue_date, issue_place, email,
  car_model, car_version, car_color, payment, address
) VALUES
  (
    'S10601234',
    'sale1',
    'Nguyễn Văn A',
    '0909123456',
    '079123456789',
    '1990-01-15',
    'CA TP.HCM',
    'nguyenvana@gmail.com',
    'VF 5 Plus',
    'Plus',
    'Trắng',
    'Tiền mặt',
    '123 Đường ABC, Quận 1, TP.HCM'
  ),
  (
    'S10601235',
    'sale2',
    'Trần Thị B',
    '0912345678',
    '079234567890',
    '1985-06-20',
    'CA TP.HCM',
    'tranthib@gmail.com',
    'VF 8',
    'Eco',
    'Đen',
    'Trả góp',
    '456 Đường XYZ, Quận 2, TP.HCM'
  ),
  (
    'S10601230',
    'sale1',
    'Lê Văn C',
    '0923456789',
    '079345678901',
    '1992-03-10',
    'CA TP.HCM',
    'levanc@gmail.com',
    'VF 6',
    'Plus',
    'Xanh',
    'Tiền mặt',
    '789 Đường DEF, Quận 3, TP.HCM'
  ),
  (
    'S10601236',
    'sale2',
    'Phạm Thị D',
    '0934567890',
    '079456789012',
    '1988-11-25',
    'CA TP.HCM',
    'phamthid@gmail.com',
    'VF 5 Plus',
    'Eco',
    'Bạc',
    'Tiền mặt',
    '321 Đường GHI, Quận 7, TP.HCM'
  ),
  (
    'S10601237',
    'sale1',
    'Hoàng Văn E',
    '0945678901',
    '079567890123',
    '1995-08-05',
    'CA TP.HCM',
    'hoangvane@gmail.com',
    'VF 8',
    'Plus',
    'Trắng',
    'Trả góp',
    '654 Đường JKL, Quận Bình Thạnh, TP.HCM'
  )
ON CONFLICT (contract_code) DO NOTHING;

-- ======================================================
-- 4. INSERT SAMPLE LOGS
-- ======================================================
INSERT INTO logs ("user", action, details) VALUES
  ('sale1', 'CREATE_REQUEST', 'Tạo tờ trình APP001'),
  ('tpkd1', 'APPROVE', 'Duyệt tờ trình APP002'),
  ('sale2', 'CREATE_REQUEST', 'Tạo tờ trình APP002'),
  ('gdkd1', 'APPROVE', 'Duyệt tờ trình APP002'),
  ('tpkd1', 'REJECT', 'Từ chối tờ trình APP004 - Giá giảm quá nhiều'),
  ('sale1', 'CREATE_REQUEST', 'Tạo tờ trình APP005'),
  ('admin', 'SYSTEM', 'Hệ thống đã được khởi tạo với sample data');

