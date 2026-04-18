
-- 1. Add lifecycle columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS reschedule_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rescheduled_from_id uuid REFERENCES public.bookings(id),
  ADD COLUMN IF NOT EXISTS patient_id uuid REFERENCES public.patients(id),
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- Update default status to 'requested' for new bookings
ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'requested';

-- 2. Create slot_locks table for checkout locking
CREATE TABLE public.slot_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  locked_by text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.slot_locks ENABLE ROW LEVEL SECURITY;

-- Anyone can view locks (needed to check availability)
CREATE POLICY "Anyone can view slot locks" ON public.slot_locks FOR SELECT USING (true);
-- Anyone can create locks (unauthenticated patients)
CREATE POLICY "Anyone can insert slot locks" ON public.slot_locks FOR INSERT WITH CHECK (true);
-- Anyone can delete expired locks
CREATE POLICY "Anyone can delete slot locks" ON public.slot_locks FOR DELETE USING (true);
-- Anyone can update their own locks
CREATE POLICY "Anyone can update slot locks" ON public.slot_locks FOR UPDATE USING (true);

-- 3. Create waitlist table
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_phone text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time_start time,
  preferred_time_end time,
  service_type text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view waitlist" ON public.waitlist FOR SELECT USING (true);
CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update waitlist" ON public.waitlist FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete waitlist" ON public.waitlist FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 4. Create function to clean expired locks
CREATE OR REPLACE FUNCTION public.cleanup_expired_locks()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.slot_locks WHERE expires_at < now();
$$;
