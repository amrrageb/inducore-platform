# Unified API Error Handling & Error Envelope Specification

## 1. Executive Summary

InduCore mandates a standardized error envelope structure across all REST APIs and GraphQL subgraphs. Every error response adheres to **RFC 7807 Problem Details** semantics wrapped inside the standard JSON envelope.

---

## 📦 2. Standard JSON Error Envelope Format

```json
{
  "data": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested RFQ aggregate 'c0000000-0000-0000-0000-000000000000' was not found.",
    "details": [
      {
        "field": "rfqId",
        "issue": "No matching entity found for tenant a0000000-0000-0000-0000-000000000001."
      }
    ]
  },
  "timestamp": "2026-07-27T10:50:00.000Z"
}
```

---

## 📋 3. Standard System Error Codes & HTTP Mappings

| Error Code | HTTP Status | Domain Cause |
| :--- | :--- | :--- |
| `INVALID_INPUT` | `400 Bad Request` | Zod validation or DTO payload validation failure. |
| `MISSING_TENANT_CONTEXT` | `400 Bad Request` | `X-Tenant-ID` header missing or malformed UUID. |
| `UNAUTHORIZED` | `401 Unauthorized` | Missing, expired, or invalid OAuth2 JWT Bearer token. |
| `FORBIDDEN` | `403 Forbidden` | User lacks required RBAC role for requested operation. |
| `RESOURCE_NOT_FOUND` | `404 Not Found` | Entity not found within the caller's tenant boundary. |
| `CONFLICT` | `409 Conflict` | Duplicate unique constraint breach or aggregate version mismatch. |
| `RATE_LIMIT_EXCEEDED` | `429 Too Many Requests` | Request volume exceeds per-tenant rate limit quota. |
| `AI_SERVICE_UNAVAILABLE` | `503 Service Unavailable` | Gemini API rate limit or transient failure. |
| `INTERNAL_SERVER_ERROR` | `500 Internal Server Error` | Unhandled application crash or infrastructure failure. |
