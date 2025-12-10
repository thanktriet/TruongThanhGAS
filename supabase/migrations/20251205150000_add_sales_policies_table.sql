-- Migration: Add Sales Policies Table
-- Created: 2024-12-05
-- Description: Tạo bảng sales_policies để ADMIN quản lý chính sách bán hàng

-- ======================================================
-- 1. BẢNG SALES_POLICIES
-- ======================================================
CREATE TABLE IF NOT EXISTS sales_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- Tên ngắn gọn (ví dụ: "CSBH MLTTVN 3 giảm 4%")
  description TEXT NOT NULL, -- Mô tả đầy đủ chính sách
  display_order INTEGER DEFAULT 0, -- Thứ tự hiển thị
  is_active BOOLEAN DEFAULT true, -- Có đang áp dụng không
  valid_from DATE, -- Ngày bắt đầu hiệu lực
  valid_to DATE, -- Ngày kết thúc hiệu lực
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT, -- Username của người tạo
  updated_by TEXT -- Username của người cập nhật
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sales_policies_name ON sales_policies(name);
CREATE INDEX IF NOT EXISTS idx_sales_policies_display_order ON sales_policies(display_order);
CREATE INDEX IF NOT EXISTS idx_sales_policies_is_active ON sales_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_sales_policies_valid_dates ON sales_policies(valid_from, valid_to);

-- Trigger cho updated_at
CREATE TRIGGER update_sales_policies_updated_at
  BEFORE UPDATE ON sales_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE sales_policies IS 'Bảng quản lý chính sách bán hàng cho HĐMB';
COMMENT ON COLUMN sales_policies.name IS 'Tên ngắn gọn của chính sách (hiển thị trong checkbox)';
COMMENT ON COLUMN sales_policies.description IS 'Mô tả đầy đủ chính sách (giá trị của checkbox)';
COMMENT ON COLUMN sales_policies.display_order IS 'Thứ tự hiển thị trong form';
COMMENT ON COLUMN sales_policies.is_active IS 'Có đang áp dụng không';
COMMENT ON COLUMN sales_policies.valid_from IS 'Ngày bắt đầu hiệu lực';
COMMENT ON COLUMN sales_policies.valid_to IS 'Ngày kết thúc hiệu lực';

-- ======================================================
-- 2. INSERT DỮ LIỆU MẪU
-- ======================================================
INSERT INTO sales_policies (name, description, display_order, is_active, valid_from, valid_to, created_by) VALUES
  ('CSBH MLTTVN 3 giảm 4%', 'Chính sách MÃNH LIỆT TINH THẦN VIỆT NAM - VÌ TƯƠNG LAI XANH LẦN 3: tặng 4% trên giá MSRP giảm giá bằng tiền mặt áp dụng từ 22/05/2025 đến 31/12/2025.', 10, true, '2025-05-22', '2025-12-31', 'admin'),
  ('Quy đổi tiền mặt VF5, Herio biển trắng', 'CSBH Tặng 2 năm bảo hiểm ưu đãi bằng tiền trị giá 12.000.000 VNĐ/xe cho xe VF5 Plus/HerioGreen đối với khách hàng xuất hoá đơn từ 15/08/2025 - 31/12/2025.', 20, true, '2025-08-15', '2025-12-31', 'admin'),
  ('Quy đổi tiền mặt VF3', 'CSBH Tặng 2 năm bảo hiểm ưu đãi bằng tiền trị giá 6.500.000 VNĐ/xe cho xe VF3 đối với khách hàng xuất hoá đơn từ 20/08/2025 - 31/12/2025.', 30, true, '2025-08-20', '2025-12-31', 'admin'),
  ('Quy đổi TM VF5/Herio Green biển vàng', 'CSBH ưu đãi bằng tiền trị giá 12.000.000 VNĐ/xe cho xe VF5 Plus/HerioGreen với mục đích kinh doanh vận tải,mua xe và xuất hoá đơn từ 15/08/2025 - 31/12/2025.', 40, true, '2025-08-15', '2025-12-31', 'admin'),
  ('Miễn phí màu nâng cao VF3 - VF5', 'CSBH ưu đãi miễn phí màu nâng cao VF3, VF5 trị giá 8.000.000 VNĐ đối với xe xuất hoá đơn từ 1/10/2025 đến 31/12/2025.', 50, true, '2025-10-01', '2025-12-31', 'admin'),
  ('Giảm 50tr cho VF7 Plus', 'CSBH ưu đãi giảm 50.000.000 VNĐ cho VF7 Plus xuất hoá đơn từ 3/10/2025.', 60, true, '2025-10-03', '2025-12-31', 'admin'),
  ('CSBH VF8, VF9 VC VinPearl 50tr quy đổi TM', 'CSBH Khách hàng mua xe VF8 hoặc VF9 trong thời gian áp dụng chương trình sẽ nhận được voucher nghỉ dưỡng Vinpearl, có thể quy đổi tiền mặt với giá trị 50.000.000 VNĐ áp dụng từ 1/11/2025 đến 31/12/2025 theo ngày xuất hoá đơn', 70, true, '2025-11-01', '2025-12-31', 'admin'),
  ('CSBH hổ trợ lãi suất CĐX', 'Chính sách ưu đãi lãi suất theo chương trình chuyển đổi xanh áp dụng từ 30/07/2025 đến 31/12/2025.', 80, true, '2025-07-30', '2025-12-31', 'admin'),
  ('CSBH Công an và Quân Đội giảm 3%', 'Chính sách ưu đãi chiết khấu thêm 3% trên giá MSRP dành cho chiến sĩ thuộc Quân đội nhân dân Việt Nam và Công an nhân dân Việt Nam đang công tác trong biên chế chính thức từ 14/10/2025 đến 31/12/2025.', 90, true, '2025-10-14', '2025-12-31', 'admin'),
  ('CSBH giảm 3tr VF3 TC1', 'CSBH ưu đãi giảm giá 3.000.000 vnđ với các xe VF3 tiêu chuẩn 1 áp dụng xuất hoá đơn từ 04/12/2025 đến hết 31/12/2025.', 100, true, '2025-12-04', '2025-12-31', 'admin')
ON CONFLICT DO NOTHING;

