# 🔧 Fix CORS Error với Google Apps Script

## ⚠️ Vấn đề

Khi gọi Google Apps Script Web App từ domain khác (`app.vinfastkiengiang.vn`), gặp lỗi CORS:

```
Access to fetch at 'https://script.google.com/macros/s/.../exec' from origin 'https://app.vinfastkiengiang.vn' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Nguyên nhân

Google Apps Script Web App **KHÔNG hỗ trợ CORS headers** tốt. Khi gọi từ domain khác, browser sẽ chặn request vì thiếu CORS headers.

## ✅ Giải pháp

### Cách 1: Sử dụng FormData (Recommended)

Google Apps Script hỗ trợ FormData tốt hơn JSON cho cross-origin requests:

```javascript
const formData = new FormData();
formData.append('action', 'upload_files');
formData.append('files', JSON.stringify(fileData));
```

### Cách 2: Deploy lại Google Apps Script với đúng cấu hình

1. Vào [Google Apps Script Editor](https://script.google.com)
2. Chọn project của bạn
3. Click **Deploy** → **New deployment**
4. Chọn type: **Web app**
5. Settings:
   - **Execute as**: Me (your-email@example.com)
   - **Who has access**: **Anyone**
6. Click **Deploy**
7. Copy URL mới và cập nhật vào `js/google-docs-config.js`

### Cách 3: Sử dụng Proxy Server (Nếu cần)

Tạo một proxy server để bypass CORS:

```javascript
// Call through your own server
const response = await fetch('/api/google-script-proxy', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        scriptUrl: GOOGLE_APPS_SCRIPT_URL,
        action: 'upload_files',
        files: fileData
    })
});
```

### Cách 4: Sử dụng JSONP (Không recommended cho POST)

JSONP chỉ hoạt động với GET requests, không phù hợp cho upload files.

## 📝 Cần làm

1. ✅ Sửa `js/google-docs-api.js` để sử dụng FormData
2. ⚠️ Kiểm tra lại Google Apps Script deployment settings
3. ⚠️ Nếu vẫn không được, cần deploy lại với đúng cấu hình

## 🔄 Cách deploy lại Google Apps Script

1. Mở [Google Apps Script](https://script.google.com)
2. Chọn project
3. Click **Deploy** → **Manage deployments**
4. Click **Edit** (biểu tượng bút chì) trên deployment hiện tại
5. Đảm bảo:
   - **Execute as**: Me
   - **Who has access**: **Anyone**
6. Click **Deploy**
7. Copy URL mới
8. Cập nhật URL trong `js/google-docs-config.js`

## 💡 Alternative: Upload files trực tiếp lên Supabase Storage

Nếu CORS vẫn là vấn đề, có thể upload files lên Supabase Storage thay vì Google Drive:

1. Tạo Supabase Storage bucket
2. Upload files bằng Supabase client
3. Lưu URL vào database

Cách này tránh được vấn đề CORS hoàn toàn.

