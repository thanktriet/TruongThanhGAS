# ✅ Đã Cập Nhật CONFIG

## 📁 Folder IDs

- ✅ **FOLDER_ID_DON_HANG**: `1lmJ-rnhK6J-EQvFHKtem7XDfbjvGEaRg` - Folder lưu file đơn hàng
- ✅ **FOLDER_ID_HOP_DONG**: `1zQRxBRnH5PNJ0mrU7loBpCDCziOJXwv6` - Folder lưu hợp đồng
- ✅ **FOLDER_ID_THOA_THUAN**: `1SdP-6aZZCi_tmmrjNszt4v6fItOKdeEU` - Folder lưu thỏa thuận
- ✅ **FOLDER_ID_DE_NGHI**: `1SdP-6aZZCi_tmmrjNszt4v6fItOKdeEU` - Folder lưu đề nghị giải ngân

⚠️ **Lưu ý**: `FOLDER_ID_DE_NGHI` và `FOLDER_ID_THOA_THUAN` có cùng ID. Đảm bảo folder này phù hợp cho cả hai mục đích.

## 📄 Template IDs

### Hợp Đồng Mua Bán (HĐMB)
- ✅ **TEMPLATE_ID_HDMB**: `1LtX6VQDHMg3-AThj9HKr5MIN5phL5x526O2mUOzKwRE`

### Đề Nghị Giải Ngân (ĐNGN)
- ✅ **TEMPLATE_ID_DNGN**: `1P0WUCjH60w93pD-O_nJy8twZfJMLWWvWx0mLltZhv_c`

### Thỏa Thuận Lãi Suất (TTLS)

- ✅ **Techcombank**: `1HtH6RiGrad2sUCLyK7Ere0Za6rT4GlbGlo0R5stDHVU`
- ✅ **VPBank**: `1jWq25YMTsxTfNGjzYEnMdN0B4Y2NfiUTN07_nnHUQ7A`
- ✅ **TPBank**: `1NMG_RnIyQ7KgeS_4oGfwLN2G6MykBGFZTGXl2BQf1DU`
- ⚠️ **BIDV**: `REPLACE_WITH_BIDV_DOC_ID` - **Chưa được cấu hình**
- ✅ **Sacombank**: `1TePgLhNa0FWfbkj7ek4gi3pmTZTIstPz7Toxw8kNBL8`

## ⚠️ Cần Làm

### 1. Cập Nhật BIDV Template ID

Nếu cần sử dụng BIDV:
1. Tạo template trên Google Drive
2. Lấy Template ID từ URL
3. Cập nhật vào CONFIG:
   ```javascript
   "bidv": "YOUR_BIDV_TEMPLATE_ID_HERE"
   ```

### 2. Copy Code Mới Vào Google Apps Script

File `google-scripts/docs-service.gs` đã được cập nhật. Cần:

1. Mở file `google-scripts/docs-service.gs`
2. Copy toàn bộ nội dung (đặc biệt phần CONFIG)
3. Vào [Google Apps Script Editor](https://script.google.com)
4. Mở project của bạn
5. Paste code mới vào editor
6. Click **Save** (Ctrl+S hoặc Cmd+S)

### 3. Deploy Lại Google Apps Script

Sau khi save code:
1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (biểu tượng bút chì) trên deployment hiện tại
3. Đảm bảo:
   - **Execute as**: Me
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. URL sẽ giữ nguyên

## ✅ Sau Khi Hoàn Tất

1. ✅ CONFIG đã được cập nhật trong code
2. ⏳ Copy code vào Google Apps Script
3. ⏳ Deploy lại Google Apps Script
4. ✅ Có thể test tạo HĐMB, TTLS, ĐNGN

## 🧪 Test

Sau khi deploy lại, có thể test:

1. **Tạo HĐMB** - Dùng template `1LtX6VQDHMg3-AThj9HKr5MIN5phL5x526O2mUOzKwRE`
2. **Tạo TTLS** - Dùng template theo ngân hàng (Techcom, VPBank, TPBank, Sacombank)
3. **Tạo ĐNGN** - Dùng template `1P0WUCjH60w93pD-O_nJy8twZfJMLWWvWx0mLltZhv_c`

Lưu ý: BIDV sẽ không hoạt động cho đến khi Template ID được cập nhật.

