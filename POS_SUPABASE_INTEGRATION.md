# POS Supabase Integration Guide

## 🎯 **Goal**: Connect POS system to existing nyumbanilink.com Supabase database

---

## 📋 **Step 1: Execute Database Schema**

### **In Supabase Dashboard:**

1. **Go to**: https://supabase.com/dashboard/projects
2. **Select your project**: nyumbanilink.com project 
3. **Navigate to**: SQL Editor (left sidebar)
4. **Open**: `POS_DATABASE_SCHEMA.sql` file
5. **Copy all content** and paste into SQL Editor
6. **Execute** the schema (Click "Run")

**Result**: ✅ Creates 9 POS tables with proper security and indexes

---

## 📊 **Step 2: Verify Database Setup**

### **Check Tables Created:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'pos_%';
```

**Should return**:
- `pos_branches`
- `pos_employees` 
- `pos_suppliers`
- `pos_categories`
- `pos_products`
- `pos_stock_movements`
- `pos_customers`
- `pos_sales`
- `pos_expenses`

---

## 🔧 **Step 3: Update POS Environment Variables**

### **Add to Vercel (POS Project)**

1. **Go to**: https://vercel.com/misskeyviis-projects/srcpos/settings/environment-variables
2. **Add variables**:

```bash
VITE_PUBLIC_SUPABASE_URL=your_nyumbanilink_supabase_url
VITE_PUBLIC_SUPABASE_ANON_KEY=your_nyumbanilink_supabase_anon_key
```

**⚠️ Important**: Use the **same** Supabase credentials as your main nyumbanilink.com app

---

## 🔑 **Step 4: Configure Authentication**

### **User Access Control**

The POS system uses your existing `users` table from nyumbanilink.com with these account types getting POS access:

✅ **Free POS Access**:
- `marketplace` users
- `airbnb` users  
- `hotel` users

💰 **Paid POS Access**:
- `shop` users (with subscription)
- `landlord` users (with subscription)

❌ **No POS Access**:
- `service` users
- `entertainment` users

### **Current Test Users**:
```sql
-- These users should already exist in your users table
SELECT email, account_type FROM users WHERE email IN (
  'grace@abcminimart.co.ke',    -- shop (demo)
  'hotel@nyumbanilink.com',     -- hotel (free)
  'airbnb@nyumbanilink.com',    -- airbnb (free)
  'marketplace@nyumbanilink.com' -- marketplace (free)
);
```

---

## 🚀 **Step 5: Test POS Connection**

### **Test Authentication**:
1. **Visit**: https://pos.nyumbanilink.com
2. **Login with**: `grace@abcminimart.co.ke / demo1234`
3. **Should**: Load POS dashboard successfully

### **Test Database Connection**:
The POS will automatically:
- ✅ Connect to your Supabase database
- ✅ Create default categories for new users
- ✅ Use Row Level Security (only user's own data)
- ✅ Track all POS activities

---

## 📁 **Step 6: Initialize Sample Data (Optional)**

### **For Demo/Testing Purposes**:

Run this SQL to add sample data for the logged-in user:

```sql
-- Login as grace@abcminimart.co.ke first, then run:

-- Initialize default categories
SELECT init_default_pos_categories(auth.uid());

-- Add sample branch
INSERT INTO pos_branches (user_id, name, address, phone, is_main_branch) 
VALUES (auth.uid(), 'Main Branch', 'Nairobi, Kenya', '+254 700 123 456', true);

-- Add sample employees
INSERT INTO pos_employees (user_id, branch_id, employee_id, name, role, phone, email, status) VALUES
  (auth.uid(), (SELECT id FROM pos_branches WHERE user_id = auth.uid() LIMIT 1), 'emp-001', 'Grace Wanjiru', 'Owner', '+254 700 123 456', 'grace@abcminimart.co.ke', 'active'),
  (auth.uid(), (SELECT id FROM pos_branches WHERE user_id = auth.uid() LIMIT 1), 'emp-002', 'Brian Otieno', 'Cashier', '+254 712 234 567', 'brian@abcminimart.co.ke', 'active');
```

---

## 🔒 **Security Features**

### **Row Level Security (RLS)**:
- ✅ Users only see their own POS data
- ✅ Complete data isolation between businesses
- ✅ Secure by default

### **Authentication Integration**:
- ✅ Uses existing nyumbanilink.com user accounts
- ✅ Respects subscription status
- ✅ Account-type based access control

---

## 📊 **Database Structure**

### **Core Tables**:

| Table | Purpose | Key Features |
|-------|---------|-------------|
| `pos_branches` | Multi-location support | Links to user account |
| `pos_employees` | Staff management | Roles, permissions, sales tracking |
| `pos_products` | Inventory management | Stock levels, pricing, categories |
| `pos_sales` | Transaction records | Complete sales history with items |
| `pos_customers` | Customer database | Spending history, visit tracking |
| `pos_suppliers` | Vendor management | Purchase tracking, payment status |
| `pos_expenses` | Expense tracking | Categorized business expenses |
| `pos_stock_movements` | Inventory audit trail | All stock changes with reasons |
| `pos_categories` | Product organization | Customizable categories with icons |

### **Relationships**:
```
users (existing)
 └── pos_branches
     ├── pos_employees
     ├── pos_products
     │   ├── pos_stock_movements  
     │   └── pos_sales (via items JSONB)
     ├── pos_customers
     ├── pos_suppliers
     └── pos_expenses
```

---

## 🎯 **Expected Behavior After Setup**

### **When users login to POS**:

1. **Authentication**: Uses nyumbanilink.com credentials
2. **Access Check**: Validates account type for POS eligibility  
3. **Data Isolation**: Only sees their own business data
4. **Auto-setup**: Creates default categories on first login
5. **Full Features**: Complete POS functionality available

### **Data Flow**:
```
nyumbanilink.com ←→ Shared Supabase DB ←→ pos.nyumbanilink.com
     │                      │                        │
   users table         POS tables               POS interface
```

---

## 🔧 **Troubleshooting**

### **Issue: POS doesn't load after login**
- **Check**: Environment variables are set correctly
- **Verify**: User exists in `users` table with correct `account_type`
- **Test**: SQL connection works in Supabase dashboard

### **Issue: "No access" message**
- **Check**: User's `account_type` is eligible for POS
- **Verify**: Account type mapping in `srcpos/utils/posAccess.ts`

### **Issue: Database errors**
- **Check**: All POS tables were created successfully
- **Verify**: RLS policies are enabled
- **Test**: User can query POS tables in SQL editor

---

## ✅ **Verification Checklist**

- [ ] Database schema executed successfully
- [ ] All 9 POS tables created
- [ ] Environment variables updated
- [ ] POS loads at pos.nyumbanilink.com
- [ ] Authentication works with test accounts
- [ ] Database queries work from POS interface
- [ ] Sample data appears correctly
- [ ] Stock movements track properly
- [ ] Sales transactions save to database

---

## 🎉 **Success Indicators**

**When everything is working**:
- ✅ **pos.nyumbanilink.com** loads POS dashboard
- ✅ **Login** works with nyumbanilink.com accounts
- ✅ **Data persists** between sessions
- ✅ **Multiple users** have isolated data
- ✅ **Sales tracking** updates inventory automatically
- ✅ **Reports show** real data from database

**The POS system is now fully connected to your Nyumbani Link Supabase database!** 🚀