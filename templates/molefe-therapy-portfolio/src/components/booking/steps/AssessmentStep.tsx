import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, ClipboardCheck } from "lucide-react";

interface AssessmentStepProps {
  patientId: string;
  assessmentType: "phq9" | "gad7";
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
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

const RESPONSE_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

function getSeverity(type: "phq9" | "gad7", score: number): string {
  if (type === "phq9") {
    if (score <= 4) return "minimal";
    if (score <= 9) return "mild";
    if (score <= 14) return "moderate";
    if (score <= 19) return "moderately_severe";
    return "severe";
  }
  // GAD-7
  if (score <= 4) return "minimal";
  if (score <= 9) return "mild";
  if (score <= 14) return "moderate";
  return "severe";
}

function getSeverityLabel(severity: string): string {
  return severity.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "minimal": return "text-primary";
    case "mild": return "text-yellow-600";
    case "moderate": return "text-orange-500";
    case "moderately_severe": return "text-red-500";
    case "severe": return "text-destructive";
    default: return "text-muted-foreground";
  }
}

const AssessmentStep = ({ patientId, assessmentType, onComplete, onSkip, onBack }: AssessmentStepProps) => {
  const { toast } = useToast();
  const questions = assessmentType === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const title = assessmentType === "phq9" ? "PHQ-9 (Depression)" : "GAD-7 (Anxiety)";

  const [responses, setResponses] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; severity: string } | null>(null);

  const allAnswered = responses.every((r) => r !== null);
  const totalScore = responses.reduce<number>((sum, r) => sum + (r ?? 0), 0);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setLoading(true);

    const severity = getSeverity(assessmentType, totalScore);

    const { error } = await supabase.from("patient_assessments" as any).insert({
      patient_id: patientId,
      assessment_type: assessmentType,
      responses: responses,
      total_score: totalScore,
      severity,
      administered_by: "self",
      completed_at: new Date().toISOString(),
    } as any);

    setLoading(false);

    if (error) {
      toast({ title: "Could not save assessment.", variant: "destructive" });
      return;
    }

    setResult({ score: totalScore, severity });
  };

  if (result) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <ClipboardCheck className="w-7 h-7 text-primary" />
        </div>
        <h4 className="font-display text-lg font-semibold text-foreground">{title} Complete</h4>
        <div className="bg-card border rounded-xl p-6 space-y-2">
          <p className="font-body text-3xl font-bold text-foreground">{result.score}<span className="text-base font-normal text-muted-foreground">/{assessmentType === "phq9" ? 27 : 21}</span></p>
          <p className={`font-body text-sm font-semibold ${getSeverityColor(result.severity)}`}>
            {getSeverityLabel(result.severity)}
          </p>
        </div>
        <p className="font-body text-xs text-muted-foreground">
          This score will be shared with Dr. Molefe to inform your treatment.
        </p>
        <Button onClick={onComplete} className="font-body gap-1">
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="w-7 h-7 text-primary" />
        </div>
        <h4 className="font-display text-lg font-semibold text-foreground mb-1">{title}</h4>
        <p className="font-body text-sm text-muted-foreground">
          Over the last 2 weeks, how often have you been bothered by the following?
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="bg-card border rounded-lg p-4">
            <p className="font-body text-sm text-foreground mb-3">
              {i + 1}. {q}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RESPONSE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const next = [...responses];
                    next[i] = opt.value;
                    setResponses(next);
                  }}
                  className={`font-body text-xs px-2 py-2 rounded-md border transition-colors ${
                    responses[i] === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-secondary/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allAnswered && (
        <div className="text-center">
          <p className="font-body text-sm text-muted-foreground">
            Preliminary score: <span className="font-semibold text-foreground">{totalScore}</span>/{assessmentType === "phq9" ? 27 : 21}
          </p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="font-body gap-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onSkip} className="font-body">
            Skip
          </Button>
          <Button type="button" disabled={!allAnswered || loading} onClick={handleSubmit} className="font-body gap-1">
            {loading ? "Saving..." : "Submit"} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentStep;
