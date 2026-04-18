
-- Recurring booking series
CREATE TABLE public.booking_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  recurrence_pattern TEXT NOT NULL CHECK (recurrence_pattern IN ('weekly', 'biweekly', 'monthly', 'custom')),
  custom_interval_days INTEGER,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  series_start_date DATE NOT NULL,
  series_end_date DATE,
  total_sessions INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view series" ON public.booking_series FOR SELECT USING (true);
CREATE POLICY "Admins can insert series" ON public.booking_series FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update series" ON public.booking_series FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete series" ON public.booking_series FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Add series_id FK to bookings
ALTER TABLE public.bookings ADD COLUMN series_id UUID REFERENCES public.booking_series(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN series_index INTEGER;
