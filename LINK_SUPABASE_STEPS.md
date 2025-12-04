# 🔗 Hướng dẫn Link Supabase Project

## Thông tin Project của bạn:
- **Project URL**: `https://knrnlfsokkrtpvtkuuzr.supabase.co`
- **Project Reference ID**: `knrnlfsokkrtpvtkuuzr`

## Bước 1: Login vào Supabase CLI

Mở Terminal và chạy:
```bash
cd /Users/mac2019/TruongThanhGAS
supabase login
```

Lệnh này sẽ mở browser để bạn đăng nhập. Sau khi đăng nhập thành công, quay lại terminal.

## Bước 2: Link Project

Sau khi login thành công, chạy:
```bash
supabase link --project-ref knrnlfsokkrtpvtkuuzr
```

## Bước 3: Lấy API Keys từ Supabase Dashboard

1. Vào: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/settings/api
2. Copy các giá trị sau:
   - **Project URL**: `https://knrnlfsokkrtpvtkuuzr.supabase.co`
   - **anon public key**: (Key công khai, dùng cho frontend)
   - **service_role key**: (Key bảo mật, chỉ dùng cho backend)

## Bước 4: Lấy Database Connection String

1. Vào: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/settings/database
2. Tìm phần **Connection string**
3. Chọn tab **URI** hoặc **Connection pooling**
4. Copy connection string (có dạng: `postgresql://postgres:[YOUR-PASSWORD]@db.knrnlfsokkrtpvtkuuzr.supabase.co:5432/postgres`)

## Bước 5: File .env đã được tạo ✅

✅ File `.env` đã được tạo với:
- ✅ Anon Key
- ✅ Service Role Key

Bây giờ bạn chỉ cần điền **Database Connection String**:

1. **Database Connection String**:
   - Vào: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/settings/database
   - Tìm phần **Connection string** → Tab **URI**
   - Copy connection string (có password trong đó)
   - Mở file `.env` và điền vào `SUPABASE_DB_URL`
   - Hoặc nếu bạn biết database password, format là:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.knrnlfsokkrtpvtkuuzr.supabase.co:5432/postgres
     ```

## Bước 6: Pull Schema từ Supabase

```bash
supabase db pull
```

Lệnh này sẽ tạo các file migration trong `supabase/migrations/` với schema hiện tại của database.

## ✅ Hoàn tất!

Sau khi hoàn tất, bạn có thể:
- Xem schema trong `supabase/migrations/`
- Chỉnh sửa và push lên cloud: `supabase db push`
- Pull schema mới: `supabase db pull`
- Xem database: `supabase studio` (local) hoặc Supabase Dashboard (cloud)

