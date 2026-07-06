import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  completeRenewalPayment,
  corsHeaders,
  getClientIp,
  getSupabaseConfig,
  log,
  updateRenewalByCheckout,
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

async function getRenewalByOrderId(orderId: string) {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/renewal_requests?checkout_request_id=eq.${encodeURIComponent(orderId)}&select=*`,
    { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
  );
  const rows = await res.json();
  return rows[0] ?? null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const ip = getClientIp(req);

  try {
    // Pesapal sends: OrderNotificationType, OrderTrackingId, OrderMerchantReference
    let orderId = '';
    let trackingId = '';

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      orderId = body.OrderMerchantReference || body.order_merchant_reference || '';
      trackingId = body.OrderTrackingId || body.order_tracking_id || '';
    } else {
      const url = new URL(req.url);
      orderId = url.searchParams.get('OrderMerchantReference') || url.searchParams.get('order_merchant_reference') || '';
      trackingId = url.searchParams.get('OrderTrackingId') || url.searchParams.get('order_tracking_id') || '';
    }

    if (!orderId || !trackingId) {
      log('pesapal-ipn', 'warn', 'Missing orderId or trackingId', { ip, orderId, trackingId });
      return new Response(JSON.stringify({ orderNotificationType: 'IPNCHANGE', orderTrackingId: trackingId, orderMerchantReference: orderId, status: '200' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get transaction status from Pesapal
    const token = await getPesapalToken();
    const statusRes = await fetch(
      `${pesapalBase()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`,
      {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      }
    );
    const statusData = await statusRes.json();
    const paymentStatus = String(statusData.payment_status_description || '').toUpperCase();
    const statusCode = Number(statusData.status_code ?? statusData.payment_status_code ?? -1);

    log('pesapal-ipn', 'info', 'IPN received', { orderId, trackingId, paymentStatus, statusCode });

    const renewal = await getRenewalByOrderId(orderId);
    if (!renewal) {
      log('pesapal-ipn', 'warn', 'Renewal not found', { orderId });
      return new Response(JSON.stringify({ orderNotificationType: 'IPNCHANGE', orderTrackingId: trackingId, orderMerchantReference: orderId, status: '200' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // status_code 1 = COMPLETED/PAID
    if (statusCode === 1 || paymentStatus === 'COMPLETED' || paymentStatus === 'PAID') {
      await completeRenewalPayment(renewal.id, trackingId);
      log('pesapal-ipn', 'info', 'Payment completed', { renewal_id: renewal.id, trackingId });
    } else if (statusCode === 2 || paymentStatus === 'FAILED') {
      await updateRenewalByCheckout(orderId, { status: 'failed', failure_reason: paymentStatus });
      log('pesapal-ipn', 'info', 'Payment failed', { renewal_id: renewal.id, paymentStatus });
    }
    // INVALID or PENDING — do nothing, wait for next IPN

    // Pesapal requires this exact response format
    return new Response(
      JSON.stringify({ orderNotificationType: 'IPNCHANGE', orderTrackingId: trackingId, orderMerchantReference: orderId, status: '200' }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    log('pesapal-ipn', 'error', 'Unhandled error', { ip, error: String(err) });
    return new Response(JSON.stringify({ status: '200' }), { headers: { 'Content-Type': 'application/json' } });
  }
});
