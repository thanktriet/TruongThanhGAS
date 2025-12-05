# Hướng dẫn kết nối Supabase với Cursor

## 📋 Yêu cầu

- Đã cài đặt Supabase CLI: `brew install supabase/tap/supabase`
- Đã có Supabase project trên https://supabase.com

## 🔗 Bước 1: Link với Supabase Project

1. **Lấy Project Reference ID:**
   - Vào Supabase Dashboard: https://app.supabase.com
   - Chọn project của bạn
   - Vào Settings → General
   - Copy **Reference ID** (ví dụ: `abcdefghijklmnop`)

2. **Login vào Supabase CLI:**
   ```bash
   supabase login
   ```
   - Mở browser và đăng nhập với tài khoản Supabase

3. **Link project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF_ID
   ```
   Thay `YOUR_PROJECT_REF_ID` bằng Reference ID bạn đã copy ở bước 1.

## 📥 Bước 2: Pull Schema từ Supabase

Sau khi link thành công, pull schema từ Supabase cloud về local:

```bash
supabase db pull
```

Lệnh này sẽ:
- Tạo file migration trong `supabase/migrations/`
- Đồng bộ schema từ cloud về local
- Cursor sẽ tự động nhận diện các file này

## 🔧 Bước 3: Cấu hình Environment Variables

1. **Lấy thông tin từ Supabase Dashboard:**
   - Vào Settings → API
   - Copy các giá trị sau:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon/public key**: Key công khai cho frontend
     - **service_role key**: Key bảo mật cho backend (KHÔNG expose ra frontend!)

2. **Tạo file `.env`** (đã có `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **Điền thông tin vào `.env`:**
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SUPABASE_DB_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
   SUPABASE_PROJECT_REF=your-project-ref-id
   ```

## 🚀 Bước 4: Sử dụng Supabase trong Cursor

### Xem Schema Database

Cursor sẽ tự động nhận diện các file trong `supabase/migrations/`. Bạn có thể:
- Xem schema trong các file migration
- Sửa schema và push lên cloud
- Query database trực tiếp từ Cursor

### Push Schema lên Supabase

Sau khi chỉnh sửa migration files:

```bash
# Push migrations lên Supabase cloud
supabase db push
```

### Pull Schema từ Supabase

Khi có thay đổi trên Supabase Dashboard:

```bash
# Pull schema mới nhất từ cloud
supabase db pull
```

### Xem Database trực tiếp

```bash
# Mở Supabase Studio (local)
supabase studio

# Hoặc truy cập Supabase Dashboard online
# https://app.supabase.com/project/YOUR_PROJECT_REF
```

## 📝 Các lệnh Supabase CLI hữu ích

```bash
# Xem trạng thái kết nối
supabase status

# Reset local database
supabase db reset

# Tạo migration mới
supabase migration new migration_name

# Xem logs
supabase logs

# Generate TypeScript types từ database
supabase gen types typescript --local > types/database.types.ts
```

## 🔒 Bảo mật

⚠️ **QUAN TRỌNG:**
- **KHÔNG** commit file `.env` lên Git (đã có trong `.gitignore`)
- **KHÔNG** expose `SUPABASE_SERVICE_ROLE_KEY` ra frontend
- Chỉ dùng `SUPABASE_ANON_KEY` cho frontend
- Dùng `SUPABASE_SERVICE_ROLE_KEY` chỉ cho backend/server-side

## 🐛 Xử lý lỗi

### Lỗi "Project not linked"
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Lỗi "Database connection failed"
- Kiểm tra `SUPABASE_DB_URL` trong `.env`
- Đảm bảo password đúng
- Kiểm tra network connection

### Lỗi "Migration conflict"
```bash
# Xem migration history
supabase migration list

# Reset và pull lại
supabase db reset
supabase db pull
```

## 📚 Tài liệu tham khảo

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)



