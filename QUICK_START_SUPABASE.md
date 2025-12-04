# 🚀 Quick Start: Kết nối Supabase với Cursor

## Bước 1: Login vào Supabase CLI

```bash
supabase login
```

Mở browser và đăng nhập với tài khoản Supabase của bạn.

## Bước 2: Link với Supabase Project

1. Vào https://app.supabase.com
2. Chọn project của bạn
3. Vào **Settings → General**
4. Copy **Reference ID** (ví dụ: `abcdefghijklmnop`)

5. Chạy lệnh:
```bash
supabase link --project-ref YOUR_PROJECT_REF_ID
```

Thay `YOUR_PROJECT_REF_ID` bằng Reference ID bạn vừa copy.

## Bước 3: Pull Schema từ Supabase

```bash
supabase db pull
```

Lệnh này sẽ tạo các file migration trong `supabase/migrations/` với schema hiện tại của bạn.

## Bước 4: Tạo file .env

1. Copy file mẫu:
```bash
cp supabase-env.example .env
```

2. Mở file `.env` và điền thông tin:
   - Vào Supabase Dashboard → **Settings → API**
   - Copy **Project URL** → điền vào `SUPABASE_URL`
   - Copy **anon public key** → điền vào `SUPABASE_ANON_KEY`
   - Copy **service_role key** → điền vào `SUPABASE_SERVICE_ROLE_KEY`
   - Copy **Connection string** → điền vào `SUPABASE_DB_URL`
   - Copy **Reference ID** → điền vào `SUPABASE_PROJECT_REF`

## ✅ Hoàn tất!

Bây giờ Cursor đã kết nối với Supabase project của bạn. Bạn có thể:

- ✅ Xem schema trong `supabase/migrations/`
- ✅ Chỉnh sửa schema và push lên cloud: `supabase db push`
- ✅ Pull schema mới từ cloud: `supabase db pull`
- ✅ Xem database: `supabase studio` (local) hoặc Supabase Dashboard (cloud)

## 📚 Xem thêm

Xem file `SUPABASE_SETUP.md` để biết chi tiết và các lệnh nâng cao.


