# InduCore Packages Directory (`/packages`)

This directory contains the core domain libraries, application use cases, infrastructure adapters, design system, and utility logging packages of the **InduCore** monorepo.

---

## 📦 Package Matrix

| Package | Workspace Name | Layer | Description |
| :--- | :--- | :--- | :--- |
| [`core-domain/`](./core-domain/README.md) | `@inducore/core-domain` | Core Domain | Pure domain entities, value objects, aggregates, and domain events. Zero external npm dependencies. |
| [`application/`](./application/README.md) | `@inducore/application` | Application | Command & query handlers, use-case specifications, Zod DTO schemas, and abstract repository ports. |
| [`infrastructure/`](./infrastructure/README.md) | `@inducore/infrastructure` | Infrastructure | PostgreSQL database repositories (RLS), Kafka event outbox publishers, and server-side Gemini AI integration. |
| [`ui-kit/`](./ui-kit/README.md) | `@inducore/ui-kit` | UI / Presentation | Reusable enterprise React UI components styled with Tailwind CSS. |
| [`logger/`](./logger/README.md) | `@inducore/logger` | Telemetry | Structured JSON logging module with request correlation tracing. |

---

## 🔒 Architectural Isolation Rules

1. **Dependency Hierarchy**: `core-domain` MUST NEVER import from `application`, `infrastructure`, `ui-kit`, or `apps`.
2. **Type Safety**: All packages enforce TypeScript strict mode with zero `any` usage.
3. **Documentation**: Every sub-package maintains a local `README.md` explaining its exported interfaces and responsibilities.
