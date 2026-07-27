# Enterprise Database Architecture Specifications Directory (`/docs/database`)

This directory contains the detailed PostgreSQL 16 schema definitions, Row-Level Security (RLS) multi-tenancy enforcement policies, Transactional Outbox pattern tables, and zero-downtime migration workflows for **InduCore**.

---

## 📜 Database Documentation Suite

| Document | Domain | Key Topics Covered |
| :--- | :--- | :--- |
| **[SCHEMA_STRATEGY.md](./SCHEMA_STRATEGY.md)** | Relational Schema Strategy | PostgreSQL 16 DDL, UUID keys, NUMERIC precision, JSONB columns, GIN search indexes. |
| **[ROW_LEVEL_SECURITY.md](./ROW_LEVEL_SECURITY.md)** | Multi-Tenant RLS Policies | DDL policies, `app.current_tenant_id` session setting, transaction hooks, admin bypass. |
| **[TRANSACTIONAL_OUTBOX.md](./TRANSACTIONAL_OUTBOX.md)** | Event Outbox Architecture | `outbox_events` schema, atomic transaction writes, polling index, 7-day retention. |
| **[MIGRATIONS_AND_SEEDING.md](./MIGRATIONS_AND_SEEDING.md)** | Migrations & Seed Data | Additive zero-downtime migration rules, Drizzle ORM workflows, multi-tenant seed scripts. |
