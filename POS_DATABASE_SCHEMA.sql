-- ================================================
-- NYUMBANI LINK POS - DATABASE SCHEMA
-- ================================================
-- This schema integrates with existing nyumbanilink.com users table
-- Execute in Supabase SQL Editor to set up POS functionality
-- ================================================

-- ================================================
-- POS BUSINESS ENTITIES
-- ================================================

-- POS Branches (for multi-location support)
CREATE TABLE pos_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_main_branch BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- POS Employees (staff management)
CREATE TABLE pos_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES pos_branches(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL, -- emp-001, emp-002, etc.
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- Owner, Manager, Cashier, Stock Manager, Accountant
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active', -- active, suspended, inactive
  last_login TIMESTAMPTZ,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, employee_id)
);

-- POS Suppliers
CREATE TABLE pos_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  supplier_id TEXT NOT NULL, -- sup-001, sup-002, etc.
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  products_supplied INTEGER DEFAULT 0,
  total_purchases DECIMAL(10,2) DEFAULT 0,
  amount_owed DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, supplier_id)
);

-- POS Categories
CREATE TABLE pos_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL, -- cat-beverages, cat-snacks, etc.
  name TEXT NOT NULL,
  icon TEXT, -- remixicon class names
  tone TEXT DEFAULT 'primary', -- primary, accent, secondary
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- POS Products
CREATE TABLE pos_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES pos_suppliers(id) ON DELETE SET NULL,
  category_id UUID REFERENCES pos_categories(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL, -- p-001, p-002, etc.
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  brand TEXT,
  buying_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, inactive
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- POS Stock Movements (inventory tracking)
CREATE TABLE pos_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES pos_products(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES pos_employees(id) ON DELETE SET NULL,
  movement_id TEXT NOT NULL, -- mv-001, mv-002, etc.
  movement_type TEXT NOT NULL, -- Sale, Restock, Adjustment, Damaged, Return
  reason TEXT NOT NULL,
  quantity INTEGER NOT NULL, -- positive for in, negative for out
  prev_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  date TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, movement_id)
);

-- POS Customers
CREATE TABLE pos_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL, -- c-001, c-002, etc.
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  visits INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, customer_id)
);

-- POS Sales
CREATE TABLE pos_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES pos_customers(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES pos_employees(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES pos_branches(id) ON DELETE SET NULL,
  sale_id TEXT NOT NULL, -- s-001, s-002, etc.
  receipt_no TEXT NOT NULL,
  cashier TEXT NOT NULL,
  customer_name TEXT DEFAULT 'Walking Customer',
  items JSONB NOT NULL, -- array of {productId, name, qty, unitPrice}
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT, -- Cash, M-PESA, Card, Bank
  status TEXT DEFAULT 'completed', -- completed, refunded
  date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, sale_id)
);

-- POS Expenses
CREATE TABLE pos_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES pos_employees(id) ON DELETE SET NULL,
  expense_id TEXT NOT NULL, -- ex-001, ex-002, etc.
  category TEXT NOT NULL, -- Rent, Electricity, Water, Salaries, Transport, etc.
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT, -- Cash, M-PESA, Card, Bank
  date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, expense_id)
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Branch indexes
CREATE INDEX idx_pos_branches_user_id ON pos_branches(user_id);
CREATE INDEX idx_pos_branches_active ON pos_branches(user_id, is_active);

-- Employee indexes
CREATE INDEX idx_pos_employees_user_id ON pos_employees(user_id);
CREATE INDEX idx_pos_employees_branch ON pos_employees(branch_id);
CREATE INDEX idx_pos_employees_status ON pos_employees(user_id, status);

-- Supplier indexes
CREATE INDEX idx_pos_suppliers_user_id ON pos_suppliers(user_id);
CREATE INDEX idx_pos_suppliers_active ON pos_suppliers(user_id, is_active);

-- Category indexes
CREATE INDEX idx_pos_categories_user_id ON pos_categories(user_id);
CREATE INDEX idx_pos_categories_active ON pos_categories(user_id, is_active);

-- Product indexes
CREATE INDEX idx_pos_products_user_id ON pos_products(user_id);
CREATE INDEX idx_pos_products_category ON pos_products(category_id);
CREATE INDEX idx_pos_products_supplier ON pos_products(supplier_id);
CREATE INDEX idx_pos_products_status ON pos_products(user_id, status);
CREATE INDEX idx_pos_products_stock ON pos_products(user_id, stock);
CREATE INDEX idx_pos_products_sku ON pos_products(user_id, sku);
CREATE INDEX idx_pos_products_barcode ON pos_products(user_id, barcode);

-- Stock movement indexes
CREATE INDEX idx_pos_stock_movements_user_id ON pos_stock_movements(user_id);
CREATE INDEX idx_pos_stock_movements_product ON pos_stock_movements(product_id);
CREATE INDEX idx_pos_stock_movements_date ON pos_stock_movements(user_id, date DESC);
CREATE INDEX idx_pos_stock_movements_type ON pos_stock_movements(user_id, movement_type);

