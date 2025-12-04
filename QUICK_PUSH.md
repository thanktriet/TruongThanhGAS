# ⚡ Quick Push: Tạo Database trên Supabase

## Cách nhanh nhất (Khuyến nghị)

### Option 1: Chạy SQL trực tiếp trên Supabase Dashboard

1. **Mở SQL Editor:**
   https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/sql/new

2. **Copy toàn bộ nội dung file:**
   `supabase/migrations/20251204072507_initial_schema.sql`

3. **Paste vào SQL Editor và click Run**

✅ **Xong!** Database đã được tạo.

### Option 2: Sử dụng Supabase CLI

```bash
# Đảm bảo đã login
supabase login

# Link project (nếu chưa)
supabase link --project-ref knrnlfsokkrtpvtkuuzr

# Push migrations
supabase db push
```

### Option 3: Sử dụng Script Helper

```bash
./push-to-supabase.sh
```

## ✅ Sau khi push thành công

Kiểm tra database đã được tạo:

1. **Vào Table Editor:**
   https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/editor

2. **Bạn sẽ thấy 3 bảng:**
   - ✅ `users` - Với 7 users mẫu
   - ✅ `approvals` - Bảng tờ trình
   - ✅ `logs` - Bảng lịch sử

## 🎯 Cursor bây giờ có thể:

- ✅ Đọc schema từ migration files
- ✅ Hiểu cấu trúc database
- ✅ Gợi ý code dựa trên schema
- ✅ Tự động tạo migrations mới khi bạn yêu cầu

## 📝 Tạo Migration mới trong tương lai

Khi bạn muốn thay đổi schema, chỉ cần nói với Cursor:

> "Tạo migration để thêm cột X vào bảng Y"

Cursor sẽ:
1. Tạo file migration mới
2. Viết SQL
3. Bạn chỉ cần chạy `supabase db push`

