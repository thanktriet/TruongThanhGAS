-- ======================================================
-- MIGRATION: THEMES MANAGEMENT
-- Project: knrnlfsokkrtpvtkuuzr
-- ======================================================
-- Hướng dẫn: Copy toàn bộ file này và chạy trong SQL Editor của Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/sql/new

-- ======================================================
-- 1. BẢNG THEMES
-- ======================================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Màu sắc chủ đạo
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#6366F1',
  accent_color TEXT DEFAULT '#8B5CF6',
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#1F2937',
  
  -- Gradient (nếu có)
  background_gradient TEXT,
  
  -- Hình ảnh/Pattern
  background_image_url TEXT,
  background_pattern TEXT,
  logo_url TEXT,
  
  -- Icon/Emoji đại diện
  icon_emoji TEXT,
  icon_fontawesome TEXT,
  
  -- Ngày áp dụng tự động (optional)
  start_date DATE,
  end_date DATE,
  
  -- Trạng thái
  is_active BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_themes_created_by FOREIGN KEY (created_by) REFERENCES users(username) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);
CREATE INDEX IF NOT EXISTS idx_themes_is_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_start_date ON themes(start_date);
CREATE INDEX IF NOT EXISTS idx_themes_end_date ON themes(end_date);
CREATE INDEX IF NOT EXISTS idx_themes_created_by ON themes(created_by);

-- Trigger cho updated_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
        CREATE TRIGGER update_themes_updated_at
        BEFORE UPDATE ON themes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Comments
COMMENT ON TABLE themes IS 'Bảng quản lý themes/chủ đề giao diện cho toàn bộ trang web (chỉ Admin)';
COMMENT ON COLUMN themes.slug IS 'URL-friendly identifier cho theme (unique)';
COMMENT ON COLUMN themes.primary_color IS 'Màu chính của theme (hex code)';
COMMENT ON COLUMN themes.secondary_color IS 'Màu phụ của theme (hex code)';
COMMENT ON COLUMN themes.accent_color IS 'Màu nhấn của theme (hex code)';
COMMENT ON COLUMN themes.background_gradient IS 'CSS gradient string cho background';
COMMENT ON COLUMN themes.background_pattern IS 'Loại pattern: none, dots, lines, grid, waves';
COMMENT ON COLUMN themes.is_active IS 'Theme đang được sử dụng (chỉ 1 theme có thể active)';
COMMENT ON COLUMN themes.is_system IS 'Theme mặc định của hệ thống (không được xóa)';
COMMENT ON COLUMN themes.start_date IS 'Ngày bắt đầu tự động kích hoạt theme';
COMMENT ON COLUMN themes.end_date IS 'Ngày kết thúc (tự động tắt theme)';

-- ======================================================
-- 2. DISABLE RLS (Row Level Security)
-- ======================================================
ALTER TABLE themes DISABLE ROW LEVEL SECURITY;

-- ======================================================
-- 3. GRANT PERMISSIONS
-- ======================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON themes TO anon, authenticated;

-- ======================================================
-- 4. INSERT DEFAULT THEME
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
  icon_emoji,
  is_active,
  is_system,
  created_by
) VALUES (
  'Mặc định',
  'Theme mặc định của hệ thống',
  'default',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#FFFFFF',
  '#1F2937',
  '🎨',
  true,
  true,
  'admin'
) ON CONFLICT (slug) DO NOTHING;

-- ======================================================
-- 5. INSERT SAMPLE THEMES
-- ======================================================

-- 5.1. GIÁNG SINH (CHRISTMAS)
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
    '#DC2626',
    '#16A34A',
    '#F59E0B',
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

-- 5.2. TẾT NGUYÊN ĐÁN (LUNAR NEW YEAR)
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
    '#DC2626',
    '#F59E0B',
    '#FCD34D',
    '#FEF3C7',
    '#991B1B',
    'linear-gradient(135deg, #DC2626 0%, #F59E0B 50%, #FCD34D 100%)',
    'waves',
    '🧧',
    'fa-dragon',
    false,
    false,
    'admin'
) ON CONFLICT (slug) DO NOTHING;

-- 5.3. MÙA HÈ (SUMMER)
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
    '#0284C7',
    '#0EA5E9',
    '#FBBF24',
    '#E0F2FE',
    '#0C4A6E',
    'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 50%, #FBBF24 100%)',
    'none',
    '☀️',
    'fa-sun',
    false,
    false,
    'admin'
) ON CONFLICT (slug) DO NOTHING;

-- 5.4. MÙA THU (AUTUMN/FALL)
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
    '#EA580C',
    '#F97316',
    '#92400E',
    '#FFF7ED',
    '#7C2D12',
    'linear-gradient(135deg, #EA580C 0%, #F97316 50%, #92400E 100%)',
    'lines',
    '🍂',
    'fa-leaf',
    false,
    false,
    'admin'
) ON CONFLICT (slug) DO NOTHING;

-- 5.5. SINH NHẬT CÔNG TY (COMPANY BIRTHDAY)
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
    '#7C3AED',
    '#A855F7',
    '#FBBF24',
    '#F5F3FF',
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
-- Kiểm tra kết quả
SELECT name, slug, icon_emoji, is_active, is_system FROM themes ORDER BY is_active DESC, is_system DESC, name;


