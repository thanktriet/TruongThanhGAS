# Hướng Dẫn Migration Password Hashing

## 📋 Tổng Quan

Hệ thống đã được nâng cấp từ MD5 (yếu, không an toàn) sang **PBKDF2** (mạnh, an toàn hơn nhiều).

## 🔒 Thay Đổi

### Trước đây (MD5 - Yếu):
- ❌ Không có salt
- ❌ Không có iterations
- ❌ Dễ bị brute force
- ❌ Dễ bị rainbow table attacks
- ❌ Hash format: `827ccb0eea8a706c4c34a16891f84e7b` (32 ký tự hex)

### Bây giờ (PBKDF2 - Mạnh):
- ✅ Có salt (random cho mỗi password)
- ✅ 100,000 iterations
- ✅ Sử dụng SHA-256
- ✅ Resistant to rainbow table attacks
- ✅ Hash format: `salt:iterations:hash` (ví dụ: `a1b2c3...:100000:d4e5f6...`)

## 🔄 Backward Compatibility

Hệ thống vẫn hỗ trợ cả MD5 (legacy) và PBKDF2 (new):
- **Login**: Tự động detect format và verify đúng method
- **Change Password**: Luôn tạo hash mới bằng PBKDF2

## 📝 Quá Trình Migration

### Tự Động (Không cần action):
1. **Đăng nhập**: Users với MD5 password vẫn đăng nhập được bình thường
2. **Đổi mật khẩu**: Khi user đổi password, hệ thống tự động tạo hash mới bằng PBKDF2
3. **Tạo user mới**: Tất cả passwords mới đều dùng PBKDF2

### Khuyến Nghị (Nên làm):
1. **Force password reset**: Admin nên yêu cầu tất cả users đổi password một lần
2. **Hoặc**: Chạy migration script để tự động hash lại passwords (cần biết plaintext passwords - không khả thi)

## ⚠️ Lưu Ý

- **Không thể migrate passwords cũ từ MD5 sang PBKDF2** vì cần plaintext password
- Users sẽ tự động được upgrade khi đổi password
- Hệ thống sẽ tiếp tục hỗ trợ MD5 trong một thời gian (backward compatibility)

## 🔐 Password Format trong Database

### MD5 (Legacy):
```
827ccb0eea8a706c4c34a16891f84e7b
```

### PBKDF2 (New):
```
a1b2c3d4e5f6...:100000:d4e5f6a7b8c9...
  ↑ salt       ↑ iterations  ↑ hash
```

## ✅ Kiểm Tra

Để kiểm tra password đã được migrate chưa:
1. Xem trong database: Nếu password chứa `:` (dấu hai chấm) thì đã là PBKDF2
2. Nếu chỉ là hex string (32 ký tự) thì vẫn là MD5

## 🚀 Lợi Ích Bảo Mật

- **Brute force resistance**: 100,000 iterations làm chậm attacker hàng nghìn lần
- **Salt**: Mỗi password có salt riêng, không thể dùng rainbow table
- **Future-proof**: Có thể tăng iterations khi cần (hardware mạnh hơn)

## 📚 Technical Details

- **Algorithm**: PBKDF2-HMAC-SHA256
- **Iterations**: 100,000 (có thể tăng sau)
- **Salt length**: 128 bits (16 bytes)
- **Hash length**: 256 bits (32 bytes)
- **Web Crypto API**: Native browser API, không cần thư viện bên ngoài

