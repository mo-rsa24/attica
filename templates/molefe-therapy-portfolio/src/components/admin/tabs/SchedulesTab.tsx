import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Clock, Coffee } from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  is_active: boolean;
}

interface Break {
  id: string;
  schedule_id: string;
  start_time: string;
  end_time: string;
  label: string | null;
}

const formatTime = (t: string) => {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${m} ${ampm}`;
};

const SchedulesTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDay, setNewDay] = useState({ day: 1, start: "08:00", end: "17:00", location: "" });
  const [addingBreak, setAddingBreak] = useState<string | null>(null);
  const [breakForm, setBreakForm] = useState({ start: "12:00", end: "13:00", label: "Lunch Break" });

  const { data: schedules = [] } = useQuery({
    queryKey: ["admin-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("practitioner_schedules" as any).select("*").order("day_of_week");
      if (error) throw error;
      return data as any[] as Schedule[];
    },
  });

  const { data: breaks = [] } = useQuery({
    queryKey: ["admin-breaks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("practitioner_breaks" as any).select("*");
      if (error) throw error;
      return data as any[] as Break[];
    },
  });

  const addSchedule = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("practitioner_schedules" as any).insert({
        day_of_week: newDay.day,
        start_time: newDay.start + ":00",
        end_time: newDay.end + ":00",
        location: newDay.location || null,
        is_active: true,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-schedules"] });
      setShowAddDay(false);
      toast({ title: "Schedule added" });
    },
    onError: () => toast({ title: "Failed to add", variant: "destructive" }),
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("practitioner_schedules" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-schedules"] });
      qc.invalidateQueries({ queryKey: ["admin-breaks"] });
      toast({ title: "Schedule removed" });
    },
  });

  const toggleSchedule = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("practitioner_schedules" as any).update({ is_active: active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-schedules"] }),
  });

  const addBreakMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase.from("practitioner_breaks" as any).insert({
        schedule_id: scheduleId,
        start_time: breakForm.start + ":00",
        end_time: breakForm.end + ":00",
        label: breakForm.label || null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-breaks"] });
      setAddingBreak(null);
      toast({ title: "Break added" });
    },
  });

  const deleteBreak = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("practitioner_breaks" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-breaks"] });
      toast({ title: "Break removed" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Weekly Schedule</h2>
        <Button onClick={() => setShowAddDay(!showAddDay)} className="font-body gap-2" size="sm">
          <Plus className="w-4 h-4" /> Add Day
        </Button>
      </div>

      {showAddDay && (
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-body">Day</Label>
              <select value={newDay.day} onChange={(e) => setNewDay({ ...newDay, day: parseInt(e.target.value) })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body">
                {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div><Label className="font-body">Location</Label><Input value={newDay.location} onChange={(e) => setNewDay({ ...newDay, location: e.target.value })} placeholder="e.g. Vanderbijlpark Office" /></div>
            <div><Label className="font-body">Start</Label><Input type="time" value={newDay.start} onChange={(e) => setNewDay({ ...newDay, start: e.target.value })} /></div>
            <div><Label className="font-body">End</Label><Input type="time" value={newDay.end} onChange={(e) => setNewDay({ ...newDay, end: e.target.value })} /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => addSchedule.mutate()} className="font-body">Save</Button>
            <Button variant="outline" onClick={() => setShowAddDay(false)} className="font-body">Cancel</Button>
          </div>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center"><p className="font-body text-muted-foreground">No schedules configured.</p></div>
      ) : (
        <div className="grid gap-4">
          {schedules.map((s) => {
            const dayBreaks = breaks.filter((b) => b.schedule_id === s.id);
            return (
              <div key={s.id} className={`bg-card rounded-xl border p-5 ${!s.is_active ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-body font-semibold text-foreground">{DAY_NAMES[s.day_of_week]}</p>
                    <p className="font-body text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> {formatTime(s.start_time)} – {formatTime(s.end_time)}
                      {s.location && <span>· {s.location}</span>}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleSchedule.mutate({ id: s.id, active: !s.is_active })} className="font-body text-xs">
                      {s.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteSchedule.mutate(s.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>

                {/* Breaks */}
                <div className="ml-4 space-y-2">
                  {dayBreaks.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 font-body text-sm text-muted-foreground">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>{formatTime(b.start_time)} – {formatTime(b.end_time)}</span>
                      {b.label && <span className="text-xs">({b.label})</span>}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteBreak.mutate(b.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  ))}
                  {addingBreak === s.id ? (
                    <div className="flex items-end gap-2 mt-2">
                      <div><Label className="font-body text-xs">Start</Label><Input type="time" value={breakForm.start} onChange={(e) => setBreakForm({ ...breakForm, start: e.target.value })} className="h-8 text-sm" /></div>
                      <div><Label className="font-body text-xs">End</Label><Input type="time" value={breakForm.end} onChange={(e) => setBreakForm({ ...breakForm, end: e.target.value })} className="h-8 text-sm" /></div>
                      <div><Label className="font-body text-xs">Label</Label><Input value={breakForm.label} onChange={(e) => setBreakForm({ ...breakForm, label: e.target.value })} className="h-8 text-sm" placeholder="Lunch" /></div>
                      <Button size="sm" onClick={() => addBreakMutation.mutate(s.id)} className="font-body h-8">Add</Button>
                      <Button size="sm" variant="outline" onClick={() => setAddingBreak(null)} className="font-body h-8">×</Button>
                    </div>
                  ) : (
                    <button onClick={() => { setAddingBreak(s.id); setBreakForm({ start: "12:00", end: "13:00", label: "Lunch Break" }); }} className="font-body text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                      <Plus className="w-3 h-3" /> Add break
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchedulesTab;
