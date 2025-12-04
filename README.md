# Hệ Thống Phê Duyệt Giá Xe

Hệ thống quản lý và phê duyệt đề xuất chương trình bán hàng cho công ty Trường Thành.

## 🚀 Tính năng

- **Quản lý tờ trình**: Tạo, chỉnh sửa, và theo dõi tờ trình đề xuất bán hàng
- **Workflow phê duyệt**: Quy trình phê duyệt nhiều cấp (TPKD → GDKD → BKS → BGD → Kế Toán)
- **Quản lý người dùng**: Phân quyền theo vai trò (TVBH, TPKD, GDKD, BKS, BGD, KETOAN, ADMIN)
- **In tờ trình**: Xuất tờ trình ra PDF/In trực tiếp
- **Theo dõi lịch sử**: Lưu lại toàn bộ lịch sử thay đổi và phê duyệt

## 📋 Yêu cầu

- Google Apps Script (GAS) - Backend
- Google Sheets - Database (hoặc Supabase - tùy chọn)
- GitHub Pages - Frontend hosting (tùy chọn)
- Supabase CLI - Để kết nối với Supabase (nếu sử dụng Supabase)

## 🛠️ Cài đặt

### 1. Backend (Google Apps Script)

1. Tạo một Google Apps Script project mới
2. Copy nội dung file `code.gs` vào editor
3. Tạo Google Sheets với 2 sheets:
   - `Users` - Quản lý người dùng
   - `Approvals` - Lưu trữ tờ trình
4. Deploy as Web App với quyền:
   - Execute as: Me
   - Who has access: Anyone
5. Copy Web App URL và cập nhật vào `js/config.js`

### 2. Frontend

#### Option A: GitHub Pages (Khuyến nghị)

1. Push code lên GitHub repository
2. Vào Settings → Pages
3. Chọn branch `main` và folder `/ (root)`
4. Truy cập qua URL: `https://yourusername.github.io/TruongThanhGAS/`

#### Option B: Local Development

```bash
# Sử dụng Python HTTP Server
python3 -m http.server 8000

# Hoặc sử dụng Node.js
npx serve .
```

Truy cập: `http://localhost:8000`

### 3. Kết nối Supabase với Cursor (Tùy chọn)

Nếu bạn muốn sử dụng Supabase thay vì Google Sheets:

1. **Cài đặt Supabase CLI** (nếu chưa có):
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Xem hướng dẫn chi tiết:**
   - Quick Start: `QUICK_START_SUPABASE.md`
   - Hướng dẫn đầy đủ: `SUPABASE_SETUP.md`

3. **Các bước nhanh:**
   ```bash
   # Login vào Supabase
   supabase login
   
   # Link với project của bạn
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Pull schema từ Supabase
   supabase db pull
   ```

Sau khi kết nối, Cursor sẽ tự động nhận diện schema trong `supabase/migrations/`.

## 📁 Cấu trúc thư mục

```
TruongThanhGAS/
├── index.html              # Frontend chính
├── code.gs                 # Backend Google Apps Script
├── js/                     # JavaScript modules
│   ├── config.js           # Cấu hình API URL
│   ├── utils.js            # Utility functions
│   ├── api.js              # API caller
│   ├── auth.js             # Authentication
│   ├── requests.js         # Request management
│   ├── approval.js         # Approval workflow
│   ├── profile.js          # User profile
│   ├── admin.js            # Admin functions
│   ├── print.js            # Print functionality
│   ├── gifts.js            # Gift management
│   └── navigation.js       # Navigation
├── supabase/               # Supabase configuration (nếu sử dụng)
│   ├── config.toml         # Supabase local config
│   └── migrations/         # Database migrations
├── .gitignore
├── .nojekyll               # GitHub Pages config
├── supabase-env.example    # Supabase env template
├── QUICK_START_SUPABASE.md # Hướng dẫn nhanh Supabase
├── SUPABASE_SETUP.md       # Hướng dẫn chi tiết Supabase
└── README.md
```

## 👥 Vai trò người dùng

- **TVBH**: Tạo và quản lý tờ trình của mình
- **TPKD**: Duyệt tờ trình bước đầu
- **GDKD**: Duyệt tờ trình cấp 2
- **BKS**: Ban Kiểm Soát duyệt
- **BGD**: Ban Giám Đốc duyệt
- **KETOAN**: Kiểm tra và hoàn tất
- **ADMIN**: Quản lý toàn hệ thống

## 🔄 Workflow phê duyệt

```
TVBH tạo tờ trình
    ↓
TPKD duyệt (chọn người duyệt tiếp theo)
    ↓
GDKD duyệt (chọn người duyệt tiếp theo)
    ↓
BKS duyệt (chọn người duyệt tiếp theo)
    ↓
BGD duyệt (chọn người duyệt tiếp theo)
    ↓
Kế Toán kiểm tra
    ↓
Hoàn tất - Có thể in
```

## 🔐 Bảo mật

- Mật khẩu được hash bằng MD5
- Session quản lý bằng localStorage
- Yêu cầu đổi mật khẩu lần đầu đăng nhập
- Phân quyền theo vai trò

## 📝 Ghi chú

- File `.nojekyll` cần thiết để GitHub Pages serve các file bắt đầu bằng dấu chấm
- API URL trong `js/config.js` cần được cập nhật sau khi deploy GAS Web App
- Đảm bảo Google Sheets có đủ quyền truy cập

## 🐛 Xử lý lỗi

### Lỗi CORS
- Kiểm tra Web App deployment settings
- Đảm bảo "Who has access" là "Anyone"

### Lỗi load JavaScript
- Kiểm tra đường dẫn file trong `index.html`
- Đảm bảo file `.nojekyll` tồn tại
- Kiểm tra Console (F12) để xem lỗi cụ thể

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Console browser (F12) để xem lỗi
2. Network tab để kiểm tra API calls
3. Google Apps Script execution logs

## 📄 License

Internal use only - Trường Thành Company

