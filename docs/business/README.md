# Business Domain Documentation Directory (`/docs/business`)

This directory documents the core business strategy, commercial marketplace model, ubiquitous domain language, and subdomain contexts for the **InduCore** platform.

---

## 📜 Business Documentation Suite

| Document | Description | Key Focus Areas |
| :--- | :--- | :--- |
| **[VISION.md](./VISION.md)** | Product Vision, Mission & Strategic Pillars | Executive summary, mission statement, value pillars, alignment with monorepo. |
| **[BUSINESS_MODEL.md](./BUSINESS_MODEL.md)** | Business Model & Marketplace Architecture | SaaS tiers, transaction fees, AI add-ons, flywheel network effects, GTM strategy. |
| **[DOMAINS.md](./DOMAINS.md)** | Subdomain Architecture & Core Business Domains | Procurement, RFQ, Quotation, Award, IoT Telemetry, and ISO Compliance subdomains. |
| **[MARKETPLACE_AND_PROFILES.md](./MARKETPLACE_AND_PROFILES.md)** | Marketplace, Profiles, Personas & Trust | Matchmaking engine, buyer/supplier company profiles, user personas, trust framework. |
| **[BUSINESS_RULES.md](./BUSINESS_RULES.md)** | Enterprise Business Rules & Invariants | Requisition thresholds, line item completeness, AI score weights, multi-tenant isolation. |
| **[REQUIREMENTS.md](./REQUIREMENTS.md)** | Requirements, Success Metrics & FAQ | Functional/Non-Functional BRDs, platform KPIs, frequently asked questions. |
| **[GLOSSARY.md](./GLOSSARY.md)** | Ubiquitous Language Glossary | Domain dictionary defining RFQ, line item, bid score, tenant, telemetry drift, etc. |

---

## 🔗 Connection to Engineering Baseline (Package 01)
The business specifications defined here provide the direct domain rationale for:
- Aggregate boundaries in `packages/core-domain`.
- Use Case workflows in `packages/application`.
- Multi-tenant PostgreSQL Row-Level Security in `packages/infrastructure`.
