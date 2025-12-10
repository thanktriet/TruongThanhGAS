-- Migration: Set Sales Policies Valid Dates to NULL
-- Created: 2024-12-05
-- Description: Set valid_from và valid_to thành NULL để tự chỉnh sau

-- Set tất cả valid_from và valid_to thành NULL
-- Policies sẽ luôn hiển thị (không giới hạn thời gian)

UPDATE sales_policies
SET 
    valid_from = NULL,
    valid_to = NULL,
    updated_at = NOW();

