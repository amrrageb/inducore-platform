# API Gateway & Interface Specifications Directory (`/docs/api`)

InduCore exposes a unified API surface supporting RESTful OpenAPI endpoints and a federated GraphQL Subgraph for complex data querying.

---

## 📜 API Documentation Suite

| Document | Domain | Key Topics Covered |
| :--- | :--- | :--- |
| **[REST_SPECIFICATION.md](./REST_SPECIFICATION.md)** | RESTful API Architecture | Base URLs, headers, procurement endpoints (`/rfqs`, `/bids`), AI evaluation endpoint (`/evaluate`). |
| **[GRAPHQL_SPECIFICATION.md](./GRAPHQL_SPECIFICATION.md)** | GraphQL Federation Subgraph | Apollo Federation v2 schema DDL, types, connections, queries, mutations, context resolution. |
| **[MIDDLEWARE_PIPELINE.md](./MIDDLEWARE_PIPELINE.md)** | Middleware Architecture | Sequential middleware chain, tenant context extraction (`tenantContextMiddleware`), rate limiting. |
| **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** | Unified Error Handling | Standard JSON error envelope, error codes enum, HTTP status code mappings. |
