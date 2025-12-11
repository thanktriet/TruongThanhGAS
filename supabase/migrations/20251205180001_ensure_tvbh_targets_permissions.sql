-- Migration: Ensure TVBH Targets Permissions
-- Created: 2024-12-05
-- Description: Đảm bảo permissions và schema access cho bảng tvbh_targets

-- ======================================================
-- 1. GRANT USAGE ON SCHEMA (nếu chưa có)
-- ======================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ======================================================
-- 2. GRANT ALL PRIVILEGES ON TABLE
-- ======================================================
GRANT ALL ON public.tvbh_targets TO anon, authenticated;

-- ======================================================
-- 3. Đảm bảo sequence cũng có permissions
-- ======================================================
GRANT USAGE, SELECT ON SEQUENCE tvbh_targets_id_seq TO anon, authenticated;

