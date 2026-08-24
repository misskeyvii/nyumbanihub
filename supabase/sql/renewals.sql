-- Create renewals table for tracking subscription renewals
CREATE TABLE IF NOT EXISTS public.renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL,
  months INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- 'intasend', 'mpesa', 'airtel'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'completed'
  external_id TEXT, -- IntaSend checkout ID
  external_data JSONB, -- IntaSend response data
  checkout_request_id TEXT, -- M-Pesa checkout request ID
  merchant_request_id TEXT, -- M-Pesa merchant request ID
  user_name TEXT,
  user_email TEXT,
  phone TEXT,
  failure_reason TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_renewals_user_id ON public.renewals(user_id);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON public.renewals(status);
CREATE INDEX IF NOT EXISTS idx_renewals_external_id ON public.renewals(external_id);
CREATE INDEX IF NOT EXISTS idx_renewals_checkout_request_id ON public.renewals(checkout_request_id);

-- Enable RLS
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own renewals
CREATE POLICY "Users can view their own renewals"
  ON public.renewals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for functions)
CREATE POLICY "Service role can manage renewals"
  ON public.renewals
  USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_renewals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_renewals_updated_at_trigger ON public.renewals;
CREATE TRIGGER update_renewals_updated_at_trigger
  BEFORE UPDATE ON public.renewals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_renewals_updated_at();
