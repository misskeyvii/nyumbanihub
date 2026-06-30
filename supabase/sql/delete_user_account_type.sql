-- RPC: Delete user account type and associated listings
-- Removes from active account types but keeps subscription_details for reactivation
CREATE OR REPLACE FUNCTION delete_user_account_type(
  p_user_id UUID,
  p_account_type TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  deleted_listing_count INTEGER,
  deleted_request_count INTEGER
) AS $$
DECLARE
  v_primary_account TEXT;
  v_extra_accounts TEXT[];
  v_listing_count INTEGER := 0;
  v_request_count INTEGER := 0;
  v_new_primary TEXT;
  v_new_extras TEXT[];
  v_listing_types TEXT[];
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role = 'admin'
    ) THEN
    RETURN QUERY SELECT false, 'Not authorized', 0, 0;
    RETURN;
  END IF;

  SELECT account_type, extra_account_types
  INTO v_primary_account, v_extra_accounts
  FROM users WHERE id = p_user_id;

  IF v_primary_account IS NULL THEN
    RETURN QUERY SELECT false, 'User not found', 0, 0;
    RETURN;
  END IF;

  IF p_account_type != v_primary_account AND NOT (coalesce(v_extra_accounts, '{}') @> ARRAY[p_account_type]) THEN
    RETURN QUERY SELECT false, 'Account type not found', 0, 0;
    RETURN;
  END IF;

  v_listing_types := CASE p_account_type
    WHEN 'landlord' THEN ARRAY['home', 'apartment']
    WHEN 'airbnb' THEN ARRAY['airbnb']
    WHEN 'hotel' THEN ARRAY['hotel']
    WHEN 'shop' THEN ARRAY['shop']
    WHEN 'service' THEN ARRAY['service']
    WHEN 'marketplace' THEN ARRAY['marketplace']
    ELSE ARRAY[p_account_type]
  END;

  DELETE FROM listings
  WHERE user_id = p_user_id AND listing_type = ANY(v_listing_types);
  GET DIAGNOSTICS v_listing_count = ROW_COUNT;

  -- Remove only open/pending requests — keep approved history for reactivation
  DELETE FROM pending_requests
  WHERE user_id = p_user_id AND account_type = p_account_type AND status = 'pending';
  GET DIAGNOSTICS v_request_count = ROW_COUNT;

  IF p_account_type = v_primary_account THEN
    v_new_extras := array_remove(coalesce(v_extra_accounts, '{}'), p_account_type);
    IF array_length(v_new_extras, 1) > 0 THEN
      v_new_primary := v_new_extras[1];
      v_new_extras := v_new_extras[2:];
    ELSE
      v_new_primary := NULL;
      v_new_extras := ARRAY[]::TEXT[];
    END IF;

    UPDATE users
    SET account_type = v_new_primary,
        extra_account_types = v_new_extras
    WHERE id = p_user_id;
  ELSE
    UPDATE users
    SET extra_account_types = array_remove(coalesce(v_extra_accounts, '{}'), p_account_type)
    WHERE id = p_user_id;
  END IF;

  RETURN QUERY SELECT true, 'Account type deleted successfully', v_listing_count, v_request_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION delete_user_account_type(UUID, TEXT) TO authenticated;
