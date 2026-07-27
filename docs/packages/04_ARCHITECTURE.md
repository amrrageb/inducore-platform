# Package 04: Architecture Specification (`/docs/packages/04_ARCHITECTURE.md`)

## 1. Overview
Defines the **Clean Architecture**, **Domain-Driven Design (DDD)**, and **Event-Driven Transactional Outbox Pattern** governing InduCore.

## 2. Layer Isolation Rules
1. **Domain Layer (`packages/core-domain/`)**: Pure domain models, entities, aggregates, value objects, domain events, result types, and guard assertions. Zero external npm dependencies.
2. **Application Layer (`packages/application/`)**: Use case orchestrators, command/query handlers, Zod DTO schemas, and port interfaces (`IRFQRepository`, `IEventOutboxPublisher`, `IGeminiAIService`).
3. **Infrastructure Layer (`packages/infrastructure/`)**: PostgreSQL RLS repositories, Kafka event publishers, Gemini AI SDK wrappers.
4. **Presentation & Gateway Layer (`apps/api-gateway/`, `apps/web-portal/`)**: Express middleware, REST controllers, React dashboard views.

## 3. Transactional Outbox Event Flow
```
[ Aggregate State Update ]
         │
         ├──> [ Insert Entity to DB ]
         └──> [ Insert Domain Event to Outbox Table ] (Same DB Transaction)
                     │
                     ▼
         [ Outbox Relay Worker ] (Poller)
                     │
                     ▼
         [ Publish to Apache Kafka ]
```
