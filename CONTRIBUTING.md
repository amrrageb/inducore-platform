# Contributing to InduCore

Thank you for your interest in contributing to **InduCore**, the enterprise industrial resource and execution platform.

---

## 🏗️ Development Workflow

1. **Fork & Branching Strategy**:
   - Branch name pattern: `feature/<domain>-<short-description>`, `fix/<issue-number>-<short-description>`, or `chore/<description>`.
   - All changes MUST target the `main` branch via Pull Request.

2. **Commit Message Format**:
   We follow Conventional Commits:
   - `feat(rfq): add automated supplier bid comparison evaluator`
   - `fix(auth): handle JWT token expiration gracefully in background worker`
   - `docs(arch): update DDD context map diagram`
   - `refactor(domain): enforce immutable money value object in pricing calculations`

3. **Pull Request Quality Gates**:
   To be merged, a Pull Request MUST:
   - Pass all GitHub Actions CI checks (`ci.yml`, `lint.yml`, `security-scan.yml`).
   - Have approval from at least 1 designated CODEOWNER.
   - Maintain >85% unit test coverage for core domain entities.
   - Include updated documentation if business rules or APIs are modified.

---

## 🧪 Testing Standards

- **Unit Tests**: Co-located with domain entities (`*.spec.ts`). Focus on pure business logic.
- **Integration Tests**: Located in `tests/integration/`. Verifies repositories with PostgreSQL test containers.
- **E2E Tests**: Located in `apps/web-portal/e2e/`. Uses Playwright for browser workflow validation.
