# 🔐 Cập nhật Logic Quyền Xem Tờ Trình

## ✅ Đã cập nhật

### 1. Logic hiển thị tờ trình (get_pending_list)

#### TPKD
- ✅ Chỉ xem được:
  - Tờ trình của chính mình (requester = username của họ)
  - Tờ trình mà TVBH trình cho họ (approver_step0 = username của họ)

#### Admin, GĐKD, BKS, BGĐ, KT
- ✅ Xem được tất cả tờ trình

#### TVBH/SALE
- ✅ Chỉ xem được tờ trình của mình

### 2. Logic in tờ trình (can_print)

#### Chỉ các role sau có thể in:
- ✅ Admin
- ✅ GĐKD (GDKD)
- ✅ BKS (Ban Kiểm Soát)
- ✅ BGĐ (BGD)
- ✅ KT (KETOAN)

#### Điều kiện:
- ✅ Chỉ có thể in tờ trình đã hoàn thành (current_step >= 4)

### 3. Template đã cập nhật

- ✅ Nút "In tờ trình" chỉ hiển thị khi:
  - `is_completed` = true
  - `can_print` = true (dựa vào role)

## 📝 Thay đổi chi tiết

### js/supabase-api.js

#### `supabaseGetPendingList`
- Thêm logic filter cho TPKD:
  ```javascript
  if (role === 'TPKD') {
      const isMyRequest = String(row.requester).toLowerCase() === usernameLower;
      const isAssignedToMe = String(row.approver_step0 || '').toLowerCase() === usernameLower;
      show = isMyRequest || isAssignedToMe;
  } else if (role === 'ADMIN' || role === 'GDKD' || role === 'BKS' || role === 'BGD' || role === 'KETOAN') {
      show = true; // Xem tất cả
  }
  ```
- Thêm flag `can_print`:
  ```javascript
  can_print: (role === 'ADMIN' || role === 'GDKD' || role === 'BKS' || role === 'BGD' || role === 'KETOAN') && isCompleted
  ```

#### `supabaseGetMyRequests`
- Cập nhật logic filter cho TPKD tương tự
- Thêm flag `can_print`

### js/app.js

#### `openDetail`
- Thêm logic kiểm tra quyền in:
  ```javascript
  const canPrintRoles = ['ADMIN', 'GDKD', 'BKS', 'BGD', 'KETOAN'];
  data.can_print = isCompleted && session && canPrintRoles.includes(session.role);
  ```

### components/templates.html

- Cập nhật nút in:
  ```html
  {{#is_completed}}
  {{#can_print}}
  <button onclick="printRequest('{{id}}')">In tờ trình</button>
  {{/can_print}}
  {{/is_completed}}
  ```

## ✅ Đã commit

- Commit: `feat: Cập nhật logic quyền xem tờ trình`
- Đã push lên GitHub

## 🧪 Test

### Test với TPKD
1. Login với `tpkd1` / `12345`
2. Chỉ thấy:
   - Tờ trình của chính mình (nếu có)
   - Tờ trình được TVBH trình cho mình (approver_step0 = tpkd1)
3. Không thấy nút "In tờ trình"

### Test với Admin/GĐKD/BKS/BGĐ/KT
1. Login với `admin` / `12345`
2. Thấy tất cả tờ trình
3. Thấy nút "In tờ trình" cho tờ trình đã hoàn thành

## 📊 Kết quả

- ✅ TPKD chỉ xem được tờ trình của mình hoặc được trình cho
- ✅ Admin, GĐKD, BKS, BGĐ, KT xem được tất cả và có thể in
- ✅ Nút in chỉ hiển thị cho role được phép

