# 🔒 BÁO CÁO BẢO MẬT API - CÁC API NGUY HIỂM BỊ LỘ

## 📋 TÓM TẮT
Phát hiện **NHIỀU API NGUY HIỂM** không có authorization check, cho phép bất kỳ user nào cũng có thể thực hiện các thao tác admin (DELETE, CREATE, UPDATE).

---

## 🚨 RỦI RO NGHIÊM TRỌNG - CẦN SỬA NGAY

### 1. ❌ DELETE Car Model - KHÔNG CÓ AUTHORIZATION
**File:** `js/supabase-api.js:2238`
**API:** `delete_car_model`
**Rủi ro:** BẤT KỲ USER NÀO có thể xóa dòng xe

```javascript
async function supabaseDeleteCarModel(id) {
    // ❌ THIẾU: Không kiểm tra role/admin
    const { error } = await supabase
        .from('car_models')
        .delete()
        .eq('id', id);
}
```

**Test tấn công:**
```javascript
// User bất kỳ có thể gọi:
await window.callAPI({
    action: 'delete_car_model',
    id: 1  // Xóa dòng xe ID 1
});
```

**Impact:**
- Phá hủy dữ liệu dòng xe
- Ảnh hưởng đến báo cáo, đơn hàng liên quan
- Không thể khôi phục nếu không có backup

---

### 2. ❌ DELETE Sales Policy - KHÔNG CÓ AUTHORIZATION
**File:** `js/supabase-api.js:2448`
**API:** `delete_sales_policy`
**Rủi ro:** BẤT KỲ USER NÀO có thể xóa chính sách bán hàng

```javascript
async function supabaseDeleteSalesPolicy(id) {
    // ❌ THIẾU: Không kiểm tra role/admin
    const { error } = await supabase
        .from('sales_policies')
        .delete()
        .eq('id', id);
}
```

**Test tấn công:**
```javascript
// User bất kỳ có thể gọi:
await window.callAPI({
    action: 'delete_sales_policy',
    id: 1  // Xóa chính sách ID 1
});
```

**Impact:**
- Xóa chính sách bán hàng quan trọng
- Ảnh hưởng đến hợp đồng đã sử dụng chính sách này

---

### 3. ❌ CREATE Car Model - KHÔNG CÓ AUTHORIZATION
**File:** `js/supabase-api.js:2143`
**API:** `create_car_model`
**Rủi ro:** BẤT KỲ USER NÀO có thể tạo dòng xe mới

```javascript
async function supabaseCreateCarModel(carModelData) {
    // ❌ THIẾU: Không kiểm tra role/admin
    // Chỉ lấy username từ session, không verify role
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    const username = session?.username || 'admin';
    
    const { data, error } = await supabase
        .from('car_models')
        .insert({...});
}
```

**Test tấn công:**
```javascript
// User bất kỳ có thể tạo dòng xe:
await window.callAPI({
    action: 'create_car_model',
    name: 'Xe Giả Mạo',
    display_order: 999,
    is_active: true
});
```

**Impact:**
- Tạo dòng xe giả mạo
- Làm rối dữ liệu báo cáo
- Spam dữ liệu

---

### 4. ❌ UPDATE Car Model - KHÔNG CÓ AUTHORIZATION
**File:** `js/supabase-api.js:2186`
**API:** `update_car_model`
**Rủi ro:** BẤT KỲ USER NÀO có thể sửa dòng xe

```javascript
async function supabaseUpdateCarModel(id, carModelData) {
    // ❌ THIẾU: Không kiểm tra role/admin
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    const username = session?.username || 'admin';
    
    const { data, error } = await supabase
        .from('car_models')
        .update(updateData)
        .eq('id', id);
}
```

**Test tấn công:**
```javascript
// User bất kỳ có thể sửa:
await window.callAPI({
    action: 'update_car_model',
    id: 1,
    name: 'Tên Giả Mạo',
    is_active: false  // Vô hiệu hóa dòng xe
});
```

**Impact:**
- Sửa tên dòng xe
- Vô hiệu hóa dòng xe đang bán
- Phá hủy dữ liệu

---

### 5. ❌ CREATE Sales Policy - KHÔNG CÓ AUTHORIZATION
**File:** `js/supabase-api.js:2346`
**API:** `create_sales_policy`
**Rủi ro:** BẤT KỲ USER NÀO có thể tạo chính sách

```javascript
async function supabaseCreateSalesPolicy(policyData) {
    // ❌ THIẾU: Không kiểm tra role/admin
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    const username = session?.username || 'admin';
    
    const { data, error } = await supabase
        .from('sales_policies')
        .insert({...});
}
```

**Test tấn công:**
```javascript
// User bất kỳ có thể tạo:
await window.callAPI({
    action: 'create_sales_policy',
    name: 'Chính Sách Giả Mạo',
    description: 'Mô tả độc hại',
    is_active: true,
    display_order: 0
});
```

**Impact:**
- Tạo chính sách giả mạo
- Hiển thị trong form HĐMB
- Lừa đảo khách hàng

---

