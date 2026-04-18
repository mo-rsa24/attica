import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ClipboardCheck, ChevronDown, ChevronUp } from "lucide-react";

interface Assessment {
  id: string;
  patient_id: string;
  assessment_type: string;
  responses: number[];
  total_score: number;
  severity: string | null;
  administered_by: string;
  completed_at: string | null;
  created_at: string;
}

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly, or being fidgety/restless",
  "Thoughts that you would be better off dead, or of hurting yourself",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];

const RESPONSE_LABELS = ["Not at all", "Several days", "More than half", "Nearly every day"];

function getSeverityColor(severity: string | null): string {
  switch (severity) {
    case "minimal": return "bg-primary/10 text-primary";
    case "mild": return "bg-yellow-100 text-yellow-700";
    case "moderate": return "bg-orange-100 text-orange-700";
    case "moderately_severe": return "bg-red-100 text-red-600";
    case "severe": return "bg-destructive/10 text-destructive";
    default: return "bg-secondary text-muted-foreground";
  }
}

const AssessmentsTab = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: assessments = [] } = useQuery({
    queryKey: ["admin-assessments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_assessments" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[] as Assessment[];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["admin-patients-assess"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients" as any).select("id, first_name, last_name");
      if (error) throw error;
      return data as any[];
    },
  });

  const patientMap = new Map(patients.map((p: any) => [p.id, `${p.first_name} ${p.last_name}`]));

  const filtered = assessments.filter((a) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = patientMap.get(a.patient_id) || "";
    return name.toLowerCase().includes(q) || a.assessment_type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Assessments ({assessments.length})</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assessments..." className="pl-9 font-body" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="font-body text-muted-foreground">No assessments found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((a) => {
            const isExpanded = expanded === a.id;
            const questions = a.assessment_type === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
            const maxScore = a.assessment_type === "phq9" ? 27 : 21;
            const severityLabel = a.severity?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

            return (
              <div key={a.id} className="bg-card rounded-xl border overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : a.id)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground">{patientMap.get(a.patient_id) || "Unknown"}</p>
                    <p className="font-body text-xs text-muted-foreground">
                      {a.assessment_type.toUpperCase()} · {a.administered_by === "self" ? "Self-reported" : "Clinician"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-body text-lg font-bold text-foreground">{a.total_score}<span className="text-xs font-normal text-muted-foreground">/{maxScore}</span></span>
                    <span className={`font-body text-xs px-2 py-0.5 rounded-full capitalize ${getSeverityColor(a.severity)}`}>
                      {severityLabel}
                    </span>
                    <span className="font-body text-xs text-muted-foreground">
                      {format(new Date(a.created_at), "MMM d, yyyy")}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t bg-background/50 pt-4">
                    <div className="space-y-2">
                      {questions.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 font-body text-xs">
                          <span className="text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                          <span className="text-foreground flex-1">{q}</span>
                          <span className={`shrink-0 font-semibold ${(a.responses[i] ?? 0) >= 2 ? "text-orange-500" : "text-muted-foreground"}`}>
                            {a.responses[i] ?? 0} — {RESPONSE_LABELS[a.responses[i] ?? 0]}
                          </span>
                        </div>
                      ))}
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

export default AssessmentsTab;
