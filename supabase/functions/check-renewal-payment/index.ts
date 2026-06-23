import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  completeRenewalPayment,
  corsHeaders,
  getSupabaseConfig,
  verifyUserJwt,
} from '../_shared/renewal.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { renewal_id, user_id } = await req.json();
    if (!renewal_id || !user_id) {
      return new Response(JSON.stringify({ success: false, message: 'Missing renewal_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authorized = await verifyUserJwt(req, user_id);
    if (!authorized) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
    const renewalRes = await fetch(
      `${SUPABASE_URL}/rest/v1/renewal_requests?id=eq.${renewal_id}&user_id=eq.${user_id}&select=*`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    const renewals = await renewalRes.json();
    const renewal = renewals[0];

    if (!renewal) {
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
          body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials',
          }),
        });
        const { access_token } = await tokenRes.json();

        if (access_token) {
          const statusRes = await fetch(
            `https://openapi.airtel.africa/standard/v1/payments/${renewal.checkout_request_id}`,
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
            return new Response(JSON.stringify({ success: true, status: 'paid' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (airtelStatus.includes('FAIL') || airtelStatus.includes('CANCEL')) {
            await fetch(`${SUPABASE_URL}/rest/v1/renewal_requests?id=eq.${renewal_id}`, {
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
            return new Response(JSON.stringify({
              success: true,
              status: 'failed',
              failure_reason: statusData?.status?.message || 'Payment failed',
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, status: 'pending' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
