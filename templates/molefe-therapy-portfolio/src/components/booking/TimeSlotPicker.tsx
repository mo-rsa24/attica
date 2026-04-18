import { format } from "date-fns";
import { Clock } from "lucide-react";
import WaitlistForm from "./WaitlistForm";

interface TimeSlotPickerProps {
  selectedDate: Date;
  availableSlots: string[];
  selectedSlot: { time: string; duration: number } | null;
  duration: number;
  onSelectSlot: (slot: { time: string; duration: number } | null) => void;
  serviceType?: string;
}

const formatTimeDisplay = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

const TimeSlotPicker = ({ selectedDate, availableSlots, selectedSlot, duration, onSelectSlot, serviceType }: TimeSlotPickerProps) => {
  return (
    <div className="bg-card rounded-xl border p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        {format(selectedDate, "EEEE, MMMM d")}
      </h3>
      <p className="font-body text-sm text-muted-foreground mb-4">
        {availableSlots.length} slot{availableSlots.length !== 1 ? "s" : ""} available · {duration} min sessions
      </p>

      {availableSlots.length === 0 ? (
        <div className="space-y-6">
          <div className="py-4 text-center">
            <p className="font-body text-muted-foreground">No available slots on this date.</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Try selecting a different date, or join the waitlist below.</p>
          </div>
          {serviceType && (
            <div className="border-t pt-6">
              <WaitlistForm selectedDate={selectedDate} serviceType={serviceType} />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableSlots.map((slot) => {
            const isSelected = selectedSlot?.time === slot;
            return (
              <button
                key={slot}
                onClick={() => onSelectSlot(isSelected ? null : { time: slot, duration })}
                className={`font-body text-sm py-2.5 px-2 rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-secondary hover:border-primary/30"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {formatTimeDisplay(slot)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
