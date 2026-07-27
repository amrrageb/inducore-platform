# Package 12: Backend Skeleton Specification (`/docs/packages/12_BACKEND_SKELETON.md`)

## 1. Overview
Defines backend service skeletons: Express API Gateway (`apps/api-gateway`) and Background Worker daemon (`apps/background-worker`).

## 2. API Gateway Service (`apps/api-gateway`)
- **`src/index.ts`**: Express application factory, health endpoints, CORS, JSON parsers.
- **`src/middleware/tenantContextMiddleware.ts`**: Context extraction for `X-Tenant-ID`.
- **`src/routes/rfqRoutes.ts`**: REST controllers mapping HTTP requests to application use cases (`CreateRFQUseCase`, `SubmitBidUseCase`, `EvaluateBidsWithAIUseCase`).

## 3. Background Worker Service (`apps/background-worker`)
- **`src/index.ts`**: Polling loop executing worker tasks.
- **`src/consumers/OutboxRelayConsumer.ts`**: Polling pending outbox events and dispatching to Kafka topics.
