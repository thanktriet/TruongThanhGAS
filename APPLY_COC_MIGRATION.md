# Hướng dẫn áp dụng Migration cho COC Requests

## Bước 1: Mở SQL Editor trên Supabase Dashboard

Truy cập: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/sql/new

## Bước 2: Copy và chạy SQL Migration

Copy toàn bộ nội dung file `supabase/migrations/20251215120000_add_coc_requests_table.sql` và paste vào SQL Editor, sau đó click "Run".

## Bước 3: Kiểm tra bảng đã được tạo

Chạy query sau để kiểm tra:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'coc_requests';
```

## Bước 4: Kiểm tra dữ liệu

```sql
SELECT COUNT(*) as total FROM coc_requests;
SELECT * FROM coc_requests ORDER BY created_at DESC LIMIT 5;
```

## Lưu ý

- Nếu bảng `orders` chưa tồn tại, migration sẽ fail ở phần ALTER TABLE orders. Trong trường hợp này, có thể bỏ qua phần đó hoặc chạy riêng.
- Sau khi migration xong, hard refresh trang web (Cmd+Shift+R) và test lại chức năng "Quản Lý COC".

