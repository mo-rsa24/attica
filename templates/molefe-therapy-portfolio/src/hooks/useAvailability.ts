import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, isBefore, startOfDay, addHours, addDays } from "date-fns";

export interface PractitionerSchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  is_active: boolean;
}

export interface PractitionerBreak {
  id: string;
  schedule_id: string;
  start_time: string;
  end_time: string;
  label: string | null;
}

export interface SchedulingRules {
  buffer_minutes: number;
  min_notice_hours: number;
  max_advance_days: number;
  max_daily_sessions: number;
  cancellation_cutoff_hours: number;
  reschedule_cutoff_hours: number;
  max_reschedules: number;
  allow_same_day_booking: boolean;
}

export interface PublicHoliday {
  id: string;
  date: string;
  name: string;
  is_active: boolean;
}

export interface AvailabilityBlock {
  id: string;
  block_date: string;
  start_time: string | null;
  end_time: string | null;
  is_full_day: boolean;
  reason: string | null;
}

export interface Booking {
  appointment_date: string;
  start_time: string;
  duration_minutes: number;
  status: string;
}

export interface SlotLock {
  appointment_date: string;
  start_time: string;
  duration_minutes: number;
  locked_by: string;
  expires_at: string;
}

const DEFAULT_RULES: SchedulingRules = {
  buffer_minutes: 15,
  min_notice_hours: 24,
  max_advance_days: 60,
  max_daily_sessions: 8,
  cancellation_cutoff_hours: 24,
  reschedule_cutoff_hours: 24,
  max_reschedules: 2,
  allow_same_day_booking: false,
};

