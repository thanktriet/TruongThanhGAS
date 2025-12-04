# 🖨️ Cập nhật Quyền In Tờ Trình

## ✅ Đã cập nhật

### 1. Quyền in tờ trình

#### TVBH/SALE
- ✅ Có thể in tờ trình của chính mình khi hoàn tất

#### TPKD
- ✅ Có thể in tờ trình của chính mình khi hoàn tất
- ✅ Có thể in tờ trình được giao cho họ phê duyệt (approver_step0 = username) khi hoàn tất

#### Admin, GĐKD, BKS, BGĐ, KT
- ✅ Có thể in tất cả tờ trình đã hoàn tất

### 2. Logic đã cập nhật

#### `supabaseGetPendingList`
- Thêm logic kiểm tra quyền in cho từng role
- TVBH/SALE: `can_print = isRequester && isCompleted`
- TPKD: `can_print = (isMyRequest || isAssignedToMe) && isCompleted`
- Admin/GĐKD/BKS/BGĐ/KT: `can_print = isCompleted`

#### `supabaseGetMyRequests`
- Tương tự logic trên

#### `openDetail` (Frontend)
- Kiểm tra quyền in dựa vào:
  - Role của user
  - Có phải requester không
  - Có phải approver_step0 không (cho TPKD)

### 3. Template

- Nút "In tờ trình" chỉ hiển thị khi:
  - `is_completed` = true
  - `can_print` = true

## 📝 Thay đổi chi tiết

### js/supabase-api.js

#### `supabaseGetPendingList`
```javascript
// Tính can_print dựa vào role và quyền sở hữu
if (isCompleted) {
    if (role === 'ADMIN' || role === 'GDKD' || role === 'BKS' || role === 'BGD' || role === 'KETOAN') {
        item.can_print = true; // In được tất cả
    } else if (role === 'TVBH' || role === 'SALE') {
        item.can_print = isRequester; // Chỉ in được tờ trình của mình
    } else if (role === 'TPKD') {
        const isMyRequest = String(row.requester).toLowerCase() === usernameLower;
        const isAssignedToMe = String(row.approver_step0 || '').toLowerCase() === usernameLower;
        item.can_print = isMyRequest || isAssignedToMe; // In được tờ trình của mình hoặc được giao
    }
}
```

#### `supabaseGetMyRequests`
- Logic tương tự

#### `supabaseGetRequestDetail`
- Thêm `approver_step0` vào response để frontend có thể kiểm tra quyền in

### js/app.js

#### `openDetail`
```javascript
if (isCompleted && session) {
    const isRequester = data.requester.toLowerCase() === session.username.toLowerCase();
    
    if (canPrintRoles.includes(session.role)) {
        data.can_print = true; // Admin, GĐKD, BKS, BGĐ, KT
    } else if (session.role === 'TVBH' || session.role === 'SALE') {
        data.can_print = isRequester; // Chỉ tờ trình của mình
    } else if (session.role === 'TPKD') {
        const isMyRequest = isRequester;
        const isAssignedToMe = data.approver_step0 && 
                               data.approver_step0.toLowerCase() === session.username.toLowerCase();
        data.can_print = isMyRequest || isAssignedToMe; // Tờ trình của mình hoặc được giao
    }
}
```

## ✅ Đã commit

- Commit: `feat: Cập nhật quyền in - TVBH/TPKD có thể in tờ trình của mình, TPKD có thể in tờ trình được giao khi hoàn tất`
- Đã push lên GitHub

## 🧪 Test

### Test với TVBH
1. Login với `sale1` / `12345`
2. Tạo tờ trình mới
3. Sau khi hoàn tất, có thể thấy nút "In tờ trình"

### Test với TPKD
1. Login với `tpkd1` / `12345`
2. Thấy nút "In tờ trình" cho:
   - Tờ trình của chính mình (nếu có)
   - Tờ trình được TVBH trình cho (approver_step0 = tpkd1) khi hoàn tất

### Test với Admin/GĐKD/BKS/BGĐ/KT
1. Login với `admin` / `12345`
2. Thấy nút "In tờ trình" cho tất cả tờ trình đã hoàn tất

## 📊 Kết quả

- ✅ TVBH có thể in tờ trình của chính mình khi hoàn tất
- ✅ TPKD có thể in tờ trình của mình hoặc được giao khi hoàn tất
- ✅ Admin, GĐKD, BKS, BGĐ, KT có thể in tất cả tờ trình đã hoàn tất

