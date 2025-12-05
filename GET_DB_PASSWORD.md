# 🔑 Lấy Database Password

## Cách 1: Lấy từ Supabase Dashboard (Khuyến nghị)

1. Vào: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/settings/database
2. Tìm phần **Connection string**
3. Chọn tab **URI** hoặc **Connection pooling**
4. Bạn sẽ thấy connection string đầy đủ với password đã được điền sẵn
5. Copy toàn bộ connection string đó

Ví dụ:
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

## Cách 2: Reset Database Password

Nếu bạn không nhớ password:

1. Vào: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/settings/database
2. Tìm phần **Database password**
3. Click **Reset database password**
4. Copy password mới
5. Cập nhật vào file `.env`:
   ```
   SUPABASE_DB_URL=postgresql://postgres:[PASSWORD_MỚI]@db.knrnlfsokkrtpvtkuuzr.supabase.co:5432/postgres
   ```

## Cách 3: Sử dụng Connection Pooling (Khuyến nghị cho production)

Supabase cung cấp connection pooling để tối ưu hiệu suất:

1. Vào: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/settings/database
2. Tìm phần **Connection string** → Tab **Connection pooling**
3. Chọn **Session mode** hoặc **Transaction mode**
4. Copy connection string (có dạng khác với URI thông thường)

## ⚠️ Lưu ý

- Password trong connection string là **mật khẩu database**, không phải password tài khoản Supabase
- Nếu reset password, tất cả các connection hiện tại sẽ bị ngắt
- Lưu password an toàn, không commit lên Git

## Sau khi có password:

1. Mở file `.env`
2. Tìm dòng `SUPABASE_DB_URL=postgresql://postgres:[YOUR_PASSWORD]@...`
3. Thay `[YOUR_PASSWORD]` bằng password thực tế
4. Lưu file

Sau đó bạn có thể chạy:
```bash
supabase login
supabase link --project-ref knrnlfsokkrtpvtkuuzr
supabase db pull
```


