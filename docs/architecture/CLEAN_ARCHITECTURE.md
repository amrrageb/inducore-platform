# Clean Architecture Principles & Monorepo Layering

InduCore implements Clean Architecture (also known as Onion Architecture or Ports & Adapters Architecture) to isolate core business domain logic from external technical concerns such as web frameworks, database ORMs, messaging systems, and UI components.

---

## 🧅 Architectural Layers & Direction of Dependency

```
                     +---------------------------------------+
                     |         Presentation / UI             |
                     |  (React, Express Routes, Middleware)  |
                     +-------------------+-------------------+
                                         |
                                         v
                     +-------------------+-------------------+
                     |          Infrastructure               |
                     |  (PostgreSQL, Redis, Kafka Adapters)  |
                     +-------------------+-------------------+
                                         |
                                         v
                     +-------------------+-------------------+
                     |          Application                  |
                     |   (Use Cases, Command/Query Handlers) |
                     +-------------------+-------------------+
                                         |
                                         v
                     +-------------------+-------------------+
                     |          Core Domain                  |
                     |  (Entities, Aggregates, Value Objects)|
                     +---------------------------------------+
```

### Layer Dependency Rules

Dependencies ALWAYS point inward toward the Core Domain. Outer layers depend on inner layers; inner layers MUST NEVER depend on outer layers.

```
Outer Layers  ───────>  Inner Layers
Presentation  ───>  Infrastructure  ───>  Application  ───>  Core Domain
```

---

## 🏛️ Layer Breakdown & Responsibilities

### 1. Core Domain Layer (`packages/core-domain/`)

- **Responsibility**: Houses pure domain logic, entities, aggregate roots, value objects, domain invariants, and domain events.
- **Dependency Rule**: **Zero external npm dependencies** (except pure math/type utilities). Absolutely no database drivers, HTTP frameworks, or logging frameworks.
- **Key Constructs**:
  - `RFQAggregate`: Main domain aggregate for procurement RFQ lifecycle management.
  - `RFQLineItem`: Entity representing individual item specifications within an RFQ.
  - `SupplierBid`: Entity representing vendor proposals.
  - `Money`: Immutable Value Object enforcing currency codes and precision arithmetic.
  - `TenantId`: Value Object encapsulating tenant tenant context isolation.
  - `DomainEvent`: Abstract base class for all aggregate state change events.

### 2. Application Layer (`packages/application/`)

- **Responsibility**: Orchestrates domain objects to execute specific business use cases, handles commands/queries, defines DTO Zod validation schemas, and declares abstract Port interfaces.
- **Dependency Rule**: Depends ONLY on `packages/core-domain/`. Never imports from `packages/infrastructure/` or `apps/`.
- **Key Constructs**:
  - **Use Cases**: `CreateRFQUseCase`, `SubmitBidUseCase`, `EvaluateBidsWithAIUseCase`.
  - **Port Interfaces**: `IRFQRepository`, `IEventOutboxPublisher`, `IGeminiAIService`, `ITenantContext`.
  - **DTO Schemas**: Zod validation contracts (`CreateRFQDTOSchema`, `SubmitBidDTOSchema`).

### 3. Infrastructure Layer (`packages/infrastructure/`)

- **Responsibility**: Provides concrete technical implementations for Application Port interfaces (Adapters).
- **Dependency Rule**: Implements ports defined in `packages/application/` and utilizes domain concepts from `packages/core-domain/`.
- **Key Constructs**:
  - `PostgresRFQRepository`: Database adapter implementing `IRFQRepository` using Row-Level Security (RLS) queries.
  - `KafkaOutboxPublisher`: Messaging adapter implementing `IEventOutboxPublisher`.
  - `GeminiAIService`: Server-side AI adapter wrapping `@google/genai` for bid evaluation.

### 4. Presentation & Gateway Layer (`apps/api-gateway/`, `apps/web-portal/`)

- **Responsibility**: Entry points for HTTP requests, user interactions, and background worker loops.
- **Dependency Rule**: Invokes Application Use Cases via dependency injection.
- **Key Constructs**:
  - `express`: REST API route controllers and Tenant Context extraction middleware.
  - `web-portal`: React SPA components, Tailwind UI Kit views, and state management hooks.
  - `background-worker`: Daemon polling the outbox event queue and publishing to Kafka.

---

## 🔄 Data Mapping & Boundary Control

To prevent database schema entities or web request payloads from polluting domain models, strict boundary mapping is enforced at every layer boundary:

```
[ HTTP Request Payload ] 
          │
          ▼
   (Zod Validation) ───> [ Application DTO ]
                               │
                               ▼
                    (Mapper / Factory) ───> [ Core Domain Aggregate ]
                                                    │
                                                    ▼
                                         (Repository Adapter) ───> [ Database Row (PostgreSQL) ]
```

1. **Input Validation**: HTTP JSON payloads are validated against Zod DTO schemas at the API Gateway controller boundary.
2. **Domain Hydration**: Application Use Cases convert DTOs into pure Domain Aggregate instances using aggregate factory methods (e.g., `RFQAggregate.create()`).
3. **Persistence Mapping**: Infrastructure Repositories map domain aggregate instances to database tables (and vice-versa) using dedicated Data Mappers (`RFQDataMapper.toPersistence()`, `RFQDataMapper.toDomain()`).
4. **Output Projection**: Application queries project domain aggregates into lightweight Read DTOs before returning responses to presentation callers.

---

## 🔒 Strict Isolation Checklist

| Check Item | Enforced Rule |
| :--- | :--- |
| **Domain Imports** | `packages/core-domain` MUST NOT import any library with native bindings or external I/O capabilities. |
| **ORMs in Application** | `packages/application` MUST NOT contain SQL queries, Prisma/Drizzle drivers, or Redis client imports. |
| **HTTP in Core** | `packages/core-domain` MUST NOT reference `express`, `fetch`, `axios`, or request/response objects. |
| **No Direct DB Access** | Presentation controllers MUST NOT query the database directly; all interactions must pass through Use Case handlers. |

