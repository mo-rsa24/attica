import React, { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

import { useAuth } from '../../AuthContext';
import { schedulingApi, schedulingFormatters } from '../../api/schedulingApi.js';

const { toLocalInputValue, toIsoFromLocalInput } = schedulingFormatters;

export default function ProviderCounterModal({ bookingRequest, onClose, onSuccess }) {
  const { tokens } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [counterStart, setCounterStart] = useState(
    toLocalInputValue(bookingRequest?.requested_start_at) || ''
  );
  const [counterEnd, setCounterEnd] = useState(
    toLocalInputValue(bookingRequest?.requested_end_at) || ''
  );
  const [counterRate, setCounterRate] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  if (!bookingRequest) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!counterStart || !counterEnd) {
      setError('Please set both start and end times.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        counter_start_at: toIsoFromLocalInput(counterStart),
        counter_end_at: toIsoFromLocalInput(counterEnd),
        ...(counterRate ? { counter_rate: parseFloat(counterRate) } : {}),
        counter_message: counterMessage,
      };
      await schedulingApi.counterPropose(tokens?.access, bookingRequest.id, payload);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Could not submit counter proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1">
                Counter Proposal
              </p>
              <h2 className="text-xl font-black text-slate-900">Propose different terms</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Proposed Start
              </label>
              <input
                type="datetime-local"
                value={counterStart}
                onChange={(e) => setCounterStart(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Proposed End
              </label>
              <input
                type="datetime-local"
                value={counterEnd}
                onChange={(e) => setCounterEnd(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Rate (ZAR){' '}
                <span className="text-slate-400 font-normal normal-case">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={counterRate}
                onChange={(e) => setCounterRate(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Message{' '}
                <span className="text-slate-400 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Explain your proposed changes…"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-60 transition"
              >
                <FaPaperPlane />
                {loading ? 'Sending…' : 'Send Counter'}
              </button>
            </div>
          </form>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
}
