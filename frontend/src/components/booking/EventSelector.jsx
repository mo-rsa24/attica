import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaTimes, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

export default function EventSelector({ open, onClose, onSelect, providerName }) {
  const { tokens } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user's events (drafts and published)
        const response = await fetch('/api/events/my/', {
          headers: {
            Authorization: `Bearer ${tokens?.access}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        // Combine drafts and published events
        const allEvents = [
          ...(data.drafts || []).map(e => ({ ...e, isDraft: true })),
          ...(data.published || []).map(e => ({ ...e, isDraft: false })),
        ];
        setEvents(allEvents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [open, tokens?.access]);

  if (!open) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date set';
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCreateEvent = () => {
    onClose();
    navigate('/createEvent');
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
              <h2 className="text-lg font-semibold text-gray-900">Select Event</h2>
              {providerName && (
                <p className="text-sm text-gray-500">
                  Booking {providerName}
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

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-pink-600 hover:text-pink-700"
                >
                  Try again
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <FaCalendarAlt className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">
                  You don't have any events yet.
                </p>
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors inline-flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Create Event
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onSelect(event)}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-pink-50 rounded-xl transition-colors border border-transparent hover:border-pink-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <FaCalendarAlt className="w-5 h-5 text-pink-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {event.name || event.data?.name || 'Untitled Event'}
                          </h3>
                          {event.isDraft && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(event.date || event.data?.date)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {events.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleCreateEvent}
                className="w-full px-4 py-2 text-pink-600 font-medium rounded-lg border border-pink-200 hover:bg-pink-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Create New Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
