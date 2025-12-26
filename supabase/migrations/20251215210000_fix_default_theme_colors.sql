-- Migration: Fix default theme colors for better text readability
-- Created: 2024-12-15
-- Description: Sửa màu sắc theme mặc định để chữ dễ nhìn hơn

-- Update theme mặc định với màu sắc tương phản tốt
-- Cập nhật cả theme có slug = 'default' hoặc is_system = true và name = 'Mặc định'
UPDATE themes
SET 
    primary_color = '#3B82F6',      -- Blue - dễ nhìn
    secondary_color = '#2563EB',    -- Darker blue
    accent_color = '#60A5FA',       -- Light blue
    background_color = '#FFFFFF',   -- Trắng
    text_color = '#1F2937',         -- Dark gray - dễ đọc trên nền trắng
    background_gradient = NULL,     -- Không dùng gradient cho mặc định
    background_pattern = 'none',    -- Không dùng pattern
    description = 'Theme mặc định của hệ thống với màu sắc dễ nhìn, tương phản tốt',
    updated_at = NOW()
WHERE (is_system = true AND name = 'Mặc định') OR slug = 'default';

-- Nếu không tìm thấy theme "Mặc định", tạo mới
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
    is_active,
    is_system,
    created_by
)
SELECT 
    'Mặc định',
    'Theme mặc định với màu sắc dễ nhìn, tương phản tốt',
    'mac-dinh',
    '#3B82F6',      -- Blue
    '#2563EB',      -- Darker blue
    '#60A5FA',      -- Light blue
    '#FFFFFF',      -- White
    '#1F2937',      -- Dark gray - dễ đọc
    NULL,           -- Không gradient
    'none',         -- Không pattern
    '🎨',
    false,
    true,
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM themes WHERE is_system = true AND name = 'Mặc định'
);

-- Comments
COMMENT ON COLUMN themes.text_color IS 'Màu chữ - nên chọn màu tối để dễ đọc trên nền sáng';
COMMENT ON COLUMN themes.background_color IS 'Màu nền - nên chọn màu sáng để tương phản tốt với chữ';

