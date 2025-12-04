# 🔧 Force 100% Supabase - Xóa hoàn toàn Google Apps Script

## ⚠️ Vấn đề

Một số chỗ vẫn đang dùng Google Apps Script:
1. `js/app.js` có function `callAPI` cũ (dòng 2149) vẫn gọi Google Apps Script
2. `js/init.js` và `js/app.js` vẫn set `hx-post` đến `API_URL` (Google Apps Script)

## ✅ Giải pháp

### 1. Xóa function callAPI cũ trong js/app.js

Function `callAPI` trong `js/app.js` đang override function từ `js/api.js`. Cần xóa function cũ.

### 2. Thay đổi htmx để dùng Supabase

Thay vì dùng `hx-post` trực tiếp đến Google Apps Script, cần:
- Tạo endpoint proxy Supabase
- Hoặc dùng JavaScript để handle lookup thay vì htmx

### 3. Tạo Supabase API endpoint

Hoặc tạo Supabase Edge Function để handle requests từ htmx.

## 📝 Cần làm

1. ✅ Xóa function `callAPI` cũ trong `js/app.js`
2. ✅ Cập nhật `initContractLookup` để dùng Supabase API
3. ✅ Kiểm tra tất cả chỗ dùng `API_URL` trực tiếp

