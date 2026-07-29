# RESTful API Architecture & OpenAPI v3 Specification

## 1. Executive Summary & Design Principles

InduCore's RESTful API is built on **OpenAPI v3.1** standards, enforcing strict JSON:API inspired envelope schemas, multi-tenant request isolation, ISO-8601 timestamping, and HTTP standard status code mappings.

All endpoint operations execute through the API Gateway (`apps/api-gateway`), which delegates request payloads to the Application Layer Use Cases (`packages/application`).

---

## 🌐 2. Base URL & Protocol Standards

### Environment Gateway URLs
- **Production API**: `https://api.inducore.io/v1/{tenant_id}`
- **Staging API**: `https://api-staging.inducore.io/v1/{tenant_id}`
- **Development/Local**: `http://localhost:3000/v1/{tenant_id}`

---

## 🔑 3. Standard Request Headers

| Header Name | Type | Description | Required | Example |
| :--- | :--- | :--- | :--- | :--- |
| `Authorization` | String | OAuth2 / JWT Bearer access token | Yes | `Bearer eyJhbGciOi...` |
| `X-Tenant-ID` | UUID | Target enterprise tenant identity | Yes | `a0000000-0000-0000-0000-000000000001` |
| `X-Correlation-ID` | UUID | Distributed tracing request tracking ID | Optional | `c9f3b120-1a2b-4c3d-8e5f-123456789abc` |
| `Content-Type` | String | Media type format | Yes (`POST`/`PUT`) | `application/json` |
| `Accept` | String | Expected response format | Yes | `application/json` |

---

## 📑 4. Endpoint Specifications

### 4.1 Procurement RFQ Management

#### `GET /v1/{tenant_id}/rfqs`
Lists RFQs for the specified tenant with pagination, status filtering, and search.

- **Query Parameters**:
  - `page` (integer, default: 1): Page number.
  - `limit` (integer, default: 20, max: 100): Result page size.
  - `status` (string, optional): Filter by `DRAFT`, `OPEN`, `EVALUATING`, `AWARDED`, `CANCELLED`.
  - `query` (string, optional): Search across title and description.

- **Response Body (`200 OK`)**:
```json
{
  "data": [
    {
      "id": "c0000000-0000-0000-0000-000000000001",
      "tenantId": "a0000000-0000-0000-0000-000000000001",
      "title": "Siemens 15kW Motor Replacement",
      "status": "OPEN",
      "targetBudget": {
        "amount": 12500.00,
        "currency": "USD"
      },
      "lineItemCount": 3,
      "bidCount": 2,
      "expirationDate": "2026-08-10T00:00:00.000Z",
      "createdAt": "2026-07-27T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "error": null
}
```

#### `POST /v1/{tenant_id}/rfqs`
Creates a new procurement RFQ aggregate.

- **Request Body**:
```json
{
  "title": "High-Pressure Hydraulic Valves",
  "description": "Grade 316 stainless steel 10,000 PSI valves for Plant 4 expansion",
  "targetBudget": 45000.00,
  "currency": "USD",
  "expirationDate": "2026-08-30T23:59:59.000Z",
  "lineItems": [
    {
      "sku": "VALVE-HYD-10K-01",
      "partName": "Hydraulic Directional Control Valve",
      "specificationDetails": { "psi": 10000, "material": "SS316" },
      "quantity": 10,
      "targetUnitPrice": 4500.00
    }
  ]
}
```

- **Response Body (`201 Created`)**:
```json
{
  "data": {
    "id": "d1111111-1111-1111-1111-111111111111",
    "status": "DRAFT",
    "title": "High-Pressure Hydraulic Valves",
    "createdAt": "2026-07-27T10:45:00.000Z"
  },
  "meta": null,
  "error": null
}
```

---

### 4.2 AI Evaluation & Bid Scoring

#### `POST /v1/{tenant_id}/rfqs/{rfq_id}/evaluate`
Triggers Gemini 2.5 Pro multi-criteria AI bid analysis and updates scores for all submitted bids.

