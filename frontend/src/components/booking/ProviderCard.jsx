import React, { useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import dayjs from 'dayjs';

import { useAuth } from '../../AuthContext';
import { schedulingApi } from '../../api/schedulingApi.js';
import { getRequestPrimaryState } from './bookingState.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const StarRating = ({ rating }) => {
  if (!rating) return <span className="text-xs text-slate-400">No rating</span>;
  const full = Math.floor(rating);
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar key={i} className={i < full ? 'text-amber-400' : 'text-slate-200'} />
      ))}
      <span className="text-xs font-semibold text-slate-600 ml-1">{Number(rating).toFixed(1)}</span>
    </span>
  );
};

const STATUS_CONFIG = {
  pending: {
    label: 'Awaiting Response',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
  },
  approved: {
    label: 'Confirmed ✓',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-400',
  },
  accepted_pending_checkout: {
    label: 'Accepted, not reserved',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-400',
  },
  checkout_hold_active: {
    label: 'Checkout in progress',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
  },
  ready_for_publish: {
    label: 'Ready for publish',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-400',
  },
  checkout_hold_expired: {
    label: 'Hold expired',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-400',
  },
  released: {
    label: 'Hold released',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  declined: {
    label: 'Declined',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-400',
  },
  counter_proposed: {
    label: 'Counter Offer',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    dot: 'bg-violet-400',
  },
  expired: {
    label: 'Expired',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
    dot: 'bg-slate-400',
  },
  withdrawn: {
    label: 'Withdrawn',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
    dot: 'bg-slate-400',
  },
};

// ---------------------------------------------------------------------------
export default function ProviderCard({
  provider,
  existingRequest,
  eventDraftId,
  selectedRange,
  onRequestCreated,
  onOpenCounter,
}) {
  const { tokens } = useAuth();
  const authToken = tokens?.access;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const status = existingRequest?.status;
  const primaryState = existingRequest ? getRequestPrimaryState(existingRequest) : null;
  const statusConf = STATUS_CONFIG[primaryState?.key || status] || STATUS_CONFIG[status] || null;

  const priceInfo = provider.price_info || {};
  const priceText = priceInfo.min
    ? `R ${priceInfo.min.toLocaleString()} – R ${priceInfo.max?.toLocaleString() || '?'}`
    : priceInfo.base
    ? `R ${Number(priceInfo.base).toLocaleString()}`
    : null;

  // ---------------------------------------------------------------------------
  // Request to Book
  // ---------------------------------------------------------------------------
  const handleRequest = async () => {
    if (!selectedRange?.start || !selectedRange?.end || !eventDraftId) return;
    setLoading(true);
    setError('');
    try {
      const created = await schedulingApi.createRequest(authToken, {
        event_draft_id: Number(eventDraftId),
        resource_id: provider.resource_id,
        start_at: dayjs(selectedRange.start).toISOString(),
        end_at: dayjs(selectedRange.end).toISOString(),
        attendee_count: 1,
      });
      // Attach resource_type for summary bar grouping
      onRequestCreated({ ...created, resource_type: provider.resource_type });
    } catch (requestErr) {
      setError(requestErr.message || 'Could not send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Re-request (after decline / expiry)
  // ---------------------------------------------------------------------------
  const handleReRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const created = await schedulingApi.createRequest(authToken, {
        event_draft_id: Number(eventDraftId),
        resource_id: provider.resource_id,
        start_at: dayjs(selectedRange.start).toISOString(),
        end_at: dayjs(selectedRange.end).toISOString(),
        attendee_count: 1,
      });
      onRequestCreated({ ...created, resource_type: provider.resource_type });
    } catch (requestErr) {
      setError(requestErr.message || 'Could not send request.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CTA button
  // ---------------------------------------------------------------------------
  const renderCTA = () => {
    if (!status) {
      return (
        <button
          onClick={handleRequest}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? 'Sending…' : 'Request to Book'}
        </button>
      );
    }
    if (status === 'pending') {
      return (
        <span className="px-4 py-2 bg-amber-50 text-amber-600 text-sm font-semibold rounded-xl border border-amber-200">
          Awaiting Response…
        </span>
      );
    }
    if (status === 'approved') {
      return (
        <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-200">
          <FaCheckCircle /> {primaryState?.label || 'Accepted'}
        </span>
      );
    }
    if (status === 'counter_proposed') {
      return (
        <button
          onClick={() => onOpenCounter?.(existingRequest)}
          className="px-4 py-2 bg-violet-500 text-white text-sm font-bold rounded-xl hover:bg-violet-600 transition"
        >
          View Counter Offer
        </button>
      );
    }
    if (status === 'declined' || status === 'expired') {
      return (
        <button
          onClick={handleReRequest}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 disabled:opacity-60 transition"
        >
          {loading ? 'Sending…' : 'Try Again'}
        </button>
      );
    }
    return null;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] hover:shadow-[0_8px_32px_-8px_rgba(236,72,153,0.15)] transition-shadow p-4">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
          {provider.profile_image ? (
            <img
              src={provider.profile_image}
              alt={provider.display_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-fuchsia-200 flex items-center justify-center text-2xl font-black text-white">
              {provider.display_name?.charAt(0) || '?'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate">{provider.display_name}</h3>
              {provider.city && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <FaMapMarkerAlt className="text-pink-400" />
                  {provider.city}
                  {provider.distance_km != null && ` · ${provider.distance_km} km`}
                </p>
              )}
            </div>

            {/* Status badge */}
            {statusConf && (
              <span
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-1 ${statusConf.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                {primaryState?.label || statusConf.label}
              </span>
            )}
          </div>

          {/* Bio */}
          {provider.bio && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{provider.bio}</p>
          )}

          {/* Metadata row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <StarRating rating={provider.rating} />
            {priceText && <span className="font-semibold text-slate-800">{priceText}</span>}
            {provider.response_time_hours && (
              <span className="flex items-center gap-1 text-slate-400">
                <FaClock />~{provider.response_time_hours}h response
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}

      {/* Conflict notice for 409 */}
      {error?.includes('409') && (
        <p className="mt-1 text-xs text-orange-600">
          This provider was just booked by another organizer. Try a different time or provider.
        </p>
      )}

      {/* CTA */}
      <div className="mt-3 flex justify-end">{renderCTA()}</div>
    </div>
  );
}
