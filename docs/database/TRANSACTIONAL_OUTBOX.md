# Transactional Outbox Database Pattern Specification

## 1. Executive Summary & Purpose

To guarantee **at-least-once domain event delivery** without distributed 2PC transactions, InduCore implements the **Transactional Outbox Pattern** at the database persistence tier.

When a domain state update occurs (e.g., `RFQCreatedEvent`), the state change and the domain event record are written atomically into PostgreSQL within a single database transaction.

---

## 🗄️ 2. Outbox Table Schema DDL

```sql
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    aggregate_type VARCHAR(128) NOT NULL,
    aggregate_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSED, FAILED
    retry_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

-- Index for high-speed worker polling
CREATE INDEX idx_outbox_pending_polling 
ON outbox_events (created_at ASC) 
WHERE status = 'PENDING';
```

---

## 🔄 3. Atomic Repository Pattern Implementation

```typescript
// Example within PostgresRFQRepository.ts
async save(rfq: RFQAggregate, tenantId: string): Promise<void> {
  await runInTenantTransaction(this.client, tenantId, async () => {
    // 1. Update RFQ state
    await this.client.query(
      `INSERT INTO rfqs (id, tenant_id, title, status, target_budget)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
      [rfq.id, tenantId, rfq.title, rfq.status, rfq.targetBudget.amount]
    );

    // 2. Persist domain events to outbox_events table in same transaction
    for (const event of rfq.domainEvents) {
      await this.client.query(
        `INSERT INTO outbox_events (tenant_id, aggregate_type, aggregate_id, event_type, payload)
         VALUES ($1, $2, $3, $4, $5)`,
        [tenantId, 'RFQ', rfq.id, event.eventType, JSON.stringify(event)]
      );
    }
  });
}
```

---

## 🧹 4. Archiving & Retention Policy

Processed outbox events are retained for 7 days before being automatically purged or archived to cold analytical storage by a daily cleanup cron job (`DELETE FROM outbox_events WHERE status = 'PROCESSED' AND processed_at < NOW() - INTERVAL '7 days'`).