- **Response Body (`200 OK`)**:
```json
{
  "data": {
    "rfqId": "c0000000-0000-0000-0000-000000000001",
    "evaluatedBids": [
      {
        "bidId": "b2222222-2222-2222-2222-222222222222",
        "supplierName": "Apex Components Ltd",
        "aiScore": 92.5,
        "scoreBreakdown": {
          "commercialScore": 95.0,
          "complianceScore": 90.0,
          "leadTimeScore": 92.5
        },
        "reasoning": "Lowest cost bid with compliant ISO 9001 certifications and acceptable 10-day lead time."
      }
    ]
  },
  "meta": { "evaluatedAt": "2026-07-27T10:48:00.000Z" },
  "error": null
}
```

---

### 4.3 Quotation Management

#### `GET /v1/quotations`
Lists all quotations with line items, Incoterms, and attachments.

#### `POST /v1/quotations`
Submits a new quotation offer (draft or direct). Supports partial bids and alternative technical offers.

#### `POST /v1/quotations/{id}/revisions`
Issues a formal quotation revision with version incrementing and notes.

#### `POST /v1/quotations/{id}/withdraw`
Withdraws a submitted quotation offer with a logged reason.

---

### 4.4 Evaluation Engine & Sourcing Committee

#### `GET /v1/evaluations`
Retrieves all evaluation committee matrices with weighted scores and ranking.

#### `POST /v1/evaluations`
Initializes a multi-criteria evaluation matrix for an RFQ with custom technical/commercial weightings.

#### `POST /v1/evaluations/scores`
Submits individual committee evaluator scores (technical & commercial 0-100) and updates consensus average.

#### `POST /v1/evaluations/clarifications/request`
Dispatches a clarification request to a supplier regarding technical or commercial terms.

#### `POST /v1/evaluations/clarifications/response`
Records a supplier response to a clarification question.

#### `POST /v1/evaluations/approve`
Approves evaluation matrix and confirms supplier sourcing award.

---

### 4.5 Award Management & Contract Pipeline

#### `GET /v1/awards`
Lists all sourcing award recommendations, line allocations, approval workflows, and contract statuses.

#### `POST /v1/awards`
Creates a new sourcing award decision (supporting FULL, PARTIAL, and MULTI_SUPPLIER split allocation).

#### `POST /v1/awards/approve`
Records executive sign-off for an award decision.

#### `POST /v1/awards/letter`
Dispatches an official award notification letter to the winning supplier.

#### `POST /v1/awards/{id}/accept`
Records formal supplier acceptance of the award letter.

#### `POST /v1/awards/contract`
Generates a formal contract draft (MSA / Purchase Agreement) linked to the award.

#### `POST /v1/awards/purchase-request`
Generates an ERP Purchase Request (PR) with allocated line amounts and cost center assignments.

#### `POST /v1/awards/revise`
Issues a formal award revision, tracking version history and quantity reallocations.

#### `POST /v1/awards/cancel`
Cancels an award decision with a recorded executive reason.

---

### 4.6 Purchase Order Engine & Fulfillment Tracking

#### `GET /v1/purchase-orders`
Lists all purchase orders, line items, delivery schedules, shipment tracking logs, and GRN discrepancies.

#### `GET /v1/purchase-orders/{id}`
Returns full purchase order details, including line item fulfillment status and revision history.

#### `POST /v1/purchase-orders`
Generates a new Purchase Order (manual or sourced from Award / PR).

#### `POST /v1/purchase-orders/{id}/submit`
Submits a draft PO for multi-level executive approval.

#### `POST /v1/purchase-orders/approve`
Approves a pending purchase order.

#### `POST /v1/purchase-orders/{id}/issue`
Issues an approved purchase order to the awarded supplier.

#### `POST /v1/purchase-orders/schedule`
Logs a delivery schedule for line items including destination plant dock and expected date.

#### `POST /v1/purchase-orders/shipment`
Tracks shipment dispatch with carrier name, tracking number / BOL, ETA, and transit status.

#### `POST /v1/purchase-orders/goods-receipt`
Records a Goods Receipt Note (GRN), supporting partial delivery, over delivery, under delivery, and damaged condition tracking.

#### `POST /v1/purchase-orders/revise`
Issues a formal PO revision, logging version history and price/quantity adjustments.

#### `POST /v1/purchase-orders/close`
Closes a purchase order with an executive reason.

