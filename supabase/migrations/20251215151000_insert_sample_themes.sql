-- Migration: Insert Sample Themes
-- Created: 2024-12-15
-- Description: Thêm các theme mẫu: Giáng Sinh, Tết Nguyên Đán, Mùa Hè, Mùa Thu, Sinh nhật công ty

-- ======================================================
-- 1. GIÁNG SINH (CHRISTMAS)
-- ======================================================
INSERT INTO themes (
    name,
    description,
    slug,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    background_gradient,
    background_pattern,
    icon_emoji,
    icon_fontawesome,
    is_active,
    is_system,
    created_by
) VALUES (
    'Giáng Sinh',
    'Theme Giáng Sinh với màu đỏ và xanh lá, không khí lễ hội ấm áp',
    'giang-sinh',
    '#DC2626',      -- Red
    '#16A34A',      -- Green
    '#F59E0B',      -- Amber/Gold
    '#FFFFFF',
    '#1F2937',
    'linear-gradient(135deg, #DC2626 0%, #16A34A 50%, #FFFFFF 100%)',
    'dots',
    '🎄',
    'fa-snowflake',
    false,
    false,
    'admin'
) ON CONFLICT (slug) DO NOTHING;

-- ======================================================
-- 2. TẾT NGUYÊN ĐÁN (LUNAR NEW YEAR)
-- ======================================================
INSERT INTO themes (
    name,
    description,
    slug,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    background_gradient,
    background_pattern,
    icon_emoji,
    icon_fontawesome,
    is_active,
    is_system,
    created_by
) VALUES (
    'Tết Nguyên Đán',
    'Theme Tết với màu đỏ và vàng, chúc mừng năm mới thịnh vượng',
    'tet-nguyen-dan',
    '#DC2626',      -- Red
    '#F59E0B',      -- Gold/Yellow
    '#FCD34D',      -- Light Gold
    '#FEF3C7',      -- Light Yellow
    '#991B1B',
    'linear-gradient(135deg, #DC2626 0%, #F59E0B 50%, #FCD34D 100%)',
    'waves',
    '🧧',
    'fa-dragon',
    false,
    false,
    'admin'
) ON CONFLICT (slug) DO NOTHING;

-- ======================================================
-- 3. MÙA HÈ (SUMMER)
-- ======================================================
INSERT INTO themes (
    name,
    description,
    slug,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    background_gradient,
    background_pattern,
    icon_emoji,
    icon_fontawesome,
    is_active,
    is_system,
    created_by
) VALUES (
    'Mùa Hè',
    'Theme mùa hè với màu xanh biển và vàng, không khí tươi mát',
    'mua-he',
    '#0284C7',      -- Sky Blue
    '#0EA5E9',      -- Light Blue
    '#FBBF24',      -- Yellow/Sun
    '#E0F2FE',      -- Very Light Blue
    '#0C4A6E',
    'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 50%, #FBBF24 100%)',
    'none',
    '☀️',
    'fa-sun',
    false,
    false,
    'admin'
) ON CONFLICT (slug) DO NOTHING;

-- ======================================================
-- 4. MÙA THU (AUTUMN/FALL)
-- ======================================================
INSERT INTO themes (
    name,
    description,
    slug,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    background_gradient,
    background_pattern,
    icon_emoji,
    icon_fontawesome,
    is_active,
    is_system,
    created_by
) VALUES (
    'Mùa Thu',
    'Theme mùa thu với màu cam và nâu, không khí ấm áp nhẹ nhàng',
    'mua-thu',
    '#EA580C',      -- Orange
    '#F97316',      -- Light Orange
    '#92400E',      -- Brown
    '#FFF7ED',      -- Cream
    '#7C2D12',
    'linear-gradient(135deg, #EA580C 0%, #F97316 50%, #92400E 100%)',
    'lines',
    '🍂',
    'fa-leaf',
    false,
    false,
    'admin'
) ON CONFLICT (slug) DO NOTHING;

-- ======================================================
-- 5. SINH NHẬT CÔNG TY (COMPANY BIRTHDAY)
-- ======================================================
INSERT INTO themes (
    name,
    description,
    slug,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    background_gradient,
    background_pattern,
    icon_emoji,
    icon_fontawesome,
    is_active,
    is_system,
    created_by
) VALUES (
    'Sinh Nhật Công Ty',
    'Theme sinh nhật với màu tím và vàng, chúc mừng kỷ niệm thành lập',
    'sinh-nhat-cong-ty',
    '#7C3AED',      -- Purple
    '#A855F7',      -- Light Purple
    '#FBBF24',      -- Gold
    '#F5F3FF',      -- Very Light Purple
    '#4C1D95',
    'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #FBBF24 100%)',
    'grid',
    '🎂',
    'fa-birthday-cake',
    false,
    false,
    'admin'
) ON CONFLICT (slug) DO NOTHING;

-- ======================================================
-- VERIFY
-- ======================================================
-- Kiểm tra các themes đã được insert
-- SELECT name, slug, icon_emoji, created_by FROM themes WHERE slug IN ('giang-sinh', 'tet-nguyen-dan', 'mua-he', 'mua-thu', 'sinh-nhat-cong-ty');

