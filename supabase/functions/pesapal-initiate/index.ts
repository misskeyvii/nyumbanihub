import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  checkRateLimit,
  completeRenewalPayment,
  corsHeaders,
  expectedAmount,
  getClientIp,
  getSupabaseConfig,
  insertRenewalRequest,
  isValidUuid,
  log,
  normalizeAccountType,
  normalizeMonths,
  rateLimitResponse,
  readJson,
  verifyUserJwt,
} from '../_shared/renewal.ts';

function pesapalBase(): string {
  return Deno.env.get('PESAPAL_ENV') === 'live'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';
}

async function getPesapalToken(): Promise<string> {
  const KEY = Deno.env.get('PESAPAL_CONSUMER_KEY')!;
  const SECRET = Deno.env.get('PESAPAL_CONSUMER_SECRET')!;
  const res = await fetch(`${pesapalBase()}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ consumer_key: KEY, consumer_secret: SECRET }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Pesapal auth failed: ${JSON.stringify(data)}`);
  return data.token;
}

async function registerIpn(token: string, ipnUrl: string): Promise<string> {
  const res = await fetch(`${pesapalBase()}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'POST' }),
  });
  const data = await res.json();
  // Return existing or new IPN id
  return data.ipn_id || data.id || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const ip = getClientIp(req);
  const { limited, retryAfter } = checkRateLimit(ip);
  if (limited) {
    log('pesapal-initiate', 'warn', 'Rate limited', { ip });
    return rateLimitResponse(retryAfter);
  }

  try {
    const body = await readJson(req);
    const { user_id, months, account_type, user_name, user_email, redirect_url } = body;

    const safeMonths = normalizeMonths(months);
    const safeAccountType = normalizeAccountType(account_type);

    if (!isValidUuid(user_id) || !safeMonths || !safeAccountType) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authorized = await verifyUserJwt(req, user_id as string);
    if (!authorized) {
      log('pesapal-initiate', 'warn', 'Unauthorized', { ip, user_id });
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const KEY = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const SECRET = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    if (!KEY || !SECRET) {
      log('pesapal-initiate', 'error', 'Pesapal env vars missing');
      return new Response(JSON.stringify({ success: false, message: 'Pesapal is not configured yet' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const amount = expectedAmount(safeAccountType, safeMonths);
    const orderId = `NH-${Date.now()}-${(user_id as string).slice(0, 6)}`;

    // Insert renewal record first so IPN can find it
    const renewal = await insertRenewalRequest({
      user_id,
      user_name: user_name ?? null,
      user_email: user_email ?? null,
      amount,
      months: safeMonths,
      account_type: safeAccountType,
      payment_method: 'pesapal',
      checkout_request_id: orderId,
      status: 'pending',
    });

    const token = await getPesapalToken();

    // Register IPN URL
    const { SUPABASE_URL } = getSupabaseConfig();
    const ipnUrl = `${SUPABASE_URL}/functions/v1/pesapal-ipn`;
    const ipnId = await registerIpn(token, ipnUrl);

    // Submit order
    const callbackUrl = typeof redirect_url === 'string' && redirect_url.startsWith('https://')
      ? redirect_url
      : `${Deno.env.get('SITE_URL') || 'https://nyumbanilink.com'}/profile?renewal=${renewal.id}`;

    const orderRes = await fetch(`${pesapalBase()}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: orderId,
        currency: 'KES',
        amount,
        description: `NyumbaniHub ${safeAccountType} renewal ${safeMonths}mo`,
        callback_url: callbackUrl,
        notification_id: ipnId,
        billing_address: {
          email_address: typeof user_email === 'string' ? user_email : '',
          first_name: typeof user_name === 'string' ? user_name.split(' ')[0] : 'Customer',
          last_name: typeof user_name === 'string' ? user_name.split(' ').slice(1).join(' ') || 'User' : 'User',
          country_code: 'KE',
        },
      }),
    });

    const orderData = await orderRes.json();

    if (!orderData.redirect_url) {
      log('pesapal-initiate', 'error', 'No redirect_url from Pesapal', { orderData });
      return new Response(JSON.stringify({ success: false, message: orderData.error?.message || 'Failed to create Pesapal order' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    log('pesapal-initiate', 'info', 'Order created', { user_id, renewal_id: renewal.id, orderId, safeAccountType, safeMonths });

    return new Response(JSON.stringify({
      success: true,
      redirect_url: orderData.redirect_url,
      order_tracking_id: orderData.order_tracking_id,
      renewal_id: renewal.id,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    log('pesapal-initiate', 'error', 'Unhandled error', { ip, error: String(err) });
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
