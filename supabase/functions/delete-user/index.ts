import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  checkRateLimit,
  getClientIp,
  getSupabaseConfig,
  log,
  rateLimitResponse,
} from '../_shared/renewal.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const ip = getClientIp(req);
  const { limited, retryAfter } = checkRateLimit(ip);
  if (limited) {
    log('delete-user', 'warn', 'Rate limited', { ip });
    return rateLimitResponse(retryAfter);
  }

  try {
    const { userId } = await req.json();
    if (!userId || typeof userId !== 'string') {
      log('delete-user', 'warn', 'Missing userId', { ip });
      return new Response('Missing userId', { status: 400, headers: corsHeaders });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      log('delete-user', 'warn', 'Missing auth header', { ip });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: SUPABASE_SERVICE_KEY,
      },
    });

    if (!authRes.ok) {
      log('delete-user', 'warn', 'Invalid token', { ip });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const caller = await authRes.json();
    const roleRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(caller.id)}&select=role`,
      { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    const roles = await roleRes.json();
    const isAdmin = roles[0]?.role === 'admin';

    if (caller.id !== userId && !isAdmin) {
      log('delete-user', 'warn', 'Forbidden delete attempt', { ip, callerId: caller.id, userId });
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
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
