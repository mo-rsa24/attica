import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addHours, isBefore } from "date-fns";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  Clock,
  RefreshCw,
  X,
  User,
  Phone,
  Mail,
  Shield,
  Edit2,
  Save,
  LogOut,
} from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatTimeDisplay = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

const STATUS_CONFIG: Record<string, { label: string; color: "default" | "secondary" | "destructive" | "outline" }> = {
  requested: { label: "Requested", color: "outline" },
  confirmed: { label: "Confirmed", color: "default" },
  completed: { label: "Completed", color: "secondary" },
  no_show: { label: "No-Show", color: "destructive" },
  cancelled: { label: "Cancelled", color: "destructive" },
};

const MyAppointments = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const auth = usePatientAuth();

  // Determine access mode: authenticated session or legacy token
  const isAuthenticated = auth.isLoggedIn && !!auth.patientId;
  const hasAccess = isAuthenticated || !!token;

  // --- Legacy token-based booking lookup ---
  const { data: tokenBooking } = useQuery({
    queryKey: ["my-booking-token", token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await (supabase
        .from("bookings")
        .select("*") as any)
        .eq("access_token", token)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!token && !isAuthenticated,
  });

  // If user arrives with a token but is also logged in, link the patient record
  useEffect(() => {
    if (token && isAuthenticated && tokenBooking?.patient_id && tokenBooking.patient_id !== auth.patientId) {
      // Token refers to a different patient — ignore, use auth session
    }
  }, [token, isAuthenticated, tokenBooking, auth.patientId]);

  // Resolve patient ID: prefer auth, fallback to token booking's patient_id
  const activePatientId = auth.patientId || tokenBooking?.patient_id;
  const activePatientEmail = auth.email || tokenBooking?.patient_email;

  // --- Fetch all bookings for the patient ---
  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ["my-all-bookings", activePatientId, activePatientEmail],
    queryFn: async () => {
      if (activePatientId) {
        // Authenticated: get all bookings by patient_id
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("patient_id", activePatientId)
          .order("appointment_date", { ascending: false })
          .order("start_time", { ascending: false });
        if (error) throw error;
        return data as any[];
      } else if (activePatientEmail) {
        // Token fallback: get by email
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("patient_email", activePatientEmail)
          .order("appointment_date", { ascending: false })
          .order("start_time", { ascending: false });
        if (error) throw error;
        return data as any[];
      }
      return [];
    },
    enabled: !!activePatientId || !!activePatientEmail,
  });

  // Fetch scheduling rules
  const { data: rules } = useQuery({
    queryKey: ["patient-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduling_rules" as any)
        .select("*")
        .limit(1)
        .single();
      if (error) return null;
      return data as any;
    },
  });

  // Fetch patient profile
  const { data: patient } = useQuery({
    queryKey: ["my-patient", activePatientId],
    queryFn: async () => {
      if (!activePatientId) return null;
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", activePatientId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!activePatientId,
  });

  // Fetch emergency contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ["my-contacts", activePatientId],
    queryFn: async () => {
      if (!activePatientId) return [];
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("patient_id", activePatientId);
      if (error) return [];
      return data;
    },
    enabled: !!activePatientId,
  });

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: "", preferred_language: "en" });

  useEffect(() => {
    if (patient) {
      setProfileForm({
        phone: patient.phone || "",
        preferred_language: patient.preferred_language || "en",
      });
    }
  }, [patient]);

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const b = allBookings.find((x) => x.id === id);
      if (!b) throw new Error("Booking not found");
      const cutoff = rules?.cancellation_cutoff_hours ?? 24;
      const apptDate = new Date(`${b.appointment_date}T${b.start_time}`);
      if (isBefore(apptDate, addHours(new Date(), cutoff))) {
        throw new Error(`Cancellations must be made at least ${cutoff} hours before the appointment.`);
      }
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancellation_reason: reason || null } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-all-bookings"] });
      toast({ title: "Appointment cancelled" });
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      const b = allBookings.find((x) => x.id === id);
      if (!b) throw new Error("Booking not found");
      const maxReschedules = rules?.max_reschedules ?? 2;
      if ((b.reschedule_count ?? 0) >= maxReschedules) throw new Error(`Maximum reschedules (${maxReschedules}) reached.`);
      const cutoff = rules?.reschedule_cutoff_hours ?? 24;
      const apptDate = new Date(`${b.appointment_date}T${b.start_time}`);
      if (isBefore(apptDate, addHours(new Date(), cutoff))) {
        throw new Error(`Rescheduling must be done at least ${cutoff} hours before the appointment.`);
      }
      const { error } = await supabase
        .from("bookings")
        .update({ appointment_date: date, start_time: time + ":00", reschedule_count: (b.reschedule_count ?? 0) + 1 } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-all-bookings"] });
      toast({ title: "Appointment rescheduled" });
      setRescheduleId(null);
      setNewDate("");
      setNewTime("");
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!patient) return;
      const { error } = await supabase
        .from("patients")
        .update({ phone: profileForm.phone, preferred_language: profileForm.preferred_language, updated_at: new Date().toISOString() })
        .eq("id", patient.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-patient"] });
      toast({ title: "Profile updated" });
      setEditingProfile(false);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  // --- No access: show login prompt ---
  if (!auth.isLoading && !hasAccess) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 section-padding flex items-start justify-center">
          <div className="max-w-md mx-auto text-center bg-card rounded-xl border p-12">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Patient Portal</h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Log in to view and manage all your appointments, profile, and history.
            </p>
            <Button onClick={() => navigate("/patient-login")} className="font-body gap-2">
              <Mail className="w-4 h-4" /> Log In with Email
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (auth.isLoading || isLoading) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 section-padding flex items-center justify-center">
          <p className="font-body text-muted-foreground">Loading your appointments...</p>
        </div>
        <Footer />
      </main>
    );
  }

  const displayName = patient ? `${patient.first_name} ${patient.last_name}` : auth.patientName || tokenBooking?.patient_name || "Patient";
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const upcoming = allBookings.filter((b) => b.appointment_date >= todayStr && !["cancelled", "completed", "no_show"].includes(b.status));
  const past = allBookings.filter((b) => b.appointment_date < todayStr || ["cancelled", "completed", "no_show"].includes(b.status));
  const canModify = (b: any) => ["requested", "confirmed"].includes(b.status) && b.appointment_date >= todayStr;

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-body text-sm uppercase tracking-[0.25em] text-primary mb-1">Patient Portal</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
                My Appointments
              </h1>
            </div>
            {isAuthenticated && (
              <Button variant="outline" size="sm" onClick={auth.signOut} className="font-body gap-1.5">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            )}
          </div>
          <p className="font-body text-muted-foreground mb-10">
            Welcome back, {displayName}
          </p>

          {/* Profile & Contacts Section */}
          {patient && (
            <div className="bg-card rounded-xl border p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Your Profile
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editingProfile ? updateProfile.mutate() : setEditingProfile(true)}
                  className="font-body gap-1"
                >
                  {editingProfile ? <><Save className="w-3.5 h-3.5" /> Save</> : <><Edit2 className="w-3.5 h-3.5" /> Edit</>}
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="font-body text-xs text-muted-foreground">Name</p>
                  <p className="font-body text-sm text-foreground">{patient.first_name} {patient.last_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-body text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                  <p className="font-body text-sm text-foreground">
                    {patient.email}
                    {patient.email_verified && <Badge variant="secondary" className="ml-2 text-xs font-body">Verified</Badge>}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-body text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                  {editingProfile ? (
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="font-body h-8 text-sm" maxLength={20} />
                  ) : (
                    <p className="font-body text-sm text-foreground">{patient.phone || "Not set"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-body text-xs text-muted-foreground">Preferred Language</p>
                  {editingProfile ? (
                    <select
                      value={profileForm.preferred_language}
                      onChange={(e) => setProfileForm({ ...profileForm, preferred_language: e.target.value })}
                      className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm font-body"
                    >
                      <option value="en">English</option>
                      <option value="af">Afrikaans</option>
                      <option value="zu">Zulu</option>
                      <option value="st">Sesotho</option>
                    </select>
                  ) : (
                    <p className="font-body text-sm text-foreground capitalize">{patient.preferred_language}</p>
                  )}
                </div>
              </div>
              {contacts.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-body text-xs text-muted-foreground mb-2">Emergency Contact(s)</p>
                  {contacts.map((c) => (
                    <p key={c.id} className="font-body text-sm text-foreground">{c.name} ({c.relationship}) — {c.phone}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No bookings found */}
          {allBookings.length === 0 && (
            <div className="bg-card rounded-xl border p-8 text-center mb-8">
              <p className="font-body text-muted-foreground mb-4">
                No appointments found for this account.
              </p>
              <Button onClick={() => navigate("/book")} className="font-body">
                Book Your First Appointment
              </Button>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Upcoming ({upcoming.length})</h2>
              <div className="grid gap-3 mb-8">
                {upcoming.map((b) => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.requested;
                  return (
                    <div key={b.id} className="bg-card rounded-xl border p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-body font-semibold text-foreground">{b.service_type}</p>
                            <Badge variant={cfg.color} className="font-body text-xs">{cfg.label}</Badge>
                            {b.reschedule_count > 0 && (
                              <Badge variant="outline" className="font-body text-xs gap-1">
                                <RefreshCw className="w-3 h-3" />{b.reschedule_count}x
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 font-body text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {format(new Date(b.appointment_date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimeDisplay(b.start_time)} · {b.duration_minutes}min
                            </span>
                          </div>
                        </div>
                        {canModify(b) && (
                          <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => { setRescheduleId(b.id); setNewDate(b.appointment_date); setNewTime(b.start_time.slice(0, 5)); }} className="font-body gap-1">
                              <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="font-body text-destructive hover:text-destructive gap-1">
                                  <X className="w-3.5 h-3.5" /> Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-display">Cancel Appointment</AlertDialogTitle>
                                  <AlertDialogDescription className="font-body">
                                    Cancel your {b.service_type} on {format(new Date(b.appointment_date + "T00:00:00"), "MMMM d")}?
                                    {rules && (
                                      <span className="block text-xs mt-1">
                                        Cancellations require {rules.cancellation_cutoff_hours}h notice.
                                        {rules.cancellation_fee_cents && ` A fee of R${(rules.cancellation_fee_cents / 100).toFixed(2)} may apply.`}
                                      </span>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2 py-2">
                                  <Label className="font-body text-sm">Reason (optional)</Label>
                                  <Input placeholder="e.g. Schedule conflict" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} maxLength={255} className="font-body" />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="font-body">Keep</AlertDialogCancel>
                                  <AlertDialogAction className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { cancelMutation.mutate({ id: b.id, reason: cancelReason }); setCancelReason(""); }}>
                                    Cancel Appointment
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Past */}
          {past.length > 0 && (
            <>
              <h2 className="font-display text-lg font-semibold text-muted-foreground mb-4">Past & Cancelled</h2>
              <div className="grid gap-2 mb-8">
                {past.slice(0, 20).map((b) => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.requested;
                  return (
                    <div key={b.id} className="bg-card/50 rounded-lg border p-4 flex items-center gap-4 opacity-60">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-body text-sm text-foreground">{b.service_type}</p>
                          <Badge variant={cfg.color} className="font-body text-xs">{cfg.label}</Badge>
                        </div>
                        <p className="font-body text-xs text-muted-foreground">
                          {format(new Date(b.appointment_date + "T00:00:00"), "MMM d, yyyy")} · {formatTimeDisplay(b.start_time)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleId} onOpenChange={(open) => !open && setRescheduleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Reschedule Appointment</DialogTitle>
            <DialogDescription className="font-body">
              {rules && <span className="text-xs">Max {rules.max_reschedules} reschedules · {rules.reschedule_cutoff_hours}h minimum notice</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="font-body">New Date</Label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="font-body" />
            </div>
            <div>
              <Label className="font-body">New Time</Label>
              <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="font-body" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRescheduleId(null)} className="font-body">Cancel</Button>
            <Button onClick={() => rescheduleId && newDate && newTime && rescheduleMutation.mutate({ id: rescheduleId, date: newDate, time: newTime })} disabled={!newDate || !newTime} className="font-body">
              Confirm Reschedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
};

export default MyAppointments;
