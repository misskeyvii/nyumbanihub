export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Structured logger ───────────────────────────────────────────────────────
export function log(fn: string, level: 'info' | 'warn' | 'error', msg: string, data?: Record<string, unknown>) {
  console[level](JSON.stringify({ ts: new Date().toISOString(), fn, level, msg, ...data }));
}

// ─── In-memory rate limiter (per Deno isolate) ────────────────────────────────
// Limits: 20 requests per IP per 60 seconds
const RL_WINDOW_MS = 60_000;
const RL_MAX       = 20;
const _rlStore     = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

export function checkRateLimit(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  let entry = _rlStore.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + RL_WINDOW_MS };
    _rlStore.set(ip, entry);
    return { limited: false, retryAfter: 0 };
  }
  entry.count++;
  if (entry.count > RL_MAX) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfter: 0 };
}

export function rateLimitResponse(retryAfter: number) {
  return new Response(JSON.stringify({ success: false, message: 'Too many requests' }), {
    status: 429,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
  });
}

export const PRICING: Record<string, number> = {
  landlord: 500,
  airbnb: 500,
  hotel: 500,
  shop: 800,
  marketplace: 800,
  service: 400,
  entertainment: 400,
};

export const ACCOUNT_TYPES = new Set(Object.keys(PRICING));
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_JSON_BYTES = 16_384;

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (contentLength > MAX_JSON_BYTES) throw new Error('Request body too large');

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('Expected application/json');
  }

  return await req.json();
}

export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function normalizeMonths(value: unknown): number | null {
  const months = Number(value);
  if (!Number.isInteger(months) || months < 1 || months > 12) return null;
  return months;
}

export function normalizeAccountType(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const accountType = value.trim().toLowerCase();
  return ACCOUNT_TYPES.has(accountType) ? accountType : null;
}

export function expectedAmount(accountType: string, months: number): number {
  return (PRICING[accountType] || 500) * months;
}

export function formatKenyanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export function isValidKenyanPhone(phone: string): boolean {
  return /^254(7|1)\d{8}$/.test(phone);
}

export function verifyWebhookSecret(req: Request): boolean {
  const expected = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
  if (!expected) return true;
  const provided = req.headers.get('x-webhook-secret') || req.headers.get('x-payment-webhook-secret');
  return provided === expected;
}

export function getSupabaseConfig() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  if (!SUPABASE_URL || !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(SUPABASE_URL)) {
    throw new Error('Invalid or missing SUPABASE_URL');
  }
  return { SUPABASE_URL, SUPABASE_SERVICE_KEY };
}

export async function verifyUserJwt(req: Request, userId: string): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: authHeader,
      apikey: SUPABASE_SERVICE_KEY,
    },
  });

  if (!res.ok) return false;
  const user = await res.json();
  return user?.id === userId;
}

export async function insertRenewalRequest(payload: Record<string, unknown>) {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/renewal_requests`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to save renewal request: ${text}`);
  }

  const rows = await res.json();
  return rows[0];
}

export async function updateRenewalByCheckout(
  checkoutRequestId: string,
  patch: Record<string, unknown>
) {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
  await fetch(
    `${SUPABASE_URL}/rest/v1/renewal_requests?checkout_request_id=eq.${encodeURIComponent(checkoutRequestId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(patch),
    }
  );
}

export async function getRenewalByCheckout(checkoutRequestId: string) {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/renewal_requests?checkout_request_id=eq.${encodeURIComponent(checkoutRequestId)}&select=*`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const rows = await res.json();
  return rows[0] ?? null;
}

export async function completeRenewalPayment(renewalId: string, receipt?: string) {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = getSupabaseConfig();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/complete_renewal_payment`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_renewal_id: renewalId, p_receipt: receipt ?? null }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to complete renewal: ${text}`);
  }

  return res.json();
}

export function mpesaBaseUrl(): string {
  return Deno.env.get('MPESA_ENV') === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';
}
