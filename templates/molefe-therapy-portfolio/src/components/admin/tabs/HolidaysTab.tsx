import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Trash2, Calendar } from "lucide-react";

interface Holiday {
  id: string;
  date: string;
  name: string;
  is_active: boolean;
}

const HolidaysTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", name: "" });

  const { data: holidays = [] } = useQuery({
    queryKey: ["admin-holidays"],
    queryFn: async () => {
      const { data, error } = await supabase.from("public_holidays" as any).select("*").order("date");
      if (error) throw error;
      return data as any[] as Holiday[];
    },
  });

  const addHoliday = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("public_holidays" as any).insert({ date: form.date, name: form.name.trim() } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-holidays"] });
      setShowForm(false);
      setForm({ date: "", name: "" });
      toast({ title: "Holiday added" });
    },
    onError: (e: any) => toast({ title: e?.message?.includes("duplicate") ? "This date already exists" : "Failed to add", variant: "destructive" }),
  });

  const deleteHoliday = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("public_holidays" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-holidays"] });
      toast({ title: "Holiday removed" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Public Holidays</h2>
        <Button onClick={() => setShowForm(!showForm)} className="font-body gap-2" size="sm">
          <Plus className="w-4 h-4" /> Add Holiday
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="font-body">Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label className="font-body">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Heritage Day" /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => addHoliday.mutate()} disabled={!form.date || !form.name.trim()} className="font-body">Save</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="font-body">Cancel</Button>
          </div>
        </div>
      )}

      {holidays.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center"><p className="font-body text-muted-foreground">No holidays configured.</p></div>
      ) : (
        <div className="grid gap-2">
          {holidays.map((h) => (
            <div key={h.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-body font-medium text-foreground">{h.name}</p>
                <p className="font-body text-sm text-muted-foreground">{format(new Date(h.date + "T00:00:00"), "EEEE, MMMM d, yyyy")}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteHoliday.mutate(h.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HolidaysTab;
