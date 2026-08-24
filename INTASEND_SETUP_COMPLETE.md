# IntaSend Payment Integration - Setup Complete ✅

## Summary
Successfully replaced Pesapal with IntaSend for subscription renewals on Nyumbani Link.

## What Was Done

### 1. **Edge Functions Created & Deployed**
- ✅ `intasend-initiate` - Creates checkout sessions
- ✅ `intasend-status` - Checks payment status  
- ✅ `intasend-webhook` - Receives payment notifications

### 2. **API Keys Configured**
- ✅ Publishable Key: `ISPubKey_live_624fa2ca-e63f-403c-b7f0-b80fa47ef7dc`
- ✅ Secret Key: `ISSecretKey_live_657b93e2-ffd1-44f8-a060-be324fb4eca9`
- ✅ Environment: `live`

### 3. **Frontend Updated**
- ✅ Removed Pesapal references
- ✅ Updated renewal modal to IntaSend-only
- ✅ Fixed pricing structure (1000 basic, 1500 POS add-on, 2100 POS standalone)
- ✅ Simplified UI - removed M-Pesa/Airtel options (coming soon)

### 4. **Bug Fixes**
- ✅ Fixed IntaSend API endpoint (https://api.intasend.com)
- ✅ Fixed redirect_url validation error (removed `&payment_method` parameter)
- ✅ Fixed authentication (using publishable key with Bearer token)

## Current Status

### ✅ Working
- Payment initiation redirects to IntaSend checkout page
- Users can select M-Pesa, card, or other payment methods on IntaSend's page
- Callback URL returns users to profile page with renewal_id

### ⚠️ Pending Setup

#### 1. **Configure IntaSend Webhook** (CRITICAL)
Go to https://dashboard.intasend.com/ → Settings → Webhooks

Add webhook URL:
```
https://fohpbqxpjrknaiqfvlgv.supabase.co/functions/v1/intasend-webhook
```

This webhook receives notifications when payments complete and automatically activates subscriptions.

#### 2. **Create RLS Policies for Renewals Table**
The `renewals` table needs Row-Level Security policies so the Edge Functions can insert records.

Run this SQL in Supabase SQL Editor:

```sql
-- Allow service role to insert renewals
CREATE POLICY "Service role can insert renewals"
ON public.renewals
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow users to read their own renewals
CREATE POLICY "Users can read own renewals"
ON public.renewals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow service role to update renewals
CREATE POLICY "Service role can update renewals"
ON public.renewals
FOR UPDATE
TO service_role
USING (true);
```

#### 3. **Test Complete Payment Flow**
1. Initiate a renewal
2. Complete payment on IntaSend (use test amount if possible)
3. Verify webhook receives notification
4. Check that subscription is activated
5. Verify expiry date is updated

## Pricing Structure

| Account Type | Price (KES) | Description |
|---|---|---|
| Basic Accounts | 1,000/month | Homes, Apartments, Airbnb, Hotels, Shops, Marketplace |
| POS Add-on | 1,500/month | For existing basic account holders |
| POS Standalone | 2,100/month | POS-only users |

## API Endpoints

| Function | URL | Purpose |
|---|---|---|
| intasend-initiate | `/functions/v1/intasend-initiate` | Create checkout session |
| intasend-status | `/functions/v1/intasend-status` | Check payment status |
| intasend-webhook | `/functions/v1/intasend-webhook` | Receive payment notifications |

## Environment Variables

### Supabase Secrets (already set)
```bash
INTASEND_PUBLISHABLE_KEY=ISPubKey_live_624fa2ca-e63f-403c-b7f0-b80fa47ef7dc
INTASEND_SECRET_KEY=ISSecretKey_live_657b93e2-ffd1-44f8-a060-be324fb4eca9
INTASEND_ENV=live
SITE_URL=https://nyumbanilink.com
```

### Frontend .env (already set)
```bash
VITE_INTASEND_PUBLISHABLE_KEY=ISPubKey_live_624fa2ca-e63f-403c-b7f0-b80fa47ef7dc
VITE_INTASEND_ENV=live
```

## Files Modified

1. `src/pages/profile/page.tsx` - Renewal modal & payment initiation
2. `supabase/functions/intasend-initiate/index.ts` - Payment initiation
3. `supabase/functions/intasend-status/index.ts` - Payment verification
4. `supabase/functions/intasend-webhook/index.ts` - Webhook handler
5. `supabase/sql/renewals.sql` - Database schema

## Next Steps

1. **Configure webhook in IntaSend dashboard** (see above)
2. **Add RLS policies** for renewals table (see SQL above)
3. **Test payment flow** end-to-end
4. **Monitor webhook logs** to ensure notifications are received
5. **Add M-Pesa & Airtel Money** direct integration later (optional)

## Support

If payments aren't activating:
1. Check Supabase Edge Function logs for errors
2. Verify webhook is configured correctly in IntaSend
3. Check `renewals` table for payment records
4. Verify RLS policies allow service role access

## Documentation

- IntaSend API Docs: https://developers.intasend.com/
- IntaSend Dashboard: https://dashboard.intasend.com/
- Supabase Functions: https://supabase.com/dashboard/project/fohpbqxpjrknaiqfvlgv/functions

---

**Status:** ✅ Payment initiation working | ⚠️ Webhook & verification pending setup
