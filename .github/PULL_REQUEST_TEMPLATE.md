## 📌 Summary of Changes

Briefly explain the intent, scope, and implementation details of this Pull Request.

### Related Issue
Closes #

---

## 🏛️ Architectural Context & Domain Scope

- **Bounded Context**: [e.g., Procurement / Inventory / Analytics / Auth]
- **Architectural Layer**: [Domain / Application / Infrastructure / UI]
- **Pattern Compliance**:
  - [ ] Domain logic isolated in `packages/core-domain` without side-effects
  - [ ] Database updates handle tenant isolation (Row-Level Security)
  - [ ] Events published via Outbox Pattern if applicable
  - [ ] Zod schema runtime validation included for all input DTOs

---

## 🧪 Verification & Testing Completed

- [ ] `pnpm typecheck` passed cleanly across all packages
- [ ] `pnpm lint` passed with zero errors or warnings
- [ ] Unit tests added/updated (`pnpm test`)
- [ ] Integration or Playwright E2E tests verified locally
- [ ] Documentation updated in `docs/` if architecture or APIs changed

---

## 📸 Screenshots / Proof of Execution (If UI / API change)

*Attach relevant screenshots or log outputs here.*
