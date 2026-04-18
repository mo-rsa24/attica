import React, { useCallback, useEffect, useState } from 'react';
import { FaPlus, FaSave, FaSpinner, FaTrash } from 'react-icons/fa';
import { useAuth } from './AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_INDICES = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 };

function deriveResourceType(user) {
  const roles = user?.roles || [];
  if (roles.includes('ARTIST')) return 'artist';
  if (roles.includes('VENUE_MANAGER') || roles.includes('VENUE')) return 'venue';
  if (roles.includes('SERVICE_PROVIDER') || roles.includes('VENDOR')) return 'vendor';
  const t = user?.user_type || '';
  if (t === 'artist') return 'artist';
  if (t === 'venue') return 'venue';
  if (t === 'vendor') return 'vendor';
  return 'artist';
}

const BOOKING_MODES = [
  { value: 'approval_required', label: 'Approval required — you review each request' },
  { value: 'instant', label: 'Instant — bookings confirm automatically' },
  { value: 'hybrid', label: 'Hybrid — instant for short, approval for long bookings' },
];

function apiHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ---------------------------------------------------------------------------
// Step 1 — Resource profile
// ---------------------------------------------------------------------------
function ResourceStep({ resource, setResource, tokens, user, resourceType, onNext }) {
  const [form, setForm] = useState({
    display_name: resource?.display_name || user?.first_name || user?.username || '',
    city: resource?.city || '',
    country: resource?.country || 'ZA',
    timezone: resource?.timezone || 'Africa/Johannesburg',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      const method = resource ? 'PATCH' : 'POST';
      const url = resource
        ? `/api/scheduling/resources/${resource.id}/`
        : '/api/scheduling/resources/';
      const body = resource ? form : { ...form, resource_type: resourceType };
      const res = await fetch(url, {
        method,
        headers: apiHeaders(tokens.access),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.detail || JSON.stringify(d));
        return;
      }
      const data = await res.json();
      setResource(data);
      onNext();
    } catch {
      setErr('Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">1. Marketplace profile</h2>
      <p className="text-sm text-gray-500">
        This is how organizers see you in search results.
      </p>

      {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Display name *</label>
          <input
            value={form.display_name}
            onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
            placeholder="e.g. DJ Molefe, The Warehouse, Bloom Decor"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
          <input
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            placeholder="Johannesburg"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
          <input
            value={form.country}
            onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
            placeholder="ZA"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Timezone</label>
          <select
            value={form.timezone}
            onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
            <option value="UTC">UTC</option>
            <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
          </select>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving || !form.display_name.trim()}
        className="flex items-center gap-2 bg-pink-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-pink-700 transition-all disabled:opacity-60"
      >
        {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
        {resource ? 'Save & continue' : 'Create profile & continue'}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Policy
// ---------------------------------------------------------------------------
function PolicyStep({ resource, policy, setPolicy, tokens, onNext, onBack }) {
  const [form, setForm] = useState({
    booking_mode: policy?.booking_mode || 'approval_required',
    min_notice_hours: policy?.min_notice_hours ?? 24,
    max_horizon_days: policy?.max_horizon_days ?? 365,
    cancellation_window_hours: policy?.cancellation_window_hours ?? 24,
    allow_reschedule: policy?.allow_reschedule ?? true,
    require_message_for_request: policy?.require_message_for_request ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      const method = policy ? 'PATCH' : 'POST';
      const url = policy
        ? `/api/scheduling/resource-policies/${policy.id}/`
        : '/api/scheduling/resource-policies/';
      const body = policy ? form : { resource: resource.id, ...form };
      const res = await fetch(url, {
        method,
        headers: apiHeaders(tokens.access),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.detail || JSON.stringify(d));
        return;
      }
      setPolicy(await res.json());
      onNext();
    } catch {
      setErr('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'number', min, max) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form[key]}
            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
            className="w-4 h-4 accent-pink-600"
          />
          <span className="text-sm text-gray-600">Enabled</span>
        </label>
      ) : (
        <input
          type={type}
          min={min}
          max={max}
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">2. Booking policy</h2>

      {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Booking mode</label>
        <div className="space-y-2">
          {BOOKING_MODES.map((m) => (
            <label key={m.value} className="flex items-start gap-3 cursor-pointer border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="booking_mode"
                value={m.value}
                checked={form.booking_mode === m.value}
                onChange={() => setForm((p) => ({ ...p, booking_mode: m.value }))}
                className="mt-0.5 accent-pink-600"
              />
              <span className="text-sm text-gray-700">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field('Min notice (hours)', 'min_notice_hours', 'number', 0, 720)}
        {field('Max advance booking (days)', 'max_horizon_days', 'number', 1, 730)}
        {field('Cancellation window (hours)', 'cancellation_window_hours', 'number', 0, 720)}
        {field('Allow rescheduling', 'allow_reschedule', 'checkbox')}
        {field('Require message with request', 'require_message_for_request', 'checkbox')}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="border border-gray-300 text-gray-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-all">
          Back
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-pink-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-pink-700 transition-all disabled:opacity-60"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
          Save & continue
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Weekly availability
// ---------------------------------------------------------------------------
function AvailabilityStep({ resource, rules, setRules, tokens, onNext, onBack }) {
  const [newRule, setNewRule] = useState({ day: 'Monday', start: '09:00', end: '17:00' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [err, setErr] = useState('');

  const addRule = async () => {
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/scheduling/availability-rules/', {
        method: 'POST',
        headers: apiHeaders(tokens.access),
        body: JSON.stringify({
          resource: resource.id,
          name: `${newRule.day} window`,
          frequency: 'WEEKLY',
          weekdays: [DAY_INDICES[newRule.day]],
          local_start_time: newRule.start,
          local_end_time: newRule.end,
          is_active: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.detail || JSON.stringify(d));
        return;
      }
      const newRuleData = await res.json();
      setRules((prev) => [...prev, newRuleData]);
    } catch {
      setErr('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async (id) => {
    setDeleting(id);
    try {
      await fetch(`/api/scheduling/availability-rules/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setErr('Could not delete rule.');
    } finally {
      setDeleting(null);
    }
  };

  const dayName = (indices) => {
    if (!Array.isArray(indices)) return '—';
    return indices.map((i) => DAYS[i]).join(', ');
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">3. Weekly availability</h2>
      <p className="text-sm text-gray-500">Define which days and times you are available for bookings.</p>

      {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

      {/* Existing rules */}
      {rules.length > 0 && (
        <div className="space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white">
              <div className="text-sm">
                <span className="font-semibold text-gray-800">{dayName(r.weekdays)}</span>
                <span className="text-gray-500 ml-2">{r.local_start_time} – {r.local_end_time}</span>
              </div>
              <button
                onClick={() => deleteRule(r.id)}
                disabled={deleting === r.id}
                className="text-red-400 hover:text-red-600 transition-colors p-1"
              >
                {deleting === r.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new rule */}
      <div className="border border-dashed border-gray-300 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Add availability window</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Day</label>
            <select
              value={newRule.day}
              onChange={(e) => setNewRule((p) => ({ ...p, day: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="time"
              value={newRule.start}
              onChange={(e) => setNewRule((p) => ({ ...p, start: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="time"
              value={newRule.end}
              onChange={(e) => setNewRule((p) => ({ ...p, end: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        </div>
        <button
          onClick={addRule}
          disabled={saving}
          className="flex items-center gap-2 border border-pink-300 text-pink-600 font-semibold px-4 py-2 rounded-xl hover:bg-pink-50 transition-all disabled:opacity-60 text-sm"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          Add window
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="border border-gray-300 text-gray-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-all">
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-pink-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-pink-700 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Blackout dates
// ---------------------------------------------------------------------------
function BlackoutStep({ resource, tokens, onFinish, onBack }) {
  const [exceptions, setExceptions] = useState([]);
  const [form, setForm] = useState({ start: '', end: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!resource || !tokens?.access) return;
    fetch(`/api/scheduling/availability-exceptions/?resource=${resource.id}`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then((r) => r.json())
      .then((d) => setExceptions(Array.isArray(d) ? d : d.results || []))
      .catch(() => {});
  }, [resource, tokens]);

  const add = async () => {
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/scheduling/availability-exceptions/', {
        method: 'POST',
        headers: apiHeaders(tokens.access),
        body: JSON.stringify({
          resource: resource.id,
          exception_type: 'BLACKOUT',
          start_at: form.start,
          end_at: form.end,
          reason: form.reason,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.detail || JSON.stringify(d));
        return;
      }
      const newException = await res.json();
      setExceptions((prev) => [...prev, newException]);
      setForm({ start: '', end: '', reason: '' });
    } catch {
      setErr('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await fetch(`/api/scheduling/availability-exceptions/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokens.access}` },
    });
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">4. Blackout dates</h2>
      <p className="text-sm text-gray-500">Mark periods when you are unavailable (holidays, personal time, etc.).</p>

      {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

      {exceptions.length > 0 && (
        <div className="space-y-2">
          {exceptions.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between gap-3 border border-red-200 rounded-xl px-4 py-3 bg-red-50">
              <div className="text-sm">
                <span className="font-semibold text-red-800">{ex.start_at?.slice(0, 10)} → {ex.end_at?.slice(0, 10)}</span>
                {ex.reason && <span className="text-red-600 ml-2">— {ex.reason}</span>}
              </div>
              <button onClick={() => remove(ex.id)} className="text-red-400 hover:text-red-600 p-1">
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border border-dashed border-gray-300 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Add blackout period</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="datetime-local"
              value={form.start}
              onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        </div>
        <input
          value={form.reason}
          onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
          placeholder="Reason (optional)"
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        <button
          onClick={add}
          disabled={saving || !form.start || !form.end}
          className="flex items-center gap-2 border border-red-300 text-red-600 font-semibold px-4 py-2 rounded-xl hover:bg-red-50 transition-all disabled:opacity-60 text-sm"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          Add blackout
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="border border-gray-300 text-gray-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-all">
          Back
        </button>
        <button
          onClick={onFinish}
          className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all"
        >
          Finish setup
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ProviderAvailabilityPage() {
  const { tokens, user } = useAuth();
  const [step, setStep] = useState(1);
  const [resource, setResource] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [rules, setRules] = useState([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing resource + policy + rules on mount
  const fetchExisting = useCallback(async () => {
    if (!tokens?.access) return;
    setLoading(true);
    try {
      const [resRes, ruleRes] = await Promise.all([
        fetch(`/api/scheduling/resources/?owner_id=${user.id}`, { headers: { Authorization: `Bearer ${tokens.access}` } }),
        fetch('/api/scheduling/availability-rules/', { headers: { Authorization: `Bearer ${tokens.access}` } }),
      ]);
      const resData = await resRes.json();
      const myResource = Array.isArray(resData) ? resData[0] : resData.results?.[0] || null;
      setResource(myResource);

      if (myResource) {
        const polRes = await fetch(`/api/scheduling/resource-policies/?resource=${myResource.id}`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        const polData = await polRes.json();
        setPolicy(Array.isArray(polData) ? polData[0] : polData.results?.[0] || null);
      }

      const ruleData = await ruleRes.json();
      setRules(Array.isArray(ruleData) ? ruleData : ruleData.results || []);
    } catch {
      // pass
    } finally {
      setLoading(false);
    }
  }, [tokens]);

  useEffect(() => { fetchExisting(); }, [fetchExisting]);

  const STEPS = ['Marketplace profile', 'Booking policy', 'Weekly availability', 'Blackout dates'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 gap-2">
        <FaSpinner className="animate-spin text-2xl" />
        <span>Loading your availability settings…</span>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-black text-gray-900">You're all set!</h2>
          <p className="text-gray-600">
            Organizers can now discover you in the marketplace and send booking requests.
          </p>
          <a
            href="/provider-dashboard"
            className="inline-block mt-2 bg-pink-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-pink-700 transition-all"
          >
            Go to my dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-pink-500">Provider setup</p>
          <h1 className="mt-1 text-3xl font-black text-gray-900">Availability & booking settings</h1>
        </div>

        {/* Step progress */}
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i < step ? 'bg-pink-500' : 'bg-gray-200'}`} />
              <p className={`text-[10px] mt-1 font-medium hidden sm:block ${i < step ? 'text-pink-600' : 'text-gray-400'}`}>
                {s}
              </p>
            </div>
          ))}
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          {step === 1 && (
            <ResourceStep
              resource={resource}
              setResource={setResource}
              tokens={tokens}
              user={user}
              resourceType={deriveResourceType(user)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <PolicyStep
              resource={resource}
              policy={policy}
              setPolicy={setPolicy}
              tokens={tokens}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <AvailabilityStep
              resource={resource}
              rules={rules}
              setRules={setRules}
              tokens={tokens}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <BlackoutStep
              resource={resource}
              tokens={tokens}
              onFinish={() => setDone(true)}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
