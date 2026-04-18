import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";

interface EmergencyContactStepProps {
  patientId: string;
  onComplete: () => void;
  onBack: () => void;
}

const EmergencyContactStep = ({ patientId, onComplete, onBack }: EmergencyContactStepProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    relationship: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Please provide contact name and phone", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("emergency_contacts" as any).insert({
      patient_id: patientId,
      name: form.name.trim(),
      relationship: form.relationship.trim() || null,
      phone: form.phone.trim(),
      is_primary: true,
    } as any);

    setLoading(false);

    if (error) {
      toast({ title: "Could not save contact. Please try again.", variant: "destructive" });
      return;
    }

    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-7 h-7 text-primary" />
        </div>
        <h4 className="font-display text-lg font-semibold text-foreground mb-1">Emergency Contact</h4>
        <p className="font-body text-sm text-muted-foreground">
          Please provide an emergency contact person.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="ec-name" className="font-body">Full Name *</Label>
          <Input
            id="ec-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            maxLength={100}
            required
          />
        </div>

        <div>
          <Label htmlFor="ec-relationship" className="font-body">Relationship</Label>
          <Input
            id="ec-relationship"
            value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
            placeholder="e.g. Spouse, Parent, Sibling"
            maxLength={50}
          />
        </div>

        <div>
          <Label htmlFor="ec-phone" className="font-body">Phone Number *</Label>
          <Input
            id="ec-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="082 000 0000"
            maxLength={20}
            required
          />
        </div>
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

export default EmergencyContactStep;
