# Encryption, Audit Trail, Compliance & API Security Specification

## 1. Executive Summary

InduCore implements enterprise-grade data protection, cryptographic key management, tamper-evident audit logging, and compliance alignment for high-security industrial supply chain operations.

---

## 🔒 2. Data Encryption Standards

1. **Encryption in Transit**: All external and inter-service HTTP traffic is encrypted using **TLS 1.3** (TLS 1.2 minimum supported fallback with strict cipher suites: `ECDHE-RSA-AES128-GCM-SHA256`).
2. **Encryption at Rest**:
   - Database volumes encrypted using **AES-256** disk encryption.
   - Sensitive application fields (e.g. supplier banking details, internal cost baselines) encrypted at the application layer using **AES-256-GCM** with unique initialization vectors (IVs).

---

## 📜 3. Immutable Audit Trail Specification

All sensitive tenant operations (RFQ creation, bid submission, AI score generation, user role changes) trigger synchronous writes to the `audit_logs` table:

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(128) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    changes JSONB NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Log Retention & Tamper Resistance
- Audit logs are **append-only** (INSERT allowed, UPDATE and DELETE revoked for application database roles).
- Audit log records are streamed asynchronously to cold, WORM (Write Once Read Many) cloud storage buckets retained for 7 years for compliance reporting.

---

## 🛡️ 4. Compliance & Regulatory Alignment

- **SOC 2 Type II**: Multi-tenant data segregation, access control auditing, encryption controls.
- **ISO/IEC 27001:2022**: Information security management system standards.
- **GDPR / CCPA**: Right to erasure ("Right to be Forgotten") supported via automated tenant data purge routines.

---

## ⚡ 5. API Security & Per-Tenant Rate Limiting

To protect backend application servers and Gemini AI reasoning services from abuse:
- **Global API Rate Limit**: 1,000 requests per minute per tenant.
- **AI Bid Evaluation Limit (`/evaluate`)**: 30 requests per minute per tenant.
- **Throttling Mechanism**: Redis-backed Sliding Window Log rate limiter returning `429 Too Many Requests` with standard HTTP headers (`Retry-After`, `X-RateLimit-Reset`).
