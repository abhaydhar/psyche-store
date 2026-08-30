-- ============================================
-- PsycheStore T-Shirt Customizer
-- Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('Adults', 'Kids')),
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  base_image_url TEXT NOT NULL DEFAULT '',
  available_sizes TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  design_image_url TEXT NOT NULL,
  mockup_url TEXT NOT NULL,
  canvas_transform_json JSONB NOT NULL DEFAULT '{}',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Verification'
    CHECK (status IN ('Pending Verification', 'Confirmed', 'Dispatched')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 4. Seed Admin User (password: admin123)
INSERT INTO admin_users (email, password_hash)
VALUES ('admin@example.com', 'admin123')
ON CONFLICT (email) DO NOTHING;

-- 5. Seed Products - Adults
INSERT INTO products (category, color_name, color_hex, available_sizes) VALUES
  ('Adults', 'Black',  '#1a1a1a', ARRAY['S', 'M', 'L', 'XL', 'XXL']),
  ('Adults', 'White',  '#ffffff', ARRAY['S', 'M', 'L', 'XL', 'XXL']),
  ('Adults', 'Navy',   '#1e3a5f', ARRAY['S', 'M', 'L', 'XL', 'XXL'])
ON CONFLICT DO NOTHING;

-- 6. Seed Products - Kids
INSERT INTO products (category, color_name, color_hex, available_sizes) VALUES
  ('Kids', 'Red',    '#dc2626', ARRAY['XS', 'S', 'M', 'L']),
  ('Kids', 'Blue',   '#2563eb', ARRAY['XS', 'S', 'M', 'L']),
  ('Kids', 'Yellow', '#eab308', ARRAY['XS', 'S', 'M', 'L'])
ON CONFLICT DO NOTHING;

-- 7. Enable Row Level Security (allow all for simplicity)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
