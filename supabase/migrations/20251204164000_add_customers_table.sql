-- Migration: Add Customers Table
-- Created: 2024-12-04
-- Description: Tạo bảng customers để lưu thông tin khách hàng, dùng CCCD làm PRIMARY KEY

-- ======================================================
-- 1. BẢNG CUSTOMERS
-- ======================================================
CREATE TABLE IF NOT EXISTS customers (
  cccd TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  issue_date DATE,
  issue_place TEXT,
  cccd_front_image_url TEXT,
  cccd_back_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes cho customers
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Trigger cho updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE customers IS 'Bảng lưu thông tin khách hàng, dùng CCCD làm key chính';
COMMENT ON COLUMN customers.cccd IS 'Số CCCD - dùng làm PRIMARY KEY để tìm kiếm và tái sử dụng';
COMMENT ON COLUMN customers.cccd_front_image_url IS 'URL hình ảnh mặt trước CCCD trên Google Drive';
COMMENT ON COLUMN customers.cccd_back_image_url IS 'URL hình ảnh mặt sau CCCD trên Google Drive';

