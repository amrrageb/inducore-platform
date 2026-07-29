# Application: Web Portal (`apps/web-portal`)

## Overview
The `web-portal` application serves as the desktop web frontend for enterprise administration, operational dashboards, and platform management.

## Dependency Rules
- Consumes `@inducore/ui-kit`, `@inducore/contracts`, and `@inducore/shared`.
- Communicates with `api-gateway` endpoints.

## Folder Structure
```
apps/web-portal/
├── src/
│   ├── App.tsx        # Top-level Web Portal component
│   └── index.ts       # Application entrypoint
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
