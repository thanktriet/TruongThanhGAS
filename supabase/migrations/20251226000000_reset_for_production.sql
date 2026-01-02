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
-- Sử dụng DO block để chỉ TRUNCATE các bảng tồn tại
DO $$
DECLARE
    tbl_name TEXT;
    tables_to_truncate TEXT[] := ARRAY[
        'coc_requests',
        'daily_reports',
        'document_files',
        'tvbh_targets',
        'sales_policies',
        'car_models',
        'user_permissions',
        'orders',
        'customers',
        'approvals',
        'contracts',
        'logs',
        'themes',
        'workout_plans',
        'workout_logs',
        'meal_plans',
        'meal_logs',
        'body_tracking',
        'calendar',
        'exercise_library',
        'food_library'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_truncate
    LOOP
        -- Kiểm tra bảng có tồn tại không
        IF EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tbl_name
        ) THEN
            EXECUTE format('TRUNCATE TABLE %I CASCADE', tbl_name);
            RAISE NOTICE 'Đã xóa dữ liệu từ bảng: %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- Xóa tất cả users (sẽ tạo lại admin user sau)
-- Kiểm tra schema của bảng users trước
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) THEN
        TRUNCATE TABLE users CASCADE;
        RAISE NOTICE 'Đã xóa dữ liệu từ bảng users';
    END IF;
END $$;

-- ======================================================
-- 3. TẠO LẠI ADMIN USER CHO PRODUCTION
-- ======================================================
-- ⚠️ QUAN TRỌNG: Thay đổi password hash này!
-- Password mặc định: 'admin123' 
-- Hash MD5 của 'admin123' = '0192023a7bbd73250516f069df18b500'
-- Khuyến nghị: Đổi password ngay sau khi đăng nhập lần đầu

-- Tạo admin user dựa vào schema hiện tại của bảng users
DO $$
BEGIN
    -- Kiểm tra xem bảng users có cột 'username' không (schema Sales Portal)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'username'
    ) THEN
        -- Schema của hệ thống Sales Portal
        INSERT INTO users (username, password, fullname, role, need_change_pass, phone, email, "group", active) VALUES
          (
            'admin', 
            '0192023a7bbd73250518f069df18b500', -- Password: 'admin123'
            'Quản Trị Viên', 
            'ADMIN', 
            true,
            '', 
            'admin@truongthanh.com.vn', 
            'HQ', 
            true
          )
        ON CONFLICT (username) DO NOTHING;
        RAISE NOTICE 'Đã tạo admin user (schema Sales Portal)';
    
    -- Kiểm tra xem bảng users có cột 'email' không (schema khác)
    ELSIF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email'
        AND column_name != 'username'
    ) THEN
        -- Schema của hệ thống khác (fitness/gym)
        INSERT INTO users (email, password, name, role, phone) VALUES
          (
            'admin@truongthanh.com.vn',
            '0192023a7bbd73250516f069df18b500', -- Password: 'admin123'
            'Quản Trị Viên',
            'Admin',
            ''
          )
        ON CONFLICT (email) DO NOTHING;
        RAISE NOTICE 'Đã tạo admin user (schema khác - dùng email)';
    END IF;
END $$;

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

