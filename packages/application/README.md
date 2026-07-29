# Package: Application Layer (`packages/application`)

## Overview
The `@inducore/application` package implements application use cases, DTOs, command/query handlers, and port interfaces according to Clean Architecture guidelines.

## Dependency Rules
- Depends on `@inducore/core-domain` and `@inducore/shared`.
- Zero infrastructure or framework dependencies.

## Folder Structure
```
packages/application/
├── src/
│   ├── dtos/          # Application DTOs
│   ├── ports/         # Primary & secondary ports (repository interfaces)
│   ├── use-cases/     # Clean application use cases
│   └── index.ts       # Public exports
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
