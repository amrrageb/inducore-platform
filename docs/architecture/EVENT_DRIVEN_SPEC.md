# Event-Driven Architecture & Outbox Pattern Specification

InduCore utilizes Event-Driven Architecture (EDA) to decouple bounded contexts and guarantee asynchronous consistency across microservices, background workers, and external audit logs.

---

## 📬 Transactional Outbox Pattern

To prevent dual-write anomalies (such as a database commit succeeding while an asynchronous messaging publication fails), domain events are saved to a dedicated `outbox_events` table within the **same SQL transaction** as the aggregate state change.

```
+-------------------------------------------------------------------------------+
| SQL Database Transaction                                                       |
|  1. UPDATE rfq_aggregates SET status = 'EVALUATING' WHERE id = $1 AND tenant = $2; |
|  2. INSERT INTO outbox_events (id, topic, payload, tenant_id, status) VALUES (...);|
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
                           (ACID Transaction Commit)
                                      │
                                      ▼
                      +-------------------------------+
                      | Outbox Relayer Daemon Worker  |
                      | - Polls `outbox_events`       |
                      | - Enforces tenant ordering    |
                      +---------------+---------------+
                                      │
                                      ▼
                           (Publish to Apache Kafka)
                                      │
                                      ▼
                      +-------------------------------+
                      | UPDATE outbox_events SET      |
                      | status = 'PUBLISHED'          |
                      +-------------------------------+
```

---

## 🗄️ Outbox Table Database Schema (`outbox_events`)

```sql
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  aggregate_type VARCHAR(128) NOT NULL,
  aggregate_id VARCHAR(128) NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  retry_count INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_outbox_pending ON outbox_events (status, created_at) WHERE status = 'PENDING';
CREATE INDEX idx_outbox_tenant ON outbox_events (tenant_id);
```

---

## 📜 Core Domain Event Registry

| Event Name | Originating Context | Payload Contract Schema | Target Consumers |
| :--- | :--- | :--- | :--- |
| `RfqCreatedEvent` | Procurement | `{ rfqId, tenantId, title, lineItemsCount, createdBy }` | Supplier Matchmaker, Audit Trail |
| `BidSubmittedEvent` | Procurement | `{ rfqId, supplierId, bidId, totalAmount, currency }` | Gemini AI Evaluation Engine |
| `RfqEvaluatedEvent` | Procurement | `{ rfqId, recommendedSupplierId, score, evaluationRationale }` | Notification Gateway, Web Portal |
| `TelemetryAnomalyDetected` | Plant IoT | `{ assetId, sensorId, metricType, severity, value }` | Predictive Procurement Auto-Reorder |
| `StockDepletedEvent` | Inventory | `{ sku, warehouseId, currentQty, minThreshold }` | Draft RFQ Generator |

---

## 🔁 Message Delivery & Resiliency Guarantees

1. **At-Least-Once Delivery**: Events are published to Kafka topics with `acks=all` confirmation. Consumers MUST implement idempotent message processing based on `eventId` or `idempotencyKey`.
2. **Exponential Backoff & Retries**: Outbox relayer retries failed deliveries up to 5 times (`retry_count`) with exponential backoff (`2^n * 1000ms`).
3. **Dead-Letter Queue (DLQ)**: Events exceeding maximum retry attempts are marked as `FAILED` and routed to the `dlq.outbox.events` dead-letter topic for manual operator review.

