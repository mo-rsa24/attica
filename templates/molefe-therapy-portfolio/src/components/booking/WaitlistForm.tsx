import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, Bell, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(1, "Phone is required").max(20),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  notes: z.string().trim().max(500).optional(),
});

interface WaitlistFormProps {
  selectedDate: Date;
  serviceType: string;
}

const WaitlistForm = ({ selectedDate, serviceType }: WaitlistFormProps) => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    timeStart: "",
    timeEnd: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = waitlistSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("waitlist" as any).insert({
      patient_name: result.data.name,
      patient_email: result.data.email,
      patient_phone: result.data.phone,
      preferred_date: format(selectedDate, "yyyy-MM-dd"),
      preferred_time_start: result.data.timeStart || null,
      preferred_time_end: result.data.timeEnd || null,
      service_type: serviceType,
      notes: result.data.notes || null,
    } as any);
    setLoading(false);

    if (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
    toast({ title: "You've been added to the waitlist!" });
  };

  if (submitted) {
    return (
      <div className="text-center py-6 space-y-3">
        <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
        <p className="font-body font-semibold text-foreground">You're on the waitlist!</p>
        <p className="font-body text-sm text-muted-foreground">
          We'll notify you at <span className="font-medium">{form.email}</span> if a slot opens up on{" "}
          {format(selectedDate, "MMMM d, yyyy")}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-4 h-4 text-primary" />
        <h4 className="font-display text-sm font-semibold text-foreground">Join the Waitlist</h4>
      </div>
      <p className="font-body text-xs text-muted-foreground">
        Get notified if a slot opens up on {format(selectedDate, "EEEE, MMMM d")}.
      </p>

      <div>
        <Label className="font-body text-xs">Full Name *</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. John Doe"
          maxLength={100}
          className="font-body"
        />
        {errors.name && <p className="font-body text-xs text-destructive mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label className="font-body text-xs">Email *</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="john@example.com"
          maxLength={255}
          className="font-body"
        />
        {errors.email && <p className="font-body text-xs text-destructive mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label className="font-body text-xs">Phone *</Label>
        <Input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="082 000 0000"
          maxLength={20}
          className="font-body"
        />
        {errors.phone && <p className="font-body text-xs text-destructive mt-1">{errors.phone}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="font-body text-xs">Preferred Start</Label>
          <Input
            type="time"
            value={form.timeStart}
            onChange={(e) => setForm({ ...form, timeStart: e.target.value })}
            className="font-body"
          />
        </div>
        <div>
          <Label className="font-body text-xs">Preferred End</Label>
          <Input
            type="time"
            value={form.timeEnd}
            onChange={(e) => setForm({ ...form, timeEnd: e.target.value })}
            className="font-body"
          />
        </div>
      </div>

      <div>
        <Label className="font-body text-xs">Notes (optional)</Label>
        <Input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any preferences..."
          maxLength={500}
          className="font-body"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full font-body">
        {loading ? "Joining..." : "Join Waitlist"}
      </Button>
    </form>
  );
};

export default WaitlistForm;
