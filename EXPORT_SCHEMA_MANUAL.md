# 📋 Export Schema từ Supabase Dashboard (Không cần Docker)

## Cách 1: Export từ SQL Editor

1. Vào: https://supabase.com/dashboard/project/knrnlfsokkrtpvtkuuzr/sql/new
2. Chạy query sau để xem tất cả tables:
   ```sql
   SELECT 
     table_name,
     table_schema
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

3. Export schema của từng table hoặc toàn bộ:
   ```sql
   -- Xem schema của một table
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'your_table_name';
   ```

## Cách 2: Sử dụng Supabase CLI với Remote Connection

Nếu bạn đã có database password trong file `.env`, có thể thử:

```bash
# Kiểm tra connection
supabase db remote commit

# Hoặc sử dụng psql trực tiếp (nếu đã cài)
psql "postgresql://postgres:[PASSWORD]@db.knrnlfsokkrtpvtkuuzr.supabase.co:5432/postgres" -c "\d"
```

## Cách 3: Tạo Migration Files Thủ Công

1. Vào Supabase Dashboard → Table Editor
2. Xem cấu trúc các bảng
3. Tạo file migration trong `supabase/migrations/`

Ví dụ: `supabase/migrations/20241204000000_initial_schema.sql`

```sql
-- Migration: Initial Schema
-- Created: 2024-12-04

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  fullname TEXT NOT NULL,
  role TEXT NOT NULL,
  need_change_pass BOOLEAN DEFAULT true,
  phone TEXT,
  email TEXT,
  "group" TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: approvals
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requester TEXT NOT NULL,
  contract_code TEXT,
  customer_name TEXT,
  -- ... thêm các cột khác
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Cách 4: Sử dụng Supabase Studio (Online)

Cursor vẫn có thể làm việc với Supabase mà không cần local schema files:
- Xem schema trực tiếp trên Supabase Dashboard
- Sử dụng Supabase API từ code
- Schema files chỉ cần thiết nếu bạn muốn version control migrations


