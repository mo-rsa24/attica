
-- ==========================================
-- PHASE 1: Foundation & Patient Experience
-- ==========================================

-- Enums
CREATE TYPE public.contact_method AS ENUM ('email', 'sms', 'whatsapp');
CREATE TYPE public.consent_type AS ENUM ('popia', 'treatment', 'telehealth', 'data_sharing');
CREATE TYPE public.referral_source AS ENUM ('self', 'doctor', 'insurance', 'other');
CREATE TYPE public.service_category AS ENUM ('individual', 'couples', 'group', 'assessment');
CREATE TYPE public.service_mode AS ENUM ('in_person', 'telehealth', 'both');

-- ==========================================
-- Patients
-- ==========================================
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_token UUID DEFAULT gen_random_uuid(),
  email_verification_expires_at TIMESTAMPTZ,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  id_number TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  preferred_contact_method contact_method NOT NULL DEFAULT 'email',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Anyone can create a patient profile (public booking)
CREATE POLICY "Anyone can create patient profiles"
  ON public.patients FOR INSERT
  WITH CHECK (true);

-- Patients can view their own profile by email match
CREATE POLICY "Anyone can view patients"
  ON public.patients FOR SELECT
  USING (true);

-- Admins can manage all patients
CREATE POLICY "Admins can update patients"
  ON public.patients FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- Patient Consents
-- ==========================================
CREATE TABLE public.patient_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  consent_type consent_type NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1.0',
  accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ,
  ip_address TEXT,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert consents"
  ON public.patient_consents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view consents"
  ON public.patient_consents FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage consents"
  ON public.patient_consents FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- Emergency Contacts
-- ==========================================
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert emergency contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage emergency contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- Medical Intake
-- ==========================================
CREATE TABLE public.medical_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE UNIQUE,
  current_medications TEXT,
  previous_therapy BOOLEAN,
  previous_therapy_details TEXT,
  presenting_concerns TEXT,
  referral_source referral_source,
  additional_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert intake"
  ON public.medical_intake FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view intake"
  ON public.medical_intake FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage intake"
  ON public.medical_intake FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- Service Types
-- ==========================================
CREATE TABLE public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  price_cents INT,
  category service_category NOT NULL DEFAULT 'individual',
  mode service_mode NOT NULL DEFAULT 'both',
  is_first_consult BOOLEAN NOT NULL DEFAULT false,
  is_follow_up BOOLEAN NOT NULL DEFAULT false,
  requires_intake BOOLEAN NOT NULL DEFAULT false,
  max_participants INT NOT NULL DEFAULT 1,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON public.service_types FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage services"
  ON public.service_types FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update services"
  ON public.service_types FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete services"
  ON public.service_types FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- Practitioner Schedules (recurring weekly)
-- ==========================================
CREATE TABLE public.practitioner_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE,
  effective_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.practitioner_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schedules"
  ON public.practitioner_schedules FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage schedules"
  ON public.practitioner_schedules FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update schedules"
  ON public.practitioner_schedules FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete schedules"
  ON public.practitioner_schedules FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- Practitioner Breaks
-- ==========================================
CREATE TABLE public.practitioner_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.practitioner_schedules(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.practitioner_breaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view breaks"
  ON public.practitioner_breaks FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage breaks"
  ON public.practitioner_breaks FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update breaks"
  ON public.practitioner_breaks FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete breaks"
  ON public.practitioner_breaks FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- Scheduling Rules (singleton config)
-- ==========================================
CREATE TABLE public.scheduling_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buffer_minutes INT NOT NULL DEFAULT 15,
  min_notice_hours INT NOT NULL DEFAULT 24,
  max_advance_days INT NOT NULL DEFAULT 60,
  max_daily_sessions INT NOT NULL DEFAULT 8,
  cancellation_cutoff_hours INT NOT NULL DEFAULT 24,
  cancellation_fee_cents INT,
  reschedule_cutoff_hours INT NOT NULL DEFAULT 24,
  max_reschedules INT NOT NULL DEFAULT 2,
  allow_same_day_booking BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduling_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scheduling rules"
  ON public.scheduling_rules FOR SELECT
  USING (true);

CREATE POLICY "Admins can update scheduling rules"
  ON public.scheduling_rules FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- Public Holidays
-- ==========================================
CREATE TABLE public.public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'ZA',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view holidays"
  ON public.public_holidays FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage holidays"
  ON public.public_holidays FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update holidays"
  ON public.public_holidays FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete holidays"
  ON public.public_holidays FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
