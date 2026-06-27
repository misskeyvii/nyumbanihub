import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getClientIp, log, rateLimitResponse } from '../_shared/renewal.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const ip = getClientIp(req);
  const { limited, retryAfter } = checkRateLimit(ip);
  if (limited) {
    log('delete-user', 'warn', 'Rate limited', { ip });
    return rateLimitResponse(retryAfter);
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      log('delete-user', 'warn', 'Missing userId', { ip });
      return new Response('Missing userId', { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      log('delete-user', 'error', 'Delete failed', { ip, userId, error: error.message });
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }

    log('delete-user', 'info', 'User deleted', { userId });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    log('delete-user', 'error', 'Unhandled error', { ip, error: String(e) });
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
