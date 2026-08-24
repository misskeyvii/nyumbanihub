import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== Request received ===')
  console.log('Method:', req.method)
  
  if (req.method === 'OPTIONS') {
    console.log('Responding to OPTIONS')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== IntaSend Initiate Function Started ===')
    
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse JSON:', e.message)
      throw new Error(`JSON parse error: ${e.message}`)
    }
    
    console.log('Request body received:', JSON.stringify(body))

    const { amount, account_type, months, user_id, user_name, user_email } = body

    if (!amount || !account_type || !months || !user_id) {
      throw new Error('Missing required fields: amount, account_type, months, user_id')
    }

    console.log('Required fields validated')

    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://nyumbanilink.com'
    const renewalId = crypto.randomUUID()
    // Simplify redirect URL - use just the renewal_id, IntaSend adds parameters
    const callbackUrl = `${siteUrl}/profile?renewal_id=${renewalId}`
    
    const publishableKey = Deno.env.get('INTASEND_PUBLISHABLE_KEY')!
    
    // Call IntaSend API to create checkout
    const checkoutPayload = {
      public_key: publishableKey,
      amount: Number(amount),
      currency: 'KES',
      email: user_email || 'customer@nyumbanilink.com',
      first_name: (user_name || 'Customer').split(' ')[0],
      last_name: (user_name || 'User').split(' ').slice(1).join(' ') || 'User',
      api_ref: renewalId,
      redirect_url: callbackUrl,
      host: siteUrl,
      mobile_tarrif: 'CUSTOMER-PAYS',
      card_tarrif: 'CUSTOMER-PAYS',
    }

    console.log('Calling IntaSend API with payload:', JSON.stringify(checkoutPayload))

    const response = await fetch('https://api.intasend.com/api/v1/checkout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutPayload),
    })

    console.log('IntaSend Response Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('IntaSend Error:', errorText)
      throw new Error(`IntaSend API error: ${response.status} - ${errorText}`)
    }

    const checkoutData = await response.json()
    console.log('IntaSend Success:', JSON.stringify(checkoutData))

    return new Response(
      JSON.stringify({
        success: true,
        renewal_id: renewalId,
        checkout_url: checkoutData.url,
        order_tracking_id: checkoutData.id || renewalId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', String(error))
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: String(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
