import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaSpinner, FaTimes } from 'react-icons/fa';

import { useEventCreation } from '../../context/reactContext.jsx';
import MockCheckoutSheet from './MockCheckoutSheet.jsx';
import {
  formatZAR,
  getRequestPrimaryState,
  getRequestSecondaryStates,
} from './bookingState.js';

const BADGE_CLASS = {
  pending: 'bg-amber-100 text-amber-800',
  counter_proposed: 'bg-violet-100 text-violet-800',
  accepted_pending_checkout: 'bg-sky-100 text-sky-800',
  checkout_hold_active: 'bg-amber-100 text-amber-800',
  ready_for_publish: 'bg-emerald-100 text-emerald-800',
  checkout_hold_expired: 'bg-rose-100 text-rose-800',
  released: 'bg-slate-100 text-slate-700',
  declined: 'bg-rose-100 text-rose-800',
  withdrawn: 'bg-slate-100 text-slate-600',
  expired: 'bg-slate-100 text-slate-600',
  booked: 'bg-emerald-100 text-emerald-800',
};

function groupRequests(requests) {
  const pending = [];
  const counter = [];
  const accepted = [];
  const closed = [];

  for (const request of requests) {
    if (request.status === 'pending') pending.push(request);
    else if (request.status === 'counter_proposed') counter.push(request);
    else if (request.status === 'approved') accepted.push(request);
    else closed.push(request);
  }

  return { pending, counter, accepted, closed };
}