-- Customer indexes
CREATE INDEX idx_pos_customers_user_id ON pos_customers(user_id);
CREATE INDEX idx_pos_customers_phone ON pos_customers(user_id, phone);
CREATE INDEX idx_pos_customers_spent ON pos_customers(user_id, total_spent DESC);

-- Sales indexes
CREATE INDEX idx_pos_sales_user_id ON pos_sales(user_id);
CREATE INDEX idx_pos_sales_customer ON pos_sales(customer_id);
CREATE INDEX idx_pos_sales_employee ON pos_sales(employee_id);
CREATE INDEX idx_pos_sales_date ON pos_sales(user_id, date DESC);
CREATE INDEX idx_pos_sales_status ON pos_sales(user_id, status);
CREATE INDEX idx_pos_sales_receipt ON pos_sales(user_id, receipt_no);

-- Expense indexes
CREATE INDEX idx_pos_expenses_user_id ON pos_expenses(user_id);
CREATE INDEX idx_pos_expenses_category ON pos_expenses(user_id, category);
CREATE INDEX idx_pos_expenses_date ON pos_expenses(user_id, date DESC);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE pos_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)

-- Branches policies
CREATE POLICY pos_branches_policy ON pos_branches
  FOR ALL USING (user_id = auth.uid());

-- Employees policies
CREATE POLICY pos_employees_policy ON pos_employees
  FOR ALL USING (user_id = auth.uid());

-- Suppliers policies
CREATE POLICY pos_suppliers_policy ON pos_suppliers
  FOR ALL USING (user_id = auth.uid());

-- Categories policies
CREATE POLICY pos_categories_policy ON pos_categories
  FOR ALL USING (user_id = auth.uid());

-- Products policies
CREATE POLICY pos_products_policy ON pos_products
  FOR ALL USING (user_id = auth.uid());

-- Stock movements policies
CREATE POLICY pos_stock_movements_policy ON pos_stock_movements
  FOR ALL USING (user_id = auth.uid());

-- Customers policies
CREATE POLICY pos_customers_policy ON pos_customers
  FOR ALL USING (user_id = auth.uid());

-- Sales policies
CREATE POLICY pos_sales_policy ON pos_sales
  FOR ALL USING (user_id = auth.uid());

-- Expenses policies
CREATE POLICY pos_expenses_policy ON pos_expenses
  FOR ALL USING (user_id = auth.uid());

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Function to get receipt number sequence
CREATE OR REPLACE FUNCTION get_next_receipt_no(business_prefix TEXT DEFAULT 'NL')
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  padded_num TEXT;
  random_suffix TEXT;
