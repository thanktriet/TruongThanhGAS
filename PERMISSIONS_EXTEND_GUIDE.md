# HƯỚNG DẪN THÊM PERMISSION MỚI

## 🎯 Mục tiêu

Hướng dẫn cách thêm permission mới vào hệ thống một cách dễ dàng khi có chức năng mới.

## 📋 Các bước thêm permission mới

### Bước 1: Thêm permission vào `js/permissions.js`

Mở file `js/permissions.js` và thêm permission mới vào `ALL_PERMISSIONS`:

```javascript
const ALL_PERMISSIONS = {
    // ... existing permissions ...
    
    // ✅ THÊM PERMISSION MỚI Ở ĐÂY
    'new_feature_permission': { 
        label: 'Tên hiển thị của quyền', 
        group: 'tên_nhóm'  // approval, orders, documents, reports, system
    },
    
    // Ví dụ:
    'export_data': { 
        label: 'Xuất dữ liệu Excel', 
        group: 'reports' 
    },
    'manage_settings': { 
        label: 'Quản lý cài đặt', 
        group: 'system' 
    },
};
```

**Lưu ý:**
- Key phải là `snake_case` (chữ thường, phân cách bằng dấu gạch dưới)
- Label là tên hiển thị trong UI (tiếng Việt)
- Group phải là một trong: `approval`, `orders`, `documents`, `reports`, `system`

### Bước 2: Thêm permission vào nhóm (nếu cần nhóm mới)

Nếu bạn muốn tạo nhóm permission mới:

```javascript
const PERMISSION_GROUPS = {
    // ... existing groups ...
    
    // ✅ THÊM NHÓM MỚI
    'new_group': { 
        label: 'TÊN NHÓM', 
        icon: 'fa-icon-name'  // Font Awesome icon
    },
};
```

### Bước 3: Thêm default permissions cho các roles

Thêm permission mặc định vào `DEFAULT_PERMISSIONS_BY_ROLE`:

```javascript
const DEFAULT_PERMISSIONS_BY_ROLE = {
    'TVBH': {
        // ... existing permissions ...
        'new_feature_permission': true,  // ✅ THÊM VÀO ĐÂY
    },
    'SALEADMIN': {
        // ... existing permissions ...
        'new_feature_permission': true,
    },
    // ... other roles ...
};
```

**Quyết định:**
- `true`: Role này mặc định có quyền này
- `false` hoặc không có: Role này mặc định không có quyền này

### Bước 4: Sử dụng permission trong code

Trong code, sử dụng helper functions để check permission:

```javascript
// Check single permission
if (hasPermission(user, 'new_feature_permission')) {
    // Hiển thị/hiện chức năng
    showNewFeature();
}

// Check multiple permissions (AND)
if (hasAllPermissions(user, ['new_feature_permission', 'another_permission'])) {
    // Cần cả 2 quyền
}

// Check multiple permissions (OR)
if (hasAnyPermission(user, ['new_feature_permission', 'fallback_permission'])) {
    // Có ít nhất 1 quyền
}
```

### Bước 5: Cập nhật UI (nếu cần)

#### A. Hiển thị/ẩn menu item

Trong `js/auth.js` hoặc component tương ứng:

```javascript
// Thay vì:
if (user.role === 'TVBH') {
    $('nav-new-feature')?.classList.remove('hidden');
}

// Dùng:
if (hasPermission(user, 'new_feature_permission')) {
    $('nav-new-feature')?.classList.remove('hidden');
}
```

#### B. Hiển thị/ẩn button

```javascript
// Trong component
const canExport = hasPermission(user, 'export_data');
if (canExport) {
    buttonExport.classList.remove('hidden');
} else {
    buttonExport.classList.add('hidden');
}
```

#### C. Kiểm tra quyền trong API

```javascript
// Trong API function
async function supabaseNewFeature(data) {
    const user = await getUserByUsername(data.username);
    
    if (!hasPermission(user, 'new_feature_permission')) {
        return { success: false, message: 'Không có quyền thực hiện chức năng này' };
    }
    
    // ... thực hiện logic ...
}
```

## 📝 Ví dụ: Thêm permission "Xuất dữ liệu Excel"

### Bước 1: Thêm vào `ALL_PERMISSIONS`

```javascript
const ALL_PERMISSIONS = {
    // ... existing ...
    'export_excel': { 
        label: 'Xuất dữ liệu Excel', 
        group: 'reports' 
    },
};
```

### Bước 2: Thêm default permissions

```javascript
const DEFAULT_PERMISSIONS_BY_ROLE = {
    'TVBH': {
        // ... existing ...
        'export_excel': false,  // TVBH mặc định không có
    },
    'SALEADMIN': {
        // ... existing ...
        'export_excel': true,  // SALEADMIN mặc định có
    },
    'ADMIN': {
        // ... existing ...
        'export_excel': true,  // ADMIN luôn có tất cả
    },
};
```

### Bước 3: Sử dụng trong code

```javascript
// Trong component
const exportButton = document.getElementById('export-excel-btn');
const user = getSession();

if (hasPermission(user, 'export_excel')) {
    exportButton.classList.remove('hidden');
    exportButton.onclick = () => exportToExcel();
} else {
    exportButton.classList.add('hidden');
}

// Trong API
async function supabaseExportExcel(data) {
    const user = await getUserByUsername(data.username);
    
    if (!hasPermission(user, 'export_excel')) {
        return { success: false, message: 'Không có quyền xuất Excel' };
    }
    
    // ... export logic ...
}
```

## ✅ Checklist

Khi thêm permission mới, đảm bảo:

- [ ] Đã thêm vào `ALL_PERMISSIONS` với label và group đúng
- [ ] Đã thêm default permissions cho các roles liên quan
- [ ] Đã cập nhật code để check permission thay vì check role
- [ ] Đã test với các roles khác nhau
- [ ] Admin có thể bật/tắt permission này trong modal quản lý quyền

## 🔄 Migration (không cần)

**Lưu ý quan trọng:** 
- Không cần tạo migration khi thêm permission mới!
- Permissions được lưu trong cột JSONB, có thể thêm key mới bất cứ lúc nào
- Hệ thống tự động nhận diện permissions mới khi được định nghĩa trong code

## 💡 Best Practices

1. **Đặt tên permission rõ ràng:**
   - ✅ `export_excel`, `manage_users`, `view_all_orders`
   - ❌ `export`, `manage`, `view`

2. **Nhóm permissions hợp lý:**
   - Cùng chức năng → cùng nhóm
   - Dễ tìm và quản lý

3. **Default permissions hợp lý:**
   - Chỉ enable cho roles thực sự cần
   - Có thể để Admin bật cho user cụ thể sau

4. **Test kỹ:**
   - Test với các roles khác nhau
   - Test với custom permissions
   - Test với default permissions

## 🎯 Kết luận

Hệ thống được thiết kế để **dễ dàng mở rộng**:

- ✅ Thêm permission mới chỉ cần 3-4 bước đơn giản
- ✅ Không cần migration
- ✅ Tự động hiển thị trong modal quản lý quyền
- ✅ Admin có thể bật/tắt ngay lập tức

**Chỉ cần thêm vào code, không cần chạm vào database!**

