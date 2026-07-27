# Role-Based Access Control (RBAC) & Multi-Tenant Authorization Specification

## 1. Executive Summary

Authorization in InduCore operates at two distinct layers:
1. **Application Layer RBAC**: Fine-grained role and permission evaluation inside express routes and use cases.
2. **Database Layer RLS**: PostgreSQL Row-Level Security ensuring absolute tenant separation at the database kernel layer.

---

## 🛡️ 2. Comprehensive Role Permission Matrix

| Granular Permission | TENANT_ADMIN | PLANT_MANAGER | PROCUREMENT_OFFICER | SUPPLIER_REP | AUDITOR |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `tenant:configure` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `rfq:create` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `rfq:view` | ✅ | ✅ | ✅ | ✅ (Assigned) | ✅ |
| `rfq:update` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `rfq:delete` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `bid:submit` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `bid:evaluate_ai` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `audit:read` | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 🏛️ 3. Multi-Tenant Database Kernel Enforcement (RLS)

In addition to API Gateway authorization, every database query executed against PostgreSQL is restricted by active Row-Level Security policies:

```sql
-- PostgreSQL RLS Policy Definition
CREATE POLICY tenant_isolation_policy ON rfqs
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
```

Every connection checked out from the pool MUST call `SET LOCAL app.current_tenant_id = $1` inside a transaction block prior to executing queries.
