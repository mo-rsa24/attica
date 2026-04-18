import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Clock, MapPin, Video, Users } from "lucide-react";

interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number | null;
  category: string;
  mode: string;
  is_first_consult: boolean;
  is_follow_up: boolean;
  requires_intake: boolean;
  max_participants: number;
  is_active: boolean;
  sort_order: number;
}

const CATEGORIES = ["individual", "couples", "group", "assessment"];
const MODES = ["in_person", "telehealth", "both"];

const ServicesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ServiceType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", duration_minutes: 60, price_cents: "",
    category: "individual", mode: "both", is_first_consult: false,
    is_follow_up: false, requires_intake: false, max_participants: 1, sort_order: 0,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_types" as any).select("*").order("sort_order");
      if (error) throw error;
      return data as any[] as ServiceType[];
    },
  });

  const resetForm = () => {
    setForm({ name: "", description: "", duration_minutes: 60, price_cents: "", category: "individual", mode: "both", is_first_consult: false, is_follow_up: false, requires_intake: false, max_participants: 1, sort_order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (s: ServiceType) => {
    setForm({
      name: s.name, description: s.description || "", duration_minutes: s.duration_minutes,
      price_cents: s.price_cents ? String(s.price_cents / 100) : "",
      category: s.category, mode: s.mode, is_first_consult: s.is_first_consult,
      is_follow_up: s.is_follow_up, requires_intake: s.requires_intake,
      max_participants: s.max_participants, sort_order: s.sort_order,
    });
    setEditing(s);
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        duration_minutes: form.duration_minutes,
        price_cents: form.price_cents ? Math.round(parseFloat(form.price_cents) * 100) : null,
        category: form.category,
        mode: form.mode,
        is_first_consult: form.is_first_consult,
        is_follow_up: form.is_follow_up,
        requires_intake: form.requires_intake,
        max_participants: form.max_participants,
        sort_order: form.sort_order,
      };
      if (editing) {
        const { error } = await supabase.from("service_types" as any).update(payload as any).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("service_types" as any).insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast({ title: editing ? "Service updated" : "Service created" });
      resetForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_types" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast({ title: "Service deleted" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("service_types" as any).update({ is_active: active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-services"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Service Types</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="font-body gap-2" size="sm">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">{editing ? "Edit Service" : "New Service"}</h3>
            <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="font-body">Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Individual Therapy" /></div>
            <div><Label className="font-body">Duration (min) *</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })} /></div>
            <div><Label className="font-body">Price (ZAR, optional)</Label><Input type="number" step="0.01" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: e.target.value })} placeholder="e.g. 1200.00" /></div>
            <div>
              <Label className="font-body">Category</Label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <Label className="font-body">Mode</Label>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body">
                {MODES.map((m) => <option key={m} value={m}>{m === "in_person" ? "In-Person" : m === "telehealth" ? "Online" : "Both"}</option>)}
              </select>
            </div>
            <div><Label className="font-body">Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div><Label className="font-body">Description</Label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} maxLength={500} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body" placeholder="Brief description..." /></div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 font-body text-sm cursor-pointer"><input type="checkbox" checked={form.is_first_consult} onChange={(e) => setForm({ ...form, is_first_consult: e.target.checked })} className="rounded" />First consultation</label>
            <label className="flex items-center gap-2 font-body text-sm cursor-pointer"><input type="checkbox" checked={form.is_follow_up} onChange={(e) => setForm({ ...form, is_follow_up: e.target.checked })} className="rounded" />Follow-up</label>
            <label className="flex items-center gap-2 font-body text-sm cursor-pointer"><input type="checkbox" checked={form.requires_intake} onChange={(e) => setForm({ ...form, requires_intake: e.target.checked })} className="rounded" />Requires intake</label>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate()} disabled={!form.name.trim()} className="font-body">Save</Button>
            <Button variant="outline" onClick={resetForm} className="font-body">Cancel</Button>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center"><p className="font-body text-muted-foreground">No services configured.</p></div>
      ) : (
        <div className="grid gap-3">
          {services.map((s) => (
            <div key={s.id} className={`bg-card rounded-xl border p-4 flex items-center gap-4 ${!s.is_active ? "opacity-50" : ""}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-body font-medium text-foreground">{s.name}</p>
                  {!s.is_active && <span className="font-body text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Inactive</span>}
                </div>
                <div className="flex flex-wrap gap-3 font-body text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration_minutes}min</span>
                  <span>{s.mode === "in_person" ? "In-Person" : s.mode === "telehealth" ? "Online" : "Both"}</span>
                  <span>{s.category}</span>
                  {s.price_cents && <span>R{(s.price_cents / 100).toFixed(2)}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => toggleActive.mutate({ id: s.id, active: !s.is_active })} className="font-body text-xs">
                  {s.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => startEdit(s)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesTab;
