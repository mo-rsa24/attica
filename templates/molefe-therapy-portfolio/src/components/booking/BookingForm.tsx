import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Clock, User } from "lucide-react";

const SERVICE_TYPES = [
  "Individual Therapy",
  "Couples & Family Therapy",
  "Trauma & Grief Counselling",
  "Psychological Assessment",
];

interface BookingFormProps {
  selectedDate: Date;
  selectedSlot: { time: string; duration: number };
  onSuccess: () => void;
}

const formatTimeDisplay = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

const BookingForm = ({ selectedDate, selectedSlot, onSuccess }: BookingFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: SERVICE_TYPES[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      patient_name: form.name.trim(),
      patient_email: form.email.trim(),
      patient_phone: form.phone.trim(),
      service_type: form.service,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: selectedSlot.time,
      duration_minutes: selectedSlot.duration,
      notes: form.notes.trim() || null,
    });

    setLoading(false);

    if (error) {
      const msg = error.message.includes("overlaps")
        ? "This time slot has just been booked. Please choose another."
        : "Something went wrong. Please try again.";
      toast({ title: msg, variant: "destructive" });
      return;
    }

    toast({ title: "Appointment booked successfully!" });

    // Send confirmation email (fire-and-forget)
    supabase.functions.invoke("send-booking-email", {
      body: {
        patient_name: form.name.trim(),
        patient_email: form.email.trim(),
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedSlot.time,
        duration_minutes: selectedSlot.duration,
        service_type: form.service,
      },
    }).catch((err) => console.error("Email notification failed:", err));

    onSuccess();
  };

  return (
    <div className="bg-card rounded-xl border p-8">
      <h3 className="font-display text-lg font-semibold text-foreground mb-6">
        Your Details
      </h3>

      {/* Summary */}
      <div className="bg-background rounded-lg border p-4 mb-6 space-y-2">
        <div className="flex items-center gap-2 font-body text-sm text-foreground">
          <CalendarDays className="w-4 h-4 text-primary" />
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </div>
        <div className="flex items-center gap-2 font-body text-sm text-foreground">
          <Clock className="w-4 h-4 text-primary" />
          {formatTimeDisplay(selectedSlot.time)} · {selectedSlot.duration} min
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="font-body">Full Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. John Doe"
            maxLength={100}
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="font-body">Email *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@example.com"
            maxLength={255}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className="font-body">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="082 000 0000"
            maxLength={20}
            required
          />
        </div>

        <div>
          <Label htmlFor="service" className="font-body">Service Type</Label>
          <select
            id="service"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body"
          >
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="notes" className="font-body">Additional Notes</Label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Anything you'd like the doctor to know..."
            maxLength={1000}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-body"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full font-body">
          {loading ? "Booking..." : "Confirm Booking"}
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
