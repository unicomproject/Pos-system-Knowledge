<!-- title: Tenant Admin Add Product — Barcode & SKU Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-11 -->
<!-- supersession: redirect_stub -->

# Tenant Admin Add Product — Barcode & SKU Specification

## SUPERSEDED AS STANDALONE GLOBAL STEP AUTHORITY (2026-09-11)

This file is retained so existing cross-document links do not break.

| Former claim | Current authority |
|---|---|
| Global **Step 5 — Barcode & SKU / SKU & Barcode** | **SUPERSEDED** — no longer a standalone stepper item |
| Identifier acquisition / scan / duplicate discovery | [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]] (**Global Step 1**) |
| Final SKU & barcode assignment / domain rules | [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]] (**inside Global Step 5 Product Configuration**) |
| Decision | [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]] |

**Do not** implement a separate global wizard step named Barcode & SKU.

Canonical global wizard:

1. Scan Barcode  
2. Basic Details  
3. Product Type & Tracking  
4. Unit & Pack Conversion  
5. Product Configuration  
6. Pricing & Tax  
7. Review & Create  

Historical detailed content that described standalone Step 5 UX was moved into the Identifier specification and Step 1 Scan Barcode specification. Prefer those documents for all new work.
