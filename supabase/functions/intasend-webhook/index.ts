import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const body = await req.text()
    const signature = req.headers.get('X-IntaSend-Signature')
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get('INTASEND_WEBHOOK_SECRET')!
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )
    
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature')
    }

    const webhookData = JSON.parse(body)
    
    // Handle different webhook events
    if (webhookData.event === 'COMPLETE') {
      const checkoutId = webhookData.checkout_id
      const apiRef = webhookData.api_ref // This is our renewal_id
      
      // Find the renewal record
      const { data: renewal, error: renewalError } = await supabaseClient
        .from('renewals')
        .select('*')
        .eq('id', apiRef)
        .eq('external_id', checkoutId)
        .single()

      if (renewalError || !renewal) {
        console.error('Renewal not found:', apiRef, checkoutId)
        return new Response('Renewal not found', { status: 404 })
      }

      // Update renewal status to completed
      await supabaseClient
        .from('renewals')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          external_data: webhookData
        })
        .eq('id', apiRef)

      // Activate the subscription
      await supabaseClient.functions.invoke('activate-subscription', {
        body: { renewal_id: apiRef }
      })

      console.log('Payment completed for renewal:', apiRef)
      
    } else if (webhookData.event === 'FAILED') {
      const apiRef = webhookData.api_ref
      
      await supabaseClient
        .from('renewals')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
          external_data: webhookData
        })
        .eq('id', apiRef)

      console.log('Payment failed for renewal:', apiRef)
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})