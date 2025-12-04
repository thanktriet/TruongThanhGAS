# 🔒 Quyền Cập Nhật Lương Năng Suất

## ✅ Đã cập nhật

### Vấn đề
- TVBH vẫn có thể cập nhật lương năng suất sau khi tờ trình đã hoàn thành

### Đã sửa

#### 1. Logic `can_edit_cost` trong Frontend
- ✅ TVBH không được chỉnh sửa lương năng suất sau khi hoàn thành
- ✅ Chỉ Admin, GĐKD, BKS, BGĐ, KT có thể chỉnh sửa sau khi hoàn thành

#### 2. Kiểm tra quyền trong Backend
- ✅ `supabaseUpdateProductivityBonus`: Chặn TVBH nếu tờ trình đã hoàn thành (step >= 4)

## 📝 Logic đã cập nhật

### Frontend (`js/app.js`)

```javascript
// TVBH không được chỉnh sửa lương năng suất sau khi hoàn thành
const isTVBH = session && (session.role === 'TVBH' || session.role === 'SALE');
if (isCompleted && isTVBH) {
    data.can_edit_cost = false; // TVBH không được chỉnh sửa sau khi hoàn thành
} else {
    data.can_edit_cost = (session && (session.role === 'ADMIN' || canEditAtCurrentStep || isCompleted));
}
```

### Backend (`js/supabase-api.js`)

```javascript
// Kiểm tra quyền: TVBH không được cập nhật lương năng suất sau khi hoàn thành
const isCompleted = approval.current_step >= 4;
const isTVBH = d.role === 'TVBH' || d.role === 'SALE';
if (isCompleted && isTVBH) {
    return { success: false, message: 'TVBH không được cập nhật lương năng suất sau khi tờ trình đã hoàn thành' };
}
```

## ✅ Quyền cập nhật lương năng suất

### TVBH/SALE
- ✅ Có thể cập nhật khi:
  - Tờ trình chưa hoàn thành (step < 4)
  - Đang ở bước duyệt của họ (nếu có quyền)
- ❌ Không thể cập nhật khi:
  - Tờ trình đã hoàn thành (step >= 4)

### Admin, GĐKD, BKS, BGĐ, KT
- ✅ Có thể cập nhật:
  - Khi đang duyệt (trong bước của họ)
  - Sau khi hoàn thành

### TPKD
- ✅ Có thể cập nhật khi:
  - Đang duyệt ở bước của họ (step 0)

## ✅ Đã commit

- Commit: `fix: TVBH không được cập nhật lương năng suất sau khi tờ trình đã hoàn thành`
- Đã push lên GitHub

## 🧪 Test

### Test với TVBH
1. Login với `sale1` / `12345`
2. Xem tờ trình đã hoàn thành (step >= 4)
3. Không thấy nút "Lưu" để cập nhật lương năng suất
4. Nếu cố gắng cập nhật qua API, sẽ nhận lỗi

### Test với Admin/GĐKD/BKS/BGĐ/KT
1. Login với `admin` / `12345`
2. Xem tờ trình đã hoàn thành
3. Vẫn thấy nút "Lưu" để cập nhật lương năng suất
4. Có thể cập nhật thành công

## 📊 Kết quả

- ✅ TVBH không thể cập nhật lương năng suất sau khi hoàn thành
- ✅ Admin, GĐKD, BKS, BGĐ, KT vẫn có thể cập nhật sau khi hoàn thành
- ✅ TVBH chỉ có thể cập nhật khi tờ trình chưa hoàn thành

