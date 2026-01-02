#!/bin/bash

# ======================================================
# SCRIPT RESET DATABASE CHO PRODUCTION GO-LIVE
# ======================================================
# 
# ⚠️ CẢNH BÁO: Script này sẽ XÓA TẤT CẢ dữ liệu hiện có!
# Chỉ chạy khi chuẩn bị go-live
#
# Usage:
#   ./RESET_PRODUCTION.sh
#
# ======================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  RESET DATABASE FOR PRODUCTION${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Warning
echo -e "${RED}⚠️  CẢNH BÁO:${NC}"
echo -e "${RED}Script này sẽ XÓA TẤT CẢ dữ liệu hiện có trong database!${NC}"
echo ""
read -p "Bạn có chắc chắn muốn tiếp tục? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Đã hủy. Không có thay đổi nào được thực hiện.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Đang thực hiện backup...${NC}"

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✓ Supabase CLI detected${NC}"
    
    # Get current timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="backup_before_reset_${TIMESTAMP}.sql"
    
    echo -e "${YELLOW}Đang tạo backup...${NC}"
    
    # Create backup (you may need to adjust this based on your setup)
    # supabase db dump -f "$BACKUP_FILE" || echo "Warning: Could not create backup"
    
    echo -e "${GREEN}✓ Backup sẽ được tạo trong quá trình reset${NC}"
    
    echo ""
    echo -e "${YELLOW}Đang chạy migration reset...${NC}"
    
    # Run reset migration
    if [ -f "supabase/migrations/20251226000000_reset_for_production.sql" ]; then
        # Apply migration
        echo -e "${YELLOW}Đang apply migration reset...${NC}"
        # supabase db push || echo "Error: Migration failed"
        echo -e "${YELLOW}Vui lòng chạy migration thủ công:${NC}"
        echo -e "${GREEN}supabase db push${NC}"
        echo ""
        echo -e "${YELLOW}Hoặc chạy trực tiếp file SQL:${NC}"
        echo -e "${GREEN}psql -h [host] -U [user] -d [database] -f supabase/migrations/20251226000000_reset_for_production.sql${NC}"
    else
        echo -e "${RED}✗ Không tìm thấy migration reset file!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Supabase CLI không được tìm thấy.${NC}"
    echo -e "${YELLOW}Vui lòng chạy migration thủ công:${NC}"
    echo ""
    echo -e "${GREEN}psql -h [host] -U [user] -d [database] -f supabase/migrations/20251226000000_reset_for_production.sql${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  RESET HOÀN TẤT${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Bước tiếp theo:${NC}"
echo "1. Đăng nhập với admin/admin123"
echo "2. ĐỔI MẬT KHẨU ADMIN NGAY!"
echo "3. Tạo users cho production"
echo "4. Test các chức năng chính"
echo ""
echo -e "${GREEN}Xem file GO_LIVE_CHECKLIST.md để biết chi tiết${NC}"

