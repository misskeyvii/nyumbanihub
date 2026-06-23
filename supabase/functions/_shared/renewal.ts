export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const PRICING: Record<string, number> = {
  landlord: 500,
  airbnb: 500,
  hotel: 500,
  shop: 800,
  marketplace: 800,
  service: 400,
  entertainment: 400,
};

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

export function getSupabaseConfig() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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
