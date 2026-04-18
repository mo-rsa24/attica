
ALTER TABLE public.patients ADD COLUMN verification_code TEXT;
ALTER TABLE public.patients ADD COLUMN verification_code_expires_at TIMESTAMPTZ;
