import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  checkRateLimit,
  corsHeaders,
  expectedAmount,
  formatKenyanPhone,
  getClientIp,
  insertRenewalRequest,
  isValidKenyanPhone,
  isValidUuid,
  log,
  normalizeAccountType,
  normalizeMonths,
  mpesaBaseUrl,
  rateLimitResponse,
  readJson,
  verifyUserJwt,
} from '../_shared/renewal.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(req);
  const { limited, retryAfter } = checkRateLimit(ip);
  if (limited) {
    log('mpesa-stk', 'warn', 'Rate limited', { ip });
    return rateLimitResponse(retryAfter);
  }

  try {
    const body = await readJson(req);
    const { phone, amount, account_ref, user_id, months, account_type, user_name, user_email } = body;

    const safeMonths = normalizeMonths(months);
    const safeAccountType = normalizeAccountType(account_type);

    if (!phone || !amount || !isValidUuid(user_id) || !safeMonths || !safeAccountType) {
      log('mpesa-stk', 'warn', 'Missing fields', { ip, user_id });
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authorized = await verifyUserJwt(req, user_id);
    if (!authorized) {
      log('mpesa-stk', 'warn', 'Unauthorized', { ip, user_id });
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validAmount = expectedAmount(safeAccountType, safeMonths);
    if (Number(amount) !== validAmount) {
      log('mpesa-stk', 'warn', 'Invalid amount', { ip, user_id, amount, validAmount });
      return new Response(JSON.stringify({ success: false, message: 'Invalid payment amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const CONSUMER_KEY = Deno.env.get('MPESA_CONSUMER_KEY');
    const CONSUMER_SECRET = Deno.env.get('MPESA_CONSUMER_SECRET');
    const SHORTCODE = Deno.env.get('MPESA_SHORTCODE');
    const PASSKEY = Deno.env.get('MPESA_PASSKEY');
    const CALLBACK_URL = Deno.env.get('MPESA_CALLBACK_URL');

    if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !PASSKEY || !CALLBACK_URL) {
      log('mpesa-stk', 'error', 'M-Pesa env vars missing');
      return new Response(JSON.stringify({ success: false, message: 'M-Pesa is not configured yet' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const baseUrl = mpesaBaseUrl();
    const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
    const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      log('mpesa-stk', 'error', 'M-Pesa token fetch failed', { ip, user_id });
      return new Response(JSON.stringify({ success: false, message: 'Failed to authenticate with M-Pesa' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = btoa(`${SHORTCODE}${PASSKEY}${timestamp}`);
    const formattedPhone = formatKenyanPhone(String(phone));
    if (!isValidKenyanPhone(formattedPhone)) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid Kenyan phone number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: Deno.env.get('MPESA_TRANSACTION_TYPE') || 'CustomerPayBillOnline',
        Amount: validAmount,
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: typeof account_ref === 'string' && account_ref.length <= 32 ? account_ref : `${user_id.slice(0, 8)}-${safeAccountType}`,
        TransactionDesc: `NyumbaniHub ${safeAccountType} renewal ${safeMonths}mo`,
      }),
    });

    const stkData = await stkRes.json();

    if (stkData.ResponseCode !== '0') {
      log('mpesa-stk', 'warn', 'STK push failed', { ip, user_id, code: stkData.ResponseCode });
      return new Response(JSON.stringify({
        success: false,
        message: stkData.errorMessage || stkData.ResponseDescription || 'M-Pesa STK push failed',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const renewal = await insertRenewalRequest({
      user_id,
      user_name: user_name ?? null,
      user_email: user_email ?? null,
      phone: formattedPhone,
      amount: validAmount,
      months: safeMonths,
      account_type: safeAccountType,
      payment_method: 'mpesa',
      checkout_request_id: stkData.CheckoutRequestID,
      merchant_request_id: stkData.MerchantRequestID,
      status: 'pending',
    });

    log('mpesa-stk', 'info', 'STK push sent', { user_id, renewal_id: renewal.id, account_type: safeAccountType, months: safeMonths });
    return new Response(JSON.stringify({
      success: true,
      message: stkData.CustomerMessage || 'Check your phone and enter your M-Pesa PIN',
      checkout_request_id: stkData.CheckoutRequestID,
      renewal_id: renewal.id,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    log('mpesa-stk', 'error', 'Unhandled error', { ip, error: String(err) });
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
