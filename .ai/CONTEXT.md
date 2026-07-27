# InduCore AI Context Overview (`.ai/CONTEXT.md`)

This document provides system context for AI Coding Agents operating within the **InduCore** monorepo workspace.

---

## 🏛️ Monorepo Core Architecture

InduCore is an enterprise-grade industrial procurement, IoT telemetry, and compliance monorepo adhering strictly to **Clean Architecture** and **Domain-Driven Design (DDD)**.

### Workspace Structure Overview

```
inducore-monorepo/
├── apps/                       # Executable applications
│   ├── api-gateway/            # Express REST API Gateway (Port 3000)
│   ├── background-worker/      # Transactional Outbox Relayer Daemon
│   └── web-portal/             # Enterprise React 18 / Vite Web SPA
├── packages/                   # Core business domain & shared libraries
│   ├── core-domain/            # Pure Entities, Aggregates & Events (Zero external npm deps)
│   ├── application/           # Use Cases, DTO Schemas, Port Interfaces
│   ├── infrastructure/        # PostgreSQL RLS Repos, Kafka Outbox, Gemini AI SDK
│   ├── ui-kit/                # Reusable Tailwind CSS Component Library
│   └── logger/                 # Structured JSON Telemetry Logger
├── docs/                       # Specifications & 16 Package Blueprints
├── scripts/                    # Development & verification automation scripts
├── assets/                     # Architecture diagrams and design assets
└── blueprint/                  # Blueprint generation logs & indices
```

---

## 🔑 Crucial Architectural Directives

1. **Domain Layer Independence**: Code in `packages/core-domain` MUST NEVER import from `packages/application`, `packages/infrastructure`, or `apps/`.
2. **Server-Side Gemini SDK**: All `@google/genai` interactions must occur in backend services (`packages/infrastructure/`). Client-side exposure of `GEMINI_API_KEY` is strictly prohibited.
3. **Multi-Tenant RLS**: Database queries must enforce `tenant_id` boundaries via PostgreSQL Row-Level Security.
4. **Zero Any Policy**: Strict TypeScript type safety without loose type assertions or `any` casts.
