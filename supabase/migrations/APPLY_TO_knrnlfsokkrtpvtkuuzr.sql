-- ======================================================
-- MIGRATION: Apply vào project knrnlfsokkrtpvtkuuzr
-- Copy toàn bộ file này và paste vào Supabase Dashboard SQL Editor
-- Project: knrnlfsokkrtpvtkuuzr.supabase.co
-- ======================================================

-- ======================================================
-- 1. TẠO BẢNG tvbh_targets
-- ======================================================
CREATE TABLE IF NOT EXISTS public.tvbh_targets (
    id SERIAL PRIMARY KEY,
    tvbh TEXT NOT NULL,
    month TEXT NOT NULL, -- Format: "yyyy-MM" (ví dụ: "2024-12")
    khtn NUMERIC DEFAULT 0, -- Chỉ tiêu KHTN
    hop_dong NUMERIC DEFAULT 0, -- Chỉ tiêu số hợp đồng
    xhd NUMERIC DEFAULT 0, -- Chỉ tiêu số XHĐ
    doanh_thu NUMERIC DEFAULT 0, -- Chỉ tiêu doanh thu (VNĐ)
    created_by TEXT,
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: mỗi TVBH chỉ có 1 chỉ tiêu cho mỗi tháng
    UNIQUE(tvbh, month)
);

-- ======================================================
-- 2. THÊM INDEX
-- ======================================================
CREATE INDEX IF NOT EXISTS idx_tvbh_targets_tvbh ON public.tvbh_targets(tvbh);
CREATE INDEX IF NOT EXISTS idx_tvbh_targets_month ON public.tvbh_targets(month);
CREATE INDEX IF NOT EXISTS idx_tvbh_targets_tvbh_month ON public.tvbh_targets(tvbh, month);

-- ======================================================
-- 3. THÊM COMMENTS
-- ======================================================
COMMENT ON TABLE public.tvbh_targets IS 'Bảng lưu chỉ tiêu (targets) cho từng TVBH theo tháng';
COMMENT ON COLUMN public.tvbh_targets.tvbh IS 'Username của TVBH';
COMMENT ON COLUMN public.tvbh_targets.month IS 'Tháng (format: yyyy-MM, ví dụ: 2024-12)';
COMMENT ON COLUMN public.tvbh_targets.khtn IS 'Chỉ tiêu KHTN (Khách hàng tiềm năng)';
COMMENT ON COLUMN public.tvbh_targets.hop_dong IS 'Chỉ tiêu số hợp đồng';
COMMENT ON COLUMN public.tvbh_targets.xhd IS 'Chỉ tiêu số XHĐ (Xuất hóa đơn)';
COMMENT ON COLUMN public.tvbh_targets.doanh_thu IS 'Chỉ tiêu doanh thu (VNĐ)';

-- ======================================================
-- 4. THÊM TRIGGER ĐỂ TỰ ĐỘNG CẬP NHẬT updated_at
-- ======================================================
CREATE OR REPLACE FUNCTION update_tvbh_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tvbh_targets_updated_at ON public.tvbh_targets;
CREATE TRIGGER trigger_update_tvbh_targets_updated_at
    BEFORE UPDATE ON public.tvbh_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_tvbh_targets_updated_at();

-- ======================================================
-- 5. GRANT PERMISSIONS (QUAN TRỌNG!)
-- ======================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.tvbh_targets TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE tvbh_targets_id_seq TO anon, authenticated;

-- ======================================================
-- HOÀN TẤT!
-- Sau khi chạy migration này, hard refresh trình duyệt (Cmd+Shift+R)
-- và thử lại chức năng quản lý chỉ tiêu TVBH
-- ======================================================

