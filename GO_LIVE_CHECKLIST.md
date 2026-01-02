# ✅ CHECKLIST CHUẨN BỊ GO-LIVE
## Trương Thành Sales Portal

**Ngày chuẩn bị:** _______________  
**Ngày go-live dự kiến:** _______________  
**Người thực hiện:** _______________

---

## 📋 TRƯỚC KHI RESET DATABASE

### ☐ 1. Backup dữ liệu hiện tại
- [ ] Export toàn bộ database
- [ ] Export các bảng quan trọng:
  - [ ] users
  - [ ] approvals
  - [ ] orders
  - [ ] coc_requests
  - [ ] contracts
  - [ ] document_files
- [ ] Lưu backup ở nơi an toàn

### ☐ 2. Kiểm tra cấu hình
- [ ] Kiểm tra Supabase project URL
- [ ] Kiểm tra API keys (anon key, service role key)
- [ ] Kiểm tra Google Drive folder IDs
- [ ] Kiểm tra Google Apps Script Web App URL (nếu dùng)
- [ ] Kiểm tra Google Docs template IDs

### ☐ 3. Review code
- [ ] Đảm bảo không có hardcoded test data
- [ ] Kiểm tra các biến môi trường
- [ ] Kiểm tra log levels (đảm bảo không log thông tin nhạy cảm)

---

## 🔄 THỰC HIỆN RESET

### ☐ 4. Reset database
```bash
# Chạy migration reset
supabase db push

# Hoặc chạy trực tiếp file migration:
psql -h [host] -U [user] -d [database] -f supabase/migrations/20251226000000_reset_for_production.sql
```

- [ ] Xác nhận đã xóa tất cả dữ liệu test
- [ ] Xác nhận đã tạo lại admin user

### ☐ 5. Đăng nhập và đổi mật khẩu admin
- [ ] Đăng nhập với:
  - Username: `admin`
  - Password: `admin123`
- [ ] **⚠️ QUAN TRỌNG:** Đổi mật khẩu admin ngay lập tức!
- [ ] Ghi lại mật khẩu mới ở nơi an toàn

---

## 👥 TẠO USERS PRODUCTION

### ☐ 6. Tạo tài khoản cho production
- [ ] Tạo user ADMIN (nếu cần thêm)
- [ ] Tạo users cho TVBH (Tư vấn bán hàng)
- [ ] Tạo users cho TPKD (Trưởng phòng kinh doanh)
- [ ] Tạo users cho GDKD (Giám đốc kinh doanh)
- [ ] Tạo users cho BKS (Ban kiểm soát)
- [ ] Tạo users cho BGD (Ban giám đốc)
- [ ] Tạo users cho KETOAN (Kế toán)
- [ ] Tạo users cho SALEADMIN (Quản lý cấp mã đơn hàng)

### ☐ 7. Phân quyền
- [ ] Kiểm tra quyền của từng user
- [ ] Đảm bảo phân quyền đúng theo vai trò
- [ ] Test đăng nhập với từng vai trò

---

## ⚙️ CẤU HÌNH HỆ THỐNG

### ☐ 8. Google Drive Setup
- [ ] Tạo/kiểm tra các folders:
  - [ ] Folder đơn hàng (CCCD, đơn hàng)
  - [ ] Folder hợp đồng
  - [ ] Folder thỏa thuận
  - [ ] Folder đề nghị giải ngân
  - [ ] Folder COC files
- [ ] Cấu hình folder IDs trong `google-scripts/docs-service.gs`
- [ ] Test upload file

### ☐ 9. Google Docs Templates
- [ ] Kiểm tra template Hợp đồng Mua Bán (HĐMB)
- [ ] Kiểm tra template Đề nghị Giải ngân
- [ ] Kiểm tra templates Thỏa thuận lãi suất (theo ngân hàng):
  - [ ] TechcomBank
  - [ ] VPBank
  - [ ] TPBank
  - [ ] BIDV
  - [ ] Sacombank
- [ ] Cấu hình template IDs trong `google-scripts/docs-service.gs`
- [ ] Test tạo document

### ☐ 10. Google Apps Script (nếu dùng)
- [ ] Deploy Web App với quyền đúng
- [ ] Cập nhật URL trong `js/config.js`
- [ ] Test API calls

---