### 6. ❌ UPDATE Sales Policy - KHÔNG CÓ AUTHORIZATION
**File:** `js/supabase-api.js:2393`
**API:** `update_sales_policy`
**Rủi ro:** BẤT KỲ USER NÀO có thể sửa chính sách

```javascript
async function supabaseUpdateSalesPolicy(id, policyData) {
    // ❌ THIẾU: Không kiểm tra role/admin
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    const username = session?.username || 'admin';
    
    const { data, error } = await supabase
        .from('sales_policies')
        .update(updateData)
        .eq('id', id);
}
```

**Test tấn công:**
```javascript
// User bất kỳ có thể sửa:
await window.callAPI({
    action: 'update_sales_policy',
    id: 1,
    name: 'Chính Sách Độc Hại',
    description: 'Mô tả lừa đảo',
    is_active: false  // Vô hiệu hóa chính sách quan trọng
});
```

**Impact:**
- Sửa nội dung chính sách
- Vô hiệu hóa chính sách quan trọng
- Ảnh hưởng hợp đồng

---

### 7. ⚠️ LIST Car Models - CÓ THỂ LỘ DỮ LIỆU
**File:** `js/supabase-api.js:2100+`
**API:** `list_car_models`
**Rủi ro:** User bất kỳ có thể xem tất cả dòng xe (kể cả inactive)

```javascript
async function supabaseListCarModels() {
    // ⚠️ Không kiểm tra permission, nhưng có thể acceptable cho list
    // Nhưng nên filter chỉ trả về active models cho user thường
}
```

**Đề xuất:** 
- User thường chỉ thấy active models
- Chỉ ADMIN thấy tất cả

---

### 8. ⚠️ LIST Sales Policies - CÓ THỂ LỘ DỮ LIỆU
**File:** `js/supabase-api.js:2268`
**API:** `list_sales_policies`
**Rủi ro:** User bất kỳ có thể xem tất cả chính sách (kể cả inactive)

```javascript
async function supabaseListSalesPolicies() {
    // ⚠️ Không kiểm tra permission
    // Nhưng có API riêng get_active_sales_policies cho user thường
}
```

**Lưu ý:** Có API riêng `get_active_sales_policies` cho user thường, nhưng `list_sales_policies` vẫn expose tất cả.

---

## ✅ CÁC API ĐÃ CÓ AUTHORIZATION CHECK

### 1. ✅ CREATE User - CÓ CHECK ADMIN
```javascript
if (d.role !== 'ADMIN') {
    return { success: false, message: 'Chỉ ADMIN mới có quyền tạo người dùng' };
}
```

### 2. ✅ UPDATE User - CẦN KIỂM TRA
**File:** `js/supabase-api.js:1240`
**Cần verify:** Có check role không?

### 3. ✅ RESET Password - CÓ CHECK ADMIN
```javascript
if (d.role !== 'ADMIN') {
    return { success: false, message: 'Chỉ ADMIN mới có quyền reset mật khẩu' };
}
```

### 4. ✅ UPDATE Permissions - CÓ CHECK ADMIN
```javascript
if (d.role !== 'ADMIN') {
    return { success: false, message: 'Chỉ ADMIN mới có quyền quản lý permissions' };
}
```

---

## 🔍 CÁC VẤN ĐỀ BỔ SUNG

### 1. ⚠️ Session Check Không Nhất Quán
Một số API chỉ đọc `localStorage` để lấy username, nhưng **KHÔNG VERIFY** session có hợp lệ không:

```javascript
// Pattern nguy hiểm:
const session = JSON.parse(localStorage.getItem('user_session') || '{}');
const username = session?.username || 'admin';  // ❌ Fallback thành 'admin'
```

**Rủi ro:**
- Nếu localStorage rỗng, username = 'admin'
- Không verify session timeout
- Không verify user active

### 2. ⚠️ API Key Exposed
**File:** `js/supabase-config.js`
```javascript
const SUPABASE_URL = 'https://knrnlfsokkrtpvtkuuzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';  // ❌ Hardcoded
```

**Rủi ro:**
- Bất kỳ ai cũng có thể đọc từ source code
- Có thể gọi Supabase API trực tiếp (nếu RLS không đúng)
- Không thể rotate key mà không rebuild app

### 3. ⚠️ Không Có Rate Limiting
- Không giới hạn số lần gọi API
- Dễ bị brute force attack
- Dễ bị spam/DoS

### 4. ⚠️ Error Messages Lộ Thông Tin
Một số error message có thể lộ thông tin:
```javascript
return { success: false, message: 'Lỗi: ' + error.message };  // ❌ Lộ Supabase error
```

---

## 📊 TỔNG KẾT RỦI RO

