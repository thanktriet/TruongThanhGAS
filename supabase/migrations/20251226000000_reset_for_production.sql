-- ======================================================
-- RESET DATABASE FOR PRODUCTION GO-LIVE
-- Created: 2025-12-26
-- Description: Xóa tất cả dữ liệu sample/test và chuẩn bị cho production
-- 
-- ⚠️ CẢNH BÁO: Migration này sẽ XÓA TẤT CẢ dữ liệu hiện có!
-- Chỉ chạy khi chuẩn bị go-live
-- ======================================================

-- ======================================================
-- 1. BACKUP DỮ LIỆU TRƯỚC KHI RESET (Nếu cần)
-- ======================================================
-- Chạy các lệnh export dữ liệu trước khi reset:
-- pg_dump -h [host] -U [user] -d [database] -t users -t approvals -t orders -t coc_requests > backup_before_reset.sql

-- ======================================================
-- 2. XÓA TẤT CẢ DỮ LIỆU SAMPLE/TEST
-- ======================================================

-- Xóa tất cả dữ liệu (theo thứ tự để tránh foreign key constraint)
TRUNCATE TABLE coc_requests CASCADE;
TRUNCATE TABLE daily_reports CASCADE;
TRUNCATE TABLE document_files CASCADE;
TRUNCATE TABLE tvbh_targets CASCADE;
TRUNCATE TABLE sales_policies CASCADE;
TRUNCATE TABLE car_models CASCADE;
TRUNCATE TABLE user_permissions CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE approvals CASCADE;
TRUNCATE TABLE contracts CASCADE;
TRUNCATE TABLE logs CASCADE;
TRUNCATE TABLE themes CASCADE;

-- Xóa tất cả users (sẽ tạo lại admin user sau)
TRUNCATE TABLE users CASCADE;

-- ======================================================
-- 3. TẠO LẠI ADMIN USER CHO PRODUCTION
-- ======================================================
-- ⚠️ QUAN TRỌNG: Thay đổi password hash này!
-- Password mặc định: 'admin123' 
-- Hash MD5 của 'admin123' = '0192023a7bbd73250516f069df18b500'
-- Khuyến nghị: Đổi password ngay sau khi đăng nhập lần đầu

INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
  (
    'admin', 
    '0192023a7bbd73250516f069df18b500', -- Password: 'admin123' - ⚠️ ĐỔI NGAY SAU KHI ĐĂNG NHẬP!
    'Quản Trị Viên', 
    'ADMIN', 
    true, -- Yêu cầu đổi mật khẩu khi đăng nhập lần đầu
    '', 
    'admin@truongthanh.com.vn', 
    'HQ', 
    true
  )
ON CONFLICT (username) DO NOTHING;

-- ======================================================
-- 4. RESET SEQUENCES (Nếu có)
-- ======================================================
-- Nếu có sequences, reset về 1
-- ALTER SEQUENCE IF EXISTS [sequence_name] RESTART WITH 1;

-- ======================================================
-- 5. GHI CHÚ SAU KHI RESET
-- ======================================================
-- ✅ Đã xóa tất cả dữ liệu test/sample
-- ✅ Đã tạo lại admin user
-- ⚠️ Cần làm:
--    1. Đăng nhập với admin/admin123 và đổi mật khẩu ngay
--    2. Tạo các user thật cho production
--    3. Cấu hình Google Drive folders (nếu chưa có)
--    4. Kiểm tra các cấu hình API URLs
--    5. Test các chức năng chính

COMMENT ON SCHEMA public IS 'Database đã được reset cho production go-live - Ngày: 2025-12-26';

