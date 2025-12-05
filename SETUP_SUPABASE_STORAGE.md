# 📦 Setup Supabase Storage cho Upload Files

## 🎯 Mục Đích

Thay thế Google Drive upload bằng Supabase Storage để tránh hoàn toàn vấn đề CORS.

## ✅ Ưu Điểm

- ✅ **Không có CORS issues** - Supabase hỗ trợ CORS tốt
- ✅ **Nhanh hơn** - Upload trực tiếp, không qua Google Apps Script
- ✅ **Tích hợp tốt** - Cùng hệ thống với database
- ✅ **Dễ quản lý** - Quản lý qua Supabase Dashboard

## 📋 Các Bước Setup

### 1. Tạo Storage Bucket

1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Storage** → **Buckets**
4. Click **New bucket**
5. Điền thông tin:
   - **Name**: `order-files`
   - **Public bucket**: ✅ **Bật** (để có thể truy cập file qua URL public)
   - **File size limit**: 50MB (hoặc theo nhu cầu)
   - **Allowed MIME types**: Để trống (cho phép tất cả) hoặc `image/*,application/pdf`
6. Click **Create bucket**

### 2. Cấu Hình RLS Policies

Sau khi tạo bucket, cần cấu hình Row Level Security (RLS) policies:

#### Option 1: Public Bucket (Dễ nhất)

Nếu bucket là public, chỉ cần policy để upload:

```sql
-- Policy để upload files (cho authenticated users)
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-files');

-- Policy để đọc files (public)
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'order-files');
```

#### Option 2: Authenticated Only

Nếu muốn chỉ authenticated users mới upload/đọc được:

```sql
-- Policy để upload
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-files');

-- Policy để đọc
CREATE POLICY "Allow authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'order-files');
```

### 3. Chạy SQL trên Supabase

1. Vào Supabase Dashboard → **SQL Editor**
2. Tạo file mới
3. Copy SQL policies ở trên
4. Chạy SQL

Hoặc tạo migration file:

```sql
-- File: supabase/migrations/YYYYMMDDHHMMSS_add_storage_policies.sql

-- Policy để upload files
CREATE POLICY "Allow authenticated users to upload to order-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-files');

-- Policy để đọc files (public)
CREATE POLICY "Allow public read from order-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'order-files');
```

### 4. Test Upload

Sau khi setup, test bằng trang `test-upload-file.html` hoặc trong form tạo đơn hàng.

## 🔧 Code Đã Sẵn Sàng

Code đã được tạo sẵn trong:
- `js/supabase-storage-api.js` - API để upload lên Supabase Storage
- `components/order-create.html` - Đã được cập nhật để ưu tiên Supabase Storage

## 📝 Checklist

- [ ] Tạo bucket `order-files` trên Supabase
- [ ] Đặt bucket là **Public**
- [ ] Tạo RLS policies (copy SQL ở trên)
- [ ] Test upload bằng `test-upload-file.html`
- [ ] Test upload trong form tạo đơn hàng

## 🚀 Sau Khi Setup

1. Code sẽ tự động ưu tiên Supabase Storage
2. Nếu Supabase Storage không có, sẽ fallback sang Google Drive
3. Upload sẽ hoạt động ngay mà không có CORS error

## 💡 Lưu Ý

- Bucket name phải là `order-files` (hoặc cập nhật trong code)
- Đảm bảo bucket là public nếu muốn truy cập file qua URL
- Kiểm tra file size limit (mặc định 50MB)

