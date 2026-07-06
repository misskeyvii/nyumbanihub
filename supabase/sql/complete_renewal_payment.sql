-- Apply a successful renewal payment to the user's subscription
CREATE OR REPLACE FUNCTION public.complete_renewal_payment(
  p_renewal_id uuid,
  p_receipt text DEFAULT NULL
)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.renewal_requests%ROWTYPE;
  u public.users%ROWTYPE;
  details jsonb;
  entry jsonb;
  current_expiry timestamptz;
  new_expiry timestamptz;
  expiry_text text;
  notify_msg text;
BEGIN
  SELECT * INTO r
  FROM public.renewal_requests
  WHERE id = p_renewal_id AND status IN ('pending', 'failed')
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Renewal not found or already processed'::text;
    RETURN;
  END IF;

  SELECT * INTO u FROM public.users WHERE id = r.user_id FOR UPDATE;
  IF NOT FOUND THEN
    UPDATE public.renewal_requests
    SET status = 'failed', failure_reason = 'User not found'
    WHERE id = p_renewal_id;
    RETURN QUERY SELECT false, 'User not found'::text;
    RETURN;
  END IF;

  details := coalesce(u.subscription_details, '{}'::jsonb);

  IF details ? r.account_type THEN
    entry := details -> r.account_type;
    IF jsonb_typeof(entry) = 'string' THEN
      current_expiry := nullif(entry #>> '{}', '')::timestamptz;
    ELSIF jsonb_typeof(entry) = 'object' THEN
      current_expiry := nullif(entry ->> 'expires_at', '')::timestamptz;
    END IF;
  END IF;

  IF r.account_type = u.account_type AND current_expiry IS NULL THEN
    current_expiry := u.subscription_expires_at;
  END IF;

  IF current_expiry IS NULL OR current_expiry < NOW() THEN
    new_expiry := NOW() + make_interval(months => r.months);
  ELSE
    new_expiry := current_expiry + make_interval(months => r.months);
  END IF;

  expiry_text := new_expiry::text;
  details := details || jsonb_build_object(r.account_type, expiry_text);

  notify_msg := format(
    'Your %s account has been renewed until %s.',
    r.account_type,
    to_char(new_expiry AT TIME ZONE 'Africa/Nairobi', 'DD Mon YYYY')
  );

  UPDATE public.users
  SET subscription_details = details,
      subscription_expires_at = CASE
        WHEN account_type = r.account_type THEN new_expiry
        ELSE subscription_expires_at
      END,
      has_notification = true,
      notification_message = notify_msg
  WHERE id = r.user_id;

  UPDATE public.renewal_requests
  SET status = 'paid',
      paid_at = NOW(),
      mpesa_receipt = coalesce(p_receipt, mpesa_receipt)
  WHERE id = p_renewal_id;

  RETURN QUERY SELECT true, notify_msg;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_renewal_payment(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_renewal_payment(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_renewal_payment(uuid, text) TO service_role;
