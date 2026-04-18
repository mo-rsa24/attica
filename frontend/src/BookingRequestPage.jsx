import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FaBell,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaComments,
  FaMapMarkerAlt,
  FaTimes,
  FaUsers,
} from 'react-icons/fa';
import { useAuth } from './AuthContext';
import BookingStatusBadge from './components/booking/BookingStatusBadge';
import OrganizerCounterResponseModal from './components/booking/CounterProposalModal';
import ProviderCounterModal from './components/booking/ProviderCounterModal';
import { formatHoldTimer, formatZAR, getRequestPrimaryState, getRequestSecondaryStates } from './components/booking/bookingState.js';
import { schedulingApi } from './api/schedulingApi.js';

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80';

const STATUS_LABEL = {
  pending: 'Awaiting provider response',
  approved: 'Confirmed for publish',
  declined: 'Declined by provider',
  counter_proposed: 'Counter proposal received',
  expired: 'Request expired',
  withdrawn: 'Request withdrawn',
  successful: 'Booking confirmed',
  confirmed: 'Booking confirmed',
  rejected: 'Booking declined',
  cancelled: 'Booking cancelled',
};

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function combineDateAndTime(dateValue, timeValue) {
  if (!dateValue) return null;
  if (!timeValue) return parseDate(dateValue);
  return parseDate(`${dateValue}T${timeValue}`);
}

function coerceDateTime(value, fallbackDate = null) {
  if (!value) return null;
  if (parseDate(value)) return value;
  if (fallbackDate) {
    return combineDateAndTime(fallbackDate, value);
  }
  return null;
}

