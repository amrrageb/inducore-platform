# Package: Shared (`packages/shared`)

## Overview
The `@inducore/shared` package houses generic utility classes, common types, guard functions, and pure helpers shared across the InduCore monorepo.

## Dependency Rules
- Zero dependency on domain, infrastructure, or UI packages.
- May be imported by any app or package.

## Folder Structure
```
packages/shared/
├── src/
│   ├── types/         # Common TypeScript interfaces and primitive types
│   ├── utils/         # Pure helper classes (GuardUtils, ResultUtils)
│   └── index.ts       # Public exports
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
