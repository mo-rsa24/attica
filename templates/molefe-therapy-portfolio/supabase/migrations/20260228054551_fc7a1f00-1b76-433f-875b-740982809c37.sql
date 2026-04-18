
-- Add no-show tracking to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS no_show_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS no_show_fee_cents integer;

-- Communication log table
CREATE TABLE IF NOT EXISTS public.communication_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES public.patients(id),
  booking_id uuid REFERENCES public.bookings(id),
  channel text NOT NULL DEFAULT 'email',
  direction text NOT NULL DEFAULT 'outbound',
  subject text,
  body text,
  status text NOT NULL DEFAULT 'sent',
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for communication_log
ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view communication log"
  ON public.communication_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert communication log"
  ON public.communication_log FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow edge functions (service role) to insert too - anyone can insert
CREATE POLICY "Service can insert communication log"
  ON public.communication_log FOR INSERT
  WITH CHECK (true);

-- Audit trigger for communication_log
CREATE TRIGGER trg_communication_log_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.communication_log
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
