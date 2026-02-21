import React from 'react';
import { schedulingFormatters } from '../../api/schedulingApi';

const TYPE_COLORS = {
  booking: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  request: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function CalendarTimeline({
  items,
  emptyMessage,
  onCancelBooking,
  onRescheduleBooking,
}) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-500 text-sm">
        {emptyMessage || 'No calendar entries in this range.'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const itemType = item.type || 'booking';
        const canCancel = itemType === 'booking' && !['cancelled', 'completed', 'expired'].includes(item.status);
        const tagClass = TYPE_COLORS[itemType] || 'bg-slate-50 text-slate-700 border-slate-200';

        return (
          <div key={`${itemType}-${item.id}`} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{item.title || `#${item.id}`}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {schedulingFormatters.formatDateTime(item.start_at)} to {schedulingFormatters.formatDateTime(item.end_at)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Event #{item.event_id || 'N/A'} | Resource #{item.resource_id || 'N/A'}
                </p>
              </div>
              <span className={`text-xs border rounded-full px-2 py-1 font-semibold ${tagClass}`}>
                {itemType} · {item.status || 'unknown'}
              </span>
            </div>

            {canCancel && (
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => onCancelBooking?.(item)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onRescheduleBooking?.(item)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Reschedule
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
