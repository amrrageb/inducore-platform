# Database Migrations & Multi-Tenant Seeding Specification

## 1. Executive Summary

InduCore manages PostgreSQL database migrations using **Drizzle ORM** type-safe schema definitions located in `packages/infrastructure/src/persistence/drizzle/`.

All schema changes MUST follow zero-downtime, additive migration patterns to ensure continuous availability during deployment rollouts.

---

## ⚙️ 2. Zero-Downtime Additive Migration Guidelines

1. **Never Drop or Rename Columns Directly**: Use expanding/contracting phases:
   - Phase 1: Add new column as nullable or with default value.
   - Phase 2: Dual-write to old and new columns.
   - Phase 3: Backfill historical data.
   - Phase 4: Deprecate and remove old column in a future release.
2. **Non-Blocking Index Creation**: Always use `CREATE INDEX CONCURRENTLY` in production migration scripts.

---

##  🌱 3. Multi-Tenant Seed Script Specification

```sql
-- packages/infrastructure/src/persistence/seeds/seed.sql

-- Insert demo tenants
INSERT INTO tenants (id, name, slug) VALUES
('a0000000-0000-0000-0000-000000000001', 'Acme Industrial Corp', 'acme-industrial'),
('b0000000-0000-0000-0000-000000000002', 'Global Energy Logistics', 'global-energy')
ON CONFLICT (id) DO NOTHING;

-- Seed initial RFQ for Acme Industrial
SET LOCAL app.current_tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO rfqs (id, tenant_id, title, description, status, target_budget, expiration_date) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Siemens 15kW Motor Replacement', 'High-priority replacement motor for Plant 3 assembly line', 'OPEN', 12500.0000, NOW() + INTERVAL '14 days')
ON CONFLICT (id) DO NOTHING;
```
