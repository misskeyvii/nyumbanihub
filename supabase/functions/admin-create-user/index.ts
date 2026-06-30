import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  formatKenyanPhone,
  getClientIp,
  getSupabaseConfig,
  isValidKenyanPhone,
  log,
  normalizeAccountType,
  readJson,
} from '../_shared/renewal.ts';

const ROLE_TYPES = new Set(['user', 'marketer', 'admin']);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(req);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: SUPABASE_SERVICE_KEY },
    });
    if (!authRes.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const caller = await authRes.json();
    const roleRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(caller.id)}&select=role`,
      { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    const roles = await roleRes.json();
    const callerRole = roles[0]?.role;

    const body = await readJson(req);
    const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : 'user';
    const accountType = body.account_type ? normalizeAccountType(body.account_type) : null;

    if (!ROLE_TYPES.has(role)) throw new Error('Invalid role');
    if (!['admin', 'marketer'].includes(callerRole)) throw new Error('Forbidden');
    if (callerRole === 'marketer' && role !== 'user') throw new Error('Forbidden');
    if (role === 'user' && !accountType) throw new Error('Invalid account type');

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!name || !email || password.length < 6) throw new Error('Name, email and password are required');
    const normalizedPhone = phone ? formatKenyanPhone(phone) : '';
    if (normalizedPhone && !isValidKenyanPhone(normalizedPhone)) throw new Error('Invalid phone number');

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) throw new Error('User was not created');

    const expiresAt = typeof body.subscription_expires_at === 'string' && body.subscription_expires_at
      ? new Date(body.subscription_expires_at)
      : new Date();
    if (role === 'user' && !body.subscription_expires_at) expiresAt.setMonth(expiresAt.getMonth() + 1);
    const expiresStr = expiresAt.toISOString();

    const { error: insertError } = await supabaseAdmin.from('users').upsert({
      id: userId,
      name,
      email,
      phone: normalizedPhone || null,
      county: typeof body.county === 'string' ? body.county : null,
      area: typeof body.area === 'string' ? body.area : null,
      account_type: accountType,
      subcategory: typeof body.subcategory === 'string' ? body.subcategory : null,
      role,
      is_active: true,
      subscription_expires_at: role === 'user' ? expiresStr : null,
      subscription_details: role === 'user' && accountType ? { [accountType]: expiresStr } : null,
    }, { onConflict: 'id' });
    if (insertError) throw insertError;

    log('admin-create-user', 'info', 'User created', { ip, callerId: caller.id, userId, role });
    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    log('admin-create-user', 'warn', 'Create failed', { ip, error: String(error) });
    const message = error instanceof Error ? error.message : 'Create user failed';
    const status = message === 'Forbidden' ? 403 : 400;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
