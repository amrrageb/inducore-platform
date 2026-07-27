# Enterprise Business Rules & Invariants

This specification documents the formal business rules, validation invariants, authorization thresholds, and execution conditions enforced across the **InduCore** platform.

---

## 📜 1. Core Rule Index

| Rule ID | Domain Context | Title | Enforcement Level |
| :---: | :--- | :--- | :---: |
| **BR-PROC-001** | Procurement | Requisition Dual Approval Threshold | Mandatory |
| **BR-RFQ-001** | RFQ | Line Item Specification Completeness | Mandatory |
| **BR-RFQ-002** | RFQ | Expiration Deadline Enforceability | Mandatory |
| **BR-BID-001** | Quotation | Binding Quote Invariability | Mandatory |
| **BR-BID-002** | Quotation | Gemini AI Score Computation | Automated |
| **BR-AWD-001** | Award | Single Active Award Lock | Mandatory |
| **BR-SEC-001** | Security | Cross-Tenant Data Isolation | System Core |

---

## 🏛️ 2. Detailed Business Rule Definitions

### BR-PROC-001: Requisition Dual Approval Threshold
- **Rule Description**: Any purchase requisition or RFQ initiation with a total estimated value exceeding $50,000 USD must be approved by both the Plant Maintenance Lead and the Regional Procurement Director before publishing to suppliers.
- **System Action**: State set to `PENDING_APPROVAL`. Broadcast triggers locked until approval signatures recorded.

### BR-RFQ-001: Line Item Specification Completeness
- **Rule Description**: An RFQ cannot be transitioned to `OPEN` state unless every line item specifies:
  1. Valid SKU or OEM part number.
  2. Required quantity (strictly positive integer `quantity > 0`).
  3. Delivery target warehouse location ID.
  4. Required fulfillment window (date > current date + 48 hours).
- **System Action**: Reject state change request with `InvalidLineItemSpecificationException`.

### BR-RFQ-002: Expiration Deadline Enforceability
- **Rule Description**: Once an RFQ reaches its `expirationDate`, the system automatically transitions the RFQ status to `EXPIRED` or `EVALUATING` (if bids exist).
- **System Action**: Further bid submissions are strictly blocked by API Gateway controllers and Domain Aggregate guards.

### BR-BID-001: Binding Quote Invariability
- **Rule Description**: Once submitted by a supplier, a `SupplierBid` is legally binding for the duration of its declared `validityPeriodDays`. Suppliers may withdraw a bid prior to RFQ closure, but cannot modify line-item prices post-submission without creating a revised bid version.
- **System Action**: Immutability enforced in domain layer (`SupplierBid` value object).

### BR-BID-002: Gemini AI Score Computation Mechanics
- **Rule Description**: When an RFQ closes, the Gemini AI engine computes a normalized score (0–100) for each received bid using the following weight formula:
  $$\text{Score} = (W_P \times S_{price}) + (W_L \times S_{leadtime}) + (W_Q \times S_{quality}) + (W_G \times S_{geo})$$
  Where:
  - $W_P = 0.40$ (Unit Price Competitiveness)
  - $W_L = 0.30$ (Delivery Lead Time)
  - $W_Q = 0.20$ (Supplier Quality Rating)
  - $W_G = 0.10$ (Geographic Proximity)
- **System Action**: Evaluation matrix stored in database and presented to procurement decision makers.

### BR-AWD-001: Single Active Award Lock
- **Rule Description**: An RFQ can only be awarded to one primary supplier (or explicitly split across line items if multi-sourcing enabled). Once awarded, all remaining bids automatically transition to `REJECTED`.
- **System Action**: Emit `RfqAwardedEvent` via Transactional Outbox; notify unselected suppliers asynchronously.

### BR-SEC-001: Cross-Tenant Data Isolation
- **Rule Description**: Under no circumstances may a user or background task from Tenant A view, query, or modify RFQs, bids, or telemetry samples belonging to Tenant B.
- **System Action**: PostgreSQL Row-Level Security (RLS) policies filter rows based on `app.current_tenant_id`.
