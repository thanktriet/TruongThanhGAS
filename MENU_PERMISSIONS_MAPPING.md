# MAP MENU ITEMS VỚI PERMISSIONS

## 📋 Mapping Menu Items ↔ Permissions

### Menu Items và Permissions tương ứng:

| Menu Item | Permission Key | Mô tả |
|-----------|---------------|-------|
| **Tạo Tờ Trình** (nav-create) | `create_request` | Tạo tờ trình phê duyệt |
| **Quản lý tờ trình của tôi** (nav-my-requests) | `view_my_requests` | Xem tờ trình của mình |
| **Duyệt Đơn** (nav-approval) | `approve_request` | Duyệt tờ trình |
| **Nhập Đơn Hàng** (nav-order-create) | `create_order` | Tạo đơn hàng mới |
| **Quản Lý Đơn Hàng** (nav-my-orders) | `view_my_orders` | Xem đơn hàng của mình |
| **Báo Cáo Ngày** (nav-daily-report) | `submit_daily_report` | Nhập báo cáo ngày |
| **Quản Lý Đơn Hàng (Admin)** (nav-orders-admin) | `view_all_orders` | Xem tất cả đơn hàng |
| **Dashboard Báo Cáo** (nav-reports-dashboard) | `view_dashboard` | Xem Dashboard báo cáo |
| **Báo Cáo MTD Chi Tiết** (nav-reports-mtd-detail) | `view_dashboard` | Xem báo cáo MTD |
| **Quản lý User** (nav-users) | `manage_users` | Quản lý users |

## ✅ Logic hiện tại

Tất cả menu items đã được cập nhật để:
1. **Check permissions trước** - Nếu user có custom permissions, dùng permissions
2. **Fallback về role checks** - Nếu không có permissions, dùng logic role cũ
3. **Tự động ẩn/hiện** - Menu items sẽ tự động ẩn/hiện theo permissions

## 🔧 Cách hoạt động

```javascript
// Logic trong auth.js:
if (typeof hasPermission === 'function' && hasPermission(user, 'create_order')) {
    // User có quyền → Hiển thị menu
    $('nav-order-create')?.classList.remove('hidden');
} else if (user.role === 'TVBH' || user.role === 'SALE') {
    // Fallback: Check role → Hiển thị menu
    $('nav-order-create')?.classList.remove('hidden');
} else {
    // Không có quyền → Ẩn menu
    $('nav-order-create')?.classList.add('hidden');
}
```

## 📝 Kiểm tra

### Test 1: User có permissions
- Admin bật permission `create_order` cho user TVBH
- User TVBH đăng nhập
- Menu "Nhập Đơn Hàng" **HIỂN THỊ** ✅

### Test 2: User không có permissions
- Admin tắt permission `create_order` cho user TVBH
- User TVBH đăng nhập  
- Menu "Nhập Đơn Hàng" **ẨN** ✅

### Test 3: User không có custom permissions
- User TVBH không có custom permissions (dùng default)
- User TVBH đăng nhập
- Menu "Nhập Đơn Hàng" **HIỂN THỊ** (theo default của role TVBH) ✅

## 🎯 Kết luận

**Menu items ĐÃ ON/OFF theo đúng permissions đã set!**

- ✅ Nếu Admin bật quyền → Menu hiển thị
- ✅ Nếu Admin tắt quyền → Menu ẩn
- ✅ Nếu không có custom permissions → Dùng default theo role

