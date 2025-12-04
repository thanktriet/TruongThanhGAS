# ✅ Tiếp theo: Hoàn tất kết nối Supabase

## Đã hoàn thành:
- ✅ Cài đặt Supabase CLI
- ✅ Khởi tạo Supabase project local
- ✅ Tạo file `.env` với:
  - ✅ Anon Key
  - ✅ Service Role Key
  - ⏳ Database Connection String (cần điền)

## Bước tiếp theo:

### 1. Điền Database Connection String

Mở file `.env` và cập nhật `SUPABASE_DB_URL`:

**Cách 1: Lấy từ Dashboard**
- Vào: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/settings/database
- Tìm phần **Connection string** → Tab **URI**
- Copy và paste vào `SUPABASE_DB_URL` trong file `.env`

**Cách 2: Nếu bạn biết database password**
Format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.knrnlfsokkrtpvtkuuzr.supabase.co:5432/postgres
```

### 2. Login vào Supabase CLI

Mở Terminal và chạy:
```bash
cd /Users/mac2019/TruongThanhGAS
supabase login
```

### 3. Link Project

Sau khi login thành công:
```bash
supabase link --project-ref knrnlfsokkrtpvtkuuzr
```

### 4. Pull Schema từ Supabase

```bash
supabase db pull
```

Lệnh này sẽ tạo các file migration trong `supabase/migrations/` với schema hiện tại.

## ✅ Sau khi hoàn tất:

Cursor sẽ tự động nhận diện:
- ✅ Schema trong `supabase/migrations/`
- ✅ Cấu hình trong `supabase/config.toml`
- ✅ Environment variables trong `.env`

Bạn có thể:
- Xem và chỉnh sửa schema
- Push changes lên cloud: `supabase db push`
- Pull schema mới: `supabase db pull`
- Xem database: `supabase studio` (local) hoặc Supabase Dashboard (cloud)

