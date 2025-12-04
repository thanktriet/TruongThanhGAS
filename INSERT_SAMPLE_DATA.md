# 📝 Insert Sample Data vào Supabase

## ✅ Đã tạo migration file

File migration: `supabase/migrations/20251204150705_sample_data.sql`

## 📦 Sample Data bao gồm

### 1. Users (9 users)
- `admin` - Quản Trị Viên (ADMIN)
- `sale1`, `sale2` - TVBH
- `tpkd1`, `tpkd2` - TPKD
- `gdkd1` - GDKD
- `bks1` - BKS
- `bgd1` - BGD
- `ketoan1` - KETOAN

**Password mặc định:** `12345` (MD5 hash: `827ccb0eea8a706c4c34a16891f84e7b`)

### 2. Approvals (5 tờ trình)
- **APP001**: Đang chờ TPKD duyệt (step 0)
- **APP002**: Đang chờ GDKD duyệt (step 1)
- **APP003**: Đã hoàn thành (step 6)
- **APP004**: Đã từ chối ở bước TPKD
- **APP005**: Đang chờ BKS duyệt (step 2)

### 3. Contracts (5 hợp đồng)
Tương ứng với các contract codes trong approvals:
- `S10601234` - Nguyễn Văn A
- `S10601235` - Trần Thị B
- `S10601230` - Lê Văn C
- `S10601236` - Phạm Thị D
- `S10601237` - Hoàng Văn E

### 4. Logs (7 log entries)
Lịch sử hoạt động của hệ thống

## 🚀 Cách chạy migration

### Cách 1: Dùng Supabase CLI (Khuyên dùng)

```bash
# Đảm bảo đã link với Supabase project
supabase link --project-ref knrnlfsokkrtpvtkuuzr

# Push migration lên Supabase
supabase db push
```

### Cách 2: Chạy SQL trực tiếp trên Supabase Dashboard

1. Vào Supabase Dashboard: https://app.supabase.com/project/knrnlfsokkrtpvtkuuzr/editor
2. Vào **SQL Editor**
3. Copy nội dung file `supabase/migrations/20251204150705_sample_data.sql`
4. Paste vào SQL Editor và click **Run**

## ✅ Sau khi chạy migration

### Test với sample data

1. **Login với các users:**
   - Username: `admin`, Password: `12345`
   - Username: `sale1`, Password: `12345`
   - Username: `tpkd1`, Password: `12345`

2. **Test lookup contract:**
   - Tìm mã hợp đồng: `S10601234`, `S10601235`, etc.

3. **Test pending list:**
   - Login với `tpkd1` sẽ thấy đơn APP001, APP005 chờ duyệt
   - Login với `gdkd1` sẽ thấy đơn APP002 chờ duyệt

4. **Test my requests:**
   - Login với `sale1` sẽ thấy các đơn: APP001, APP003, APP005

## 📊 Kiểm tra data trong Supabase Dashboard

1. Vào **Table Editor**: https://app.supabase.com/project/knrnlfsokkrtpvtkuuzr/editor
2. Xem các bảng:
   - `users` - 9 users
   - `approvals` - 5 approvals
   - `contracts` - 5 contracts
   - `logs` - 7 logs

## ⚠️ Lưu ý

- Migration sẽ không ghi đè dữ liệu cũ (dùng `ON CONFLICT DO NOTHING`)
- Nếu đã có data, sẽ update một số trường của users
- Có thể chạy lại migration nhiều lần an toàn

## 🔄 Cập nhật lookup contract

Đã cập nhật function `supabaseLookupContract` để:
- Tìm trong bảng `contracts` của Supabase
- Nếu không tìm thấy, sẽ fallback về Google Apps Script (nếu cần)

Giờ lookup contract sẽ 100% dùng Supabase nếu có data trong bảng `contracts`!

