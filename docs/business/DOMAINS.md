# Subdomain Architecture & Core Business Domains

InduCore classifies its business domain into explicit subdomains in accordance with Domain-Driven Design (DDD) principles. This document provides detailed domain definitions for Procurement, RFQ, Quotation, Award, Telemetry, and Compliance.

---

## 🗺️ Subdomain Classification Map

```
+-----------------------------------------------------------------------------------+
|                                  INDUCORE PLATFORM                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ CORE SUBDOMAINS ] (Strategic Competitive Differentiators)                       |
|  ├── Procurement Domain (Sourcing Workflow Orchestration)                        |
|  ├── RFQ Domain (Specification & Line-Item Management)                            |
|  ├── Quotation Domain (Supplier Bid & Gemini AI Scoring Engine)                   |
|  └── Award Domain (Commercial Contract & PO Settlement)                           |
|                                                                                   |
|  [ SUPPORTING SUBDOMAINS ] (Domain-Specific Operational Enablers)                  |
|  ├── Plant IoT Telemetry & Maintenance Domain (Anomaly Triggered RFQs)             |
|  └── Supplier Profile & Verification Domain (Trust Framework & Ratings)          |
|                                                                                   |
|  [ GENERIC SUBDOMAINS ] (Standard Shared Infrastructure)                           |
|  ├── Multi-Tenant Identity & Access Management (IAM)                              |
|  └── ISO Compliance & Audit Trail Ledger                                          |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 📦 Detailed Domain Specifications

### 1. Procurement Domain
- **Description**: Governs end-to-end procurement sourcing lifecycles, purchase requisitions, approval gates, and multi-facility procurement strategy.
- **Key Concepts**: Requisition, Approval Chain, Procurement Budget, Preferred Vendor List.
- **Domain Invariants**:
  - Requisitions exceeding $50,000 require dual-manager approval before emitting an RFQ.
  - Multi-facility orders must isolate line items by delivery warehouse target.

### 2. RFQ (Request for Quotation) Domain
- **Description**: Manages commercial RFQ creation, line-item specification, target unit pricing, delivery windows, and supplier broadcast rules.
- **Key Aggregates**: `RFQAggregate`, `RFQLineItem`.
- **Domain Invariants**:
  - An RFQ must contain at least one valid line item with SKU, quantity (> 0), and required delivery date.
  - An RFQ cannot accept new bids once transitioned to `CLOSED`, `EVALUATING`, or `AWARDED`.

### 3. Quotation (Supplier Bid) Domain
- **Description**: Encapsulates supplier proposals, line-item price breakdowns, payment terms, shipping lead times, and AI bid evaluation.
- **Key Aggregates**: `SupplierBid`, `BidScore`.
- **Domain Invariants**:
  - Bids submitted past the RFQ expiration deadline are rejected automatically.
  - Unit bid prices must be positive numbers formatted as immutable `Money` value objects.
  - Gemini AI scoring calculates composite ratings based on price (40%), lead time (30%), supplier compliance rating (20%), and geographic proximity (10%).

### 4. Award Domain
- **Description**: Handles final supplier selection, commercial award confirmation, Purchase Order (PO) emission, and rejection notifications to unselected bidders.
- **Key Aggregates**: `AwardNotice`, `PurchaseOrder`.
- **Domain Invariants**:
  - Awarding an RFQ locks all associated bids against further modifications.
  - Award confirmation emits a transactional `RfqAwardedEvent` via the Outbox Relayer to trigger inventory allocation.

### 5. Plant IoT Telemetry & Maintenance Domain
- **Description**: Ingests high-frequency sensor readings (vibration, thermal, pressure) from machinery assets to detect wear and trigger automated draft RFQs.
- **Key Aggregates**: `EquipmentAssetAggregate`, `SensorReading`.
- **Domain Invariants**:
  - Critical sensor drift triggers an automated `TelemetryAnomalyDetectedEvent`, creating a draft RFQ with pre-populated replacement SKU specs.

### 6. ISO Compliance & Audit Domain
- **Description**: Maintains an immutable append-only record of all domain state changes, bidder interactions, and contract awards for ISO 27001 / SOC 2 compliance.
- **Key Aggregates**: `AuditTrailAggregate`, `AuditLogEntry`.
- **Domain Invariants**:
  - Audit records are write-once, read-many (WORM); updates and deletions are forbidden.

---

## 🔗 Cross-Reference to Core Code Base
These business domains map directly to TypeScript aggregate structures implemented in Package 01 (`packages/core-domain/src/procurement/`):
- `RFQAggregate.ts`
- `RFQLineItem.ts`
- `SupplierBid.ts`
- `RFQStatus.ts`
