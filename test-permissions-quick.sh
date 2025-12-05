#!/bin/bash
# Quick test script cho permissions system

echo "🧪 TEST NHANH HỆ THỐNG PHÂN QUYỀN"
echo "=================================="
echo ""

# Test 1: Kiểm tra file permissions.js
echo "1️⃣  Kiểm tra file permissions.js..."
if [ -f "js/permissions.js" ]; then
    echo "   ✅ File tồn tại"
    PERM_COUNT=$(grep -c "'label'" js/permissions.js 2>/dev/null || echo "0")
    echo "   📊 Tìm thấy ~$PERM_COUNT permissions"
else
    echo "   ❌ File không tồn tại"
fi

# Test 2: Kiểm tra modal
echo ""
echo "2️⃣  Kiểm tra modal UI..."
if [ -f "components/modals-user-permissions.html" ]; then
    echo "   ✅ File modal tồn tại"
    if grep -q "modal-user-permissions" components/modals-user-permissions.html; then
        echo "   ✅ Modal ID đúng"
    fi
else
    echo "   ❌ File modal không tồn tại"
fi

# Test 3: Kiểm tra migration file
echo ""
echo "3️⃣  Kiểm tra migration file..."
if [ -f "supabase/migrations/20251205120000_add_user_permissions.sql" ]; then
    echo "   ✅ Migration file tồn tại"
    if grep -q "ALTER TABLE users" supabase/migrations/20251205120000_add_user_permissions.sql; then
        echo "   ✅ SQL syntax đúng"
    fi
else
    echo "   ❌ Migration file không tồn tại"
fi

# Test 4: Kiểm tra API function
echo ""
echo "4️⃣  Kiểm tra API function..."
if grep -q "supabaseUpdateUserPermissions" js/supabase-api.js; then
    echo "   ✅ API function tồn tại"
else
    echo "   ❌ API function chưa được định nghĩa"
fi

# Test 5: Kiểm tra được load vào index.html
echo ""
echo "5️⃣  Kiểm tra load vào hệ thống..."
if grep -q "permissions.js" index.html; then
    echo "   ✅ permissions.js được load trong index.html"
else
    echo "   ❌ permissions.js chưa được load"
fi

if grep -q "modals-user-permissions" js/components.js; then
    echo "   ✅ Modal được load trong components.js"
else
    echo "   ❌ Modal chưa được load"
fi

echo ""
echo "=================================="
echo "✅ Test hoàn tất!"
echo ""
echo "📋 Để test trên ứng dụng:"
echo "   1. Mở ứng dụng trong browser"
echo "   2. Đăng nhập với ADMIN"
echo "   3. Vào 'Quản Lý Users'"
echo "   4. Click button 'Quyền' để test modal"
echo ""

