# 🧪 Test Supabase Deployment

## Cách Test

### 1. Test Local (Trước khi deploy)

```bash
# Chạy local server
python3 -m http.server 8000

# Hoặc
npx serve .
```

Sau đó mở: `http://localhost:8000/test-supabase.html`

### 2. Test trên Production

Sau khi deploy, mở:
- `https://app.vinfastkiengiang.vn/test-supabase.html`
- Hoặc: `https://thanktriet.github.io/TruongThanhGAS/test-supabase.html`

### 3. Test trong Browser Console

Mở browser console (F12) và chạy:

```javascript
// 1. Kiểm tra Supabase config
console.log('Supabase Config:', window.SUPABASE_CONFIG);
console.log('Supabase Client:', window.supabaseClient);
console.log('Supabase API:', window.supabaseAPI);

// 2. Test connection
window.supabaseClient.from('users').select('count', { count: 'exact', head: true })
  .then(result => console.log('Connection test:', result));

// 3. Test login
callAPI({ action: 'login', username: 'admin', password: '12345' })
  .then(result => console.log('Login test:', result));
```

## Checklist Test

- [ ] Supabase config được load
- [ ] Supabase client được khởi tạo
- [ ] Connection thành công
- [ ] Login thành công
- [ ] Get users thành công
- [ ] Get approvals thành công

## Lỗi Thường Gặp

### 1. Supabase config chưa load
**Nguyên nhân:** File `js/supabase-config.js` chưa được load
**Giải pháp:** Kiểm tra thứ tự load script trong `index.html`

### 2. CORS Error
**Nguyên nhân:** Supabase chưa cấu hình CORS cho domain
**Giải pháp:** Vào Supabase Dashboard → Settings → API → Thêm domain vào allowed origins

### 3. Authentication Error
**Nguyên nhân:** Anon key không đúng hoặc RLS (Row Level Security) bật
**Giải pháp:** 
- Kiểm tra anon key trong `js/supabase-config.js`
- Tắt RLS hoặc cấu hình policies

### 4. Table không tồn tại
**Nguyên nhân:** Migration chưa được push lên Supabase
**Giải pháp:** Chạy `supabase db push` hoặc chạy SQL trên Dashboard

## Test Functions

### Test Login
```javascript
callAPI({ action: 'login', username: 'admin', password: '12345' })
```

### Test Get Pending List
```javascript
const user = JSON.parse(localStorage.getItem('user_session'));
callAPI({ action: 'get_pending_list', username: user.username, role: user.role })
```

### Test Create Request
```javascript
callAPI({ 
    action: 'submit_request',
    requester: 'admin',
    contract_code: 'TEST001',
    customer_name: 'Test Customer',
    // ... other fields
})
```

## Kết Quả Mong Đợi

### ✅ Success
- Console không có lỗi
- API calls trả về `success: true`
- Data được load từ Supabase

### ❌ Failure
- Console có lỗi CORS, authentication, hoặc network
- API calls trả về `success: false`
- Data không được load

## Debug Steps

1. **Mở Browser Console (F12)**
2. **Kiểm tra Network tab:**
   - Xem requests đến Supabase
   - Kiểm tra status codes
   - Xem response data

3. **Kiểm tra Supabase Dashboard:**
   - Vào Table Editor xem data
   - Vào Logs xem errors
   - Vào Settings → API xem config

4. **Kiểm tra Browser Console:**
   - Xem JavaScript errors
   - Xem console logs từ code
   - Test các functions trực tiếp

## Quick Test URL

Sau khi deploy, test ngay:
- Test page: `https://app.vinfastkiengiang.vn/test-supabase.html`
- Main app: `https://app.vinfastkiengiang.vn/`


