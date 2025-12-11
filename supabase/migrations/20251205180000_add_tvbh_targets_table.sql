-- Migration: Add TVBH Targets Table
-- Created: 2024-12-05
-- Description: Bảng lưu chỉ tiêu (targets) cho từng TVBH theo tháng

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
-- 3. THÊM FOREIGN KEY (optional, reference users table)
-- ======================================================
-- Note: Không thêm FK vì có thể TVBH chưa có trong users table

-- ======================================================
-- 4. THÊM COMMENTS
-- ======================================================
COMMENT ON TABLE public.tvbh_targets IS 'Bảng lưu chỉ tiêu (targets) cho từng TVBH theo tháng';
COMMENT ON COLUMN public.tvbh_targets.tvbh IS 'Username của TVBH';
COMMENT ON COLUMN public.tvbh_targets.month IS 'Tháng (format: yyyy-MM, ví dụ: 2024-12)';
COMMENT ON COLUMN public.tvbh_targets.khtn IS 'Chỉ tiêu KHTN (Khách hàng tiềm năng)';
COMMENT ON COLUMN public.tvbh_targets.hop_dong IS 'Chỉ tiêu số hợp đồng';
COMMENT ON COLUMN public.tvbh_targets.xhd IS 'Chỉ tiêu số XHĐ (Xuất hóa đơn)';
COMMENT ON COLUMN public.tvbh_targets.doanh_thu IS 'Chỉ tiêu doanh thu (VNĐ)';

-- ======================================================
-- 5. THÊM TRIGGER ĐỂ TỰ ĐỘNG CẬP NHẬT updated_at
-- ======================================================
CREATE OR REPLACE FUNCTION update_tvbh_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tvbh_targets_updated_at
    BEFORE UPDATE ON public.tvbh_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_tvbh_targets_updated_at();

-- ======================================================
-- 6. INSERT SAMPLE DATA (optional - có thể xóa sau)
-- ======================================================
-- Lấy danh sách TVBH từ users table
DO $$
DECLARE
    tvbh_record RECORD;
    current_month TEXT;
BEGIN
    -- Lấy tháng hiện tại
    current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    
    -- Insert chỉ tiêu mẫu cho tất cả TVBH
    FOR tvbh_record IN 
        SELECT username FROM public.users 
        WHERE role = 'TVBH' AND active = true
        LIMIT 5 -- Chỉ insert cho 5 TVBH đầu tiên làm mẫu
    LOOP
        INSERT INTO public.tvbh_targets (tvbh, month, khtn, hop_dong, xhd, doanh_thu, created_by)
        VALUES (
            tvbh_record.username,
            current_month,
            50, -- KHTN
            10, -- Hợp đồng
            8,  -- XHĐ
            5000000000, -- Doanh thu: 5 tỷ VNĐ
            'system' -- created_by
        )
        ON CONFLICT (tvbh, month) DO NOTHING;
    END LOOP;
END $$;

