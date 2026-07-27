# InduCore Enterprise Platform

[![CI/CD Pipeline](https://github.com/inducore/inducore/actions/workflows/ci.yml/badge.svg)](https://github.com/inducore/inducore/actions/workflows/ci.yml)
[![Security Scan](https://github.com/inducore/inducore/actions/workflows/security-scan.yml/badge.svg)](https://github.com/inducore/inducore/actions/workflows/security-scan.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Architecture](https://img.shields.io/badge/Architecture-Clean_%26_DDD-emerald.svg)](docs/architecture/CLEAN_ARCHITECTURE.md)

**InduCore** is a next-generation enterprise industrial resource planning, supply chain execution, and IoT analytics ecosystem. Built upon Domain-Driven Design (DDD), Clean Architecture, and Event-Driven Architecture (EDA) principles, InduCore delivers multi-tenant scale, zero-trust security, and real-time operational telemetry for global manufacturing and procurement operations.

---

## 🏛️ Monorepo Architecture Overview

The repository is structured as a unified enterprise monorepo using workspace tooling (pnpm / Turborepo) to maintain tight architectural boundaries, deterministic builds, and seamless sharing of domain models.

```
inducore/
├── .github/              # Enterprise GitHub workflows, issue/PR templates, CODEOWNERS
├── .cursor/              # AI Agent workspace rules & prompts
├── docs/                 # Comprehensive business, architectural, and operational documentation
│   ├── business/         # Vision, Ubiquitous Language Glossary, Domain Context Maps
│   ├── architecture/     # Clean Architecture, DDD Contexts, Event Schema, 12-Factor Audit
│   ├── api/              # OpenAPI v3 & GraphQL Subgraph specifications
│   ├── database/         # Schema migration strategy, multi-tenant database isolation
│   ├── security/         # Zero-Trust RBAC/ABAC models, OAuth2/OIDC specs
│   ├── engineering/      # Code guidelines, testing standards, release governance
│   └── playbooks/        # Disaster recovery, incident management, onboarding guides
├── packages/             # Shared TypeScript & Node.js packages
│   ├── core-domain/      # Domain entities, value objects, domain events, & errors
│   ├── application/      # Command/Query bus interfaces, use-case specifications
│   ├── infrastructure/   # DB drivers, messaging brokers (Kafka/NATS), external HTTP gateways
│   ├── ui-kit/           # Design system components built with Tailwind & React
│   └── logger/           # Structured telemetry & trace correlation engine
├── apps/                 # Runnable applications
│   ├── api-gateway/      # GraphQL / REST Enterprise API Gateway
│   ├── web-portal/       # Primary React 18 single-page application & dashboard
│   ├── mobile-app/       # React Native / Expo industrial floor execution app
│   └── background-worker/# Asynchronous event consumer & cron scheduler
└── infrastructure/       # Terraform, Helm charts, Docker manifests, & K8s operators
```

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js**: `v20.x` LTS or higher
- **pnpm**: `v9.x`
- **Docker & Docker Compose**: `v24.x+`
- **PostgreSQL**: `v16.x`
- **Redis**: `v7.x`

### Initializing the Workspace

1. **Clone the Repository & Install Dependencies**:
   ```bash
   git clone https://github.com/inducore/inducore.git
   cd inducore
   pnpm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

3. **Start Local Infrastructure Containers**:
   ```bash
   docker compose up -d postgres redis kafka
   ```

4. **Run Database Migrations & Seed Initial Tenant Data**:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Start Development Application Server**:
   ```bash
   pnpm dev
   ```

The application will launch with the API Gateway running on `http://localhost:3000` and the Web Portal running with live reload.

---

## 📘 Documentation Index

For exhaustive architecture and operational specifications, consult the following core documents:

- [Business Vision & Domain Strategy](docs/business/VISION.md)
- [Ubiquitous Language Glossary](docs/business/GLOSSARY.md)
- [Clean Architecture & DDD Standards](docs/architecture/CLEAN_ARCHITECTURE.md)
- [Event-Driven Messaging & Event Registry](docs/architecture/EVENT_DRIVEN_SPEC.md)
- [API Design Specifications (REST & GraphQL)](docs/api/README.md)
- [Security, Identity & RBAC Matrix](docs/security/AUTHENTICATION.md)
- [Engineering Contribution & Testing Guidelines](CONTRIBUTING.md)

---

## 🔒 Security & Governance

InduCore complies with ISO/IEC 27001, SOC 2 Type II, and GDPR data processing standards. Security vulnerabilities should be disclosed following our [Security Policy](SECURITY.md).

License: [Apache 2.0](LICENSE) — Copyright © 2026 InduCore Enterprise Systems.
