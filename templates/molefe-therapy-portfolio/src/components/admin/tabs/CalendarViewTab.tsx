import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  isSameDay,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  GripVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ViewMode = "week" | "month";

const STATUS_COLORS: Record<string, string> = {
  requested: "bg-amber-100 border-amber-300 text-amber-800",
  confirmed: "bg-blue-100 border-blue-300 text-blue-800",
  completed: "bg-green-100 border-green-300 text-green-800",
  no_show: "bg-red-100 border-red-300 text-red-800",
  cancelled: "bg-muted border-muted-foreground/20 text-muted-foreground line-through",
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM – 6 PM

const formatTimeShort = (t: string) => {
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m}${hr >= 12 ? "p" : "a"}`;
};

const CalendarViewTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragBooking, setDragBooking] = useState<any>(null);
  const [dropTarget, setDropTarget] = useState<{ date: string; hour: number } | null>(null);
  const [confirmDrop, setConfirmDrop] = useState<{ booking: any; newDate: string; newTime: string } | null>(null);

  const { data: bookings = [] } = useQuery({
    queryKey: ["calendar-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .neq("status", "cancelled")
        .order("appointment_date")
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["calendar-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_types").select("name, color").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ["calendar-holidays"],
    queryFn: async () => {
      const { data, error } = await supabase.from("public_holidays").select("date, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ["calendar-blocks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("availability_blocks").select("*");
      if (error) throw error;
      return data;
    },
  });

  const serviceColorMap = useMemo(() => new Map(services.map((s: any) => [s.name, s.color])), [services]);
  const holidayMap = useMemo(() => new Map(holidays.map((h: any) => [h.date, h.name])), [holidays]);

  const days = useMemo(() => {
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end: endOfWeek(currentDate, { weekStartsOn: 1 }) });
    }
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const calStart = startOfWeek(start, { weekStartsOn: 1 });
    const calEnd = endOfWeek(end, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate, viewMode]);

  const navigate = (dir: number) => {
    setCurrentDate(prev => viewMode === "week" ? (dir > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1)) : (dir > 0 ? addMonths(prev, 1) : subMonths(prev, 1)));
  };

  const rescheduleByDrop = useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      const booking = bookings.find((b: any) => b.id === id);
      const count = (booking as any)?.reschedule_count ?? 0;
      const { error } = await supabase.from("bookings").update({
        appointment_date: date,
        start_time: time,
        reschedule_count: count + 1,
      } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-bookings"] });
      toast({ title: "Appointment rescheduled" });
      setConfirmDrop(null);
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const handleDragStart = (e: React.DragEvent, booking: any) => {
    e.dataTransfer.effectAllowed = "move";
    setDragBooking(booking);
  };

  const handleDragOver = (e: React.DragEvent, date: string, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ date, hour });
  };

  const handleDrop = (e: React.DragEvent, date: string, hour: number) => {
    e.preventDefault();
    if (!dragBooking) return;
    const newTime = `${String(hour).padStart(2, "0")}:00:00`;
    if (dragBooking.appointment_date === date && dragBooking.start_time === newTime) {
      setDragBooking(null);
      setDropTarget(null);
      return;
    }
    setConfirmDrop({ booking: dragBooking, newDate: date, newTime });
    setDragBooking(null);
    setDropTarget(null);
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // WEEK VIEW
  if (viewMode === "week") {
    return (
      <div className="space-y-4">
        <CalendarHeader viewMode={viewMode} setViewMode={setViewMode} currentDate={currentDate} navigate={navigate} onToday={() => setCurrentDate(new Date())} />
        
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
            <div className="p-2 border-r" />
            {days.map(day => {
              const ds = format(day, "yyyy-MM-dd");
              const isToday = ds === todayStr;
              const holiday = holidayMap.get(ds);
              return (
                <div key={ds} className={`p-2 text-center border-r last:border-r-0 ${isToday ? "bg-primary/5" : ""}`}>
                  <p className="font-body text-xs text-muted-foreground">{format(day, "EEE")}</p>
                  <p className={`font-display text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</p>
                  {holiday && <p className="font-body text-[10px] text-destructive truncate">{holiday}</p>}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[60px_repeat(7,1fr)] max-h-[600px] overflow-y-auto">
            {HOURS.map(hour => (
              <div key={hour} className="contents">
                <div className="p-1 pr-2 text-right border-r border-b h-16 flex items-start justify-end">
                  <span className="font-body text-[10px] text-muted-foreground">{hour > 12 ? hour - 12 : hour}{hour >= 12 ? "PM" : "AM"}</span>
                </div>
                {days.map(day => {
                  const ds = format(day, "yyyy-MM-dd");
                  const isDropZone = dropTarget?.date === ds && dropTarget?.hour === hour;
                  const cellBookings = bookings.filter((b: any) => b.appointment_date === ds && parseInt(b.start_time.split(":")[0]) === hour);
                  const isBlocked = blocks.some((bl: any) => bl.block_date === ds && (bl.is_full_day || (parseInt(bl.start_time?.split(":")[0] || "0") <= hour && parseInt(bl.end_time?.split(":")[0] || "24") > hour)));

                  return (
                    <div
                      key={`${ds}-${hour}`}
                      className={`border-r border-b last:border-r-0 h-16 p-0.5 relative ${isDropZone ? "bg-primary/10" : ""} ${isBlocked ? "bg-muted/40" : ""}`}
                      onDragOver={e => handleDragOver(e, ds, hour)}
                      onDrop={e => handleDrop(e, ds, hour)}
                    >
                      {cellBookings.map((b: any) => {
                        const svcColor = serviceColorMap.get(b.service_type);
                        const statusCls = STATUS_COLORS[b.status] || STATUS_COLORS.requested;
                        return (
                          <div
                            key={b.id}
                            draggable={["requested", "confirmed"].includes(b.status)}
                            onDragStart={e => handleDragStart(e, b)}
                            className={`rounded px-1 py-0.5 text-[10px] leading-tight border cursor-grab active:cursor-grabbing truncate ${statusCls}`}
                            style={svcColor ? { borderLeftColor: svcColor, borderLeftWidth: 3 } : {}}
                            title={`${b.patient_name} · ${b.service_type} · ${b.status}`}
                          >
                            <span className="font-semibold">{b.patient_name.split(" ")[0]}</span>
                            <span className="ml-1 opacity-70">{formatTimeShort(b.start_time)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <ConfirmDropDialog confirmDrop={confirmDrop} setConfirmDrop={setConfirmDrop} onConfirm={() => {
          if (confirmDrop) rescheduleByDrop.mutate({ id: confirmDrop.booking.id, date: confirmDrop.newDate, time: confirmDrop.newTime });
        }} />
      </div>
    );
  }

  // MONTH VIEW
  return (
    <div className="space-y-4">
      <CalendarHeader viewMode={viewMode} setViewMode={setViewMode} currentDate={currentDate} navigate={navigate} onToday={() => setCurrentDate(new Date())} />

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <div key={d} className="p-2 text-center border-r last:border-r-0">
              <p className="font-body text-xs font-medium text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map(day => {
            const ds = format(day, "yyyy-MM-dd");
            const isToday = ds === todayStr;
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const dayBookings = bookings.filter((b: any) => b.appointment_date === ds);
            const holiday = holidayMap.get(ds);

            return (
              <div key={ds} className={`border-r border-b last:border-r-0 min-h-[80px] p-1 ${!isCurrentMonth ? "bg-muted/20" : ""} ${isToday ? "bg-primary/5" : ""}`}>
                <div className="flex items-center gap-1">
                  <span className={`font-body text-xs ${isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-semibold" : isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}>
                    {format(day, "d")}
                  </span>
                  {holiday && <span className="font-body text-[9px] text-destructive truncate">{holiday}</span>}
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {dayBookings.slice(0, 3).map((b: any) => {
                    const statusCls = STATUS_COLORS[b.status] || STATUS_COLORS.requested;
                    return (
                      <div key={b.id} className={`rounded px-1 text-[9px] leading-tight border truncate ${statusCls}`} title={`${b.patient_name} · ${formatTimeShort(b.start_time)}`}>
                        {formatTimeShort(b.start_time)} {b.patient_name.split(" ")[0]}
                      </div>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <p className="font-body text-[9px] text-muted-foreground px-1">+{dayBookings.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDropDialog confirmDrop={confirmDrop} setConfirmDrop={setConfirmDrop} onConfirm={() => {
        if (confirmDrop) rescheduleByDrop.mutate({ id: confirmDrop.booking.id, date: confirmDrop.newDate, time: confirmDrop.newTime });
      }} />
    </div>
  );
};

// Shared sub-components
function CalendarHeader({ viewMode, setViewMode, currentDate, navigate, onToday }: { viewMode: ViewMode; setViewMode: (v: ViewMode) => void; currentDate: Date; navigate: (d: number) => void; onToday: () => void }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">
          {format(currentDate, viewMode === "week" ? "MMM d, yyyy" : "MMMM yyyy")}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday} className="font-body text-xs">Today</Button>
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight className="w-4 h-4" /></Button>
        <div className="flex bg-muted rounded-md p-0.5">
          <button onClick={() => setViewMode("week")} className={`font-body text-xs px-3 py-1 rounded ${viewMode === "week" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Week</button>
          <button onClick={() => setViewMode("month")} className={`font-body text-xs px-3 py-1 rounded ${viewMode === "month" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Month</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDropDialog({ confirmDrop, setConfirmDrop, onConfirm }: { confirmDrop: any; setConfirmDrop: (v: any) => void; onConfirm: () => void }) {
  if (!confirmDrop) return null;
  return (
    <Dialog open={!!confirmDrop} onOpenChange={(open) => !open && setConfirmDrop(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Confirm Reschedule</DialogTitle>
        </DialogHeader>
        <p className="font-body text-sm text-muted-foreground">
          Move <strong>{confirmDrop.booking.patient_name}</strong>'s appointment to{" "}
          <strong>{format(new Date(confirmDrop.newDate + "T00:00:00"), "EEE, MMM d")}</strong> at{" "}
          <strong>{formatTimeShort(confirmDrop.newTime)}</strong>?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setConfirmDrop(null)} className="font-body">Cancel</Button>
          <Button onClick={onConfirm} className="font-body">Confirm Move</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CalendarViewTab;
