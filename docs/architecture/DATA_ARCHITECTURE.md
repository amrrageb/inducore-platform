# Data Architecture Specification

## 1. Executive Summary & Storage Topology

InduCore implements a **Polyglot Data Architecture** optimized for transaction safety, multi-tenant isolation, real-time caching, and high-throughput event streaming:

- **Primary Relational Engine**: PostgreSQL 16 with Row-Level Security (RLS) for ACID transactional domain entities and outbox queues.
- **In-Memory Cache & Session Store**: Redis 7 for high-speed read projections, session context, and rate limiting.
- **Streaming Event Log**: Apache Kafka 7.5.0 for durable domain event publishing and cross-service communication.

---

## 🗄️ 2. Database ERD & Schema Design

```
+---------------------------+       1:N       +---------------------------+
|          rfqs             | <-------------> |      rfq_line_items       |
+---------------------------+                 +---------------------------+
| id UUID PK                |                 | id UUID PK                |
| tenant_id UUID NOT NULL   |                 | rfq_id UUID FK            |
| title VARCHAR(255)        |                 | sku VARCHAR(128)          |
| status VARCHAR(32)        |                 | quantity INT NOT NULL     |
| target_budget NUMERIC     |                 | target_unit_price NUMERIC |
| currency VARCHAR(3)       |                 | delivery_target_date DATE |
| expiration_date TIMESTAMPTZ|                +---------------------------+
+---------------------------+
              |
              | 1:N
              v
+---------------------------+       1:N       +---------------------------+
|       supplier_bids       | <-------------> |     bid_line_items        |
+---------------------------+                 +---------------------------+
| id UUID PK                |                 | id UUID PK                |
| rfq_id UUID FK            |                 | bid_id UUID FK            |
| supplier_id UUID FK       |                 | line_item_id UUID FK      |
| total_amount NUMERIC      |                 | unit_bid_price NUMERIC    |
| ai_score NUMERIC(5,2)     |                 +---------------------------+
| score_breakdown JSONB     |
+---------------------------+
```

---

## 🔒 3. System Table Definitions & Precision Data Types

### Primary Rules
1. **Primary Keys**: Every table uses non-sequential `UUIDv4` primary keys (`gen_random_uuid()`) to prevent enumeration attacks.
2. **Monetary Precision**: All financial amounts use PostgreSQL `NUMERIC(18, 4)` to eliminate floating-point rounding errors.
3. **Time Standardization**: All timestamp columns are stored in UTC using `TIMESTAMPTZ`.
4. **JSONB Extensions**: Flexible technical part specifications, sensor calibration data, and AI score rationale are stored in structured `JSONB` columns with GIN indexing.

---

## 🚀 4. CQRS Read/Write Segregation & Redis Caching

To ensure high-performance read projections without locking transactional tables during peak procurement periods, InduCore implements Command-Query Responsibility Segregation (CQRS):

```
                      +---------------------------------------+
                      |       Command / Write Operations      |
                      |  (Execute Use Case -> Aggregate Root) |
                      +-------------------+-------------------+
                                          |
                                          v
                      +-------------------+-------------------+
                      |      Primary PostgreSQL 16 DB         |
                      |      (ACID Write + Outbox Event)      |
                      +-------------------+-------------------+
                                          |
                                          v  (Domain Event)
                      +-------------------+-------------------+
                      |   Redis 7 Cache Invalidation Engine   |
                      +-------------------+-------------------+
                                          |
                                          v
                      +-------------------+-------------------+
                      |          Query / Read Operations      |
                      |    (Redis Cache / Projected Read DTOs) |
                      +---------------------------------------+
```

### Redis Key Naming Convention
- **RFQ Projections**: `tenant:{tenant_id}:rfq:{rfq_id}` (TTL: 1 hour, invalidated on `RfqUpdatedEvent`).
- **Active Supplier Index**: `tenant:{tenant_id}:supplier:active_list` (TTL: 24 hours).
- **Telemetry Real-Time State**: `tenant:{tenant_id}:asset:{asset_id}:telemetry` (Sorted Set).

---

## 🔄 5. Migration & Zero-Downtime Schema Evolution

- All schema modifications are version-controlled using explicit SQL migration scripts in `packages/infrastructure/src/persistence/migrations/`.
- Schema changes MUST adhere to additive non-breaking patterns (e.g., adding nullable or default columns) to allow seamless zero-downtime rolling deployments.
