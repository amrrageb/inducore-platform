# InduCore Runnable Applications Directory (`/apps`)

This directory contains executable entry points, API gateways, web portals, and background worker services within the **InduCore** monorepo.

---

## 🚀 Applications Matrix

| Application | Workspace Name | Type | Description |
| :--- | :--- | :--- | :--- |
| [`api-gateway/`](./api-gateway/README.md) | `@inducore/api-gateway` | Express HTTP / REST | Enterprise REST API Gateway enforcing tenant context extraction and request routing. |
| [`background-worker/`](./background-worker/README.md) | `@inducore/background-worker` | Node.js Daemon | Transactional Outbox poller and asynchronous event relay process. |
| [`web-portal/`](./web-portal/README.md) | `@inducore/web-portal` | React 18 / Vite SPA | Main enterprise procurement, IoT telemetry, and compliance audit trail dashboard. |

---

## 🛠️ Execution & Development Rules

1. **Port Standard**: All local dev servers run via the central `pnpm dev` entry point on port `3000`.
2. **Context Injection**: HTTP applications must pass `X-Tenant-ID` headers to extract tenant context.
3. **Build Target**: Server applications compile via `esbuild` to CommonJS (`dist/server.cjs`) for Cloud Run compatibility.
