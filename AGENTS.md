# AGENTS.md — AI Agent Operating Instructions & Repository Guidelines

This document serves as the primary system directive for all AI agents (Gemini, Claude, Antigravity Agent, Cursor, Copilot) operating within the **InduCore** monorepo.

---

## 1. Core Architectural Directives

Every AI coding agent acting on this codebase **MUST** adhere strictly to the following architectural patterns:

1. **Domain-Driven Design (DDD)**:
   - All business logic MUST reside in pure Domain Entities, Aggregates, and Value Objects inside `packages/core-domain/`.
   - Never bleed database drivers, HTTP frameworks, or UI state into domain models.
   - Use strictly typed Domain Events for state changes across aggregate boundaries.

2. **Clean Architecture Isolation**:
   - **Domain Layer**: Zero external npm dependencies (except pure math/date utilities).
   - **Application Layer**: Contains Use Cases, DTOs, Command/Query handlers (`packages/application/`).
   - **Infrastructure Layer**: Contains DB adapters, ORMs, HTTP clients, Kafka publishers (`packages/infrastructure/`).
   - **Presentation/API Layer**: HTTP handlers, Express/Vite routes, React UI components.

3. **Strict Type Safety & Zero Any Policy**:
   - `any` or loose type assertions (`as unknown as X`) are strictly forbidden.
   - All external API inputs and environment variables MUST be validated at runtime using `zod` schemas.

4. **Event-Driven & Outbox Pattern**:
   - Multi-aggregate updates MUST publish domain events via the Transactional Outbox Pattern to guarantee at-least-once message delivery.

---

## 2. File Organization & Naming Conventions

- **PascalCase** for React components, Domain Entities, and TypeScript Interfaces (`SupplierAggregate.ts`, `RFQDetail.tsx`).
- **camelCase** for utility functions, hooks, and instance variables (`calculateBidScore.ts`, `useTenantContext.ts`).
- **kebab-case** for directories and configuration files (`api-gateway`, `docker-compose.yml`).
- Every folder MUST contain a `README.md` documenting its responsibility, exported interface, and architectural layer.

---

## 3. Verification & Safety Workflow

Before marking any task as complete, an AI agent MUST verify:

1. `pnpm typecheck` — TypeScript compilation succeeds across all monorepo packages.
2. `pnpm lint` — ESLint and Prettier pass without warnings or errors.
3. `pnpm test` — Unit and integration tests pass cleanly.
4. `metadata.json` — Accurately reflects application capability metadata.

---

## 4. Prohibited Patterns ("Anti-Slop")

- ❌ DO NOT generate dummy placeholder text, "TODO: implement later", or mock stubs in production files.
- ❌ DO NOT place API keys, hardcoded secrets, or local database credentials in source code.
- ❌ DO NOT mix UI rendering logic directly with database query statements.
- ❌ DO NOT create giant monolithic files over 300 lines; break modules down cleanly into SRP components.
