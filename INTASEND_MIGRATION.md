# Migration from Pesapal to IntaSend

This document outlines the changes made to replace Pesapal with IntaSend as the payment gateway.

## Environment Variables

### Remove (Pesapal)
```
PESAPAL_ENV=sandbox|live
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
```

### Add (IntaSend) - Production Configuration
```bash
# IntaSend Live Environment
INTASEND_ENV=live
INTASEND_PUBLISHABLE_KEY=ISPubKey_live_624fa2ca-e63f-403c-b7f0-b80fa47ef7dc
INTASEND_SECRET_KEY=ISSecretKey_live_9922eb85-7e6c-472a-8da1-0e416c1fa3d6
INTASEND_WEBHOOK_SECRET=your_webhook_secret_from_intasend_dashboard
```

### For Development/Testing (Sandbox)
```bash
# IntaSend Sandbox Environment  
INTASEND_ENV=sandbox
INTASEND_PUBLISHABLE_KEY=ISPubKey_test_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
INTASEND_SECRET_KEY=ISSecretKey_test_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
INTASEND_WEBHOOK_SECRET=your_sandbox_webhook_secret
```

## ✅ **DEPLOYMENT COMPLETE - IntaSend Integration Live!**

### 🎉 **Successfully Deployed:**
- ✅ **intasend-initiate** - Payment initiation (DEPLOYED)
- ✅ **intasend-status** - Payment status checking (DEPLOYED)  
- ✅ **intasend-webhook** - Payment notifications (DEPLOYED)
- ✅ **Environment Variables** - Live API keys configured
- ✅ **Frontend Integration** - Complete payment flow implemented
- ✅ **Build Successful** - Main app ready for production

**Dashboard URL**: https://supabase.com/dashboard/project/fohpbqxpjrknaiqfvlgv/functions
**Webhook URL**: https://fohpbqxpjrknaiqfvlgv.supabase.co/functions/v1/intasend-webhook

## Supabase Environment Setup

### 1. Add Environment Variables to Supabase

In your Supabase dashboard:
1. Go to **Project Settings** → **Edge Functions**
2. Add the following environment variables:

```bash
INTASEND_ENV=live
INTASEND_PUBLISHABLE_KEY=ISPubKey_live_624fa2ca-e63f-403c-b7f0-b80fa47ef7dc
INTASEND_SECRET_KEY=ISSecretKey_live_9922eb85-7e6c-472a-8da1-0e416c1fa3d6
INTASEND_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Deploy New Functions

```bash
# Deploy the IntaSend functions
npx supabase functions deploy intasend-initiate
npx supabase functions deploy intasend-status
npx supabase functions deploy intasend-webhook
```

### 3. Configure Webhook in IntaSend Dashboard

1. Login to [IntaSend Dashboard](https://dashboard.intasend.com/)
2. Go to **Settings** → **Webhooks**
3. Add new webhook:
   - **URL**: `https://your-project.supabase.co/functions/v1/intasend-webhook`
   - **Events**: Select `checkout.completed` and `checkout.failed`
   - **Secret**: Generate and copy to `INTASEND_WEBHOOK_SECRET`

## New Backend Functions Created

1. **intasend-initiate** - Replaces `pesapal-initiate`
   - Creates checkout session with IntaSend
   - Returns redirect URL for payment

2. **intasend-status** - Replaces `pesapal-status`
   - Checks payment status with IntaSend API
   - Updates renewal records accordingly

3. **intasend-webhook** - Replaces `pesapal-ipn`
   - Handles IntaSend webhook notifications
   - Processes payment completion/failure events

## Frontend Changes

- Updated payment method from 'pesapal' to 'intasend'
- Changed UI elements to show IntaSend branding
- Updated payment flow messaging
- Modified state management for IntaSend tracking IDs

## Webhook Configuration

Set up webhook in IntaSend dashboard:
- URL: `https://your-supabase-url.supabase.co/functions/v1/intasend-webhook`
- Events: Payment completed, Payment failed

## Old Functions (Can be removed)

- `pesapal-initiate`
- `pesapal-status` 
- `pesapal-ipn`

## Quick Deployment

Run the deployment script to set up IntaSend integration:

**Linux/Mac:**
```bash
chmod +x deploy-intasend.sh
./deploy-intasend.sh
```

**Windows:**
```powershell
.\deploy-intasend.ps1
```

Or manually deploy functions:
```bash
supabase functions deploy intasend-initiate
supabase functions deploy intasend-status  
supabase functions deploy intasend-webhook
```

## Testing

### 1. Test Payment Flow
1. Set environment to live mode: `INTASEND_ENV=live`
2. Use the provided live credentials
3. Test subscription flow:
   - Go to profile page
   - Click "Subscribe to POS" 
   - Select payment duration
   - Choose IntaSend payment method
   - Complete payment on IntaSend page
   - Verify renewal completion

### 2. Test Webhook
1. Make a test payment
2. Check Supabase logs for webhook events
3. Verify renewal status updates correctly
4. Confirm subscription activation

### 3. Verify Functions
Check function logs in Supabase Dashboard:
- `intasend-initiate` - Should create checkout sessions
- `intasend-status` - Should check payment status  
- `intasend-webhook` - Should receive payment notifications

## IntaSend API Documentation

- [IntaSend API Docs](https://developers.intasend.com/)
- [Checkout API](https://developers.intasend.com/docs/checkout)
- [Webhooks](https://developers.intasend.com/docs/webhooks)