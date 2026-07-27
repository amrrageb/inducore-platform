# Multi-Tenancy Architecture & Row-Level Security (RLS) Specification

## 1. Executive Summary & Strategy

InduCore enforces a **Pooled Database with Row-Level Security (RLS)** multi-tenancy model. All enterprise tenants share a high-performance PostgreSQL database instance, but logical tenant boundaries are strictly isolated at the database engine level via PostgreSQL Row-Level Security policies.

This strategy guarantees zero cross-tenant data leakage while maintaining optimal query performance, simplified database migrations, and cost-effective scaling.

---

## 🏛️ 2. End-to-End Tenant Isolation Lifecycle

```
[ HTTP Request ] (Header: X-Tenant-ID: "tenant-uuid-1234")
       │
       ▼
[ API Gateway Middleware ] (`tenantContextMiddleware.ts`)
       │ Validate JWT / Header & Attach Tenant Context to Request
       ▼
[ Application Use Case ] (`CreateRFQUseCase.execute(dto, tenantContext)`)
       │ Pass TenantId Value Object to Repository
       ▼
[ Postgres Repository Adapter ] (`PostgresRFQRepository`)
       │ Execute SQL inside DB Transaction:
       │ SET LOCAL app.current_tenant_id = 'tenant-uuid-1234';
       ▼
[ PostgreSQL RLS Engine ]
       │ Evaluates Policy: WHERE tenant_id = current_setting('app.current_tenant_id')
       ▼
[ Query Execution ] (Returns ONLY rows matching 'tenant-uuid-1234')
```

---

## 🔒 3. PostgreSQL Row-Level Security (RLS) SQL Policies

Every business table in PostgreSQL includes a mandatory `tenant_id UUID NOT NULL` column and has Row-Level Security explicitly enabled:

```sql
-- 1. Enable RLS on core tables
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create tenant isolation policy
CREATE POLICY tenant_isolation_policy ON rfqs
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy_bids ON supplier_bids
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
```

---

## 🛠️ 4. Tenant Context Middleware Implementation

The Express API Gateway middleware extracts and validates tenant context on every inbound request:

```typescript
// apps/api-gateway/src/middleware/tenantContextMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export function tenantContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const tenantIdHeader = req.headers['x-tenant-id'] as string;
  
  if (!tenantIdHeader) {
    res.status(400).json({ error: 'MISSING_TENANT_CONTEXT', message: 'X-Tenant-ID header is required.' });
    return;
  }

  // Attach strongly typed TenantContext to request
  req.tenantContext = {
    tenantId: tenantIdHeader,
    userId: (req as any).user?.id || 'system',
  };

  next();
}
```

---

## 📦 5. Outbox & Kafka Tenant Context Propagation

Multi-tenant context MUST be preserved when asynchronous domain events are published to background queues or event buses:
1. The `outbox_events` table includes a `tenant_id` column.
2. The Outbox Relayer daemon attaches `X-Tenant-ID` to Kafka message headers.
3. Event consumers set `app.current_tenant_id` before processing incoming messages.

```
[ Outbox Event Row ] (tenant_id: "uuid-1234")
         │
         ▼ (Relayer Worker)
[ Kafka Event Header ] (key: "X-Tenant-ID", value: "uuid-1234")
         │
         ▼ (Consumer Service)
[ Set DB Session ] -> SET LOCAL app.current_tenant_id = 'uuid-1234';
```