## 🔧 KIỂM TRA TÍNH NĂNG

### ☐ 11. Test các chức năng chính
- [ ] Đăng nhập/Đăng xuất
- [ ] Tạo tờ trình
- [ ] Quy trình phê duyệt (từng bước)
- [ ] Tạo đơn hàng
- [ ] Cấp mã đơn hàng
- [ ] Tạo HĐMB
- [ ] Tạo Thỏa thuận lãi suất
- [ ] Tạo Đề nghị giải ngân
- [ ] Đề nghị cấp COC
- [ ] Cấp COC
- [ ] Giải ngân COC
- [ ] Tính lãi COC (nếu trễ)
- [ ] Nhập báo cáo ngày
- [ ] Xem báo cáo và dashboard
- [ ] Quản lý users
- [ ] Phân quyền
- [ ] Quản lý dòng xe
- [ ] Quản lý CSBH
- [ ] In tờ trình/đơn hàng

### ☐ 12. Test trên nhiều trình duyệt
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### ☐ 13. Test trên mobile
- [ ] Responsive design
- [ ] Mobile menu
- [ ] Touch interactions
- [ ] Form inputs

---

## 🔒 BẢO MẬT

### ☐ 14. Security checklist
- [ ] Tất cả passwords đã được đổi từ mặc định
- [ ] API keys được bảo vệ (không hardcode trong code)
- [ ] RLS (Row Level Security) được bật (nếu cần)
- [ ] HTTPS được bật trên production
- [ ] Session timeout hoạt động đúng (2 giờ)
- [ ] Không có test credentials trong code

### ☐ 15. Review permissions
- [ ] Kiểm tra lại tất cả permissions
- [ ] Đảm bảo users chỉ có quyền cần thiết
- [ ] Test với từng role

---

## 📝 DỮ LIỆU KHỞI TẠO

### ☐ 16. Master data
- [ ] Thêm dòng xe vào hệ thống
- [ ] Thêm chính sách bán hàng (CSBH)
- [ ] Tạo themes (nếu cần)
- [ ] Thiết lập chỉ tiêu TVBH (nếu cần)

---

## 📊 MONITORING & LOGGING

### ☐ 17. Setup monitoring
- [ ] Enable Supabase logs
- [ ] Setup error tracking (nếu có)
- [ ] Kiểm tra console logs không có lỗi

---

## 📞 HỖ TRỢ & DOCUMENTATION

### ☐ 18. Documentation
- [ ] File hướng dẫn sử dụng (`HUONG_DAN_SU_DUNG.md`) đã sẵn sàng
- [ ] README.md đã cập nhật
- [ ] Ghi lại các thông tin quan trọng:
  - [ ] Admin credentials (lưu an toàn)
  - [ ] API URLs
  - [ ] Folder IDs
  - [ ] Template IDs

### ☐ 19. Training
- [ ] Đã training users về cách sử dụng hệ thống
- [ ] Đã cung cấp hướng dẫn sử dụng

---

## 🚀 GO-LIVE

### ☐ 20. Final checks trước khi go-live
- [ ] Tất cả checklist trên đã hoàn thành
- [ ] Đã test đầy đủ các tính năng
- [ ] Không có lỗi nghiêm trọng
- [ ] Backup đã được tạo
- [ ] Team sẵn sàng hỗ trợ

### ☐ 21. Go-live
- [ ] Thông báo users về hệ thống mới
- [ ] Monitor hệ thống trong 24h đầu
- [ ] Sẵn sàng xử lý sự cố (nếu có)

---

## 📌 LƯU Ý QUAN TRỌNG

1. **⚠️ Backup:** Luôn backup trước khi reset
2. **🔑 Password:** Đổi password admin ngay sau khi reset
3. **📁 Folders:** Đảm bảo Google Drive folders đã được tạo và cấu hình đúng
4. **🔗 URLs:** Kiểm tra tất cả URLs và keys
5. **🧪 Test:** Test kỹ trước khi go-live
6. **📞 Support:** Có sẵn team hỗ trợ trong ngày go-live

---

## 📝 GHI CHÚ

- Ngày reset: _______________
- Người reset: _______________
- Issues gặp phải: _______________
- Giải pháp: _______________

---

**Hoàn thành checklist:** ☐  
**Người xác nhận:** _______________  
**Ngày:** _______________

