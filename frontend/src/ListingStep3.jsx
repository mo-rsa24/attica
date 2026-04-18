import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import { useEventCreation, getStepProgress } from './context/reactContext.jsx';
import { useAuth } from './AuthContext';
import AtticaMark from './components/AtticaMark.jsx';
import BookingsPanel from './components/booking/BookingsPanel.jsx';
import EventBookingSummaryButton from './components/booking/EventBookingSummaryDrawer.jsx';
import { saveDraftAndExit } from './utils/wizardExit.js';

// ---------------------------------------------------------------------------
// Calendar setup
// ---------------------------------------------------------------------------
const localizer = dayjsLocalizer(dayjs);
const DnDCalendar = withDragAndDrop(Calendar);

const SELECTED_EVENT_ID = '__selected__';

// Parse a date/time pair into a JS Date.
// dateStr may be a plain date ("2025-08-15"), a combined ISO datetime ("2025-08-15T18:00"),
// or a full ISO string with offset. timeStr is ignored when dateStr already contains a time.
const parseDatetime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  // If dateStr already contains a time component, parse it directly.
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  const time = timeStr ? timeStr.substring(0, 5) : '09:00';
  const combined = `${dateStr}T${time}`;
  const d = new Date(combined);
  return isNaN(d.getTime()) ? null : d;
};

