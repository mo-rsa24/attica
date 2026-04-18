import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SlotLockOptions {
  appointmentDate: Date;
  startTime: string;
  durationMinutes: number;
  lockDurationMinutes?: number; // default 10
}

export const useSlotLock = () => {
  const [lockId, setLockId] = useState<string | null>(null);
  const [lockExpiry, setLockExpiry] = useState<Date | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sessionId = useRef(crypto.randomUUID()).current;

  const acquireLock = useCallback(async (opts: SlotLockOptions): Promise<boolean> => {
    const lockMins = opts.lockDurationMinutes ?? 10;
    setIsLocking(true);

    // Clean expired locks first
    await supabase.rpc("cleanup_expired_locks" as any);

    const dateStr = format(opts.appointmentDate, "yyyy-MM-dd");

    // Check for existing active lock on this slot
    const { data: existing } = await supabase
      .from("slot_locks" as any)
      .select("*")
      .eq("appointment_date", dateStr)
      .eq("start_time", opts.startTime)
      .gt("expires_at", new Date().toISOString());

    if (existing && existing.length > 0) {
      // Slot is locked by someone else
      const otherLock = (existing as any[]).find((l) => l.locked_by !== sessionId);
      if (otherLock) {
        setIsLocking(false);
        return false;
      }
    }

    const expiresAt = new Date(Date.now() + lockMins * 60 * 1000);

    const { data, error } = await supabase
      .from("slot_locks" as any)
      .insert({
        appointment_date: dateStr,
        start_time: opts.startTime,
        duration_minutes: opts.durationMinutes,
        locked_by: sessionId,
        expires_at: expiresAt.toISOString(),
      } as any)
      .select("id")
      .single();

    setIsLocking(false);

    if (error) {
      console.error("Failed to acquire lock:", error);
      return false;
    }

    setLockId((data as any).id);
    setLockExpiry(expiresAt);
    return true;
  }, [sessionId]);

  const releaseLock = useCallback(async () => {
    if (!lockId) return;
    await supabase.from("slot_locks" as any).delete().eq("id", lockId);
    setLockId(null);
    setLockExpiry(null);
  }, [lockId]);

  const extendLock = useCallback(async (extraMinutes = 5) => {
    if (!lockId) return;
    const newExpiry = new Date(Date.now() + extraMinutes * 60 * 1000);
    await supabase
      .from("slot_locks" as any)
      .update({ expires_at: newExpiry.toISOString() } as any)
      .eq("id", lockId);
    setLockExpiry(newExpiry);
  }, [lockId]);

  // Auto-extend lock every 4 minutes while active
  useEffect(() => {
    if (lockId) {
      intervalRef.current = setInterval(() => {
        extendLock(5);
      }, 4 * 60 * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lockId, extendLock]);

  // Release lock on unmount
  useEffect(() => {
    return () => {
      if (lockId) {
        supabase.from("slot_locks" as any).delete().eq("id", lockId);
      }
    };
  }, [lockId]);

  return {
    lockId,
    lockExpiry,
    isLocking,
    sessionId,
    acquireLock,
    releaseLock,
    extendLock,
  };
};
