# Package: Contracts (`packages/contracts`)

## Overview
The `@inducore/contracts` package defines system-wide API envelope schemas, integration DTOs, and event payload interfaces used for inter-service communication.

## Dependency Rules
- Zero dependency on database drivers or UI components.
- Shared interface declarations for apps and microservices.

## Folder Structure
```
packages/contracts/
├── src/
│   ├── api/           # API response/request envelopes
│   ├── events/        # System event payload schemas
│   └── index.ts       # Public exports
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
