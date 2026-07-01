-- Read-only preview of approved pending_requests that are not reflected correctly in users.
-- Run this first to inspect whether any approved requests are out of sync.

SELECT
  pr.id AS pending_request_id,
  pr.user_id,
  pr.account_type,
  pr.subcategory,
  pr.status AS pending_status,
  pr.created_at AS request_created_at,
  u.account_type AS user_account_type,
  u.extra_account_types AS user_extra_account_types,
  u.subscription_details AS user_subscription_details,
  u.subscription_expires_at AS user_subscription_expires_at
FROM public.pending_requests pr
LEFT JOIN public.users u ON u.id = pr.user_id
WHERE pr.status = 'approved'
  AND (
    u.id IS NULL
    OR (
      COALESCE(u.account_type, '') <> pr.account_type
      AND NOT (pr.account_type = ANY (COALESCE(u.extra_account_types, '{}')))
    )
  )
ORDER BY pr.created_at DESC
LIMIT 500;

-- ============================================================================
-- Idempotent apply block
-- Run this only after verifying the preview above.
-- It updates existing users whose approved category was never applied.
-- ============================================================================

DO $$
DECLARE
  rec RECORD;
  expires_at timestamptz;
  curr_details jsonb;
  new_details jsonb;
  curr_account text;
  curr_extras text[];
  next_account text;
  next_extras text[];
  notification text;
  svc_listing_exists int;
BEGIN
  FOR rec IN
    SELECT pr.* FROM public.pending_requests pr
    LEFT JOIN public.users u ON u.id = pr.user_id
    WHERE pr.status = 'approved'
      AND u.id IS NOT NULL
      AND (
        COALESCE(u.account_type, '') <> pr.account_type
        AND NOT (pr.account_type = ANY (COALESCE(u.extra_account_types, '{}')))
      )
    ORDER BY pr.created_at
  LOOP
    expires_at := now() + interval '1 month';
    notification := format(
      'Your "%s" listing account for "%s" has been approved! Your %s subscription is active until %s.',
      rec.account_type,
      coalesce(rec.business_name, ''),
      rec.account_type,
      to_char(expires_at, 'DD Mon YYYY')
    );

    SELECT subscription_details::jsonb, account_type, COALESCE(extra_account_types, ARRAY[]::text[])
      INTO curr_details, curr_account, curr_extras
    FROM public.users
    WHERE id = rec.user_id
    FOR UPDATE;

    IF curr_account IS NULL OR curr_account = '' THEN
      next_account := rec.account_type;
      next_extras := curr_extras;
    ELSE
      next_account := curr_account;
      IF curr_account <> rec.account_type AND NOT (rec.account_type = ANY (curr_extras)) THEN
        next_extras := array_append(curr_extras, rec.account_type);
      ELSE
        next_extras := curr_extras;
      END IF;
    END IF;

    IF curr_details IS NULL THEN
      curr_details := '{}'::jsonb;
    END IF;
    new_details := curr_details || jsonb_build_object(rec.account_type, to_char(expires_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));

    UPDATE public.users
    SET
      account_type = CASE WHEN COALESCE(account_type, '') <> COALESCE(next_account, '') THEN next_account ELSE account_type END,
      extra_account_types = CASE WHEN extra_account_types IS DISTINCT FROM next_extras THEN next_extras ELSE extra_account_types END,
      subscription_expires_at = CASE WHEN subscription_expires_at IS DISTINCT FROM expires_at THEN expires_at ELSE subscription_expires_at END,
      subscription_details = CASE WHEN subscription_details::jsonb IS DISTINCT FROM new_details THEN new_details ELSE subscription_details::jsonb END,
      has_notification = true,
      notification_message = notification
    WHERE id = rec.user_id;

    UPDATE public.pending_requests
    SET status = 'approved'
    WHERE id = rec.id AND status = 'approved';

    IF rec.account_type IN ('service','entertainment') THEN
      SELECT COUNT(1) INTO svc_listing_exists FROM public.listings
      WHERE user_id = rec.user_id AND listing_type = 'service' LIMIT 1;

      IF svc_listing_exists = 0 THEN
        INSERT INTO public.listings (
          user_id, title, listing_type, county, phone, whatsapp, description, status, created_at
        ) VALUES (
          rec.user_id,
          COALESCE(rec.business_name, (rec.account_type || ' Services')),
          'service',
          rec.county,
          rec.phone,
          rec.phone,
          rec.message,
          'live',
          now()
        );
      END IF;
    END IF;

    RAISE NOTICE 'Applied pending_request % for user % (account_type=%)', rec.id, rec.user_id, rec.account_type;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
