import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Upload, FileText, X, Loader2 } from "lucide-react";

interface DocumentUploadStepProps {
  patientId: string;
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const DOC_TYPES = [
  { value: "id_document", label: "ID Document" },
  { value: "referral", label: "Referral Letter" },
  { value: "medical_report", label: "Medical Report" },
  { value: "insurance", label: "Medical Aid / Insurance" },
  { value: "other", label: "Other" },
];

interface UploadedDoc {
  id: string;
  fileName: string;
  docType: string;
}

const DocumentUploadStep = ({ patientId, onComplete, onSkip, onBack }: DocumentUploadStepProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("id_document");
  const [uploaded, setUploaded] = useState<UploadedDoc[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large. Max 10MB.", variant: "destructive" });
      return;
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Only PDF, JPG, PNG, or WebP files are allowed.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const filePath = `${patientId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("patient-documents")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed. Please try again.", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data, error: metaError } = await supabase
      .from("patient_documents" as any)
      .insert({
        patient_id: patientId,
        document_type: docType,
        file_name: file.name,
        file_path: filePath,
        file_size_bytes: file.size,
        mime_type: file.type,
        uploaded_by: "patient",
      } as any)
      .select("id")
      .single();

    setUploading(false);

    if (metaError) {
      toast({ title: "Could not save document info.", variant: "destructive" });
      return;
    }

    setUploaded((prev) => [...prev, { id: (data as any).id, fileName: file.name, docType }]);
    toast({ title: "Document uploaded successfully." });
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-7 h-7 text-primary" />
        </div>
        <h4 className="font-display text-lg font-semibold text-foreground mb-1">Upload Documents</h4>
        <p className="font-body text-sm text-muted-foreground">
          Upload your ID, referral letters, or medical reports. You may skip this step.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="font-body">Document Type</Label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body mt-1"
          >
            {DOC_TYPES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="font-body">Select File (PDF, JPG, PNG — max 10MB)</Label>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleUpload}
            disabled={uploading}
            className="font-body mt-1"
          />
          {uploading && (
            <p className="font-body text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
            </p>
          )}
        </div>

        {uploaded.length > 0 && (
          <div className="space-y-2">
            <Label className="font-body">Uploaded Documents</Label>
            {uploaded.map((doc) => (
              <div key={doc.id} className="flex items-center gap-2 bg-secondary/30 rounded-md px-3 py-2">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="font-body text-sm text-foreground truncate flex-1">{doc.fileName}</span>
                <span className="font-body text-xs text-muted-foreground capitalize">{doc.docType.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="font-body gap-1">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onSkip} className="font-body">
            Skip
          </Button>
          <Button type="button" onClick={onComplete} className="font-body gap-1">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadStep;