---

### 4.7 Contract Management Engine

#### `GET /v1/contracts`
Lists all contracts (framework agreements, supply contracts, MSAs, NDAs) with expiry status auto-checks, version numbers, value caps, and KPIs.

#### `GET /v1/contracts/{id}`
Returns full contract details including attached documents, digital signature logs, SLA KPIs, and version history.

#### `POST /v1/contracts`
Creates a new contract draft with initial terms, notice period, and total value cap ceiling.

#### `POST /v1/contracts/attachments`
Uploads or attaches a legal document or SLA appendix to an existing contract.

#### `POST /v1/contracts/signatures/request`
Issues a digital signature request to a buyer, supplier, or legal witness representative.

#### `POST /v1/contracts/signatures/sign`
Executes a digital signature, recording timestamp, IP address, and generating a SHA256 verification hash.

#### `POST /v1/contracts/renew/initiate`
Initiates a contract renewal workflow, changing status to UNDER_RENEWAL with recorded negotiation notes.

#### `POST /v1/contracts/renew/execute`
Executes contract renewal, advancing the version number, extending the expiration date, expanding value cap ceilings, and logging version history.

---

### 4.8 Supplier Performance Engine

#### `GET /v1/performance`
Lists all supplier performance scorecards including quality, delivery, cost, responsiveness scores, risk levels, tiers, and blacklist status.

#### `GET /v1/performance/kpi-summary`
Returns high-level KPI dashboard metrics: supplier counts (total, preferred, blacklisted, under review), average scores by category, and risk distribution.

#### `GET /v1/performance/supplier/{supplierId}`
Returns detailed performance scorecard for a specific supplier including granular metrics breakdown and historical trends.

#### `POST /v1/performance/scores/update`
Updates quality, delivery, cost, and responsiveness scores for a supplier and automatically recalculates composite overall score and tier.

#### `POST /v1/performance/metrics/update`
Updates operational performance metrics (defect PPM, on-time delivery %, cost variance %, avg response hours, audit compliance %).

#### `POST /v1/performance/blacklist`
Executes formal supplier blacklisting with mandatory audit reason and authorizing body, freezing RFQ/award permissions and flagging CRITICAL risk.

#### `POST /v1/performance/blacklist/remove`
Reinstates a blacklisted supplier upon executive quality board approval.

#### `POST /v1/performance/preferred/toggle`
Toggles preferred supplier status, assigning strategic category and recording board authorization.

#### `POST /v1/performance/risk-level`
Manually overrides supplier risk level ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL').

#### `POST /v1/performance/trends/record`
Records a quarterly performance snapshot in the historical trend timeline with auditor notes.

---

### 4.9 Inventory Integration Engine

#### `GET /v1/inventory`
Lists all inventory materials with real-time stock availability, reserved allocation, safety min/max policies, and ERP integration statuses.

#### `GET /v1/inventory/kpi-summary`
Returns high-level inventory KPI metrics: total stock valuation, reserved valuation, items below reorder point, critical stockout risk counts, and ERP sync distribution.

#### `GET /v1/inventory/reorder-suggestions`
Lists automated replenishment suggestions for items below safety reorder threshold with estimated procurement reorder costs.

#### `GET /v1/inventory/{id}`
Returns detailed inventory item profile, warehouse storage bin location, unit conversion rules, and SAP/Oracle ERP sync details.

#### `POST /v1/inventory/adjust-stock`
Adjusts physical on-hand stock quantity with mandatory audit reason logging.

#### `POST /v1/inventory/reserve-stock`
Allocates available stock to active assembly work orders or purchase orders.

#### `POST /v1/inventory/release-stock`
Releases reserved stock back into available inventory pool.

#### `POST /v1/inventory/policy/update`
Updates safety min stock level, max bin capacity, reorder threshold, and suggested reorder quantity.

#### `POST /v1/inventory/unit-conversion`
Calculates quantity conversion between base unit of measure (e.g. KG) and target UOM (e.g. TON, LB, GALLON).

#### `POST /v1/inventory/erp-sync`
Triggers bi-directional ERP integration synchronization (SAP S/4HANA, Oracle NetSuite, Microsoft Dynamics 365).
