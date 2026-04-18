import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  isDateAvailable: (date: Date) => boolean;
  maxAdvanceDays: number;
}

const BookingCalendar = ({ selectedDate, onSelectDate, isDateAvailable, maxAdvanceDays }: BookingCalendarProps) => {
  const disableDate = (date: Date) => !isDateAvailable(date);
  const maxDate = addDays(new Date(), maxAdvanceDays);

  return (
    <div className="bg-card rounded-xl border p-6">
      <h3 className="font-display text-xl font-semibold text-foreground mb-4">Select a Date</h3>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        disabled={disableDate}
        fromDate={new Date()}
        toDate={maxDate}
        numberOfMonths={2}
        className="rounded-md pointer-events-auto w-full"
        classNames={{
          months: "flex flex-col sm:flex-row gap-8 w-full",
          month: "space-y-4 flex-1",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "font-display text-base font-semibold",
          nav: "space-x-1 flex items-center",
          nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input hover:bg-secondary transition-colors",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "flex w-full",
          head_cell: "text-muted-foreground rounded-md flex-1 font-body font-medium text-sm py-2 text-center",
          row: "flex w-full mt-1",
          cell: "flex-1 text-center text-sm p-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-10 w-full p-0 font-body font-normal aria-selected:opacity-100 hover:bg-secondary rounded-md transition-colors inline-flex items-center justify-center",
          day_range_end: "day-range-end",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
          day_today: "bg-accent/30 text-accent-foreground font-semibold",
          day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-30",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
};

export default BookingCalendar;
