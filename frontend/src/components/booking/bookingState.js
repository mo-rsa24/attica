export function formatZAR(amount) {
  const numeric = Number(amount || 0);
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 2,
  }).format(Number.isNaN(numeric) ? 0 : numeric);
}

export function formatHoldTimer(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) {
    return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, '0')).join(':');
  }
  return [minutes, remainingSeconds].map((value) => String(value).padStart(2, '0')).join(':');
}

const FALLBACK_STATUS = {
  pending: { key: 'pending', label: 'Awaiting response' },
  counter_proposed: { key: 'counter_proposed', label: 'Counter offered' },
  declined: { key: 'declined', label: 'Declined' },
  withdrawn: { key: 'withdrawn', label: 'Withdrawn' },
  expired: { key: 'expired', label: 'Expired' },
  approved: { key: 'approved', label: 'Accepted' },
};

export function getRequestPrimaryState(request) {
  const workflow = request?.workflow_state;
  if (workflow === 'accepted_pending_checkout') {
    return { key: workflow, label: 'Accepted, not reserved' };
  }
  if (workflow === 'checkout_hold_active') {
    return { key: workflow, label: 'Checkout in progress' };
  }
  if (workflow === 'checkout_hold_expired') {
    return { key: workflow, label: 'Hold expired' };
  }
  if (workflow === 'ready_for_publish') {
    return { key: workflow, label: 'Ready for publish' };
  }
  if (workflow === 'released') {
    return { key: workflow, label: 'Hold released' };
  }
  if (workflow === 'booked') {
    return { key: workflow, label: 'Booked' };
  }
  if (workflow === 'requested') {
    return FALLBACK_STATUS.pending;
  }
  return FALLBACK_STATUS[request?.status] || { key: request?.status || 'draft', label: request?.status || 'Draft' };
}

export function getRequestSecondaryStates(request) {
  const states = [];
  if (request?.hold_remaining_seconds > 0 && ['checkout_hold_active', 'ready_for_publish'].includes(request?.workflow_state)) {
    states.push({
      key: 'hold_remaining',
      label: `Hold expires in ${formatHoldTimer(request.hold_remaining_seconds)}`,
    });
  }
  if (request?.deposit_state === 'deposit_required') {
    states.push({ key: 'deposit_required', label: 'Deposit required' });
  }
  if (request?.deposit_state === 'deposit_mock_paid') {
    states.push({ key: 'deposit_mock_paid', label: 'Deposit paid' });
  }
  if (request?.deposit_state === 'deposit_not_required') {
    states.push({ key: 'deposit_not_required', label: 'No deposit required' });
  }
  return states;
}
