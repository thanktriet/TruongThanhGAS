# Đối chiếu spec – TRÌNH DUYỆT SỬ DỤNG XE LÁI THỬ

Tài liệu này đối chiếu yêu cầu spec với hiện trạng triển khai. **Hệ thống hiện tại đã có đủ các chức năng** theo spec.

**Giao diện (UI)** đã được chỉnh theo spec: nhóm trường theo mục (quản lý xe: Thông tin cơ bản / pháp lý / vận hành), danh sách tờ trình hiển thị đủ trường (thời gian đi/về dự kiến, lộ trình, người tạo, trạng thái), chi tiết tờ trình bố cục theo 6 mục spec (Thông tin tờ trình, Workflow phê duyệt, ODO & Quãng đường, Kiểm tra trước đi 5 điểm, Kiểm tra sau trả 5 điểm, Lịch sử duyệt) và có stepper workflow (Người tạo → BKS → BGĐ).

---

## 1. PHÂN HỆ QUẢN LÝ XE LÁI THỬ

| Spec | Hiện trạng | Ghi chú |
|------|------------|--------|
| **Bảng** vehicles | `test_drive_vehicles` | Tên bảng khác, đủ trường. PK: `id` (tương đương vehicle_id). |
| bien_so_xe (unique) | ✅ `bien_so_xe TEXT UNIQUE NOT NULL` | |
| loai_xe, phien_ban | ✅ | |
| han_bao_hiem, han_dang_kiem (date) | ✅ | |
| odo_hien_tai, tong_quang_duong_da_di | ✅ INTEGER DEFAULT 0 | |
| trang_thai_su_dung (ranh / dang_su_dung / tam_khoa) | ✅ CHECK constraint + enum | |
| tinh_trang_hien_tai (summary) | ✅ JSONB default '{}' | Cập nhật khi hoàn trả xe (post_check). |
| **Rule:** Hết hạn BH/ĐK → tam_khoa | ✅ | Áp dụng **khi đọc**: list xe cho tờ trình coi xe hết hạn là `tam_khoa`, không trả về trong dropdown. Có thể bổ sung cron/trigger ghi `trang_thai_su_dung = 'tam_khoa'` nếu cần lưu DB. |
| **Rule:** Không tạo tờ trình nếu xe hết hạn BH/ĐK | ✅ | `supabaseCreateTestDriveRequest`: kiểm tra `han_bao_hiem`, `han_dang_kiem` < today → từ chối. |
| **Rule:** Không tạo tờ trình nếu xe đang sử dụng | ✅ | Kiểm tra `vehicle.trang_thai_su_dung !== 'ranh'` → từ chối. |

**Kết luận:** Đủ chức năng quản lý xe lái thử.

---

## 2. TRÌNH DUYỆT SỬ DỤNG XE (TEST DRIVE REQUEST)

| Spec | Hiện trạng | Ghi chú |
|------|------------|--------|
| request_id | ✅ `id` UUID PK | |
| ngay_tao | ✅ `ngay_tao`, `created_at` | |
| nguoi_tao (requester_fullname) | ✅ `nguoi_tao` + `requester_username` | Migration 20260127120000. |
| muc_dich_su_dung_xe, thoi_gian_di, thoi_gian_ve_du_kien, lo_trinh | ✅ | |
| vehicle_id (FK xe lái thử) | ✅ REFERENCES test_drive_vehicles(id) | |
| trang_thai_to_trinh | ✅ CHECK (Draft, Cho_BKS_Duyet, Cho_BGD_Duyet, Da_Duyet_Dang_Su_Dung, Hoan_Thanh, Tu_Choi) | |
| Bổ sung | so_dien_thoai, dia_diem_don, dia_diem_tra, so_km_du_kien, ghi_chu | Migration 20260204160000. |

**Kết luận:** Đủ thông tin tờ trình theo spec + các trường bổ sung cho form đăng ký.

---

## 3. WORKFLOW PHÊ DUYỆT

| Spec | Hiện trạng | Ghi chú |
|------|------------|--------|
| Luồng: Người tạo → BKS → BGĐ | ✅ current_step 0→1→2→3, step 4 = Hoan_Thanh | |
| Trạng thái: Draft, Cho_BKS_Duyet, Cho_BGD_Duyet, Da_Duyet_Dang_Su_Dung, Hoan_Thanh, Tu_Choi | ✅ | |
| **Người tạo:** Tạo tờ trình | ✅ create_test_drive_request | |
| **Người tạo:** Nhập ODO trước + kiểm tra xe trước khi đi | ✅ submit_test_drive_request (odo_truoc + pre_check) | |
| **Người tạo:** Sau khi sử dụng: ODO sau + kiểm tra xe + hoàn thành | ✅ complete_test_drive_return | |
| **BKS:** Duyệt / từ chối (step 1), không sửa dữ liệu | ✅ process_test_drive_approval, role BKS/ADMIN | |
| **BGĐ:** Duyệt cuối (step 2) | ✅ role BGD/ADMIN | |
| **Khi BGĐ duyệt:** Kiểm tra lại hạn BH & ĐK | ✅ So sánh han_bao_hiem, han_dang_kiem với today | |
| Nếu hợp lệ: trang_thai_to_trinh = Da_Duyet_Dang_Su_Dung, xe.trang_thai_su_dung = dang_su_dung | ✅ Update request + test_drive_vehicles | |

