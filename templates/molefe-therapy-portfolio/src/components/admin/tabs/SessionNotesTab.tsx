import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
} from "lucide-react";

const OUTCOMES = [
  { value: "completed", label: "Completed", color: "default" as const },
  { value: "partial", label: "Partial Progress", color: "secondary" as const },
  { value: "no_progress", label: "No Progress", color: "outline" as const },
  { value: "crisis", label: "Crisis Intervention", color: "destructive" as const },
  { value: "discharged", label: "Discharged", color: "secondary" as const },
];

const RISK_LEVELS = [
  { value: "none", label: "None", icon: CheckCircle2, className: "text-green-600" },
  { value: "low", label: "Low", icon: CheckCircle2, className: "text-emerald-500" },
  { value: "moderate", label: "Moderate", icon: Clock, className: "text-amber-500" },
  { value: "high", label: "High", icon: AlertTriangle, className: "text-orange-500" },
  { value: "critical", label: "Critical", icon: AlertTriangle, className: "text-red-600" },
];

interface NoteForm {
  outcome: string;
  clinical_notes: string;
  treatment_plan: string;
  mood_rating: number | null;
  risk_level: string;
  follow_up_recommended: boolean;
  follow_up_notes: string;
}

const emptyForm: NoteForm = {
  outcome: "",
  clinical_notes: "",
  treatment_plan: "",
  mood_rating: null,
  risk_level: "none",
  follow_up_recommended: true,
  follow_up_notes: "",
};

const formatTimeDisplay = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

const SessionNotesTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editBookingId, setEditBookingId] = useState<string | null>(null);
  const [historyNoteId, setHistoryNoteId] = useState<string | null>(null);
  const [form, setForm] = useState<NoteForm>(emptyForm);

  // Fetch completed bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-completed-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .in("status", ["completed", "confirmed"])
        .order("appointment_date", { ascending: false })
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing notes
  const { data: notes = [] } = useQuery({
    queryKey: ["admin-session-notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_notes")
        .select("*");
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch version history for selected note
  const { data: noteHistory = [] } = useQuery({
    queryKey: ["session-note-history", historyNoteId],
    enabled: !!historyNoteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_notes_history" as any)
        .select("*")
        .eq("session_note_id", historyNoteId)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const notesByBooking = new Map(notes.map((n: any) => [n.booking_id, n]));

  const saveMutation = useMutation({
    mutationFn: async ({ bookingId, isUpdate }: { bookingId: string; isUpdate: boolean }) => {
      const payload = {
        booking_id: bookingId,
        outcome: form.outcome || null,
        clinical_notes: form.clinical_notes || null,
        treatment_plan: form.treatment_plan || null,
        mood_rating: form.mood_rating,
        risk_level: form.risk_level || null,
        follow_up_recommended: form.follow_up_recommended,
        follow_up_notes: form.follow_up_notes || null,
        updated_at: new Date().toISOString(),
      };

      if (isUpdate) {
        const existing = notesByBooking.get(bookingId);
        const { error } = await supabase
          .from("session_notes")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("session_notes")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-session-notes"] });
      toast({ title: "Session notes saved" });
      setEditBookingId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => toast({ title: err.message || "Failed to save", variant: "destructive" }),
  });

  const openNoteEditor = (bookingId: string) => {
    const existing = notesByBooking.get(bookingId);
    if (existing) {
      setForm({
        outcome: existing.outcome || "",
        clinical_notes: existing.clinical_notes || "",
        treatment_plan: existing.treatment_plan || "",
        mood_rating: existing.mood_rating,
        risk_level: existing.risk_level || "none",
        follow_up_recommended: existing.follow_up_recommended ?? true,
        follow_up_notes: existing.follow_up_notes || "",
      });
    } else {
      setForm(emptyForm);
    }
    setEditBookingId(bookingId);
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Session Notes & Outcomes</h2>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="font-body text-muted-foreground">No sessions to document yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {bookings.map((b) => {
            const note = notesByBooking.get(b.id);
            const outcomeConfig = note?.outcome ? OUTCOMES.find((o) => o.value === note.outcome) : null;
            const riskConfig = note?.risk_level ? RISK_LEVELS.find((r) => r.value === note.risk_level) : null;
            const isPast = b.appointment_date < todayStr;

            return (
              <div key={b.id} className="bg-card rounded-xl border p-5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-body font-semibold text-foreground">{b.patient_name}</p>
                      {outcomeConfig && (
                        <Badge variant={outcomeConfig.color} className="font-body text-xs">{outcomeConfig.label}</Badge>
                      )}
                      {riskConfig && riskConfig.value !== "none" && (
                        <Badge variant="outline" className={`font-body text-xs gap-1 ${riskConfig.className}`}>
                          <riskConfig.icon className="w-3 h-3" />
                          {riskConfig.label} Risk
                        </Badge>
                      )}
                      {note?.mood_rating && (
                        <Badge variant="outline" className="font-body text-xs">
                          Mood: {note.mood_rating}/10
                        </Badge>
                      )}
                      {!note && <Badge variant="outline" className="font-body text-xs text-muted-foreground">No notes</Badge>}
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      {format(new Date(b.appointment_date + "T00:00:00"), "EEE, MMM d")} · {formatTimeDisplay(b.start_time)} · {b.service_type}
                    </p>
                    {note?.clinical_notes && (
                      <p className="font-body text-xs text-muted-foreground line-clamp-2 italic">"{note.clinical_notes}"</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {note && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHistoryNoteId(note.id)}
                        className="font-body gap-1"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">History</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openNoteEditor(b.id)}
                      className="font-body gap-1"
                    >
                      {note ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      {note ? "Edit Notes" : "Add Notes"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Editor Dialog */}
      <Dialog open={!!editBookingId} onOpenChange={(open) => !open && setEditBookingId(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Session Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="font-body">Session Outcome</Label>
              <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                <SelectTrigger className="font-body"><SelectValue placeholder="Select outcome" /></SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="font-body">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-body">Clinical Notes</Label>
              <Textarea
                value={form.clinical_notes}
                onChange={(e) => setForm({ ...form, clinical_notes: e.target.value })}
                placeholder="Session observations, interventions, patient response..."
                rows={4}
                className="font-body"
              />
            </div>

            <div>
              <Label className="font-body">Treatment Plan / Next Steps</Label>
              <Textarea
                value={form.treatment_plan}
                onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })}
                placeholder="Goals, homework, focus for next session..."
                rows={3}
                className="font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body">Mood Rating (1–10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={form.mood_rating ?? ""}
                  onChange={(e) => setForm({ ...form, mood_rating: e.target.value ? parseInt(e.target.value) : null })}
                  className="font-body"
                  placeholder="e.g. 6"
                />
              </div>
              <div>
                <Label className="font-body">Risk Level</Label>
                <Select value={form.risk_level} onValueChange={(v) => setForm({ ...form, risk_level: v })}>
                  <SelectTrigger className="font-body"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RISK_LEVELS.map((r) => (
                      <SelectItem key={r.value} value={r.value} className="font-body">{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.follow_up_recommended}
                  onChange={(e) => setForm({ ...form, follow_up_recommended: e.target.checked })}
                  className="rounded"
                />
                Follow-up recommended
              </label>
            </div>

            {form.follow_up_recommended && (
              <div>
                <Label className="font-body">Follow-up Notes</Label>
                <Input
                  value={form.follow_up_notes}
                  onChange={(e) => setForm({ ...form, follow_up_notes: e.target.value })}
                  placeholder="e.g. Schedule in 2 weeks"
                  className="font-body"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditBookingId(null)} className="font-body">Cancel</Button>
            <Button
              onClick={() => {
                if (editBookingId) {
                  saveMutation.mutate({
                    bookingId: editBookingId,
                    isUpdate: notesByBooking.has(editBookingId),
                  });
                }
              }}
              className="font-body"
            >
              Save Notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={!!historyNoteId} onOpenChange={(open) => !open && setHistoryNoteId(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <History className="w-5 h-5" /> Version History
            </DialogTitle>
          </DialogHeader>
          {noteHistory.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground py-4 text-center">No previous versions</p>
          ) : (
            <div className="space-y-3 py-2">
              {noteHistory.map((v: any) => {
                const outcomeConfig = v.outcome ? OUTCOMES.find((o) => o.value === v.outcome) : null;
                return (
                  <div key={v.id} className="border rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-body text-xs">v{v.version_number}</Badge>
                      {outcomeConfig && <Badge variant={outcomeConfig.color} className="font-body text-xs">{outcomeConfig.label}</Badge>}
                      {v.mood_rating && <Badge variant="outline" className="font-body text-xs">Mood: {v.mood_rating}/10</Badge>}
                      <span className="font-body text-xs text-muted-foreground ml-auto">
                        {format(new Date(v.changed_at), "MMM d, yyyy · h:mm a")}
                      </span>
                    </div>
                    {v.clinical_notes && (
                      <p className="font-body text-xs text-muted-foreground italic">"{v.clinical_notes}"</p>
                    )}
                    {v.treatment_plan && (
                      <p className="font-body text-xs text-muted-foreground">Plan: {v.treatment_plan}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionNotesTab;
