-- Migration: Update sample themes with elegant, sophisticated colors
-- Created: 2024-12-15
-- Description: Cập nhật các theme mẫu với màu sắc nhã nhặn, tinh tế, sang trọng

-- Update Giáng Sinh (Christmas) theme - Tông pastel đỏ/xanh nhẹ nhàng
UPDATE themes
SET 
    primary_color = '#D4A5A5',      -- Đỏ pastel nhẹ nhàng
    secondary_color = '#A8C5C7',    -- Xanh dương pastel
    accent_color = '#F5E6D3',       -- Kem/beige nhẹ
    background_gradient = 'linear-gradient(135deg, #FFF5F5 0%, #F0F8FF 50%, #FFFFFF 100%)', -- Trắng/xanh nhẹ
    background_pattern = 'dots',
    icon_emoji = '🎄',
    updated_at = NOW()
WHERE name = 'Giáng Sinh';

-- Update Tết Nguyên Đán (Lunar New Year) theme - Tông vàng/đỏ ấm áp
UPDATE themes
SET 
    primary_color = '#E8B86D',      -- Vàng nhạt ấm áp
    secondary_color = '#D9776F',    -- Đỏ san hô nhẹ
    accent_color = '#C4A882',       -- Nâu vàng sang trọng
    background_gradient = 'linear-gradient(135deg, #FFF8E7 0%, #FFE8E8 50%, #FFFFFF 100%)', -- Vàng nhạt/đỏ nhạt
    background_pattern = 'grid',
    icon_emoji = '🧧',
    updated_at = NOW()
WHERE name = 'Tết Nguyên Đán';

-- Update Mùa Hè (Summer) theme - Tông xanh dương/xanh lá tươi mát
UPDATE themes
SET 
    primary_color = '#7DB9B6',      -- Xanh ngọc bích nhẹ
    secondary_color = '#A8D5BA',    -- Xanh lá pastel
    accent_color = '#F4D19B',       -- Vàng nhạt (nắng)
    background_gradient = 'linear-gradient(135deg, #E8F4F8 0%, #D4F1D4 50%, #FFF8E1 100%)', -- Xanh dương/xanh lá/vàng nhẹ
    background_pattern = 'dots',
    icon_emoji = '☀️',
    updated_at = NOW()
WHERE name = 'Mùa Hè';

-- Update Mùa Thu (Autumn) theme - Tông cam/nâu vàng ấm áp
UPDATE themes
SET 
    primary_color = '#D4A574',      -- Cam beige nhẹ
    secondary_color = '#B8937F',    -- Nâu nhạt
    accent_color = '#E8C5A0',       -- Vàng kem
    background_gradient = 'linear-gradient(135deg, #FFF4E6 0%, #FFE8D6 50%, #FFFFFF 100%)', -- Cam/nâu nhẹ
    background_pattern = 'lines',
    icon_emoji = '🍂',
    updated_at = NOW()
WHERE name = 'Mùa Thu';

-- Update Sinh Nhật Công Ty (Company Birthday) theme - Tông navy/vàng sang trọng
UPDATE themes
SET 
    primary_color = '#4A5568',      -- Xám xanh navy sang trọng
    secondary_color = '#718096',    -- Xám xanh nhẹ
    accent_color = '#D4A574',       -- Vàng đồng
    background_gradient = 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 50%, #E2E8F0 100%)', -- Xám nhẹ sang trọng
    background_pattern = 'grid',
    icon_emoji = '🎂',
    updated_at = NOW()
WHERE name = 'Sinh Nhật Công Ty';

-- Comments
COMMENT ON COLUMN themes.primary_color IS 'Màu chính của theme - nên chọn màu nhã nhặn, tinh tế';
COMMENT ON COLUMN themes.secondary_color IS 'Màu phụ của theme - bổ sung cho màu chính';
COMMENT ON COLUMN themes.accent_color IS 'Màu nhấn của theme - dùng cho điểm nhấn';

