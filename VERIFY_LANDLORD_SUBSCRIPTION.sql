-- ============================================================
-- VERIFY LANDLORD POS SUBSCRIPTION FOR USER
-- ============================================================
-- Run this in Supabase SQL Editor to check if your landlord
-- account has the correct POS subscription set up

-- Check the user account setup
SELECT 
  id,
  email,
  name,
  account_type,
  extra_account_types,
  subscription_details,
  subscription_expires_at,
  created_at
FROM users
WHERE email = 'kisumuvaccant@nyumbanilink.com';

-- If the result shows:
-- - account_type: 'landlord'
-- - extra_account_types: ARRAY containing 'landlord-pos' (or could be NULL)
-- - subscription_details: JSON with 'landlord-pos' key and 'landlord_pos_expires_at' date set in future
-- Then the account is correctly configured!

-- If NOT, run this to fix it:
-- ============================================================
/*
UPDATE users 
SET 
  account_type = 'landlord',
  extra_account_types = ARRAY['landlord-pos']::text[],
  subscription_details = jsonb_build_object(
    'landlord-pos', true,
    'landlord_pos_expires_at', (NOW() + INTERVAL '1 year')::text
  )
WHERE email = 'kisumuvaccant@nyumbanilink.com';
*/

-- ============================================================
-- Alternative: If subscription_details already has data, 
-- merge the landlord-pos into it:
-- ============================================================
/*
UPDATE users 
SET 
  subscription_details = COALESCE(subscription_details, '{}'::jsonb) || 
    jsonb_build_object(
      'landlord-pos', true,
      'landlord_pos_expires_at', (NOW() + INTERVAL '1 year')::text
    )
WHERE email = 'kisumuvaccant@nyumbanilink.com';
*/