export const useAvailability = () => {
  const schedulesQuery = useQuery({
    queryKey: ["practitioner-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practitioner_schedules" as any)
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data as any[] as PractitionerSchedule[];
    },
  });

  const breaksQuery = useQuery({
    queryKey: ["practitioner-breaks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practitioner_breaks" as any)
        .select("*");
      if (error) throw error;
      return data as any[] as PractitionerBreak[];
    },
  });

  const rulesQuery = useQuery({
    queryKey: ["scheduling-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduling_rules" as any)
        .select("*")
        .limit(1)
        .single();
      if (error) return DEFAULT_RULES;
      return data as any as SchedulingRules;
    },
  });

  const holidaysQuery = useQuery({
    queryKey: ["public-holidays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_holidays" as any)
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data as any[] as PublicHoliday[];
    },
  });

  const blocksQuery = useQuery({
    queryKey: ["availability-blocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_blocks")
        .select("*");
      if (error) throw error;
      return data as AvailabilityBlock[];
    },
  });

  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("appointment_date, start_time, duration_minutes, status")
        .neq("status", "cancelled");
      if (error) throw error;
      return data as Booking[];
    },
  });

  const locksQuery = useQuery({
    queryKey: ["slot-locks"],
    queryFn: async () => {
      // Clean expired first
      await supabase.rpc("cleanup_expired_locks" as any);
      const { data, error } = await supabase
        .from("slot_locks" as any)
        .select("appointment_date, start_time, duration_minutes, locked_by, expires_at")
        .gt("expires_at", new Date().toISOString());
      if (error) throw error;
      return data as any[] as SlotLock[];
    },
    refetchInterval: 30000, // refresh locks every 30s
  });

  const schedules = schedulesQuery.data || [];
  const breaks = breaksQuery.data || [];
  const rules = rulesQuery.data || DEFAULT_RULES;
  const holidays = holidaysQuery.data || [];
  const blocks = blocksQuery.data || [];
  const bookings = bookingsQuery.data || [];
  const locks = locksQuery.data || [];

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Check if a date is available (has a schedule, not a holiday, not fully blocked)
  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, "yyyy-MM-dd");

    // Check if practitioner works this day
    const hasSchedule = schedules.some((s) => s.day_of_week === dayOfWeek);
    if (!hasSchedule) return false;

    // Check public holidays
    if (holidays.some((h) => h.date === dateStr)) return false;

    // Check full-day blocks
    if (blocks.some((b) => b.block_date === dateStr && b.is_full_day)) return false;

    // Check if past
    if (isBefore(date, startOfDay(new Date()))) return false;

    // Check min notice
    const minNoticeDate = addHours(new Date(), rules.min_notice_hours);
    if (isBefore(date, startOfDay(minNoticeDate)) && !rules.allow_same_day_booking) {
      // Allow today if same-day booking is enabled
      const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      if (!isToday || !rules.allow_same_day_booking) {
        if (isBefore(date, startOfDay(minNoticeDate))) return false;
      }
    }

    // Check max advance days
    const maxDate = addDays(new Date(), rules.max_advance_days);
    if (date > maxDate) return false;

    return true;
  };

  // Generate available time slots for a given date and duration
  const getAvailableSlots = (date: Date, durationMinutes: number, excludeLockSessionId?: string): string[] => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, "yyyy-MM-dd");

    const daySchedules = schedules.filter((s) => s.day_of_week === dayOfWeek);
    if (daySchedules.length === 0) return [];

    const slots: string[] = [];

    daySchedules.forEach((schedule) => {
      const schedStart = timeToMinutes(schedule.start_time);
      const schedEnd = timeToMinutes(schedule.end_time);

      // Get breaks for this schedule
      const schedBreaks = breaks.filter((b) => b.schedule_id === schedule.id);

      // Generate 30-minute interval slots
      for (let t = schedStart; t + durationMinutes <= schedEnd; t += 30) {
        const slotTime = `${Math.floor(t / 60).toString().padStart(2, "0")}:${(t % 60).toString().padStart(2, "0")}:00`;
        const slotEnd = t + durationMinutes;

        // Check breaks
        const inBreak = schedBreaks.some((b) => {
          const bStart = timeToMinutes(b.start_time);
          const bEnd = timeToMinutes(b.end_time);
          return t < bEnd && slotEnd > bStart;
        });
        if (inBreak) continue;

        // Check availability blocks (partial)
        const inBlock = blocks.some((b) => {
          if (b.block_date !== dateStr || b.is_full_day) return false;
          if (!b.start_time || !b.end_time) return false;
          const bStart = timeToMinutes(b.start_time);
          const bEnd = timeToMinutes(b.end_time);
          return t < bEnd && slotEnd > bStart;
        });
        if (inBlock) continue;

        // Check existing bookings (with buffer)
        const buffer = rules.buffer_minutes;
        const taken = bookings.some((b) => {
          if (b.appointment_date !== dateStr) return false;
          const bStart = timeToMinutes(b.start_time);
          const bEnd = bStart + b.duration_minutes;
          // Slot can't overlap booking + buffer
          return t < bEnd + buffer && slotEnd + buffer > bStart;
        });
        if (taken) continue;

        // Check active slot locks (exclude own session)
        const locked = locks.some((l) => {
          if (l.appointment_date !== dateStr) return false;
          if (excludeLockSessionId && l.locked_by === excludeLockSessionId) return false;
          const lStart = timeToMinutes(l.start_time);
          const lEnd = lStart + l.duration_minutes;
          return t < lEnd + buffer && slotEnd + buffer > lStart;
        });
        if (locked) continue;

        // Check min notice for today
        if (format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) {
          const now = new Date();
          const slotDate = new Date(date);
          slotDate.setHours(Math.floor(t / 60), t % 60, 0, 0);
          const minNotice = addHours(now, rules.min_notice_hours);
          if (isBefore(slotDate, minNotice)) continue;
        }

        slots.push(slotTime);
      }
    });

    // Check max daily sessions
    const existingCount = bookings.filter((b) => b.appointment_date === dateStr).length;
    if (existingCount >= rules.max_daily_sessions) return [];

    return slots;
  };

  return {
    schedules,
    breaks,
    rules,
    holidays,
    blocks,
    bookings,
    isDateAvailable,
    getAvailableSlots,
    locks,
    refetchBookings: bookingsQuery.refetch,
    refetchLocks: locksQuery.refetch,
    isLoading:
      schedulesQuery.isLoading ||
      breaksQuery.isLoading ||
      rulesQuery.isLoading ||
      holidaysQuery.isLoading ||
      blocksQuery.isLoading ||
      bookingsQuery.isLoading ||
      locksQuery.isLoading,
  };
};
