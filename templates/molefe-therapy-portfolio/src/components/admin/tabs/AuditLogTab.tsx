import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Shield, Search } from "lucide-react";

const ACTION_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  INSERT: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
};

const TABLE_LABELS: Record<string, string> = {
  bookings: "Appointment",
  session_notes: "Session Note",
  booking_series: "Series",
  patients: "Patient",
};

const AuditLogTab = () => {
  const [tableFilter, setTableFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-audit-log", tableFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_log" as any)
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(200);

      if (tableFilter !== "all") {
        query = query.eq("table_name", tableFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const filtered = search
    ? logs.filter((l: any) => {
        const s = search.toLowerCase();
        const newData = JSON.stringify(l.new_data || {}).toLowerCase();
        const oldData = JSON.stringify(l.old_data || {}).toLowerCase();
        return newData.includes(s) || oldData.includes(s) || l.table_name.includes(s);
      })
    : logs;

  const getSummary = (log: any) => {
    const data = log.new_data || log.old_data || {};
    const name = data.patient_name || data.name || data.first_name
      ? `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.patient_name || data.name
      : null;
    const parts: string[] = [];
    if (name) parts.push(name);
    if (data.appointment_date) parts.push(data.appointment_date);
    if (data.service_type) parts.push(data.service_type);
    if (data.status) parts.push(data.status);
    return parts.join(" · ") || log.record_id?.slice(0, 8);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Audit Log</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="font-body pl-9"
          />
        </div>
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="font-body w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-body">All Tables</SelectItem>
            <SelectItem value="bookings" className="font-body">Appointments</SelectItem>
            <SelectItem value="session_notes" className="font-body">Session Notes</SelectItem>
            <SelectItem value="booking_series" className="font-body">Series</SelectItem>
            <SelectItem value="patients" className="font-body">Patients</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="font-body text-muted-foreground">Loading audit log...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="font-body text-muted-foreground">No audit entries found</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((log: any) => (
            <div key={log.id} className="bg-card rounded-xl border p-4 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={ACTION_COLORS[log.action] || "outline"} className="font-body text-xs">
                  {log.action}
                </Badge>
                <Badge variant="outline" className="font-body text-xs">
                  {TABLE_LABELS[log.table_name] || log.table_name}
                </Badge>
                <span className="font-body text-xs text-muted-foreground ml-auto">
                  {format(new Date(log.changed_at), "MMM d, yyyy · h:mm a")}
                </span>
              </div>
              <p className="font-body text-sm text-foreground">{getSummary(log)}</p>
              {log.action === "UPDATE" && log.old_data && log.new_data && (
                <ChangedFields old={log.old_data} new={log.new_data} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HIDDEN_FIELDS = new Set(["access_token", "access_token_created_at", "email_verification_token", "verification_code", "verification_code_expires_at"]);

const ChangedFields = ({ old: oldData, new: newData }: { old: any; new: any }) => {
  const changes: { field: string; from: any; to: any }[] = [];
  for (const key of Object.keys(newData)) {
    if (HIDDEN_FIELDS.has(key)) continue;
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes.push({ field: key, from: oldData[key], to: newData[key] });
    }
  }
  if (changes.length === 0) return null;

  return (
    <div className="mt-1 space-y-0.5">
      {changes.slice(0, 5).map((c) => (
        <p key={c.field} className="font-body text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{c.field.replace(/_/g, " ")}</span>:{" "}
          <span className="line-through">{String(c.from ?? "—")}</span>{" → "}
          <span>{String(c.to ?? "—")}</span>
        </p>
      ))}
      {changes.length > 5 && (
        <p className="font-body text-xs text-muted-foreground">+{changes.length - 5} more changes</p>
      )}
    </div>
  );
};

export default AuditLogTab;
