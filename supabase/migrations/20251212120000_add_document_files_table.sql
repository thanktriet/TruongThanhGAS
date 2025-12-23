-- Migration: Add Document Files Table
-- Created: 2024-12-12
-- Description: Tạo bảng document_files để lưu thông tin các file đã tạo (HĐMB, Thỏa Thuận, Đề Nghị)

-- ======================================================
-- 1. BẢNG DOCUMENT_FILES
-- ======================================================
CREATE TABLE IF NOT EXISTS document_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL CHECK (document_type IN ('HDMB', 'THOA_THUAN', 'DE_NGHI')),
  file_url TEXT NOT NULL,
  file_id TEXT, -- Google Drive file ID
  file_name TEXT,
  contract_code TEXT, -- Mã hợp đồng/đơn hàng
  customer_name TEXT,
  created_by TEXT NOT NULL, -- FK to users.username
  related_order_id UUID, -- FK to orders.id (nếu có)
  metadata JSONB DEFAULT '{}'::jsonb, -- Lưu thêm thông tin tùy chọn
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_document_files_created_by FOREIGN KEY (created_by) REFERENCES users(username) ON DELETE SET NULL,
  CONSTRAINT fk_document_files_order FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Indexes cho document_files
CREATE INDEX IF NOT EXISTS idx_document_files_created_by ON document_files(created_by);
CREATE INDEX IF NOT EXISTS idx_document_files_document_type ON document_files(document_type);
CREATE INDEX IF NOT EXISTS idx_document_files_contract_code ON document_files(contract_code);
CREATE INDEX IF NOT EXISTS idx_document_files_created_at ON document_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_files_order_id ON document_files(related_order_id);
CREATE INDEX IF NOT EXISTS idx_document_files_file_id ON document_files(file_id);

-- Trigger cho updated_at
CREATE TRIGGER update_document_files_updated_at
  BEFORE UPDATE ON document_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE document_files IS 'Bảng lưu thông tin các file tài liệu đã tạo (HĐMB, Thỏa Thuận, Đề Nghị)';
COMMENT ON COLUMN document_files.document_type IS 'Loại tài liệu: HDMB (Hợp Đồng Mua Bán), THOA_THUAN (Thỏa Thuận Lãi Suất), DE_NGHI (Đề Nghị Giải Ngân)';
COMMENT ON COLUMN document_files.file_url IS 'URL của file trên Google Drive';
COMMENT ON COLUMN document_files.file_id IS 'Google Drive file ID để có thể tải về hoặc xóa';
COMMENT ON COLUMN document_files.created_by IS 'Username của user tạo file';
COMMENT ON COLUMN document_files.contract_code IS 'Mã hợp đồng/đơn hàng (nếu có)';
COMMENT ON COLUMN document_files.related_order_id IS 'ID của order liên quan (nếu có)';

-- ======================================================
-- 2. GRANT PERMISSIONS
-- ======================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON document_files TO anon, authenticated;

