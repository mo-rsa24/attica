import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaDollarSign, FaStickyNote } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';

export default function BookingModal({
  open,
  onClose,
  event,
  provider,
  providerType = 'vendor',
  chatroomId,
  onSuccess,
}) {
  const { tokens } = useAuth();
  const [formData, setFormData] = useState({
    bid_amount: '',
    proposed_date: '',
    notes: '',
    currency: 'ZAR',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availabilityWarning, setAvailabilityWarning] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        bid_amount: '',
        proposed_date: event?.date || '',
        notes: '',
        currency: 'ZAR',
      });
      setError(null);
      setAvailabilityWarning(null);
    }
  }, [open, event?.date]);

  // Check availability when date changes
  useEffect(() => {
    if (!formData.proposed_date || !provider?.id) return;

    const checkAvailability = async () => {
      try {
        const response = await fetch(`/api/chat/providers/${provider.id}/availability/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens?.access}`,
          },
          body: JSON.stringify({ date: formData.proposed_date }),
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.available) {
            setAvailabilityWarning('This provider may not be available on this date.');
          } else {
            setAvailabilityWarning(null);
          }
        }
      } catch (err) {
        // Silently fail availability check
      }
    };

    checkAvailability();
  }, [formData.proposed_date, provider?.id, tokens?.access]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        event: event?.id,
        provider: provider?.id || provider?.user_id,
        provider_type: providerType,
        provider_entity_id: provider?.entity_id || provider?.id,
        bid_amount: formData.bid_amount || null,
        proposed_date: formData.proposed_date || null,
        notes: formData.notes,
        currency: formData.currency,
      };

      if (chatroomId) {
        payload.chatroom = chatroomId;
      }

      const response = await fetch('/api/chat/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create booking');
      }

      const booking = await response.json();
      onSuccess?.(booking);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (code) => {
    const currencies = {
      ZAR: 'R (ZAR)',
      USD: '$ (USD)',
      EUR: '€ (EUR)',
      GBP: '£ (GBP)',
    };
    return currencies[code] || code;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Request Booking</h2>
              {event && (
                <p className="text-sm text-gray-500">
                  For: {event.name || event.data?.name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Provider info */}
            {provider && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium text-gray-900">
                  {provider.name || provider.username}
                </p>
              </div>
            )}

            {/* Bid amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaDollarSign className="inline w-4 h-4 mr-1" />
                Offer Amount
              </label>
              <div className="flex gap-2">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="ZAR">R (ZAR)</option>
                  <option value="USD">$ (USD)</option>
                  <option value="EUR">€ (EUR)</option>
                  <option value="GBP">£ (GBP)</option>
                </select>
                <input
                  type="number"
                  name="bid_amount"
                  value={formData.bid_amount}
                  onChange={handleChange}
                  placeholder="Enter amount (optional)"
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to discuss pricing in chat
              </p>
            </div>

            {/* Proposed date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline w-4 h-4 mr-1" />
                Proposed Date
              </label>
              <input
                type="date"
                name="proposed_date"
                value={formData.proposed_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              {availabilityWarning && (
                <p className="mt-1 text-xs text-yellow-600">
                  {availabilityWarning}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaStickyNote className="inline w-4 h-4 mr-1" />
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requirements or details..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
