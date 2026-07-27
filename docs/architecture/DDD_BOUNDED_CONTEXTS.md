# Domain-Driven Design (DDD) Bounded Context Specifications

InduCore is partitioned into explicit Bounded Contexts, each governing a well-defined domain model, ubiquitous language, and database Row-Level Security (RLS) boundary.

---

## 🏛️ Bounded Context Map & Context Relations

```
+------------------------------------+          Domain Events          +-----------------------------------+
|  Procurement Bounded Context       | ------------------------------> |  Inventory Bounded Context        |
|  - RFQs                            |                                 |  - Spare Parts Stock              |
|  - Supplier Bids                   |                                 |  - Reorder Thresholds             |
|  - Gemini AI Evaluation Scores     |                                 |  - Warehouse Locations            |
+------------------------------------+                                 +-----------------------------------+
                  │                                                                     ^
                  │                                                                     │
                  │ Domain Events                                                       │ Domain Events
                  v                                                                     │
+------------------------------------+                                 +-----------------------------------+
|  ISO Compliance & Audit Context    | <--------------------------------|  Plant IoT Telemetry Context      |
|  - Immutable Event Ledger          |                                 |  - Vibration / Temp Sensors       |
|  - Outbox Audit Records            |                                 |  - Predictive Anomaly Alerts      |
+------------------------------------+                                 +-----------------------------------+
```

---

## 📦 Detailed Bounded Context Specifications

### 1. Procurement Bounded Context

- **Primary Aggregate Root**: `RFQAggregate`
- **Entities**:
  - `RFQLineItem`: Individual part requirement specifying SKU, required quantity, target unit price, and technical specs.
  - `SupplierBid`: Vendor proposal detailing total bid amount, line item pricing breakdown, delivery lead time (days), and vendor payment terms.
- **Value Objects**:
  - `RFQId`: Unique identifier (`UUIDv4`).
  - `TenantId`: Multi-tenant isolation boundary identifier.
  - `BidStatus`: Enumerated state (`DRAFT`, `OPEN`, `EVALUATING`, `AWARDED`, `REJECTED`, `EXPIRED`).
  - `Money`: Currency ISO code + precise monetary amount.
  - `BidScore`: AI-generated numerical rating (0–100) with confidence interval and rationale breakdown.
- **Domain Invariants**:
  - An RFQ cannot be transitioned to `EVALUATING` or `AWARDED` unless at least one `SupplierBid` has been attached.
  - Bids cannot be submitted against RFQs in `EXPIRED`, `AWARDED`, or `REJECTED` states.
  - Target line item quantities must be strictly positive integers (`quantity > 0`).

### 2. Plant IoT Telemetry Bounded Context

- **Primary Aggregate Root**: `EquipmentAssetAggregate`
- **Entities**:
  - `SensorDevice`: Hardware telemetry node (vibration meter, thermal camera, pressure transducer).
  - `TelemetryReading`: Time-series sensor sample recording metric value, timestamp, and calibration status.
- **Value Objects**:
  - `AssetId`: Unique identifier for plant machinery.
  - `SensorMetric`: Metric type (`VIBRATION_MM_S`, `TEMPERATURE_CELSIUS`, `PRESSURE_BAR`).
  - `DriftSeverity`: Threshold classification (`NORMAL`, `WARNING`, `CRITICAL_ANOMALY`).
- **Domain Invariants**:
  - Telemetry samples with timestamps in the future are rejected.
  - A `CRITICAL_ANOMALY` classification automatically emits a `TelemetryAnomalyDetectedEvent` to trigger automated procurement reordering.

### 3. ISO Compliance & Audit Bounded Context

- **Primary Aggregate Root**: `AuditTrailAggregate`
- **Entities**:
  - `AuditLogEntry`: Immutable record capturing event payload, actor identity, tenant context, timestamp, and cryptographic hash.
- **Value Objects**:
  - `AuditId`: Unique transaction record hash.
  - `ComplianceStandard`: Classification tag (`ISO_27001`, `SOC2_TYPE_II`, `GMP`).
- **Domain Invariants**:
  - Audit log entries are strictly append-only; update and delete operations are prohibited at the domain level.

---

## 🔗 Context Mapping Strategies

| Source Context | Target Context | Relationship Pattern | Integration Mechanism |
| :--- | :--- | :--- | :--- |
| **Procurement** | **Inventory** | **Customer-Supplier** | Asynchronous `RfqAwardedEvent` updates stock allocation. |
| **Plant Telemetry** | **Procurement** | **Upstream-Downstream (Pipes & Filters)** | `TelemetryAnomalyDetectedEvent` triggers draft RFQ creation via `CreateRFQUseCase`. |
| **All Contexts** | **ISO Compliance** | **Published Language / Audit Ledger** | Transactional Outbox worker forwards all domain events to the audit ledger. |

