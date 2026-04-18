import React, { useEffect, useMemo, useState } from 'react';
import { FaClock, FaCreditCard, FaLock, FaTimes } from 'react-icons/fa';

import { useAuth } from '../../AuthContext';
import { schedulingApi } from '../../api/schedulingApi.js';
import { formatHoldTimer, formatZAR } from './bookingState.js';

const EMPTY_FORM = {
  card_brand: 'visa',
  card_last4: '',
  card_expiry_month: '',
  card_expiry_year: '',
};

export default function MockCheckoutSheet({
  open,
  eventDraftId,
  selectedRequests,
  onClose,
  onRequestsUpdated,
}) {
  const { tokens } = useAuth();
  const authToken = tokens?.access;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);

  const requestIds = useMemo(
    () => [...new Set((selectedRequests || []).map((request) => request.id))].sort((left, right) => left - right),
    [selectedRequests],
  );

  useEffect(() => {
    if (!open || !session?.hold_remaining_seconds) return undefined;
    setRemainingSeconds(session.hold_remaining_seconds);
    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, session?.hold_remaining_seconds]);

  useEffect(() => {
    if (!open || !authToken || !eventDraftId || requestIds.length === 0) return undefined;
    let ignore = false;
    setLoading(true);
    setError('');
    setSession(null);

    schedulingApi
      .startCheckout(authToken, {
        event_draft_id: Number(eventDraftId),
        request_ids: requestIds,
      })
      .then((payload) => {
        if (ignore) return;
        setSession(payload);
        setRemainingSeconds(payload?.hold_remaining_seconds || 0);
        onRequestsUpdated?.();
      })
      .catch((checkoutError) => {
        if (!ignore) setError(checkoutError.message || 'Unable to start checkout right now.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [authToken, eventDraftId, onRequestsUpdated, open, requestIds]);

  const totalDepositDue = Number(session?.total_deposit_due || 0);
  const totalRemaining = Number(session?.total_remaining_balance_estimate || 0);
  const requiresDepositNow = totalDepositDue > 0;

  const handleRefresh = async () => {
    if (!session?.id || !authToken) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = await schedulingApi.refreshCheckout(authToken, session.id);
      setSession(payload);
      setRemainingSeconds(payload?.hold_remaining_seconds || 0);
      onRequestsUpdated?.();
    } catch (refreshError) {
      setError(refreshError.message || 'Unable to refresh the checkout timer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async () => {
    if (!session?.id || !authToken) return;
    setSubmitting(true);
    setError('');
    try {
      await schedulingApi.releaseCheckout(authToken, session.id);
      onRequestsUpdated?.();
      onClose?.();
    } catch (releaseError) {
      setError(releaseError.message || 'Unable to release this checkout hold.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMockPayment = async (event) => {
    event.preventDefault();
    if (!session?.id || !authToken) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = await schedulingApi.completeMockDeposit(authToken, session.id, {
        card_brand: form.card_brand,
        card_last4: form.card_last4,
        card_expiry_month: Number(form.card_expiry_month),
        card_expiry_year: Number(form.card_expiry_year),
      });
      setSession(payload);
      onRequestsUpdated?.();
    } catch (paymentError) {
      setError(paymentError.message || 'Unable to mark this mock deposit as paid.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-[0_20px_80px_-20px_rgba(15,23,42,0.45)]">
        <header className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">Mock checkout</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Reserve accepted resources</h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                This is a mock payment flow. No real payment gateway is used and no raw card number or CVV is stored.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close checkout"
            >
              <FaTimes />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading && (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && session && (
            <div className="space-y-6">
              <section className="rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.18),_transparent_58%),linear-gradient(135deg,#fff1f2,#fff7ed)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Hold timer</p>
                    <p className="mt-2 text-4xl font-black tracking-tight text-slate-900">
                      {formatHoldTimer(remainingSeconds)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <FaLock className="text-rose-500" />
                      Checkout hold active
                    </div>
                    <p className="mt-1">Publish while this timer is active to finalize eligible bookings.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Selected resources</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {session.requests?.length || 0} selected
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {(session.requests || []).map((request) => (
                    <div key={request.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{request.resource_display_name}</p>
                          <p className="text-xs capitalize text-slate-500">{request.resource_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Deposit due now</p>
                          <p className="font-bold text-slate-900">{formatZAR(request.deposit_due_amount)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                          {request.workflow_state.replaceAll('_', ' ')}
                        </span>
                        {request.deposit_state && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                            {request.deposit_state.replaceAll('_', ' ')}
                          </span>
                        )}
                        {request.is_ready_for_publish && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                            ready for publish
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3 rounded-3xl bg-slate-950 p-5 text-white">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Total deposit due now</p>
                  <p className="mt-2 text-2xl font-black">{formatZAR(totalDepositDue)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Remaining balance estimate</p>
                  <p className="mt-2 text-2xl font-black">{formatZAR(totalRemaining)}</p>
                </div>
              </section>

              {session.is_paid ? (
                <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <FaCreditCard className="text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-900">Mock deposit marked as paid</p>
                      <p className="text-sm text-emerald-700">
                        {session.card_brand?.toUpperCase()} ending in {session.card_last4 || '----'} was stored as safe mock metadata only.
                      </p>
                    </div>
                  </div>
                </section>
              ) : requiresDepositNow ? (
                <form onSubmit={handleMockPayment} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FaCreditCard className="text-rose-500" />
                    <h3 className="text-lg font-bold">Card form UI</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Safe mock fields only. This mirrors the future real-deposit flow without storing sensitive card data.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="block text-sm">
                      <span className="mb-1 block font-semibold text-slate-700">Card brand</span>
                      <select
                        value={form.card_brand}
                        onChange={(event) => setForm((previous) => ({ ...previous, card_brand: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
                      >
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="amex">Amex</option>
                      </select>
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-semibold text-slate-700">Last 4</span>
                      <input
                        value={form.card_last4}
                        onChange={(event) => setForm((previous) => ({ ...previous, card_last4: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="4242"
                        required
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-semibold text-slate-700">Expiry month</span>
                      <input
                        value={form.card_expiry_month}
                        onChange={(event) => setForm((previous) => ({ ...previous, card_expiry_month: event.target.value.replace(/\D/g, '').slice(0, 2) }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
                        inputMode="numeric"
                        placeholder="12"
                        required
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-semibold text-slate-700">Expiry year</span>
                      <input
                        value={form.card_expiry_year}
                        onChange={(event) => setForm((previous) => ({ ...previous, card_expiry_year: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
                        inputMode="numeric"
                        placeholder="2027"
                        required
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                  >
                    <FaLock />
                    {submitting ? 'Saving mock payment…' : 'Mark mock deposit paid'}
                  </button>
                </form>
              ) : (
                <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-3 text-emerald-900">
                    <FaClock className="text-emerald-600" />
                    <div>
                      <p className="font-bold">No deposit is required for these resources</p>
                      <p className="text-sm text-emerald-700">
                        This hold is already ready for publish while the timer remains active.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <footer className="border-t border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleRelease}
              disabled={submitting || loading || !session}
              className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Release hold
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={submitting || loading || !session}
                className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Refresh timer
              </button>
              <button
                onClick={onClose}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </footer>
      </aside>
    </>
  );
}
