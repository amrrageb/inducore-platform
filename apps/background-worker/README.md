# Application: Background Worker (`apps/background-worker`)

## Overview
The `background-worker` application processes asynchronous outbox messages, scheduled background tasks, and event dispatching.

## Dependency Rules
- Imports `@inducore/application`, `@inducore/infrastructure`, `@inducore/logger`, and `@inducore/shared`.

## Folder Structure
```
apps/background-worker/
├── src/
│   ├── consumers/     # Event consumers & outbox relay handlers
│   └── index.ts       # Worker process entrypoint
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
