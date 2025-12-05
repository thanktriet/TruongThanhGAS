# VÍ DỤ: THÊM PERMISSION MỚI CHO CHỨC NĂNG "XUẤT EXCEL"

Đây là ví dụ cụ thể về cách thêm permission mới khi có chức năng mới.

## 🎯 Yêu cầu

Thêm chức năng "Xuất dữ liệu Excel" với quyền:
- SALEADMIN và ADMIN có thể xuất
- TVBH không có quyền mặc định (nhưng Admin có thể bật cho từng user)

## 📋 Các bước thực hiện

### Bước 1: Thêm permission vào `js/permissions.js`

Mở file `js/permissions.js`, tìm `ALL_PERMISSIONS` và thêm:

```javascript
const ALL_PERMISSIONS = {
    // ... existing permissions ...
    
    // ✅ THÊM PERMISSION MỚI
    'export_excel': { 
        label: 'Xuất dữ liệu Excel', 
        group: 'reports'  // Nhóm vào reports vì liên quan đến báo cáo
    },
    
    // ... rest of permissions ...
};
```

### Bước 2: Thêm default permissions cho các roles

Trong cùng file, tìm `DEFAULT_PERMISSIONS_BY_ROLE` và thêm:

```javascript
const DEFAULT_PERMISSIONS_BY_ROLE = {
    'ADMIN': {
        // ... existing permissions ...
        'export_excel': true,  // ✅ Admin luôn có
    },
    'TVBH': {
        // ... existing permissions ...
        'export_excel': false,  // ✅ TVBH mặc định không có
    },
    'SALEADMIN': {
        // ... existing permissions ...
        'export_excel': true,  // ✅ SALEADMIN có quyền
    },
    'TPKD': {
        // ... existing permissions ...
        'export_excel': false,
    },
    // ... other roles ...
};
```

### Bước 3: Sử dụng trong code

#### 3.1. Hiển thị button xuất Excel

```javascript
// Trong component (ví dụ: reports-dashboard.html)
async function loadReportsDashboard() {
    const user = getSession();
    
    // Hiển thị button xuất Excel nếu có quyền
    const exportButton = document.getElementById('export-excel-btn');
    if (exportButton) {
        if (hasPermission(user, 'export_excel')) {
            exportButton.classList.remove('hidden');
            exportButton.onclick = () => handleExportExcel();
        } else {
            exportButton.classList.add('hidden');
        }
    }
}
```

#### 3.2. Kiểm tra quyền trong API

```javascript
// Trong js/supabase-api.js
async function supabaseExportExcel(data) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }
        
        // ✅ Kiểm tra quyền
        const user = await getUserByUsername(data.username);
        if (!hasPermission(user, 'export_excel')) {
            return { success: false, message: 'Không có quyền xuất dữ liệu Excel' };
        }
        
        // ... logic xuất Excel ...
        const excelData = await generateExcelData(data);
        
        return { success: true, data: excelData };
    } catch (e) {
        console.error('Export Excel error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}
```

#### 3.3. Thêm vào API router

Trong `js/supabase-api.js`, tìm function `callSupabaseAPI` và thêm case:

```javascript
async function callSupabaseAPI(data) {
    // ... existing code ...
    
    switch (action) {
        // ... existing cases ...
        
        case 'export_excel':
            return await supabaseExportExcel(data);
        
        default:
            return { success: false, message: 'Action không được hỗ trợ: ' + action };
    }
}
```

### Bước 4: Test

1. **Đăng nhập với ADMIN:**
   - Vào tab "Quản Lý Users"
   - Click "Quyền" của user tvbh1
   - Kiểm tra có thấy permission "Xuất dữ liệu Excel" trong nhóm "BÁO CÁO"
   - Bật quyền này cho tvbh1
   - Lưu

2. **Đăng nhập với tvbh1:**
   - Kiểm tra button "Xuất Excel" có hiển thị không
   - Test chức năng xuất Excel

3. **Đăng nhập với SALEADMIN:**
   - Kiểm tra button "Xuất Excel" có hiển thị không (mặc định có quyền)

## ✅ Kết quả

Sau khi hoàn thành:

- ✅ Permission mới xuất hiện trong modal quản lý quyền
- ✅ ADMIN có thể bật/tắt cho từng user
- ✅ Code tự động check quyền trước khi cho phép xuất Excel
- ✅ Không cần migration, không cần restart server

## 🎯 Lợi ích

1. **Linh hoạt:** Admin có thể bật/tắt cho từng user
2. **Bảo mật:** Luôn check quyền trước khi thực hiện action
3. **Dễ mở rộng:** Chỉ cần thêm 3-4 dòng code
4. **Tự động:** Permission tự động xuất hiện trong UI quản lý

## 📝 Checklist

- [ ] Đã thêm vào `ALL_PERMISSIONS`
- [ ] Đã thêm default permissions cho các roles
- [ ] Đã cập nhật code để check permission
- [ ] Đã test với ADMIN
- [ ] Đã test với các roles khác nhau
- [ ] Đã test bật/tắt permission cho user cụ thể

## 💡 Lưu ý

- **Không cần migration:** Permissions được lưu trong JSONB, có thể thêm key mới bất cứ lúc nào
- **Backward compatible:** Hệ thống vẫn hoạt động với role checks nếu chưa có permission checks
- **Tự động:** Permission mới tự động xuất hiện trong modal quản lý quyền

