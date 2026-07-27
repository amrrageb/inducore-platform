# Core Domain Package (`@inducore/core-domain`)

This package contains the pure, framework-agnostic Domain Layer for the InduCore platform, adhering strictly to Domain-Driven Design (DDD) principles.

## 🏛️ DDD Layering & Rules

1. **Zero External Dependencies**: Contains zero HTTP frameworks, ORM libraries, or database drivers.
2. **Aggregates & Entities**: Encapsulates business invariants and state transitions.
3. **Value Objects**: Immutable domain primitives (`Money`, `SKU`, `TenantId`).
4. **Domain Events**: Dispatched whenever aggregate state updates occur (`RFQCreatedEvent`, `BidSubmittedEvent`).

## 📦 Directory Structure

- `src/common/`: Base building blocks (`AggregateRoot`, `Entity`, `ValueObject`, `Result`, `Guard`).
- `src/procurement/`: RFQ Aggregate, Supplier Bids, Line Items, and Procurement Events.
- `src/inventory/`: Part Stock Aggregate, SKU Value Object, and Inventory Events.
- `src/identity/`: Multi-tenant identity primitives.
