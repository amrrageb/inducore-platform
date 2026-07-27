# Infrastructure Package (`@inducore/infrastructure`)

This package implements concrete repository adapters, database migration scripts, messaging publishers (Kafka/Redis), and external AI gateways (`@google/genai`) for the InduCore platform.

## 🏛️ Infrastructure Rules

1. **Implements Application Ports**: Implements `IRFQRepository`, `IEventOutboxPublisher`, and `IGeminiAIService` defined in `@inducore/application`.
2. **Tenant Isolation**: All SQL queries explicitly set or check `tenant_id` for PostgreSQL Row-Level Security (RLS).
3. **Server-Side Gemini SDK**: Wraps `@google/genai` securely on the backend without leaking keys to client bundles.
