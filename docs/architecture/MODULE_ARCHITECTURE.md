# Module Architecture & Monorepo Dependency Specifications

## 1. Executive Summary & Monorepo Structure

InduCore uses a **pnpm + Turborepo monorepo** module architecture. Modules are split cleanly into two top-level directories:
- `apps/`: Executable runtime entry points (API Gateways, Web Portals, Background Workers).
- `packages/`: Reusable, strictly typed libraries and core business domain layers.

---

## 📦 2. Module Matrix & Workspace Dependencies

```
                                  +---------------------------------------+
                                  |            apps/web-portal            |
                                  |  (Enterprise React 18 / Vite SPA)     |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |           packages/ui-kit             |
                                  |   (Tailwind CSS React Components)     |
                                  +---------------------------------------+


+---------------------------------------------------------------------------------------------------+
|                                        apps/api-gateway                                           |
|                                (Express REST API Gateway - Port 3000)                             |
+--------------------------------------------------+------------------------------------------------+
                                                   |
                                                   v
+--------------------------------------------------+------------------------------------------------+
|                                      packages/application                                         |
|                           (Use Cases, Port Interfaces, Zod DTOs)                                  |
+------------------------+-------------------------------------------------+------------------------+
                         |                                                 |
                         v                                                 v
+------------------------+------------------------+      +-----------------+------------------------+
|                 packages/core-domain            |      |             packages/infrastructure      |
|     (Pure Entities, Aggregates, Value Objects)  | <--- |   (Postgres RLS, Kafka Outbox, Gemini AI)  |
+-------------------------------------------------+      +------------------------------------------+
```

---

## 🏛️ 3. Detailed Package Catalog

### 3.1 Domain & Application Packages

| Package Name | Workspace Identifier | Primary Responsibility | Allowed Dependencies |
| :--- | :--- | :--- | :--- |
| **Core Domain** | `@inducore/core-domain` | Pure domain entities, aggregate roots, value objects, domain events, result types. | **ZERO external npm dependencies** (except pure math/date utilities). |
| **Application** | `@inducore/application` | Command & Query Use Cases, Zod DTO validation schemas, Port interfaces (`IRFQRepository`). | `@inducore/core-domain`, `zod`. |
| **Infrastructure** | `@inducore/infrastructure` | PostgreSQL RLS database adapters, Kafka outbox publishers, server-side Gemini AI client. | `@inducore/core-domain`, `@inducore/application`, `@google/genai`, `pg`, `kafkajs`. |
| **UI Kit** | `@inducore/ui-kit` | Reusable React components (`Button`, `Badge`, `Card`, `Modal`) styled with Tailwind CSS. | `react`, `lucide-react`, `clsx`, `tailwind-merge`. |
| **Logger** | `@inducore/logger` | Structured JSON telemetry logger for audit and observability. | `pino` or native structured JSON wrapper. |

### 3.2 Executable Applications

| Application Name | Workspace Identifier | Primary Responsibility | Port / Entry |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `@inducore/api-gateway` | Express HTTP server, Tenant middleware, REST route controllers, Zod request handlers. | Port `3000` (`src/index.ts`) |
| **Background Worker** | `@inducore/background-worker` | Transactional outbox polling daemon publishing domain events to Kafka. | Daemon process (`src/index.ts`) |
| **Web Portal** | `@inducore/web-portal` | Single Page Application (SPA) providing executive dashboards, RFQ management, and IoT alerts. | Vite dev/build (`src/main.tsx`) |

---

## 🔒 4. Monorepo Boundary Enforcement Rules

To prevent illegal circular imports or architectural boundary bleed, the following rules are strictly enforced via ESLint and build verification scripts:

1. **Rule 1 (Zero Outward Imports from Core)**: Code in `packages/core-domain` MUST NEVER import from `@inducore/application`, `@inducore/infrastructure`, or any `apps/*`.
2. **Rule 2 (Port Inversion)**: `packages/application` defines interfaces (Ports). `packages/infrastructure` implements them (Adapters). `packages/application` MUST NEVER import concrete adapters from `@inducore/infrastructure`.
3. **Rule 3 (No Direct DB Access in Gateways)**: HTTP route controllers in `apps/api-gateway` MUST NOT execute SQL queries directly; they MUST invoke Application Use Cases.
4. **Rule 4 (TypeScript Path Resolution)**: Packages reference each other via pnpm workspace symlinks (e.g., `"@inducore/core-domain": "workspace:*"` in `package.json`).
