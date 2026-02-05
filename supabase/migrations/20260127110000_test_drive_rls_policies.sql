-- Migration: RLS policies cho test_drive_vehicles và test_drive_requests
-- Cho phép anon/authenticated access (authorization xử lý ở application layer)

-- RLS cho test_drive_vehicles
ALTER TABLE test_drive_vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow test_drive_vehicles all" ON test_drive_vehicles;
CREATE POLICY "Allow test_drive_vehicles all" ON test_drive_vehicles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- RLS cho test_drive_requests
ALTER TABLE test_drive_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow test_drive_requests all" ON test_drive_requests;
CREATE POLICY "Allow test_drive_requests all" ON test_drive_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
