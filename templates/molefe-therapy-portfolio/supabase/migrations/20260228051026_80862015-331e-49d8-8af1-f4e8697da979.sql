
-- 1. Audit log table for tracking all significant changes
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text
);

-- 2. Session notes version history (immutable snapshots)
CREATE TABLE public.session_notes_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_note_id uuid NOT NULL REFERENCES public.session_notes(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  outcome text,
  clinical_notes text,
  treatment_plan text,
  mood_rating integer,
  risk_level text,
  follow_up_recommended boolean,
  follow_up_notes text,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_reason text
);

-- Index for fast lookups
CREATE INDEX idx_audit_log_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON public.audit_log(changed_at DESC);
CREATE INDEX idx_session_notes_history_note ON public.session_notes_history(session_note_id, version_number DESC);

-- 3. Trigger function: log changes to audit_log for key tables
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 4. Trigger function: snapshot session_notes before update
CREATE OR REPLACE FUNCTION public.fn_session_notes_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version integer;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM public.session_notes_history
  WHERE session_note_id = OLD.id;

  INSERT INTO public.session_notes_history (
    session_note_id, booking_id, version_number,
    outcome, clinical_notes, treatment_plan,
    mood_rating, risk_level, follow_up_recommended, follow_up_notes,
    changed_by
  ) VALUES (
    OLD.id, OLD.booking_id, next_version,
    OLD.outcome, OLD.clinical_notes, OLD.treatment_plan,
    OLD.mood_rating, OLD.risk_level, OLD.follow_up_recommended, OLD.follow_up_notes,
    auth.uid()
  );
  RETURN NEW;
END;
$$;

-- 5. Attach audit triggers to key tables
CREATE TRIGGER trg_audit_bookings
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_session_notes
  AFTER INSERT OR UPDATE OR DELETE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_booking_series
  AFTER INSERT OR UPDATE OR DELETE ON public.booking_series
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- 6. Version snapshot trigger on session_notes (BEFORE UPDATE only)
CREATE TRIGGER trg_version_session_notes
  BEFORE UPDATE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.fn_session_notes_version();

-- 7. RLS on audit_log (admin read-only, system writes via SECURITY DEFINER)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. RLS on session_notes_history (admin read-only)
ALTER TABLE public.session_notes_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view note history"
  ON public.session_notes_history FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
