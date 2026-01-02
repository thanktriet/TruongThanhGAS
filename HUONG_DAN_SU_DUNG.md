# 📖 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG
## Trương Thành Sales Portal - VinFast Trương Thành Kiên Giang

---

## 📋 MỤC LỤC

1. [Giới thiệu](#giới-thiệu)
2. [Đăng nhập hệ thống](#đăng-nhập-hệ-thống)
3. [Vai trò người dùng](#vai-trò-người-dùng)
4. [Hướng dẫn theo chức năng](#hướng-dẫn-theo-chức-năng)
   - [Tờ Trình & Duyệt](#tờ-trình--duyệt)
   - [Đơn Hàng](#đơn-hàng)
   - [Báo Cáo](#báo-cáo)
   - [Tài Liệu](#tài-liệu)
   - [COC (Giấy chứng nhận chất lượng)](#coc-giấy-chứng-nhận-chất-lượng)
   - [Hệ Thống](#hệ-thống)
5. [Câu hỏi thường gặp (FAQ)](#câu-hỏi-thường-gặp-faq)

---

## 🎯 GIỚI THIỆU

Hệ thống Trương Thành Sales Portal là nền tảng quản lý toàn diện cho hoạt động bán hàng của VinFast Trương Thành Kiên Giang, bao gồm:

- ✅ Quản lý tờ trình đề xuất bán hàng
- ✅ Quản lý đơn hàng và khách hàng
- ✅ Quy trình phê duyệt nhiều cấp
- ✅ Tạo và quản lý tài liệu (HĐMB, Thỏa thuận, Đề nghị giải ngân)
- ✅ Quản lý COC (Giấy chứng nhận chất lượng)
- ✅ Báo cáo và thống kê
- ✅ Quản lý hệ thống

---

## 🔐 ĐĂNG NHẬP HỆ THỐNG

### Bước 1: Truy cập hệ thống
- Mở trình duyệt web (Chrome, Firefox, Edge...)
- Truy cập địa chỉ hệ thống được cung cấp

### Bước 2: Đăng nhập
1. Nhập **Tên đăng nhập** (username)
2. Nhập **Mật khẩu** (password)
3. Nhấn nút **"Đăng Nhập"**

### Lưu ý:
- ⏰ Phiên đăng nhập sẽ tự động hết hạn sau **2 giờ**
- 🔄 Sau khi đăng nhập thành công, hệ thống sẽ tự động reload
- 🔒 Nếu quên mật khẩu, liên hệ ADMIN để reset

### Đổi mật khẩu
- Nếu hệ thống yêu cầu đổi mật khẩu lần đầu, bạn sẽ thấy modal đổi mật khẩu
- Nhập mật khẩu cũ và mật khẩu mới (tối thiểu 6 ký tự)
- Nhấn **"Đổi mật khẩu"** để hoàn tất

---

## 👥 VAI TRÒ NGƯỜI DÙNG

Hệ thống có các vai trò sau với quyền hạn khác nhau:

### 🟢 TVBH (Tư vấn bán hàng)
- **Chức năng chính:**
  - Tạo tờ trình đề xuất bán hàng
  - Tạo và quản lý đơn hàng
  - Tạo tài liệu (HĐMB, Thỏa thuận, Đề nghị giải ngân)
  - Đề nghị cấp COC
  - Nhập báo cáo ngày
  - Xem tờ trình và đơn hàng của mình

### 🔵 TPKD (Trưởng phòng kinh doanh)
- **Chức năng chính:**
  - Duyệt tờ trình ở bước đầu tiên
  - Xem tất cả tờ trình và đơn hàng
  - Quản lý tờ trình được gửi cho mình

### 🟡 GDKD (Giám đốc kinh doanh)
- **Chức năng chính:**
  - Duyệt tờ trình ở bước 2
  - Xem tất cả tờ trình, đơn hàng, báo cáo
  - Truy cập Dashboard báo cáo

### 🟣 BKS (Ban Kiểm Soát)
- **Chức năng chính:**
  - Duyệt tờ trình ở bước 3
  - Xem tất cả tờ trình và báo cáo

### 🟠 BGD (Ban Giám Đốc)
- **Chức năng chính:**
  - Duyệt tờ trình ở bước 4
  - Xem tất cả tờ trình và báo cáo

### 🟤 KETOAN (Kế Toán)
- **Chức năng chính:**
  - Kiểm tra và hoàn tất tờ trình
  - Xem tất cả tờ trình và đơn hàng
  - Giải ngân COC

### 🔴 ADMIN (Quản trị viên)
- **Chức năng chính:**
  - Tất cả quyền của các vai trò trên
  - Quản lý người dùng
  - Quản lý phân quyền
  - Quản lý dòng xe
  - Quản lý chính sách bán hàng
  - Quản lý chỉ tiêu TVBH
  - Cấp COC và giải ngân COC

### ⚪ SALEADMIN (Quản lý cấp mã đơn hàng)
- **Chức năng chính:**
  - Cấp mã đơn hàng (Contract Code)
  - Xem tất cả đơn hàng
  - Quản lý đơn hàng
  - Xem và quản lý COC

---

## 📚 HƯỚNG DẪN THEO CHỨC NĂNG

### 📄 TỜ TRÌNH & DUYỆT

#### 1. Tạo Tờ Trình
**Dành cho:** TVBH, TPKD, GDKD

**Các bước:**
1. Chọn menu **"Tạo Tờ Trình"** ở sidebar
2. Chọn chế độ:
   - **Tìm kiếm theo mã hợp đồng:** Nhập mã hợp đồng để tự động điền thông tin
   - **Nhập thủ công:** Điền tất cả thông tin bằng tay

3. Điền thông tin:
   - **Thông tin khách hàng:**
     - Tên khách hàng
     - Số điện thoại
     - CCCD/CMND
     - Email
     - Địa chỉ
   
   - **Thông tin xe:**
     - Loại xe (dòng xe)
     - Phiên bản
     - Màu sắc
     - Số khung (VIN) - nếu có
   
   - **Thông tin tài chính:**
     - Giá hợp đồng
     - Chi tiết giảm giá
     - Số tiền giảm giá
     - Quà tặng (nếu có)
     - Giá cuối cùng (tự động tính)

4. Thêm quà tặng (nếu có):
   - Nhấn nút **"Thêm quà"**
   - Điền tên quà và giá trị
   - Có thể thêm nhiều quà

5. Yêu cầu khác (nếu có):
   - Ghi chú thêm trong ô "Yêu cầu khác"

6. Nhấn nút **"Gửi Tờ Trình"** để gửi đi

#### 2. Quản Lý Tờ Trình Của Tôi
**Dành cho:** TVBH, Tất cả người tạo tờ trình

**Các bước:**
1. Chọn menu **"Quản lý tờ trình của tôi"**
2. Xem danh sách tờ trình bạn đã tạo
3. Có thể:
   - **Xem chi tiết:** Click vào tờ trình
   - **In tờ trình:** Nút "In" (nếu đã được duyệt)
   - **Gửi lại:** Nếu tờ trình bị từ chối

4. Lọc tờ trình:
   - Theo trạng thái: Tất cả, Chờ duyệt, Đã duyệt, Từ chối
   - Tìm kiếm theo mã hợp đồng, tên khách hàng

#### 3. Duyệt Đơn
**Dành cho:** TPKD, GDKD, BKS, BGD, KETOAN, ADMIN

**Các bước:**
1. Chọn menu **"Duyệt Đơn"**
2. Xem danh sách tờ trình đang chờ duyệt của bạn
3. Click vào tờ trình để xem chi tiết
4. Chọn hành động:
   - **✅ Duyệt:** Phê duyệt tờ trình
   - **❌ Từ chối:** Từ chối tờ trình (cần nhập lý do)
   - **📄 Xem chi tiết:** Xem đầy đủ thông tin tờ trình

5. Lưu ý:
   - Tờ trình phải được duyệt theo thứ tự: TPKD → GDKD → BKS → BGD → KETOAN
   - Sau khi KETOAN hoàn tất, tờ trình có thể được in

---

### 🛒 ĐƠN HÀNG

#### 1. Nhập Đơn Hàng
**Dành cho:** TVBH, SALE

**Các bước:**
1. Chọn menu **"Nhập Đơn Hàng"**
2. Tìm kiếm hoặc tạo đơn hàng mới:
   - **Tìm kiếm:** Nhập mã hợp đồng hoặc thông tin khách hàng
   - **Tạo mới:** Điền thông tin khách hàng và đơn hàng

3. Điền thông tin đơn hàng:
   - Thông tin khách hàng (tự động điền nếu tìm thấy)
   - Thông tin xe
   - Phương thức thanh toán (Trả thẳng, Trả góp)
   - Số PO (nếu có)
   - Giá nhập
   - Ghi chú

4. Nhấn **"Tạo Đơn Hàng"** để lưu

#### 2. Quản Lý Đơn Hàng
**Dành cho:** TVBH, SALE

**Các bước:**
1. Chọn menu **"Quản Lý Đơn Hàng"**
2. Xem danh sách đơn hàng của bạn
3. Các thao tác:
   - **Xem chi tiết:** Click vào đơn hàng
   - **Chỉnh sửa:** Nút "Sửa" (nếu chưa có mã đơn hàng)
   - **In:** In thông tin đơn hàng
   - **Tạo HĐMB:** Tạo hợp đồng mua bán
   - **Tạo Thỏa Thuận:** Tạo thỏa thuận lãi suất (nếu trả góp)
   - **Tạo Đề Nghị Giải Ngân:** Tạo đề nghị giải ngân

4. Lọc và tìm kiếm:
   - Theo trạng thái: Tất cả, Chưa có mã, Đã có mã
   - Tìm kiếm theo mã đơn hàng, tên khách hàng

#### 3. Quản Lý Đơn Hàng (Admin)
**Dành cho:** SALEADMIN, ADMIN

**Các bước:**
1. Chọn menu **"Quản Lý Đơn Hàng (Admin)"**
2. Xem **TẤT CẢ** đơn hàng trong hệ thống
3. **Cấp mã đơn hàng:**
   - Click vào đơn hàng chưa có mã
   - Nhập mã hợp đồng (Contract Code)
   - Nhấn **"Cấp mã"** để lưu

4. Lưu ý:
   - Chỉ SALEADMIN và ADMIN mới có quyền cấp mã
   - Sau khi cấp mã, đơn hàng không thể chỉnh sửa

---

### 📊 BÁO CÁO

#### 1. Báo Cáo Ngày
**Dành cho:** TVBH

**Các bước:**
1. Chọn menu **"Báo Cáo Ngày"**
2. Chọn ngày báo cáo (mặc định: hôm nay)
3. Điền thông tin:
   - Số lượng đơn đặt cọc
   - Số lượng đơn giao xe
   - Số lượng khách hàng đến showroom
   - Tình hình tồn kho (nếu có)

4. Nhấn **"Lưu Báo Cáo"**

#### 2. Dashboard Báo Cáo
**Dành cho:** ADMIN, GDKD, BKS, BGD

**Các bước:**
1. Chọn menu **"Dashboard Báo Cáo"**
2. Xem các biểu đồ và thống kê:
   - Tổng doanh số
   - Số lượng đơn hàng
   - Xu hướng bán hàng
   - Phân tích theo dòng xe
   - Phân tích theo TVBH

3. Lọc theo:
   - Khoảng thời gian
   - Nhóm TVBH
   - Dòng xe

#### 3. Báo Cáo MTD Chi Tiết
**Dành cho:** ADMIN, GDKD, BKS, BGD

**Các bước:**
1. Chọn menu **"Báo Cáo MTD Chi Tiết"**
2. Chọn tháng cần xem
3. Lọc theo:
   - Nhóm TVBH
   - TVBH cụ thể
   - Dòng xe

4. Xem báo cáo chi tiết:
   - Doanh số từng TVBH
   - Số lượng đơn hàng
   - So sánh với chỉ tiêu
   - Biểu đồ trực quan

---

### 📑 TÀI LIỆU

#### 1. Tạo Hợp Đồng Mua Bán (HĐMB)
**Dành cho:** TVBH

**Các bước:**
1. Từ menu **"Quản Lý Đơn Hàng"**, chọn đơn hàng đã có mã
2. Nhấn nút **"Tạo HĐMB"**
3. Hệ thống tự động điền thông tin từ đơn hàng
4. Kiểm tra và chỉnh sửa (nếu cần)
5. Nhấn **"Tạo Hợp Đồng"**
6. Hệ thống sẽ tạo file Google Docs và lưu vào Google Drive
7. Link tài liệu sẽ hiển thị sau khi tạo xong

#### 2. Tạo Thỏa Thuận Lãi Suất
**Dành cho:** TVBH

**Các bước:**
1. Từ menu **"Quản Lý Đơn Hàng"**, chọn đơn hàng trả góp
2. Nhấn nút **"Tạo Thỏa Thuận"**
3. Chọn ngân hàng:
   - TechcomBank
   - VPBank
   - TPBank
   - BIDV
   - Sacombank

4. Điền thông tin:
   - Giá trị hợp đồng
   - Số tiền vay
   - Tỷ lệ vay (tự động tính)
   - Số tài khoản ngân hàng

5. Nhấn **"Tạo Thỏa Thuận"**
6. File sẽ được tạo và lưu vào Google Drive

#### 3. Tạo Đề Nghị Giải Ngân
**Dành cho:** TVBH

**Các bước:**
1. Từ menu **"Quản Lý Đơn Hàng"**, chọn đơn hàng cần giải ngân
2. Nhấn nút **"Tạo Đề Nghị Giải Ngân"**
3. Điền thông tin:
   - Ngày cấp TBCV
   - Số tiền đối ứng
   - Số tiền giải ngân
   - Tên ngân hàng vay

4. Nhấn **"Tạo Đề Nghị"**
5. File sẽ được tạo và lưu vào Google Drive

#### 4. Tài Liệu Đã Tạo
**Dành cho:** Tất cả người dùng

**Các bước:**
1. Chọn menu **"Tài Liệu Đã Tạo"**
2. Xem danh sách tất cả tài liệu:
   - Hợp đồng Mua Bán
   - Thỏa thuận lãi suất
   - Đề nghị giải ngân

3. Lọc theo:
   - Loại tài liệu
   - Ngày tạo
   - Người tạo

4. Click vào tài liệu để:
   - Xem trên Google Docs
   - Tải về (nếu cần)
   - Chia sẻ link

---

### 🏆 COC (GIẤY CHỨNG NHẬN CHẤT LƯỢNG)

#### 1. Đề Nghị Cấp COC
**Dành cho:** TVBH

**Các bước:**
1. Chọn menu **"Đề nghị cấp COC"**
2. Tìm kiếm đơn hàng:
   - Nhập mã hợp đồng hoặc thông tin khách hàng
   - Hoặc chọn từ danh sách đơn hàng của bạn

3. Điền thông tin COC:
   - **Thông tin tài chính:**
     - Số PO
     - Giá nhập
     - Số tiền tính lãi (Principal Amount)
     - Phương thức thanh toán
     - Ngân hàng bảo lãnh COC
   
   - **Thông tin khác:**
     - Ngày đề nghị (mặc định: hôm nay)
     - Ghi chú (nếu có)

4. Nhấn **"Gửi Đề Nghị"**

5. Lưu ý:
   - COC phải được cấp trong vòng **5 ngày làm việc** từ ngày đề nghị
   - Nếu trễ, sẽ tính lãi suất 8%/năm trên số tiền tính lãi

#### 2. Quản Lý COC
**Dành cho:** Tất cả người dùng (tùy quyền)

**Các bước:**
1. Chọn menu **"Quản lý COC"**
2. Xem danh sách đề nghị COC:
   - Tất cả (ADMIN, SALEADMIN)
   - Của tôi (TVBH)

3. Các trạng thái:
   - **Chờ cấp (Pending):** Đang chờ cấp COC
   - **Đã cấp (Issued):** Đã được cấp COC
   - **Đã giải ngân (Disbursed):** Đã giải ngân
   - **Đã đóng (Closed):** Hoàn tất

4. Thao tác:
   - **Xem chi tiết:** Click vào đề nghị để xem đầy đủ thông tin
   - **Cập nhật thông tin tài chính:** Nút "Cập nhật thông tin tài chính"
   - **Cấp COC:** (ADMIN, SALEADMIN)
     - Upload ảnh COC
     - Upload biên bản bàn giao
     - Nhập ngày cấp thực tế
     - Hệ thống tự động tính số ngày trễ và lãi (nếu có)
   
   - **Giải ngân:** (ADMIN, KETOAN)
     - Upload file giải ngân
     - Nhập người giải ngân
     - Hoàn tất quy trình

#### 3. Tính Lãi COC
**Hệ thống tự động tính lãi khi cấp COC:**
- Lãi suất: **8%/năm** (mặc định, có thể điều chỉnh)
- Thời hạn: COC phải được cấp trong vòng **5 ngày làm việc** từ ngày đề nghị
- Số ngày trễ: Số ngày làm việc sau 5 ngày (trừ thứ 7, chủ nhật)
- Công thức: `Lãi = (Số tiền tính lãi × 8% / 260 ngày) × Số ngày trễ`
- Làm tròn đến hàng đơn vị (VNĐ)

**Ví dụ:**
- Số tiền tính lãi: 200,000,000 VNĐ
- Lãi suất: 8%/năm
- Trễ: 10 ngày làm việc
- Lãi = (200,000,000 × 8% / 260) × 10 = 615,385 VNĐ

---

### ⚙️ HỆ THỐNG

#### 1. Quản Lý User
**Dành cho:** ADMIN

**Các bước:**
1. Chọn menu **"Quản lý User"**
2. Xem danh sách tất cả người dùng
3. **Thêm user mới:**
   - Nhấn nút **"Thêm User"**
   - Điền thông tin:
     - Username (bắt buộc, duy nhất)
     - Password (tối thiểu 6 ký tự)
     - Fullname
     - Role (Vai trò): ADMIN, TVBH, TPKD, GDKD, BKS, BGD, KETOAN, SALEADMIN
     - Phone, Email (tùy chọn)
     - Group (Nhóm TVBH, nếu có)
     - Active (Kích hoạt tài khoản)
   - Nhấn **"Tạo User"**

4. **Chỉnh sửa user:**
   - Click vào user cần sửa
   - Chỉnh sửa thông tin
   - Có thể đặt lại mật khẩu
   - Nhấn **"Lưu"**

5. **Phân quyền:**
   - Click vào user
   - Tab **"Phân Quyền"**
   - Chọn các quyền cần thiết
   - Nhấn **"Lưu Phân Quyền"**

6. **Lọc và tìm kiếm:**
   - Theo vai trò (Role)
   - Theo nhóm (Group)
   - Tìm kiếm theo tên, username

#### 2. Quản Lý Dòng Xe
**Dành cho:** ADMIN

**Các bước:**
1. Chọn menu **"Quản Lý Dòng Xe"**
2. Xem danh sách dòng xe hiện có
3. **Thêm dòng xe:**
   - Nhấn nút **"Thêm Dòng Xe"**
   - Điền tên dòng xe
   - Nhấn **"Lưu"**

4. **Chỉnh sửa:**
   - Click vào dòng xe
   - Sửa tên
   - Nhấn **"Lưu"**

5. **Xóa:**
   - Click vào dòng xe
   - Nhấn **"Xóa"** (cảnh báo trước khi xóa)

#### 3. Quản Lý CSBH (Chính Sách Bán Hàng)
**Dành cho:** ADMIN

**Các bước:**
1. Chọn menu **"Quản Lý CSBH"**
2. Xem danh sách chính sách
3. **Thêm chính sách:**
   - Nhấn **"Thêm CSBH"**
   - Điền:
     - Tên chính sách
     - Mô tả
     - Ngày hiệu lực
   - Nhấn **"Lưu"**

4. **Chỉnh sửa/Xóa:** Tương tự như Dòng Xe

#### 4. Chỉ Tiêu TVBH
**Dành cho:** ADMIN

**Các bước:**
1. Chọn menu **"Chỉ Tiêu TVBH"**
2. Chọn tháng/năm
3. Xem danh sách chỉ tiêu của từng TVBH
4. **Thêm/Chỉnh sửa chỉ tiêu:**
   - Chọn TVBH
   - Nhập chỉ tiêu doanh số
   - Nhấn **"Lưu"**

5. Xem báo cáo:
   - So sánh thực tế vs chỉ tiêu
   - Tỷ lệ hoàn thành
   - Biểu đồ trực quan

#### 5. Quản Lý Themes
**Dành cho:** ADMIN

**Các bước:**
1. Chọn menu **"Quản Lý Themes"**
2. Xem danh sách themes hiện có
3. **Thêm theme:**
   - Nhấn **"Thêm Theme"**
   - Điền tên và mô tả
   - Nhấn **"Lưu"**

4. **Kích hoạt theme:**
   - Click vào theme
   - Nhấn **"Kích Hoạt"**

---

## 🎨 TÍNH NĂNG KHÁC

### Hồ Sơ Cá Nhân
1. Chọn menu **"Hồ sơ cá nhân"**
2. Xem thông tin tài khoản của bạn:
   - Username
   - Họ tên
   - Vai trò
   - Email
   - Số điện thoại
   - Nhóm

3. Đổi mật khẩu:
   - Nhập mật khẩu cũ
   - Nhập mật khẩu mới
   - Nhập lại mật khẩu mới
   - Nhấn **"Đổi mật khẩu"**

### Đăng xuất
- Nhấn nút **"Đăng xuất"** ở cuối sidebar (desktop)
- Hoặc trong menu mobile (nút menu ở dưới cùng)

### Responsive Design
- Hệ thống hỗ trợ cả desktop và mobile
- Trên mobile, menu được thu gọn và có nút menu ở dưới cùng màn hình
- Tất cả chức năng đều hoạt động trên mobile

---

## ❓ CÂU HỎI THƯỜNG GẶP (FAQ)

### Q1: Tôi quên mật khẩu, làm sao để lấy lại?
**A:** Liên hệ ADMIN để được reset mật khẩu. Sau khi đăng nhập, bạn sẽ được yêu cầu đổi mật khẩu mới.

### Q2: Tờ trình của tôi bị từ chối, tôi có thể gửi lại không?
**A:** Có, bạn có thể gửi lại tờ trình bị từ chối. Vào **"Quản lý tờ trình của tôi"**, chọn tờ trình bị từ chối, nhấn **"Gửi lại"**.

### Q3: Khi nào có thể in tờ trình?
**A:** Tờ trình chỉ có thể in sau khi đã hoàn tất tất cả các bước duyệt (đến bước KETOAN).

### Q4: Làm sao để cấp mã đơn hàng?
**A:** Chỉ SALEADMIN và ADMIN có quyền cấp mã. Vào **"Quản Lý Đơn Hàng (Admin)"**, chọn đơn hàng chưa có mã, nhập mã hợp đồng và nhấn **"Cấp mã"**.

### Q5: COC được tính lãi như thế nào?
**A:** 
- COC phải được cấp trong vòng 5 ngày làm việc từ ngày đề nghị
- Nếu trễ, tính lãi 8%/năm (mặc định)
- Công thức: `Lãi = (Số tiền tính lãi × 8% / 260 ngày) × Số ngày trễ`
- Số ngày được tính theo ngày làm việc (trừ thứ 7, chủ nhật)

### Q6: Làm sao để tìm đơn hàng nhanh?
**A:** Sử dụng tính năng tìm kiếm ở đầu mỗi danh sách. Có thể tìm theo:
- Mã hợp đồng
- Tên khách hàng
- Số điện thoại
- Số CCCD

### Q7: Tài liệu được lưu ở đâu?
**A:** Tất cả tài liệu (HĐMB, Thỏa thuận, Đề nghị giải ngân) được lưu trên Google Drive và hiển thị link trong hệ thống. Bạn có thể click vào link để xem hoặc tải về.

### Q8: Làm sao để xem lịch sử thay đổi của tờ trình?
**A:** Click vào tờ trình để xem chi tiết. Phần **"Lịch sử"** sẽ hiển thị tất cả các thay đổi và phê duyệt theo thời gian.

### Q9: Tôi không thấy menu nào cả, tại sao?
**A:** Menu được hiển thị dựa trên vai trò và quyền của bạn. Nếu không thấy menu, có thể:
- Bạn chưa được cấp quyền cho chức năng đó
- Menu bị ẩn trên mobile (dùng nút menu ở dưới cùng màn hình)
- Liên hệ ADMIN để kiểm tra quyền

### Q10: Làm sao để đăng xuất?
**A:** Nhấn nút **"Đăng xuất"** ở cuối sidebar (desktop) hoặc trong menu mobile.

### Q11: Khi refresh trang (F5), tôi bị quay về tab mặc định?
**A:** Hệ thống đã được cập nhật để nhớ tab hiện tại. Khi refresh, bạn sẽ quay lại đúng tab đang làm việc. Nếu không, vui lòng thử lại sau khi clear cache.

### Q12: Làm sao để cập nhật thông tin tài chính của COC sau khi đã gửi?
**A:** Vào **"Quản lý COC"**, chọn đề nghị COC cần cập nhật, nhấn **"Cập nhật thông tin tài chính"**, điền thông tin mới và lưu.

### Q13: Tôi có thể xem tất cả COC hay chỉ COC của mình?
**A:** 
- **TVBH:** Chỉ xem COC của mình
- **ADMIN, SALEADMIN:** Xem tất cả COC trong hệ thống

### Q14: File ảnh COC và biên bản bàn giao được lưu ở đâu?
**A:** Tất cả file được upload lên Google Drive thông qua hệ thống. Link sẽ được lưu trong database và hiển thị trong chi tiết COC.

---

## 💡 MẸO SỬ DỤNG

1. **Sử dụng tính năng tìm kiếm:** Hầu hết các danh sách đều có thanh tìm kiếm để tìm nhanh thông tin.

2. **Lưu tab hiện tại:** Hệ thống tự động nhớ tab bạn đang làm việc. Khi refresh (F5), bạn sẽ quay lại đúng tab đó.

3. **Sử dụng filter:** Các danh sách đều có filter để lọc theo trạng thái, ngày, v.v.

4. **Kiểm tra thông tin trước khi gửi:** Đảm bảo thông tin chính xác trước khi gửi tờ trình hoặc đơn hàng.

5. **Xem chi tiết trước khi duyệt:** Luôn xem chi tiết đầy đủ trước khi duyệt hoặc từ chối.

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề hoặc cần hỗ trợ:
1. Kiểm tra lại hướng dẫn này
2. Xem phần FAQ ở trên
3. Liên hệ ADMIN hệ thống
4. Ghi lại lỗi cụ thể (screenshot, mô tả) và gửi cho bộ phận IT

---

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** Tháng 12/2025  
**Bản quyền:** Trương Thành Kiên Giang

```

Đang commit và push file hướng dẫn.
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
run_terminal_cmd
