#!/bin/bash
# Script tự động push migration lên Supabase
# Cursor có thể gọi script này để push migrations

set -e  # Dừng nếu có lỗi

echo "🚀 Cursor: Đang push migrations lên Supabase..."
echo ""

# Kiểm tra đã link project chưa
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Chưa link với Supabase project!"
    echo "Chạy: supabase link --project-ref knrnlfsokkrtpvtkuuzr"
    exit 1
fi

# Kiểm tra có migrations mới không
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo "ℹ️  Không có migration files nào"
    exit 0
fi

echo "📋 Tìm thấy $MIGRATION_COUNT migration file(s)"
echo ""

# Push migrations (tự động confirm)
echo "📤 Pushing migrations..."
supabase db push --db-url "$(grep SUPABASE_DB_URL .env | cut -d '=' -f2-)" 2>/dev/null || supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Đã push migrations thành công!"
    echo ""
    echo "📊 Xem database tại:"
    echo "   https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/editor"
    echo ""
    echo "🔍 Kiểm tra migrations:"
    echo "   https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/database/migrations"
    exit 0
else
    echo ""
    echo "❌ Có lỗi xảy ra khi push migrations"
    echo ""
    echo "💡 Thử các cách sau:"
    echo "   1. Chạy: supabase login"
    echo "   2. Chạy: supabase link --project-ref knrnlfsokkrtpvtkuuzr"
    echo "   3. Hoặc chạy SQL trực tiếp trên Dashboard"
    exit 1
fi

