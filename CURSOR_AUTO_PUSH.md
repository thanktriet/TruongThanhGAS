# 🤖 Cursor Tự Động Push Migration lên Supabase

## ✅ Đã Push Thành Công!

Migration đã được push lên Supabase:
- ✅ `20251204072239_remote_schema.sql`
- ✅ `20251204072507_initial_schema.sql`

## 🎯 Cách Cursor Tự Động Push Migration

### Cách 1: Sử dụng Script Helper (Khuyến nghị)

Cursor có thể chạy script này để tự động push:

```bash
./auto-push-migration.sh
```

Script sẽ:
- ✅ Kiểm tra migrations
- ✅ Tự động push lên Supabase
- ✅ Báo cáo kết quả

### Cách 2: Sử dụng Supabase CLI trực tiếp

Cursor có thể chạy lệnh này:

```bash
supabase db push
```

Lệnh này sẽ:
- ✅ Tự động detect migrations mới
- ✅ Hỏi xác nhận (có thể tự động với flag)
- ✅ Push lên Supabase cloud

### Cách 3: Push với Auto-confirm

Để Cursor tự động push không cần hỏi:

```bash
echo "y" | supabase db push
```

## 📝 Workflow Tự Động với Cursor

### Bước 1: Yêu cầu Cursor tạo migration

Bạn nói với Cursor:
> "Tạo migration để thêm cột notes vào bảng approvals"

### Bước 2: Cursor tự động:
1. Tạo file migration mới: `supabase migration new add_notes_to_approvals`
2. Viết SQL trong file migration
3. Chạy: `supabase db push` hoặc `./auto-push-migration.sh`

### Bước 3: Hoàn tất!

Database đã được cập nhật trên Supabase.

## 🔧 Cấu hình cho Cursor

Để Cursor có thể tự động push, đảm bảo:

1. **Đã login:**
   ```bash
   supabase login
   ```

2. **Đã link project:**
   ```bash
   supabase link --project-ref knrnlfsokkrtpvtkuuzr
   ```

3. **File .env có đầy đủ thông tin** (đã có ✅)

## 🚀 Ví dụ Sử Dụng

### Ví dụ 1: Thêm cột mới

**Bạn nói:**
> "Thêm cột priority vào bảng approvals"

**Cursor sẽ:**
1. Tạo migration: `supabase migration new add_priority_to_approvals`
2. Viết SQL:
   ```sql
   ALTER TABLE approvals ADD COLUMN priority INTEGER DEFAULT 0;
   ```
3. Push: `supabase db push`

### Ví dụ 2: Tạo bảng mới

**Bạn nói:**
> "Tạo bảng notifications với các cột id, user_id, message, read"

**Cursor sẽ:**
1. Tạo migration: `supabase migration new create_notifications_table`
2. Viết SQL CREATE TABLE
3. Push: `supabase db push`

### Ví dụ 3: Thêm index

**Bạn nói:**
> "Thêm index cho customer_name trong bảng approvals"

**Cursor sẽ:**
1. Tạo migration: `supabase migration new add_customer_name_index`
2. Viết SQL:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_approvals_customer_name ON approvals(customer_name);
   ```
3. Push: `supabase db push`

## ✅ Kiểm Tra Migrations

Xem tất cả migrations đã push:
- Dashboard: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/database/migrations
- Local: `ls -la supabase/migrations/`

## 🎯 Lợi Ích

- ✅ **Tự động hóa**: Cursor làm tất cả, bạn chỉ cần yêu cầu
- ✅ **An toàn**: Migrations được version control
- ✅ **Nhanh chóng**: Không cần vào Dashboard
- ✅ **Nhất quán**: Schema luôn sync giữa local và cloud

## 📚 Tài Liệu Tham Khảo

- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)


