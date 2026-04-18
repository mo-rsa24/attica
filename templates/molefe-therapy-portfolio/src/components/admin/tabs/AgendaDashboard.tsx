import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  ListOrdered,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";

const formatTimeDisplay = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  requested: { label: "Requested", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  no_show: { label: "No-Show", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const AgendaDashboard = () => {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const { data: todayBookings = [] } = useQuery({
    queryKey: ["agenda-today", todayStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("appointment_date", todayStr)
        .neq("status", "cancelled")
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["agenda-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = format(new Date(Date.now() - 30 * 86400000), "yyyy-MM-dd");
      
      const [allBookings, waitlist, patients] = await Promise.all([
        supabase.from("bookings").select("status, appointment_date, service_type, duration_minutes").gte("appointment_date", thirtyDaysAgo),
        supabase.from("waitlist").select("id").eq("status", "waiting"),
        supabase.from("patients").select("id"),
      ]);

      const bks = allBookings.data || [];
      const completed = bks.filter(b => b.status === "completed").length;
      const cancelled = bks.filter(b => b.status === "cancelled").length;
      const noShows = bks.filter(b => b.status === "no_show").length;
      const total = bks.length;
      const cancelRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
      const noShowRate = total > 0 ? Math.round((noShows / total) * 100) : 0;

      // Upcoming this week
      const weekEnd = format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd");
      const upcoming = bks.filter(b => b.appointment_date >= todayStr && b.appointment_date <= weekEnd && !["cancelled", "completed", "no_show"].includes(b.status)).length;

      return {
        completed,
        cancelled,
        noShows,
        cancelRate,
        noShowRate,
        upcoming,
        waitlistCount: waitlist.data?.length || 0,
        totalPatients: patients.data?.length || 0,
      };
    },
  });

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">
          Today's Agenda — {format(now, "EEEE, MMMM d")}
        </h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<CalendarDays className="w-4 h-4" />} label="Today" value={todayBookings.length} sub="sessions" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="This Week" value={stats?.upcoming ?? 0} sub="upcoming" />
        <StatCard icon={<Users className="w-4 h-4" />} label="Patients" value={stats?.totalPatients ?? 0} sub="total" />
        <StatCard icon={<ListOrdered className="w-4 h-4" />} label="Waitlist" value={stats?.waitlistCount ?? 0} sub="waiting" />
      </div>

      {/* 30-day performance */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat icon={<CheckCircle2 className="w-4 h-4 text-green-600" />} label="Completed (30d)" value={stats?.completed ?? 0} />
        <MiniStat icon={<XCircle className="w-4 h-4 text-destructive" />} label={`Cancelled (${stats?.cancelRate ?? 0}%)`} value={stats?.cancelled ?? 0} />
        <MiniStat icon={<Ban className="w-4 h-4 text-orange-500" />} label={`No-Shows (${stats?.noShowRate ?? 0}%)`} value={stats?.noShows ?? 0} />
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="font-display text-sm font-semibold text-foreground mb-4">Today's Timeline</h3>
        {todayBookings.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground text-center py-6">No appointments today</p>
        ) : (
          <div className="relative space-y-0">
            {/* Time line */}
            <div className="absolute left-[52px] top-0 bottom-0 w-px bg-border" />
            {todayBookings.map((b: any, i: number) => {
              const isPast = b.start_time < currentTime && b.status !== "completed";
              const isCurrent = b.start_time <= currentTime && (() => {
                const [h, m] = b.start_time.split(":").map(Number);
                const endMin = h * 60 + m + b.duration_minutes;
                const nowMin = now.getHours() * 60 + now.getMinutes();
                return nowMin < endMin;
              })();
              const badge = STATUS_BADGE[b.status] || STATUS_BADGE.requested;

              return (
                <div key={b.id} className={`relative flex items-start gap-4 py-3 ${isCurrent ? "bg-primary/5 -mx-5 px-5 rounded-lg" : ""}`}>
                  {/* Time */}
                  <div className="w-[44px] text-right shrink-0">
                    <span className={`font-body text-xs font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                      {formatTimeDisplay(b.start_time)}
                    </span>
                  </div>
                  {/* Dot */}
                  <div className={`w-3 h-3 rounded-full border-2 mt-0.5 shrink-0 z-10 ${isCurrent ? "bg-primary border-primary animate-pulse" : b.status === "completed" ? "bg-green-500 border-green-500" : "bg-background border-border"}`} />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body font-semibold text-sm text-foreground">{b.patient_name}</span>
                      <Badge variant={badge.variant} className="font-body text-[10px]">{badge.label}</Badge>
                      {isCurrent && <Badge className="font-body text-[10px] bg-primary">Now</Badge>}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      {b.service_type} · {b.duration_minutes}min · {b.patient_phone}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub: string }) {
  return (
    <div className="bg-card rounded-xl border p-4 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}<span className="font-body text-xs">{label}</span></div>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="font-body text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-card rounded-lg border p-3 flex items-center gap-3">
      {icon}
      <div>
        <p className="font-display text-lg font-bold text-foreground">{value}</p>
        <p className="font-body text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default AgendaDashboard;
