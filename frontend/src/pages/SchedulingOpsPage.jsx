import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../AuthContext';
import { schedulingApi, schedulingFormatters } from '../api/schedulingApi';

const initialTargetForm = {
  url: '',
  description: '',
  secret: '',
  timeout_seconds: 5,
  failure_threshold: 5,
  open_seconds: 120,
};

const normalizeListPayload = (payload) => (Array.isArray(payload?.results) ? payload.results : (Array.isArray(payload) ? payload : []));

export default function SchedulingOpsPage() {
  const navigate = useNavigate();
  const { user, tokens } = useAuth();
  const authToken = tokens?.access;
  const isAdmin = useMemo(
    () => Boolean(user?.is_staff || user?.is_superuser || (user?.roles || []).includes('ADMIN')),
    [user],
  );

  const [summary, setSummary] = useState(null);
  const [targets, setTargets] = useState([]);
  const [deadLetters, setDeadLetters] = useState([]);
  const [outboxEvents, setOutboxEvents] = useState([]);
  const [conflictIncidents, setConflictIncidents] = useState([]);
  const [targetForm, setTargetForm] = useState(initialTargetForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadOpsData = async () => {
    if (!authToken || !isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const [summaryPayload, targetsPayload, deadLettersPayload, outboxPayload, conflictsPayload] = await Promise.all([
        schedulingApi.getOpsSummary(authToken),
        schedulingApi.getWebhookTargets(authToken),
        schedulingApi.getDeadLetters(authToken),
        schedulingApi.getOutboxEvents(authToken, { limit: 30 }),
        schedulingApi.getConflictIncidents(authToken, { limit: 30 }),
      ]);
      setSummary(summaryPayload || null);
      setTargets(normalizeListPayload(targetsPayload));
      setDeadLetters(normalizeListPayload(deadLettersPayload));
      setOutboxEvents(normalizeListPayload(outboxPayload));
      setConflictIncidents(normalizeListPayload(conflictsPayload));
    } catch (err) {
      setError(err.message || 'Failed to load scheduling ops data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpsData();
  }, [authToken, isAdmin]);

  const handleCreateTarget = async (event) => {
    event.preventDefault();
    if (!authToken) return;
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await schedulingApi.createWebhookTarget(authToken, {
        ...targetForm,
        timeout_seconds: Number(targetForm.timeout_seconds),
        failure_threshold: Number(targetForm.failure_threshold),
        open_seconds: Number(targetForm.open_seconds),
      });
      setTargetForm(initialTargetForm);
      setNotice('Webhook target created.');
      await loadOpsData();
    } catch (err) {
      setError(err.message || 'Failed to create webhook target.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTarget = async (target) => {
    if (!authToken) return;
    setError('');
    setNotice('');
    try {
      await schedulingApi.updateWebhookTarget(authToken, target.id, { is_active: !target.is_active });
      setNotice(`Webhook target ${target.is_active ? 'disabled' : 'enabled'}.`);
      await loadOpsData();
    } catch (err) {
      setError(err.message || 'Failed to update webhook target.');
    }
  };

  const handleRotateSecret = async (target) => {
    if (!authToken) return;
    const newSecret = window.prompt(`Enter new secret for ${target.url}:`, '');
    if (!newSecret) return;
    setError('');
    setNotice('');
    try {
      await schedulingApi.updateWebhookTarget(authToken, target.id, { secret: newSecret });
      setNotice('Webhook secret updated.');
      await loadOpsData();
    } catch (err) {
      setError(err.message || 'Failed to rotate secret.');
    }
  };

  const handleDeleteTarget = async (target) => {
    if (!authToken) return;
    if (!window.confirm(`Delete webhook target ${target.url}?`)) return;
    setError('');
    setNotice('');
    try {
      await schedulingApi.deleteWebhookTarget(authToken, target.id);
      setNotice('Webhook target deleted.');
      await loadOpsData();
    } catch (err) {
      setError(err.message || 'Failed to delete webhook target.');
    }
  };

  const handleReplayDeadLetter = async (item) => {
    if (!authToken) return;
    setError('');
    setNotice('');
    try {
      const replay = await schedulingApi.replayDeadLetter(authToken, item.id);
      setNotice(`Dead letter #${item.id} replayed as outbox #${replay.replayed_outbox_event_id}.`);
      await loadOpsData();
    } catch (err) {
      setError(err.message || 'Failed to replay dead letter.');
    }
  };

  if (!authToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-lg">
          <h1 className="text-2xl font-bold text-gray-900">Scheduling Ops</h1>
          <p className="text-gray-600 mt-2">Please sign in to access admin scheduling operations.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-5 px-5 py-2.5 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-lg">
          <h1 className="text-2xl font-bold text-gray-900">Scheduling Ops</h1>
          <p className="text-gray-600 mt-2">Admin access is required for this dashboard.</p>
        </div>
      </div>
    );
  }

  const outboxCounts = summary?.outbox_counts || {};
  const constraints = summary?.constraints || {};
  const webhookMetrics = summary?.webhooks || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduling Ops</h1>
            <p className="text-gray-600 mt-1">Admin tooling for outbox reliability, webhook controls, DLQ replay, and DB conflict monitoring.</p>
          </div>
          <button
            onClick={loadOpsData}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Ops Data'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}
        {notice && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">{notice}</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-bold text-gray-900">{outboxCounts.pending || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Processing</p>
            <p className="text-xl font-bold text-gray-900">{outboxCounts.processing || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Sent</p>
            <p className="text-xl font-bold text-gray-900">{outboxCounts.sent || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Failed</p>
            <p className="text-xl font-bold text-gray-900">{outboxCounts.failed || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Dead Letter</p>
            <p className="text-xl font-bold text-gray-900">{outboxCounts.dead_letter || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Constraint</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {constraints.database_vendor === 'postgresql'
                ? (constraints.constraint_present ? 'Active' : 'Missing')
                : `N/A (${constraints.database_vendor || 'unknown'})`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Webhook Target Config</h2>
            <form onSubmit={handleCreateTarget} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="https://hooks.example/scheduling"
                value={targetForm.url}
                onChange={(event) => setTargetForm((prev) => ({ ...prev, url: event.target.value }))}
                required
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Description"
                value={targetForm.description}
                onChange={(event) => setTargetForm((prev) => ({ ...prev, description: event.target.value }))}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Secret"
                value={targetForm.secret}
                onChange={(event) => setTargetForm((prev) => ({ ...prev, secret: event.target.value }))}
              />
              <input
                type="number"
                min="1"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Timeout seconds"
                value={targetForm.timeout_seconds}
                onChange={(event) => setTargetForm((prev) => ({ ...prev, timeout_seconds: Number(event.target.value) || 1 }))}
              />
              <input
                type="number"
                min="1"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Failure threshold"
                value={targetForm.failure_threshold}
                onChange={(event) => setTargetForm((prev) => ({ ...prev, failure_threshold: Number(event.target.value) || 1 }))}
              />
              <input
                type="number"
                min="5"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Open seconds"
                value={targetForm.open_seconds}
                onChange={(event) => setTargetForm((prev) => ({ ...prev, open_seconds: Number(event.target.value) || 5 }))}
              />
              <button
                type="submit"
                className="md:col-span-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:bg-slate-400"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Add Webhook Target'}
              </button>
            </form>

            <div className="space-y-2">
              {targets.map((target) => (
                <div key={target.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900 text-sm">{target.url}</p>
                  <p className="text-xs text-gray-500">{target.description || 'No description'} | Secret: {target.secret_preview || 'none'}</p>
                  <p className="text-xs text-gray-500">
                    Timeout {target.timeout_seconds}s | Threshold {target.failure_threshold} | Open {target.open_seconds}s
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => handleToggleTarget(target)}
                      className="px-2.5 py-1 rounded-md border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      {target.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleRotateSecret(target)}
                      className="px-2.5 py-1 rounded-md border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50"
                    >
                      Rotate Secret
                    </button>
                    <button
                      onClick={() => handleDeleteTarget(target)}
                      className="px-2.5 py-1 rounded-md border border-red-300 text-xs text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {targets.length === 0 && <p className="text-sm text-gray-500">No webhook targets configured.</p>}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Circuit + Metrics Dashboard</h2>
            <div className="space-y-3">
              {webhookMetrics.map((webhook) => (
                <div key={webhook.url} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900 text-sm">{webhook.url}</p>
                  <p className="text-xs text-gray-500">
                    Source: {webhook.source} | Circuit: {webhook.circuit_open ? `OPEN (${webhook.circuit_remaining_seconds}s)` : 'CLOSED'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Attempted {webhook.metrics?.attempted || 0} | Success {webhook.metrics?.success || 0} | Failed {webhook.metrics?.failed || 0} | Skipped {webhook.metrics?.skipped_circuit || 0}
                  </p>
                </div>
              ))}
              {webhookMetrics.length === 0 && <p className="text-sm text-gray-500">No webhook metrics yet.</p>}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Dead-Letter Queue</h2>
            {deadLetters.slice(0, 25).map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-900 text-sm">#{item.id} {item.event_type}</p>
                <p className="text-xs text-gray-500">{item.aggregate_type}:{item.aggregate_id} | attempts: {item.attempts}</p>
                <p className="text-xs text-red-700 mt-1">{item.error_message || 'No error message'}</p>
                <button
                  onClick={() => handleReplayDeadLetter(item)}
                  className="mt-2 px-2.5 py-1 rounded-md border border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-50"
                >
                  Replay
                </button>
              </div>
            ))}
            {deadLetters.length === 0 && <p className="text-sm text-gray-500">No dead-letter items.</p>}
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Postgres Constraint Monitoring</h2>
            <p className="text-sm text-gray-600">
              DB Vendor: {constraints.database_vendor || 'unknown'} | Constraint: {
                constraints.database_vendor === 'postgresql'
                  ? (constraints.constraint_present ? 'Present' : 'Missing')
                  : 'Not applicable'
              }
            </p>
            <p className="text-sm text-gray-600">
              Last 24h conflicts: {constraints.last_24h_conflicts_total || 0}
            </p>
            <div className="space-y-2">
              {conflictIncidents.slice(0, 20).map((incident) => (
                <div key={incident.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900 text-sm">
                    #{incident.id} {incident.operation} ({incident.conflict_source})
                  </p>
                  <p className="text-xs text-gray-500">
                    Resource #{incident.resource || 'n/a'} | Event #{incident.event || 'n/a'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {schedulingFormatters.formatDateTime(incident.requested_start_at)} - {schedulingFormatters.formatDateTime(incident.requested_end_at)}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">{incident.message}</p>
                </div>
              ))}
              {conflictIncidents.length === 0 && <p className="text-sm text-gray-500">No conflict incidents logged yet.</p>}
            </div>
          </section>
        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Outbox Events</h2>
          <div className="space-y-2">
            {outboxEvents.slice(0, 25).map((eventItem) => (
              <div key={eventItem.id} className="border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-900 text-sm">#{eventItem.id} {eventItem.event_type}</p>
                <p className="text-xs text-gray-500">
                  {eventItem.aggregate_type}:{eventItem.aggregate_id} | {eventItem.status} | attempts {eventItem.attempts}
                </p>
                {eventItem.last_error && <p className="text-xs text-red-700 mt-1">{eventItem.last_error}</p>}
              </div>
            ))}
            {outboxEvents.length === 0 && <p className="text-sm text-gray-500">No outbox events found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
