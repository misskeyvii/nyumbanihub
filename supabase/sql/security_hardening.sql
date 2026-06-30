-- Security hardening for existing Nyumbani Hub databases.
-- Run this after the existing setup SQL files.

-- Normal users may edit profile fields, but must not be able to grant
-- themselves roles, activate accounts, or manipulate subscription state.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.prevent_user_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.jwt() ->> 'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
    OR NEW.account_type IS DISTINCT FROM OLD.account_type
    OR NEW.extra_account_types IS DISTINCT FROM OLD.extra_account_types
    OR NEW.is_active IS DISTINCT FROM OLD.is_active
    OR NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at
    OR NEW.subscription_details IS DISTINCT FROM OLD.subscription_details
    OR NEW.has_notification IS DISTINCT FROM OLD.has_notification
    OR NEW.notification_message IS DISTINCT FROM OLD.notification_message THEN
    RAISE EXCEPTION 'Protected account fields cannot be changed from the client';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_user_privilege_escalation ON public.users;
CREATE TRIGGER prevent_user_privilege_escalation
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_privilege_escalation();

-- Users can create their own pending requests, but must not approve/reject them.
DROP POLICY IF EXISTS "Users can manage own requests" ON public.pending_requests;
DROP POLICY IF EXISTS "requests_read_own" ON public.pending_requests;
DROP POLICY IF EXISTS "requests_insert_own" ON public.pending_requests;

CREATE POLICY "requests_read_own" ON public.pending_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "requests_insert_own" ON public.pending_requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND coalesce(status, 'pending') = 'pending'
    AND (SELECT count(*) FROM public.pending_requests WHERE user_id = auth.uid() AND status = 'pending') < 5
  );

-- Admins use the normal anon client plus their user JWT. These policies keep
-- the service role out of the browser while preserving admin workflows.
DROP POLICY IF EXISTS "users_admin_read" ON public.users;
DROP POLICY IF EXISTS "users_admin_insert" ON public.users;
DROP POLICY IF EXISTS "users_admin_update" ON public.users;
DROP POLICY IF EXISTS "users_admin_delete" ON public.users;

CREATE POLICY "users_admin_read" ON public.users
  FOR SELECT USING (public.is_admin());
CREATE POLICY "users_admin_insert" ON public.users
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "users_admin_update" ON public.users
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "users_admin_delete" ON public.users
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "requests_admin_read" ON public.pending_requests;
DROP POLICY IF EXISTS "requests_admin_update" ON public.pending_requests;
DROP POLICY IF EXISTS "requests_admin_delete" ON public.pending_requests;

CREATE POLICY "requests_admin_read" ON public.pending_requests
  FOR SELECT USING (public.is_admin());
CREATE POLICY "requests_admin_update" ON public.pending_requests
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "requests_admin_delete" ON public.pending_requests
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "listings_admin_read" ON public.listings;
DROP POLICY IF EXISTS "listings_admin_update" ON public.listings;
DROP POLICY IF EXISTS "listings_admin_delete" ON public.listings;

CREATE POLICY "listings_admin_read" ON public.listings
  FOR SELECT USING (public.is_admin());
CREATE POLICY "listings_admin_update" ON public.listings
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "listings_admin_delete" ON public.listings
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "app_config_admin_update" ON public.app_config;
CREATE POLICY "app_config_admin_update" ON public.app_config
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Payment completion is only for trusted Edge Functions using the service role.
REVOKE EXECUTE ON FUNCTION public.complete_renewal_payment(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_renewal_payment(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_renewal_payment(uuid, text) TO service_role;

-- Account deletion RPC may be called by the account owner; admins are allowed
-- by the function body. Keep the function executable only by signed-in users.
REVOKE EXECUTE ON FUNCTION public.delete_user_account_type(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account_type(uuid, text) TO authenticated;

-- This function approves requests. Do not expose it to ordinary clients.
REVOKE EXECUTE ON FUNCTION public.approve_request(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.approve_request(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.approve_request(uuid) TO service_role;
