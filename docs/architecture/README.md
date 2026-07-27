# Technical Architecture Specifications Directory (`/docs/architecture`)

This directory contains the comprehensive technical architectural standards, system topology diagrams, design patterns, bounded context maps, multi-tenancy models, and decision logs for the **InduCore** monorepo platform.

---

## 📜 Technical Architecture Documentation Suite

| Document | Architectural Domain | Key System Concepts Covered |
| :--- | :--- | :--- |
| **[SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)** | System Architecture | Topology diagram, C4 architecture models (Levels 1–3), tier breakdown. |
| **[CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md)** | Clean Architecture | Layer dependency direction, Onion architecture, Ports & Adapters rules. |
| **[DDD_BOUNDED_CONTEXTS.md](./DDD_BOUNDED_CONTEXTS.md)** | Domain-Driven Design | Subdomains, aggregate boundaries, value objects, domain invariants. |
| **[MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md)** | Module Architecture | Monorepo pnpm/Turborepo package matrix, import boundary constraints. |
| **[MULTI_TENANCY.md](./MULTI_TENANCY.md)** | Multi-Tenancy | PostgreSQL Row-Level Security (RLS) policies, middleware context extraction. |
| **[EVENT_DRIVEN_SPEC.md](./EVENT_DRIVEN_SPEC.md)** | Event-Driven Architecture | Transactional Outbox pattern, `outbox_events` schema, Kafka messaging. |
| **[DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md)** | Data Architecture | PostgreSQL ERD schema, UUID keys, NUMERIC precision, Redis caching, CQRS. |
| **[SEARCH_ARCHITECTURE.md](./SEARCH_ARCHITECTURE.md)** | Search Architecture | Full-text search (`tsvector`), GIN indexing, `pg_trgm` fuzzy matching. |
| **[AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md)** | AI Architecture | Server-side Gemini SDK (`@google/genai`), JSON response schema, multi-criteria scoring. |
| **[TWELVE_FACTOR_AUDIT.md](./TWELVE_FACTOR_AUDIT.md)** | Engineering Compliance | 12-Factor app audit, cloud native readiness checklist. |
| **[ADR_INDEX.md](./ADR_INDEX.md)** | Decision Records | Architectural Decision Records (ADRs 001–006). |

---

## 🔗 Consistency with Business Specifications (Package 02)
The technical architecture strictly implements the business requirements defined in Package 02 (`/docs/business/`):
- Subdomain contexts map directly to `packages/core-domain` aggregate boundaries.
- Dual approval business rules ($50k+) are enforced by Application Use Cases in `packages/application`.
- Multi-tenant isolation is enforced at the database layer via PostgreSQL RLS.
