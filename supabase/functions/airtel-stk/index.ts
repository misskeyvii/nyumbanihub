import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  checkRateLimit,
  corsHeaders,
  expectedAmount,
  formatKenyanPhone,
  getClientIp,
  getSupabaseConfig,
  insertRenewalRequest,
  log,
  rateLimitResponse,
  verifyUserJwt,
} from '../_shared/renewal.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const ip = getClientIp(req);
  const { limited, retryAfter } = checkRateLimit(ip);
  if (limited) {
    log('airtel-stk', 'warn', 'Rate limited', { ip });
    return rateLimitResponse(retryAfter);
  }

  try {
    const body = await req.json();
    const { phone, amount, user_id, months, account_type, user_name, user_email } = body;

    if (!phone || !amount || !user_id || !months || !account_type) {
      log('airtel-stk', 'warn', 'Missing fields', { ip, user_id });
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authorized = await verifyUserJwt(req, user_id);
    if (!authorized) {
      log('airtel-stk', 'warn', 'Unauthorized', { ip, user_id });
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validAmount = expectedAmount(account_type, Number(months));
    if (Number(amount) !== validAmount) {
      log('airtel-stk', 'warn', 'Invalid amount', { ip, user_id, amount, validAmount });
      return new Response(JSON.stringify({ success: false, message: 'Invalid payment amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const CLIENT_ID = Deno.env.get('AIRTEL_CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('AIRTEL_CLIENT_SECRET');

    if (!CLIENT_ID || !CLIENT_SECRET) {
      log('airtel-stk', 'error', 'Airtel env vars missing');
      return new Response(JSON.stringify({ success: false, message: 'Airtel Money is not configured yet' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tokenRes = await fetch('https://openapi.airtel.africa/auth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'client_credentials' }),
    });
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      log('airtel-stk', 'error', 'Airtel token fetch failed', { ip, user_id });
      return new Response(JSON.stringify({ success: false, message: 'Failed to authenticate with Airtel' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formattedPhone = formatKenyanPhone(String(phone)).replace(/^254/, '');
    const reference = `NH-${Date.now()}-${user_id.slice(0, 6)}`;

    const payRes = await fetch('https://openapi.airtel.africa/merchant/v1/payments/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'X-Country': 'KE',
        'X-Currency': 'KES',
      },
      body: JSON.stringify({
        reference,
        subscriber: { country: 'KE', currency: 'KES', msisdn: formattedPhone },
        transaction: { amount: validAmount, country: 'KE', currency: 'KES', id: reference },
      }),
    });

    const payData = await payRes.json();
    const responseCode = payData?.status?.response_code ?? payData?.status?.code;
    const successCodes = ['DP00800001001', '200', 'TS000001'];
    const isSuccess = successCodes.includes(String(responseCode));

    if (!isSuccess) {
      log('airtel-stk', 'warn', 'Airtel payment failed to start', { ip, user_id, responseCode });
      return new Response(JSON.stringify({
        success: false,
        message: payData?.status?.message || payData?.message || 'Airtel payment failed to start',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const renewal = await insertRenewalRequest({
      user_id,
      user_name: user_name ?? null,
      user_email: user_email ?? null,
      phone: `254${formattedPhone}`,
      amount: validAmount,
      months: Number(months),
      account_type,
      payment_method: 'airtel',
      checkout_request_id: reference,
      payment_reference: payData?.data?.transaction?.id ?? reference,
      status: 'pending',
    });

    log('airtel-stk', 'info', 'Airtel push sent', { user_id, renewal_id: renewal.id, account_type, months });
    return new Response(JSON.stringify({
      success: true,
      message: payData?.status?.message || 'Check your phone and enter your Airtel Money PIN',
      checkout_request_id: reference,
      renewal_id: renewal.id,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    log('airtel-stk', 'error', 'Unhandled error', { ip, error: String(err) });
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
