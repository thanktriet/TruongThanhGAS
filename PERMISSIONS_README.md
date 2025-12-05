# 🎯 HỆ THỐNG PHÂN QUYỀN CHI TIẾT - TỔNG QUAN

## 📚 Tài liệu

1. **PERMISSIONS_SYSTEM.md** - Tổng quan về hệ thống, cấu trúc, danh sách permissions
2. **PERMISSIONS_SETUP_GUIDE.md** - Hướng dẫn setup, chạy migration, test
3. **PERMISSIONS_EXTEND_GUIDE.md** - Hướng dẫn thêm permission mới (QUAN TRỌNG!)
4. **PERMISSIONS_EXAMPLE.md** - Ví dụ cụ thể: thêm permission "Xuất Excel"

## 🚀 Quick Start

### Bước 1: Chạy Migration

```sql
-- Copy nội dung file: supabase/migrations/20251205120000_add_user_permissions.sql
-- Chạy trên Supabase Dashboard > SQL Editor
```

Xem chi tiết: `PERMISSIONS_SETUP_GUIDE.md`

### Bước 2: Test

1. Đăng nhập với ADMIN
2. Vào "Quản Lý Users"
3. Click button "Quyền" (màu tím)
4. Bật/tắt permissions và lưu

## ✨ Tính năng chính

- ✅ **Quản lý quyền chi tiết:** Admin có thể bật/tắt từng quyền cho từng user
- ✅ **Default permissions:** Tự động có quyền mặc định theo role
- ✅ **Dễ mở rộng:** Thêm permission mới chỉ cần 3-4 bước, không cần migration
- ✅ **Tự động:** Permission mới tự động xuất hiện trong UI

## 🔧 Thêm Permission Mới

**Khi có chức năng mới, chỉ cần:**

1. Thêm vào `ALL_PERMISSIONS` trong `js/permissions.js`
2. Thêm default permissions cho các roles
3. Sử dụng `hasPermission(user, 'permission_name')` trong code

**Xem chi tiết:** `PERMISSIONS_EXTEND_GUIDE.md`

## 📋 Danh sách Permissions hiện tại

### TỜ TRÌNH (7 permissions)
- create_request, view_my_requests, view_all_requests
- approve_request, edit_request, print_request
- resubmit_request

### ĐƠN HÀNG (6 permissions)
- create_order, view_my_orders, view_all_orders
- edit_order, assign_contract_code
- view_order_detail

### TÀI LIỆU (3 permissions)
- create_hdmb, create_thoa_thuan, create_de_nghi

### BÁO CÁO (3 permissions)
- submit_daily_report, view_reports, view_dashboard

### HỆ THỐNG (2 permissions)
- manage_users, manage_permissions

**Tổng cộng: 21 permissions**

## 💡 Best Practices

1. **Luôn check permission trong API:**
   ```javascript
   if (!hasPermission(user, 'permission_name')) {
       return { success: false, message: 'Không có quyền' };
   }
   ```

2. **Dùng permission checks thay vì role checks:**
   ```javascript
   // ✅ Tốt
   if (hasPermission(user, 'create_order')) { ... }
   
   // ❌ Không tốt (nếu có thể)
   if (user.role === 'TVBH') { ... }
   ```

3. **Đặt tên permission rõ ràng:**
   - ✅ `export_excel`, `manage_settings`
   - ❌ `export`, `manage`

## 🎯 Lợi ích

1. **Linh hoạt:** Admin có thể tùy chỉnh quyền cho từng user
2. **Bảo mật:** Luôn check quyền trước khi thực hiện action
3. **Dễ mở rộng:** Thêm permission mới cực kỳ đơn giản
4. **Không cần migration:** Permissions lưu trong JSONB

## 📞 Hỗ trợ

- Xem các file `.md` trong thư mục project
- Kiểm tra code trong `js/permissions.js`
- Xem ví dụ trong `PERMISSIONS_EXAMPLE.md`

---

**✨ Hệ thống được thiết kế để dễ dàng mở rộng và bảo trì!**

