# Báo Cáo Bảo Mật - Trương Thành Sales Portal

## 📋 Tổng Quan

Báo cáo này liệt kê các vấn đề bảo mật đã phát hiện và các khuyến nghị để cải thiện.

## 🔴 VẤN ĐỀ NGHIÊM TRỌNG

### 1. Row Level Security (RLS) Chưa Được Bật

**Mức độ:** 🔴 Nghiêm trọng

**Mô tả:** 
- Bảng `document_files`, `users`, `tvbh_targets`, `orders` không có RLS được bật
- Đã có `GRANT ALL` cho `anon` và `authenticated` roles
- **Rủi ro:** Bất kỳ ai có API key đều có thể truy cập/sửa/xóa dữ liệu nếu không có RLS

**Khuyến nghị:**
- Bật RLS cho tất cả các bảng chứa dữ liệu nhạy cảm
- Tạo policies phù hợp với logic authorization hiện tại
- ⚠️ **Lưu ý:** Hệ thống đang dùng custom authentication (localStorage), không phải Supabase Auth, nên cần điều chỉnh cách implement RLS policies

**File liên quan:**
- `supabase/migrations/20251212120000_add_document_files_table.sql`
- `supabase/migrations/20251204072507_initial_schema.sql`

### 2. Password Hashing Sử Dụng MD5

**Mức độ:** 🔴 Nghiêm trọng

**Mô tả:**
- Passwords được hash bằng MD5 (trong `js/supabase-api.js:44-52`)
- MD5 là thuật toán hash yếu, dễ bị brute force và rainbow table attacks
- Hash không có salt, làm tăng rủi ro

**Rủi ro:**
- Passwords có thể bị crack nhanh chóng
- Nếu database bị lộ, tất cả passwords có thể bị recover

**Khuyến nghị:**
- ✅ **Ưu tiên cao:** Migrate sang bcrypt hoặc Argon2
- Implement password migration strategy để không ảnh hưởng users hiện tại
- Thêm salt cho mỗi password

**File liên quan:**
- `js/supabase-api.js` - function `hashPassword()`

## 🟡 VẤN ĐỀ QUAN TRỌNG

### 3. Session Validation

**Mức độ:** 🟡 Quan trọng

**Mô tả:**
- Nhiều API functions đã có session validation (✅ tốt)
- Session được lưu trong localStorage (có thể bị XSS attack nếu không escape đúng)
- Session timeout được set 2 giờ (✅ hợp lý)

**Khuyến nghị:**
- Đảm bảo TẤT CẢ API endpoints đều có session validation
- Consider sử dụng httpOnly cookies thay vì localStorage (giảm XSS risk)
- Implement refresh token mechanism

**File liên quan:**
- `js/utils.js` - `getSession()`
- `js/supabase-api.js` - các API functions

### 4. XSS Protection

**Mức độ:** 🟡 Quan trọng

**Mô tả:**
- Có `escapeHtml()` function (✅ tốt)
- Đã sử dụng trong một số nơi, nhưng cần kiểm tra toàn bộ

**Khuyến nghị:**
- Đảm bảo TẤT CẢ user input được escape trước khi render vào DOM
- Sử dụng `.textContent` thay vì `.innerHTML` khi có thể
- Review tất cả các template rendering (Mustache, innerHTML)

**File liên quan:**
- `components/document-files.html` - có `escapeHtml()`
- Tất cả components có user-generated content

### 5. Input Validation

**Mức độ:** 🟡 Quan trọng

**Mô tả:**
- Một số fields có validation (ví dụ: password min 6 chars)
- Cần đảm bảo validation ở cả client và server side

**Khuyến nghị:**
- Validate tất cả user input ở server side
- Sử dụng database constraints (CHECK, NOT NULL, etc.)
- Validate data types, ranges, formats

## 🟢 ĐIỂM TÍCH CỰC

### ✅ Đã Có:

1. **SQL Injection Protection:**
   - Sử dụng Supabase client (parameterized queries)
   - Không có raw SQL với user input

2. **Authorization Checks:**
   - Nhiều API functions có role-based checks (ADMIN, SALEADMIN, etc.)
   - Permission system với JSONB permissions

3. **HTTPS:**
   - Supabase sử dụng HTTPS mặc định

4. **Session Timeout:**
   - 2 giờ timeout (hợp lý)

5. **Error Handling:**
   - Không expose sensitive error messages đến client

## 📝 KẾ HOẠCH HÀNH ĐỘNG

### Ưu tiên 1 (Cần làm ngay):

1. **Bật RLS cho các bảng quan trọng**
   - ⚠️ Cần điều chỉnh vì đang dùng custom auth
   - Có thể tạm thời rely vào application-level authorization

2. **Migrate password hashing sang bcrypt**
   - Tạo migration script
   - Implement dual-hash check (MD5 và bcrypt) trong transition period

### Ưu tiên 2 (Nên làm sớm):

3. **Audit tất cả API endpoints** - đảm bảo session validation
4. **XSS audit** - review tất cả user input rendering
5. **Input validation** - thêm server-side validation

### Ưu tiên 3 (Cải thiện dài hạn):

6. **Migrate sang Supabase Auth** thay vì custom auth
7. **Implement refresh tokens**
8. **Security headers** (CSP, X-Frame-Options, etc.)
9. **Rate limiting** cho API endpoints
10. **Audit logging** cho sensitive operations

## 🔗 Tài Liệu Tham Khảo

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Password Hashing Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

