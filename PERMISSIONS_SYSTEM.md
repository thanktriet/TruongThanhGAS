# HỆ THỐNG PHÂN QUYỀN CHI TIẾT

## Tổng quan

Hệ thống cho phép ADMIN có thể bật/tắt (on/off) các quyền chi tiết cho từng user, thay vì chỉ dựa vào role cố định.

## Cấu trúc

### 1. Database Schema

```sql
-- Cột permissions (JSONB) trong bảng users
ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '{}';
CREATE INDEX idx_users_permissions ON users USING GIN (permissions);
```

### 2. Permissions Structure

```json
{
  "create_request": true,
  "view_my_requests": true,
  "view_all_requests": false,
  "approve_request": false,
  "edit_request": true,
  "print_request": true,
  "resubmit_request": true,
  "create_order": true,
  "view_my_orders": true,
  "view_all_orders": false,
  "edit_order": false,
  "assign_contract_code": false,
  "view_order_detail": true,
  "create_hdmb": true,
  "create_thoa_thuan": true,
  "create_de_nghi": true,
  "submit_daily_report": true,
  "view_reports": false,
  "view_dashboard": false,
  "manage_users": false,
  "manage_permissions": false
}
```

## Danh sách Permissions

### A. TỜ TRÌNH (Approval Requests)
- `create_request` - Tạo tờ trình
- `view_my_requests` - Xem tờ trình của mình
- `view_all_requests` - Xem tất cả tờ trình
- `approve_request` - Duyệt tờ trình
- `edit_request` - Sửa tờ trình
- `print_request` - In tờ trình
- `resubmit_request` - Gửi lại tờ trình

### B. ĐƠN HÀNG (Orders)
- `create_order` - Tạo đơn hàng
- `view_my_orders` - Xem đơn hàng của mình
- `view_all_orders` - Xem tất cả đơn hàng
- `edit_order` - Sửa đơn hàng
- `assign_contract_code` - Cấp mã đơn hàng
- `view_order_detail` - Xem chi tiết đơn hàng

### C. TÀI LIỆU (Documents)
- `create_hdmb` - Tạo Hợp đồng Mua Bán
- `create_thoa_thuan` - Tạo Thỏa thuận lãi suất
- `create_de_nghi` - Tạo Đề nghị giải ngân

### D. BÁO CÁO (Reports)
- `submit_daily_report` - Nhập báo cáo ngày
- `view_reports` - Xem báo cáo
- `view_dashboard` - Xem Dashboard

### E. HỆ THỐNG (System)
- `manage_users` - Quản lý users
- `manage_permissions` - Quản lý permissions

## Default Permissions theo Role

### ADMIN
- Tất cả quyền = `true` (luôn có full access)

### TVBH / SALE
- Tạo và quản lý tờ trình của mình
- Tạo và quản lý đơn hàng
- Tạo documents (HDMB, TTLS, ĐNGN)
- Nhập báo cáo ngày

### SALEADMIN
- Quản lý tất cả đơn hàng
- Cấp mã đơn hàng
- Duyệt tờ trình

### TPKD / GDKD / BKS / BGD / KETOAN
- Duyệt tờ trình
- Xem báo cáo (tùy role)

## Cách sử dụng

### 1. Quản lý Permissions (ADMIN only)

1. Đăng nhập với tài khoản ADMIN
2. Vào tab **"Quản Lý Users"**
3. Tìm user cần quản lý quyền
4. Click button **"Quyền"** (màu tím) ở cột "Hành động"
5. Modal sẽ hiển thị:
   - Thông tin user (username, họ tên, role)
   - Tất cả permissions được nhóm theo category
   - Checkbox để bật/tắt từng quyền
6. Các thao tác:
   - Bật/tắt từng quyền bằng checkbox
   - Click **"Áp dụng quyền mặc định theo role"** để reset về defaults
   - Click **"Lưu Quyền"** để lưu thay đổi

### 2. Sử dụng trong Code

```javascript
// Check single permission
if (hasPermission(user, 'create_order')) {
    // User có quyền tạo đơn hàng
}

// Check multiple permissions (AND)
if (hasAllPermissions(user, ['create_order', 'view_my_orders'])) {
    // User có cả 2 quyền
}

// Check multiple permissions (OR)
if (hasAnyPermission(user, ['view_all_orders', 'view_all_requests'])) {
    // User có ít nhất 1 trong 2 quyền
}

// Get all permissions
const permissions = getUserPermissions(user);
```

### 3. Logic Fallback

- **Nếu user có `permissions` (không rỗng)**: Dùng custom permissions
- **Nếu không có**: Dùng default permissions theo role
- **Nếu là ADMIN**: Luôn có tất cả quyền (không cần check)

## API Functions

### Update User Permissions

```javascript
const result = await callAPI({
    action: 'update_user_permissions',
    username: 'admin',
    role: 'ADMIN',
    target_username: 'tvbh1',
    permissions: {
        create_order: true,
        view_my_orders: true,
        view_all_orders: false
    }
});
```

### List Users (includes permissions)

```javascript
const result = await callAPI({
    action: 'list_users',
    username: 'admin',
    role: 'ADMIN'
});
// result.users[0].permissions = { ... }
```

## Migration

Chạy migration để thêm cột permissions:

```bash
# Migration file: supabase/migrations/20251205120000_add_user_permissions.sql
```

## Files

- `supabase/migrations/20251205120000_add_user_permissions.sql` - Migration
- `js/permissions.js` - Helper functions
- `components/modals-user-permissions.html` - Modal UI
- `js/supabase-api.js` - API functions (update_user_permissions)

## Lưu ý

1. **Backup**: Luôn backup database trước khi chạy migration
2. **Permissions rỗng**: Nếu `permissions = {}` hoặc `null`, hệ thống sẽ dùng default permissions theo role
3. **ADMIN**: ADMIN luôn có tất cả quyền, không cần check permissions
4. **Performance**: Index GIN được tạo để query permissions nhanh hơn

## Ví dụ sử dụng

### Example 1: Tạo đơn hàng

```javascript
// Thay vì:
if (user.role === 'TVBH' || user.role === 'SALE') {
    // Allow create order
}

// Dùng:
if (hasPermission(user, 'create_order')) {
    // Allow create order
}
```

### Example 2: Xem tất cả đơn hàng

```javascript
// Thay vì:
if (user.role === 'SALEADMIN' || user.role === 'ADMIN') {
    // Show all orders
}

// Dùng:
if (hasPermission(user, 'view_all_orders')) {
    // Show all orders
}
```

### Example 3: Dashboard

```javascript
// Thay vì:
if (['ADMIN', 'GDKD', 'BKS', 'BGD'].includes(user.role)) {
    // Show dashboard
}

// Dùng:
if (hasPermission(user, 'view_dashboard')) {
    // Show dashboard
}
```

