-- Migration: Add COC Requests Table
-- Created: 2024-12-15
-- Description: Tạo bảng coc_requests để quản lý đề nghị cấp COC (Giấy chứng nhận xuất xưởng)

-- ======================================================
-- 1. THÊM VIN_NUMBER VÀO ORDERS (nếu chưa có)
-- ======================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vin_number TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_vin_number ON orders(vin_number);

COMMENT ON COLUMN orders.vin_number IS 'Số khung xe (VIN number)';

-- ======================================================
-- 2. BẢNG COC_REQUESTS
-- ======================================================
CREATE TABLE IF NOT EXISTS coc_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID, -- FK to orders.id (nullable - có thể tạo COC request thủ công không cần order)
  contract_code TEXT NOT NULL, -- Mã đơn hàng (kế thừa từ orders)
  customer_name TEXT NOT NULL, -- Tên khách hàng
  car_model TEXT, -- Loại xe
  car_version TEXT, -- Phiên bản
  car_color TEXT, -- Màu sắc
  vin_number TEXT, -- Số khung
  
  -- Thông tin tài chính (để tính lãi)
  po_number TEXT, -- Số PO (Purchase Order - Đơn đặt hàng)
  import_price NUMERIC DEFAULT 0, -- Giá nhập (Giá vốn)
  payment_method TEXT, -- Phương thức thanh toán (Tiền mặt, Trả góp, Bảo lãnh ngân hàng...)
  guarantee_bank TEXT, -- Ngân hàng bảo lãnh (nếu có)
  principal_amount NUMERIC DEFAULT 0, -- Số tiền gốc dùng để tính lãi (có thể = import_price hoặc giá trị khác)
  
  -- Thông tin thời gian
  request_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày đề nghị
  actual_issue_date DATE, -- Ngày cấp thực tế (SaleAdmin cấp)
  
  -- Upload files từ SaleAdmin (bắt buộc khi cấp COC)
  coc_image_url TEXT, -- URL ảnh COC (Google Drive)
  coc_image_id TEXT, -- Google Drive file ID của ảnh COC
  handover_document_url TEXT, -- URL biên bản bàn giao (Google Drive)
  handover_document_id TEXT, -- Google Drive file ID của biên bản bàn giao
  
  -- File giải ngân từ Kế toán
  disbursement_file_url TEXT, -- File giải ngân (Kế toán upload)
  disbursement_file_id TEXT, -- Google Drive file ID
  
  -- Tính toán lãi
  interest_rate NUMERIC DEFAULT 8.0, -- Lãi suất %/năm (mặc định 8%)
  interest_amount NUMERIC DEFAULT 0, -- Số tiền lãi đã tính
  business_days_delayed INTEGER DEFAULT 0, -- Số ngày làm việc trễ (sau +5 ngày)
  
  -- Workflow status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'disbursed', 'closed')),
  
  -- Users
  requester TEXT NOT NULL, -- FK to users.username (TVBH đề nghị)
  issuer TEXT, -- FK to users.username (SaleAdmin cấp)
  accountant TEXT, -- FK to users.username (Kế toán upload giải ngân)
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_coc_requests_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_coc_requests_requester FOREIGN KEY (requester) REFERENCES users(username) ON DELETE SET NULL,
  CONSTRAINT fk_coc_requests_issuer FOREIGN KEY (issuer) REFERENCES users(username) ON DELETE SET NULL,
  CONSTRAINT fk_coc_requests_accountant FOREIGN KEY (accountant) REFERENCES users(username) ON DELETE SET NULL
);

-- Indexes cho coc_requests
CREATE INDEX IF NOT EXISTS idx_coc_requests_order_id ON coc_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_coc_requests_contract_code ON coc_requests(contract_code);
CREATE INDEX IF NOT EXISTS idx_coc_requests_po_number ON coc_requests(po_number);
CREATE INDEX IF NOT EXISTS idx_coc_requests_requester ON coc_requests(requester);
CREATE INDEX IF NOT EXISTS idx_coc_requests_status ON coc_requests(status);
CREATE INDEX IF NOT EXISTS idx_coc_requests_request_date ON coc_requests(request_date DESC);
CREATE INDEX IF NOT EXISTS idx_coc_requests_pending ON coc_requests(status) WHERE status = 'pending';

-- Trigger cho updated_at
CREATE TRIGGER update_coc_requests_updated_at
  BEFORE UPDATE ON coc_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE coc_requests IS 'Bảng quản lý đề nghị cấp COC (Giấy chứng nhận xuất xưởng)';
COMMENT ON COLUMN coc_requests.po_number IS 'Số PO (Purchase Order - Đơn đặt hàng)';
COMMENT ON COLUMN coc_requests.import_price IS 'Giá nhập (Giá vốn) - dùng để tính lãi';
COMMENT ON COLUMN coc_requests.payment_method IS 'Phương thức thanh toán: Tiền mặt, Trả góp, Bảo lãnh ngân hàng...';
COMMENT ON COLUMN coc_requests.guarantee_bank IS 'Ngân hàng bảo lãnh (nếu phương thức thanh toán là bảo lãnh ngân hàng)';
COMMENT ON COLUMN coc_requests.principal_amount IS 'Số tiền gốc dùng để tính lãi (mặc định = import_price, có thể điều chỉnh)';
COMMENT ON COLUMN coc_requests.status IS 'Trạng thái: pending (chờ cấp), issued (đã cấp), disbursed (đã giải ngân), closed (đã đóng)';
COMMENT ON COLUMN coc_requests.coc_image_url IS 'URL ảnh COC trên Google Drive (bắt buộc khi cấp)';
COMMENT ON COLUMN coc_requests.handover_document_url IS 'URL biên bản bàn giao trên Google Drive (bắt buộc khi cấp)';
COMMENT ON COLUMN coc_requests.business_days_delayed IS 'Số ngày làm việc trễ sau +5 ngày (trừ thứ 7, chủ nhật)';
COMMENT ON COLUMN coc_requests.interest_rate IS 'Lãi suất %/năm (mặc định 8%)';

-- ======================================================
-- 3. GRANT PERMISSIONS
-- ======================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON coc_requests TO anon, authenticated;

