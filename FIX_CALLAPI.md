# 🔧 Fix: callAPI function không tồn tại

## ✅ Đã sửa

1. **Export callAPI ra window:**
   - Thêm `window.callAPI = callAPI;` vào cuối file `js/api.js`
   - Giờ `callAPI` có thể được gọi từ bất kỳ đâu

2. **Cải thiện test page:**
   - Thêm kiểm tra và retry nếu `callAPI` chưa load
   - Log thông báo rõ ràng hơn

## 📋 Thứ tự load script trong test page

Đã được sắp xếp đúng:
1. `js/config.js` - Config cơ bản
2. `js/supabase-config.js` - Supabase config
3. `js/utils.js` - Utility functions
4. `js/api.js` - **callAPI function** ✅
5. `js/supabase-api.js` - Supabase API functions

## 🧪 Test lại

Sau khi GitHub Pages deploy, test lại:

```javascript
// Trong browser console (F12)
console.log('callAPI:', typeof window.callAPI);
// Phải là: "function"

// Test gọi API
callAPI({ action: 'login', username: 'admin', password: '12345' })
  .then(result => console.log('Result:', result));
```

## ✅ Đã push

- Commit: `18b6763 - fix: Export callAPI ra window và cải thiện test page`
- Đã push lên GitHub

## 🔍 Nếu vẫn gặp lỗi

1. **Kiểm tra thứ tự load:**
   - Mở Network tab (F12)
   - Kiểm tra tất cả file `.js` đều load thành công

2. **Kiểm tra console errors:**
   - Xem có lỗi JavaScript nào không
   - Xem có lỗi 404 (file không tìm thấy) không

3. **Test thủ công:**
   ```javascript
   // Kiểm tra từng bước
   console.log('1. Config:', window.SUPABASE_CONFIG);
   console.log('2. Supabase lib:', typeof window.supabase);
   console.log('3. callAPI:', typeof window.callAPI);
   console.log('4. supabaseAPI:', typeof window.supabaseAPI);
   ```

