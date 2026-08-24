import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function intasendBase(): string {
  return 'https://api.intasend.com';
}

async function getIntasendHeaders(): Promise<Record<string, string>> {
  const publishableKey = Deno.env.get('INTASEND_PUBLISHABLE_KEY')!;
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publishableKey}`,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { renewal_id, user_id, order_tracking_id } = await req.json()

    // Get renewal record
    const { data: renewal, error: renewalError } = await supabaseClient
      .from('renewals')
      .select('*')
      .eq('id', renewal_id)
      .eq('user_id', user_id)
      .single()

    if (renewalError || !renewal) {
      throw new Error('Renewal not found')
    }

    // Check with IntaSend API using invoice_id instead of order_tracking_id
    const headers = await getIntasendHeaders()
    const invoiceId = renewal.invoice_id || order_tracking_id
    
    const response = await fetch(`${intasendBase()}/api/v1/checkout/details/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ invoice_id: invoiceId }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('IntaSend API error:', errorText)
      throw new Error(`IntaSend API error: ${response.status}`)
    }

    const checkoutData = await response.json()
    
    let status = 'pending'
    let failureReason = null

    // Map IntaSend status to our status
    if (checkoutData.state === 'COMPLETE') {
      status = 'completed'
    } else if (checkoutData.state === 'FAILED' || checkoutData.state === 'CANCELLED') {
      status = 'failed'
      failureReason = checkoutData.failed_reason || 'Payment was cancelled or failed'
    } else if (checkoutData.state === 'PROCESSING') {
      status = 'pending'
    }

    // Update renewal status if changed
    if (renewal.status !== status) {
      await supabaseClient
        .from('renewals')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          external_data: checkoutData
        })
        .eq('id', renewal_id)

      // If completed, activate the subscription
      if (status === 'completed') {
        await supabaseClient.functions.invoke('activate-subscription', {
          body: { renewal_id }
        })
      }
    }

    return new Response(
      JSON.stringify({
        status,
        failure_reason: failureReason,
        payment_data: checkoutData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})