BEGIN
  -- Get next sequence number (simple counter)
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_no FROM '-(\d+)-') AS INTEGER)), 0) + 1
  INTO next_num
  FROM pos_sales 
  WHERE user_id = auth.uid()
  AND receipt_no ~ (business_prefix || '-\d+-\d+');
  
  -- Pad to 5 digits
  padded_num := LPAD(next_num::TEXT, 5, '0');
  
  -- Generate 4-digit random suffix
  random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  RETURN business_prefix || '-' || padded_num || '-' || random_suffix;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product stock after sale
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  product_record RECORD;
BEGIN
  -- Loop through items in the sale
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    -- Get product details
    SELECT * INTO product_record 
    FROM pos_products 
    WHERE user_id = NEW.user_id 
    AND product_id = (item->>'productId');
    
    IF FOUND THEN
      -- Update product stock
      UPDATE pos_products 
      SET stock = stock - (item->>'qty')::INTEGER,
          updated_at = now()
      WHERE id = product_record.id;
      
      -- Create stock movement record
      INSERT INTO pos_stock_movements (
        user_id, product_id, employee_id, movement_id, movement_type,
        reason, quantity, prev_stock, new_stock
      ) VALUES (
        NEW.user_id, 
        product_record.id,
        NEW.employee_id,
        'mv-' || EXTRACT(epoch FROM now())::TEXT,
        'Sale',
        'Sale ' || NEW.receipt_no,
        -((item->>'qty')::INTEGER),
        product_record.stock,
        product_record.stock - (item->>'qty')::INTEGER
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for stock updates
CREATE TRIGGER update_stock_on_sale
  AFTER INSERT ON pos_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- ================================================
-- DEFAULT DATA CATEGORIES
-- ================================================

-- Function to initialize default categories for new users
CREATE OR REPLACE FUNCTION init_default_pos_categories(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO pos_categories (user_id, category_id, name, icon, tone) VALUES
    (target_user_id, 'cat-beverages', 'Beverages', 'ri-cup-line', 'primary'),
    (target_user_id, 'cat-snacks', 'Snacks', 'ri-cake-line', 'accent'),
    (target_user_id, 'cat-dairy', 'Dairy & Eggs', 'ri-drop-line', 'secondary'),
    (target_user_id, 'cat-household', 'Household', 'ri-home-2-line', 'accent'),
    (target_user_id, 'cat-bakery', 'Bakery', 'ri-restaurant-line', 'secondary'),
    (target_user_id, 'cat-personal', 'Personal Care', 'ri-heart-line', 'primary')
  ON CONFLICT (user_id, category_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- SAMPLE DATA FOR TESTING
-- ================================================

-- Note: This sample data will be inserted for the current authenticated user
-- Run this section only after authenticating as a test user

/*
-- Sample branch
INSERT INTO pos_branches (user_id, name, address, phone, is_main_branch) 
VALUES (auth.uid(), 'Main Branch', 'Nairobi, Kenya', '+254 700 123 456', true);

-- Sample categories (run init function instead)
SELECT init_default_pos_categories(auth.uid());

-- Sample suppliers
INSERT INTO pos_suppliers (user_id, supplier_id, name, contact_person, phone, email, address, products_supplied, total_purchases, amount_owed) VALUES
  (auth.uid(), 'sup-001', 'Nairobi Bottlers', 'David Mwangi', '+254 733 111 222', 'sales@nairobibottlers.co.ke', 'Industrial Area, Nairobi', 3, 184000, 32000),
  (auth.uid(), 'sup-002', 'Brookside Dairy', 'Lucy Akinyi', '+254 711 222 333', 'orders@brookside.co.ke', 'Ruiru, Kiambu', 2, 96500, 0);

-- Sample employees
INSERT INTO pos_employees (user_id, branch_id, employee_id, name, role, phone, email, status, sales_count) VALUES
  (auth.uid(), (SELECT id FROM pos_branches WHERE user_id = auth.uid() LIMIT 1), 'emp-001', 'Grace Wanjiru', 'Owner', '+254 700 123 456', 'grace@abcminimart.co.ke', 'active', 0),
  (auth.uid(), (SELECT id FROM pos_branches WHERE user_id = auth.uid() LIMIT 1), 'emp-002', 'Brian Otieno', 'Cashier', '+254 712 234 567', 'brian@abcminimart.co.ke', 'active', 84);

-- Sample customers
INSERT INTO pos_customers (user_id, customer_id, name, phone, email, total_spent, visits, last_visit) VALUES
  (auth.uid(), 'c-001', 'Mary Achieng', '+254 712 345 678', 'mary.achieng@gmail.com', 24800, 42, '2026-08-12T18:42:00Z'),
  (auth.uid(), 'c-002', 'Walking Customer', '', '', 0, 0, null);
*/

-- ================================================
-- VIEWS FOR REPORTING
-- ================================================

-- Sales summary view
CREATE OR REPLACE VIEW pos_sales_summary AS
SELECT 
  user_id,
  DATE(date) as sale_date,
  COUNT(*) as transaction_count,
  SUM(total) as daily_total,
  AVG(total) as avg_transaction,
  COUNT(DISTINCT customer_id) as unique_customers
FROM pos_sales 
WHERE status = 'completed'
GROUP BY user_id, DATE(date);

-- Product performance view
CREATE OR REPLACE VIEW pos_product_performance AS
SELECT 
  p.user_id,
  p.id as product_id,
  p.name,
  p.selling_price - p.buying_price as profit_per_unit,
  COALESCE(sales_data.units_sold, 0) as units_sold,
  COALESCE(sales_data.revenue, 0) as revenue,
  COALESCE(sales_data.profit, 0) as profit,
  p.stock as current_stock
FROM pos_products p
LEFT JOIN (
  SELECT 
    p.id as product_id,
    p.user_id,
    SUM((item->>'qty')::INTEGER) as units_sold,
    SUM((item->>'qty')::INTEGER * (item->>'unitPrice')::DECIMAL) as revenue,
    SUM((item->>'qty')::INTEGER * (p.selling_price - p.buying_price)) as profit
  FROM pos_products p
  JOIN pos_sales s ON s.user_id = p.user_id
  CROSS JOIN jsonb_array_elements(s.items) as item
  WHERE (item->>'productId') = p.product_id
  AND s.status = 'completed'
  GROUP BY p.id, p.user_id
) sales_data ON sales_data.product_id = p.id;

-- Low stock alert view
CREATE OR REPLACE VIEW pos_low_stock_alerts AS
SELECT 
  user_id,
  product_id,
  name,
  stock,
  min_stock,
  (min_stock - stock) as units_needed
FROM pos_products 
WHERE stock <= min_stock 
AND status = 'active';

-- ================================================
-- GRANTS AND PERMISSIONS
-- ================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

-- Insert completion marker
INSERT INTO public.app_config (key, value) 
VALUES ('pos_schema_installed', 'true')
ON CONFLICT (key) DO UPDATE SET value = 'true';

-- Display completion message
SELECT 'POS Database Schema installed successfully! 🎉' as status;