-- Migration: Sample Daily Reports Data
-- Created: 2024-12-05
-- Description: Tạo dữ liệu mẫu cho báo cáo ngày để test Dashboard

-- ======================================================
-- 1. XÓA DỮ LIỆU CŨ (NẾU CÓ) - OPTIONAL
-- ======================================================
-- DELETE FROM daily_reports WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- ======================================================
-- 2. SAMPLE DATA CHO THÁNG HIỆN TẠI
-- ======================================================
-- Tạo báo cáo cho 5 TVBH trong 7 ngày gần đây (bao gồm hôm nay)
-- Mỗi TVBH sẽ có:
--   - 1 báo cáo KHTN (car_model = NULL)
--   - 2-3 báo cáo theo dòng xe (VF 5 Plus, VF 8, VF 9, etc.)

DO $$
DECLARE
    today_date DATE := CURRENT_DATE;
    start_date DATE := DATE_TRUNC('month', today_date)::DATE;
    current_date_var DATE;
    tvbh_list TEXT[] := ARRAY['tvbh1', 'tvbh2', 'tvbh3', 'tvbh4', 'tvbh5'];
    group_list TEXT[] := ARRAY['NHÓM 1', 'NHÓM 1', 'NHÓM 2', 'NHÓM 2', 'NHÓM 3'];
    car_models TEXT[] := ARRAY['VF 5 Plus', 'VF 6', 'VF 7', 'VF 8', 'VF 9', 'VF e34'];
    tvbh_idx INT;
    day_offset INT;
    car_idx INT;
    khtn_val NUMERIC;
    hop_dong_val NUMERIC;
    xhd_val NUMERIC;
    doanh_thu_val NUMERIC;
BEGIN
    -- Tạo báo cáo cho 7 ngày gần đây (từ 6 ngày trước đến hôm nay)
    FOR day_offset IN 0..6 LOOP
        current_date_var := today_date - (6 - day_offset);
        
        -- Chỉ tạo báo cáo trong tháng hiện tại
        IF current_date_var >= start_date THEN
            -- Tạo báo cáo cho mỗi TVBH
            FOR tvbh_idx IN 1..5 LOOP
                -- 1. Báo cáo KHTN (car_model = NULL)
                khtn_val := (RANDOM() * 5 + 1)::INT; -- 1-6 KHTN
                INSERT INTO daily_reports (date, tvbh, "group", car_model, khtn, hop_dong, xhd, doanh_thu)
                VALUES (
                    current_date_var,
                    tvbh_list[tvbh_idx],
                    group_list[tvbh_idx],
                    NULL,
                    khtn_val,
                    0,
                    0,
                    0
                )
                ON CONFLICT DO NOTHING;
                
                -- 2. Báo cáo theo dòng xe (2-3 dòng xe mỗi ngày)
                FOR car_idx IN 1..(2 + (RANDOM() * 2)::INT) LOOP
                    -- Chọn dòng xe ngẫu nhiên
                    car_idx := (RANDOM() * 6 + 1)::INT;
                    IF car_idx > 6 THEN car_idx := 6; END IF;
                    
                    hop_dong_val := (RANDOM() * 3)::INT; -- 0-3 HĐ
                    xhd_val := (RANDOM() * 2)::INT; -- 0-2 XHĐ
                    -- Doanh thu: 200-800 triệu tùy dòng xe
                    IF car_models[car_idx] IN ('VF 8', 'VF 9') THEN
                        doanh_thu_val := (RANDOM() * 600 + 200) * 1000000; -- 200-800 triệu
                    ELSIF car_models[car_idx] IN ('VF 7') THEN
                        doanh_thu_val := (RANDOM() * 500 + 150) * 1000000; -- 150-650 triệu
                    ELSE
                        doanh_thu_val := (RANDOM() * 400 + 100) * 1000000; -- 100-500 triệu
                    END IF;
                    
                    INSERT INTO daily_reports (date, tvbh, "group", car_model, khtn, hop_dong, xhd, doanh_thu)
                    VALUES (
                        current_date_var,
                        tvbh_list[tvbh_idx],
                        group_list[tvbh_idx],
                        car_models[car_idx],
                        0,
                        hop_dong_val,
                        xhd_val,
                        doanh_thu_val
                    )
                    ON CONFLICT DO NOTHING;
                END LOOP;
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- ======================================================
-- 3. TẠO THÊM DỮ LIỆU CHO THÁNG TRƯỚC (ĐỂ TEST FILTER)
-- ======================================================
-- Tạo một ít dữ liệu cho tháng trước để test filter tháng

DO $$
DECLARE
    last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
    last_month_end DATE := (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE;
    current_date_var DATE;
    tvbh_list TEXT[] := ARRAY['tvbh1', 'tvbh2', 'tvbh3'];
    group_list TEXT[] := ARRAY['NHÓM 1', 'NHÓM 1', 'NHÓM 2'];
    car_models TEXT[] := ARRAY['VF 5 Plus', 'VF 8', 'VF 9'];
    tvbh_idx INT;
    car_idx INT;
    day_count INT := 0;
BEGIN
    -- Tạo báo cáo cho 3 ngày cuối tháng trước
    current_date_var := last_month_end;
    
    WHILE day_count < 3 AND current_date_var >= last_month_start LOOP
        FOR tvbh_idx IN 1..3 LOOP
            -- KHTN
            INSERT INTO daily_reports (date, tvbh, "group", car_model, khtn, hop_dong, xhd, doanh_thu)
            VALUES (
                current_date_var,
                tvbh_list[tvbh_idx],
                group_list[tvbh_idx],
                NULL,
                (RANDOM() * 5 + 1)::INT,
                0,
                0,
                0
            )
            ON CONFLICT DO NOTHING;
            
            -- 1-2 dòng xe
            FOR car_idx IN 1..(1 + (RANDOM() * 2)::INT) LOOP
                INSERT INTO daily_reports (date, tvbh, "group", car_model, khtn, hop_dong, xhd, doanh_thu)
                VALUES (
                    current_date_var,
                    tvbh_list[tvbh_idx],
                    group_list[tvbh_idx],
                    car_models[(RANDOM() * 3 + 1)::INT],
                    0,
                    (RANDOM() * 2)::INT,
                    (RANDOM() * 2)::INT,
                    (RANDOM() * 500 + 100) * 1000000
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
        
        current_date_var := current_date_var - INTERVAL '1 day';
        day_count := day_count + 1;
    END LOOP;
END $$;

-- ======================================================
-- 4. COMMENT
-- ======================================================
COMMENT ON TABLE daily_reports IS 'Bảng lưu báo cáo ngày của TVBH. Sample data đã được tạo cho tháng hiện tại và tháng trước.';

