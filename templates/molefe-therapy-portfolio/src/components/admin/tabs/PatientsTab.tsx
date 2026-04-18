import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, User, Shield, Phone, ClipboardList } from "lucide-react";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  email_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

interface Consent {
  id: string;
  patient_id: string;
  consent_type: string;
  accepted: boolean;
  accepted_at: string | null;
}

interface EmergencyContact {
  id: string;
  patient_id: string;
  name: string;
  relationship: string | null;
  phone: string;
}

const PatientsTab = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: patients = [] } = useQuery({
    queryKey: ["admin-patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[] as Patient[];
    },
  });

  const { data: consents = [] } = useQuery({
    queryKey: ["admin-consents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patient_consents" as any).select("*");
      if (error) throw error;
      return data as any[] as Consent[];
    },
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("emergency_contacts" as any).select("*");
      if (error) throw error;
      return data as any[] as EmergencyContact[];
    },
  });

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.first_name.toLowerCase().includes(q) || p.last_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Patients ({patients.length})</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients..." className="pl-9 font-body" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center"><p className="font-body text-muted-foreground">No patients found.</p></div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => {
            const patientConsents = consents.filter((c) => c.patient_id === p.id);
            const patientContacts = contacts.filter((c) => c.patient_id === p.id);
            const isExpanded = expanded === p.id;

            return (
              <div key={p.id} className="bg-card rounded-xl border overflow-hidden">
                <button onClick={() => setExpanded(isExpanded ? null : p.id)} className="w-full p-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground">{p.first_name} {p.last_name}</p>
                    <p className="font-body text-xs text-muted-foreground truncate">{p.email} {p.phone && `· ${p.phone}`}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.email_verified ? (
                      <span className="flex items-center gap-1 font-body text-xs text-primary"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                    ) : (
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><XCircle className="w-3.5 h-3.5" /> Unverified</span>
                    )}
                    <span className="font-body text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM d, yyyy")}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t bg-background/50 space-y-4 pt-4">
                    {/* Consents */}
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground flex items-center gap-1 mb-2"><Shield className="w-4 h-4 text-primary" /> Consents</p>
                      {patientConsents.length === 0 ? (
                        <p className="font-body text-xs text-muted-foreground ml-5">No consents on file</p>
                      ) : (
                        <div className="ml-5 space-y-1">
                          {patientConsents.map((c) => (
                            <div key={c.id} className="flex items-center gap-2 font-body text-xs">
                              {c.accepted ? <CheckCircle className="w-3 h-3 text-primary" /> : <XCircle className="w-3 h-3 text-destructive" />}
                              <span className="capitalize">{c.consent_type.replace("_", " ")}</span>
                              {c.accepted_at && <span className="text-muted-foreground">· {format(new Date(c.accepted_at), "MMM d, yyyy")}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Emergency Contacts */}
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground flex items-center gap-1 mb-2"><Phone className="w-4 h-4 text-primary" /> Emergency Contacts</p>
                      {patientContacts.length === 0 ? (
                        <p className="font-body text-xs text-muted-foreground ml-5">None on file</p>
                      ) : (
                        <div className="ml-5 space-y-1">
                          {patientContacts.map((c) => (
                            <p key={c.id} className="font-body text-xs text-foreground">
                              {c.name} {c.relationship && `(${c.relationship})`} · {c.phone}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientsTab;
