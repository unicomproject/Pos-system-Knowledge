<!-- title: Product Setup Scanner-First Backend Final Gap Audit B11-B12 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Backend-only gap audit before B11/B12 coding -->

# PRODUCT SETUP SCANNER-FIRST BACKEND FINAL GAP AUDIT (B11–B12) — 2026-09-13

**Scope:** Backend only. Flutter NOT IN SCOPE.  
**Pre-coding expected truth:** B1–B10 IMPLEMENTED · B11+ PENDING  

## Gap matrix

| Requirement | Second Brain | Backend | API | DB | Permission | Tests | Action |
|---|---|---|---|---|---|---|---|
| B3 Classify | DOC | IMPLEMENTED | n/a | n/a | n/a | PASS | REUSE |
| B4 Resolve | DOC | IMPLEMENTED | IMPLEMENTED | product_barcodes | create+catalog | PASS | REUSE |
| B5 SKU candidate | DOC | IMPLEMENTED | IMPLEMENTED | none | create+catalog | PASS | REUSE |
| B6 Provider coord | DOC | IMPLEMENTED | n/a | n/a | secrets BE | PASS | REUSE; zero providers → NO_MATCH |
| B7 External lookup | DOC | IMPLEMENTED | IMPLEMENTED | none | create+catalog | PASS | REUSE; no local dup |
| B8 Draft bootstrap | DOC | IMPLEMENTED | IMPLEMENTED | scan_context | create | PASS | REUSE |
| B9 GET setup PURE READ | DOC | IMPLEMENTED | IMPLEMENTED | n/a | view\|create\|update | PASS | REUSE |
| B10 Step 5 composite IDs | DOC | IMPLEMENTED | PUT draft | variants.sku / barcodes | barcodes.manage | PASS | REUSE |
| Publish reload from DB | DOC | IMPLEMENTED | POST publish | products | publish | MISSING dedicated | REUSE |
| Publish atomic TX | DOC | IMPLEMENTED | POST publish | — | publish | MISSING | REUSE |
| Publish pricing/tax gate | DOC | IMPLEMENTED | — | pricing/tax | publish | PARTIAL | REUSE |
| Publish initial tracking | DOC | IMPLEMENTED | — | tracking | inventory_tracking | PARTIAL | REUSE |
| No B5/B6/B7 on publish | DOC | IMPLEMENTED | — | — | — | — | PRESERVE |
| Final SKU revalidation at publish | DOC B11 | **MISSING** | POST publish | variants.sku | publish | **MISSING** | **IMPLEMENT** |
| Final barcode Classify+ownership at publish | DOC B11 | **MISSING** | POST publish | product_barcodes | publish | **MISSING** | **IMPLEMENT** |
| expectedRowVersion on ReviewCreate | DOC | **PARTIAL** | request field ignored on stage 7 | row_version | — | **MISSING** | **IMPLEMENT** |
| Already-published gate | DOC | **MISSING** | — | status | — | **MISSING** | **IMPLEMENT** (preserve canonical if any) |
| Brand/Category ACTIVE at publish | DOC | **PARTIAL** (BasicDetails only) | — | masters | — | — | **EXTEND** narrowly |
| Bundle publish graph recheck | DOC | **MISSING**/limited | — | combos | — | — | Document; use existing eligibility only — no invent |
| Duplicate Product Data API | UX optional | Existing list duplicate is Flutter-side | — | — | create | — | NOT invent unless SB requires |
| B12 closure docs/tests | DOC | PENDING | — | — | — | PENDING | AFTER B11 green |

## Coding scope (this task)

1. B11 publish-time identifier revalidation (SKU + barcode Classify + ownership)  
2. Enforce `expectedRowVersion` on ReviewCreate/publish branch  
3. Already-published behavior (inspect SetPublished; add DRAFT-only gate if no idempotent contract)  
4. Narrow Brand/Category ACTIVE recheck at publish  
5. Focused B11 tests + regress B3–B10  
6. B12 Second Brain closure  

**NO NEW MIGRATION / TABLE expected.**
