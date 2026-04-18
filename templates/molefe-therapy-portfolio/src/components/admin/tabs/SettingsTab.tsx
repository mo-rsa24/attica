import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

interface Rules {
  id: string;
  buffer_minutes: number;
  min_notice_hours: number;
  max_advance_days: number;
  max_daily_sessions: number;
  cancellation_cutoff_hours: number;
  cancellation_fee_cents: number | null;
  reschedule_cutoff_hours: number;
  max_reschedules: number;
  allow_same_day_booking: boolean;
}

const SettingsTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: rules } = useQuery({
    queryKey: ["admin-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("scheduling_rules" as any).select("*").limit(1).single();
      if (error) throw error;
      return data as any as Rules;
    },
  });

  const [form, setForm] = useState<Partial<Rules>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (rules) {
      setForm(rules);
      setDirty(false);
    }
  }, [rules]);

  const update = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
    setDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!rules?.id) return;
      const { error } = await supabase.from("scheduling_rules" as any).update({
        buffer_minutes: form.buffer_minutes,
        min_notice_hours: form.min_notice_hours,
        max_advance_days: form.max_advance_days,
        max_daily_sessions: form.max_daily_sessions,
        cancellation_cutoff_hours: form.cancellation_cutoff_hours,
        cancellation_fee_cents: form.cancellation_fee_cents,
        reschedule_cutoff_hours: form.reschedule_cutoff_hours,
        max_reschedules: form.max_reschedules,
        allow_same_day_booking: form.allow_same_day_booking,
        updated_at: new Date().toISOString(),
      } as any).eq("id", rules.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rules"] });
      toast({ title: "Settings saved" });
      setDirty(false);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  if (!rules) return <div className="text-center p-8"><p className="font-body text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Scheduling Rules</h2>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <Label className="font-body">Buffer Between Appointments (min)</Label>
            <Input type="number" value={form.buffer_minutes || 0} onChange={(e) => update("buffer_minutes", parseInt(e.target.value) || 0)} />
            <p className="font-body text-xs text-muted-foreground mt-1">Time gap between consecutive appointments</p>
          </div>
          <div>
            <Label className="font-body">Minimum Notice (hours)</Label>
            <Input type="number" value={form.min_notice_hours || 0} onChange={(e) => update("min_notice_hours", parseInt(e.target.value) || 0)} />
            <p className="font-body text-xs text-muted-foreground mt-1">How far in advance patients must book</p>
          </div>
          <div>
            <Label className="font-body">Max Advance Booking (days)</Label>
            <Input type="number" value={form.max_advance_days || 0} onChange={(e) => update("max_advance_days", parseInt(e.target.value) || 0)} />
            <p className="font-body text-xs text-muted-foreground mt-1">How far ahead patients can book</p>
          </div>
          <div>
            <Label className="font-body">Max Daily Sessions</Label>
            <Input type="number" value={form.max_daily_sessions || 0} onChange={(e) => update("max_daily_sessions", parseInt(e.target.value) || 0)} />
            <p className="font-body text-xs text-muted-foreground mt-1">Maximum appointments per day</p>
          </div>
          <div>
            <Label className="font-body">Cancellation Cutoff (hours)</Label>
            <Input type="number" value={form.cancellation_cutoff_hours || 0} onChange={(e) => update("cancellation_cutoff_hours", parseInt(e.target.value) || 0)} />
            <p className="font-body text-xs text-muted-foreground mt-1">Minimum notice for cancellations</p>
          </div>
          <div>
            <Label className="font-body">Reschedule Cutoff (hours)</Label>
            <Input type="number" value={form.reschedule_cutoff_hours || 0} onChange={(e) => update("reschedule_cutoff_hours", parseInt(e.target.value) || 0)} />
            <p className="font-body text-xs text-muted-foreground mt-1">Minimum notice for rescheduling</p>
          </div>
          <div>
            <Label className="font-body">Max Reschedules per Appointment</Label>
            <Input type="number" value={form.max_reschedules || 0} onChange={(e) => update("max_reschedules", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="font-body">Cancellation Fee (ZAR, optional)</Label>
            <Input type="number" step="0.01" value={form.cancellation_fee_cents ? form.cancellation_fee_cents / 100 : ""} onChange={(e) => update("cancellation_fee_cents", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} placeholder="e.g. 250.00" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
            <input type="checkbox" checked={!!form.allow_same_day_booking} onChange={(e) => update("allow_same_day_booking", e.target.checked)} className="rounded" />
            Allow same-day bookings
          </label>
        </div>

        <Button onClick={() => saveMutation.mutate()} disabled={!dirty} className="font-body">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
