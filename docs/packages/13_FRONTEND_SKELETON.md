# Package 13: Frontend Skeleton Specification (`/docs/packages/13_FRONTEND_SKELETON.md`)

## 1. Overview
Defines frontend web portal skeleton (`apps/web-portal` and `/src/` SPA views).

## 2. Frontend Structure
- **`src/App.tsx`**: Main SPA shell with tab navigation (Procurement, IoT Telemetry, ISO Audit Trail).
- **`src/components/Header.tsx`**: Sticky header navigation with brand indicator and tenant badge.
- **`src/components/RFQManagementView.tsx`**: Procurement dashboard, RFQ list, creation modal, and AI trigger button.
- **`src/components/AIEvaluationModal.tsx`**: Gemini AI scoring breakdown modal.
- **`src/components/TelemetryView.tsx`**: IoT plant sensor readings and threshold status.
- **`src/components/AuditTrailView.tsx`**: Immutable ISO compliance event log display.
