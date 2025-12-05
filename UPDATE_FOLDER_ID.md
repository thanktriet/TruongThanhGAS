# 📁 Cập Nhật Folder ID cho Upload Ảnh

## ✅ Đã Cập Nhật

Folder ID đã được cấu hình trong `google-scripts/docs-service.gs`:

```javascript
FOLDER_ID_DON_HANG: "1lmJ-rnhK6J-EQvFHKtem7XDfbjvGEaRg"
```

Folder này sẽ được dùng để:
- Upload ảnh CCCD mặt trước
- Upload ảnh CCCD mặt sau
- Upload các file đính kèm trong đơn hàng

## ⚠️ Quan Trọng - Cần Làm Ngay

### 1. Copy Code Mới vào Google Apps Script

1. Mở file `google-scripts/docs-service.gs`
2. Copy toàn bộ nội dung
3. Vào [Google Apps Script Editor](https://script.google.com)
4. Mở project của bạn
5. Paste code mới vào editor
6. Click **Save** (Ctrl+S hoặc Cmd+S)

### 2. Deploy Lại Google Apps Script

1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (biểu tượng bút chì) trên deployment hiện tại
3. Đảm bảo cấu hình:
   - **Execute as**: Me (your-email@example.com)
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. Copy URL mới (nếu có) và cập nhật vào `js/google-docs-config.js` nếu URL thay đổi

### 3. Test Upload File

1. Đăng nhập với tài khoản TVBH
2. Vào "Nhập Đơn Hàng"
3. Điền thông tin khách hàng
4. Upload file ảnh CCCD mặt trước và sau
5. Click "Lưu Đơn Hàng"
6. Kiểm tra:
   - Console logs để xem upload có thành công không
   - Google Drive folder để xem file đã được upload chưa

## 🔍 Kiểm Tra Folder ID

Để kiểm tra folder ID có đúng không:

1. Mở folder trên Google Drive: `https://drive.google.com/drive/folders/1lmJ-rnhK6J-EQvFHKtem7XDfbjvGEaRg`
2. Đảm bảo bạn có quyền truy cập folder này
3. Đảm bảo Google Apps Script có quyền truy cập folder này

## 📝 Lưu Ý

- Folder ID không đổi khi copy code, chỉ cần cập nhật trong Google Apps Script editor
- Nếu folder ID sai, upload sẽ fail với error: "Folder không tồn tại"
- Đảm bảo Google Apps Script có quyền edit trên folder này

## ✅ Checklist

- [ ] Copy code mới vào Google Apps Script editor
- [ ] Save code
- [ ] Deploy lại với cấu hình đúng (Anyone access)
- [ ] Test upload file
- [ ] Kiểm tra file đã được upload vào folder chưa

