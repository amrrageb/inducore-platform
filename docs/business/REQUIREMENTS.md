# Business Requirements, Success Metrics & FAQ

This document outlines the core functional and non-functional business requirements (BRDs), key performance indicators (KPIs), and frequently asked questions governing the **InduCore** platform.

---

## 📋 1. Business Requirements Specification

### Functional Requirements (FR)

| Req ID | Domain | Requirement Description | Business Priority |
| :---: | :--- | :--- | :---: |
| **FR-01** | Procurement | Support structured multi-line-item RFQ creation with SKU auto-completion. | High |
| **FR-02** | RFQ | Provide broadcast options (Public Marketplace vs. Invited Supplier List). | High |
| **FR-03** | Quotation | Enable suppliers to upload PDF quotes and automatically parse pricing using Gemini AI. | High |
| **FR-04** | AI Scoring | Generate side-by-side bid comparison matrix with AI score ranking (0–100). | Critical |
| **FR-05** | Award | Support one-click PO award workflow with automated outbox event publishing. | Critical |
| **FR-06** | Telemetry | Ingest industrial IoT sensor streams and generate draft RFQs upon critical drift detection. | High |
| **FR-07** | Audit | Maintain immutable ISO 27001 audit ledger of all procurement actions. | Critical |

### Non-Functional Requirements (NFR)

| Req ID | Category | Metric Target / Standard | Compliance Strategy |
| :---: | :--- | :--- | :--- |
| **NFR-01** | **Performance** | API response time $< 200\text{ms}$ ($p_{95}$). | Express API Gateway + Redis Caching. |
| **NFR-02** | **Availability** | $99.95\%$ uptime SLA for production workloads. | Cloud Run auto-scaling + multi-region DB. |
| **NFR-03** | **Security** | Zero cross-tenant data leakage ($0$ defect rate). | PostgreSQL Row-Level Security (RLS). |
| **NFR-04** | **Scalability** | Support up to $10,000$ concurrent RFQs and $100,000$ IoT sensor streams. | Asynchronous Kafka event processing. |
| **NFR-05** | **Compliance** | ISO 27001, SOC 2 Type II, and GDPR readiness. | Transactional Outbox immutable event ledger. |

---

## 📈 2. Success Metrics & Key Performance Indicators (KPIs)

To evaluate platform value delivery, InduCore tracks four strategic metric categories:

```
+-----------------------------------------------------------------------------------+
|                            InduCore Platform KPIs                                 |
+-----------------------------------------------------------------------------------+
| 1. Sourcing Velocity Metrics:                                                     |
|    - Average RFQ Cycle Time: Reduced from 21 days to < 48 hours.                  |
|    - Supplier Time-to-Quote: Average response within 6 hours.                      |
|                                                                                   |
| 2. Financial & Cost Optimization Metrics:                                         |
|    - Direct Unit Cost Savings: 8% - 14% average savings per awarded RFQ.           |
|    - Unplanned Downtime Avoidance: $250,000+ saved per plant/year via IoT sourcing.|
|                                                                                   |
| 3. Operational Efficiency Metrics:                                                |
|    - Automated Quote Parsing Accuracy: > 98% field extraction precision.          |
|    - On-Time Delivery Fulfillment: > 96% supplier SLA compliance.                |
|                                                                                   |
| 4. System & Platform Metrics:                                                     |
|    - API Response Time: < 150ms average.                                          |
|    - Zero Cross-Tenant Data Isolation Incidents.                                  |
+-----------------------------------------------------------------------------------+
```

---

## ❓ 3. Frequently Asked Questions (FAQ)

### Q1: How does InduCore ensure that competitor suppliers cannot see each other's quotes?
**Answer**: InduCore enforces strict zero-trust data privacy. Supplier bids are isolated at the database level using PostgreSQL Row-Level Security (RLS) policies. Bids are strictly sealed until the RFQ expiration deadline passes, after which only the buyer's authorized procurement team can view quotes and AI scoring matrices.

### Q2: How does the Gemini AI Bid Evaluation work?
**Answer**: When an RFQ closes, InduCore's server-side Gemini AI module (`@google/genai`) analyzes all received supplier bids. It evaluates price competitiveness, delivery lead times, supplier ISO quality ratings, and historical fulfillment performance to produce a normalized score from 0 to 100 along with an executive rationale summary.

### Q3: Can InduCore integrate with existing ERP systems like SAP or Oracle?
**Answer**: Yes. InduCore provides standard REST and GraphQL API endpoints, as well as an Event-Driven Outbox pattern, allowing seamless two-way synchronization of Purchase Requisitions, Purchase Orders, and Inventory allocations with enterprise ERP systems.

### Q4: How do IoT sensor alerts trigger draft RFQs?
**Answer**: Plant machinery sensors transmit telemetry samples (vibration, temperature, runtime) to InduCore's IoT service. When telemetry drift exceeds safety thresholds, the system emits a `TelemetryAnomalyDetectedEvent`, which automatically generates a draft RFQ pre-populated with replacement part numbers and required quantities for engineering approval.

### Q5: What security compliance standards does InduCore support?
**Answer**: InduCore is built for enterprise regulatory requirements, supporting ISO 27001 data security standards, SOC 2 Type II controls, and immutable audit trails via a Transactional Outbox event ledger.
