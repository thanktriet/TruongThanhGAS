# So sánh yêu cầu vs triển khai — Trình duyệt sử dụng xe lái thử

## 1. Phân hệ quản lý xe lái thử

| Yêu cầu | Triển khai | Ghi chú |
|--------|------------|--------|
| vehicle_id (PK) | `test_drive_vehicles.id` (UUID) | ✓ |
| bien_so_xe (unique) | `bien_so_xe TEXT UNIQUE` | ✓ |
| loai_xe, phien_ban | Có | ✓ |
| han_bao_hiem, han_dang_kiem | Có | ✓ |
| odo_hien_tai, tong_quang_duong_da_di | Có | ✓ |
| trang_thai_su_dung (ranh/dang_su_dung/tam_khoa) | Có CHECK | ✓ |
| tinh_trang_hien_tai | JSONB | ✓ |
| Xe hết hạn BH/ĐK → tam_khoa | Logic ở API + client (map hetHan → tam_khoa) | ✓ |
| Không tạo tờ trình với xe hết hạn | Kiểm tra khi tạo + khi BGĐ duyệt | ✓ |

## 2. Trình duyệt sử dụng xe (Test Drive Request)

| Yêu cầu | Triển khai | Ghi chú |
|--------|------------|--------|
| request_id | `test_drive_requests.id` | ✓ |
| ngay_tao | `ngay_tao`, `created_at` | ✓ |
| nguoi_tao (requester_fullname) | `nguoi_tao` (fullname) + `requester_username` | ✓ |
| muc_dich_su_dung_xe, thoi_gian_di, thoi_gian_ve_du_kien, lo_trinh | Có | ✓ |
| vehicle_id | FK `test_drive_vehicles(id)` | ✓ |
| trang_thai_to_trinh | Có đủ trạng thái theo spec | ✓ |

## 3. Workflow phê duyệt

| Yêu cầu | Triển khai | Ghi chú |
|--------|------------|--------|
| Người tạo → BKS → BGĐ | current_step 0→1 (BKS), 1→2 (BGĐ), 2→3 (đang sử dụng) | ✓ |
| Trạng thái: Draft, Cho_BKS_Duyet, Cho_BGD_Duyet, Da_Duyet_Dang_Su_Dung, Hoan_Thanh, Tu_Choi | Có CHECK | ✓ |
| Người tạo: tạo, ODO trước, kiểm tra trước đi, ODO sau + kiểm tra + hoàn thành | Form tạo + modal Gửi duyệt (ODO+pre_check) + modal Hoàn trả (ODO+post_check) | ✓ |
| BKS: duyệt/từ chối, không sửa | Chỉ process_test_drive_approval | ✓ |
| BGĐ: duyệt cuối, kiểm tra BH/ĐK | Logic trong process_test_drive_approval (step 2) | ✓ |
| BGĐ duyệt → kiểm tra BH/ĐK → Da_Duyet_Dang_Su_Dung, xe.dang_su_dung | Có | ✓ |

## 4. Kiểm tra tình trạng xe (Pre & Post)

| Yêu cầu | Triển khai | Ghi chú |
|--------|------------|--------|
| 5 điểm: Ben_trai, Ben_phai, Phia_truoc, Phia_sau, Noi_that | ben_trai, ben_phai, phia_truoc, phia_sau, noi_that | ✓ |
| Trạng thái: Tot, Xe_xuoc_tray_mop_dinh_dinh, Xe_do, Xe_bao_loi | Tot, Xe_xuoc_tray_mop_dinh_dinh, Xe_do, Xe_bao_loi | ✓ |
| Tot → không cần ảnh; khác Tot → bắt buộc ảnh | Validation frontend + API (submit & complete) | ✓ |
| Upload qua Google API, lưu link theo từng điểm | pre_check/post_check JSONB: mỗi điểm `{ status, images: [urls] }` | ✓ |

## 5. ODO & quãng đường

| Yêu cầu | Triển khai | Ghi chú |
|--------|------------|--------|
| Trước khi đi: bắt buộc ODO_truoc | Nhập khi Gửi duyệt; API validate | ✓ |
| Khi trả: ODO_sau, quang_duong = ODO_sau - ODO_truoc | Có | ✓ |
| Cập nhật xe.odo_hien_tai = ODO_sau, xe.tong_quang_duong_da_di += quang_duong | Có trong complete_test_drive_return | ✓ |

## 6. Hoàn thành tờ trình

| Yêu cầu | Triển khai | Ghi chú |
|--------|------------|--------|
| Bắt buộc: ODO_sau, đủ 5 điểm, ảnh nếu có lỗi | API validate 5 điểm + ảnh khi không Tot | ✓ |
| Tờ trình → Hoan_Thanh, xe → ranh | Có | ✓ |
| Lưu log lịch sử sử dụng xe | history_log thêm dòng: "HOÀN THÀNH | ODO sau, quãng đường" | ✓ |

## 7. Yêu cầu kỹ thuật (schema & audit)

| Yêu cầu | Triển khai | Ghi chú |
|--------|------------|--------|
| Bảng vehicles | `test_drive_vehicles` | ✓ |
| Bảng test_drive_requests | Có | ✓ |
| Bảng vehicle_inspections | Không tách riêng | Pre/post lưu trong request (pre_check, post_check JSONB) |
| Bảng inspection_images | Không tách riêng | Ảnh lưu trong từng điểm của pre_check/post_check (mảng URLs) |
| Bảng approvals / approval_logs | Không bảng riêng cho test drive | Lịch sử trong `history_log` + `approver_step1`, `approver_step2` |
| Validation theo workflow | Có (step, role, ODO, 5 điểm, ảnh) | ✓ |
| Audit: ai duyệt, lúc nào, thay đổi gì | history_log: "HH:mm DD/MM | user (role) | DUYỆT/TỪ CHỐI/HOÀN THÀNH | ..." | ✓ |

## Tóm tắt

- **Đã đủ theo mô tả chức năng:** Quản lý xe, tạo tờ trình, workflow BKS/BGĐ, ODO trước/sau, quãng đường, 5 điểm kiểm tra (đúng tên trạng thái spec), ảnh bắt buộc khi không Tốt, upload Google Drive, hoàn thành + log.
- **Khác so với spec (thiết kế):**
  - Không có bảng `vehicle_inspections` / `inspection_images` riêng; dùng JSONB trên request (pre_check, post_check) để đơn giản hóa và đủ audit (link ảnh theo điểm).
  - Không có bảng `approval_logs` riêng cho test drive; dùng `history_log` + approver_step1/2 để biết ai duyệt và lúc nào.

Nếu cần đúng 100% schema (vehicle_inspections, inspection_images, approval_logs riêng), có thể bổ sung migration và refactor API/UI tương ứng.
