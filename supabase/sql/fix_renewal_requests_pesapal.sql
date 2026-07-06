-- Allow phone to be null (Pesapal doesn't require phone)
ALTER TABLE public.renewal_requests ALTER COLUMN phone DROP NOT NULL;

-- Allow 'pesapal' as a payment method
ALTER TABLE public.renewal_requests
  DROP CONSTRAINT IF EXISTS renewal_requests_payment_method_check;

ALTER TABLE public.renewal_requests
  ADD CONSTRAINT renewal_requests_payment_method_check
  CHECK (payment_method IN ('mpesa', 'airtel', 'pesapal'));
