# System Architecture Specification

## 1. Executive Summary & Overview

The **InduCore** system architecture is designed as a modular, event-driven enterprise monorepo that combines **Clean Architecture**, **Domain-Driven Design (DDD)**, **Multi-Tenant Row-Level Security (RLS)**, and **Transactional Outbox Event Streaming**.

The platform orchestrates high-throughput industrial B2B procurement, plant IoT sensor telemetry ingestion, automated Gemini AI bid evaluation, and immutable compliance auditing.

---

## 🏛️ 2. High-Level Architecture Topology

```
+---------------------------------------------------------------------------------------------------+
|                                      PRESENTATION & CLIENT TIER                                   |
|  +-----------------------------------+     +---------------------------------------------------+  |
|  | Enterprise Web Portal             |     | Supplier Bidding & Portal App                     |  |
|  | (React 18 / Vite / Tailwind UI)   |     | (React 18 / Vite / Mobile Web)                    |  |
|  +-----------------+-----------------+     +-------------------------+-------------------------+  |
+--------------------|-------------------------------------------------|----------------------------+
                     |                                                 |
                     +------------------------+------------------------+
                                              | HTTPS / WebSockets / TLS 1.3
                                              v
+---------------------------------------------------------------------------------------------------+
|                                          GATEWAY TIER                                             |
|  +---------------------------------------------------------------------------------------------+  |
|  | API Gateway Service (`apps/api-gateway`)                                                  |  |
|  | - Tenant Context Extraction (`X-Tenant-ID`)                                                |  |
|  | - OAuth 2.0 / JWT Authentication Guard & RBAC Authorization                              |  |
|  | - Rate Limiting, Request Validation (Zod DTOs) & CORS Middleware                           |  |
|  +----------------------------------------------+----------------------------------------------+  |
+-------------------------------------------------|-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                   APPLICATION & DOMAIN TIER                                       |
|  +----------------------------------+  +----------------------------------+  +-----------------+  |
|  | Procurement & RFQ Use Cases      |  | AI Scoring & Bid Evaluation      |  | Telemetry Engine|  |
|  | (`packages/application`)         |  | (`packages/application`)         |  | (`application`) |  |
|  +----------------+-----------------+  +----------------+-----------------+  +--------+--------+  |
|                   |                                     |                           |             |
|                   +------------------+------------------+                           |             |
|                                      v                                              v             |
|  +---------------------------------------------------------------------------------------------+  |
|  | Pure Domain Model (`packages/core-domain`)                                                  |  |
|  | - `RFQAggregate`, `SupplierBid`, `EquipmentAssetAggregate`, `AuditTrailAggregate`          |  |
|  | - Zero External Dependencies | Domain Events | Invariant Guards                             |  |
|  +---------------------------------------------------------------------------------------------+  |
+-------------------------------------------------|-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      INFRASTRUCTURE TIER                                          |
|  +----------------------------------+  +----------------------------------+  +-----------------+  |
|  | PostgreSQL 16 DB Repository      |  | Transactional Outbox Engine      |  | Server-Side AI  |  |
|  | - Row-Level Security (RLS)         |  | - `outbox_events` Table          |  | - `@google/     |  |
|  | - Relational & JSONB Schemas      |  | - Outbox Relayer Daemon          |  |   genai` SDK    |  |
|  +----------------+-----------------+  +----------------+-----------------+  +--------+--------+  |
+-------------------|-------------------------------------|---------------------------|-------------+
                    |                                     |                           |
                    v                                     v                           v
+---------------------------------------------------------------------------------------------------+
|                                    BACKING SERVICES & CLOUD                                       |
|  [ PostgreSQL 16 ]                 [ Apache Kafka 7.5 ]                   [ Google Gemini API ] |
|  - Primary Persistence             - Event Streaming Backbone             - Flash 2.5 / Pro 2.5 |
|  - RLS Tenant Boundary             - Debezium / KRaft                     - Multi-Criteria Eval |
+---------------------------------------------------------------------------------------------------+
```

---

## 📐 3. C4 Architecture Model Specification

### 3.1 Context Diagram (Level 1)
- **Users**: Enterprise Procurement Managers, Plant Maintenance Engineers, Certified Suppliers, Compliance Officers.
- **System**: InduCore Platform (Single unified industrial execution system).
- **External Systems**: Enterprise ERPs (SAP S/4HANA, Oracle SCM), Plant Floor IoT Sensors (MQTT/Modbus), Google Gemini API (`@google/genai`).

### 3.2 Container Diagram (Level 2)
1. **Web Portal Container**: React 18 SPA built with Vite and Tailwind CSS (`apps/web-portal`). Communicates with API Gateway via HTTPS.
2. **API Gateway Container**: Express Node.js application (`apps/api-gateway`). Extracts tenant context, executes route controllers, invokes Use Cases.
3. **Background Worker Container**: Node.js daemon (`apps/background-worker`) running transactional outbox event relay loops to Kafka.
4. **PostgreSQL Database Container**: PostgreSQL 16 instance storing business domain aggregates, tenant accounts, and outbox event records with Row-Level Security (RLS).
5. **Kafka Message Broker Container**: Apache Kafka cluster providing event delivery guarantees across microservices and external event consumers.

### 3.3 Component Diagram (Level 3 - Monorepo Packages)
- `@inducore/core-domain`: Pure Entities, Aggregates, Value Objects, and Domain Events.
- `@inducore/application`: Command/Query Handlers, Use Cases, Port Interfaces, Zod DTOs.
- `@inducore/infrastructure`: Postgres RLS Adapters, Kafka Publishers, Gemini AI Client wrapper.
- `@inducore/ui-kit`: Reusable Tailwind CSS React component library.
- `@inducore/logger`: Structured JSON telemetry logging package.

---

## 🔒 4. Key Architectural Guarantees

1. **Isolation of Business Logic**: Core domain code has **zero external npm dependencies** and zero awareness of HTTP or DB frameworks.
2. **Strict Multi-Tenancy**: Every DB operation sets `app.current_tenant_id` session context, preventing cross-tenant data leaks.
3. **At-Least-Once Event Delivery**: Multi-aggregate state updates use the Transactional Outbox Pattern to eliminate distributed transaction failures.
4. **Secure AI Operations**: Gemini AI calls execute strictly on the server side using `@google/genai` with isolated API keys.
