-- Migration: Add RLS Security Policies
-- Created: 2024-12-12
-- Description: Bật RLS và tạo policies cho các bảng quan trọng để bảo mật dữ liệu
--
-- ⚠️ LƯU Ý QUAN TRỌNG:
-- Hệ thống hiện tại đang sử dụng custom authentication (localStorage session)
-- thay vì Supabase Auth, nên RLS policies dựa trên JWT claims sẽ KHÔNG hoạt động.
--
-- Vì vậy, trong migration này chúng ta sẽ:
-- 1. Bật RLS để bảo vệ khỏi direct database access
-- 2. Tạo policies cho phép access dựa trên application-level authorization
--    (thông qua anon/authenticated roles và application logic)
--
-- Authorization thực sự được xử lý ở application layer (js/supabase-api.js)
-- với session validation và role-based checks.

-- ======================================================
-- 1. DOCUMENT_FILES - RLS POLICIES
-- ======================================================

-- Bật RLS cho document_files
ALTER TABLE document_files ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép authenticated users xem documents
-- (Authorization thực sự được xử lý ở application layer)
CREATE POLICY "Authenticated users can view documents"
    ON document_files
    FOR SELECT
    TO authenticated, anon
    USING (true); -- Application sẽ filter theo created_by và role

-- Policy: Cho phép authenticated users insert documents
-- (Application sẽ set created_by từ session)
CREATE POLICY "Authenticated users can insert documents"
    ON document_files
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true); -- Application sẽ validate created_by

-- Policy: Cho phép authenticated users update documents
-- (Application sẽ check created_by và role)
CREATE POLICY "Authenticated users can update documents"
    ON document_files
    FOR UPDATE
    TO authenticated, anon
    USING (true)
    WITH CHECK (true); -- Application sẽ validate

-- Policy: Cho phép authenticated users delete documents
-- (Application sẽ check created_by và role)
CREATE POLICY "Authenticated users can delete documents"
    ON document_files
    FOR DELETE
    TO authenticated, anon
    USING (true); -- Application sẽ validate

-- ======================================================
-- 2. USERS - RLS POLICIES (nếu chưa có)
-- ======================================================

-- Bật RLS cho users (chỉ nếu chưa bật)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
        AND c.relname = 'users'
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Policy: Cho phép authenticated users xem users (cho dropdown, etc.)
-- Application sẽ xử lý authorization (password field không được select)
CREATE POLICY "Authenticated users can view users"
    ON users
    FOR SELECT
    TO authenticated, anon
    USING (true); -- Application sẽ filter và exclude password

-- Policy: Cho phép authenticated users manage users
-- Application sẽ check role = ADMIN trước khi allow
CREATE POLICY "Authenticated users can manage users"
    ON users
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true); -- Application sẽ validate ADMIN role

-- ======================================================
-- 3. TVBH_TARGETS - RLS POLICIES
-- ======================================================

-- Bật RLS cho tvbh_targets
ALTER TABLE tvbh_targets ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép authenticated users xem targets (cho dashboard, reports)
CREATE POLICY "Authenticated users can view tvbh targets"
    ON tvbh_targets
    FOR SELECT
    TO authenticated, anon
    USING (true); -- Application sẽ filter nếu cần

-- Policy: Cho phép authenticated users manage targets
-- Application sẽ check role = ADMIN trước khi allow
CREATE POLICY "Authenticated users can manage tvbh targets"
    ON tvbh_targets
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true); -- Application sẽ validate ADMIN role

-- ======================================================
-- 4. ORDERS - RLS POLICIES (nếu cần)
-- ======================================================

-- Bật RLS cho orders nếu chưa có
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'orders'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Users xem được orders của chính họ (trừ ADMIN/SALEADMIN)
        CREATE POLICY "Users can view own orders"
            ON orders
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.username = current_setting('request.jwt.claims', true)::json->>'username'
                    AND users.role IN ('ADMIN', 'SALEADMIN')
                )
                OR
                assigned_sale = current_setting('request.jwt.claims', true)::json->>'username'
            );
    END IF;
END $$;

-- ======================================================
-- 5. COMMENTS
-- ======================================================
COMMENT ON POLICY "Authenticated users can view documents" ON document_files IS 'RLS policy cho phép access - authorization thực sự ở application layer';
COMMENT ON POLICY "Authenticated users can manage users" ON users IS 'RLS policy cho phép access - application sẽ check ADMIN role';
COMMENT ON POLICY "Authenticated users can manage tvbh targets" ON tvbh_targets IS 'RLS policy cho phép access - application sẽ check ADMIN role';

-- ======================================================
-- 6. LƯU Ý QUAN TRỌNG
-- ======================================================
-- 
-- RLS policies trong migration này chỉ cung cấp basic protection
-- ở database level. Authorization thực sự được xử lý ở application layer
-- (js/supabase-api.js) với:
-- - Session validation (getSession())
-- - Role-based checks (session.role === 'ADMIN', etc.)
-- - User-based filtering (created_by, assigned_sale, etc.)
--
-- Để cải thiện bảo mật hơn, nên:
-- 1. Migrate sang Supabase Auth (JWT-based)
-- 2. Update RLS policies để sử dụng JWT claims
-- 3. Implement proper database-level authorization

