import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";

interface ConsentStepProps {
  patientId: string;
  onComplete: () => void;
  onBack: () => void;
}

const CONSENTS = [
  {
    type: "popia" as const,
    title: "POPIA Compliance",
    description:
      "I consent to the collection, processing, and storage of my personal information in accordance with the Protection of Personal Information Act (POPIA). I understand that my data will only be used for the purpose of providing psychological services and will be stored securely.",
  },
  {
    type: "treatment" as const,
    title: "Informed Consent for Treatment",
    description:
      "I understand and consent to receive psychological services from Dr. Matilda Molefe. I understand the nature of therapy, including its benefits, risks, and limitations. I acknowledge my right to withdraw consent at any time.",
  },
];

const ConsentStep = ({ patientId, onComplete, onBack }: ConsentStepProps) => {
  const { toast } = useToast();
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const allAccepted = CONSENTS.every((c) => accepted[c.type]);

  const handleSubmit = async () => {
    if (!allAccepted) {
      toast({ title: "Please accept all consent forms", variant: "destructive" });
      return;
    }

    setLoading(true);

    const inserts = CONSENTS.map((c) => ({
      patient_id: patientId,
      consent_type: c.type,
      accepted: true,
      accepted_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("patient_consents" as any).insert(inserts as any);

    setLoading(false);

    if (error) {
      toast({ title: "Could not save consent. Please try again.", variant: "destructive" });
      return;
    }

    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <h4 className="font-display text-lg font-semibold text-foreground mb-1">Consent & Privacy</h4>
        <p className="font-body text-sm text-muted-foreground">
          Please review and accept the following before proceeding.
        </p>
      </div>

      <div className="space-y-4">
        {CONSENTS.map((consent) => (
          <div key={consent.type} className="border rounded-lg p-4 bg-background">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!accepted[consent.type]}
                onChange={(e) => setAccepted({ ...accepted, [consent.type]: e.target.checked })}
                className="mt-1 rounded border-input"
              />
              <div>
                <p className="font-body font-semibold text-sm text-foreground mb-1">{consent.title}</p>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{consent.description}</p>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="font-body gap-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleSubmit} disabled={!allAccepted || loading} className="font-body gap-1">
          {loading ? "Saving..." : "Continue"} <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ConsentStep;
