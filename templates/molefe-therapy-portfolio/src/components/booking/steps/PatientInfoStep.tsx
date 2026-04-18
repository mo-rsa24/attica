import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PatientData } from "../PatientOnboarding";

interface PatientInfoStepProps {
  onComplete: (patient: PatientData) => void;
  onBack: () => void;
}

const PatientInfoStep = ({ onComplete, onBack }: PatientInfoStepProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data: existing } = await supabase
      .from("patients" as any)
      .select("id, email_verified")
      .eq("email", form.email.trim().toLowerCase())
      .maybeSingle() as any;

    let patientId: string;
    let emailVerified = false;

    if (existing) {
      patientId = existing.id;
      emailVerified = existing.email_verified;

      await supabase
        .from("patients" as any)
        .update({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          phone: form.phone.trim(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", patientId);
    } else {
      // Create new patient
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { data: newPatient, error } = await (supabase
        .from("patients" as any)
        .insert({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          verification_code: code,
          verification_code_expires_at: expiresAt,
        } as any) as any)
        .select("id")
        .single();

      if (error) {
        toast({ title: "Could not create profile. Please try again.", variant: "destructive" });
        setLoading(false);
        return;
      }

      patientId = newPatient.id;

      // Send verification email
      await supabase.functions.invoke("send-verification-code", {
        body: {
          email: form.email.trim().toLowerCase(),
          code,
          patient_name: form.firstName.trim(),
        },
      });
    }

    setLoading(false);

    // If already verified from a previous visit, skip verification
    if (emailVerified) {
      onComplete({
        id: patientId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        emailVerified: true,
      });
    } else {
      // Need to send code if existing but not verified
      if (existing && !emailVerified) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        await supabase
          .from("patients" as any)
          .update({ verification_code: code, verification_code_expires_at: expiresAt } as any)
          .eq("id", patientId);
        await supabase.functions.invoke("send-verification-code", {
          body: {
            email: form.email.trim().toLowerCase(),
            code,
            patient_name: form.firstName.trim(),
          },
        });
      }

      onComplete({
        id: patientId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        emailVerified: false,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="font-body">First Name *</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            placeholder="Matilda"
            maxLength={50}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="font-body">Last Name *</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            placeholder="Molefe"
            maxLength={50}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="font-body">Email *</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="your@email.com"
          maxLength={255}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone" className="font-body">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="082 000 0000"
          maxLength={20}
          required
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="font-body gap-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button type="submit" disabled={loading} className="font-body gap-1">
          {loading ? "Saving..." : "Continue"} <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};

export default PatientInfoStep;
