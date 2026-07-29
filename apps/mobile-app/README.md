# Application: Mobile App (`apps/mobile-app`)

## Overview
The `mobile-app` application serves as the cross-platform mobile client for plant operators, supplier representatives, and mobile field staff.

## Dependency Rules
- Consumes `@inducore/ui-kit`, `@inducore/contracts`, and `@inducore/shared`.
- Communicates with `api-gateway` endpoints.

## Folder Structure
```
apps/mobile-app/
├── src/
│   ├── MobileApp.tsx  # Top-level Mobile App component
│   └── index.ts       # Application entrypoint
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
