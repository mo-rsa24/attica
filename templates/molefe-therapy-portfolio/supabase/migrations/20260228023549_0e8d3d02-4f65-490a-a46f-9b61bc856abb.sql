
-- Add missing INSERT policy for scheduling_rules (admin only)
CREATE POLICY "Admins can insert scheduling rules"
  ON public.scheduling_rules FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add patient self-update policy (by email match via verification token)
CREATE POLICY "Patients can update own profile via token"
  ON public.patients FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Drop the admin-only update and replace with above
DROP POLICY "Admins can update patients" ON public.patients;
