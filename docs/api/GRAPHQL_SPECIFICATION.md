# GraphQL Federation Subgraph Schema Specification

## 1. Executive Summary

InduCore provides an **Apollo Federation v2 Subgraph** interface for client applications requiring complex, single-roundtrip queries across procurement aggregates, line items, supplier bid evaluations, and inventory entities.

---

## 🧬 2. GraphQL Subgraph Schema DDL

```graphql
extend schema
  @link(
    url: "https://specs.apollo.dev/federation/v2.0"
    import: ["@key", "@shareable", "@external", "@provides", "@requires"]
  )

type Tenant @key(fields: "id") {
  id: ID!
  name: String! @shareable
  slug: String! @shareable
  rfqs(first: Int = 20, after: String, status: RfqStatus): RfqConnection!
}

type Rfq @key(fields: "id") {
  id: ID!
  tenantId: ID!
  title: String!
  description: String
  status: RfqStatus!
  targetBudget: Money!
  lineItems: [RfqLineItem!]!
  supplierBids: [SupplierBid!]!
  expirationDate: String!
  createdAt: String!
  updatedAt: String!
}

type RfqLineItem {
  id: ID!
  sku: String!
  partName: String!
  specificationDetails: String
  quantity: Int!
  targetUnitPrice: Money!
}

type SupplierBid {
  id: ID!
  supplierId: ID!
  supplierName: String!
  totalAmount: Money!
  leadTimeDays: Int!
  aiScore: Float
  scoreBreakdown: String
  status: BidStatus!
  createdAt: String!
}

type Money {
  amount: Float!
  currency: String!
}

type RfqConnection {
  edges: [RfqEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type RfqEdge {
  cursor: String!
  node: Rfq!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

enum RfqStatus {
  DRAFT
  OPEN
  EVALUATING
  AWARDED
  CANCELLED
}

enum BidStatus {
  SUBMITTED
  ACCEPTED
  REJECTED
}

type Query {
  rfq(id: ID!): Rfq
  tenantRfqs(tenantId: ID!, status: RfqStatus): [Rfq!]!
}

type Mutation {
  createRfq(input: CreateRfqInput!): Rfq!
  evaluateBidsWithAI(rfqId: ID!): [SupplierBid!]!
}

input CreateRfqInput {
  tenantId: ID!
  title: String!
  description: String
  targetBudget: Float!
  currency: String! = "USD"
  expirationDate: String!
  lineItems: [CreateRfqLineItemInput!]!
}

input CreateRfqLineItemInput {
  sku: String!
  partName: String!
  quantity: Int!
  targetUnitPrice: Float!
}
```

---

## 🔒 3. GraphQL Multi-Tenant Context Resolution

The GraphQL execution context receives the validated `tenantId` and `userContext` resolved by the API Gateway middleware pipeline:

```typescript
// apps/api-gateway/src/graphql/context.ts
import { Request } from 'express';

export interface GraphQLContext {
  tenantId: string;
  userId: string;
  userRoles: string[];
}

export function buildGraphQLContext({ req }: { req: Request }): GraphQLContext {
  return {
    tenantId: req.tenantId,
    userId: req.userId,
    userRoles: req.userRoles || [],
  };
}
```