| API | Action | Authorization | Risk Level |
|-----|--------|---------------|------------|
| `delete_car_model` | DELETE | ❌ KHÔNG | 🔴 CRITICAL |
| `delete_sales_policy` | DELETE | ❌ KHÔNG | 🔴 CRITICAL |
| `create_car_model` | CREATE | ❌ KHÔNG | 🔴 CRITICAL |
| `update_car_model` | UPDATE | ❌ KHÔNG | 🔴 CRITICAL |
| `create_sales_policy` | CREATE | ❌ KHÔNG | 🔴 CRITICAL |
| `update_sales_policy` | UPDATE | ❌ KHÔNG | 🔴 CRITICAL |
| `list_car_models` | READ | ⚠️ PARTIAL | 🟡 MEDIUM |
| `list_sales_policies` | READ | ⚠️ PARTIAL | 🟡 MEDIUM |
| `create_user` | CREATE | ✅ CÓ | ✅ SAFE |
| `reset_user_password` | UPDATE | ✅ CÓ | ✅ SAFE |
| `update_user_permissions` | UPDATE | ✅ CÓ | ✅ SAFE |

---

## 🛠️ KHUYẾN NGHỊ SỬA LỖI

### ƯU TIÊN 1: Thêm Authorization Check cho tất cả CRUD API

**Pattern cần áp dụng:**
```javascript
async function supabaseDeleteCarModel(d) {
    // ✅ CHECK 1: Session hợp lệ
    const session = getSession();  // getSession() đã check timeout
    if (!session) {
        return { success: false, message: 'Phiên đăng nhập đã hết hạn' };
    }
    
    // ✅ CHECK 2: Role = ADMIN
    if (session.role !== 'ADMIN') {
        return { success: false, message: 'Chỉ ADMIN mới có quyền xóa dòng xe' };
    }
    
    // ✅ CHECK 3: Permission (nếu có)
    if (!hasPermission(session, 'manage_car_models')) {
        return { success: false, message: 'Bạn không có quyền quản lý dòng xe' };
    }
    
    // ✅ Mới thực hiện action
    const { error } = await supabase
        .from('car_models')
        .delete()
        .eq('id', d.id);
}
```

### ƯU TIÊN 2: Centralize Authorization Logic

Tạo helper function:
```javascript
function requireAdmin(session) {
    if (!session) {
        return { success: false, message: 'Phiên đăng nhập đã hết hạn' };
    }
    if (session.role !== 'ADMIN') {
        return { success: false, message: 'Chỉ ADMIN mới có quyền thực hiện thao tác này' };
    }
    return null;  // OK
}

function requirePermission(session, permissionName) {
    const adminCheck = requireAdmin(session);
    if (adminCheck) return adminCheck;
    
    if (!hasPermission(session, permissionName)) {
        return { success: false, message: `Bạn không có quyền: ${permissionName}` };
    }
    return null;
}
```

### ƯU TIÊN 3: Fix Session Check Pattern

Thay vì:
```javascript
const session = JSON.parse(localStorage.getItem('user_session') || '{}');
const username = session?.username || 'admin';
```

Dùng:
```javascript
const session = getSession();  // getSession() đã check timeout
if (!session) {
    return { success: false, message: 'Phiên đăng nhập đã hết hạn' };
}
const username = session.username;
```

### ƯU TIÊN 4: API Key Security

1. **Move API key to environment variables** (không hardcode)
2. **Use server-side proxy** để hide API key
3. **Enable RLS (Row Level Security)** trên Supabase
4. **Rotate API keys** định kỳ

### ƯU TIÊN 5: Rate Limiting

Implement rate limiting:
- Login: 5 attempts/minute
- API calls: 100/minute per user
- Delete/Update: 10/minute per user

---

## 🧪 TEST TẤN CÔNG

### Test Case 1: Unauthorized Delete
```javascript
// Login as TVBH
// Gọi delete_car_model
const result = await window.callAPI({
    action: 'delete_car_model',
    id: 1
});
// Expected: should FAIL with authorization error
// Actual: ✅ or ❌?
```

### Test Case 2: Session Hijack
```javascript
// Steal session from localStorage
const stolenSession = localStorage.getItem('user_session');
// Inject vào browser khác
localStorage.setItem('user_session', stolenSession);
// Gọi admin API
// Expected: should FAIL (session timeout or IP check)
// Actual: ❌ Có thể thành công
```

### Test Case 3: Direct Supabase Call
```javascript
// Sử dụng exposed API key
const supabase = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
);
// Query trực tiếp
const { data } = await supabase.from('users').select('*');
// Expected: should FAIL (RLS block)
// Actual: ⚠️ Phụ thuộc vào RLS config
```

---

## 📝 CHECKLIST SỬA LỖI

- [ ] Thêm authorization check cho `delete_car_model`
- [ ] Thêm authorization check cho `delete_sales_policy`
- [ ] Thêm authorization check cho `create_car_model`
- [ ] Thêm authorization check cho `update_car_model`
- [ ] Thêm authorization check cho `create_sales_policy`
- [ ] Thêm authorization check cho `update_sales_policy`
- [ ] Kiểm tra `update_user` có authorization không
- [ ] Fix session check pattern (dùng `getSession()`)
- [ ] Thêm permission check (không chỉ role)
- [ ] Kiểm tra RLS trên Supabase
- [ ] Move API key ra environment
- [ ] Implement rate limiting
- [ ] Test tất cả API với user không có quyền

---

**Ngày tạo:** 2024-12-05
**Mức độ nghiêm trọng:** 🔴 CRITICAL
**Cần sửa ngay:** CÓ

