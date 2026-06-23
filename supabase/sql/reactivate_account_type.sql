-- Reactivate a previously approved account type without a new admin request
CREATE OR REPLACE FUNCTION public.reactivate_account_type(
  p_user_id UUID,
  p_account_type TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_has_history BOOLEAN;
  v_expiry timestamptz;
  v_details jsonb;
  v_entry jsonb;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN QUERY SELECT false, 'Not authorized'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'User not found'::TEXT;
    RETURN;
  END IF;

  IF p_account_type = v_user.account_type
    OR coalesce(v_user.extra_account_types, '{}') @> ARRAY[p_account_type] THEN
    RETURN QUERY SELECT false, 'This account type is already active'::TEXT;
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.pending_requests
    WHERE user_id = p_user_id
      AND account_type = p_account_type
      AND status = 'approved'
  ) OR (coalesce(v_user.subscription_details, '{}'::jsonb) ? p_account_type)
  INTO v_has_history;

  IF NOT v_has_history THEN
    RETURN QUERY SELECT false, 'No previous approval found. Submit a new request.'::TEXT;
    RETURN;
  END IF;

  v_details := coalesce(v_user.subscription_details, '{}'::jsonb);
  IF v_details ? p_account_type THEN
    v_entry := v_details -> p_account_type;
    IF jsonb_typeof(v_entry) = 'string' THEN
      v_expiry := (v_entry #>> '{}')::timestamptz;
    ELSIF jsonb_typeof(v_entry) = 'object' THEN
      v_expiry := nullif(v_entry ->> 'expires_at', '')::timestamptz;
    END IF;

    IF v_expiry IS NOT NULL AND v_expiry < NOW() THEN
      RETURN QUERY SELECT false, 'Subscription expired. Please renew first.'::TEXT;
      RETURN;
    END IF;
  END IF;

  IF v_user.account_type IS NULL OR v_user.account_type = '' THEN
    UPDATE public.users
    SET account_type = p_account_type
    WHERE id = p_user_id;
  ELSE
    UPDATE public.users
    SET extra_account_types = (
      SELECT CASE
        WHEN array_position(coalesce(v_user.extra_account_types, '{}'), p_account_type) IS NULL
        THEN array_append(coalesce(v_user.extra_account_types, '{}'), p_account_type)
        ELSE coalesce(v_user.extra_account_types, '{}')
      END
    )
    WHERE id = p_user_id;
  END IF;

  RETURN QUERY SELECT true, 'Account reactivated successfully'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reactivate_account_type(UUID, TEXT) TO authenticated;
