-- POS Subscription Migration
-- This migration adds support for POS subscriptions in the Nyumbani Link system

-- ============================================================
-- 1. Update users table to support POS account types
-- ============================================================
-- The extra_account_types column already exists and can store POS types
-- No schema changes needed - POS types work with existing structure

-- ============================================================
-- 2. Example POS account types that can be assigned:
-- ============================================================
-- landlord-pos       - POS add-on for landlord accounts (KSh 1,500/month)
-- airbnb-pos         - POS add-on for Airbnb accounts (KSh 1,500/month)
-- hotel-pos          - POS add-on for hotel accounts (KSh 1,500/month)
-- shop-pos           - POS add-on for shop accounts (KSh 1,500/month)
-- marketplace-pos    - POS add-on for marketplace accounts (KSh 1,500/month)
-- service-pos        - POS add-on for service accounts (KSh 1,500/month)
-- entertainment-pos  - POS add-on for entertainment accounts (KSh 1,500/month)
-- pos-only           - Standalone POS without other account (KSh 2,100/month)

-- ============================================================
-- 3. Admin Access Instructions
-- ============================================================
-- To grant POS access to a user:
-- 1. Go to Admin Panel → Users tab
-- 2. Find and expand the user
-- 3. Use "+ Add account type" dropdown
-- 4. Select the appropriate POS type
-- 5. Set expiry date if needed
-- 6. Click "Save Changes" button

-- ============================================================
-- 4. Manual SQL to grant POS access (if needed)
-- ============================================================

-- Example: Grant standalone POS access to a user
-- UPDATE users 
-- SET 
--   account_type = 'pos-only',
--   subscription_expires_at = NOW() + INTERVAL '1 month',
--   subscription_details = jsonb_build_object('pos-only', NOW() + INTERVAL '1 month'),
--   is_active = true
-- WHERE email = 'user@example.com';

-- Example: Add POS as add-on to existing landlord account
-- UPDATE users 
-- SET 
--   extra_account_types = COALESCE(extra_account_types, ARRAY[]::text[]) || ARRAY['landlord-pos'],
--   subscription_details = COALESCE(subscription_details, '{}'::jsonb) || 
--     jsonb_build_object('landlord-pos', NOW() + INTERVAL '1 month')
-- WHERE email = 'user@example.com';

-- ============================================================
-- 5. Check user's POS access
-- ============================================================
-- SELECT 
--   id,
--   name,
--   email,
--   account_type,
--   extra_account_types,
--   subscription_expires_at,
--   subscription_details,
--   is_active
-- FROM users
-- WHERE 
--   account_type LIKE '%-pos' OR 
--   account_type = 'pos-only' OR
--   'landlord-pos' = ANY(extra_account_types) OR
--   'airbnb-pos' = ANY(extra_account_types) OR
--   'hotel-pos' = ANY(extra_account_types) OR
--   'shop-pos' = ANY(extra_account_types) OR
--   'marketplace-pos' = ANY(extra_account_types) OR
--   'service-pos' = ANY(extra_account_types) OR
--   'entertainment-pos' = ANY(extra_account_types);

-- ============================================================
-- 6. Verify POS integration with renewals table
-- ============================================================
-- Check if renewals table supports POS transactions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'renewals' 
ORDER BY ordinal_position;

-- The renewals table should have:
-- - account_type column (supports 'landlord-pos', 'pos-only', etc.)
-- - amount column (1500 for add-ons, 2100 for standalone)
-- - months column (subscription duration)

-- ============================================================
-- 7. POS Pricing Constants (for reference)
-- ============================================================
-- BASIC_ACCOUNT_PRICE = 1000    (Landlord, Airbnb, Hotel, Shop, Marketplace)
-- POS_ADDON_PRICE = 1500        (POS add-on for existing users)
-- POS_STANDALONE_PRICE = 2100   (POS-only users)

-- Combined pricing examples:
-- - New landlord + POS: 1000 + 1500 = KSh 2,500/month
-- - POS only: KSh 2,100/month
-- - Existing landlord adding POS: KSh 1,500/month

-- ============================================================
-- 8. Notes
-- ============================================================
-- - POS access is checked via checkPosEligibility() in src/lib/posAccess.ts
-- - All verified businesses can request POS regardless of subscription status
-- - Unverified users can also request POS as standalone option
-- - IntaSend handles all payment processing
-- - POS system URL: https://pos.nyumbanilink.com
