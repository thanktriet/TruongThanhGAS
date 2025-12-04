# 📄 Hướng Dẫn Setup Google Apps Script Service

## 🎯 Mục Đích

Google Apps Script service này xử lý:
1. ✅ Upload file lên Google Drive (CCCD images, etc.)
2. ✅ Tạo Hợp đồng Mua Bán (HĐMB) từ template
3. ✅ Tạo Thỏa thuận lãi suất từ template
4. ✅ Tạo Đề nghị giải ngân từ template

## 📋 Bước 1: Tạo Google Apps Script Project

1. Truy cập: https://script.google.com/
2. Click **"New Project"**
3. Đặt tên project: `TruongThanh-Docs-Service` (hoặc tên bạn muốn)
4. Xóa code mặc định và copy toàn bộ nội dung từ file `google-scripts/docs-service.gs`

## 📋 Bước 2: Cấu Hình CONFIG

Trong file `Code.gs`, cập nhật các ID sau:

```javascript
const CONFIG = {
  // Folder IDs trên Google Drive
  FOLDER_ID_DON_HANG: "ID_THỰC_TẾ_CỦA_FOLDER",      // Folder lưu file đơn hàng
  FOLDER_ID_HOP_DONG: "ID_THỰC_TẾ_CỦA_FOLDER",      // Folder lưu hợp đồng
  FOLDER_ID_THOA_THUAN: "ID_THỰC_TẾ_CỦA_FOLDER",    // Folder lưu thỏa thuận
  FOLDER_ID_DE_NGHI: "ID_THỰC_TẾ_CỦA_FOLDER",       // Folder lưu đề nghị giải ngân
  
  // Template IDs (Google Docs templates)
  TEMPLATE_ID_HDMB: "ID_THỰC_TẾ_CỦA_TEMPLATE",      // Template Hợp đồng Mua Bán
  TEMPLATE_ID_DNGN: "ID_THỰC_TẾ_CỦA_TEMPLATE",      // Template Đề nghị Giải ngân
  
  // Template IDs cho Thỏa thuận lãi suất (theo ngân hàng)
  TEMPLATE_IDS_THOA_THUAN: {
    "techcom": "ID_THỰC_TẾ_CỦA_TEMPLATE",
    "vpbank": "ID_THỰC_TẾ_CỦA_TEMPLATE",
    "tpbank": "ID_THỰC_TẾ_CỦA_TEMPLATE",
    "bidv": "ID_THỰC_TẾ_CỦA_TEMPLATE",
    "sacombank": "ID_THỰC_TẾ_CỦA_TEMPLATE"
  }
};
```

### Cách lấy Folder ID:
1. Mở Google Drive
2. Tạo các folder cần thiết (hoặc dùng folder có sẵn)
3. Click vào folder → URL sẽ có dạng: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
4. Copy `FOLDER_ID_HERE`

### Cách lấy Template ID:
1. Tạo Google Docs template với placeholders (ví dụ: `{{so_hop_dong}}`, `{{khach_hang}}`)
2. Share template với Google Apps Script service account (hoặc Anyone with link - View)
3. URL của template: `https://docs.google.com/document/d/TEMPLATE_ID_HERE/edit`
4. Copy `TEMPLATE_ID_HERE`

## 📋 Bước 3: Deploy Web App

1. Trong Google Apps Script Editor, click **"Deploy"** → **"New deployment"**
2. Chọn type: **"Web app"**
3. Cấu hình:
   - **Description**: `TruongThanh Docs Service v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (hoặc `Anyone with Google account`)
4. Click **"Deploy"**
5. Copy **Web App URL** (sẽ có dạng: `https://script.google.com/macros/s/.../exec`)

## 📋 Bước 4: Cấu Hình Frontend

1. Copy Web App URL từ bước 3
2. Mở file `js/google-docs-config.js`
3. Cập nhật:
   ```javascript
   const GOOGLE_DOCS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
   ```
4. Lưu file

## 📋 Bước 5: Thêm Script vào HTML

Đảm bảo file `index.html` đã load:
```html
<script src="js/google-docs-config.js"></script>
<script src="js/google-docs-api.js"></script>
```

Kiểm tra trong `index.html` xem đã có chưa, nếu chưa thì thêm vào.

## ✅ Test

Sau khi setup xong, test các tính năng:

1. **Test Upload File**:
   - Vào trang "Nhập Đơn Hàng"
   - Chọn file CCCD
   - Upload và kiểm tra file đã lên Drive chưa

2. **Test Tạo HĐMB**:
   - Từ đơn hàng đã có mã
   - Click "Tạo HĐMB"
   - Kiểm tra file đã được tạo trong Drive chưa

## 📝 Lưu Ý

- Đảm bảo các template Google Docs có đúng placeholders (ví dụ: `{{so_hop_dong}}`, `{{khach_hang}}`)
- Các folder trên Drive cần có quyền phù hợp
- Service account cần có quyền edit trên các template
- Web App URL cần được cấu hình đúng trong frontend

## 🔗 File Tham Khảo

- `google-scripts/docs-service.gs` - Code Google Apps Script
- `js/google-docs-api.js` - Wrapper functions
- `js/google-docs-config.js` - Configuration

