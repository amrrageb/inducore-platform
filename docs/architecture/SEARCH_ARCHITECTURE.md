# Search Architecture & Full-Text Indexing Specification

## 1. Executive Summary

The **InduCore Search Architecture** provides multi-tenant, high-performance search across thousands of commercial RFQs, spare part SKUs, technical specifications, and verified supplier profiles.

To avoid introducing heavy external search infrastructure during initial phases while maintaining strict ACID compliance and tenant isolation, InduCore leverages **PostgreSQL Native Full-Text Search (FTS)** combined with **Trigram Similarity Extensions (`pg_trgm`)** and **Generalized Inverted Indexes (GIN)**.

---

## 🔍 2. Search Index Architecture & Schema Design

```
+---------------------------------------------------------------------------------------------------+
|                                 Multi-Tenant Search Index Flow                                    |
+---------------------------------------------------------------------------------------------------+
|  1. Input Search Query: "Siemens 15kW Motor Vibration Sensor"                                     |
|  2. Sanitize & Tokenize: `websearch_to_tsquery('english', 'Siemens & 15kW & Motor & Sensor')`     |
|  3. SQL Query Execution:                                                                          |
|     SELECT id, title, ts_rank(search_vector, query) AS rank                                      |
|     FROM rfqs, websearch_to_tsquery('english', 'Siemens Motor') query                            |
|     WHERE tenant_id = 'tenant-uuid-1234' AND search_vector @@ query                               |
|     ORDER BY rank DESC LIMIT 20;                                                                  |
+---------------------------------------------------------------------------------------------------+
```

---

## 🗄️ 3. Full-Text Search Vector Integration

Every search-enabled table includes a generated `search_vector` column populated automatically via PostgreSQL triggers:

```sql
-- 1. Enable trigram extension for fuzzy SKU matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add search vector to RFQs table
ALTER TABLE rfqs ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

-- 3. Create GIN index for full-text search
CREATE INDEX idx_rfqs_search ON rfqs USING GIN (search_vector);

-- 4. Create trigram index for fuzzy part number matching
CREATE INDEX idx_rfqs_title_trgm ON rfqs USING GIN (title gin_trgm_ops);
```

---

## 🎯 4. Multi-Tenant Search Security Invariants

1. **Mandatory Tenant Predicate**: Every search query MUST include `tenant_id = current_setting('app.current_tenant_id')` as its primary filtering clause.
2. **GIN Composite Indexing**: Composite indexes on `(tenant_id, search_vector)` guarantee sub-10ms query execution across multi-gigabyte datasets.
3. **Relevance Ranking**: Search results are ranked using `ts_rank_cd()` weighted by field importance (Title = Weight A, Line Item SKU = Weight B, General Description = Weight C).

---

## 📊 5. Faceted Filtering Matrix

The search architecture supports multi-criteria faceted queries:
- **Status Facet**: `DRAFT`, `OPEN`, `EVALUATING`, `AWARDED`.
- **Date Window Facet**: Created date range, expiration deadline range.
- **Budget Facet**: Min/Max target price slider.
- **Supplier Rating Facet**: Minimum supplier ISO qualification score.
