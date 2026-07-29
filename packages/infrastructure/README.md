# Package: Infrastructure Layer (`packages/infrastructure`)

## Overview
The `@inducore/infrastructure` package implements database adapters, ORM mappings, external API integration clients, and messaging handlers.

## Dependency Rules
- Implements port interfaces defined in `@inducore/application`.
- Depends on `@inducore/core-domain`, `@inducore/application`, and `@inducore/shared`.

## Folder Structure
```
packages/infrastructure/
├── src/
│   ├── persistence/   # Database repositories and adapters
│   ├── messaging/     # Outbox & event publishers
│   └── index.ts       # Public exports
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
