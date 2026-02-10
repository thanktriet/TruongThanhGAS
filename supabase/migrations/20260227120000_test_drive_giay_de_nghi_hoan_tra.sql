-- Giấy đề nghị lái thử (có đủ chữ ký) đính kèm khi hoàn trả xe (thay vì lúc đăng ký)
ALTER TABLE test_drive_requests ADD COLUMN IF NOT EXISTS anh_giay_de_nghi_hoan_tra JSONB DEFAULT '[]'::jsonb;
COMMENT ON COLUMN test_drive_requests.anh_giay_de_nghi_hoan_tra IS 'URL ảnh Giấy đề nghị lái thử (có đủ chữ ký) đính kèm khi hoàn trả xe';