function formatDateTime(value) {
  const parsed = parseDate(value);
  if (!parsed) return 'To be confirmed';
  return parsed.toLocaleString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTimeRange(startValue, endValue) {
  const start = parseDate(startValue);
  const end = parseDate(endValue);
  if (!start && !end) return 'To be confirmed';
  if (start && !end) return formatDateTime(start);
  if (!start && end) return formatDateTime(end);

  const sameDay = start.toDateString() === end.toDateString();
  if (!sameDay) {
    return `${formatDateTime(start)} - ${formatDateTime(end)}`;
  }

  const day = start.toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const startTime = start.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${startTime} - ${endTime}`;
}

function formatCurrency(amount, currency = 'ZAR') {
  if (amount === null || amount === undefined || amount === '') return null;
  const asNumber = Number(amount);
  if (Number.isNaN(asNumber)) return `${currency} ${amount}`;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency || 'ZAR',
  }).format(asNumber);
}

function firstTruthy(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') {
      return value;
    }
  }
  return null;
}

function uniqueImages(images) {
  return [...new Set(images.filter(Boolean))];
}

function prettyType(resourceType) {
  if (!resourceType) return 'Provider';
  return resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
}

function ImageGallery({ images }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
        No event images available
      </div>
    );
  }

  const heroImage = images[0];
  const thumbnailImages = images.slice(1, 5);

  const openModal = (index) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 rounded-2xl overflow-hidden">
        <div className="col-span-2 row-span-2 cursor-pointer" onClick={() => openModal(0)}>
          <img src={heroImage} alt="Event hero" className="h-full w-full object-cover hover:opacity-90 transition-opacity" />
        </div>
        {thumbnailImages.map((image, index) => (
          <div key={image + index} className="col-span-1 row-span-1 cursor-pointer" onClick={() => openModal(index + 1)}>
            <img src={image} alt={`Event image ${index + 2}`} className="h-full w-full object-cover hover:opacity-90 transition-opacity" />
          </div>
        ))}
      </div>

      <button
        onClick={() => openModal(0)}
        className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md text-sm font-semibold hover:bg-gray-100 transition"
      >
        Show all photos
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white text-3xl font-bold">
            x
          </button>
          <img src={images[selectedIndex]} alt="Event full view" className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </div>
  );
}

function TitleMetadata({ title, category, location, resourceName, status }) {
  return (
    <div className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
          <div className="flex flex-wrap items-center text-gray-600 text-md mt-2 gap-4">
            {category && <span>{category}</span>}
            {location && (
              <span className="flex items-center">
                <FaMapMarkerAlt className="mr-1" />
                {location}
              </span>
            )}
            {resourceName && <span>Requested for {resourceName}</span>}
          </div>
        </div>
        {status && <BookingStatusBadge status={status} />}
      </div>
    </div>
  );
}

function Description({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = text && text.length > 300;

  if (!text) return null;

  return (
    <div className="py-6 border-t">
      <h2 className="text-2xl font-semibold mb-4">About this event</h2>
      <div className={`text-gray-800 leading-relaxed overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-full' : 'max-h-40'}`}>
        <p>{text}</p>
      </div>
      {isLongText && (
        <button onClick={() => setIsExpanded((prev) => !prev)} className="text-blue-600 font-semibold mt-2 hover:underline">
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

function BookingTimeSection({ title, startAt, endAt, attendeeCount, amount }) {
  return (
    <div className="py-6 border-t">
      <h2 className="text-2xl font-semibold mb-4">Booking time</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{formatDateTimeRange(startAt, endAt)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Attendee count</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{attendeeCount || 'Not specified'}</p>
        </div>
        {amount && (
          <div className="bg-gray-50 p-4 rounded-xl md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Offer amount</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{amount}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ThingsToKnow({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  if (!items?.length) return null;

  return (
    <div className="py-6 border-t">
      <h2 className="text-2xl font-semibold mb-4">Things to know</h2>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="border-b">
            <button
              className="w-full flex justify-between items-center py-4 text-left"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-semibold">{item.title}</span>
              <span>{openIndex === index ? <FaChevronUp /> : <FaChevronDown />}</span>
            </button>
            {openIndex === index && <div className="pb-4 text-gray-700">{item.text}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrganizerProfile({ organizer }) {
  if (!organizer) return null;
  const initials = (organizer.name || organizer.username || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="py-6 border-t">
      <h2 className="text-2xl font-semibold mb-4">Event organizer</h2>
      <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
        {organizer.profilePicture ? (
          <img src={organizer.profilePicture} alt={organizer.name} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{organizer.name}</h3>
          <p className="text-sm text-gray-600">@{organizer.username}</p>
          <p className="text-sm text-gray-500 mt-1">Requested this booking for their event.</p>
        </div>
      </div>
    </div>
  );
}

function LocationMap({ lat, lng, locationName, locationAddress }) {
  const hasLatLng = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  const hasName = Boolean(locationName);

  let mapSrc = '';
  if (hasLatLng) {
    mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=14&output=embed`;
  } else if (hasName) {
    mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(locationName)}&output=embed`;
  }

  return (
    <div className="py-6 border-t">
      <h2 className="text-2xl font-semibold mb-4">Location</h2>
      {mapSrc ? (
        <>
          <div className="h-96 w-full rounded-2xl overflow-hidden bg-gray-200">
            <iframe title="Event location" src={mapSrc} className="w-full h-full border-0" loading="lazy" />
          </div>
          <p className="mt-4 font-semibold text-gray-800">{locationName || 'Location shared by organizer'}</p>
          {locationAddress && <p className="text-sm text-gray-500">{locationAddress}</p>}
        </>
      ) : (
        <div className="h-60 w-full rounded-2xl bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Location information is not available.</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider action panel (shown when the viewer is the resource owner)
// ---------------------------------------------------------------------------
function ProviderActionPanel({ requestId, status, requestData, tokens, onActionDone }) {
  const navigate = useNavigate();
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(null); // 'approve' | 'decline' | null
  const [counterOpen, setCounterOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  const canAct = status === 'pending';
  const isCounterProposed = status === 'counter_proposed';

  const doAction = async (endpoint, body = {}) => {
    setLoading(endpoint);
    setActionError('');
    try {
      const res = await fetch(`/api/scheduling/requests/${requestId}/${endpoint}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setActionError(err.detail || 'Action failed. Please try again.');
        return null;
      }
      return await res.json().catch(() => ({}));
    } catch {
      setActionError('Network error. Please try again.');
      return null;
    } finally {
      setLoading(null);
    }
  };

  const handleApprove = async () => {
    const data = await doAction('approve');
    if (data === null) return; // error already set
    if (data?.booking?.id) {
      navigate(`/booking-detail/${data.booking.id}`);
    } else {
      // Draft-linked approval: no Booking created yet; reload request to show updated state.
      onActionDone();
    }
  };

  if (!canAct && !isCounterProposed) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-900 mb-1">Respond to this request</h3>
      <p className="text-sm text-gray-500 mb-4">
        {isCounterProposed
          ? 'You have already submitted a counter-proposal. The organizer is reviewing it.'
          : 'Review the event details above, then accept, decline, or propose different terms.'}
      </p>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {canAct && !declining && (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60"
          >
            <FaCheck />
            {loading === 'approve' ? 'Accepting…' : 'Accept booking'}
          </button>
          <button
            onClick={() => setCounterOpen(true)}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 border border-amber-500 text-amber-700 bg-amber-50 font-bold py-3 rounded-xl hover:bg-amber-100 transition-all disabled:opacity-60"
          >
            Propose different terms
          </button>
          <button
            onClick={() => setDeclining(true)}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-60"
          >
            <FaTimes />
            Decline
          </button>
        </div>
      )}

      {canAct && declining && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-700">Reason for declining (optional)</p>
          <textarea
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Let the organizer know why you can't accommodate this request…"
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <div className="flex gap-3">
            <button
              onClick={() => doAction('decline', { message: declineReason }).then((d) => d !== null && onActionDone())}
              disabled={loading !== null}
              className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all disabled:opacity-60"
            >
              {loading === 'decline' ? 'Declining…' : 'Confirm decline'}
            </button>
            <button
              onClick={() => { setDeclining(false); setDeclineReason(''); }}
              disabled={loading !== null}
              className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {counterOpen && requestData && (
        <ProviderCounterModal
          bookingRequest={requestData}
          onClose={() => setCounterOpen(false)}
          onSuccess={() => { setCounterOpen(false); onActionDone(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Organizer counter-response panel (shown to organizer when counter_proposed)
// ---------------------------------------------------------------------------
function OrganizerCounterPanel({ requestData, onDone }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 bg-violet-50 rounded-2xl border border-violet-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-sm flex-shrink-0">!</div>
        <div>
          <h3 className="text-base font-bold text-violet-900">Counter proposal received</h3>
          <p className="text-sm text-violet-700 mt-0.5">
            The provider has proposed revised terms. Review and respond below.
          </p>
        </div>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition-all"
      >
        Review &amp; Respond
      </button>
      {open && (
        <OrganizerCounterResponseModal
          bookingRequest={requestData}
          onClose={() => setOpen(false)}
          onResponse={() => { setOpen(false); onDone(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Organizer withdraw panel (shown to organizer when pending)
// ---------------------------------------------------------------------------
function WithdrawPanel({ requestId, tokens, onDone }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  const handleWithdraw = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/scheduling/requests/${requestId}/withdraw/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.detail || 'Could not withdraw request.');
        return;
      }
      onDone();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-2xl p-4">
      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="w-full text-sm text-gray-500 hover:text-red-600 font-medium py-2 rounded-xl hover:bg-red-50 transition-all"
        >
          Withdraw this request
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-medium">Are you sure you want to withdraw this request?</p>
          <div className="flex gap-3">
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="flex-1 bg-red-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-red-700 disabled:opacity-60 transition-all"
            >
              {loading ? 'Withdrawing…' : 'Yes, withdraw'}
            </button>
            <button
              onClick={() => setConfirm(false)}
              disabled={loading}
              className="flex-1 border border-gray-300 text-gray-600 text-sm font-semibold py-2 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checkout workflow banner — shown for draft-linked approved scheduling requests
// ---------------------------------------------------------------------------
function CheckoutWorkflowBanner({ requestData, isProvider }) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    () => Math.max(0, Number(requestData?.hold_remaining_seconds || 0)),
  );

  useEffect(() => {
    const initial = Math.max(0, Number(requestData?.hold_remaining_seconds || 0));
    setRemainingSeconds(initial);
    if (initial <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) { window.clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [requestData?.hold_remaining_seconds]);

  if (!requestData || requestData.status !== 'approved' || !requestData.event_draft) return null;

  const primary = getRequestPrimaryState(requestData);
  const secondary = getRequestSecondaryStates({ ...requestData, hold_remaining_seconds: remainingSeconds });
  const workflow = requestData.workflow_state;
  const depositState = requestData.deposit_state;

  const BANNER = {
    accepted_pending_checkout: {
      bg: 'bg-sky-50 border-sky-200',
      title: isProvider ? 'You accepted this request' : 'Accepted — not yet reserved',
      body: isProvider
        ? 'The organizer needs to start checkout to lock in a timed reservation hold. Your slot is not yet reserved.'
        : 'Start checkout from your Event Booking Summary to place a 30-minute reservation hold before publishing.',
    },
    checkout_hold_active: {
      bg: 'bg-amber-50 border-amber-200',
      title: isProvider ? 'Checkout hold in progress' : 'Checkout in progress',
      body: isProvider
        ? 'The organizer has started checkout and holds your slot temporarily.'
        : 'Your hold is active. Complete any required deposit and publish your draft before the timer expires.',
    },
    checkout_hold_expired: {
      bg: 'bg-rose-50 border-rose-200',
      title: 'Checkout hold expired',
      body: isProvider
        ? 'The hold expired and your availability is open again.'
        : 'The checkout timer ran out. Restart checkout from your Event Booking Summary if the slot is still free.',
    },
    released: {
      bg: 'bg-slate-50 border-slate-200',
      title: 'Hold released',
      body: 'The checkout hold was released. Availability is open again.',
    },
    ready_for_publish: {
      bg: 'bg-emerald-50 border-emerald-200',
      title: isProvider ? 'Ready for publish' : '✓ Ready — publish your draft to confirm',
      body: isProvider
        ? 'The organizer has completed checkout. Your booking will be finalized when they publish the draft.'
        : 'All requirements met. Publish your event draft to create a confirmed booking.',
    },
  };

  const config = BANNER[workflow] || {
    bg: 'bg-gray-50 border-gray-200',
    title: primary.label,
    body: '',
  };

  return (
    <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${config.bg}`}>
      <p className="font-bold text-gray-900 mb-1">{config.title}</p>
      {config.body && <p className="text-gray-700">{config.body}</p>}

      {(workflow === 'checkout_hold_active' || workflow === 'ready_for_publish') && remainingSeconds > 0 && (
        <p className="mt-2 font-mono font-bold text-gray-900">
          Hold expires in: {formatHoldTimer(remainingSeconds)}
        </p>
      )}

      {secondary.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {secondary.map((item) => (
            <span key={item.key} className="rounded-full bg-white/80 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
              {item.label}
            </span>
          ))}
        </div>
      )}

      {(depositState === 'deposit_required' || depositState === 'deposit_mock_paid') && (
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-white/70 p-3 text-xs">
          <div>
            <p className="font-semibold text-gray-500 uppercase tracking-wide">Deposit due now</p>
            <p className="font-bold text-gray-900 mt-0.5">{formatZAR(requestData.deposit_due_amount || 0)}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 uppercase tracking-wide">Remaining balance</p>
            <p className="font-bold text-gray-900 mt-0.5">{formatZAR(requestData.remaining_balance_estimate || 0)}</p>
          </div>
          {depositState === 'deposit_mock_paid' && requestData.mock_payment_card_brand && (
            <div className="col-span-2">
              <p className="font-semibold text-gray-500 uppercase tracking-wide">Mock payment</p>
              <p className="font-medium text-emerald-700 mt-0.5">
                {requestData.mock_payment_card_brand.toUpperCase()} ···· {requestData.mock_payment_card_last4 || '----'} — paid
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function BookingSummary({ status, createdAt, expiresAt, chatroomId, bookingId }) {
  return (
    <div className="sticky top-24">
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Request summary</h3>
        {status && <BookingStatusBadge status={status} />}
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <FaClock className="mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium">Created</p>
              <p>{formatDateTime(createdAt)}</p>
            </div>
          </div>
          {expiresAt && (
            <div className="flex items-start gap-2">
              <FaCalendarAlt className="mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Expires</p>
                <p>{formatDateTime(expiresAt)}</p>
              </div>
            </div>
          )}
        </div>
        {chatroomId && (
          <Link
            to={`/dm/${chatroomId}?booking=${bookingId}`}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition-all"
          >
            <FaComments />
            Open chat
          </Link>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider quick actions — nudge + DM organizer
// ---------------------------------------------------------------------------
function ProviderQuickActions({ requestId, workflowState, organizerUsername, tokens }) {
  const navigate = useNavigate();
  const [nudging, setNudging] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);
  const [nudgeError, setNudgeError] = useState('');
  const [openingChat, setOpeningChat] = useState(false);

  const canNudge = workflowState === 'accepted_pending_checkout';

  const handleNudge = async () => {
    setNudging(true);
    setNudgeError('');
    try {
      await schedulingApi.nudgeRequest(tokens?.access, requestId);
      setNudgeSent(true);
    } catch (e) {
      setNudgeError(e.message || 'Failed to send nudge.');
    } finally {
      setNudging(false);
    }
  };

  const handleOpenDM = async () => {
    if (!organizerUsername) return;
    setOpeningChat(true);
    try {
      const res = await fetch(`/api/chat/rooms/with/${organizerUsername}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens?.access}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Could not open chat.');
      const room = await res.json();
      navigate(`/dm/${room.id}`);
    } catch (e) {
      // silently ignore
    } finally {
      setOpeningChat(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {canNudge && (
        <div>
          <button
            onClick={handleNudge}
            disabled={nudging || nudgeSent}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 rounded-xl hover:bg-sky-700 transition-all disabled:opacity-60"
          >
            <FaBell />
            {nudgeSent ? 'Nudge sent!' : nudging ? 'Sending…' : 'Nudge organizer to checkout'}
          </button>
          {nudgeError && <p className="text-xs text-red-600 mt-1 text-center">{nudgeError}</p>}
          {nudgeSent && (
            <p className="text-xs text-sky-700 mt-1 text-center">
              The organizer has been notified to complete checkout.
            </p>
          )}
        </div>
      )}
      {organizerUsername && (
        <button
          onClick={handleOpenDM}
          disabled={openingChat}
          className="w-full flex items-center justify-center gap-2 border border-pink-300 text-pink-700 bg-pink-50 font-semibold py-3 rounded-xl hover:bg-pink-100 transition-all disabled:opacity-60"
        >
          <FaComments />
          {openingChat ? 'Opening chat…' : 'Message organizer'}
        </button>
      )}
    </div>
  );
}

export default function BookingRequestPage() {
  const { id } = useParams();
  const { tokens, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [sourceType, setSourceType] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError('');

      const headers = {
        ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
      };

      const fetchEvent = async (eventId) => {
        if (!eventId) return null;
        const eventResponse = await fetch(`/api/events/events/${eventId}/`, { headers, signal: controller.signal });
        if (!eventResponse.ok) return null;
        return eventResponse.json();
      };

      try {
        const schedulingResponse = await fetch(`/api/scheduling/requests/${id}/`, {
          headers,
          signal: controller.signal,
        });

        if (schedulingResponse.ok) {
          const payload = await schedulingResponse.json();
          const eventPayload = await fetchEvent(payload.event);
          if (!cancelled) {
            setSourceType('scheduling');
            setRequestData(payload);
            setEventDetails(eventPayload);
            setChatBooking(null);
          }
          return;
        }

        const chatResponse = await fetch(`/api/chat/bookings/${id}/`, {
          headers,
          signal: controller.signal,
        });

        if (chatResponse.ok) {
          const payload = await chatResponse.json();
          const eventPayload = await fetchEvent(payload.event);
          if (!cancelled) {
            setSourceType('chat');
            setChatBooking(payload);
            setEventDetails(eventPayload);
            setRequestData(null);
          }
          return;
        }

        if (!cancelled) {
          setError('Booking request not found or you do not have permission to view it.');
        }
      } catch (requestError) {
        if (!cancelled && requestError.name !== 'AbortError') {
          setError('Failed to load booking request details.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, tokens?.access]);

  const pageData = useMemo(() => {
    if (sourceType === 'scheduling' && requestData) {
      const startAt = firstTruthy(
        coerceDateTime(requestData.counter_start_at),
        coerceDateTime(requestData.requested_start_at),
        coerceDateTime(requestData.event_start_time, requestData.event_date),
        coerceDateTime(eventDetails?.start_time, eventDetails?.date),
        coerceDateTime(requestData.event_date),
      );
      const endAt = firstTruthy(
        coerceDateTime(requestData.counter_end_at),
        coerceDateTime(requestData.requested_end_at),
        coerceDateTime(requestData.event_end_time, requestData.event_date),
        coerceDateTime(eventDetails?.end_time, eventDetails?.date),
      );
      const organizerName = firstTruthy(
        [requestData.organizer_first_name, requestData.organizer_last_name].filter(Boolean).join(' ').trim(),
        requestData.organizer_username,
      );
      const attendeeCount = firstTruthy(requestData.attendee_count, requestData.event_guest_count);

      const thingsToKnow = [
        {
          title: 'Request status',
          text: STATUS_LABEL[requestData.status] || 'This request is being reviewed.',
        },
        ...(requestData.message ? [{ title: 'Organizer message', text: requestData.message }] : []),
        ...(requestData.provider_message ? [{ title: 'Provider response', text: requestData.provider_message }] : []),
        ...(requestData.counter_message ? [{ title: 'Counter proposal notes', text: requestData.counter_message }] : []),
        ...(requestData.counter_rate
          ? [{ title: 'Counter rate', text: formatCurrency(requestData.counter_rate, 'ZAR') || String(requestData.counter_rate) }]
          : []),
        ...(eventDetails?.refund_policy ? [{ title: 'Refund policy', text: eventDetails.refund_policy }] : []),
        ...(eventDetails?.access_type ? [{ title: 'Access', text: eventDetails.access_type === 'private' ? 'Invite-only' : 'Public event' }] : []),
        ...(eventDetails?.is_age_restricted ? [{ title: 'Age restriction', text: 'This event is age restricted.' }] : []),
      ];

      return {
        id: requestData.id,
        title: firstTruthy(requestData.event_title, eventDetails?.name, `Booking request #${requestData.id}`),
        category: firstTruthy(requestData.event_category, eventDetails?.category),
        description: firstTruthy(requestData.event_notes, eventDetails?.notes, 'No event description was provided.'),
        resourceName: requestData.resource_display_name,
        resourceType: requestData.resource_type,
        status: requestData.status,
        startAt,
        endAt,
        bookingTimeTitle: requestData.status === 'counter_proposed' ? 'Counter-proposed time' : 'Requested time',
        attendeeCount,
        amount: formatCurrency(requestData.counter_rate, 'ZAR'),
        locationName: firstTruthy(requestData.event_location_name, eventDetails?.location?.name, eventDetails?.venue),
        locationAddress: firstTruthy(requestData.event_location_address, eventDetails?.location?.address),
        locationLat: firstTruthy(requestData.event_location_latitude, eventDetails?.location?.latitude),
        locationLng: firstTruthy(requestData.event_location_longitude, eventDetails?.location?.longitude),
        images: uniqueImages([
          requestData.event_banner_image,
          requestData.event_image_url,
          eventDetails?.banner_image,
          eventDetails?.image_url,
          eventDetails?.location?.image_url,
          DEFAULT_EVENT_IMAGE,
        ]),
        organizer: {
          name: organizerName || 'Event organizer',
          username: requestData.organizer_username || 'organizer',
          profilePicture: requestData.organizer_profile_picture,
        },
        thingsToKnow,
        createdAt: requestData.created_at,
        expiresAt: requestData.expires_at,
        chatroomId: null,
      };
    }

    if (sourceType === 'chat' && chatBooking) {
      const fallbackDate = firstTruthy(chatBooking.proposed_date, chatBooking.event_date, eventDetails?.date);
      const proposedStart = firstTruthy(
        combineDateAndTime(chatBooking.proposed_date, chatBooking.proposed_start_time),
        coerceDateTime(chatBooking.proposed_date),
        coerceDateTime(eventDetails?.start_time, fallbackDate),
      );
      const proposedEnd = firstTruthy(
        combineDateAndTime(chatBooking.proposed_date, chatBooking.proposed_end_time),
        coerceDateTime(eventDetails?.end_time, fallbackDate),
      );
      const organizerName = firstTruthy(
        [chatBooking.organizer_first_name, chatBooking.organizer_last_name].filter(Boolean).join(' ').trim(),
        chatBooking.organizer_username,
      );

      const thingsToKnow = [
        {
          title: 'Request status',
          text: STATUS_LABEL[chatBooking.status] || 'Booking is in progress.',
        },
        ...(chatBooking.notes ? [{ title: 'Booking notes', text: chatBooking.notes }] : []),
        ...(chatBooking.bid_amount
          ? [{ title: 'Bid amount', text: formatCurrency(chatBooking.bid_amount, chatBooking.currency) || `${chatBooking.currency} ${chatBooking.bid_amount}` }]
          : []),
        ...(chatBooking.final_amount
          ? [{ title: 'Final amount', text: formatCurrency(chatBooking.final_amount, chatBooking.currency) || `${chatBooking.currency} ${chatBooking.final_amount}` }]
          : []),
        ...(eventDetails?.refund_policy ? [{ title: 'Refund policy', text: eventDetails.refund_policy }] : []),
        ...(eventDetails?.access_type ? [{ title: 'Access', text: eventDetails.access_type === 'private' ? 'Invite-only' : 'Public event' }] : []),
      ];

      return {
        id: chatBooking.id,
        title: firstTruthy(chatBooking.event_name, eventDetails?.name, `Booking #${chatBooking.id}`),
        category: firstTruthy(eventDetails?.category, prettyType(chatBooking.provider_type)),
        description: firstTruthy(eventDetails?.notes, chatBooking.notes, 'No event description was provided.'),
        resourceName: firstTruthy(eventDetails?.name, chatBooking.provider_username),
        resourceType: chatBooking.provider_type,
        status: chatBooking.status,
        startAt: proposedStart,
        endAt: proposedEnd,
        bookingTimeTitle: 'Proposed booking time',
        attendeeCount: firstTruthy(eventDetails?.guest_count, 'Not specified'),
        amount: formatCurrency(chatBooking.final_amount || chatBooking.bid_amount, chatBooking.currency),
        locationName: firstTruthy(eventDetails?.location?.name, eventDetails?.venue),
        locationAddress: eventDetails?.location?.address,
        locationLat: eventDetails?.location?.latitude,
        locationLng: eventDetails?.location?.longitude,
        images: uniqueImages([
          eventDetails?.banner_image,
          eventDetails?.image_url,
          eventDetails?.location?.image_url,
          DEFAULT_EVENT_IMAGE,
        ]),
        organizer: {
          name: organizerName || 'Event organizer',
          username: chatBooking.organizer_username || 'organizer',
          profilePicture: chatBooking.organizer_profile_picture,
        },
        thingsToKnow,
        createdAt: chatBooking.created_at,
        expiresAt: null,
        chatroomId: chatBooking.chatroom_id,
      };
    }

    return null;
  }, [sourceType, requestData, chatBooking, eventDetails]);

  // Determine if the current user is the resource owner (provider mode)
  const isProvider = sourceType === 'scheduling' && requestData &&
    user?.id && requestData.resource_owner_id === user.id;

  const reload = () => {
    setLoading(true);
    setRequestData(null);
    setEventDetails(null);
    setSourceType(null);
  };

  if (loading) {
    return <div className="text-center py-40 text-2xl font-semibold">Loading booking request...</div>;
  }

  if (error || !pageData) {
    return <div className="text-center py-40 text-2xl font-semibold">{error || 'Booking request not found.'}</div>;
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {sourceType === 'scheduling' && requestData?.status === 'approved' && requestData?.event_draft && (
        <CheckoutWorkflowBanner requestData={requestData} isProvider={isProvider} />
      )}
      {isProvider && requestData?.status === 'pending' && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-3 text-sm text-amber-800 font-medium">
          You are viewing this request as the <strong>provider</strong>. Respond below.
        </div>
      )}
      <ImageGallery images={pageData.images} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
        <div className="md:col-span-2">
          <TitleMetadata
            title={pageData.title}
            category={pageData.category}
            location={pageData.locationName}
            resourceName={pageData.resourceName}
            status={pageData.status}
          />
          <Description text={pageData.description} />
          <BookingTimeSection
            title={pageData.bookingTimeTitle}
            startAt={pageData.startAt}
            endAt={pageData.endAt}
            attendeeCount={pageData.attendeeCount}
            amount={pageData.amount}
          />
          <ThingsToKnow items={pageData.thingsToKnow} />
          <OrganizerProfile organizer={pageData.organizer} />
          <LocationMap
            lat={pageData.locationLat}
            lng={pageData.locationLng}
            locationName={pageData.locationName}
            locationAddress={pageData.locationAddress}
          />
        </div>

        <div className="md:col-span-1">
          <BookingSummary
            status={pageData.status}
            createdAt={pageData.createdAt}
            expiresAt={pageData.expiresAt}
            chatroomId={pageData.chatroomId}
            bookingId={pageData.id}
          />
          {isProvider && (
            <>
              <ProviderActionPanel
                requestId={pageData.id}
                status={pageData.status}
                requestData={requestData}
                tokens={tokens}
                onActionDone={reload}
              />
              <ProviderQuickActions
                requestId={requestData.id}
                workflowState={requestData.workflow_state}
                organizerUsername={requestData.organizer_username}
                tokens={tokens}
              />
            </>
          )}
          {!isProvider && sourceType === 'scheduling' && requestData && (
            <>
              {requestData.status === 'counter_proposed' && (
                <OrganizerCounterPanel requestData={requestData} onDone={reload} />
              )}
              {requestData.status === 'pending' && (
                <WithdrawPanel requestId={requestData.id} tokens={tokens} onDone={reload} />
              )}
            </>
          )}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-800 mb-2">Request quick facts</p>
            <p className="flex items-center gap-2">
              <FaUsers className="text-gray-400" />
              {pageData.attendeeCount || 'Attendee count not provided'}
            </p>
            <p className="flex items-center gap-2 mt-2">
              <FaCalendarAlt className="text-gray-400" />
              {formatDateTimeRange(pageData.startAt, pageData.endAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
