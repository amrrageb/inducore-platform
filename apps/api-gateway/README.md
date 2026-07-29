# Application: API Gateway (`apps/api-gateway`)

## Overview
The `api-gateway` application serves as the primary entrypoint for HTTP requests, executing authentication, tenant extraction middleware, and routing requests to internal packages.

## Dependency Rules
- Imports `@inducore/application`, `@inducore/core-domain`, `@inducore/infrastructure`, `@inducore/logger`, `@inducore/config`, `@inducore/contracts`, and `@inducore/shared`.

## Folder Structure
```
apps/api-gateway/
├── src/
│   ├── middleware/    # Tenant context & auth middleware
│   ├── routes/        # Gateway HTTP route handlers
│   └── index.ts       # Express server initialization
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
