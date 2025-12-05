# 🔄 Giải Pháp Thay Thế: Upload Files lên Supabase Storage

## ⚠️ Vấn Đề CORS với Google Apps Script

Google Apps Script Web App **KHÔNG hỗ trợ CORS tốt** khi gọi từ domain khác, ngay cả khi deploy với "Who has access: Anyone". Đây là hạn chế của Google Apps Script.

## ✅ Giải Pháp: Sử dụng Supabase Storage

Thay vì upload lên Google Drive qua Google Apps Script, chúng ta có thể upload trực tiếp lên **Supabase Storage**, tránh hoàn toàn vấn đề CORS.

### Ưu Điểm:
- ✅ Không có vấn đề CORS
- ✅ Nhanh hơn (không qua Google Apps Script)
- ✅ Tích hợp tốt với Supabase database
- ✅ Dễ quản lý và kiểm soát

### Nhược Điểm:
- ⚠️ Cần cấu hình Supabase Storage bucket
- ⚠️ Không dùng Google Drive nữa

## 📋 Các Bước Thực Hiện

### 1. Tạo Supabase Storage Bucket

1. Vào Supabase Dashboard
2. Chọn project
3. Vào **Storage** → **Buckets**
4. Click **New bucket**
5. Tên: `order-files` hoặc `cccd-images`
6. **Public bucket**: Bật (để có thể truy cập file qua URL)
7. Click **Create bucket**

### 2. Cấu Hình RLS Policies (Row Level Security)

Tạo policy để cho phép upload/read files:

```sql
-- Policy để upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-files');

-- Policy để đọc files
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'order-files');
```

Hoặc đơn giản hơn, nếu bucket là public:

```sql
-- Policy để ai cũng có thể upload (nếu cần)
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'order-files');

-- Policy để ai cũng có thể đọc
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'order-files');
```

### 3. Cập Nhật Code Frontend

Tạo function mới để upload lên Supabase Storage:

```javascript
// Upload files lên Supabase Storage
async function uploadFilesToSupabaseStorage(files, folder = 'cccd') {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return {
                success: false,
                message: 'Supabase chưa được khởi tạo'
            };
        }

        if (!files || files.length === 0) {
            return { success: true, urls: [] };
        }

        const fileArray = Array.from(files);
        const uploadedFiles = [];

        for (const file of fileArray) {
            const fileName = `${folder}/${Date.now()}_${file.name}`;
            const filePath = `order-files/${fileName}`;

            const { data, error } = await supabase.storage
                .from('order-files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Upload error:', error);
                continue;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('order-files')
                .getPublicUrl(filePath);

            uploadedFiles.push({
                name: file.name,
                url: urlData.publicUrl,
                path: filePath
            });
        }

        return {
            success: true,
            urls: uploadedFiles,
            message: `Đã upload ${uploadedFiles.length} file thành công`
        };
    } catch (error) {
        console.error('Upload to Supabase Storage error:', error);
        return {
            success: false,
            message: 'Lỗi upload file: ' + error.message
        };
    }
}
```

### 4. Cập Nhật order-create.html

Thay thế `window.googleDocsAPI.uploadFiles` bằng `uploadFilesToSupabaseStorage`:

```javascript
// Thay vì:
const uploadResult = await window.googleDocsAPI.uploadFiles(fileList);

// Dùng:
const uploadResult = await uploadFilesToSupabaseStorage(fileList, 'cccd');
```

## 🔄 Migration Path

Có thể làm từng bước:

1. **Phase 1**: Giữ cả 2 cách (Google Drive và Supabase Storage)
   - Thử upload lên Google Drive trước
   - Nếu fail, fallback sang Supabase Storage

2. **Phase 2**: Chuyển hoàn toàn sang Supabase Storage
   - Xóa dependency vào Google Apps Script cho upload
   - Chỉ dùng Google Apps Script cho document generation

## 💡 Recommendation

**Khuyến nghị**: Chuyển sang Supabase Storage vì:
- Tránh hoàn toàn vấn đề CORS
- Nhanh hơn và đáng tin cậy hơn
- Dễ quản lý và scale

## 📝 Next Steps

1. Tạo Supabase Storage bucket
2. Cấu hình RLS policies
3. Implement function upload lên Supabase
4. Test và migrate

Bạn có muốn tôi implement giải pháp Supabase Storage không?

