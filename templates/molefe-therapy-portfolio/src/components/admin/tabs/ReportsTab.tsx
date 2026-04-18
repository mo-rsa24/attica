import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FileDown, FileText, Receipt, Send } from "lucide-react";
import { generateProgressReport } from "@/lib/pdf/progressReport";
import { generateReferralLetter } from "@/lib/pdf/referralLetter";
import { generateInvoice } from "@/lib/pdf/invoice";

type ReportType = "progress" | "referral" | "invoice";

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "progress", label: "Progress Report", icon: <FileText className="w-5 h-5" />, desc: "Clinical summary with session history, notes, and assessment scores" },
  { value: "referral", label: "Referral Letter", icon: <Send className="w-5 h-5" />, desc: "Formal referral letter to another practitioner" },
  { value: "invoice", label: "Invoice", icon: <Receipt className="w-5 h-5" />, desc: "Tax invoice for completed sessions" },
];

const ReportsTab = () => {
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [reportType, setReportType] = useState<ReportType | "">("");
  const [showDialog, setShowDialog] = useState(false);

  // Referral form state
  const [referTo, setReferTo] = useState({ name: "", practice: "", specialty: "" });
  const [referReason, setReferReason] = useState("");
  const [referSummary, setReferSummary] = useState("");
  const [referTreatment, setReferTreatment] = useState("");
  const [referUrgency, setReferUrgency] = useState<"routine" | "urgent" | "emergency">("routine");

  // Date range for progress report
  const [dateFrom, setDateFrom] = useState(format(new Date(Date.now() - 90 * 86400000), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));

  // Invoice notes
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const { data: patients = [] } = useQuery({
    queryKey: ["admin-patients-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").order("last_name");
      if (error) throw error;
      return data;
    },
  });

  const selectedPatient = patients.find((p: any) => p.id === selectedPatientId);

  const handleGenerate = async () => {
    if (!selectedPatient || !reportType) return;

    try {
      if (reportType === "progress") {
        const [bookingsRes, notesRes, assessRes] = await Promise.all([
          supabase.from("bookings").select("*").eq("patient_id", selectedPatientId)
            .gte("appointment_date", dateFrom).lte("appointment_date", dateTo)
            .order("appointment_date", { ascending: false }),
          supabase.from("session_notes").select("*")
            .in("booking_id", (await supabase.from("bookings").select("id").eq("patient_id", selectedPatientId)).data?.map((b: any) => b.id) || [])
            .order("created_at", { ascending: false }),
          supabase.from("patient_assessments").select("*").eq("patient_id", selectedPatientId)
            .order("created_at", { ascending: false }),
        ]);

        generateProgressReport({
          patient: selectedPatient,
          bookings: bookingsRes.data || [],
          notes: notesRes.data || [],
          assessments: assessRes.data || [],
          dateRange: { from: dateFrom, to: dateTo },
        });
        toast({ title: "Progress report downloaded" });

      } else if (reportType === "referral") {
        if (!referTo.name || !referReason) {
          toast({ title: "Please fill in referral details", variant: "destructive" });
          return;
        }
        generateReferralLetter({
          patient: selectedPatient,
          referTo,
          reason: referReason,
          clinicalSummary: referSummary,
          currentTreatment: referTreatment,
          urgency: referUrgency,
        });
        toast({ title: "Referral letter downloaded" });

      } else if (reportType === "invoice") {
        const { data: bookings } = await supabase.from("bookings").select("*")
          .eq("patient_id", selectedPatientId).eq("status", "completed")
          .gte("appointment_date", dateFrom).lte("appointment_date", dateTo)
          .order("appointment_date");

        const { data: services } = await supabase.from("service_types").select("*");
        const serviceMap = new Map((services || []).map((s: any) => [s.name, s]));

        const sessions = (bookings || []).map((b: any) => {
          const svc = serviceMap.get(b.service_type);
          return {
            date: b.appointment_date,
            time: b.start_time,
            service: b.service_type,
            duration: b.duration_minutes,
            priceCents: svc?.price_cents || 0,
          };
        });

        if (sessions.length === 0) {
          toast({ title: "No completed sessions in date range", variant: "destructive" });
          return;
        }

        const invoiceNum = `INV-${format(new Date(), "yyyyMMdd")}-${selectedPatient.last_name.substring(0, 3).toUpperCase()}`;
        generateInvoice({
          patient: selectedPatient,
          invoiceNumber: invoiceNum,
          sessions,
          notes: invoiceNotes || undefined,
        });
        toast({ title: "Invoice downloaded" });
      }

      setShowDialog(false);
    } catch (err: any) {
      toast({ title: err.message || "Failed to generate report", variant: "destructive" });
    }
  };

  const openReportDialog = (type: ReportType) => {
    if (!selectedPatientId) {
      toast({ title: "Please select a patient first", variant: "destructive" });
      return;
    }
    setReportType(type);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileDown className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Reports & PDF Export</h2>
      </div>

      {/* Patient selector */}
      <div className="bg-card rounded-xl border p-5 space-y-4">
        <Label className="font-body">Select Patient</Label>
        <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
          <SelectTrigger className="font-body max-w-md">
            <SelectValue placeholder="Choose a patient..." />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p: any) => (
              <SelectItem key={p.id} value={p.id} className="font-body">
                {p.last_name}, {p.first_name} — {p.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPatient && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-body text-xs">
              {selectedPatient.first_name} {selectedPatient.last_name}
            </Badge>
            <Badge variant="secondary" className="font-body text-xs">{selectedPatient.email}</Badge>
          </div>
        )}
      </div>

      {/* Report type cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {REPORT_TYPES.map((rt) => (
          <button
            key={rt.value}
            onClick={() => openReportDialog(rt.value)}
            className="bg-card rounded-xl border p-5 text-left hover:border-primary/50 hover:shadow-sm transition-all space-y-2 group"
          >
            <div className="flex items-center gap-2 text-primary group-hover:text-primary/80">
              {rt.icon}
              <span className="font-display font-semibold text-foreground">{rt.label}</span>
            </div>
            <p className="font-body text-xs text-muted-foreground">{rt.desc}</p>
          </button>
        ))}
      </div>

      {/* Generation dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {REPORT_TYPES.find(r => r.value === reportType)?.label}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Date range for progress & invoice */}
            {(reportType === "progress" || reportType === "invoice") && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-body">From</Label>
                  <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="font-body" />
                </div>
                <div>
                  <Label className="font-body">To</Label>
                  <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="font-body" />
                </div>
              </div>
            )}

            {/* Invoice notes */}
            {reportType === "invoice" && (
              <div>
                <Label className="font-body">Notes (optional)</Label>
                <Input value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} placeholder="e.g. Medical aid claim ref" className="font-body" />
              </div>
            )}

            {/* Referral fields */}
            {reportType === "referral" && (
              <>
                <div>
                  <Label className="font-body">Refer To (Name)</Label>
                  <Input value={referTo.name} onChange={e => setReferTo({ ...referTo, name: e.target.value })} placeholder="Dr. Jane Smith" className="font-body" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-body">Practice</Label>
                    <Input value={referTo.practice} onChange={e => setReferTo({ ...referTo, practice: e.target.value })} placeholder="Sandton Psychiatry" className="font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Specialty</Label>
                    <Input value={referTo.specialty} onChange={e => setReferTo({ ...referTo, specialty: e.target.value })} placeholder="Psychiatrist" className="font-body" />
                  </div>
                </div>
                <div>
                  <Label className="font-body">Urgency</Label>
                  <Select value={referUrgency} onValueChange={(v: any) => setReferUrgency(v)}>
                    <SelectTrigger className="font-body"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine" className="font-body">Routine</SelectItem>
                      <SelectItem value="urgent" className="font-body">Urgent</SelectItem>
                      <SelectItem value="emergency" className="font-body">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-body">Reason for Referral</Label>
                  <Textarea value={referReason} onChange={e => setReferReason(e.target.value)} rows={3} className="font-body" placeholder="Primary reason for referral..." />
                </div>
                <div>
                  <Label className="font-body">Clinical Summary</Label>
                  <Textarea value={referSummary} onChange={e => setReferSummary(e.target.value)} rows={3} className="font-body" placeholder="Brief clinical history..." />
                </div>
                <div>
                  <Label className="font-body">Current Treatment</Label>
                  <Textarea value={referTreatment} onChange={e => setReferTreatment(e.target.value)} rows={2} className="font-body" placeholder="Current interventions..." />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="font-body">Cancel</Button>
            <Button onClick={handleGenerate} className="font-body gap-2">
              <FileDown className="w-4 h-4" /> Generate PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsTab;
