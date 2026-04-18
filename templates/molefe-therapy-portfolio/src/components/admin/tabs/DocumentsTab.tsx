import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Download, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PatientDoc {
  id: string;
  patient_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  id_document: "ID Document",
  referral: "Referral Letter",
  medical_report: "Medical Report",
  insurance: "Medical Aid",
  other: "Other",
};

const DocumentsTab = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: docs = [], refetch } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_documents" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[] as PatientDoc[];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["admin-patients-docs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients" as any).select("id, first_name, last_name");
      if (error) throw error;
      return data as any[];
    },
  });

  const patientMap = new Map(patients.map((p: any) => [p.id, `${p.first_name} ${p.last_name}`]));

  const filtered = docs.filter((d) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = patientMap.get(d.patient_id) || "";
    return name.toLowerCase().includes(q) || d.file_name.toLowerCase().includes(q) || d.document_type.toLowerCase().includes(q);
  });

  const handleDownload = async (doc: PatientDoc) => {
    const { data, error } = await supabase.storage
      .from("patient-documents")
      .createSignedUrl(doc.file_path, 60);
    if (error || !data?.signedUrl) {
      toast({ title: "Could not generate download link.", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (doc: PatientDoc) => {
    if (!confirm(`Delete "${doc.file_name}"?`)) return;
    await supabase.storage.from("patient-documents").remove([doc.file_path]);
    await supabase.from("patient_documents" as any).delete().eq("id", doc.id);
    refetch();
    toast({ title: "Document deleted." });
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Documents ({docs.length})</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." className="pl-9 font-body" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="font-body text-muted-foreground">No documents found.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/30">
                  <th className="text-left px-4 py-3 font-body font-semibold text-foreground">Patient</th>
                  <th className="text-left px-4 py-3 font-body font-semibold text-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-body font-semibold text-foreground">File</th>
                  <th className="text-left px-4 py-3 font-body font-semibold text-foreground">Size</th>
                  <th className="text-left px-4 py-3 font-body font-semibold text-foreground">Uploaded</th>
                  <th className="text-right px-4 py-3 font-body font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-body text-foreground">{patientMap.get(doc.patient_id) || "Unknown"}</td>
                    <td className="px-4 py-3 font-body text-muted-foreground">{DOC_TYPE_LABELS[doc.document_type] || doc.document_type}</td>
                    <td className="px-4 py-3 font-body text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate max-w-[200px]">{doc.file_name}</span>
                    </td>
                    <td className="px-4 py-3 font-body text-muted-foreground">{formatSize(doc.file_size_bytes)}</td>
                    <td className="px-4 py-3 font-body text-muted-foreground">{format(new Date(doc.created_at), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} className="h-8 w-8 p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;
