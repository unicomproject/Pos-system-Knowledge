<!-- title: Tenant Admin Add Product — Barcode & SKU Specification -->
<!-- status: SUPERSEDED REDIRECT STUB -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-20 -->
<!-- supersession: redirect_stub -->

# Tenant Admin Add Product — Barcode & SKU Specification

## SUPERSEDED AS STANDALONE GLOBAL STEP AUTHORITY (2026-09-11)

This file is retained so existing cross-document links do not break.

| Former claim | Current authority |
|---|---|
| Global **Step 5 — Barcode & SKU / SKU & Barcode** | **SUPERSEDED** — no longer a standalone stepper item |
| Identifier acquisition / scan / duplicate discovery | [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]] (**Step 1 — Scan Barcode**) |
| Final SKU & barcode assignment / domain rules | [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]] (**inside Step 3 Product Type & Configuration** for SIMPLE reuse of Step 1 barcode; VARIANT assigns per-variant SKU/Barcode in Step 3) |
| Decision | [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]] (6-step) and [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]] |

**TARGET ownership (6-step wizard):**
- **Step 1** owns: Primary Barcode acquisition (scan/validate/external lookup)
- **Step 3** owns: SKU/Barcode configuration context
  - SIMPLE: Reuse Step 1 Primary Barcode (do NOT re-scan)
  - VARIANT: Assign SKU/Barcode per sellable Variant

**Do not** implement a separate global wizard step named Barcode & SKU.

**Canonical 6-step wizard (TARGET — LOCKED 2026-09-20):**

1. Scan Barcode  
2. Basic Details  
3. Product Type & Configuration  
4. Pricing & Tax  
5. Product Tracking (Optional)  
6. Review & Create  

Historical detailed content that described standalone Step 5 UX was moved into the Identifier specification and Step 1 Scan Barcode specification. Prefer those documents for all new work.

> **CURRENT IMPLEMENTATION SNAPSHOT — TO BE VERIFIED IN CHUNK 3:** Legacy backend may route identifier finalization through the old Step 5 Product Configuration processor. Actual backend routing will be reconciled in Chunk 3.
