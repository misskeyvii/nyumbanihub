import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { phone, amount, user_id, months, account_type } = await req.json();

    const CLIENT_ID = Deno.env.get('AIRTEL_CLIENT_ID')!;
    const CLIENT_SECRET = Deno.env.get('AIRTEL_CLIENT_SECRET')!;

    // Get access token
    const tokenRes = await fetch('https://openapi.airtel.africa/auth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'client_credentials' }),
    });
    const { access_token } = await tokenRes.json();

    // Format phone
    const formattedPhone = phone.replace(/^0/, '254').replace(/^\+/, '').replace(/^254/, '');

    const reference = `NH-${Date.now()}`;

    // Initiate payment
    const payRes = await fetch('https://openapi.airtel.africa/merchant/v1/payments/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'X-Country': 'KE',
        'X-Currency': 'KES',
      },
      body: JSON.stringify({
        reference,
        subscriber: { country: 'KE', currency: 'KES', msisdn: formattedPhone },
        transaction: { amount, country: 'KE', currency: 'KES', id: reference },
      }),
    });

    const payData = await payRes.json();

    // Save to Supabase
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
        payment_method: 'airtel',
        checkout_request_id: reference,
        status: 'pending',
      }),
    });

    return new Response(JSON.stringify({
      success: payData.status?.response_code === 'DP00800001001',
      message: payData.status?.message || 'Payment initiated. Check your phone.',
      reference,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
