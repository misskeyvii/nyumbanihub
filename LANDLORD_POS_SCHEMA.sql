-- ============================================================
-- LANDLORD POS DATABASE SCHEMA
-- ============================================================
-- Tables for property management system
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Properties/Units Table
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  property_type TEXT NOT NULL, -- Apartment, House, Studio, etc.
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  rent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Vacant', -- Occupied, Vacant, Maintenance
  tenant_name TEXT, -- Store tenant name directly to avoid circular dependency
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tenants Table
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  national_id TEXT,
  property_id UUID REFERENCES pos_properties(id) ON DELETE SET NULL,
  property_name TEXT, -- Store property name for easy display
  rent_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  balance DECIMAL(10, 2) DEFAULT 0, -- Outstanding rent balance
  lease_start DATE,
  lease_end DATE,
  status TEXT NOT NULL DEFAULT 'Current', -- Current, Arrears, Notice, Former
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rent Payments Table
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_rent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES pos_tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES pos_properties(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- Cash, M-Pesa, Bank Transfer
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  period_month TEXT NOT NULL, -- e.g., "2026-09" for September 2026
  receipt_no TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Maintenance Requests Table
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  maintenance_id TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES pos_properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES pos_tenants(id) ON DELETE SET NULL,
  issue TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium', -- Low, Medium, High
  status TEXT NOT NULL DEFAULT 'Open', -- Open, In Progress, Resolved
  reported_date TIMESTAMPTZ DEFAULT NOW(),
  resolved_date TIMESTAMPTZ,
  cost DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for Performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pos_properties_user_id ON pos_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_properties_status ON pos_properties(status);
CREATE INDEX IF NOT EXISTS idx_pos_tenants_user_id ON pos_tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_tenants_property_id ON pos_tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_pos_tenants_status ON pos_tenants(status);
CREATE INDEX IF NOT EXISTS idx_pos_rent_payments_user_id ON pos_rent_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_rent_payments_tenant_id ON pos_rent_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pos_maintenance_user_id ON pos_maintenance(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_maintenance_property_id ON pos_maintenance(property_id);
CREATE INDEX IF NOT EXISTS idx_pos_maintenance_status ON pos_maintenance(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE pos_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_maintenance ENABLE ROW LEVEL SECURITY;

-- Properties Policies
CREATE POLICY "Users can view own properties" ON pos_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON pos_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON pos_properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON pos_properties FOR DELETE USING (auth.uid() = user_id);

-- Tenants Policies
CREATE POLICY "Users can view own tenants" ON pos_tenants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tenants" ON pos_tenants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tenants" ON pos_tenants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tenants" ON pos_tenants FOR DELETE USING (auth.uid() = user_id);

-- Rent Payments Policies
CREATE POLICY "Users can view own rent payments" ON pos_rent_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rent payments" ON pos_rent_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rent payments" ON pos_rent_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rent payments" ON pos_rent_payments FOR DELETE USING (auth.uid() = user_id);

-- Maintenance Policies
CREATE POLICY "Users can view own maintenance" ON pos_maintenance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own maintenance" ON pos_maintenance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own maintenance" ON pos_maintenance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own maintenance" ON pos_maintenance FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SEED DATA (Optional - for testing)
-- ============================================================
-- Replace 'YOUR_USER_ID' with actual user ID from auth.users table
-- You can get it by running: SELECT id FROM auth.users WHERE email = 'kisumuvaccant@nyumbanilink.com';

/*
-- Example Properties
INSERT INTO pos_properties (user_id, property_id, name, location, property_type, bedrooms, bathrooms, rent, status) VALUES
('YOUR_USER_ID', 'prop-001', 'Apartment 1A', 'Westlands, Nairobi', 'Apartment', 2, 1, 45000, 'Vacant'),
('YOUR_USER_ID', 'prop-002', 'House Lavington', 'Lavington, Nairobi', 'House', 3, 2, 85000, 'Occupied'),
('YOUR_USER_ID', 'prop-003', 'Studio Karen', 'Karen, Nairobi', 'Studio', 1, 1, 28000, 'Vacant');

-- Example Tenants (add after properties exist)
INSERT INTO pos_tenants (user_id, tenant_id, name, phone, email, rent_amount, status) VALUES
('YOUR_USER_ID', 'ten-001', 'John Kamau', '+254712345678', 'john@example.com', 45000, 'Current'),
('YOUR_USER_ID', 'ten-002', 'Mary Wanjiru', '+254723456789', 'mary@example.com', 85000, 'Current');
*/

-- ============================================================
-- DONE! 
-- ============================================================
-- Now you can update the landlord POS frontend to use these tables
