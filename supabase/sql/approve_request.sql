-- approve_request.sql
-- Atomic RPC that approves a pending request and updates the user's account types.

CREATE OR REPLACE FUNCTION public.approve_request(pr_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  pr RECORD;
  u RECORD;
  expires_at timestamptz;
BEGIN
  SELECT * INTO pr
  FROM public.pending_requests
  WHERE id = pr_uuid AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  SELECT * INTO u
  FROM public.users
  WHERE id = pr.user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found for request %', pr_uuid;
  END IF;

  expires_at := COALESCE(pr.expires_at, NOW() + INTERVAL '1 month');

  IF u.account_type IS NULL OR u.account_type = '' THEN
    UPDATE public.users
    SET account_type = pr.account_type,
        subscription_details = COALESCE(u.subscription_details, '{}'::jsonb)
          || jsonb_build_object(pr.account_type, expires_at::text)
    WHERE id = u.id;
  ELSE
    UPDATE public.users
    SET extra_account_types = (
        SELECT CASE WHEN array_position(coalesce(u.extra_account_types, '{}'), pr.account_type) IS NULL
          THEN array_append(coalesce(u.extra_account_types, '{}'), pr.account_type)
          ELSE coalesce(u.extra_account_types, '{}') END
      ),
      subscription_details = COALESCE(u.subscription_details, '{}'::jsonb)
        || jsonb_build_object(pr.account_type, expires_at::text)
    WHERE id = u.id;
  END IF;

  UPDATE public.pending_requests
  SET status = 'approved'
  WHERE id = pr.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_request(uuid) TO authenticated;
