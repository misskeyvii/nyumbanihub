-- approve_request.sql
-- Run this in Supabase SQL editor to create an atomic RPC that approves a pending request
-- and updates the user's account_type / extra_account_types and subscription_details.

CREATE OR REPLACE FUNCTION public.approve_request(pr_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  pr RECORD;
  u RECORD;
  expires_at timestamptz;
BEGIN
  -- Lock the pending request row
  SELECT * INTO pr
  FROM public.pending_requests
  WHERE id = pr_uuid AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE NOTICE 'approve_request: request not found or not pending: %', pr_uuid;
    RETURN;
  END IF;

  -- Lock the user row
  SELECT * INTO u
  FROM public.users
  WHERE id = pr.user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'approve_request: user not found for request %', pr_uuid;
  END IF;

  -- optional expires_at column on pending_requests (nullable)
  expires_at := pr.expires_at;

  -- If user has no primary account_type, set it. Otherwise add to extra_account_types
  IF u.account_type IS NULL OR u.account_type = '' THEN
    UPDATE public.users
    SET account_type = pr.account_type,
        subscription_details = COALESCE(u.subscription_details, '{}'::jsonb) || jsonb_build_object(pr.account_type, jsonb_build_object('expires_at', expires_at))
    WHERE id = u.id;
  ELSE
    -- ensure extra_account_types is an array and does not already contain the type
    UPDATE public.users
    SET extra_account_types = (
        SELECT CASE WHEN array_position(coalesce(u.extra_account_types, '{}'), pr.account_type) IS NULL
          THEN array_append(coalesce(u.extra_account_types, '{}'), pr.account_type)
          ELSE coalesce(u.extra_account_types, '{}') END
      ),
      subscription_details = COALESCE(u.subscription_details, '{}'::jsonb) || jsonb_build_object(pr.account_type, jsonb_build_object('expires_at', expires_at))
    WHERE id = u.id;
  END IF;

  -- Mark the pending request approved
  UPDATE public.pending_requests
  SET status = 'approved'
  WHERE id = pr.id;

  -- Optionally: If you track promo_slots in app_config, increment here (uncomment and adjust)
  -- UPDATE public.app_config SET promo_slots_used = promo_slots_used + 1 WHERE id = 1;

  RETURN;
END;
$$;

-- Grant execute to anon/role used by your admin function if needed, e.g.: 
-- GRANT EXECUTE ON FUNCTION public.approve_request(uuid) TO authenticated;
