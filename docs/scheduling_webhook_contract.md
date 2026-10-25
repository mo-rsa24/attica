# Scheduling Webhook Contract

Scheduling [outbox](../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> events are delivered as `POST` JSON requests to each configured [webhook](../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> target.

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

- Exponential retry [backoff](../../../Obsidian/Information%20Technology/System%20Design/Reliability/Retry%20With%20Backoff.md#where-to-learn-this)<sub>[1](../../../Obsidian/Mathematics/references/textbooks/natural-language-processing/hands-on-large-language-models.pdf#page=189 "Hands-on large language models, chapter 4, Text classification with generative models, a tip on rate limit errors, Exponential backoff for an API that refuse..."), [2](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=161 "System design interview, chapter 10, Design a notification system, Retry mechanism, A notification that a third-party service failed to send goes back on the..."), [3](../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=860 "AI engineering, chapter 10, Step 2, Put in guardrails, output guardrails, Retrying an empty or malformed model response, what each retry adds in latency and ..."), [▶1](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3349s "Hello Interview, Networking Essentials for System Design Interviews, Timeouts, Backoff, and Retries, 55:49 to 1:00:15, Timeouts, backoff and retries taken to..."), [▶2](https://www.youtube.com/watch?v=8sTuCPh3s0s&t=0s "Arpit Bhayani, Thundering Herd Problem and How not to do API retries, 0:00 to 10:43, Why many clients retrying together can overwhelm a recovering server, an..."), [◆](../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The order service retries a charge whose reply was lost, and the idempotency key...")</sub> from `SCHEDULING_OUTBOX_RETRY_BASE_SECONDS`.
- Max retries from `SCHEDULING_OUTBOX_MAX_ATTEMPTS`.
- Failed events move to `OutboxDeadLetter` after max retries.
- Per-endpoint [circuit breaker](../../../Obsidian/Information%20Technology/System%20Design/Reliability/Circuit%20Breaker.md#where-to-learn-this)<sub>[1](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=246 "System design big archive, How can Cache Systems go wrong?, Case 4, a cache crash: a circuit breaker stops the application services reaching the cache or the..."), [2](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=10 "System design big archive, What does API gateway do?, Steps 9 to 12 of one request through a gateway, where faults that take longer to recover are handled by..."), [▶1](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3615s "Hello Interview, Networking Essentials for System Design Interviews w/ Ex Meta Senior Manager, Cascading Failures and Circuit Breakers, 1:00:15 to 1:04:35, O..."), [▶2](https://www.youtube.com/watch?v=nH4qjmP2KEE&t=58s "ByteByteGo, Top 7 Most-Used Distributed System Patterns, Circuit Breaker, 0:58 to 1:38, The pattern as the first of seven, before CQRS and event sourcing. Ch..."), [◆](../../../goal-setting/learning/system-design/api-gateways/MASTER_PLAN.md#goals "System Design: API Gateways, system-design/api-gateways. Goal 4: a circuit breaker at the gateway, shown tripping when a backend service fails and recovering...")</sub>:
  - opens after `SCHEDULING_WEBHOOK_CIRCUIT_FAILURE_THRESHOLD` consecutive failures,
  - remains open for `SCHEDULING_WEBHOOK_CIRCUIT_OPEN_SECONDS`.

📊 Drawn in [Every event is written and none is sent](artifacts/scenes/scheduling-process-flows/figure-explainer.md#figure-5-every-event-is-written-and-none-is-sent).
