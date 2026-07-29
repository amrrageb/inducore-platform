# Package: Config (`packages/config`)

## Overview
The `@inducore/config` package provides centralized environment configuration, runtime variable validation, and system default constants for InduCore apps and services.

## Dependency Rules
- Zero business logic dependencies.
- Can be imported by apps and packages to resolve system configurations.

## Folder Structure
```
packages/config/
├── src/
│   ├── AppConfig.ts   # Centralized system config singleton
│   └── index.ts       # Public exports
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
