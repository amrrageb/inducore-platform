# Package: Core Domain (`packages/core-domain`)

## Overview
The `@inducore/core-domain` package contains pure Domain Entities, Aggregates, Value Objects, and Domain Events according to Domain-Driven Design (DDD) principles.

## Dependency Rules
- ZERO external npm dependencies (except pure math/date utilities).
- No database ORMs, HTTP frameworks, or UI state.

## Folder Structure
```
packages/core-domain/
├── src/
│   ├── common/        # Core DDD base building blocks (AggregateRoot, Entity, ValueObject)
│   ├── example/       # Pure example domain aggregate
│   └── index.ts       # Public exports
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
