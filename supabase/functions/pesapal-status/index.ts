import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  checkRateLimit,
  completeRenewalPayment,
  corsHeaders,
  getClientIp,
  getSupabaseConfig,
  isValidUuid,
  log,
  rateLimitResponse,
  readJson,
  updateRenewalByCheckout,
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
  return data.token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const ip = getClientIp(req);
  const { limited, retryAfter } = checkRateLimit(ip);
  if (limited) {
    log('pesapal-status', 'warn', 'Rate limited', { ip });
    return rateLimitResponse(retryAfter);
  }

  try {
    const body = await readJson(req);
    const { renewal_id, user_id, order_tracking_id } = body;

    if (!isValidUuid(renewal_id as string) || !isValidUuid(user_id as string)) {
      return new Response(JSON.stringify({ success: false, message: 'Missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authorized = await verifyUserJwt(req, user_id as string);
    if (!authorized) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
    const dbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/renewal_requests?id=eq.${renewal_id}&user_id=eq.${user_id}&select=*`,
      { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    const rows = await dbRes.json();
    const renewal = rows[0];

    if (!renewal) {
      return new Response(JSON.stringify({ success: false, message: 'Renewal not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (renewal.status === 'paid') {
      return new Response(JSON.stringify({ success: true, status: 'paid' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (renewal.status === 'failed') {
      return new Response(JSON.stringify({ success: true, status: 'failed', failure_reason: renewal.failure_reason }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Still pending — check Pesapal directly if we have tracking ID
    if (order_tracking_id && typeof order_tracking_id === 'string') {
      try {
        const token = await getPesapalToken();
        const statusRes = await fetch(
          `${pesapalBase()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(order_tracking_id)}`,
          { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
        );
        const statusData = await statusRes.json();
        const statusCode = Number(statusData.status_code ?? -1);
        const paymentStatus = String(statusData.payment_status_description || '').toUpperCase();

        if (statusCode === 1 || paymentStatus === 'COMPLETED' || paymentStatus === 'PAID') {
          await completeRenewalPayment(renewal.id, order_tracking_id);
          log('pesapal-status', 'info', 'Payment confirmed via poll', { renewal_id, order_tracking_id });
          return new Response(JSON.stringify({ success: true, status: 'paid' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (statusCode === 2 || paymentStatus === 'FAILED') {
          await updateRenewalByCheckout(renewal.checkout_request_id, { status: 'failed', failure_reason: paymentStatus });
          return new Response(JSON.stringify({ success: true, status: 'failed', failure_reason: paymentStatus }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (e) {
        log('pesapal-status', 'warn', 'Pesapal status check failed', { error: String(e) });
      }
    }

    return new Response(JSON.stringify({ success: true, status: 'pending' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    log('pesapal-status', 'error', 'Unhandled error', { ip, error: String(err) });
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
