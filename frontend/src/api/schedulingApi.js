const API_ROOT = '/api/scheduling';

const toQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, value);
  });
  return query.toString();
};

const authHeaders = (token, extra = {}) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
});

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const message = payload?.detail || payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
};

const generateIdempotencyKey = (prefix = 'scheduling') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const schedulingApi = {
  getResources: async (token) => {
    const response = await fetch(`${API_ROOT}/resources/`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },

  searchAvailability: async (token, params) => {
    const query = toQueryString(params);
    const response = await fetch(`${API_ROOT}/availability/search/?${query}`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },

  getCalendar: async (token, params) => {
    const query = toQueryString(params);
    const response = await fetch(`${API_ROOT}/calendar/?${query}`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },

  getRequests: async (token, params = {}) => {
    const query = toQueryString(params);
    const response = await fetch(`${API_ROOT}/requests/${query ? `?${query}` : ''}`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },

  getBookings: async (token, params = {}) => {
    const query = toQueryString(params);
    const response = await fetch(`${API_ROOT}/bookings/${query ? `?${query}` : ''}`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },

  createRequest: async (token, body) => {
    const response = await fetch(`${API_ROOT}/requests/create/`, {
      method: 'POST',
      headers: authHeaders(token, {
        'Content-Type': 'application/json',
        'Idempotency-Key': generateIdempotencyKey('request'),
      }),
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  createBooking: async (token, body) => {
    const response = await fetch(`${API_ROOT}/bookings/create/`, {
      method: 'POST',
      headers: authHeaders(token, {
        'Content-Type': 'application/json',
        'Idempotency-Key': generateIdempotencyKey('booking'),
      }),
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  approveRequest: async (token, requestId, providerMessage = '') => {
    const response = await fetch(`${API_ROOT}/requests/${requestId}/approve/`, {
      method: 'POST',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ provider_message: providerMessage }),
    });
    return parseResponse(response);
  },

  declineRequest: async (token, requestId, providerMessage = '') => {
    const response = await fetch(`${API_ROOT}/requests/${requestId}/decline/`, {
      method: 'POST',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ provider_message: providerMessage }),
    });
    return parseResponse(response);
  },

  cancelBooking: async (token, bookingId, reason = '') => {
    const response = await fetch(`${API_ROOT}/bookings/${bookingId}/cancel/`, {
      method: 'POST',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ reason }),
    });
    return parseResponse(response);
  },

  rescheduleBooking: async (token, bookingId, payload) => {
    const response = await fetch(`${API_ROOT}/bookings/${bookingId}/reschedule/`, {
      method: 'POST',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  getOpsSummary: async (token) => {
    const response = await fetch(`${API_ROOT}/ops/summary/`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },

  getWebhookTargets: async (token, params = {}) => {
    const query = toQueryString(params);
    const response = await fetch(`${API_ROOT}/webhook-targets/${query ? `?${query}` : ''}`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },

  createWebhookTarget: async (token, payload) => {
    const response = await fetch(`${API_ROOT}/webhook-targets/`, {
      method: 'POST',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  updateWebhookTarget: async (token, targetId, payload) => {
    const response = await fetch(`${API_ROOT}/webhook-targets/${targetId}/`, {
      method: 'PATCH',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  deleteWebhookTarget: async (token, targetId) => {
    const response = await fetch(`${API_ROOT}/webhook-targets/${targetId}/`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    if (response.status === 204) return { deleted: true };
    return parseResponse(response);
  },

  getOutboxEvents: async (token, params = {}) => {
    const query = toQueryString(params);
    const response = await fetch(`${API_ROOT}/ops/outbox-events/${query ? `?${query}` : ''}`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },

  getDeadLetters: async (token, params = {}) => {
    const query = toQueryString(params);
    const response = await fetch(`${API_ROOT}/ops/dead-letters/${query ? `?${query}` : ''}`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },

  replayDeadLetter: async (token, deadLetterId) => {
    const response = await fetch(`${API_ROOT}/ops/dead-letters/${deadLetterId}/replay/`, {
      method: 'POST',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({}),
    });
    return parseResponse(response);
  },

  getConflictIncidents: async (token, params = {}) => {
    const query = toQueryString(params);
    const response = await fetch(`${API_ROOT}/ops/conflict-incidents/${query ? `?${query}` : ''}`, {
      headers: authHeaders(token),
    });
    return parseResponse(response);
  },
};

export const schedulingFormatters = {
  bookingModeLabel: (mode) => {
    if (mode === 'instant') return 'Instant';
    if (mode === 'approval_required') return 'Approval Required';
    if (mode === 'hybrid') return 'Hybrid';
    return mode || 'Unknown';
  },

  formatDateTime: (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  toIsoFromLocalInput: (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  },

  toLocalInputValue: (date) => {
    const source = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(source.getTime())) return '';
    const local = new Date(source.getTime() - source.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  },
};
