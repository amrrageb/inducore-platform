# Package: Logger (`packages/logger`)

## Overview
The `@inducore/logger` package provides structured JSON logging, log-level formatting, and context injection (tenantId, correlationId) across all backend services.

## Dependency Rules
- Shared utility package usable by all apps and backend packages.

## Folder Structure
```
packages/logger/
├── src/
│   ├── Logger.ts      # Structured JSON Logger class example
│   └── index.ts       # Public exports
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
