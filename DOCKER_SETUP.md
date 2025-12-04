# 🐳 Cài đặt Docker để sử dụng Supabase CLI

## Cài đặt Docker Desktop

### macOS:
1. Tải Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Cài đặt và mở Docker Desktop
3. Đợi Docker khởi động hoàn toàn (icon Docker ở menu bar sẽ không còn loading)

### Kiểm tra Docker đã chạy:
```bash
docker ps
```

Nếu không có lỗi, Docker đã sẵn sàng.

## Sau khi Docker chạy:

Chạy lại lệnh:
```bash
supabase db pull
```

## Lưu ý:
- Docker Desktop cần chạy mỗi khi bạn muốn sử dụng Supabase CLI local
- Nếu không muốn cài Docker, xem Cách 2 bên dưới

