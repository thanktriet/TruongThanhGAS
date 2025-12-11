# Hướng Dẫn Apply Migration cho TVBH Targets

## ⚠️ QUAN TRỌNG
Migration cần được apply vào project đúng: **knrnlfsokkrtpvtkuuzr.supabase.co**

## Cách Apply Migration

### Bước 1: Mở Supabase Dashboard
1. Truy cập: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr
2. Đăng nhập nếu cần

### Bước 2: Vào SQL Editor
1. Click vào **SQL Editor** ở sidebar bên trái
2. Click **New query**

### Bước 3: Copy và Paste Migration
1. Mở file: `supabase/migrations/APPLY_TO_knrnlfsokkrtpvtkuuzr.sql`
2. Copy **TOÀN BỘ** nội dung
3. Paste vào SQL Editor trong Supabase Dashboard
4. Click **Run** hoặc nhấn `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Bước 4: Verify
Sau khi chạy thành công, bạn sẽ thấy:
- ✅ Bảng `tvbh_targets` đã được tạo
- ✅ Indexes đã được tạo
- ✅ Trigger đã được tạo
- ✅ Permissions đã được grant

### Bước 5: Test
1. Hard refresh trình duyệt: `Cmd+Shift+R` (Mac) hoặc `Ctrl+Shift+R` (Windows)
2. Mở lại app và thử chức năng "Quản Lý Chỉ Tiêu TVBH"
3. Lỗi 404 sẽ biến mất!

## Nội Dung Migration

Migration sẽ:
- ✅ Tạo bảng `tvbh_targets` với đầy đủ columns
- ✅ Tạo indexes để tối ưu query
- ✅ Tạo trigger tự động update `updated_at`
- ✅ Grant permissions cho `anon` và `authenticated` roles

## Troubleshooting

Nếu vẫn gặp lỗi 404:
1. Đảm bảo đã chạy migration trong project đúng (`knrnlfsokkrtpvtkuuzr`)
2. Đợi 10-30 giây để PostgREST refresh schema cache
3. Hard refresh trình duyệt
4. Clear browser cache nếu cần

