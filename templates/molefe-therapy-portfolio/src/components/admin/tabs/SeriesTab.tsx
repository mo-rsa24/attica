import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addWeeks, addMonths, getDay } from "date-fns";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Repeat,
  Plus,
  CalendarDays,
  Clock,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  X,
  Edit2,
  Trash2,
} from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PATTERNS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 Weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom Interval" },
];

const formatTimeDisplay = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

interface SeriesForm {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  service_type: string;
  duration_minutes: number;
  recurrence_pattern: string;
  custom_interval_days: number | null;
  day_of_week: number;
  start_time: string;
  series_start_date: string;
  total_sessions: number;
  notes: string;
}

const defaultForm: SeriesForm = {
  patient_name: "",
  patient_email: "",
  patient_phone: "",
  service_type: "",
  duration_minutes: 60,
  recurrence_pattern: "weekly",
  custom_interval_days: null,
  day_of_week: 2, // Tuesday
  start_time: "09:00",
  series_start_date: format(new Date(), "yyyy-MM-dd"),
  total_sessions: 8,
  notes: "",
};

const generateDates = (form: SeriesForm): string[] => {
  const dates: string[] = [];
  let current = new Date(form.series_start_date + "T00:00:00");

  // Align to the chosen day_of_week
  const targetDay = form.day_of_week;
  while (getDay(current) !== targetDay) {
    current = addDays(current, 1);
  }

  for (let i = 0; i < form.total_sessions; i++) {
    dates.push(format(current, "yyyy-MM-dd"));
    switch (form.recurrence_pattern) {
      case "weekly":
        current = addWeeks(current, 1);
        break;
      case "biweekly":
        current = addWeeks(current, 2);
        break;
      case "monthly":
        current = addMonths(current, 1);
        // Re-align to target day
        while (getDay(current) !== targetDay) {
          current = addDays(current, 1);
        }
        break;
      case "custom":
        current = addDays(current, form.custom_interval_days || 7);
        break;
    }
  }
  return dates;
};

const SeriesTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<SeriesForm>(defaultForm);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [editBooking, setEditBooking] = useState<any | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [cancelSeriesId, setCancelSeriesId] = useState<string | null>(null);

  // Fetch series
  const { data: seriesList = [] } = useQuery({
    queryKey: ["admin-series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_series" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch service types
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["admin-service-types-for-series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("name, duration_minutes")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch bookings for expanded series
  const { data: seriesBookings = [] } = useQuery({
    queryKey: ["admin-series-bookings", expandedSeries],
    queryFn: async () => {
      if (!expandedSeries) return [];
      const { data, error } = await (supabase
        .from("bookings")
        .select("*") as any)
        .eq("series_id", expandedSeries)
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!expandedSeries,
  });

  // Fetch patients for autocomplete
  const { data: patients = [] } = useQuery({
    queryKey: ["admin-patients-for-series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, email, phone")
        .order("last_name");
      if (error) throw error;
      return data;
    },
  });

  const createSeries = useMutation({
    mutationFn: async () => {
      if (!form.patient_name || !form.patient_email || !form.service_type) {
        throw new Error("Please fill in all required fields");
      }

      // Find patient_id if exists
      const matchingPatient = patients.find((p) => p.email === form.patient_email);
      const dates = generateDates(form);
      const endDate = dates[dates.length - 1];

      // 1. Create series record
      const { data: series, error: seriesErr } = await supabase
        .from("booking_series" as any)
        .insert({
          patient_id: matchingPatient?.id || null,
          patient_name: form.patient_name,
          patient_email: form.patient_email,
          patient_phone: form.patient_phone,
          service_type: form.service_type,
          duration_minutes: form.duration_minutes,
          recurrence_pattern: form.recurrence_pattern,
          custom_interval_days: form.recurrence_pattern === "custom" ? form.custom_interval_days : null,
          day_of_week: form.day_of_week,
          start_time: form.start_time + ":00",
          series_start_date: form.series_start_date,
          series_end_date: endDate,
          total_sessions: form.total_sessions,
          notes: form.notes || null,
        } as any)
        .select()
        .single();

      if (seriesErr) throw seriesErr;

      // 2. Create individual bookings
      const bookings = dates.map((date, idx) => ({
        patient_name: form.patient_name,
        patient_email: form.patient_email,
        patient_phone: form.patient_phone,
        patient_id: matchingPatient?.id || null,
        service_type: form.service_type,
        duration_minutes: form.duration_minutes,
        appointment_date: date,
        start_time: form.start_time + ":00",
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        series_id: (series as any).id,
        series_index: idx + 1,
      }));

      const { error: bookErr } = await (supabase
        .from("bookings") as any)
        .insert(bookings);

      if (bookErr) throw bookErr;

      return { seriesId: (series as any).id, count: dates.length };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["admin-series"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: `Series created with ${result.count} appointments` });
      setShowCreate(false);
      setForm(defaultForm);
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  // Edit single booking in series
  const editSingleBooking = useMutation({
    mutationFn: async () => {
      if (!editBooking) return;
      const { error } = await supabase
        .from("bookings")
        .update({
          appointment_date: editDate,
          start_time: editTime + ":00",
        } as any)
        .eq("id", editBooking.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-series-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Appointment updated" });
      setEditBooking(null);

      // Send notification
      if (editBooking) {
        supabase.functions.invoke("send-booking-notification", {
          body: {
            patient_name: editBooking.patient_name,
            patient_phone: editBooking.patient_phone,
            appointment_date: editBooking.appointment_date,
            start_time: editBooking.start_time,
            service_type: editBooking.service_type,
            notification_type: "rescheduled",
            new_date: editDate,
            new_time: editTime + ":00",
          },
        }).catch(() => {});
      }
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  // Cancel entire series
  const cancelEntireSeries = useMutation({
    mutationFn: async (seriesId: string) => {
      // Cancel all future bookings
      const today = format(new Date(), "yyyy-MM-dd");
      const { error: bookErr } = await (supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancellation_reason: "Series cancelled" } as any) as any)
        .eq("series_id", seriesId)
        .gte("appointment_date", today)
        .in("status", ["requested", "confirmed"]);
      if (bookErr) throw bookErr;

      // Update series status
      const { error: serErr } = await supabase
        .from("booking_series" as any)
        .update({ status: "cancelled", updated_at: new Date().toISOString() } as any)
        .eq("id", seriesId);
      if (serErr) throw serErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-series"] });
      qc.invalidateQueries({ queryKey: ["admin-series-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Series cancelled — all future appointments cancelled" });
      setCancelSeriesId(null);
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  // Pause/resume series
  const toggleSeriesStatus = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error } = await supabase
        .from("booking_series" as any)
        .update({ status: newStatus, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-series"] });
      toast({ title: "Series status updated" });
    },
  });

  const previewDates = showCreate ? generateDates(form) : [];

  const handlePatientSelect = (email: string) => {
    const p = patients.find((x) => x.email === email);
    if (p) {
      setForm({
        ...form,
        patient_name: `${p.first_name} ${p.last_name}`,
        patient_email: p.email,
        patient_phone: p.phone || "",
      });
    }
  };

  const handleServiceSelect = (name: string) => {
    const s = serviceTypes.find((x) => x.name === name);
    if (s) {
      setForm({ ...form, service_type: s.name, duration_minutes: s.duration_minutes });
    }
  };

  const STATUS_BADGE: Record<string, { label: string; color: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Active", color: "default" },
    paused: { label: "Paused", color: "outline" },
    completed: { label: "Completed", color: "secondary" },
    cancelled: { label: "Cancelled", color: "destructive" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Recurring Series</h2>
        </div>
        <Button onClick={() => setShowCreate(true)} className="font-body gap-1.5" size="sm">
          <Plus className="w-4 h-4" /> New Series
        </Button>
      </div>

      {/* Series List */}
      {seriesList.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <Repeat className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-muted-foreground mb-1">No recurring series yet</p>
          <p className="font-body text-xs text-muted-foreground">Create a series to auto-generate linked appointments</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {seriesList.map((s: any) => {
            const badge = STATUS_BADGE[s.status] || STATUS_BADGE.active;
            const isExpanded = expandedSeries === s.id;

            return (
              <div key={s.id} className="bg-card rounded-xl border overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedSeries(isExpanded ? null : s.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-body font-semibold text-foreground">{s.patient_name}</p>
                        <Badge variant={badge.color} className="font-body text-xs">{badge.label}</Badge>
                        <Badge variant="outline" className="font-body text-xs">
                          {PATTERNS.find((p) => p.value === s.recurrence_pattern)?.label || s.recurrence_pattern}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 font-body text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {DAYS[s.day_of_week]}s · {s.total_sessions} sessions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeDisplay(s.start_time)} · {s.duration_minutes}min
                        </span>
                        <span>{s.service_type}</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        {format(new Date(s.series_start_date + "T00:00:00"), "MMM d")} → {s.series_end_date ? format(new Date(s.series_end_date + "T00:00:00"), "MMM d, yyyy") : "ongoing"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.status === "active" && (
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); toggleSeriesStatus.mutate({ id: s.id, newStatus: "paused" }); }} className="font-body gap-1">
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </Button>
                      )}
                      {s.status === "paused" && (
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); toggleSeriesStatus.mutate({ id: s.id, newStatus: "active" }); }} className="font-body gap-1">
                          <Play className="w-3.5 h-3.5" /> Resume
                        </Button>
                      )}
                      {["active", "paused"].includes(s.status) && (
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setCancelSeriesId(s.id); }} className="font-body text-destructive hover:text-destructive gap-1">
                          <X className="w-3.5 h-3.5" /> Cancel All
                        </Button>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* Expanded: show individual bookings */}
                {isExpanded && (
                  <div className="border-t bg-muted/20 p-4">
                    <p className="font-body text-xs text-muted-foreground mb-3 uppercase tracking-wider">Individual Appointments</p>
                    {seriesBookings.length === 0 ? (
                      <p className="font-body text-sm text-muted-foreground">Loading...</p>
                    ) : (
                      <div className="grid gap-2">
                        {seriesBookings.map((b: any) => {
                          const isPast = b.appointment_date < format(new Date(), "yyyy-MM-dd");
                          return (
                            <div key={b.id} className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${isPast ? "opacity-50" : ""}`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-body text-xs text-muted-foreground">#{b.series_index}</span>
                                  <span className="font-body text-sm text-foreground">
                                    {format(new Date(b.appointment_date + "T00:00:00"), "EEE, MMM d")}
                                  </span>
                                  <span className="font-body text-sm text-muted-foreground">
                                    {formatTimeDisplay(b.start_time)}
                                  </span>
                                  <Badge variant={b.status === "cancelled" ? "destructive" : b.status === "completed" ? "secondary" : "default"} className="font-body text-xs">
                                    {b.status}
                                  </Badge>
                                </div>
                              </div>
                              {!isPast && ["confirmed", "requested"].includes(b.status) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => { setEditBooking(b); setEditDate(b.appointment_date); setEditTime(b.start_time.slice(0, 5)); }}
                                  className="font-body gap-1 text-xs"
                                >
                                  <Edit2 className="w-3 h-3" /> Edit
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Series Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Create Recurring Series</DialogTitle>
            <DialogDescription className="font-body">
              Generate linked appointments on a recurring schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Patient */}
            <div>
              <Label className="font-body">Patient</Label>
              {patients.length > 0 && (
                <Select onValueChange={handlePatientSelect}>
                  <SelectTrigger className="font-body"><SelectValue placeholder="Select existing patient..." /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.email} className="font-body">
                        {p.first_name} {p.last_name} — {p.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input placeholder="Patient name" value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} className="font-body" />
                <Input placeholder="Email" type="email" value={form.patient_email} onChange={(e) => setForm({ ...form, patient_email: e.target.value })} className="font-body" />
              </div>
              <Input placeholder="Phone" value={form.patient_phone} onChange={(e) => setForm({ ...form, patient_phone: e.target.value })} className="font-body mt-2" />
            </div>

            {/* Service */}
            <div>
              <Label className="font-body">Service</Label>
              <Select onValueChange={handleServiceSelect} value={form.service_type}>
                <SelectTrigger className="font-body"><SelectValue placeholder="Select service..." /></SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((s) => (
                    <SelectItem key={s.name} value={s.name} className="font-body">{s.name} ({s.duration_minutes}min)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body">Pattern</Label>
                <Select value={form.recurrence_pattern} onValueChange={(v) => setForm({ ...form, recurrence_pattern: v })}>
                  <SelectTrigger className="font-body"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PATTERNS.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="font-body">{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body">Day of Week</Label>
                <Select value={String(form.day_of_week)} onValueChange={(v) => setForm({ ...form, day_of_week: parseInt(v) })}>
                  <SelectTrigger className="font-body"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, i) => (
                      <SelectItem key={i} value={String(i)} className="font-body">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.recurrence_pattern === "custom" && (
              <div>
                <Label className="font-body">Interval (days)</Label>
                <Input type="number" min={1} value={form.custom_interval_days || ""} onChange={(e) => setForm({ ...form, custom_interval_days: parseInt(e.target.value) || null })} className="font-body" placeholder="e.g. 10" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="font-body">Start Date</Label>
                <Input type="date" value={form.series_start_date} onChange={(e) => setForm({ ...form, series_start_date: e.target.value })} className="font-body" />
              </div>
              <div>
                <Label className="font-body">Time</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="font-body" />
              </div>
              <div>
                <Label className="font-body">Sessions</Label>
                <Input type="number" min={1} max={52} value={form.total_sessions} onChange={(e) => setForm({ ...form, total_sessions: parseInt(e.target.value) || 1 })} className="font-body" />
              </div>
            </div>

            <div>
              <Label className="font-body">Notes (optional)</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Series notes..." rows={2} className="font-body" />
            </div>

            {/* Preview */}
            {previewDates.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-body text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  Preview — {previewDates.length} appointments
                </p>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                  {previewDates.map((d, i) => (
                    <p key={i} className="font-body text-xs text-foreground">
                      #{i + 1} {format(new Date(d + "T00:00:00"), "EEE, MMM d, yyyy")}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="font-body">Cancel</Button>
            <Button
              onClick={() => createSeries.mutate()}
              disabled={!form.patient_name || !form.service_type || createSeries.isPending}
              className="font-body"
            >
              {createSeries.isPending ? "Creating..." : `Create ${previewDates.length} Appointments`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Single Booking Dialog */}
      <Dialog open={!!editBooking} onOpenChange={(open) => !open && setEditBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Edit Single Appointment</DialogTitle>
            <DialogDescription className="font-body">
              This changes only this one appointment, not the entire series.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="font-body">New Date</Label>
              <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="font-body" />
            </div>
            <div>
              <Label className="font-body">New Time</Label>
              <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="font-body" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditBooking(null)} className="font-body">Cancel</Button>
            <Button onClick={() => editSingleBooking.mutate()} disabled={!editDate || !editTime} className="font-body">
              Save Change
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Series Confirmation */}
      <AlertDialog open={!!cancelSeriesId} onOpenChange={(open) => !open && setCancelSeriesId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Cancel Entire Series</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will cancel all future appointments in this series. Past and completed appointments won't be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Keep Series</AlertDialogCancel>
            <AlertDialogAction
              className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => cancelSeriesId && cancelEntireSeries.mutate(cancelSeriesId)}
            >
              Cancel All Future Appointments
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeriesTab;
