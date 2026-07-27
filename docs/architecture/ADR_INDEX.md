# Architectural Decision Records (ADRs) Index

This index logs major architectural decisions governing the **InduCore** platform, including context, options considered, decisions made, and consequences.

---

## 📜 Architectural Decision Records

| ADR # | Title | Status | Date | Decision Summary |
| :---: | :--- | :---: | :---: | :--- |
| **ADR-001** | **Adopt Monorepo Structure with pnpm & Turborepo** | **ACCEPTED** | 2026-07-27 | Use pnpm workspaces and Turborepo for incremental builds, shared dependencies, and strict package isolation across domain, application, infrastructure, and presentation layers. |
| **ADR-002** | **Enforce Strict Clean Architecture Layer Boundaries** | **ACCEPTED** | 2026-07-27 | Enforce zero dependencies on `packages/core-domain/`. All business logic resides in pure domain entities; infrastructure ORMs and HTTP controllers depend on domain ports. |
| **ADR-003** | **Implement Transactional Outbox Pattern for Event Publishing** | **ACCEPTED** | 2026-07-27 | Persist domain events into PostgreSQL `outbox_events` table in the same ACID transaction as entity mutations to guarantee zero message loss during broker outages. |
| **ADR-004** | **Restricted Server-Side Google Gemini AI SDK Integration** | **ACCEPTED** | 2026-07-27 | All Gemini API calls (`@google/genai`) must occur server-side inside `packages/infrastructure/` or Express controllers. Client-side exposure of `GEMINI_API_KEY` is prohibited. |
| **ADR-005** | **Multi-Tenant Row-Level Security (RLS) Isolation** | **ACCEPTED** | 2026-07-27 | Isolate tenant data at the PostgreSQL row level via session context variable (`app.current_tenant_id`) injected by Express tenant context middleware. |

---

## 📑 ADR Template Standard

New architectural proposals MUST use the following structure:

```markdown
# ADR-XXX: [Short Title]

## Context & Problem Statement
Describe the technical or business driver requiring an architectural decision.

## Decision Drivers
- Driver 1
- Driver 2

## Considered Options
1. Option A
2. Option B

## Decision Outcome
Chosen Option: [Option X] because [rationale].

## Consequences
- Positive: [benefits]
- Negative/Risks: [trade-offs and mitigation]
```
