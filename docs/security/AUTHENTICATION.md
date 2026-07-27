# Authentication, OAuth2/OIDC & Secrets Management Specification

## 1. Executive Summary

InduCore delegates identity verification to enterprise-grade OAuth2 / OpenID Connect (OIDC) identity providers (e.g. Auth0, Keycloak, Google Workspace). The API Gateway verifies cryptographically signed JSON Web Tokens (JWT) on every incoming request.

---

## 🔐 2. JWT Payload & Claims Schema

Every incoming API request MUST present an `Authorization: Bearer <JWT>` header containing an RS256-signed JWT token:

```json
{
  "iss": "https://auth.inducore.io/",
  "sub": "usr_98a7b6c5d4e3",
  "aud": "https://api.inducore.io/",
  "tenant_id": "a0000000-0000-0000-0000-000000000001",
  "roles": ["PROCUREMENT_OFFICER"],
  "permissions": [
    "rfq:create",
    "rfq:read",
    "rfq:update",
    "bid:evaluate"
  ],
  "iat": 1774600000,
  "exp": 1774600900
}
```

### JWT Validation Standard Operating Procedure
1. Verify token signature against Identity Provider JSON Web Key Set (`JWKS`) endpoint.
2. Verify token expiration (`exp` claim must be > current system time).
3. Verify token issuer (`iss`) and audience (`aud`) match configured environment values.
4. Extract `tenant_id` claim and inject into `req.tenantId` Express context.

---

## 🔑 3. Secrets Management & Zero-Trust Isolation Rules

- **Server-Side Isolation**: All API keys, including `GEMINI_API_KEY`, database credentials, and Kafka SASL secrets, reside exclusively in backend environment configurations (`.env.example` declaration).
- **Zero Client Exposure**: Secrets MUST NEVER be exposed in web bundles, client source code, or prefixed with `VITE_`.
- **Dynamic Secret Injection**: Secrets are retrieved at runtime via HashiCorp Vault or Cloud Secret Manager.

---

## 🔄 4. Cryptographic Key Rotation Policy

1. **JWT Signature Keys**: Asymmetric RS256 keypairs rotated automatically every 90 days via automated JWKS rollover.
2. **Database Field Encryption Keys**: Master encryption key rotated annually with automated re-encryption background job for legacy ciphertexts.
