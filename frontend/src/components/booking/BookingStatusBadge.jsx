import React from 'react';

const statusConfig = {
  draft: {
    label: 'Draft',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-400',
  },
  pending: {
    label: 'Pending',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-400',
  },
  approved: {
    label: 'Approved',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500',
  },
  accepted_pending_checkout: {
    label: 'Accepted, Not Reserved',
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-800',
    dotColor: 'bg-sky-500',
  },
  checkout_hold_active: {
    label: 'Checkout In Progress',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    dotColor: 'bg-amber-500',
  },
  checkout_hold_expired: {
    label: 'Hold Expired',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-800',
    dotColor: 'bg-rose-500',
  },
  ready_for_publish: {
    label: 'Ready For Publish',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  released: {
    label: 'Hold Released',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    dotColor: 'bg-slate-500',
  },
  deposit_required: {
    label: 'Deposit Required',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    dotColor: 'bg-orange-500',
  },
  deposit_mock_paid: {
    label: 'Deposit Paid',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  deposit_not_required: {
    label: 'No Deposit Required',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    dotColor: 'bg-slate-500',
  },
  confirmed: {
    label: 'Confirmed',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500',
  },
  successful: {
    label: 'Confirmed',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500',
  },
  declined: {
    label: 'Declined',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500',
  },
  rejected: {
    label: 'Declined',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    dotColor: 'bg-gray-400',
  },
  counter_proposed: {
    label: 'Counter Proposed',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-800',
    dotColor: 'bg-violet-500',
  },
  expired: {
    label: 'Expired',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    dotColor: 'bg-gray-400',
  },
  withdrawn: {
    label: 'Withdrawn',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    dotColor: 'bg-gray-400',
  },
  hold: {
    label: 'On Hold',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-400',
  },
  in_progress: {
    label: 'In Progress',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    dotColor: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500',
  },
  reschedule_pending: {
    label: 'Reschedule Pending',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    dotColor: 'bg-amber-500',
  },
  disputed: {
    label: 'Disputed',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500',
  },
};

export default function BookingStatusBadge({ status, size = 'md' }) {
  const config = statusConfig[status] || statusConfig.draft;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      <span className={`${dotSizes[size]} rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
