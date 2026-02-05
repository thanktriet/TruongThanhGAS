-- Nơi trả chìa khoá khi hoàn trả xe (mặc định: Tủ đựng chìa khoá)
ALTER TABLE test_drive_requests ADD COLUMN IF NOT EXISTS noi_tra_chia_khoa TEXT;
COMMENT ON COLUMN test_drive_requests.noi_tra_chia_khoa IS 'Nơi trả chìa khoá khi hoàn trả xe; mặc định Tủ đựng chìa khoá';