function RequestCard({ request, selectable = false, selected = false, onToggle, onCheckoutOnly }) {
  const primary = getRequestPrimaryState(request);
  const secondary = getRequestSecondaryStates(request);
  const profileImage = request.resource_image_url;
  const initials = (request.resource_display_name || '?').trim().charAt(0).toUpperCase();
  const resourceHref = request.resource_type === 'artist'
    ? `/artists/${request.resource_owner_id}`
    : request.resource_type === 'venue'
      ? `/venues/${request.resource_owner_id}`
      : `/vendors/${request.resource_owner_id}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle?.(request.id)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
          />
        )}

        <Link to={resourceHref} className="flex-shrink-0">
          {profileImage ? (
            <img src={profileImage} alt={request.resource_display_name} className="h-11 w-11 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 font-bold text-rose-700">
              {initials}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/booking-request/${request.id}`} className="truncate text-sm font-bold text-slate-900 hover:text-rose-600">
                {request.resource_display_name}
              </Link>
              <p className="text-xs capitalize text-slate-500">{request.resource_type}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Deposit due</p>
              <p className="text-sm font-bold text-slate-900">{formatZAR(request.deposit_due_amount || 0)}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE_CLASS[primary.key] || 'bg-slate-100 text-slate-700'}`}>
              {primary.label}
            </span>
            {secondary.map((item) => (
              <span
                key={`${request.id}-${item.key}`}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
              >
                {item.label}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link to={`/booking-request/${request.id}`} className="text-xs font-semibold text-rose-600 hover:underline">
              View request
            </Link>
            {selectable && (
              <button
                onClick={() => onCheckoutOnly?.(request)}
                className="text-xs font-semibold text-slate-700 underline-offset-2 hover:text-slate-950 hover:underline"
              >
                Checkout this resource only
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SummaryDrawer({ open, onClose, eventDraftId }) {
  const { bookingRequests, refreshBookingRequests } = useEventCreation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [checkoutSelection, setCheckoutSelection] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (open && eventDraftId) {
      setRefreshing(true);
      refreshBookingRequests(eventDraftId).finally(() => setRefreshing(false));
    }
  }, [open, eventDraftId, refreshBookingRequests]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [onClose, open]);

  const { pending, counter, accepted, closed } = useMemo(() => groupRequests(bookingRequests), [bookingRequests]);

  useEffect(() => {
    setSelectedIds((previous) => previous.filter((id) => accepted.some((request) => request.id === id)));
  }, [accepted]);

  const selectedAcceptedRequests = useMemo(
    () => accepted.filter((request) => selectedIds.includes(request.id)),
    [accepted, selectedIds],
  );

  const checkoutReadyCount = accepted.filter((request) => request.is_ready_for_publish).length;
  const totalDepositDue = accepted.reduce((sum, request) => sum + Number(request.deposit_due_amount || 0), 0);

  const toggleSelected = (requestId) => {
    setSelectedIds((previous) => (
      previous.includes(requestId)
        ? previous.filter((id) => id !== requestId)
        : [...previous, requestId]
    ));
  };

  const openCheckout = (requests) => {
    if (!requests.length) return;
    setCheckoutSelection(requests);
    setCheckoutOpen(true);
  };

  const hasAny = bookingRequests.length > 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ease-out sm:w-[460px] ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Event Booking Summary</h2>
              <p className="mt-1 text-xs text-slate-500">{bookingRequests.length} request{bookingRequests.length !== 1 ? 's' : ''} across your draft</p>
            </div>
            <div className="flex items-center gap-2">
              {refreshing && <FaSpinner className="animate-spin text-rose-400" />}
              <button
                onClick={onClose}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close booking summary"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </header>

        {hasAny && (
          <div className="grid grid-cols-3 gap-px border-b border-slate-200 bg-slate-200">
            <div className="bg-white px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Accepted</p>
              <p className="mt-1 text-xl font-black text-slate-900">{accepted.length}</p>
            </div>
            <div className="bg-white px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Ready</p>
              <p className="mt-1 text-xl font-black text-emerald-600">{checkoutReadyCount}</p>
            </div>
            <div className="bg-white px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Deposit due now</p>
              <p className="mt-1 text-lg font-black text-rose-600">{formatZAR(totalDepositDue)}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!hasAny && !refreshing && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">📋</div>
              <p className="mt-4 text-sm font-semibold text-slate-700">No booking requests yet</p>
              <p className="mt-2 max-w-[260px] text-xs text-slate-500">
                Accepted resources will appear here with their checkout status, deposit requirements, and publish readiness.
              </p>
            </div>
          )}

          {accepted.length > 0 && (
            <Section
              title="Accepted Resources"
              subtitle="Select one or more accepted resources to place a timed checkout hold."
            >
              {accepted.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  selectable
                  selected={selectedIds.includes(request.id)}
                  onToggle={toggleSelected}
                  onCheckoutOnly={(singleRequest) => openCheckout([singleRequest])}
                />
              ))}

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Checkout selected resources together</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Bundle artists, venues, and vendors into one mock checkout hold.
                    </p>
                  </div>
                  <button
                    onClick={() => openCheckout(selectedAcceptedRequests)}
                    disabled={selectedAcceptedRequests.length === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Checkout selected
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            </Section>
          )}

          {pending.length > 0 && (
            <Section title="Awaiting Response">
              {pending.map((request) => <RequestCard key={request.id} request={request} />)}
            </Section>
          )}

          {counter.length > 0 && (
            <Section title="Counter Proposed">
              {counter.map((request) => <RequestCard key={request.id} request={request} />)}
            </Section>
          )}

          {closed.length > 0 && (
            <Section title="Closed / Released">
              {closed.map((request) => <RequestCard key={request.id} request={request} />)}
            </Section>
          )}
        </div>

        {accepted.length > 0 && (
          <footer className="border-t border-slate-200 bg-white px-5 py-4 text-xs text-slate-500">
            Accepted resources do not reserve time until checkout starts. Final `Booking` rows are created when the event draft is published.
          </footer>
        )}
      </div>

      <MockCheckoutSheet
        open={checkoutOpen}
        eventDraftId={eventDraftId}
        selectedRequests={checkoutSelection}
        onClose={() => setCheckoutOpen(false)}
        onRequestsUpdated={() => refreshBookingRequests(eventDraftId)}
      />
    </>
  );
}

export default function EventBookingSummaryButton({ eventDraftId }) {
  const [open, setOpen] = useState(false);
  const { bookingRequests } = useEventCreation();

  const activeCount = useMemo(
    () => bookingRequests.filter((request) => ['pending', 'counter_proposed', 'approved'].includes(request.status)).length,
    [bookingRequests],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        aria-label="Open booking summary"
      >
        <span>Booking Summary</span>
        {activeCount > 0 && (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      <SummaryDrawer open={open} onClose={() => setOpen(false)} eventDraftId={eventDraftId} />
    </>
  );
}
