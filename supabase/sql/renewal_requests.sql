-- Renewal payment tracking for M-Pesa / Airtel Money STK
CREATE TABLE IF NOT EXISTS public.renewal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name text,
  user_email text,
  phone text NOT NULL,
  amount numeric NOT NULL,
  months int NOT NULL DEFAULT 1,
  account_type text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('mpesa', 'airtel')),
  checkout_request_id text,
  merchant_request_id text,
  payment_reference text,
  mpesa_receipt text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE INDEX IF NOT EXISTS renewal_requests_user_id_idx ON public.renewal_requests(user_id);
CREATE INDEX IF NOT EXISTS renewal_requests_checkout_idx ON public.renewal_requests(checkout_request_id);
CREATE INDEX IF NOT EXISTS renewal_requests_status_idx ON public.renewal_requests(status);

ALTER TABLE public.renewal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "renewals_read_own" ON public.renewal_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Inserts/updates handled by service role in edge functions
