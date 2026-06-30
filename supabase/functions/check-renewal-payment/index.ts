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
    log('check-renewal', 'warn', 'Rate limited', { ip });
    return rateLimitResponse(retryAfter);
  }

  try {
    const { renewal_id, user_id } = await readJson(req);
    if (!isValidUuid(renewal_id) || !isValidUuid(user_id)) {
      log('check-renewal', 'warn', 'Missing fields', { ip });
      return new Response(JSON.stringify({ success: false, message: 'Missing renewal_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authorized = await verifyUserJwt(req, user_id);
    if (!authorized) {
      log('check-renewal', 'warn', 'Unauthorized', { ip, user_id });
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
    const renewalRes = await fetch(
      `${SUPABASE_URL}/rest/v1/renewal_requests?id=eq.${encodeURIComponent(renewal_id)}&user_id=eq.${encodeURIComponent(user_id)}&select=*`,
      { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    const renewals = await renewalRes.json();
    const renewal = renewals[0];

    if (!renewal) {
      log('check-renewal', 'warn', 'Renewal not found', { ip, user_id, renewal_id });
      return new Response(JSON.stringify({ success: false, message: 'Renewal not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (renewal.status !== 'pending') {
      return new Response(JSON.stringify({
        success: true,
        status: renewal.status,
        failure_reason: renewal.failure_reason,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (renewal.payment_method === 'airtel') {
      const CLIENT_ID = Deno.env.get('AIRTEL_CLIENT_ID');
      const CLIENT_SECRET = Deno.env.get('AIRTEL_CLIENT_SECRET');

      if (CLIENT_ID && CLIENT_SECRET) {
        const tokenRes = await fetch('https://openapi.airtel.africa/auth/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'client_credentials' }),
        });
        const { access_token } = await tokenRes.json();

        if (access_token) {
          const statusRes = await fetch(
            `https://openapi.airtel.africa/standard/v1/payments/${encodeURIComponent(renewal.checkout_request_id)}`,
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                'X-Country': 'KE',
                'X-Currency': 'KES',
              },
            }
          );
          const statusData = await statusRes.json();
          const airtelStatus = String(statusData?.data?.transaction?.status ?? '').toUpperCase();

          if (airtelStatus === 'TS' || airtelStatus.includes('SUCCESS')) {
            await completeRenewalPayment(renewal.id, renewal.checkout_request_id);
            log('check-renewal', 'info', 'Airtel payment confirmed', { renewal_id, user_id });
            return new Response(JSON.stringify({ success: true, status: 'paid' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (airtelStatus.includes('FAIL') || airtelStatus.includes('CANCEL')) {
            await fetch(`${SUPABASE_URL}/rest/v1/renewal_requests?id=eq.${encodeURIComponent(renewal_id)}`, {
              method: 'PATCH',
              headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
              },
              body: JSON.stringify({
                status: 'failed',
                failure_reason: statusData?.status?.message || 'Airtel payment failed',
              }),
            });
            log('check-renewal', 'info', 'Airtel payment failed', { renewal_id, user_id, airtelStatus });
            return new Response(JSON.stringify({
              success: true,
              status: 'failed',
              failure_reason: statusData?.status?.message || 'Payment failed',
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
      }
    }

    log('check-renewal', 'info', 'Still pending', { renewal_id, user_id });
    return new Response(JSON.stringify({ success: true, status: 'pending' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    log('check-renewal', 'error', 'Unhandled error', { ip, error: String(err) });
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
