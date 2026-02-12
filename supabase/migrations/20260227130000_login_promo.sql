-- Bảng cấu hình dialog nhắc nhở/quảng cáo sau khi đăng nhập
CREATE TABLE IF NOT EXISTS login_promo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT DEFAULT 'Thông báo',
  message TEXT,
  image_url TEXT,
  enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Chèn dòng mặc định
INSERT INTO login_promo (title, message, enabled)
SELECT 'Thông báo', NULL, false
WHERE NOT EXISTS (SELECT 1 FROM login_promo LIMIT 1);

ALTER TABLE login_promo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow login_promo all" ON login_promo FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON login_promo TO anon, authenticated;
