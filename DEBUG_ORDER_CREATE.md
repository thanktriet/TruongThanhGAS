# 🔍 Debug: Tạo Đơn Hàng và Upload File

## ⚠️ Các Vấn Đề Đã Phát Hiện

### 1. ❌ Lỗi Restore Button Khi Có Lỗi
**Vấn đề**: Nếu `customerResult.success` là false, code sẽ return mà không restore button, khiến button bị disabled mãi mãi.

**✅ Đã sửa**: Thêm restore button trước khi return khi có lỗi.

### 2. ⚠️ Upload File Có Thể Chưa Hoạt Động
**Vấn đề**: 
- Google Apps Script URL có thể chưa được load đúng
- Folder ID có thể chưa được cấu hình trong Google Apps Script
- Có thể có lỗi CORS hoặc permission

**✅ Đã sửa**: 
- Thêm console.log để debug
- Cải thiện error handling
- Thêm warning messages rõ ràng hơn

### 3. ⚠️ Database Field Names
**Vấn đề**: Cần đảm bảo field names đúng giữa frontend và database.

**Kiểm tra**:
- Database `customers` table có field: `name` (NOT `customer_name`)
- Frontend gửi: `name: formData.get('customer_name').trim()` ✅
- API nhận: `customerData.name` ✅

### 4. ⚠️ Attachments JSON Format
**Vấn đề**: Attachments cần được lưu dưới dạng JSON string trong database.

**✅ Đã sửa**: Thêm validation và formatting cho attachments.

---

## 🔧 Các Thay Đổi Đã Thực Hiện

### 1. File: `components/order-create.html`

#### a) Cải thiện Upload File Logic
- Sửa lại cách tạo FileList với tên file mới
- Thêm file mapping để track front/back
- Thêm console.log để debug

#### b) Cải thiện Error Handling
- Restore button khi có lỗi
- Thêm console.log cho mỗi bước
- Hiển thị error messages rõ ràng hơn

### 2. File: `js/supabase-api.js`

#### a) Cải thiện Attachments Handling
- Thêm validation cho attachments array
- Kiểm tra nếu là string hoặc array
- Đảm bảo JSON format đúng

---

## 🧪 Cách Test

### Test 1: Tạo Đơn Hàng Không Có File
1. Mở browser console (F12)
2. Đăng nhập với tài khoản TVBH
3. Vào "Nhập Đơn Hàng"
4. Điền thông tin khách hàng (không upload file)
5. Click "Lưu Đơn Hàng"
6. Kiểm tra console logs:
   - ✅ Customer saved successfully
   - ✅ Order created successfully
   - ✅ Order data trong console

### Test 2: Tạo Đơn Hàng Với File
1. Mở browser console (F12)
2. Đăng nhập với tài khoản TVBH
3. Vào "Nhập Đơn Hàng"
4. Điền thông tin khách hàng
5. Upload file CCCD mặt trước và sau
6. Click "Lưu Đơn Hàng"
7. Kiểm tra console logs:
   - 📤 Starting file upload...
   - ✅ Upload successful (nếu thành công)
   - ⚠️ Upload warning (nếu có lỗi)
   - ✅ Customer saved successfully
   - ✅ Order created successfully

### Test 3: Kiểm Tra Database
1. Vào Supabase Dashboard
2. Kiểm tra bảng `customers`:
   - Có record mới với thông tin khách hàng
   - `cccd_front_image_url` và `cccd_back_image_url` có giá trị nếu upload thành công
3. Kiểm tra bảng `orders`:
   - Có record mới với `customer_cccd` trùng với customer vừa tạo
   - `attachments` là JSON array chứa thông tin file

---

## 🐛 Debug Checklist

Nếu vẫn không lưu được đơn hàng, kiểm tra:

- [ ] **Google Apps Script URL đã được cấu hình chưa?**
  - File: `js/google-docs-config.js`
  - URL phải là: `https://script.google.com/macros/s/.../exec`
  
- [ ] **Google Apps Script đã deploy chưa?**
  - Phải deploy như Web App
  - Phải set "Execute as: Me"
  - Phải set "Who has access: Anyone"
  
- [ ] **Folder ID trong Google Apps Script đã được cấu hình chưa?**
  - File: `google-scripts/docs-service.gs`
  - `FOLDER_ID_DON_HANG` phải có giá trị
  
- [ ] **Supabase đã được cấu hình chưa?**
  - File: `js/supabase-config.js`
  - URL và anon key phải đúng
  
- [ ] **Database tables đã được tạo chưa?**
  - Bảng `customers` phải tồn tại
  - Bảng `orders` phải tồn tại
  - Foreign keys phải đúng
  
- [ ] **User session có đúng không?**
  - Kiểm tra `localStorage.getItem('user_session')`
  - Phải có `username` trong session
  
- [ ] **Browser console có lỗi không?**
  - Mở F12 > Console
  - Tìm các lỗi màu đỏ
  - Copy và paste lỗi để debug

---

## 📝 Next Steps

1. Test lại toàn bộ flow
2. Nếu vẫn có lỗi, check console logs và báo lại
3. Kiểm tra Google Apps Script logs (nếu có quyền truy cập)
4. Kiểm tra Supabase logs (nếu có quyền truy cập)

---

## 💡 Tips

- Luôn mở browser console khi test để xem logs
- Kiểm tra Network tab để xem API calls có thành công không
- Kiểm tra Response trong Network tab để xem error messages từ server

