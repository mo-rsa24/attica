import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingCalendar from "@/components/booking/BookingCalendar";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import ServiceTypeSelector from "@/components/booking/ServiceTypeSelector";
import PatientOnboarding from "@/components/booking/PatientOnboarding";
import { useAvailability } from "@/hooks/useAvailability";
import { useServiceTypes, type ServiceType } from "@/hooks/useServiceTypes";

const BookAppointment = () => {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; duration: number } | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);

  const { data: services = [], isLoading: servicesLoading } = useServiceTypes();
  const { isDateAvailable, getAvailableSlots, rules, refetchBookings, isLoading: availLoading } = useAvailability();

  const availableSlots = selectedDate && selectedService
    ? getAvailableSlots(selectedDate, selectedService.duration_minutes)
    : [];

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    setSelectedSlot(null);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBookingSuccess = () => {
    setBookingComplete(true);
    setSelectedSlot(null);
    refetchBookings();
  };

  const resetAll = () => {
    setBookingComplete(false);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
  };

  if (bookingComplete) {
    return (
      <main>
        <Navbar />
        <div id="main-content" className="min-h-screen pt-20 sm:pt-24 section-padding flex items-start justify-center">
          <div className="max-w-lg mx-auto text-center bg-card rounded-xl p-12 border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">Appointment Requested</h2>
            <p className="font-body text-muted-foreground mb-6">
              Your appointment request has been submitted. You'll receive a confirmation email once it's approved.
            </p>
            <button
              onClick={resetAll}
              className="font-body text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Book another appointment
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (servicesLoading || availLoading) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen pt-24 section-padding flex items-center justify-center">
          <p className="font-body text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main id="main-content">
      <Navbar />
      <div className="min-h-screen pt-20 sm:pt-24 section-padding">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-sm uppercase tracking-[0.25em] text-primary mb-3 text-center">Schedule</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground text-center mb-4">
            Book an Appointment
          </h1>
          <p className="font-body text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Choose your service, pick a date and time, then complete the short onboarding form.
          </p>

          {/* Step 1: Service Selection */}
          <ServiceTypeSelector
            services={services}
            selected={selectedService}
            onSelect={handleServiceSelect}
          />

          {/* Step 2: Calendar */}
          {selectedService && (
            <div className="mt-8">
              <BookingCalendar
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                isDateAvailable={isDateAvailable}
                maxAdvanceDays={rules.max_advance_days}
              />
            </div>
          )}

          {/* Step 3 & 4: Time slots + Onboarding */}
          {selectedDate && selectedService && (
            <div className="grid lg:grid-cols-2 gap-8 mt-8">
              <TimeSlotPicker
                selectedDate={selectedDate}
                availableSlots={availableSlots}
                selectedSlot={selectedSlot}
                duration={selectedService.duration_minutes}
                onSelectSlot={setSelectedSlot}
                serviceType={selectedService.name}
              />
              <div>
                {selectedSlot ? (
                  <PatientOnboarding
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    service={selectedService}
                    onSuccess={handleBookingSuccess}
                    onBack={() => setSelectedSlot(null)}
                  />
                ) : (
                  <div className="bg-card rounded-xl border p-8 flex items-center justify-center min-h-[300px]">
                    <p className="font-body text-muted-foreground text-center">Select a time slot to continue</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default BookAppointment;
