#!/bin/bash

# Script để push sample data lên Supabase

echo "🚀 Đang push sample data lên Supabase..."
echo ""

# Kiểm tra đã link với Supabase chưa
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Chưa link với Supabase project"
    echo "Chạy: supabase link --project-ref knrnlfsokkrtpvtkuuzr"
    exit 1
fi

# Push migration
echo "📦 Đang push migration lên Supabase..."
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Đã push sample data thành công!"
    echo ""
    echo "📝 Sample data bao gồm:"
    echo "   - 9 users (admin, sale1, sale2, tpkd1, tpkd2, gdkd1, bks1, bgd1, ketoan1)"
    echo "   - 5 approvals (các trạng thái khác nhau)"
    echo "   - 5 contracts"
    echo "   - 7 logs"
    echo ""
    echo "🔐 Password mặc định cho tất cả users: 12345"
    echo ""
    echo "🧪 Test tại:"
    echo "   - https://app.vinfastkiengiang.vn/"
    echo "   - Login với: admin / 12345"
else
    echo ""
    echo "❌ Có lỗi xảy ra khi push migration"
    exit 1
fi

