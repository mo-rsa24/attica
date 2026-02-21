# Scheduling Webhook Contract

Scheduling outbox events are delivered as `POST` JSON requests to each configured webhook target.

## Payload

```json
{
  "event_type": "booking.confirmed",
  "aggregate_type": "booking",
  "aggregate_id": "123",
  "payload": { "...": "..." },
  "created_at": "2026-02-14T17:00:00Z",
  "outbox_id": 456
}
```

## Headers

- `Content-Type: application/json`
- `X-Scheduling-Event: <event_type>`
- `X-Scheduling-Delivery-Id: <outbox_id>`
- `X-Scheduling-Timestamp: <unix-epoch-seconds>`
- `Idempotency-Key: scheduling-outbox-<outbox_id>`
- `X-Scheduling-Signature: v1=<hex-hmac-sha256>` (when secret configured)

## Signature Verification

If `SCHEDULING_WEBHOOK_SECRET` (or per-target `secret`) is configured:

1. Read raw request body bytes.
2. Build signed bytes: `"{timestamp}.{body}"` where `timestamp` is `X-Scheduling-Timestamp`.
3. Compute `HMAC_SHA256(secret, signed_bytes)`.
4. Compare with `X-Scheduling-Signature` value `v1=<digest>` using constant-time compare.

## Receiver Idempotency

Use `Idempotency-Key` (or `X-Scheduling-Delivery-Id`) to deduplicate retries.
Treat duplicate keys as success to keep delivery at-least-once safe.

## Sender Reliability

- Exponential retry backoff from `SCHEDULING_OUTBOX_RETRY_BASE_SECONDS`.
- Max retries from `SCHEDULING_OUTBOX_MAX_ATTEMPTS`.
- Failed events move to `OutboxDeadLetter` after max retries.
- Per-endpoint circuit breaker:
  - opens after `SCHEDULING_WEBHOOK_CIRCUIT_FAILURE_THRESHOLD` consecutive failures,
  - remains open for `SCHEDULING_WEBHOOK_CIRCUIT_OPEN_SECONDS`.
