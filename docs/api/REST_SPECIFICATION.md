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
