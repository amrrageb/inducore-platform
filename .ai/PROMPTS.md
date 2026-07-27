# AI Prompt Templates (`.ai/PROMPTS.md`)

Standard prompt templates for AI agents working on InduCore code generation and refactoring.

---

## 📑 1. New Core Domain Aggregate Generator Prompt

```
Act as a Domain-Driven Design (DDD) expert. Create a new Aggregate Root in `packages/core-domain/src/aggregates/`.
Enforce the following:
- Zero external npm dependencies.
- Private constructor with static factory `create()` and `reconstitute()` methods.
- Immutable Value Objects for IDs, Currency, and Status fields.
- Private list of uncommitted `DomainEvent` instances with `getUncommittedEvents()` and `clearEvents()`.
- Explicit domain invariant validation throwing custom `DomainException` errors.
```

---

## 📑 2. Use Case Handler Prompt

```
Act as a Clean Architecture developer. Create a Use Case class in `packages/application/src/use-cases/`.
Enforce the following:
- Injected Port interfaces (e.g. `IRFQRepository`, `IEventPublisher`) in the constructor.
- Inbound payload validated with Zod DTO schema.
- Transactional boundary coordination.
- Zero raw SQL or ORM imports.
```

---

## 📑 3. Infrastructure Adapter Prompt

```
Act as a Senior Infrastructure Engineer. Create a PostgreSQL repository adapter in `packages/infrastructure/src/repositories/`.
Enforce the following:
- Implements the Port interface declared in `packages/application`.
- Sets session context `app.current_tenant_id` before executing SQL queries to satisfy Row-Level Security (RLS).
- Uses Data Mappers to translate between persistence rows and Domain Aggregate instances.
```
