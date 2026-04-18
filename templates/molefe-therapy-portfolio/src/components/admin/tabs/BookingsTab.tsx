import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format, addHours, isBefore } from "date-fns";
import {
  CalendarDays,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  Send,
  Repeat,
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

const BookingsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rescheduleBooking, setRescheduleBooking] = useState<any | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: rules } = useQuery({
    queryKey: ["admin-rules-for-bookings"],
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

  const sendNotification = async (booking: any, notificationType: string, extras?: Record<string, any>) => {
    try {
      await supabase.functions.invoke("send-booking-notification", {
        body: {
          patient_name: booking.patient_name,
          patient_phone: booking.patient_phone,
          appointment_date: booking.appointment_date,
          start_time: booking.start_time,
          service_type: booking.service_type,
          notification_type: notificationType,
          ...extras,
        },
      });
    } catch (err) {
      console.warn("Notification send failed (non-blocking):", err);
    }
  };

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, extras }: { id: string; status: string; extras?: Record<string, any> }) => {
      const updates: any = { status, ...extras };
      if (status === "confirmed") updates.confirmed_at = new Date().toISOString();
      if (status === "completed") updates.completed_at = new Date().toISOString();
      if (status === "cancelled") updates.cancelled_at = new Date().toISOString();
      if (status === "no_show") updates.no_show_at = new Date().toISOString();
      const { error } = await supabase.from("bookings").update(updates).eq("id", id);
      if (error) throw error;

      // Send notification to patient
      const booking = bookings.find((b) => b.id === id);
      if (booking && ["confirmed", "cancelled"].includes(status)) {
        sendNotification(booking, status, {
          reason: extras?.cancellation_reason,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Booking updated & patient notified" });
    },
    onError: (err: any) => toast({ title: err.message || "Update failed", variant: "destructive" }),
  });

  const reschedule = useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");

      const maxReschedules = rules?.max_reschedules ?? 2;
      const currentCount = (booking as any).reschedule_count ?? 0;
      if (currentCount >= maxReschedules) {
        throw new Error(`Maximum reschedules (${maxReschedules}) reached for this appointment.`);
      }

      const cutoffHours = rules?.reschedule_cutoff_hours ?? 24;
      const appointmentDateTime = new Date(`${booking.appointment_date}T${booking.start_time}`);
      const cutoff = addHours(new Date(), cutoffHours);
      if (isBefore(appointmentDateTime, cutoff)) {
        throw new Error(`Rescheduling must be done at least ${cutoffHours} hours before the appointment.`);
      }

      const { error } = await supabase
        .from("bookings")
        .update({
          appointment_date: date,
          start_time: time + ":00",
          reschedule_count: currentCount + 1,
          rescheduled_from_id: id,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      // Send reschedule notification
      if (rescheduleBooking) {
        sendNotification(rescheduleBooking, "rescheduled", {
          new_date: newDate,
          new_time: newTime + ":00",
        });
      }
      toast({ title: "Appointment rescheduled & patient notified" });
      setRescheduleBooking(null);
      setNewDate("");
      setNewTime("");
    },
    onError: (err: any) => toast({ title: err.message || "Reschedule failed", variant: "destructive" }),
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const upcomingBookings = bookings.filter(
    (b) => !["cancelled"].includes(b.status) && b.appointment_date >= todayStr
  );
  const pastBookings = bookings.filter(
    (b) => b.appointment_date < todayStr || b.status === "cancelled"
  );

  const getNextStatuses = (current: string): string[] => {
    switch (current) {
      case "requested":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["completed", "no_show", "cancelled"];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
          Upcoming Appointments ({upcomingBookings.length})
        </h2>
        {upcomingBookings.length === 0 ? (
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="font-body text-muted-foreground">No upcoming appointments</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcomingBookings.map((b) => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.requested;
              const nextStatuses = getNextStatuses(b.status);

              return (
                <div
                  key={b.id}
                  className="bg-card rounded-xl border p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-body font-semibold text-foreground">{b.patient_name}</p>
                        <Badge variant={cfg.color} className="font-body text-xs">{cfg.label}</Badge>
                        {(b as any).series_id && (
                          <Badge variant="outline" className="font-body text-xs gap-1">
                            <Repeat className="w-3 h-3" />
                            Series {(b as any).series_index ? `#${(b as any).series_index}` : ""}
                          </Badge>
                        )}
                        {(b as any).reschedule_count > 0 && (
                          <Badge variant="outline" className="font-body text-xs gap-1">
                            <RefreshCw className="w-3 h-3" />
                            {(b as any).reschedule_count}x rescheduled
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 font-body text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {format(new Date(b.appointment_date + "T00:00:00"), "EEE, MMM d")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeDisplay(b.start_time)} · {b.duration_minutes}min
                        </span>
                        <span>{b.service_type}</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        {b.patient_email} · {b.patient_phone}
                      </p>
                      {b.notes && <p className="font-body text-xs text-muted-foreground italic">"{b.notes}"</p>}
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      {nextStatuses.map((status) => {
                        if (status === "cancelled") {
                          return (
                            <AlertDialog key={status}>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="font-body text-destructive hover:text-destructive gap-1">
                                  <X className="w-3.5 h-3.5" /> Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-display">Cancel Appointment</AlertDialogTitle>
                                  <AlertDialogDescription className="font-body">
                                    Are you sure you want to cancel {b.patient_name}'s appointment?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2 py-2">
                                  <Label className="font-body text-sm">Reason (optional)</Label>
                                  <Input
                                    placeholder="e.g. Patient requested"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="font-body"
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="font-body">Keep</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => {
                                      updateStatus.mutate({
                                        id: b.id,
                                        status: "cancelled",
                                        extras: { cancellation_reason: cancelReason || null },
                                      });
                                      setCancelReason("");
                                    }}
                                  >
                                    Cancel Appointment
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          );
                        }

                        const icons: Record<string, React.ReactNode> = {
                          confirmed: <CheckCircle2 className="w-3.5 h-3.5" />,
                          completed: <CheckCircle2 className="w-3.5 h-3.5" />,
                          no_show: <AlertCircle className="w-3.5 h-3.5" />,
                        };

                        return (
                          <Button
                            key={status}
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus.mutate({ id: b.id, status })}
                            className="font-body gap-1 capitalize"
                          >
                            {icons[status]} {status.replace("_", " ")}
                          </Button>
                        );
                      })}

                      {["requested", "confirmed"].includes(b.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRescheduleBooking(b);
                            setNewDate(b.appointment_date);
                            setNewTime(b.start_time.slice(0, 5));
                          }}
                          className="font-body gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pastBookings.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-muted-foreground mb-4">Past & Cancelled</h2>
          <div className="grid gap-2">
            {pastBookings.slice(0, 20).map((b) => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.requested;
              return (
                <div key={b.id} className="bg-card/50 rounded-lg border p-4 flex items-center gap-4 opacity-60">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm text-foreground">{b.patient_name}</p>
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
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleBooking} onOpenChange={(open) => !open && setRescheduleBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Reschedule Appointment</DialogTitle>
            <DialogDescription className="font-body">
              {rescheduleBooking && (
                <>
                  Rescheduling {rescheduleBooking.patient_name}'s appointment.
                  {rules && (
                    <span className="block text-xs mt-1">
                      Max {rules.max_reschedules} reschedules allowed · {rules.reschedule_cutoff_hours}h cutoff
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="font-body">New Date</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="font-body"
              />
            </div>
            <div>
              <Label className="font-body">New Time</Label>
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="font-body"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRescheduleBooking(null)} className="font-body">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (rescheduleBooking && newDate && newTime) {
                  reschedule.mutate({ id: rescheduleBooking.id, date: newDate, time: newTime });
                }
              }}
              disabled={!newDate || !newTime}
              className="font-body"
            >
              Confirm Reschedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsTab;
