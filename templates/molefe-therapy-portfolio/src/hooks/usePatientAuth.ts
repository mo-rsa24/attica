import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PatientSession {
  userId: string;
  email: string;
  patientId: string | null;
  patientName: string | null;
  isLoading: boolean;
}

export const usePatientAuth = () => {
  const [session, setSession] = useState<PatientSession>({
    userId: "",
    email: "",
    patientId: null,
    patientName: null,
    isLoading: true,
  });

  useEffect(() => {
    const resolvePatient = async (userId: string, email: string) => {
      // Look up patient record by user_id or email
      const { data: patient } = await supabase
        .from("patients")
        .select("id, first_name, last_name, user_id")
        .or(`user_id.eq.${userId},email.eq.${email}`)
        .limit(1)
        .maybeSingle();

      if (patient) {
        // Link user_id if not already linked
        if (!patient.user_id) {
          await supabase
            .from("patients")
            .update({ user_id: userId, updated_at: new Date().toISOString() })
            .eq("id", patient.id);
        }
        setSession({
          userId,
          email,
          patientId: patient.id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          isLoading: false,
        });
      } else {
        setSession({ userId, email, patientId: null, patientName: null, isLoading: false });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      if (authSession?.user) {
        await resolvePatient(authSession.user.id, authSession.user.email || "");
      } else {
        setSession({ userId: "", email: "", patientId: null, patientName: null, isLoading: false });
      }
    });

    // Initial check
    supabase.auth.getSession().then(async ({ data: { session: authSession } }) => {
      if (authSession?.user) {
        await resolvePatient(authSession.user.id, authSession.user.email || "");
      } else {
        setSession((s) => ({ ...s, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { ...session, isLoggedIn: !!session.userId, signOut };
};
