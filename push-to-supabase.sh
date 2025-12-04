#!/bin/bash
# Script để push migrations lên Supabase
# Usage: ./push-to-supabase.sh

echo "🚀 Đang push migrations lên Supabase..."
echo ""

# Kiểm tra đã link project chưa
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Chưa link với Supabase project!"
    echo "Chạy: supabase link --project-ref knrnlfsokkrtpvtkuuzr"
    exit 1
fi

# Push migrations
echo "📤 Pushing migrations..."
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Đã push migrations thành công!"
    echo "🌐 Xem database tại: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/editor"
else
    echo ""
    echo "❌ Có lỗi xảy ra khi push migrations"
    echo "💡 Thử chạy SQL trực tiếp trên Supabase Dashboard:"
    echo "   https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/sql/new"
fi

