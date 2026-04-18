
-- 1. Storage bucket for patient documents
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-documents', 'patient-documents', false);

-- Storage RLS: patients can upload their own docs, admins can view all
CREATE POLICY "Patients can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patient-documents');
CREATE POLICY "Anyone can view patient documents" ON storage.objects FOR SELECT USING (bucket_id = 'patient-documents');
CREATE POLICY "Admins can delete patient documents" ON storage.objects FOR DELETE USING (bucket_id = 'patient-documents' AND has_role(auth.uid(), 'admin'));

-- 2. Patient documents metadata table
CREATE TABLE public.patient_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'id_document', 'referral', 'medical_report', 'insurance', 'other'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  notes TEXT,
  uploaded_by TEXT NOT NULL DEFAULT 'patient', -- 'patient' or 'admin'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert patient documents" ON public.patient_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view patient documents" ON public.patient_documents FOR SELECT USING (true);
CREATE POLICY "Admins can delete patient documents" ON public.patient_documents FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 3. Patient assessments table (PHQ-9, GAD-7 etc.)
CREATE TABLE public.patient_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL, -- 'phq9', 'gad7'
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_score INTEGER NOT NULL DEFAULT 0,
  severity TEXT, -- 'minimal', 'mild', 'moderate', 'moderately_severe', 'severe'
  administered_by TEXT NOT NULL DEFAULT 'self', -- 'self' or 'clinician'
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert assessments" ON public.patient_assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view assessments" ON public.patient_assessments FOR SELECT USING (true);
CREATE POLICY "Admins can update assessments" ON public.patient_assessments FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete assessments" ON public.patient_assessments FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Add audit triggers
CREATE TRIGGER trg_patient_documents_audit AFTER INSERT OR UPDATE OR DELETE ON public.patient_documents FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_patient_assessments_audit AFTER INSERT OR UPDATE OR DELETE ON public.patient_assessments FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
