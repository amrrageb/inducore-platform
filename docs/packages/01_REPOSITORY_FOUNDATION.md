# Package 01: Repository Foundation Specification (`/docs/packages/01_REPOSITORY_FOUNDATION.md`)

## 1. Executive Summary & Objective

The **Repository Foundation** package establishes the production-grade engineering baseline for the **InduCore** enterprise monorepo platform. It defines the workspace structure, package manager configurations, build pipelines, environment configurations, quality control gates, and AI agent operational context required for high-velocity software engineering across distributed teams.

---

## 2. Directory Architecture & Monorepo Structure

```
inducore-monorepo/
├── .ai/                        # AI Agent system context & guidelines
│   ├── CONTEXT.md              # High-level architecture summary for AI models
│   ├── GUIDELINES.md           # Operational rules & prohibited coding anti-patterns
│   └── PROMPTS.md              # Curated prompts for DDD generators & use cases
├── .github/                    # GitHub automation & community templates
│   ├── ISSUE_TEMPLATE/         # Bug reports, feature requests & architecture proposals
│   ├── workflows/              # CI workflows (ci.yml, lint-and-typecheck.yml)
│   ├── CODEOWNERS              # Code ownership boundaries
│   └── PULL_REQUEST_TEMPLATE.md# Structured PR submission template
├── apps/                       # Executable applications
│   ├── api-gateway/            # Express REST API Gateway (`@inducore/api-gateway`)
│   ├── background-worker/      # Outbox relayer daemon (`@inducore/background-worker`)
│   ├── web-portal/             # React 18 / Vite SPA (`@inducore/web-portal`)
│   └── README.md               # Executable apps matrix documentation
├── packages/                   # Core business domain & shared libraries
│   ├── core-domain/            # Domain entities & invariants (`@inducore/core-domain`)
│   ├── application/           # Use cases & DTO schemas (`@inducore/application`)
│   ├── infrastructure/        # PostgreSQL RLS & Gemini SDK (`@inducore/infrastructure`)
│   ├── ui-kit/                # Tailwind CSS React UI kit (`@inducore/ui-kit`)
│   ├── logger/                 # Telemetry logger (`@inducore/logger`)
│   └── README.md               # Monorepo packages layer matrix
├── docs/                       # Comprehensive documentation suite
│   ├── api/                    # REST / OpenAPI endpoint specifications
│   ├── architecture/           # Clean Architecture, DDD & EDA specifications
│   ├── business/               # Vision, domain models & glossary
│   ├── database/               # PostgreSQL schema & migration docs
│   ├── packages/               # 16 Package Blueprint specifications
│   ├── security/               # Tenant isolation & security rules
│   └── README.md               # Technical documentation index
├── scripts/                    # Development & validation automation
│   ├── dev-setup.sh            # Developer environment setup script
│   ├── validate-architecture.sh# Layer boundary checker script
│   └── README.md               # Scripts catalog documentation
├── assets/                     # Media & architecture diagrams
│   └── README.md               # Asset guidelines & folder matrix
├── blueprint/                  # Blueprint generation logs & indices
│   └── README.md               # 16-Package generation tracking index
├── .editorconfig               # Cross-editor formatting standard
├── .env.example                # Canonical environment variable declaration template
├── .gitattributes              # Line ending normalization & binary rules
├── .gitignore                  # Git exclusion rules
├── AGENTS.md                   # Agent system directives & rules
├── CHANGELOG.md                # Semantic versioning changelog
├── CODE_OF_CONDUCT.md          # Contributor code of conduct
├── CONTRIBUTING.md             # Development contribution guide
├── docker-compose.yml          # Local container orchestration (Postgres, Redis, Kafka)
├── GEMINI.md                   # Gemini LLM context rules & SDK standards
├── LICENSE                     # Apache 2.0 License
├── metadata.json               # Application capability metadata
├── package.json                # Root package manifest & workspace scripts
├── pnpm-workspace.yaml         # PNPM workspace definition
├── PROJECT_MEMORY.md           # Architecture decision log & status freeze
├── README.md                   # Primary monorepo entry point
├── ROADMAP.md                  # Milestone execution roadmap
├── SECURITY.md                 # Vulnerability disclosure & security policy
├── tsconfig.json               # Root TypeScript compiler options
└── turbo.json                  # Turborepo build pipeline configuration
```

---

## 3. Toolchain & Workspace Configuration

### 3.1 Package Manager (`pnpm` v9.0.0)
- Defined in `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - 'apps/*'
    - 'packages/*'
  ```
- Guarantees fast, deterministic, non-hoisted dependency resolution via strict symlinking.

### 3.2 Monorepo Build Engine (`Turborepo`)
- Configured in `turbo.json` with pipeline targets:
  - `build`: Compiles all workspace packages in parallel respecting dependency order.
  - `lint`: Runs ESLint / Turbo linter across all packages.
  - `typecheck`: Executes `tsc --noEmit` to verify type safety.
  - `test`: Executes unit and integration test suites.

### 3.3 Compiler Configuration (`tsconfig.json`)
- Base TypeScript configuration using `NodeNext` module resolution, strict type checking (`strict: true`), zero implicit `any`, and ES2022 target emission.

---

## 4. Local Development Backing Services (`docker-compose.yml`)

The local development environment uses Docker Compose to provision isolated backing infrastructure:
- **PostgreSQL 16**: Port `5432` with healthcheck on database `inducore_db`.
- **Redis 7**: Port `6379` for session storage and caching.
- **Apache Kafka 7.5.0**: Port `9092` with KRaft consensus mode for domain event streaming.

---

## 5. Verification & Compliance Checklist

- [x] All root configuration files present and validated.
- [x] Monorepo workspace links active across `apps/*` and `packages/*`.
- [x] All top-level directories populated with dedicated `README.md` documentation.
- [x] GitHub CI workflows and community health templates configured.
- [x] AI agent context rules (`.ai/*`, `AGENTS.md`, `GEMINI.md`) synchronized.
