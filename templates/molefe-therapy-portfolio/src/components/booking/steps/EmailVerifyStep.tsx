import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Mail, RefreshCw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import type { PatientData } from "../PatientOnboarding";

interface EmailVerifyStepProps {
  patient: PatientData;
  onVerified: () => void;
  onBack: () => void;
}

const EmailVerifyStep = ({ patient, onVerified, onBack }: EmailVerifyStepProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Skip if already verified
  if (patient.emailVerified) {
    onVerified();
    return null;
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({ title: "Please enter the 6-digit code", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("patients" as any)
      .select("verification_code, verification_code_expires_at")
      .eq("id", patient.id)
      .single() as any;

    if (error || !data) {
      toast({ title: "Something went wrong", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (data.verification_code !== code) {
      toast({ title: "Invalid code. Please try again.", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (data.verification_code_expires_at && new Date(data.verification_code_expires_at) < new Date()) {
      toast({ title: "Code has expired. Please request a new one.", variant: "destructive" });
      setLoading(false);
      return;
    }

    await supabase
      .from("patients" as any)
      .update({
        email_verified: true,
        verification_code: null,
        verification_code_expires_at: null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", patient.id);

    setLoading(false);
    toast({ title: "Email verified!" });
    onVerified();
  };

  const handleResend = async () => {
    setResending(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase
      .from("patients" as any)
      .update({ verification_code: newCode, verification_code_expires_at: expiresAt } as any)
      .eq("id", patient.id);

    await supabase.functions.invoke("send-verification-code", {
      body: {
        email: patient.email,
        code: newCode,
        patient_name: patient.firstName,
      },
    });

    setResending(false);
    setCode("");
    toast({ title: "New code sent!" });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <h4 className="font-display text-lg font-semibold text-foreground mb-1">Check your email</h4>
        <p className="font-body text-sm text-muted-foreground">
          We sent a 6-digit code to <strong>{patient.email}</strong>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-body text-xs text-primary underline underline-offset-4 hover:text-primary/80 transition-colors inline-flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Sending..." : "Resend code"}
        </button>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="font-body gap-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="font-body gap-1">
          {loading ? "Verifying..." : "Verify"} <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default EmailVerifyStep;
