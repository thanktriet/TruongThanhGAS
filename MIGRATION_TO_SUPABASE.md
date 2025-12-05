# 🔄 Migration: Chuyển Frontend sang Supabase Backend

## ✅ Đã hoàn thành

### 1. Cấu hình Supabase
- ✅ Thêm Supabase client library vào `index.html`
- ✅ Tạo `js/supabase-config.js` với cấu hình
- ✅ Thêm crypto-js cho password hashing

### 2. API Functions đã migrate
- ✅ `login` - Đăng nhập
- ✅ `change_password` - Đổi mật khẩu
- ✅ `submit_request` - Tạo tờ trình
- ✅ `get_pending_list` - Danh sách chờ duyệt
- ✅ `get_my_requests` - Danh sách tờ trình của user
- ✅ `approve_reject` - Duyệt/Từ chối
- ✅ `get_request_detail` - Chi tiết tờ trình
- ✅ `update_request` - Cập nhật tờ trình
- ✅ `resubmit` - Gửi lại đơn

### 3. Tự động chuyển đổi
- ✅ `callAPI()` tự động dùng Supabase nếu có
- ✅ Fallback về Google Apps Script nếu Supabase chưa sẵn sàng
- ✅ Tương thích ngược với code hiện tại

## ⚠️ Chưa migrate (vẫn dùng Google Apps Script)

Các actions sau vẫn cần Google Apps Script:
- `lookup_contract` - Tra cứu hợp đồng (cần truy cập Google Sheets external)
- `get_profile` - Lấy profile user
- `update_profile` - Cập nhật profile
- `list_users` - Danh sách users (Admin)
- `create_user` - Tạo user (Admin)
- `update_user` - Cập nhật user (Admin)
- `reset_user_password` - Reset password (Admin)
- `get_users_by_role` - Lấy users theo role
- `update_productivity_bonus` - Cập nhật lương năng suất

## 🚀 Cách sử dụng

### Frontend tự động chuyển sang Supabase

Không cần thay đổi code! Hệ thống tự động:
1. Kiểm tra Supabase API có sẵn không
2. Nếu có → dùng Supabase
3. Nếu không → dùng Google Apps Script (fallback)

### Test Migration

1. **Mở browser console** (F12)
2. **Kiểm tra Supabase đã load:**
   ```javascript
   console.log(window.supabaseAPI);
   ```

3. **Test login:**
   ```javascript
   callAPI({ action: 'login', username: 'admin', password: '12345' });
   ```

4. **Kiểm tra log:**
   - Nếu thấy "Using Supabase API" → Đã dùng Supabase ✅
   - Nếu thấy "Using Google Apps Script API" → Đang dùng fallback

## 🔧 Cấu hình

### File: `js/supabase-config.js`

Cập nhật nếu cần thay đổi Supabase URL hoặc key:
```javascript
const SUPABASE_URL = 'https://knrnlfsokkrtpvtkuuzr.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### File: `js/api.js`

Tự động chuyển đổi giữa Supabase và Google Apps Script.

## 📝 Lưu ý

1. **Password Hashing:**
   - Hiện tại dùng MD5 (giống code.gs)
   - Nên migrate sang bcrypt trong tương lai

2. **Error Handling:**
   - Tất cả errors được catch và trả về format chuẩn
   - Console log để debug

3. **Performance:**
   - Supabase nhanh hơn Google Apps Script
   - Real-time updates có thể dùng Supabase Realtime

## 🎯 Bước tiếp theo

1. **Test tất cả functions** đã migrate
2. **Migrate các functions còn lại** (user management, lookup_contract)
3. **Tối ưu performance** với indexes và queries
4. **Thêm real-time updates** với Supabase Realtime

## 🐛 Troubleshooting

### Supabase không hoạt động
- Kiểm tra `js/supabase-config.js` có đúng URL và key không
- Kiểm tra browser console có lỗi không
- Kiểm tra network tab xem có request đến Supabase không

### Vẫn dùng Google Apps Script
- Kiểm tra `window.supabaseAPI` có tồn tại không
- Kiểm tra thứ tự load script trong `index.html`
- Xem console log để biết đang dùng API nào


