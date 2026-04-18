import React, { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import dayjs from 'dayjs';
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { useAuth } from '../../AuthContext';
import { schedulingApi } from '../../api/schedulingApi.js';

// ---------------------------------------------------------------------------
// Shown to the ORGANIZER when a provider has sent a counter-proposal.
// Displays revised times/rate and lets the organizer accept or reject.
export default function OrganizerCounterResponseModal({ bookingRequest, onClose, onResponse }) {
  const { tokens } = useAuth();
  const authToken = tokens?.access;

  const [loading, setLoading] = useState(null); // 'accept' | 'reject' | null
  const [error, setError] = useState('');

  if (!bookingRequest) return null;

  const {
    id: requestId,
    counter_start_at,
    counter_end_at,
    counter_rate,
    counter_message,
  } = bookingRequest;

  const fmtDt = (val) =>
    val ? dayjs(val).format('ddd, MMM D YYYY h:mm A') : '—';

  // ---------------------------------------------------------------------------
  const handleAccept = async () => {
    setLoading('accept');
    setError('');
    try {
      const res = await schedulingApi.acceptCounter(authToken, requestId);
      onResponse(res.request || { ...bookingRequest, status: 'approved' });
    } catch (err) {
      setError(err.message || 'Could not accept counter. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading('reject');
    setError('');
    try {
      const res = await schedulingApi.rejectCounter(authToken, requestId);
      onResponse(res || { ...bookingRequest, status: 'declined' });
    } catch (err) {
      setError(err.message || 'Could not reject counter. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // ---------------------------------------------------------------------------
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-1">
                Counter Proposal
              </p>
              <h2 className="text-xl font-black text-slate-900">Provider revised your request</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
            >
              <FaTimes />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-5">
            <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100">
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">
                Revised Time Window
              </p>
              <p className="text-sm font-bold text-slate-800">{fmtDt(counter_start_at)}</p>
              <p className="text-sm text-slate-600">to {fmtDt(counter_end_at)}</p>
            </div>

            {counter_rate && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Proposed Rate
                </p>
                <p className="text-lg font-black text-slate-900">
                  R {Number(counter_rate).toLocaleString()}
                </p>
              </div>
            )}

            {counter_message && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Message from Provider
                </p>
                <p className="text-sm text-slate-700 italic">"{counter_message}"</p>
              </div>
            )}
          </div>

          {/* Original request comparison */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 mb-5">
            <strong>Your original request:</strong>{' '}
            {fmtDt(bookingRequest.requested_start_at)} →{' '}
            {fmtDt(bookingRequest.requested_end_at)}
          </div>

          {/* Error */}
          {error && (
            <p className="mb-4 text-sm text-red-500 font-medium bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200 hover:bg-red-100 disabled:opacity-60 transition"
            >
              <FaTimesCircle />
              {loading === 'reject' ? 'Declining…' : 'Decline'}
            </button>
            <button
              onClick={handleAccept}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition shadow-md"
            >
              <FaCheckCircle />
              {loading === 'accept' ? 'Accepting…' : 'Accept Counter'}
            </button>
          </div>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
}
