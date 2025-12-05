#!/bin/bash
# Script tự động chạy migration permissions
# Sẽ thử các cách khác nhau để chạy migration

set -e

echo "🚀 Đang thử chạy migration tự động..."
echo ""

PROJECT_REF="knrnlfsokkrtpvtkuuzr"
MIGRATION_FILE="supabase/migrations/20251205120000_add_user_permissions.sql"

# Kiểm tra file migration có tồn tại không
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Không tìm thấy file migration: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Tìm thấy file migration: $MIGRATION_FILE"
echo ""

# Cách 1: Thử dùng Supabase CLI nếu đã link
echo "📋 Cách 1: Thử chạy qua Supabase CLI..."
if [ -f ".supabase/config.toml" ]; then
    echo "   ✅ Đã có config file"
    if command -v supabase &> /dev/null; then
        echo "   ✅ Supabase CLI đã cài đặt"
        echo "   📤 Đang push migration..."
        if supabase db push 2>&1; then
            echo ""
            echo "✅ ✅ ✅ Migration đã chạy thành công qua CLI!"
            exit 0
        else
            echo "   ⚠️  Không thể push qua CLI, thử cách khác..."
        fi
    else
        echo "   ⚠️  Supabase CLI chưa cài đặt"
    fi
else
    echo "   ℹ️  Chưa link project với Supabase CLI"
    echo "   💡 Có thể link bằng: supabase link --project-ref $PROJECT_REF"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📝 Vì không thể chạy tự động qua CLI, bạn cần chạy thủ công:"
echo ""
echo "CÁCH 1: Chạy trên Supabase Dashboard (DỄ NHẤT)"
echo "  1. Mở: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "  2. Copy nội dung file: MIGRATE_PERMISSIONS.sql"
echo "  3. Paste và click Run"
echo ""
echo "CÁCH 2: Link project và chạy qua CLI"
echo "  supabase link --project-ref $PROJECT_REF"
echo "  supabase db push"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 SQL cần chạy:"
echo "═══════════════════════════════════════════════════════"
cat MIGRATE_PERMISSIONS.sql
echo ""
echo "═══════════════════════════════════════════════════════"

exit 1

