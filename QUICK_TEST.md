# ⚡ Quick Test: Kiểm tra Supabase Deployment

## 🚀 Test Ngay

### 1. Test trên Production (Sau khi GitHub Pages deploy)

Mở trình duyệt và truy cập:

**Test Page:**
```
https://app.vinfastkiengiang.vn/test-supabase.html
```

**Hoặc GitHub Pages:**
```
https://thanktriet.github.io/TruongThanhGAS/test-supabase.html
```

### 2. Test Main App

```
https://app.vinfastkiengiang.vn/
```

Thử login với:
- Username: `admin`
- Password: `12345`

## ✅ Checklist Test

### Trong Test Page (`test-supabase.html`):

1. **Check Config** - Kiểm tra Supabase config đã load
2. **Test Connection** - Kiểm tra kết nối đến Supabase
3. **Test Login** - Đăng nhập với admin/12345
4. **Test Get Users** - Lấy danh sách users
5. **Test Get Approvals** - Lấy danh sách approvals
6. **Test Full API** - Test toàn bộ API flow

### Trong Main App:

1. ✅ Login thành công
2. ✅ Xem được dashboard
3. ✅ Tạo tờ trình được
4. ✅ Xem danh sách tờ trình
5. ✅ Duyệt/từ chối được

## 🐛 Nếu có lỗi

### Lỗi CORS
1. Vào Supabase Dashboard: https://app.supabase.com/project/knrnlfsokkrtpvtkuuzr/settings/api
2. Thêm domain vào **Additional Allowed Origins**:
   - `https://app.vinfastkiengiang.vn`
   - `https://thanktriet.github.io`

### Lỗi Authentication
- Kiểm tra anon key trong `js/supabase-config.js`
- Kiểm tra RLS policies trong Supabase Dashboard

### Lỗi Table không tồn tại
- Chạy migrations: `supabase db push`
- Hoặc chạy SQL trên Supabase Dashboard

## 📊 Xem Logs

### Browser Console (F12)
- Xem JavaScript errors
- Xem API responses
- Debug các functions

### Supabase Dashboard
- Vào Logs để xem database queries
- Vào Table Editor để xem data
- Vào Settings để kiểm tra config

## ✅ Kết Quả Mong Đợi

### Test Page
- Tất cả tests đều pass ✅
- Không có errors trong console
- Data được load từ Supabase

### Main App
- Login thành công
- Tất cả functions hoạt động
- Data sync với Supabase

## 🎯 Next Steps

Sau khi test thành công:
1. ✅ Xóa file `test-supabase.html` nếu không cần
2. ✅ Monitor logs trong Supabase Dashboard
3. ✅ Backup database thường xuyên

