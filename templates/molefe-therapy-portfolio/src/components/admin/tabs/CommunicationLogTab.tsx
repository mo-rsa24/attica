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
import { MessageSquare, Mail, Phone, Search } from "lucide-react";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-3.5 h-3.5" />,
  sms: <Phone className="w-3.5 h-3.5" />,
  whatsapp: <MessageSquare className="w-3.5 h-3.5" />,
};

const CHANNEL_COLORS: Record<string, string> = {
  email: "bg-blue-50 text-blue-700 border-blue-200",
  sms: "bg-green-50 text-green-700 border-green-200",
  whatsapp: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const CommunicationLogTab = () => {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");

  const { data: logs = [] } = useQuery({
    queryKey: ["communication-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communication_log" as any)
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["comms-patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, first_name, last_name, email");
      if (error) throw error;
      return data;
    },
  });

  const patientMap = new Map(patients.map((p: any) => [p.id, p]));

  const filtered = logs.filter((l: any) => {
    if (channelFilter !== "all" && l.channel !== channelFilter) return false;
    if (search) {
      const patient = l.patient_id ? patientMap.get(l.patient_id) : null;
      const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "";
      const haystack = `${patientName} ${l.subject || ""} ${l.body || ""}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Communication Log</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient or subject..." className="font-body pl-9" />
        </div>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="font-body w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-body">All Channels</SelectItem>
            <SelectItem value="email" className="font-body">Email</SelectItem>
            <SelectItem value="sms" className="font-body">SMS</SelectItem>
            <SelectItem value="whatsapp" className="font-body">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log entries */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="font-body text-muted-foreground">No communication records found</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Records will appear here as emails, SMS, and WhatsApp messages are sent to patients.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log: any) => {
            const patient = log.patient_id ? patientMap.get(log.patient_id) : null;
            const channelCls = CHANNEL_COLORS[log.channel] || "";

            return (
              <div key={log.id} className="bg-card rounded-lg border p-4 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${channelCls}`}>
                    {CHANNEL_ICONS[log.channel]}
                    {log.channel.toUpperCase()}
                  </div>
                  <Badge variant={log.status === "sent" ? "secondary" : log.status === "failed" ? "destructive" : "outline"} className="font-body text-[10px]">
                    {log.status}
                  </Badge>
                  <Badge variant="outline" className="font-body text-[10px]">{log.direction}</Badge>
                  <span className="font-body text-[10px] text-muted-foreground ml-auto">
                    {format(new Date(log.sent_at), "MMM d, yyyy · h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {patient && (
                    <span className="font-body text-sm font-medium text-foreground">
                      {patient.first_name} {patient.last_name}
                    </span>
                  )}
                  {log.subject && (
                    <span className="font-body text-sm text-muted-foreground">— {log.subject}</span>
                  )}
                </div>
                {log.body && (
                  <p className="font-body text-xs text-muted-foreground line-clamp-2">{log.body}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunicationLogTab;
