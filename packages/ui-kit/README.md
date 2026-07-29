# Package: UI Kit (`packages/ui-kit`)

## Overview
The `@inducore/ui-kit` package provides reusable design system components, layout primitives, and atomic UI elements for InduCore web and mobile frontends.

## Dependency Rules
- Zero business logic or API gateway dependencies.
- Can be imported by frontend applications (`web-portal`, `mobile-app`).

## Folder Structure
```
packages/ui-kit/
├── src/
│   ├── Button.tsx     # Atomic Button component example
│   ├── Card.tsx       # Card layout container example
│   ├── Badge.tsx      # Status badge component example
│   └── index.ts       # Public exports
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```
