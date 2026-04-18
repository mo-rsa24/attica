import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";

interface IntakeStepProps {
  patientId: string;
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const IntakeStep = ({ patientId, onComplete, onSkip, onBack }: IntakeStepProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    currentMedications: "",
    previousTherapy: false,
    previousTherapyDetails: "",
    presentingConcerns: "",
    referralSource: "" as string,
    additionalNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("medical_intake" as any).insert({
      patient_id: patientId,
      current_medications: form.currentMedications.trim() || null,
      previous_therapy: form.previousTherapy,
      previous_therapy_details: form.previousTherapyDetails.trim() || null,
      presenting_concerns: form.presentingConcerns.trim() || null,
      referral_source: form.referralSource || null,
      additional_notes: form.additionalNotes.trim() || null,
      completed_at: new Date().toISOString(),
    } as any);

    setLoading(false);

    if (error) {
      toast({ title: "Could not save intake form. Please try again.", variant: "destructive" });
      return;
    }

    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-7 h-7 text-primary" />
        </div>
        <h4 className="font-display text-lg font-semibold text-foreground mb-1">Medical Intake</h4>
        <p className="font-body text-sm text-muted-foreground">
          This helps Dr. Molefe prepare for your session. You may skip this step.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="font-body">What brings you to therapy?</Label>
          <textarea
            value={form.presentingConcerns}
            onChange={(e) => setForm({ ...form, presentingConcerns: e.target.value })}
            placeholder="Briefly describe your main concerns..."
            maxLength={1000}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body mt-1"
          />
        </div>

        <div>
          <Label className="font-body">Current Medications</Label>
          <textarea
            value={form.currentMedications}
            onChange={(e) => setForm({ ...form, currentMedications: e.target.value })}
            placeholder="List any medications you're currently taking..."
            maxLength={500}
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body mt-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.previousTherapy}
              onChange={(e) => setForm({ ...form, previousTherapy: e.target.checked })}
              className="rounded border-input"
            />
            I have received therapy before
          </label>
        </div>

        {form.previousTherapy && (
          <div>
            <Label className="font-body">Previous Therapy Details</Label>
            <textarea
              value={form.previousTherapyDetails}
              onChange={(e) => setForm({ ...form, previousTherapyDetails: e.target.value })}
              placeholder="When and what type of therapy..."
              maxLength={500}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body mt-1"
            />
          </div>
        )}

        <div>
          <Label className="font-body">How did you hear about us?</Label>
          <select
            value={form.referralSource}
            onChange={(e) => setForm({ ...form, referralSource: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body mt-1"
          >
            <option value="">Select...</option>
            <option value="self">Self / Internet Search</option>
            <option value="doctor">Doctor Referral</option>
            <option value="insurance">Medical Aid / Insurance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <Label className="font-body">Anything else you'd like to share?</Label>
          <textarea
            value={form.additionalNotes}
            onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
            placeholder="Any additional information..."
            maxLength={1000}
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body mt-1"
          />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="font-body gap-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onSkip} className="font-body">
            Skip
          </Button>
          <Button type="submit" disabled={loading} className="font-body gap-1">
            {loading ? "Saving..." : "Complete Booking"} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default IntakeStep;
