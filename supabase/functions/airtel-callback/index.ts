import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  completeRenewalPayment,
  corsHeaders,
  getRenewalByCheckout,
  updateRenewalByCheckout,
} from '../_shared/renewal.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const transaction = payload?.transaction ?? payload?.data?.transaction ?? payload;
    const reference = transaction?.id ?? payload?.reference ?? payload?.checkout_request_id;
    const status = String(transaction?.status_code ?? payload?.status ?? '').toUpperCase();
    const success = ['TS', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED'].some((s) => status.includes(s))
      || payload?.success === true;

    if (!reference) {
      return new Response(JSON.stringify({ message: 'Missing reference' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const renewal = await getRenewalByCheckout(String(reference));
    if (!renewal) {
      return new Response(JSON.stringify({ message: 'Renewal not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!success) {
      await updateRenewalByCheckout(String(reference), {
        status: 'failed',
        failure_reason: payload?.message || transaction?.message || 'Airtel payment failed',
      });
      return new Response(JSON.stringify({ message: 'Failure recorded' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await completeRenewalPayment(renewal.id, String(reference));

    return new Response(JSON.stringify({ message: 'Payment completed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('airtel-callback error:', err);
    return new Response(JSON.stringify({ message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
