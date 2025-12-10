-- Migration: Update Sales Policies Dates to Current Year
-- Created: 2024-12-05
-- Description: Cập nhật valid_from và valid_to của sample policies về năm hiện tại để test

-- Cập nhật tất cả policies có valid_from và valid_to trong năm 2025 về năm 2024
-- Để policies có thể hiển thị ngay (vì hôm nay là 2024)

UPDATE sales_policies
SET 
    valid_from = CASE 
        WHEN EXTRACT(YEAR FROM valid_from) = 2025 THEN 
            (valid_from - INTERVAL '1 year')::DATE
        ELSE valid_from
    END,
    valid_to = CASE 
        WHEN EXTRACT(YEAR FROM valid_to) = 2025 THEN 
            (valid_to - INTERVAL '1 year')::DATE
        ELSE valid_to
    END,
    updated_at = NOW()
WHERE EXTRACT(YEAR FROM valid_from) = 2025 OR EXTRACT(YEAR FROM valid_to) = 2025;