**Kết luận:** Workflow và phân quyền đúng spec.

---

## 4. KIỂM TRA TÌNH TRẠNG XE (PRE & POST)

| Spec | Hiện trạng | Ghi chú |
|------|------------|--------|
| 5 điểm: Ben_trai, Ben_phai, Phia_truoc, Phia_sau, Noi_that | ✅ ben_trai, ben_phai, phia_truoc, phia_sau, noi_that | Snake_case trong DB/API. |
| Trạng thái mỗi điểm: Tot, Xe_xuoc_tray_mop_dinh_dinh, Xe_do, Xe_bao_loi | ✅ | pre_check/post_check JSONB + vehicle_inspections.status |
| Rule: Tot → không cần ảnh; khác Tot → bắt buộc ảnh | ✅ Validation ở submit & complete | |
| Ảnh: Google API (Drive), lưu link theo điểm kiểm tra | ✅ upload_test_drive_images (Google Docs/Drive), inspection_images | |

**Bảng hỗ trợ:**  
- `vehicle_inspections`: request_id, inspection_type (pre/post), point_key, status.  
- `inspection_images`: vehicle_inspection_id, image_url.

**Kết luận:** Đủ kiểm tra 5 điểm, trạng thái, ảnh và lưu chuẩn hóa.

---

## 5. ODO & QUÃNG ĐƯỜNG

| Spec | Hiện trạng | Ghi chú |
|------|------------|--------|
| Trước khi đi: bắt buộc ODO_truoc | ✅ submit_test_drive_request | |
| Khi trả xe: nhập ODO_sau | ✅ complete_test_drive_return | |
| quang_duong = ODO_sau - ODO_truoc | ✅ Tính trong complete | |
| Cập nhật xe.odo_hien_tai = ODO_sau | ✅ | |
| Cập nhật xe.tong_quang_duong_da_di += quang_duong | ✅ | |

**Kết luận:** Đủ logic ODO và cập nhật xe.

---

## 6. HOÀN THÀNH TỜ TRÌNH

| Spec | Hiện trạng | Ghi chú |
|------|------------|--------|
| Bắt buộc: ODO_sau, đủ 5 điểm kiểm tra, ảnh nếu có lỗi | ✅ Validation trong complete_test_drive_return | |
| Tờ trình → Hoan_Thanh | ✅ current_step = 4, trang_thai_to_trinh = 'Hoan_Thanh' | |
| Xe → ranh | ✅ test_drive_vehicles.trang_thai_su_dung = 'ranh' | |
| Lưu log lịch sử sử dụng xe | ✅ history_log (text) + test_drive_approval_logs (action 'completed') | |

**Kết luận:** Đủ nghiệp vụ hoàn thành và log.

---

## 7. YÊU CẦU KỸ THUẬT

| Spec | Hiện trạng | Ghi chú |
|------|------------|--------|
| Bảng vehicles | test_drive_vehicles | |
| Bảng test_drive_requests | ✅ | |
| Bảng vehicle_inspections | ✅ | |
| Bảng inspection_images | ✅ | |
| Bảng approvals / approval_logs | test_drive_approval_logs | |
| Validation theo workflow | ✅ Theo current_step, role (BKS/BGD/ADMIN), requester_username | |
| Audit log: ai duyệt, lúc nào, thay đổi gì | ✅ approver_username, approver_role, action, comment, created_at | |

**Kết luận:** Đủ schema và audit log theo spec.

---

## TỔNG KẾT

- **Spec 1–7:** Đã được triển khai đầy đủ trong schema, API và UI.
- **Khác biệt nhỏ so với spec:**
  - Bảng xe: tên `test_drive_vehicles` (không dùng `vehicles`).
  - PK: `id` (UUID); spec gọi vehicle_id/request_id – dùng `id` cho cả xe và tờ trình.
  - Trạng thái “tam_khoa” khi hết hạn BH/ĐK: đang áp dụng khi đọc và khi tạo tờ trình; nếu cần ghi cứng vào DB có thể thêm trigger hoặc job định kỳ.

**Tài liệu tham chiếu:**  
- Migrations: `supabase/migrations/20260127100000_*`, `20260127110000_*`, `20260127120000_*`, `20260127140000_*`, `20260204160000_*`.  
- API: `js/supabase-api.js` (list/create/submit/update/approve/complete test drive).  
- UI: `components/test-drive-*.html`, `js/test-drive.js`.
