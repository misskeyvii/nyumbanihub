-- sync_approved_requests.sql
-- One-time script to find approved pending_requests that were not applied to users
-- and apply them. Run inside a transaction in Supabase SQL editor after reviewing the SELECT.

-- 1) Diagnostic: list approved requests where the user's account types don't include the requested type
-- Adjust column names if your schema differs.

SELECT pr.id AS pending_request_id, pr.user_id, pr.account_type, pr.subcategory, pr.created_at,
  u.account_type AS users_account_type, u.extra_account_types, u.subscription_details
FROM public.pending_requests pr
LEFT JOIN public.users u ON u.id = pr.user_id
WHERE pr.status = 'approved'
  AND (
    u.id IS NULL
    OR (
      (u.account_type IS DISTINCT FROM pr.account_type)
      AND (array_position(coalesce(u.extra_account_types, '{}'), pr.account_type) IS NULL)
    )
  )
LIMIT 200;

-- 2) If the SELECT above returns rows you want to sync, run the following block (uncomment and run):

-- BEGIN;
-- DO $$
-- DECLARE
--   r RECORD;
-- BEGIN
--   FOR r IN (
--     SELECT pr.* FROM public.pending_requests pr
--     LEFT JOIN public.users u ON u.id = pr.user_id
--     WHERE pr.status = 'approved'
--       AND (
--         u.id IS NULL
--         OR (
--           (u.account_type IS DISTINCT FROM pr.account_type)
--           AND (array_position(coalesce(u.extra_account_types, '{}'), pr.account_type) IS NULL)
--         )
--       )
--   ) LOOP
--     IF r.user_id IS NULL THEN
--       RAISE NOTICE 'Skipping request % - user not found', r.id;
--       CONTINUE;
--     END IF;

--     -- If user has no primary account, set it; otherwise append to extra_account_types
--     PERFORM
--       CASE WHEN (SELECT account_type FROM public.users WHERE id = r.user_id) IS NULL
--         THEN UPDATE public.users SET account_type = r.account_type, subscription_details = COALESCE(subscription_details, '{}'::jsonb) || jsonb_build_object(r.account_type, jsonb_build_object('expires_at', r.expires_at)) WHERE id = r.user_id
--         ELSE UPDATE public.users SET extra_account_types = (
--           SELECT CASE WHEN array_position(coalesce(extra_account_types, '{}'), r.account_type) IS NULL
--             THEN array_append(coalesce(extra_account_types, '{}'), r.account_type)
--             ELSE coalesce(extra_account_types, '{}') END
--         ), subscription_details = COALESCE(subscription_details, '{}'::jsonb) || jsonb_build_object(r.account_type, jsonb_build_object('expires_at', r.expires_at)) WHERE id = r.user_id
--       END CASE;
--   END LOOP;
-- END;
-- $$;
-- COMMIT;

-- NOTE: Review results of the SELECT before running the DO block. Backup your DB or run in a read-replica.
