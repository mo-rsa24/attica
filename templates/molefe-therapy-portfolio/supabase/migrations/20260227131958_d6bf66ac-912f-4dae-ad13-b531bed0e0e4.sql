-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public booking form)
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Anyone can read bookings (needed to show blocked slots)
CREATE POLICY "Anyone can view booking slots" ON public.bookings
  FOR SELECT USING (true);

-- Create index for fast date lookups
CREATE INDEX idx_bookings_date ON public.bookings (appointment_date);

-- Create a function to check for overlapping bookings
CREATE OR REPLACE FUNCTION public.check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE appointment_date = NEW.appointment_date
      AND status != 'cancelled'
      AND id != COALESCE(NEW.id, gen_random_uuid())
      AND (
        (NEW.start_time, NEW.start_time + (NEW.duration_minutes || ' minutes')::interval)
        OVERLAPS
        (start_time, start_time + (duration_minutes || ' minutes')::interval)
      )
  ) THEN
    RAISE EXCEPTION 'This time slot overlaps with an existing booking';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_booking_overlap_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_booking_overlap();