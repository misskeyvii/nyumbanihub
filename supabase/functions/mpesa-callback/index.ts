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
    const callback = payload?.Body?.stkCallback;

    if (!callback?.CheckoutRequestID) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const checkoutRequestId = callback.CheckoutRequestID as string;
    const resultCode = Number(callback.ResultCode);
    const renewal = await getRenewalByCheckout(checkoutRequestId);

    if (!renewal) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (resultCode !== 0) {
      await updateRenewalByCheckout(checkoutRequestId, {
        status: 'failed',
        failure_reason: callback.ResultDesc || 'Payment cancelled or failed',
      });
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let receipt: string | undefined;
    const items = callback.CallbackMetadata?.Item ?? [];
    for (const item of items) {
      if (item.Name === 'MpesaReceiptNumber') receipt = String(item.Value);
    }

    await completeRenewalPayment(renewal.id, receipt);

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('mpesa-callback error:', err);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
