# 📄 Test Tạo Tài Liệu - HĐMB, TTLS, ĐNGN

## ✅ Kiểm Tra Sample Data

Sample data trong `test-document-creation.html` đã được kiểm tra và **đúng format** với code hiện tại.

---

## 🔧 Cách Test

### 1. Mở Test Page

Mở file `test-document-creation.html` trong browser.

### 2. Test Tạo Hợp Đồng Mua Bán (HĐMB)

#### Sample Data (Đã đúng format):
```javascript
{
    so_hop_dong: 'HDMB001',
    ngay_ky: new Date().toISOString(),
    khach_hang: 'Nguyễn Văn A',
    dia_chi: '123 Đường ABC, Quận 1, TP.HCM',
    sdt: '0901234567',
    email: 'nguyenvana@example.com',
    so_cccd: '123456789012',
    ngay_cap: '2020-01-15',
    noi_cap: 'CA TP.HCM',
    loai_xe: 'VF8',
    phien_ban: 'Premium',
    mau_xe: 'Đen',
    so_luong: 1,
    don_gia: 500000000,
    tien_coc: 100000000,
    chinh_sach_ban_hang: 'Chính sách ưu đãi đặc biệt'
}
```

#### Các Placeholder trong Template:
- `{{so_hop_dong}}` → `formData.so_hop_dong`
- `{{ngay_ky}}` → `formatDate(formData.ngay_ky)`
- `{{khach_hang}}` → `formData.khach_hang`
- `{{dia_chi}}` → `formData.dia_chi`
- `{{sdt}}` → `formData.sdt`
- `{{email}}` → `formData.email`
- `{{so_cccd}}` → `formData.so_cccd`
- `{{ngay_cap}}` → `formatDate(formData.ngay_cap)`
- `{{noi_cap}}` → `formData.noi_cap`
- `{{loai_xe}}` → `formData.loai_xe`
- `{{phien_ban}}` → `formData.phien_ban`
- `{{mau_xe}}` → `formData.mau_xe`
- `{{so_luong}}` → tính từ `formData.so_luong`
- `{{don_gia}}` → `formatCurrency(formData.don_gia)`
- `{{tong_tien}}` → tính từ `so_luong * don_gia`
- `{{tong_tien_bang_chu}}` → `numberToWords(tongTien)`
- `{{tien_coc}}` → `formatCurrency(formData.tien_coc)`
- `{{tien_coc_bang_chu}}` → `numberToWords(formData.tien_coc)`
- `{{chinh_sach_ban_hang}}` → `formData.chinh_sach_ban_hang`

#### Test Steps:
1. Click button "Test Tạo HĐMB"
2. Kiểm tra console logs
3. Kiểm tra kết quả hiển thị
4. Mở file trên Google Drive để xem placeholder đã được replace chưa

---

### 3. Test Tạo Thỏa Thuận Lãi Suất (TTLS)

#### Sample Data (Đã đúng format):
```javascript
{
    TEN_KHACH_HANG: 'Nguyễn Văn A',
    DIA_CHI: '123 Đường ABC, Quận 1, TP.HCM',
    DIEN_THOAI: '0901234567',
    CCCD: '123456789012',
    NGAY_CAP: '2020-01-15',
    NOI_CAP: 'CA TP.HCM',
    SO_HOP_DONG: 'HDMB001',
    LOAI_XE: 'VF8',
    SO_KHUNG: 'VIN123456789',
    SO_MAY: 'ENG123456',
    GIA_TRI_HOP_DONG: 500000000,
    SO_TIEN_VAY_SO: 400000000,
    TY_LE_VAY: '80%',
    THOI_HAN_VAY: '60 tháng'
}
```

#### Các Placeholder trong Template:
- `{{TEN_KHACH_HANG}}` → `formData.TEN_KHACH_HANG`
- `{{DIA_CHI}}` → `formData.DIA_CHI`
- `{{DIEN_THOAI}}` → `formData.DIEN_THOAI`
- `{{CCCD}}` → `formData.CCCD`
- `{{NGAY_CAP}}` → `formatDate(formData.NGAY_CAP)`
- `{{NOI_CAP}}` → `formData.NOI_CAP`
- `{{SO_HOP_DONG}}` → `formData.SO_HOP_DONG`
- `{{LOAI_XE}}` → `formData.LOAI_XE`
- `{{SO_KHUNG}}` → `formData.SO_KHUNG`
- `{{SO_MAY}}` → `formData.SO_MAY`
- `{{GIA_TRI_HOP_DONG}}` → `formatCurrency(formData.GIA_TRI_HOP_DONG)`
- `{{SO_TIEN_VAY_SO}}` → `formatCurrency(formData.SO_TIEN_VAY_SO)`
- `{{SO_TIEN_VAY_CHU}}` → `numberToWords(formData.SO_TIEN_VAY_SO)`
- `{{TY_LE_VAY}}` → `formData.TY_LE_VAY`
- `{{THOI_HAN_VAY}}` → `formData.THOI_HAN_VAY`

