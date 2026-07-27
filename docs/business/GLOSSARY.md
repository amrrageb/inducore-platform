# Ubiquitous Language Glossary

This dictionary defines domain terms strictly agreed upon by domain experts, business owners, and software architects across the **InduCore** platform.

---

| Term | Domain Context | Definition |
| :--- | :--- | :--- |
| **RFQ (Request for Quotation)** | Procurement | A formal commercial solicitation emitted by a buyer inviting suppliers to submit competitive pricing and delivery lead times for a specified set of line items. |
| **Line Item** | Procurement / Inventory | A specific product, spare part SKU, or service entry within an RFQ or Purchase Order. |
| **Supplier Bid / Quotation** | Procurement | A binding financial and logistical offer submitted by a supplier responding to an active RFQ. |
| **Award / Purchase Order** | Procurement | A formal commercial confirmation selecting a winning supplier quote and emitting a Purchase Order for fulfillment. |
| **Bid Score** | Procurement / AI Engine | A normalized composite index (0–100) calculated from unit price competitiveness, lead time, supplier compliance rating, and geographic proximity. |
| **Tenant** | Identity / Platform | An isolated enterprise customer entity possessing dedicated logical database partitioning, custom branding, and RBAC permissions. |
| **Row-Level Security (RLS)** | Security / Platform | PostgreSQL security policy enforcing row-level access control based on the active session tenant context (`app.current_tenant_id`). |
| **BOM (Bill of Materials)** | Engineering / Inventory | A comprehensive structured list of raw materials, assemblies, components, and quantities required to manufacture an industrial asset. |
| **Telemetry Drift** | IoT / Maintenance | A statistically significant deviation in continuous equipment sensor readings indicating wear or impending component failure. |
| **Transactional Outbox** | Infrastructure | An architectural pattern that saves domain events into an `outbox_events` table within the same SQL transaction as aggregate updates to guarantee reliable message delivery. |
| **PPM (Parts Per Million)** | Quality Control | A metric measuring supplier defect rates calculated as defective parts divided by total delivered parts multiplied by 1,000,000. |
| **Escrow Settlement** | Marketplace | A trust service holding buyer funds in reserve until parts are delivered, inspected, and verified against technical specifications. |
| **SLA (Service Level Agreement)** | Operations | Guaranteed operational thresholds covering supplier response times, on-time delivery rates, and platform uptime availability. |
| **Gemini AI SDK (`@google/genai`)** | AI Engine | Google's official TypeScript SDK used server-side in InduCore to execute unstructured bid document parsing and intelligent multi-criteria scoring. |
