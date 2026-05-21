import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { phone, amount, account_ref, user_id, months, account_type } = await req.json();

    const CONSUMER_KEY = Deno.env.get('MPESA_CONSUMER_KEY')!;
    const CONSUMER_SECRET = Deno.env.get('MPESA_CONSUMER_SECRET')!;
    const SHORTCODE = Deno.env.get('MPESA_SHORTCODE')!;
    const PASSKEY = Deno.env.get('MPESA_PASSKEY')!;
    const CALLBACK_URL = Deno.env.get('MPESA_CALLBACK_URL')!;

    // Get access token
    const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
    const tokenRes = await fetch('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` },
    });
    const { access_token } = await tokenRes.json();

    // Generate timestamp & password
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = btoa(`${SHORTCODE}${PASSKEY}${timestamp}`);

    // Format phone: 254XXXXXXXXX
    const formattedPhone = phone.replace(/^0/, '254').replace(/^\+/, '');

    // STK Push
    const stkRes = await fetch('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: account_ref,
        TransactionDesc: `Nyumbani Hub ${account_type} renewal - ${months} month(s)`,
      }),
    });

    const stkData = await stkRes.json();

    // Save pending payment to Supabase
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    await fetch(`${SUPABASE_URL}/rest/v1/renewal_requests`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id,
        phone: formattedPhone,
        amount,
        months,
        account_type,
        payment_method: 'mpesa',
        checkout_request_id: stkData.CheckoutRequestID,
        status: 'pending',
      }),
    });

    return new Response(JSON.stringify({
      success: stkData.ResponseCode === '0',
      message: stkData.CustomerMessage || stkData.ResponseDescription,
      checkout_request_id: stkData.CheckoutRequestID,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
