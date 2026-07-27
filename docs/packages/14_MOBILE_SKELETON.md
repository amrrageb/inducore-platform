# Package 14: Mobile Skeleton Specification (`/docs/packages/14_MOBILE_SKELETON.md`)

## 1. Overview
Defines cross-platform mobile application architecture for plant floor field engineers and mobile procurement officers.

## 2. Mobile Architecture Principles
- **Target Runtime**: React Native / Expo cross-platform framework.
- **Offline First**: Syncs local SQLite cache with backend API Gateway when connectivity is restored.
- **Push Telemetry Alerts**: Real-time alerts on equipment vibration/temperature threshold breaches.
- **Barcode & QR Scanner**: Enables field technicians to scan part SKUs directly into RFQ line items.

## 3. Mobile Package Placement
`/apps/mobile-app` workspace directory integrated with `@inducore/application` DTO schemas and REST API gateway client.
