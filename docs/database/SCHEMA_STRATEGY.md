# Enterprise Database Schema & Relational Strategy Specification

## 1. Executive Summary & Engine Selection

InduCore utilizes **PostgreSQL 16** as its primary ACID-compliant relational data store. The database engine is configured with **Row-Level Security (RLS)**, **Generalized Inverted Indexes (GIN)**, and **Trigram Similarity Extensions (`pg_trgm`)**.

All tenant data resides in a pooled database model with strict logical separation enforced at the database kernel level via session configuration variables.

---

## 🗄️ 2. Core Relational Schema DDL

```sql
-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Tenants Table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. RFQs Table (Tenant Isolated)
CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- DRAFT, OPEN, EVALUATING, AWARDED, CANCELLED
    target_budget NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    expiration_date TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. RFQ Line Items Table
CREATE TABLE rfq_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    sku VARCHAR(128) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    specification_details JSONB DEFAULT '{}'::jsonb,
    quantity INT NOT NULL CHECK (quantity > 0),
    target_unit_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Supplier Bids Table (Tenant Isolated)
CREATE TABLE supplier_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    total_amount NUMERIC(18, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    lead_time_days INT NOT NULL CHECK (lead_time_days >= 0),
    ai_score NUMERIC(5, 2) DEFAULT NULL,
    score_breakdown JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, ACCEPTED, REJECTED
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Transactional Outbox Table (Tenant Isolated)
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

-- 6. Audit Logs Table (Tenant Isolated & Immutable)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(128) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    changes JSONB NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚡ 3. Indexing Strategy & Performance Rules

1. **Composite Tenant Indexes**:
   ```sql
   CREATE INDEX idx_rfqs_tenant_status ON rfqs(tenant_id, status, created_at DESC);
   CREATE INDEX idx_bids_tenant_rfq ON supplier_bids(tenant_id, rfq_id);
   ```

2. **Partial Index for Outbox Worker**:
   ```sql
   CREATE INDEX idx_outbox_pending ON outbox_events(created_at) WHERE status = 'PENDING';
   ```

3. **Full-Text & Trigram Search Indexes**:
   ```sql
   CREATE INDEX idx_rfqs_search_vector ON rfqs USING GIN (search_vector);
   CREATE INDEX idx_line_items_sku_trgm ON rfq_line_items USING GIN (sku gin_trgm_ops);
   ```

---

## 📏 4. Data Type Precision Standards

- **Primary Keys**: `UUID` generated via `gen_random_uuid()`.
- **Financial Balances / Budgets**: `NUMERIC(18, 4)` for sub-cent currency precision.
- **Timestamps**: Always `TIMESTAMPTZ` (stored in UTC).
- **Flexible Specs**: `JSONB` with default `'{}'::jsonb`.
