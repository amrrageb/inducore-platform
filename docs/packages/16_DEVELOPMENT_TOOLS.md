# Package 16: Development Tools Specification (`/docs/packages/16_DEVELOPMENT_TOOLS.md`)

## 1. Overview
Defines development scripts, seeders, environment diagnostics, hot-reloading tooling, and Turborepo task pipelines.

## 2. Dev Scripts & Task Pipelines
- **`pnpm dev`**: Launches unified dev server on port 3000 via `tsx server.ts`.
- **`pnpm build`**: Runs `vite build` and `esbuild server.ts --bundle --platform=node` for production CJS output.
- **`pnpm lint`**: Executes Turborepo lint tasks across all monorepo packages (`turbo run lint`).
- **`pnpm typecheck`**: Runs TypeScript compiler type validation (`tsc --noEmit`).

## 3. Seeders & Local Testing Utilities
- Multi-tenant seed dataset populates sample RFQs, line items, supplier bids, and sensor telemetry.
- RLS context simulator tests header extraction and tenant row isolation.
