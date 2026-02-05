-- Add muc_dich_extra JSONB for structured purpose data (type, chi_tiet, anh_bang_lai, anh_giay_de_nghi)
ALTER TABLE test_drive_requests ADD COLUMN IF NOT EXISTS muc_dich_extra JSONB DEFAULT '{}'::jsonb;
COMMENT ON COLUMN test_drive_requests.muc_dich_extra IS 'Mục đích: type (Khach_lai_thu|Cong_vu|Ban_Lanh_Dao|Muc_dich_khac), chi_tiet?, anh_bang_lai?, anh_giay_de_nghi?';
