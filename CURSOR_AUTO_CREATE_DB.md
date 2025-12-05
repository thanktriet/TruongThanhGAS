# 🚀 Cursor Tự Động Tạo Database trên Supabase

## ✅ Đã tạo Migration File

File migration đã được tạo: `supabase/migrations/20251204072507_initial_schema.sql`

Migration này sẽ tạo:
- ✅ Bảng `users` - Quản lý người dùng
- ✅ Bảng `approvals` - Lưu trữ tờ trình phê duyệt
- ✅ Bảng `logs` - Lịch sử hoạt động
- ✅ Indexes để tối ưu hiệu suất
- ✅ Triggers tự động cập nhật `updated_at`
- ✅ Dữ liệu mẫu (7 users mặc định)

## 📤 Cách Push Migration lên Supabase

### Cách 1: Push trực tiếp lên Supabase Cloud (Không cần Docker)

```bash
# Đảm bảo đã login và link project
supabase login
supabase link --project-ref knrnlfsokkrtpvtkuuzr

# Push migrations lên Supabase
supabase db push
```

Lệnh này sẽ:
- ✅ Tạo tất cả tables trên Supabase
- ✅ Tạo indexes và triggers
- ✅ Insert dữ liệu mẫu
- ✅ Không cần Docker!

### Cách 2: Chạy SQL trực tiếp trên Supabase Dashboard

1. Vào: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/sql/new
2. Copy toàn bộ nội dung file `supabase/migrations/20251204072507_initial_schema.sql`
3. Paste vào SQL Editor
4. Click **Run** hoặc nhấn `Cmd+Enter`

## 🔄 Cách Cursor Tự Động Tạo Database

### Bước 1: Tạo Migration File mới

Khi bạn muốn thay đổi schema, tạo migration mới:

```bash
supabase migration new your_migration_name
```

Ví dụ:
```bash
supabase migration new add_index_to_approvals
```

### Bước 2: Viết SQL trong Migration File

Mở file migration vừa tạo và viết SQL:

```sql
-- Thêm index mới
CREATE INDEX IF NOT EXISTS idx_approvals_customer_name ON approvals(customer_name);

-- Thêm cột mới
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS notes TEXT;
```

### Bước 3: Push lên Supabase

```bash
supabase db push
```

Cursor sẽ:
- ✅ Đọc file migration
- ✅ Tự động apply lên Supabase
- ✅ Giữ version control cho schema

## 📝 Workflow Khuyến Nghị

1. **Tạo migration mới:**
   ```bash
   supabase migration new feature_name
   ```

2. **Viết SQL trong file migration**

3. **Test local (nếu có Docker):**
   ```bash
   supabase db reset  # Reset và apply tất cả migrations
   ```

4. **Push lên Supabase:**
   ```bash
   supabase db pull  # Pull schema hiện tại (nếu cần)
   supabase db push  # Push migrations mới
   ```

## 🎯 Lợi ích

- ✅ **Version Control**: Tất cả thay đổi schema được lưu trong Git
- ✅ **Tự động**: Cursor có thể đọc và hiểu schema từ migration files
- ✅ **An toàn**: Có thể review SQL trước khi apply
- ✅ **Rollback**: Có thể tạo migration để rollback nếu cần
- ✅ **Team Work**: Mọi người có thể sync schema dễ dàng

## 🔍 Xem Schema hiện tại

```bash
# Xem tất cả migrations
ls -la supabase/migrations/

# Xem schema trên Supabase Dashboard
# https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/editor
```

## ⚠️ Lưu ý

- Migration files được chạy theo thứ tự timestamp
- Không sửa migration đã được push (tạo migration mới thay vì sửa)
- Luôn test migration trên staging trước khi push lên production
- Backup database trước khi chạy migration quan trọng

## 🚀 Bắt đầu ngay

Chạy lệnh sau để tạo database:

```bash
supabase db push
```

Hoặc chạy SQL trực tiếp trên Supabase Dashboard!


