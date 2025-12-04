-- Migration: Add Orders Table
-- Created: 2024-12-04
-- Description: Tạo bảng orders để lưu đơn hàng do TVBH tạo (chưa có mã)

-- ======================================================
-- 1. BẢNG ORDERS
-- ======================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester TEXT NOT NULL, -- FK to users.username (TVBH tạo đơn)
  customer_cccd TEXT, -- FK to customers.cccd
  car_model TEXT,
  car_version TEXT,
  car_color TEXT,
  payment_method TEXT,
  contract_code TEXT UNIQUE, -- Mã đơn hàng (số hợp đồng) - được SaleAdmin cấp
  assigned_sale TEXT, -- FK to users.username (Sale được giao sau khi có mã)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed')),
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of file URLs/names
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraints sẽ được thêm sau khi có bảng customers
  CONSTRAINT fk_orders_requester FOREIGN KEY (requester) REFERENCES users(username) ON DELETE SET NULL,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_cccd) REFERENCES customers(cccd) ON DELETE SET NULL,
  CONSTRAINT fk_orders_assigned_sale FOREIGN KEY (assigned_sale) REFERENCES users(username) ON DELETE SET NULL
);

-- Indexes cho orders
CREATE INDEX IF NOT EXISTS idx_orders_requester ON orders(requester);
CREATE INDEX IF NOT EXISTS idx_orders_customer_cccd ON orders(customer_cccd);
CREATE INDEX IF NOT EXISTS idx_orders_contract_code ON orders(contract_code);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_sale ON orders(assigned_sale);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_pending ON orders(status) WHERE status = 'pending';

-- Trigger cho updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE orders IS 'Bảng lưu đơn hàng do TVBH tạo, chưa có mã đơn hàng hoặc đã được SaleAdmin cấp mã';
COMMENT ON COLUMN orders.contract_code IS 'Mã đơn hàng (số hợp đồng) - được SaleAdmin cấp, phải unique';
COMMENT ON COLUMN orders.status IS 'Trạng thái: pending (chưa có mã), assigned (đã có mã), completed (hoàn thành)';
COMMENT ON COLUMN orders.attachments IS 'JSON array chứa thông tin các file đính kèm (CCCD images)';