#### Test Steps:
1. Chọn ngân hàng từ dropdown
2. Click button "Test Tạo Thỏa Thuận"
3. Kiểm tra console logs
4. Kiểm tra kết quả hiển thị
5. Mở file trên Google Drive để xem placeholder đã được replace chưa

---

### 4. Test Tạo Đề Nghị Giải Ngân (ĐNGN)

#### Sample Data (Đã đúng format):
```javascript
{
    ten_khach_hang: 'Nguyễn Văn A',
    so_hop_dong: 'HDMB001',
    loai_xe: 'VF8',
    ten_ngan_hang_vay: 'Techcombank',
    so_tai_khoan: '1234567890',
    so_tien_doi_ung: 400000000,
    so_tien_giai_ngan: 400000000,
    ngay_captbcv: new Date().toISOString()
}
```

#### Các Placeholder trong Template:
- `{{ngay_ky}}` → `formatDate(new Date())`
- `{{kinh_gui_ngan_hang}}` → "Kính gửi: " + `requestData.ten_ngan_hang_vay`
- `{{ngay_captbcv}}` → `formatDate(requestData.ngay_captbcv)`
- `{{ten_khach_hang}}` → `requestData.ten_khach_hang`
- `{{so_hop_dong}}` → `requestData.so_hop_dong`
- `{{so_tai_khoan}}` → `requestData.so_tai_khoan`
- `{{loai_xe}}` → `requestData.loai_xe`
- `{{so_tien_doi_ung}}` → `formatCurrency(soTienDoiUng) + "VNĐ"`
- `{{so_tien_doi_ung_bang_chu}}` → `numberToWords(soTienDoiUng)`
- `{{so_tien_giai_ngan}}` → `formatCurrency(soTienGiaiNgan) + "VNĐ"`
- `{{so_tien_giai_ngan_bang_chu}}` → `numberToWords(soTienGiaiNgan)`

#### Test Steps:
1. Click button "Test Tạo Đề Nghị Giải Ngân"
2. Kiểm tra console logs
3. Kiểm tra kết quả hiển thị
4. Mở file trên Google Drive để xem placeholder đã được replace chưa

---

## 🔍 Debug Tips

### 1. Kiểm Tra Execution Logs trong Google Apps Script

1. Vào [Google Apps Script Editor](https://script.google.com)
2. Click **Executions** (menu bên trái)
3. Tìm execution gần nhất
4. Click vào để xem logs chi tiết:
   - Placeholder nào đang được replace?
   - Value nào đang được sử dụng?
   - Placeholder nào không tìm thấy trong document?

### 2. Kiểm Tra Browser Console

Mở Browser Console (F12) khi test và xem:
- Request được gửi như thế nào?
- Response nhận được là gì?
- Có lỗi gì trong console không?

### 3. Kiểm Tra Template Format

Đảm bảo placeholder trong template Google Docs có format:
- `{{placeholder_name}}` (có dấu gạch dưới nếu cần)
- Không có khoảng trắng: `{{placeholder}}` ✅ không phải `{{ placeholder }}` ❌

---

## ✅ Checklist Test

- [ ] Test tạo HĐMB thành công
- [ ] Tất cả placeholder trong HĐMB được replace đúng
- [ ] Test tạo TTLS thành công
- [ ] Tất cả placeholder trong TTLS được replace đúng
- [ ] Test tạo ĐNGN thành công
- [ ] Tất cả placeholder trong ĐNGN được replace đúng
- [ ] Kiểm tra Execution logs không có lỗi
- [ ] File được tạo đúng folder
- [ ] File có quyền "Anyone with link can view"

---

## 📝 Notes

- Sample data trong `test-document-creation.html` đã được kiểm tra và **đúng format**
- Code đã được cải thiện để escape regex special characters đúng cách
- Code sẽ log chi tiết từng bước replace để dễ debug
- Nếu placeholder không được replace, xem Execution logs để biết lý do

---

**✅ Sample data đã sẵn sàng để test!**

