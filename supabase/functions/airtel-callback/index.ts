import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  checkRateLimit,
  completeRenewalPayment,
  corsHeaders,
  getClientIp,
  getRenewalByCheckout,
  log,
  rateLimitResponse,
  updateRenewalByCheckout,
  verifyWebhookSecret,
} from '../_shared/renewal.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(req);
  const { limited, retryAfter } = checkRateLimit(ip);
  if (limited) {
    log('airtel-callback', 'warn', 'Rate limited', { ip });
    return rateLimitResponse(retryAfter);
  }

  if (!verifyWebhookSecret(req)) {
    log('airtel-callback', 'warn', 'Invalid webhook secret', { ip });
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    const transaction = payload?.transaction ?? payload?.data?.transaction ?? payload;
    const reference = transaction?.id ?? payload?.reference ?? payload?.checkout_request_id;
    const status = String(transaction?.status_code ?? payload?.status ?? '').toUpperCase();
    const success = ['TS', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED'].some((s) => status.includes(s))
      || payload?.success === true;

    if (!reference) {
      log('airtel-callback', 'warn', 'Missing reference', { ip });
      return new Response(JSON.stringify({ message: 'Missing reference' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const renewal = await getRenewalByCheckout(String(reference));
    if (!renewal) {
      log('airtel-callback', 'warn', 'Renewal not found', { reference });
      return new Response(JSON.stringify({ message: 'Renewal not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!success) {
      await updateRenewalByCheckout(String(reference), {
        status: 'failed',
        failure_reason: payload?.message || transaction?.message || 'Airtel payment failed',
      });
      log('airtel-callback', 'info', 'Payment failed', { reference, status });
      return new Response(JSON.stringify({ message: 'Failure recorded' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await completeRenewalPayment(renewal.id, String(reference));
    log('airtel-callback', 'info', 'Payment completed', { renewal_id: renewal.id, reference });

    return new Response(JSON.stringify({ message: 'Payment completed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    log('airtel-callback', 'error', 'Unhandled error', { ip, error: String(err) });
    return new Response(JSON.stringify({ message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
