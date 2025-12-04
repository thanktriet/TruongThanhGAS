# 🔒 Quyền Cập Nhật Lương Năng Suất

## ✅ Đã cập nhật

### Vấn đề
- Không cho bất cứ ai điều chỉnh lương năng suất sau khi tờ trình đã hoàn thành

### Đã sửa

#### 1. Logic `can_edit_cost` trong Frontend
- ✅ Không ai được chỉnh sửa lương năng suất sau khi hoàn thành (step >= 4)
- ✅ Chỉ có thể điều chỉnh khi đang trong quá trình duyệt (step < 4)

#### 2. Kiểm tra quyền trong Backend
- ✅ `supabaseUpdateProductivityBonus`: Chặn tất cả mọi người nếu tờ trình đã hoàn thành
- ✅ `supabaseProcessApproval`: Chặn điều chỉnh lương năng suất khi đã hoàn thành

## 📝 Logic đã cập nhật

### Frontend (`js/app.js`)

```javascript
// Không cho bất cứ ai chỉnh sửa lương năng suất sau khi hoàn thành
const isCompleted = data.step >= 4; // Step 4 (KETOAN) là hoàn tất
if (isCompleted) {
    data.can_edit_cost = false; // Không ai được chỉnh sửa sau khi hoàn thành
} else {
    data.can_edit_cost = (session && (session.role === 'ADMIN' || canEditAtCurrentStep));
}
```

### Backend (`js/supabase-api.js`)

#### `supabaseUpdateProductivityBonus`
```javascript
// Kiểm tra quyền: Không cho bất cứ ai cập nhật lương năng suất sau khi hoàn thành
const isCompleted = approval.current_step >= 4;
if (isCompleted) {
    return { success: false, message: 'Không được cập nhật lương năng suất sau khi tờ trình đã hoàn thành' };
}
```

#### `supabaseProcessApproval`
```javascript
// Kiểm tra: Không cho điều chỉnh lương năng suất sau khi hoàn thành
const isCompleted = approval.current_step >= 4;
if (isCompleted && d.productivity_bonus !== undefined && d.productivity_bonus !== null && d.productivity_bonus !== '') {
    const newProductivityBonus = parseVND(d.productivity_bonus);
    const oldProductivityBonus = approval.productivity_bonus || 0;
    if (newProductivityBonus !== oldProductivityBonus) {
        return { success: false, message: 'Không được điều chỉnh lương năng suất sau khi tờ trình đã hoàn thành' };
    }
}
```

## ✅ Quyền cập nhật lương năng suất

### Tất cả mọi người
- ✅ Có thể cập nhật khi:
  - Đang trong quá trình duyệt (step < 4)
  - Khi duyệt ở bước của họ (nếu có quyền)
- ❌ Không thể cập nhật khi:
  - Tờ trình đã hoàn thành (step >= 4)

### Khi đang duyệt (step < 4)
- ✅ TPKD: Có thể điều chỉnh khi duyệt ở step 0
- ✅ GĐKD: Có thể điều chỉnh khi duyệt ở step 1
- ✅ BKS: Có thể điều chỉnh khi duyệt ở step 2
- ✅ BGĐ: Có thể điều chỉnh khi duyệt ở step 3
- ✅ KETOAN: Có thể điều chỉnh khi duyệt ở step 4 (trước khi hoàn thành)
- ✅ ADMIN: Có thể điều chỉnh ở bất kỳ bước nào

### Sau khi hoàn thành (step >= 4)
- ❌ Không ai được điều chỉnh lương năng suất

## ✅ Đã commit

- Commit: `fix: Không cho bất cứ ai điều chỉnh lương năng suất sau khi hoàn thành`
- Đã push lên GitHub

## 🧪 Test

### Test với TVBH
1. Login với `sale1` / `12345`
2. Xem tờ trình đã hoàn thành (step >= 4)
3. Không thấy nút "Lưu" để cập nhật lương năng suất
4. Nếu cố gắng cập nhật qua API, sẽ nhận lỗi

### Test với Admin/GĐKD/BKS/BGĐ/KT
1. Login với `admin` / `12345`
2. Xem tờ trình đã hoàn thành (step >= 4)
3. Không thấy nút "Lưu" để cập nhật lương năng suất
4. Nếu cố gắng cập nhật qua API, sẽ nhận lỗi

### Test khi đang duyệt
1. Login với `tpkd1` / `12345`
2. Xem tờ trình đang chờ duyệt ở step 0
3. Vẫn thấy nút "Lưu" để cập nhật lương năng suất
4. Có thể cập nhật thành công

## 📊 Kết quả

- ✅ Không ai có thể cập nhật lương năng suất sau khi hoàn thành
- ✅ Chỉ có thể điều chỉnh khi đang trong quá trình duyệt
- ✅ Đảm bảo tính toàn vẹn dữ liệu sau khi hoàn thành

