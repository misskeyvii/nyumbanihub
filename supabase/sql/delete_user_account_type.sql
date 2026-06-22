-- RPC: Delete user account type and associated listings
-- Safely removes an account type from a user and deletes all listings of that type
-- Only admins/superadmins can call this (verification happens in app)
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
BEGIN
  -- Get current account types
  SELECT account_type, extra_account_types
  INTO v_primary_account, v_extra_accounts
  FROM users WHERE id = p_user_id;

  IF v_primary_account IS NULL THEN
    RETURN QUERY SELECT false, 'User not found', 0, 0;
    RETURN;
  END IF;

  -- Check if account type exists
  IF p_account_type != v_primary_account AND NOT (v_extra_accounts @> ARRAY[p_account_type]) THEN
    RETURN QUERY SELECT false, 'Account type not found', 0, 0;
    RETURN;
  END IF;

  -- Delete listings for this account type
  DELETE FROM listings 
  WHERE user_id = p_user_id AND listing_type = p_account_type;
  GET DIAGNOSTICS v_listing_count = ROW_COUNT;

  -- Delete pending requests for this account type (cleanup)
  DELETE FROM pending_requests
  WHERE user_id = p_user_id AND account_type = p_account_type AND status = 'pending';
  GET DIAGNOSTICS v_request_count = ROW_COUNT;

  -- Remove account type from user
  IF p_account_type = v_primary_account THEN
    -- Remove primary account — promote first extra or set null
    v_new_extras := array_remove(v_extra_accounts, p_account_type);
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
    -- Remove from extras
    UPDATE users 
    SET extra_account_types = array_remove(v_extra_accounts, p_account_type)
    WHERE id = p_user_id;
  END IF;

  RETURN QUERY SELECT true, 'Account type deleted successfully', v_listing_count, v_request_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to authenticated users (they verify admin role in app)
GRANT EXECUTE ON FUNCTION delete_user_account_type(UUID, TEXT) TO authenticated;
