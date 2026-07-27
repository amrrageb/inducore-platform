# PostgreSQL Row-Level Security (RLS) & Multi-Tenancy Specification

## 1. Executive Summary

InduCore implements a **Pool Model database architecture** where all enterprise tenants store data in a single shared PostgreSQL database. Logical tenant isolation is enforced directly by the database kernel using **PostgreSQL Row-Level Security (RLS)** policies.

This guarantees that application code bugs cannot bypass tenant filtering or result in cross-tenant data leaks.

---

## 🔒 2. DDL Policy Declarations

```sql
-- 1. Enable RLS on all tenant-isolated tables
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Force RLS for table owners (prevents accidental superuser bypass)
ALTER TABLE rfqs FORCE ROW LEVEL SECURITY;
ALTER TABLE supplier_bids FORCE ROW LEVEL SECURITY;
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- 3. Define isolation policies reading current tenant session setting
CREATE POLICY rfq_tenant_policy ON rfqs
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY bids_tenant_policy ON supplier_bids
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY outbox_tenant_policy ON outbox_events
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY audit_tenant_policy ON audit_logs
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
```

---

## 🛠️ 3. Node.js Database Transaction Hook

Every database connection checked out from the connection pool MUST run `SET LOCAL app.current_tenant_id` within the active transaction scope before executing queries:

```typescript
// packages/infrastructure/src/persistence/PostgresTenantSession.ts
import { PoolClient } from 'pg';

export async function runInTenantTransaction<T>(
  client: PoolClient,
  tenantId: string,
  callback: () => Promise<T>
): Promise<T> {
  try {
    await client.query('BEGIN');
    // Set transaction-scoped tenant context (SET LOCAL is reset automatically on COMMIT/ROLLBACK)
    await client.query(`SET LOCAL app.current_tenant_id = $1`, [tenantId]);
    
    const result = await callback();
    
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
```

---

## 🔑 4. Administrative Role Bypass Strategy

System background processes (e.g. outbox event relayer, database migration runners) run under the restricted `inducore_admin` role which has explicit permission to bypass RLS policies when performing system maintenance or cross-tenant event processing.
