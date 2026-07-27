# Package 08: Engineering Specification (`/docs/packages/08_ENGINEERING.md`)

## 1. Overview
Defines code quality, linting standards, static analysis, unit/integration testing patterns, and CI pipeline rules.

## 2. Monorepo Quality Tools
- **Linter**: ESLint & Turborepo (`turbo run lint`).
- **Compiler Check**: TypeScript strict compilation (`pnpm typecheck`).
- **Build Verification**: `compile_applet` / `npm run build`.

## 3. Mandatory Engineering Rules ("Anti-Slop")
- Zero usage of `any` or loose type assertions.
- Modules must not exceed 300 lines of code; decompose into single-responsibility helpers.
- Every directory must contain a `README.md` explaining exports and architectural layer.
- No dummy hardcoded credentials in source files.
