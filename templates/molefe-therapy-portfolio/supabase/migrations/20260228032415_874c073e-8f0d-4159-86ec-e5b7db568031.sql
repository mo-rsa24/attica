
-- Add access_token to bookings for patient self-service
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS access_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS access_token_created_at timestamptz NOT NULL DEFAULT now();

-- Create unique index on access_token
CREATE UNIQUE INDEX IF NOT EXISTS bookings_access_token_idx ON public.bookings (access_token);
