import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Trash2, Ban, X } from "lucide-react";

const formatTimeDisplay = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

const AvailabilityTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", isFullDay: true, startTime: "08:00", endTime: "17:00", reason: "" });

  const { data: blocks = [] } = useQuery({
    queryKey: ["admin-blocks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("availability_blocks").select("*").order("block_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addBlock = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("availability_blocks").insert({
        block_date: form.date,
        is_full_day: form.isFullDay,
        start_time: form.isFullDay ? null : form.startTime + ":00",
        end_time: form.isFullDay ? null : form.endTime + ":00",
        reason: form.reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blocks"] });
      setShowForm(false);
      setForm({ date: "", isFullDay: true, startTime: "08:00", endTime: "17:00", reason: "" });
      toast({ title: "Time blocked successfully" });
    },
    onError: () => toast({ title: "Failed to block time", variant: "destructive" }),
  });

  const deleteBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("availability_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blocks"] });
      toast({ title: "Block removed" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Blocked Times</h2>
        <Button onClick={() => setShowForm(!showForm)} className="font-body gap-2" size="sm">
          <Plus className="w-4 h-4" /> Block Time
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h3 className="font-display text-base font-semibold text-foreground">Block Off Time</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-body">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label className="font-body">Reason (optional)</Label>
              <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Holiday" />
            </div>
          </div>
          <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
            <input type="checkbox" checked={form.isFullDay} onChange={(e) => setForm({ ...form, isFullDay: e.target.checked })} className="rounded" />
            Full day
          </label>
          {!form.isFullDay && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="font-body">Start</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              <div><Label className="font-body">End</Label><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={() => addBlock.mutate()} disabled={!form.date} className="font-body">Save</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="font-body">Cancel</Button>
          </div>
        </div>
      )}

      {blocks.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="font-body text-muted-foreground">No blocked times.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {blocks.map((b) => (
            <div key={b.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-body font-medium text-foreground">{format(new Date(b.block_date + "T00:00:00"), "EEEE, MMMM d, yyyy")}</p>
                <p className="font-body text-sm text-muted-foreground">
                  {b.is_full_day ? "Full day" : `${formatTimeDisplay(b.start_time!)} – ${formatTimeDisplay(b.end_time!)}`}
                  {b.reason && ` · ${b.reason}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteBlock.mutate(b.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityTab;
