# 🔧 Fix Lỗi: setHeaders is not a function

## ❌ Lỗi

```
TypeError: ContentService.createTextOutput(...).setMimeType(...).setHeaders is not a function
```

## 🔍 Nguyên Nhân

Google Apps Script `ContentService.createTextOutput()` **KHÔNG có method `.setHeaders()`**. 

Đây là hạn chế của Google Apps Script - không thể set custom HTTP headers trực tiếp trong ContentService.

## ✅ Đã Sửa

### 1. Xóa Tất Cả `.setHeaders()` Calls

Đã xóa tất cả `.setHeaders()` vì method này không tồn tại:

```javascript
// ❌ SAI - setHeaders() không tồn tại
return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({ ... }); // ❌ Lỗi!

// ✅ ĐÚNG - Chỉ dùng setMimeType()
return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
```

### 2. Đổi `createCORSResponse()` thành `createJSONResponse()`

Function helper đã được đổi tên và đơn giản hóa:

```javascript
function createJSONResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. doOptions() Đã Được Sửa

```javascript
function doOptions(e) {
  // Handle CORS preflight requests
  // Google Apps Script tự động xử lý OPTIONS nếu deploy với "Anyone" access
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

## ⚠️ Lưu Ý Quan Trọng

### Google Apps Script Không Hỗ Trợ Set CORS Headers Trực Tiếp

Google Apps Script Web App **KHÔNG cho phép** set custom HTTP headers như:
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`

### CORS Được Xử Lý Qua Deployment Settings

CORS được xử lý qua cài đặt deployment:

1. **Execute as**: Me (your-email@example.com)
2. **Who has access**: **Anyone** (quan trọng nhất)

Khi deploy với "Who has access: Anyone", Google Apps Script sẽ tự động thêm một số CORS headers cơ bản, nhưng vẫn không đủ để fix hoàn toàn vấn đề CORS.

## 🔄 Giải Pháp Thực Tế

Vì Google Apps Script không thể set CORS headers trực tiếp, có 2 cách:

### Cách 1: Chấp Nhận Hạn Chế CORS

- Code sẽ không có lỗi syntax nữa
- Vẫn có thể gặp CORS issues
- File có thể upload thành công nhưng response bị chặn

### Cách 2: Chuyển Sang Supabase Storage (Khuyến Nghị)

- Upload files lên Supabase Storage (không có CORS)
- Google Apps Script chỉ dùng cho document generation
- Xem `SETUP_SUPABASE_STORAGE.md` để biết cách setup

## 📋 Cần Làm

1. ✅ Code đã được sửa - không còn lỗi syntax
2. ⏳ Copy code mới vào Google Apps Script
3. ⏳ Deploy lại Google Apps Script
4. ⏳ Test lại các functions

Sau khi deploy lại, code sẽ không còn lỗi syntax, nhưng CORS issues vẫn có thể xảy ra do hạn chế của Google Apps Script.

