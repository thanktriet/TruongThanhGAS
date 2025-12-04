# 🔧 Fix Step Hoàn Thành: Từ 6 → 4

## ✅ Đã sửa

### Vấn đề
- Code đang báo step hoàn thành là 6 thay vì 4
- Sample data có đơn APP003 với `current_step = 6`
- Constraint trong database cho phép step 0-6

### Đã sửa

#### 1. Sample Data
- ✅ APP003: `current_step = 6` → `current_step = 4`
- ✅ Status: `'Đã hoàn thành'` → `'Hoàn tất'`

#### 2. Database Constraint
- ✅ Cập nhật: `CHECK (current_step >= 0 AND current_step <= 6)` 
- ✅ Thành: `CHECK (current_step >= 0 AND current_step <= 4)`

#### 3. Migration để fix data hiện có
- ✅ Tạo migration: `20251204152000_fix_step_completion.sql`
- ✅ Update tất cả tờ trình có `current_step = 6` thành `current_step = 4`
- ✅ Cập nhật constraint

## 📝 Logic đúng

### Workflow Steps
- Step 0: TPKD
- Step 1: GDKD
- Step 2: BKS
- Step 3: BGD
- Step 4: KETOAN (bước cuối, sau khi duyệt là hoàn tất)

### Step hoàn thành
- ✅ `current_step = 4` (sau khi KETOAN duyệt)
- ✅ Không phải step 6

### Logic kiểm tra hoàn tất
- ✅ `current_step >= 4` → hoàn tất
- ✅ `is_completed = true` khi `current_step >= 4`

## ⚠️ Lưu ý

### `next: 6` trong WORKFLOW
- `next: 6` chỉ là marker để biết đây là bước cuối
- Không có step 6 thực sự trong workflow
- Khi KETOAN duyệt, `current_step` vẫn giữ là 4

### Logic duyệt
```javascript
if (nextStep >= 6 || currentStep === 4) {
    updateData.current_step = 4; // Giữ step = 4, không chuyển sang 6
    updateData.status_text = 'Hoàn tất';
}
```

## 🚀 Cách áp dụng

### 1. Push migration lên Supabase
```bash
supabase db push
```

Hoặc chạy SQL trên Supabase Dashboard:
1. Vào SQL Editor
2. Copy nội dung file `supabase/migrations/20251204152000_fix_step_completion.sql`
3. Paste và Run

### 2. Kiểm tra kết quả
- Tất cả tờ trình có `current_step = 6` sẽ được update thành 4
- Constraint sẽ chỉ cho phép step 0-4

## ✅ Đã commit

- Commit: `fix: Sửa step hoàn thành từ 6 thành 4 - Step 4 là hoàn tất`
- Đã push lên GitHub

## 📊 Kết quả

- ✅ Step hoàn thành: 4 (không phải 6)
- ✅ Constraint: chỉ cho phép step 0-4
- ✅ Sample data: đã sửa APP003
- ✅ Migration: sẵn sàng để fix data hiện có

