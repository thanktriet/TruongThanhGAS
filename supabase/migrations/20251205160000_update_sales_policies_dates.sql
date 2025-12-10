-- Migration: Update Sales Policies Dates to Current Year
-- Created: 2024-12-05
-- Description: Cập nhật valid_from và valid_to của sample policies về năm hiện tại để test

-- Cập nhật tất cả policies có valid_from và valid_to trong năm 2025 về năm 2024
-- Để policies có thể hiển thị ngay (vì hôm nay là 2024)

UPDATE sales_policies
SET 
    valid_from = CASE 
        WHEN valid_from LIKE '2025-%' THEN REPLACE(valid_from, '2025-', '2024-')
        ELSE valid_from
    END,
    valid_to = CASE 
        WHEN valid_to LIKE '2025-%' THEN REPLACE(valid_to, '2025-', '2024-')
        ELSE valid_to
    END,
    updated_at = NOW()
WHERE valid_from LIKE '2025-%' OR valid_to LIKE '2025-%';

