import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Clock, Trash2, Bell } from "lucide-react";

const WaitlistTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "notified") updates.notified_at = new Date().toISOString();
      const { error } = await supabase.from("waitlist" as any).update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-waitlist"] });
      toast({ title: "Waitlist updated" });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("waitlist" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-waitlist"] });
      toast({ title: "Entry removed" });
    },
  });

  const waiting = entries.filter((e) => e.status === "waiting");
  const other = entries.filter((e) => e.status !== "waiting");

  const statusColor = (s: string) => {
    if (s === "waiting") return "default";
    if (s === "notified") return "secondary";
    if (s === "booked") return "default";
    return "outline";
  };

  const renderEntry = (e: any) => (
    <div key={e.id} className="bg-card rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-body font-semibold text-foreground">{e.patient_name}</p>
          <Badge variant={statusColor(e.status)} className="font-body text-xs capitalize">{e.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-body text-sm text-muted-foreground">
          <span>Preferred: {format(new Date(e.preferred_date + "T00:00:00"), "EEE, MMM d, yyyy")}</span>
          {e.preferred_time_start && e.preferred_time_end && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {e.preferred_time_start?.slice(0, 5)} – {e.preferred_time_end?.slice(0, 5)}
            </span>
          )}
          <span>{e.service_type}</span>
        </div>
        <p className="font-body text-xs text-muted-foreground">{e.patient_email} · {e.patient_phone}</p>
        {e.notes && <p className="font-body text-xs text-muted-foreground italic">"{e.notes}"</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        {e.status === "waiting" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateStatus.mutate({ id: e.id, status: "notified" })}
            className="font-body gap-1"
          >
            <Bell className="w-3.5 h-3.5" /> Notify
          </Button>
        )}
        {e.status === "notified" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateStatus.mutate({ id: e.id, status: "booked" })}
            className="font-body gap-1"
          >
            Mark Booked
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => deleteEntry.mutate(e.id)}
          className="font-body text-destructive hover:text-destructive gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Active Waitlist</h2>
        {waiting.length === 0 ? (
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="font-body text-muted-foreground">No one on the waitlist</p>
          </div>
        ) : (
          <div className="grid gap-3">{waiting.map(renderEntry)}</div>
        )}
      </div>

      {other.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-muted-foreground mb-4">Notified & Booked</h2>
          <div className="grid gap-2">{other.map(renderEntry)}</div>
        </div>
      )}
    </div>
  );
};

export default WaitlistTab;
