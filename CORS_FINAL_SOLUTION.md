# 🚨 Giải Pháp Cuối Cùng: CORS với Google Apps Script

## ⚠️ Vấn Đề Hiện Tại

File đã upload thành công lên Google Drive, nhưng vẫn báo lỗi CORS:
```
Access to fetch at 'https://script.google.com/...' from origin 'https://app.vinfastkiengiang.vn' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Nguyên Nhân

Google Apps Script Web App **KHÔNG hỗ trợ CORS tốt**, ngay cả khi:
- ✅ Đã thêm `doOptions()` function
- ✅ Đã thêm CORS headers trong responses
- ✅ Đã deploy với "Who has access: Anyone"

Đây là **hạn chế của Google Apps Script** - response headers không được set đúng cách.

## ✅ Giải Pháp: Chuyển Sang Supabase Storage

Code đã được chuẩn bị sẵn để dùng Supabase Storage. Chỉ cần:

### 1. Tạo Supabase Storage Bucket

1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Storage** → **Buckets**
4. Click **New bucket**
5. Điền:
   - **Name**: `order-files`
   - **Public bucket**: ✅ **Bật**
   - **File size limit**: 50MB
6. Click **Create bucket**

### 2. Cấu Hình RLS Policies

Vào **SQL Editor** và chạy:

```sql
-- Policy để upload files (authenticated users)
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

### 3. Code Đã Sẵn Sàng

Code đã được cấu hình để:
- ✅ Ưu tiên Supabase Storage (không có CORS)
- ✅ Fallback sang Google Drive (nếu Supabase không có)

### 4. Test Upload

Sau khi setup bucket, upload sẽ tự động dùng Supabase Storage và **không còn CORS error**.

## 📋 Checklist

- [ ] Tạo bucket `order-files` trên Supabase
- [ ] Bật Public bucket
- [ ] Tạo RLS policies (copy SQL ở trên)
- [ ] Test upload lại
- [ ] Kiểm tra file trong Supabase Storage

## 💡 Lưu Ý

Google Drive vẫn được dùng cho:
- ✅ Tạo HĐMB, TTLS, ĐNGN (document generation)
- ❌ KHÔNG dùng cho upload files (có CORS issue)

Upload files chỉ dùng **Supabase Storage**.

