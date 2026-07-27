# InduCore Platform Changelog

All notable changes to the **InduCore** monorepo platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-07-27

### Added
- **Repository Foundation (Package 01)**: Established Turborepo monorepo workspace configuration (`pnpm-workspace.yaml`, `turbo.json`).
- **Clean Architecture Specifications**: Defined strict layer isolation rules across Core Domain, Application Use Cases, Infrastructure Adapters, and Presentation Apps.
- **DDD Bounded Context Specifications**: Formulated procurement, IoT telemetry, inventory stock, and audit ledger context boundaries.
- **Transactional Outbox Event Model**: Added outbox table schema and asynchronous Kafka event relayer specification.
- **GitHub Automation Workflows**: Added CI pipelines (`ci.yml`, `lint-and-typecheck.yml`), issue templates, PR templates, and CODEOWNERS definitions.
- **AI Operating Guidelines**: Added `.ai/CONTEXT.md`, `.ai/GUIDELINES.md`, and `.ai/PROMPTS.md` context files.

---

## [1.0.0] - 2026-01-15

### Added
- Initial project prototype and initial proof-of-concept specifications.
