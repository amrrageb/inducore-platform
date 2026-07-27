# API Gateway Middleware Pipeline Architecture

## 1. Executive Summary

The API Gateway (`apps/api-gateway`) executes a strict sequential HTTP middleware chain to process incoming requests, enforce multi-tenant isolation, validate security tokens, limit request velocity, and inject structured logging context.

---

## ⛓️ 2. Middleware Sequential Order

```
[ Incoming HTTP Request ]
          │
          ▼
1. CORS Middleware (`cors`)
          │
          ▼
2. Body Parsing Middleware (`express.json`)
          │
          ▼
3. Request ID & Correlation Middleware
          │
          ▼
4. Tenant Context & JWT Middleware (`tenantContextMiddleware`)
          │
          ▼
5. Rate Limiting Middleware (`express-rate-limit`)
          │
          ▼
6. Request Logger Middleware (`pino-http`)
          │
          ▼
[ Route Handler / Controller ]
          │
          ▼
7. Centralized Error Handling Middleware
```

---

## 🛠️ 3. Key Middleware Implementations

### 3.1 Tenant Context Extraction Middleware
Extracts tenant identity from the `X-Tenant-ID` header or JWT claims, validating format and injecting context into the Express `Request` object:

```typescript
// apps/api-gateway/src/middleware/tenantContextMiddleware.ts
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenantId: string;
      userId: string;
      userRoles: string[];
    }
  }
}

export function tenantContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const tenantHeader = req.headers['x-tenant-id'];

  if (!tenantHeader || Array.isArray(tenantHeader)) {
    res.status(400).json({
      data: null,
      error: {
        code: 'MISSING_TENANT_CONTEXT',
        message: 'X-Tenant-ID header is required.',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  req.tenantId = tenantHeader;
  req.userId = (req.headers['x-user-id'] as string) || 'system-user';
  req.userRoles = (req.headers['x-user-roles'] as string)?.split(',') || ['USER'];

  next();
}
```

---

### 3.2 Rate Limiting Policy
- **Global Rate Limit**: 1,000 requests per minute per tenant.
- **AI Endpoint Limit (`/evaluate`)**: 30 requests per minute per tenant.
