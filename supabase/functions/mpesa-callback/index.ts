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
} from '../_shared/renewal.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const ip = getClientIp(req);
  const { limited, retryAfter } = checkRateLimit(ip);
  if (limited) {
    log('mpesa-callback', 'warn', 'Rate limited', { ip });
    return rateLimitResponse(retryAfter);
  }

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
      log('mpesa-callback', 'warn', 'Renewal not found', { checkoutRequestId });
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (resultCode !== 0) {
      await updateRenewalByCheckout(checkoutRequestId, {
        status: 'failed',
        failure_reason: callback.ResultDesc || 'Payment cancelled or failed',
      });
      log('mpesa-callback', 'info', 'Payment failed', { checkoutRequestId, resultCode, reason: callback.ResultDesc });
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
    log('mpesa-callback', 'info', 'Payment completed', { renewal_id: renewal.id, receipt });

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    log('mpesa-callback', 'error', 'Unhandled error', { ip, error: String(err) });
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
