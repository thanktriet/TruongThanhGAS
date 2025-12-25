-- Migration: Add Themes Management Table
-- Created: 2024-12-15
-- Description: Tạo bảng themes để quản lý chủ đề/giao diện cho toàn bộ trang web (chỉ Admin)

-- ======================================================
-- 1. BẢNG THEMES
-- ======================================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- Tên theme (VD: "Giáng Sinh", "Tết Nguyên Đán", "Mùa Hè")
  description TEXT, -- Mô tả theme
  slug TEXT UNIQUE NOT NULL, -- URL-friendly name (VD: "giang-sinh", "tet", "mua-he")
  
  -- Màu sắc chủ đạo
  primary_color TEXT DEFAULT '#3B82F6', -- Màu chính (blue)
  secondary_color TEXT DEFAULT '#6366F1', -- Màu phụ (indigo)
  accent_color TEXT DEFAULT '#8B5CF6', -- Màu nhấn (purple)
  background_color TEXT DEFAULT '#FFFFFF', -- Màu nền
  text_color TEXT DEFAULT '#1F2937', -- Màu chữ
  
  -- Gradient (nếu có)
  background_gradient TEXT, -- VD: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  
  -- Hình ảnh/Pattern
  background_image_url TEXT, -- URL ảnh nền (Google Drive hoặc CDN)
  background_pattern TEXT, -- Pattern type: 'none', 'dots', 'lines', 'grid', 'waves'
  logo_url TEXT, -- URL logo (nếu theme có logo riêng)
  
  -- Icon/Emoji đại diện
  icon_emoji TEXT, -- Emoji đại diện (VD: "🎄", "🧧", "☀️", "🎂")
  icon_fontawesome TEXT, -- FontAwesome class (VD: "fa-snowflake", "fa-dragon", "fa-sun")
  
  -- Ngày áp dụng tự động (optional)
  start_date DATE, -- Ngày bắt đầu tự động kích hoạt
  end_date DATE, -- Ngày kết thúc (tự động tắt)
  
  -- Trạng thái
  is_active BOOLEAN DEFAULT false, -- Theme đang được sử dụng
  is_system BOOLEAN DEFAULT false, -- Theme mặc định (không được xóa)
  
  -- Metadata
  created_by TEXT NOT NULL, -- FK to users.username (Admin tạo)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_themes_created_by FOREIGN KEY (created_by) REFERENCES users(username) ON DELETE SET NULL,
  CONSTRAINT unique_active_theme EXCLUDE (is_active WITH =) WHERE (is_active = true) -- Chỉ 1 theme active tại 1 thời điểm
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);
CREATE INDEX IF NOT EXISTS idx_themes_is_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_start_date ON themes(start_date);
CREATE INDEX IF NOT EXISTS idx_themes_end_date ON themes(end_date);
CREATE INDEX IF NOT EXISTS idx_themes_created_by ON themes(created_by);

-- Trigger cho updated_at
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
-- Tạo theme mặc định (system theme)
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

