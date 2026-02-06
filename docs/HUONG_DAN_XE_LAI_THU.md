# Hướng dẫn sử dụng module Xe lái thử

Module **Xe lái thử** dùng để đăng ký, duyệt và theo dõi việc sử dụng xe lái thử (công vụ, khách lái thử, v.v.) với quy trình: **Người tạo → BKS duyệt → BGĐ duyệt → Sử dụng xe → Hoàn trả xe**.

---

## Mục lục

1. [Ai dùng được gì?](#ai-dùng-được-gì)
2. [Quản lý xe lái thử](#quản-lý-xe-lái-thử)
3. [Đăng ký sử dụng xe lái thử](#đăng-ký-sử-dụng-xe-lái-thử)
4. [Danh sách tờ trình xe lái thử](#danh-sách-tờ-trình-xe-lái-thử)
5. [Quy trình (workflow)](#quy-trình-workflow)
6. [Hoàn trả xe](#hoàn-trả-xe)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Ai dùng được gì?

| Chức năng | Ai được dùng |
|-----------|----------------|
| **Đăng ký sử dụng xe lái thử** | Mọi user đã đăng nhập |
| **Xem danh sách tờ trình** | Mọi user đã đăng nhập |
| **Quản lý xe lái thử** (thêm/sửa xe, xem ODO, pin) | User có quyền **Duyệt trình xe lái thử** (thường là ADMIN, BKS, BGĐ) |
| **Duyệt tờ trình** (BKS / BGĐ) | User có quyền **Duyệt trình xe lái thử** |

Quyền **Duyệt trình xe lái thử** do ADMIN cấp trong **Quản lý users** → chọn user → **Quản Lý Quyền** → bật **Duyệt trình xe lái thử**.

---

## Quản lý xe lái thử

Menu: **Xe Lái Thử** → **Quản lý xe lái thử**.

### Thêm xe mới

1. Điền **Thông tin cơ bản**: Biển số xe (*), Loại xe, Phiên bản.
2. Điền **Thông tin pháp lý**: Hạn bảo hiểm, Hạn đăng kiểm.
3. Điền **Thông tin vận hành**:
   - **ODO hiện tại (km)**: số km hiện tại trên đồng hồ.
   - **% pin (xe điện)**: tùy chọn, nhập 0–100 nếu là xe điện; để trống nếu xe xăng.
4. Nhấn **Thêm xe**.

Chỉ **xe rảnh** và **còn hạn bảo hiểm / đăng kiểm** mới hiển thị trong danh sách khi đăng ký tờ trình.

### Danh sách xe

Mỗi xe hiển thị:

- Biển số, loại xe, phiên bản.
- Trạng thái: **Rảnh**, **Đang sử dụng**, **Tạm khóa** (ví dụ hết hạn BH/ĐK).
- BH, ĐK, ODO (km), **Pin (%)** (nếu có), Tổng quãng đường đã đi, Tình trạng 5 điểm.

Dùng **Tải lại** để cập nhật danh sách.

---

## Đăng ký sử dụng xe lái thử

Menu: **Xe Lái Thử** → **Đăng ký sử dụng xe lái thử**.

Form gồm **4 bước**:

### Bước 1: Chọn xe

- Chọn **Xe** trong danh sách (chỉ hiện xe rảnh, còn hạn BH/ĐK).
- Nếu không thấy xe: bấm **Tải lại** hoặc kiểm tra với người quản lý xe.

### Bước 2: Thông tin chuyến đi

- **Mục đích sử dụng xe** (*): Chọn một trong:
  - **Khách lái thử**: bắt buộc đính kèm **Bằng lái xe** và **Giấy đề nghị lái thử** (ảnh).
  - **Công vụ**, **Ban Lãnh Đạo Sử Dụng**, **Mục đích khác**: nhập **Mục đích cụ thể** (ô text).
- **Thời gian đi (dự kiến)** (*), **Thời gian về (dự kiến)** (*).
- **Lộ trình** (*): ví dụ "Trương Thành - Rạch Giá".
- **Số km dự kiến**: tùy chọn.

### Bước 3: Liên hệ & địa điểm

- **Số điện thoại** (*).
- **Địa điểm lấy xe**, **Địa điểm trả xe**: tùy chọn.
- **Ghi chú**: tùy chọn.

### Bước 4: ODO & Kiểm tra xe trước khi đi

- **ODO trước khi nhận xe (km)** (*): nhập số km trên đồng hồ khi nhận xe (có thể tham chiếu ODO hệ thống hiển thị bên dưới).
- **Kiểm tra 5 điểm** (Bên trái, Bên phải, Phía trước, Phía sau, Nội thất):
  - Mỗi điểm chọn: **Tốt** hoặc trạng thái khác (xe hư hỏng/móp/trầy/xước, xe dơ, xe báo lỗi).
  - Nếu **không** chọn Tốt → bắt buộc đính kèm **ảnh** cho điểm đó.

Sau khi điền đủ, nhấn **Tạo tờ trình**. Tờ trình tạo ở trạng thái **Nháp**. Bạn có thể mở lại từ **Danh sách tờ trình** → bấm vào tờ trình → dùng nút **Chỉnh sửa** để sửa/thêm thông tin, hoặc **Gửi duyệt** khi đã xong.

---

## Danh sách tờ trình xe lái thử

Menu: **Xe Lái Thử** → **Danh sách tờ trình xe lái thử**.

- **Lọc theo trạng thái**: Tất cả, Nháp, Chờ BKS duyệt, Chờ BGĐ duyệt, Đang sử dụng xe, Hoàn thành, Từ chối.
- Bấm **Làm mới** để tải lại danh sách.
- Bấm vào một tờ trình để **xem chi tiết** và thực hiện thao tác (Gửi duyệt, Duyệt/Từ chối, Hoàn trả xe) tùy quyền và trạng thái.

---

## Quy trình (workflow)

1. **Nháp**  
   Người tạo vừa tạo tờ trình. Có thể chỉnh sửa hoặc **Gửi duyệt**.

2. **Chờ BKS duyệt**  
   Người có quyền **Duyệt trình xe lái thử** có thể **Duyệt** hoặc **Từ chối** (bắt buộc nhập lý do).

3. **Chờ BGĐ duyệt**  
   Tương tự, BGĐ (hoặc người có quyền) **Duyệt** hoặc **Từ chối**.

4. **Đang sử dụng xe**  
   Đã duyệt xong, đang sử dụng xe. Khi trả xe, người tạo (hoặc ADMIN) thực hiện **Hoàn trả xe** (xem mục dưới).

5. **Hoàn thành**  
   Đã hoàn trả xe và hệ thống cập nhật ODO, quãng đường, pin (nếu có), tình trạng xe.

6. **Từ chối**  
   BKS hoặc BGĐ từ chối; tờ trình về trạng thái Nháp, người tạo có thể **Chỉnh sửa** (nút trong chi tiết) rồi gửi lại.

---

## Hoàn trả xe

Khi tờ trình ở trạng thái **Đang sử dụng xe**, người tạo (hoặc ADMIN) mở **chi tiết** tờ trình và bấm **Hoàn trả xe**.

Trong form hoàn trả cần nhập:

- **ODO sau khi trả (km)** (*): số km trên đồng hồ khi trả xe.
- **% pin (xe điện)**: tùy chọn, 0–100; bỏ trống nếu xe xăng.
- **Thời gian về thực tế**: tùy chọn.
- **Nơi trả chìa khoá** (*): Tủ đựng chìa khoá / Gửi trực tiếp cho BKS / Khác (ghi rõ).
- **Kiểm tra 5 điểm** sau khi trả (giống lúc đi): mỗi điểm chọn trạng thái; nếu không Tốt thì bắt buộc đính kèm ảnh.

Sau khi hoàn tất, hệ thống:

- Cập nhật **ODO hiện tại** và **% pin** (nếu nhập) của xe trong **Quản lý xe lái thử**.
- Chuyển tờ trình sang **Hoàn thành**.

---

## Câu hỏi thường gặp

**Tôi không thấy menu "Quản lý xe lái thử"?**  
Menu này chỉ hiển thị cho user có quyền **Duyệt trình xe lái thử**. Liên hệ ADMIN để được cấp quyền nếu bạn là BKS/BGĐ hoặc người phụ trách xe.

**Khi đăng ký không có xe nào trong danh sách?**  
Chỉ xe **rảnh** và **còn hạn bảo hiểm, đăng kiểm** mới hiện. Nếu tất cả xe đang dùng hoặc hết hạn, cần nhờ người quản lý xe thêm xe hoặc cập nhật hạn BH/ĐK.

**Chọn "Khách lái thử" nhưng không gửi được?**  
Với mục đích Khách lái thử, bắt buộc phải đính kèm ảnh **Bằng lái xe** và **Giấy đề nghị lái thử** (có chữ ký). Kiểm tra đã chọn đủ 2 ảnh chưa.

**Điểm kiểm tra xe không "Tốt" có bắt buộc ảnh không?**  
Có. Mỗi điểm (Bên trái, Bên phải, Phía trước, Phía sau, Nội thất) nếu không chọn **Tốt** thì bắt buộc đính kèm ít nhất một ảnh cho điểm đó (cả lúc gửi duyệt và lúc hoàn trả).

**% pin dùng khi nào?**  
Dùng cho **xe điện**: có thể nhập khi **Thêm xe** (trong Quản lý xe) và khi **Hoàn trả xe**. Giá trị 0–100; không bắt buộc cho xe xăng.

**Tờ trình bị từ chối thì làm sao?**  
Trạng thái sẽ về **Nháp**. Mở lại tờ trình, bấm **Chỉnh sửa** để sửa theo ý kiến từ chối (nếu có), lưu rồi bấm **Gửi duyệt** lại.

---

*Tài liệu cập nhật theo module Xe lái thử hiện tại trong hệ thống.*
