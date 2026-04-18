
-- Session notes / clinical outcome tracking
CREATE TABLE public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  outcome TEXT CHECK (outcome IN ('completed', 'partial', 'no_progress', 'crisis', 'discharged')),
  clinical_notes TEXT,
  treatment_plan TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  risk_level TEXT CHECK (risk_level IN ('none', 'low', 'moderate', 'high', 'critical')),
  follow_up_recommended BOOLEAN DEFAULT true,
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage session notes (sensitive clinical data)
CREATE POLICY "Admins can view session notes" ON public.session_notes FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert session notes" ON public.session_notes FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update session notes" ON public.session_notes FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete session notes" ON public.session_notes FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
