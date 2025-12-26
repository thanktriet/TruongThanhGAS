-- Migration: Insert Sample COC Requests for Testing
-- Created: 2024-12-15
-- Description: Thêm dữ liệu mẫu để test tính năng COC requests và tính lãi

-- ======================================================
-- 1. INSERT SAMPLE COC REQUEST (pending)
-- ======================================================
INSERT INTO coc_requests (
    order_id,
    contract_code,
    customer_name,
    car_model,
    car_version,
    car_color,
    vin_number,
    po_number,
    import_price,
    payment_method,
    guarantee_bank_coc,
    principal_amount,
    request_date,
    interest_rate,
    requester,
    status,
    notes
) VALUES (
    NULL, -- Không có order_id (tạo thủ công)
    'S10601234',
    'Nguyễn Văn A',
    'VF 5 Plus',
    'Plus',
    'Trắng',
    'LFV2B23R5R1234567',
    'PO-2024-001',
    420000000, -- 420 triệu
    'Tiền mặt',
    NULL,
    420000000, -- principal_amount = import_price
    CURRENT_DATE - INTERVAL '2 days', -- 2 ngày trước
    8.0, -- 8%/năm
    'tvbh1', -- TVBH tạo
    'pending',
    'Đơn hàng mẫu để test - chưa cấp COC'
) ON CONFLICT DO NOTHING;

-- ======================================================
-- 2. INSERT SAMPLE COC REQUEST (issued - đã cấp, có tính lãi)
-- ======================================================
INSERT INTO coc_requests (
    order_id,
    contract_code,
    customer_name,
    car_model,
    car_version,
    car_color,
    vin_number,
    po_number,
    import_price,
    payment_method,
    guarantee_bank_coc,
    principal_amount,
    request_date,
    actual_issue_date,
    interest_rate,
    business_days_delayed,
    interest_amount,
    requester,
    issuer,
    status,
    coc_image_url,
    handover_document_url,
    notes
) VALUES (
    NULL,
    'S10601235',
    'Trần Thị B',
    'VF 8',
    'Eco',
    'Đen',
    'LFV2B23R5R2345678',
    'PO-2024-002',
    850000000, -- 850 triệu
    'Trả góp',
    'Vietcombank',
    850000000,
    CURRENT_DATE - INTERVAL '15 days', -- 15 ngày trước (đề nghị)
    CURRENT_DATE - INTERVAL '5 days', -- 5 ngày trước (cấp thực tế)
    -- Tính: request_date + 5 business days = target date
    -- Nếu actual_issue_date > target date thì có trễ
    -- Ở đây: 15 ngày trước + 5 ngày làm việc ≈ 12-13 ngày trước (target)
    -- actual_issue_date = 5 ngày trước > target date → có trễ khoảng 5-7 ngày làm việc
    8.0,
    5, -- 5 ngày làm việc trễ
    -- Tính lãi: 850,000,000 * (8/100) / 365 * 5 = 931,507 VND
    931507, -- Làm tròn
    'tvbh2',
    'saleadmin1',
    'issued',
    'https://drive.google.com/file/d/sample_coc_image_id/view',
    'https://drive.google.com/file/d/sample_handover_doc_id/view',
    'Đơn hàng mẫu - đã cấp COC, có tính lãi do trễ 5 ngày làm việc'
) ON CONFLICT DO NOTHING;

-- ======================================================
-- 3. INSERT SAMPLE COC REQUEST (disbursed - đã giải ngân)
-- ======================================================
INSERT INTO coc_requests (
    order_id,
    contract_code,
    customer_name,
    car_model,
    car_version,
    car_color,
    vin_number,
    po_number,
    import_price,
    payment_method,
    guarantee_bank_coc,
    principal_amount,
    request_date,
    actual_issue_date,
    interest_rate,
    business_days_delayed,
    interest_amount,
    requester,
    issuer,
    accountant,
    status,
    coc_image_url,
    handover_document_url,
    disbursement_file_url,
    notes
) VALUES (
    NULL,
    'S10601236',
    'Lê Văn C',
    'VF 5',
    'Eco',
    'Xám',
    'LFV2B23R5R3456789',
    'PO-2024-003',
    380000000, -- 380 triệu
    'Bảo lãnh ngân hàng',
    'BIDV',
    380000000,
    CURRENT_DATE - INTERVAL '30 days', -- 30 ngày trước
    CURRENT_DATE - INTERVAL '20 days', -- 20 ngày trước (cấp)
    -- request_date + 5 business days ≈ 25 ngày trước (target)
    -- actual_issue_date = 20 ngày trước < target date → không trễ
    8.0,
    0, -- Không trễ
    0, -- Không có lãi
    'tvbh1',
    'saleadmin1',
    'ketoan1',
    'disbursed',
    'https://drive.google.com/file/d/sample_coc_image_id_2/view',
    'https://drive.google.com/file/d/sample_handover_doc_id_2/view',
    'https://drive.google.com/file/d/sample_disbursement_file_id/view',
    'Đơn hàng mẫu - đã giải ngân, không có lãi vì cấp đúng hạn'
) ON CONFLICT DO NOTHING;

-- ======================================================
-- VERIFY
-- ======================================================
-- Kiểm tra các COC requests đã được insert
-- SELECT id, contract_code, customer_name, status, request_date, actual_issue_date, business_days_delayed, interest_amount 
-- FROM coc_requests 
-- WHERE contract_code IN ('S10601234', 'S10601235', 'S10601236')
-- ORDER BY request_date DESC;