// ---------------------------------------------------------------------------
// Summary bar at the bottom of split-screen
// ---------------------------------------------------------------------------
const SummaryBar = ({ bookingRequests, onBack, onNext, nextDisabled }) => {
  const venueReqs = bookingRequests.filter((r) => r.resource_type === 'venue');
  const artistReqs = bookingRequests.filter((r) => r.resource_type === 'artist');
  const vendorReqs = bookingRequests.filter((r) => r.resource_type === 'vendor');

  const statusLabel = (reqs) => {
    if (reqs.length === 0) return '—';
    const approved = reqs.filter((r) => r.status === 'approved').length;
    const pending = reqs.filter((r) => r.status === 'pending').length;
    const counter = reqs.filter((r) => r.status === 'counter_proposed').length;
    const parts = [];
    if (approved) parts.push(`${approved} confirmed`);
    if (pending) parts.push(`${pending} pending`);
    if (counter) parts.push(`${counter} counter`);
    return parts.join(', ') || `${reqs.length} sent`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_-20px_rgba(15,23,42,0.35)] z-30">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <button onClick={onBack} className="font-bold text-slate-800 underline text-sm">
          Back
        </button>

        {/* Status chips */}
        <div className="flex items-center gap-4 text-sm overflow-x-auto">
          <span className="text-slate-500 font-medium whitespace-nowrap">
            Venue: <span className="text-slate-800">{statusLabel(venueReqs)}</span>
          </span>
          <span className="text-slate-500 font-medium whitespace-nowrap">
            Artists: <span className="text-slate-800">{statusLabel(artistReqs)}</span>
          </span>
          <span className="text-slate-500 font-medium whitespace-nowrap">
            Vendors: <span className="text-slate-800">{statusLabel(vendorReqs)}</span>
          </span>
        </div>

        <Motion.button
          onClick={onNext}
          disabled={nextDisabled}
          whileHover={nextDisabled ? {} : { scale: 1.04 }}
          whileTap={nextDisabled ? {} : { scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-sm"
        >
          <span>Next</span>
          <FaChevronRight />
        </Motion.button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ListingStep3() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const {
    event,
    data,
    saveStep,
    saveAndExit,
    getStepData,
    getNextStep,
    getPreviousStep,
    setStepData,
    setCurrentStep,
    bookingRequests,
    setBookingRequests,
    refreshBookingRequests,
  } = useEventCreation();
  const { tokens } = useAuth();
  const authToken = tokens?.access;

  // Stage: 'calendar' | 'split'
  const [stage, setStage] = useState('calendar');
  const [calendarView, setCalendarView] = useState('week');
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Selected event time block on the calendar
  const [selectedRange, setSelectedRange] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const basePath = eventId ? `/listing/${eventId}` : '/createEvent';

  // ---------------------------------------------------------------------------
  // Derive initial time range from step1 data
  // ---------------------------------------------------------------------------
  const initialRange = useMemo(() => {
    const step1 = data?.steps?.step1 || {};
    const startDate = step1.start_date || step1.date;
    const endDate = step1.end_date || step1.start_date || step1.date;
    const startTime = step1.start_time;
    const endTime = step1.end_time;

    const start = parseDatetime(startDate, startTime);
    const end = parseDatetime(endDate, endTime);
    if (!start) return null;

    // If end equals or precedes start, add 4 hours
    const resolvedEnd =
      end && end > start ? end : new Date(start.getTime() + 4 * 60 * 60 * 1000);
    return { start, end: resolvedEnd };
  }, [data]);

  // Set initial selected range once
  useEffect(() => {
    if (initialRange && !selectedRange) {
      setSelectedRange(initialRange);
    }
  }, [initialRange, selectedRange]);

  useEffect(() => {
    if (selectedRange?.start) {
      setCalendarDate(selectedRange.start);
    }
  }, [selectedRange]);

  useEffect(() => {
    if (!selectedRange?.start || !selectedRange?.end) return;

    const step1 = getStepData('step1', {});
    const nextSchedule = {
      startDate: dayjs(selectedRange.start).format('YYYY-MM-DD'),
      startTime: dayjs(selectedRange.start).format('HH:mm'),
      endDate: dayjs(selectedRange.end).format('YYYY-MM-DD'),
      endTime: dayjs(selectedRange.end).format('HH:mm'),
      date: dayjs(selectedRange.start).format('YYYY-MM-DD'),
      start_date: selectedRange.start.toISOString(),
      start_time: dayjs(selectedRange.start).format('HH:mm'),
      end_date: selectedRange.end.toISOString(),
      end_time: dayjs(selectedRange.end).format('HH:mm'),
    };

    const isAlreadySynced = Object.entries(nextSchedule).every(([key, value]) => step1?.[key] === value);
    if (!isAlreadySynced) {
      setStepData('step1', { ...step1, ...nextSchedule });
    }
  }, [getStepData, selectedRange, setStepData]);

  // Set current step in wizard context
  useEffect(() => {
    setCurrentStep('step3');
  }, [setCurrentStep]);

  // Load existing booking requests for this draft via context
  useEffect(() => {
    if (!authToken || !eventId) return;
    setRequestsLoading(true);
    refreshBookingRequests(eventId).finally(() => setRequestsLoading(false));
  }, [authToken, eventId, refreshBookingRequests]);

  // ---------------------------------------------------------------------------
  // Calendar events list (the selected pink block)
  // ---------------------------------------------------------------------------
  const calendarEvents = useMemo(() => {
    if (!selectedRange) return [];
    return [
      {
        id: SELECTED_EVENT_ID,
        title: 'Your Event',
        start: selectedRange.start,
        end: selectedRange.end,
        resource: 'selected',
      },
    ];
  }, [selectedRange]);

  // ---------------------------------------------------------------------------
  // Calendar handlers
  // ---------------------------------------------------------------------------
  const handleSelectSlot = useCallback(({ start, end }) => {
    setSelectedRange({ start, end });
  }, []);

  const handleEventDrop = useCallback(({ event: ev, start, end }) => {
    if (ev.id === SELECTED_EVENT_ID) setSelectedRange({ start, end });
  }, []);

  const handleEventResize = useCallback(({ event: ev, start, end }) => {
    if (ev.id === SELECTED_EVENT_ID) setSelectedRange({ start, end });
  }, []);

  // ---------------------------------------------------------------------------
  // Booking request callbacks (passed to BookingsPanel / ProviderCard)
  // ---------------------------------------------------------------------------
  const handleRequestCreated = useCallback((newRequest) => {
    setBookingRequests((prev) => {
      const exists = prev.find((r) => r.id === newRequest.id);
      if (exists) return prev.map((r) => (r.id === newRequest.id ? newRequest : r));
      return [...prev, newRequest];
    });
  }, []);

  const handleRequestUpdated = useCallback((updatedRequest) => {
    setBookingRequests((prev) =>
      prev.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const handleNext = async () => {
    const nextStep = getNextStep('step3');
    const bookingRequestIds = bookingRequests.map((r) => r.id);
    const locationReq = bookingRequests.find((r) => r.resource_type === 'venue' && r.status === 'approved');

    const payload = {
      location: locationReq?.venue_id || null,
      bookingRequestIds,
    };
    await saveStep(eventId || event?.id, 'step3', payload, nextStep);
    const target = nextStep === 'review' ? `${basePath}/review` : `${basePath}/${nextStep}`;
    navigate(target);
  };

  const handleBackToPreviousStep = useCallback(() => {
    const prevStep = getPreviousStep('step3');
    const target = prevStep === 'review' ? `${basePath}/review` : `${basePath}/${prevStep}`;
    navigate(target);
  }, [basePath, getPreviousStep, navigate]);

  const handleSaveAndExit = useCallback(async () => {
    await saveDraftAndExit({
      saveAndExit,
      draftId: eventId || event?.id,
      navigate,
    });
  }, [event?.id, eventId, navigate, saveAndExit]);

  // ---------------------------------------------------------------------------
  // Calendar event style (selected block = light pink)
  // ---------------------------------------------------------------------------
  const eventStyleGetter = useCallback((ev) => {
    if (ev.id === SELECTED_EVENT_ID) {
      return {
        style: {
          backgroundColor: '#fce7f3',
          borderColor: '#f472b6',
          color: '#9d174d',
          fontWeight: 600,
          borderRadius: '6px',
          border: '2px solid #f472b6',
        },
      };
    }
    return {};
  }, []);

  // Scroll calendar to the event's start hour
  const scrollToTime = useMemo(() => {
    if (!selectedRange?.start) return new Date();
    const t = new Date(selectedRange.start);
    t.setHours(Math.max(0, t.getHours() - 1));
    return t;
  }, [selectedRange]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg z-30 border-b border-slate-200/70 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <a href="/"><AtticaMark tone="dark" /></a>
            <div className="flex items-center space-x-3">
              <EventBookingSummaryButton eventDraftId={eventId} />
              <button
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full border border-slate-200"
                onClick={handleSaveAndExit}
              >
                Save &amp; exit
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <Motion.div
              className="h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600"
              initial={{ width: `${getStepProgress('step1')}%` }}
              animate={{ width: `${getStepProgress('step3')}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-24 h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {stage === 'calendar' ? (
            /* ===== Stage A: Full-page calendar ===== */
            <Motion.div
              key="calendar-stage"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col flex-1 px-6 lg:px-10 max-w-screen-2xl mx-auto w-full"
            >
              <div className="text-center mb-6 mt-2">
                <p className="font-semibold text-pink-600">Step 2 of 8</p>
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                  Confirm your event time window
                </h1>
                <p className="mt-2 text-base text-slate-600 max-w-xl mx-auto">
                  Your event dates have been pre-selected. Drag or resize the pink block to adjust,
                  then find available providers.
                </p>
              </div>

              {/* Nav row: Back on left, view toggle on right */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handleBackToPreviousStep}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <FaChevronLeft className="text-xs" /> Back
                </button>
                <div className="flex gap-2">
                  {['week', 'day', 'month'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalendarView(v)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold border transition-colors ${
                        calendarView === v
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div className="flex-1 bg-white rounded-2xl shadow-[0_20px_60px_-28px_rgba(15,23,42,0.3)] border border-slate-100 overflow-hidden">
                <DnDCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  view={calendarView}
                  onView={setCalendarView}
                  date={calendarDate}
                  onNavigate={setCalendarDate}
                  selectable
                  resizable
                  onSelectSlot={handleSelectSlot}
                  onEventDrop={handleEventDrop}
                  onEventResize={handleEventResize}
                  eventPropGetter={eventStyleGetter}
                  scrollToTime={scrollToTime}
                  step={30}
                  timeslots={2}
                  style={{ height: '100%' }}
                  toolbar={true}
                />
              </div>

              {/* Confirm button */}
              <div className="py-5 flex justify-center">
                <Motion.button
                  onClick={() => setStage('split')}
                  disabled={!selectedRange}
                  whileHover={selectedRange ? { scale: 1.04 } : {}}
                  whileTap={selectedRange ? { scale: 0.97 } : {}}
                  className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed"
                >
                  Find Available Providers
                  <FaChevronRight />
                </Motion.button>
              </div>
            </Motion.div>
          ) : (
            /* ===== Stage B: Split-screen ===== */
            <Motion.div
              key="split-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-1 gap-4 px-4 lg:px-6 max-w-screen-2xl mx-auto w-full"
            >
              {/* Left: compact calendar */}
              <Motion.div
                initial={{ width: '100%' }}
                animate={{ width: '35%' }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="flex-shrink-0 flex flex-col"
              >
                <div className="mb-2 flex items-center gap-2">
                  <button
                    onClick={() => setStage('calendar')}
                    className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <FaChevronLeft className="text-xs" /> Adjust time
                  </button>
                </div>

                <div className="flex-1 bg-white rounded-2xl shadow-[0_10px_40px_-20px_rgba(15,23,42,0.25)] border border-slate-100 overflow-hidden">
                  <DnDCalendar
                    localizer={localizer}
                    events={calendarEvents}
                  view="day"
                  onView={() => {}}
                  date={calendarDate}
                  onNavigate={setCalendarDate}
                  selectable
                  resizable
                  onSelectSlot={handleSelectSlot}
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    eventPropGetter={eventStyleGetter}
                    scrollToTime={scrollToTime}
                    step={30}
                    timeslots={2}
                    style={{ height: '100%' }}
                    toolbar={false}
                  />
                </div>

                {/* Selected time display */}
                {selectedRange && (
                  <div className="mt-3 p-3 bg-pink-50 rounded-xl border border-pink-200">
                    <p className="text-xs font-semibold text-pink-700 uppercase tracking-wide">
                      Selected Window
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {dayjs(selectedRange.start).format('ddd, MMM D h:mm A')}
                    </p>
                    <p className="text-sm text-slate-600">
                      to {dayjs(selectedRange.end).format('ddd, MMM D h:mm A')}
                    </p>
                  </div>
                )}
              </Motion.div>

              {/* Right: bookings panel */}
              <Motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex-1 min-w-0 overflow-y-auto"
              >
                {requestsLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
                    <div className="w-10 h-10 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium">Loading your bookings…</p>
                  </div>
                ) : (
                  <BookingsPanel
                    eventDraftId={eventId}
                    selectedRange={selectedRange}
                    bookingRequests={bookingRequests}
                    onRequestCreated={handleRequestCreated}
                    onRequestUpdated={handleRequestUpdated}
                  />
                )}
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom summary bar (only in split stage) */}
      {stage === 'split' && (
        <SummaryBar
          bookingRequests={bookingRequests}
          onBack={handleBackToPreviousStep}
          onNext={handleNext}
          nextDisabled={!selectedRange}
        />
      )}
    </div>
  );
}
