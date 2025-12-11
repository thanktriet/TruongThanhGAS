#!/bin/bash
# Script tự động apply migration cho bảng tvbh_targets
# Project: knrnlfsokkrtpvtkuuzr.supabase.co

set -e

echo "🚀 Đang apply migration cho bảng tvbh_targets..."
echo ""

PROJECT_REF="knrnlfsokkrtpvtkuuzr"
MIGRATION_FILE="supabase/migrations/APPLY_TO_knrnlfsokkrtpvtkuuzr.sql"

# Kiểm tra file migration có tồn tại không
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Không tìm thấy file migration: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Tìm thấy file migration: $MIGRATION_FILE"
echo ""

# Cách 1: Thử dùng Supabase CLI nếu đã link
if [ -f ".supabase/config.toml" ]; then
    echo "📋 Cách 1: Thử chạy qua Supabase CLI..."
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
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📝 Vì không thể chạy tự động qua CLI, bạn cần chạy thủ công:"
echo ""
echo "CÁCH 1: Chạy trên Supabase Dashboard (DỄ NHẤT)"
echo "  1. Mở: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "  2. Copy toàn bộ nội dung file: $MIGRATION_FILE"
echo "  3. Paste vào SQL Editor và click Run"
echo ""
echo "CÁCH 2: Link project và chạy qua CLI"
echo "  supabase link --project-ref $PROJECT_REF"
echo "  supabase db push"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 SQL cần chạy (đã sẵn sàng):"
echo "═══════════════════════════════════════════════════════"
cat "$MIGRATION_FILE"
echo ""
echo "═══════════════════════════════════════════════════════"

exit 1

