# Application Package (`@inducore/application`)

This package contains Use Cases, Command/Query Handlers, Port interfaces (Repositories, Outbox Publishers, AI Services), and DTO runtime validations for InduCore.

## 🏛️ Application Layer Rules

1. **Depends ONLY on `@inducore/core-domain`**: Zero awareness of express routes, PostgreSQL drivers, or UI components.
2. **Input DTO Validation**: Runtime type checks enforced via `zod`.
3. **Repository Ports**: Defines abstract contracts implemented in `packages/infrastructure`.
