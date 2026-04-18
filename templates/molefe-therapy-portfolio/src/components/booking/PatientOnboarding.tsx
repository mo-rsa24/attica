import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ChevronLeft, ChevronRight, Check, Lock } from "lucide-react";
import type { ServiceType } from "@/hooks/useServiceTypes";
import { useSlotLock } from "@/hooks/useSlotLock";
import PatientInfoStep from "./steps/PatientInfoStep";
import EmailVerifyStep from "./steps/EmailVerifyStep";
import ConsentStep from "./steps/ConsentStep";
import EmergencyContactStep from "./steps/EmergencyContactStep";
import IntakeStep from "./steps/IntakeStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import AssessmentStep from "./steps/AssessmentStep";

interface PatientOnboardingProps {
  selectedDate: Date;
  selectedSlot: { time: string; duration: number };
  service: ServiceType;
  onSuccess: () => void;
  onBack: () => void;
}

export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
}

const BASE_STEPS = ["Your Details", "Verify Email", "Consent", "Emergency Contact"];
const DOC_STEP = "Documents";
const INTAKE_STEP = "Intake";
const ASSESSMENT_STEPS = ["PHQ-9", "GAD-7"];

const formatTimeDisplay = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

const PatientOnboarding = ({ selectedDate, selectedSlot, service, onSuccess, onBack }: PatientOnboardingProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(false);
  const { lockId, lockExpiry, isLocking, acquireLock, releaseLock } = useSlotLock();
  const [lockFailed, setLockFailed] = useState(false);

  // Acquire lock on mount
  useEffect(() => {
    const doLock = async () => {
      const success = await acquireLock({
        appointmentDate: selectedDate,
        startTime: selectedSlot.time,
        durationMinutes: selectedSlot.duration,
        lockDurationMinutes: 10,
      });
      if (!success) {
        setLockFailed(true);
        toast({ title: "This slot was just taken by another patient. Please choose a different time.", variant: "destructive" });
      }
    };
    doLock();

    return () => {
      releaseLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    releaseLock();
    onBack();
  };

  if (lockFailed) {
    return (
      <div className="bg-card rounded-xl border p-8 text-center space-y-4">
        <Lock className="w-8 h-8 text-destructive mx-auto" />
        <p className="font-body text-foreground font-semibold">Slot Unavailable</p>
        <p className="font-body text-sm text-muted-foreground">
          Another patient is currently booking this time slot. Please go back and choose a different time.
        </p>
        <Button variant="outline" onClick={handleBack} className="font-body">
          ← Choose Another Slot
        </Button>
      </div>
    );
  }

  if (isLocking) {
    return (
      <div className="bg-card rounded-xl border p-8 text-center">
        <p className="font-body text-muted-foreground">Reserving your time slot...</p>
      </div>
    );
  }

  const handlePatientCreated = (data: PatientData) => {
    setPatient(data);
    setCurrentStep(1);
  };

  const handleEmailVerified = () => {
    setCurrentStep(2);
  };

  const handleConsentComplete = () => {
    setCurrentStep(3);
  };

  // Build dynamic step list
  const buildSteps = () => {
    const steps = [...BASE_STEPS];
    steps.push(DOC_STEP); // step 4: documents
    if (service.requires_intake) steps.push(INTAKE_STEP); // step 5
    steps.push(...ASSESSMENT_STEPS); // PHQ-9, GAD-7
    return steps;
  };

  const visibleSteps = buildSteps();

  const handleEmergencyComplete = () => {
    setCurrentStep(4); // always go to documents
  };

  const nextStepAfter = (stepName: string) => {
    const idx = visibleSteps.indexOf(stepName);
    if (idx >= 0 && idx < visibleSteps.length - 1) {
      setCurrentStep(idx + 1);
    } else {
      finalizeBooking();
    }
  };

  const handleIntakeComplete = () => {
    nextStepAfter(INTAKE_STEP);
  };

  const handleSkipIntake = () => {
    nextStepAfter(INTAKE_STEP);
  };

  const finalizeBooking = async () => {
    if (!patient) return;
    setLoading(true);

    const { data: insertedBooking, error } = await supabase.from("bookings").insert({
      patient_name: `${patient.firstName} ${patient.lastName}`,
      patient_email: patient.email,
      patient_phone: patient.phone,
      service_type: service.name,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: selectedSlot.time,
      duration_minutes: selectedSlot.duration,
      status: "requested",
      patient_id: patient.id,
    }).select("access_token").single();

    await releaseLock();
    setLoading(false);

    if (error) {
      const msg = error.message.includes("overlaps")
        ? "This time slot has just been booked. Please choose another."
        : "Something went wrong. Please try again.";
      toast({ title: msg, variant: "destructive" });
      return;
    }

    toast({ title: "Appointment request submitted! You'll receive a confirmation soon." });

    const accessToken = (insertedBooking as any)?.access_token;
    const manageUrl = `${window.location.origin}/my-appointments?token=${accessToken}`;

    supabase.functions.invoke("send-booking-email", {
      body: {
        patient_name: `${patient.firstName} ${patient.lastName}`,
        patient_email: patient.email,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedSlot.time,
        duration_minutes: selectedSlot.duration,
        service_type: service.name,
        manage_url: manageUrl,
      },
    }).catch((err) => console.error("Email notification failed:", err));

    onSuccess();
  };

  return (
    <div className="bg-card rounded-xl border p-8">
      {/* Lock indicator */}
      {lockId && lockExpiry && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <p className="font-body text-xs text-primary">
            This slot is reserved for you while you complete the form.
          </p>
        </div>
      )}

      {/* Booking Summary */}
      <div className="bg-background rounded-lg border p-4 mb-6 space-y-2">
        <p className="font-body text-sm font-semibold text-foreground">{service.name}</p>
        <div className="flex flex-wrap items-center gap-4 font-body text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-primary" />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            {formatTimeDisplay(selectedSlot.time)} · {selectedSlot.duration} min
          </span>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {visibleSteps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-colors ${
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={`font-body text-xs hidden sm:inline ${
                i === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {step}
            </span>
            {i < visibleSteps.length - 1 && (
              <div className={`w-6 h-px ${i < currentStep ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content — render by step name */}
      {visibleSteps[currentStep] === "Your Details" && (
        <PatientInfoStep onComplete={handlePatientCreated} onBack={handleBack} />
      )}
      {visibleSteps[currentStep] === "Verify Email" && patient && (
        <EmailVerifyStep patient={patient} onVerified={handleEmailVerified} onBack={() => setCurrentStep(0)} />
      )}
      {visibleSteps[currentStep] === "Consent" && patient && (
        <ConsentStep patientId={patient.id} onComplete={handleConsentComplete} onBack={() => setCurrentStep(currentStep - 1)} />
      )}
      {visibleSteps[currentStep] === "Emergency Contact" && patient && (
        <EmergencyContactStep
          patientId={patient.id}
          onComplete={handleEmergencyComplete}
          onBack={() => setCurrentStep(currentStep - 1)}
        />
      )}
      {visibleSteps[currentStep] === DOC_STEP && patient && (
        <DocumentUploadStep
          patientId={patient.id}
          onComplete={() => nextStepAfter(DOC_STEP)}
          onSkip={() => nextStepAfter(DOC_STEP)}
          onBack={() => setCurrentStep(currentStep - 1)}
        />
      )}
      {visibleSteps[currentStep] === INTAKE_STEP && patient && (
        <IntakeStep
          patientId={patient.id}
          onComplete={handleIntakeComplete}
          onSkip={handleSkipIntake}
          onBack={() => setCurrentStep(currentStep - 1)}
        />
      )}
      {visibleSteps[currentStep] === "PHQ-9" && patient && (
        <AssessmentStep
          patientId={patient.id}
          assessmentType="phq9"
          onComplete={() => nextStepAfter("PHQ-9")}
          onSkip={() => nextStepAfter("PHQ-9")}
          onBack={() => setCurrentStep(currentStep - 1)}
        />
      )}
      {visibleSteps[currentStep] === "GAD-7" && patient && (
        <AssessmentStep
          patientId={patient.id}
          assessmentType="gad7"
          onComplete={() => finalizeBooking()}
          onSkip={() => finalizeBooking()}
          onBack={() => setCurrentStep(currentStep - 1)}
        />
      )}

      {loading && (
        <div className="mt-4 text-center">
          <p className="font-body text-sm text-muted-foreground">Submitting your appointment request...</p>
        </div>
      )}
    </div>
  );
};

export default PatientOnboarding;
