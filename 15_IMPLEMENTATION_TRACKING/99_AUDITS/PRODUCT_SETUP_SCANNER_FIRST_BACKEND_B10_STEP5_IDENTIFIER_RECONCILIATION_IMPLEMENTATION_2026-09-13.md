<!-- title: Product Setup Scanner-First Backend B10 Step 5 Identifier Reconciliation Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Implementation evidence — Backend B10 only; no Flutter; no B11; no Git -->

# PRODUCT SETUP SCANNER-FIRST — BACKEND B10 STEP 5 IDENTIFIER RECONCILIATION (2026-09-13)

**BACKEND B10 STEP 5 IDENTIFIER RECONCILIATION COMPLETE — READY FOR B11 PUBLISH REVALIDATION**

Flutter: **NOT TOUCHED**. B11+: **NOT IMPLEMENTED**.  
No Git/GitHub/branch/commit/push/pull/merge/rebase/stash/PR/tag/reset operations performed.

---

## 1. Scope

Scanner-first Global Step 5 = Product Configuration **+** final SKU/barcode (SPECIAL/COMPOSITE).  
Legacy without ScanContext: stage 4 = ProductConfiguration only; stage 5 = BarcodeSku only.

## 2. Architecture

| Layer | Owner |
|---|---|
| Endpoint | `PUT /api/v1/tenant-admin/products/{id}/draft` (existing) |
| Service | `TenantAdminProductService.SaveOrUpdateDraftAsync` |
| Mapper | `ScannerFirstWizardStageMapper` Step 5 → `ProductWizardStage.ProductConfiguration` + `isSpecialComposite` |
| Command flag | `SaveProductDraftCommand.ApplyCompositeStep5Identifiers` |
| Repository | `SaveProductDraftAsync` ProductConfiguration branch applies `ApplyBarcodeSkuConfigurationAsync` in same TX before single `SaveWizardDraft` |
| Transaction | Existing `BeginTransactionAsync` / single `SaveChangesAsync` |

## 3. Contracts

| Concern | Behavior |
|---|---|
| SIMPLE/BUNDLE | Default sellable variant SKU required (Continue); barcode optional; ensure default variant if missing |
| VARIANT | Per included/sellable variant SKU required on Continue; optional barcode; no fan-out |
| SKU owner | `product_variants.sku` |
| Barcode owner | `product_barcodes` (+ `identifier_standard` via Classify) |
| Candidate vs final | ScanContext candidate never auto-finalized; only Step 5 assignment creates ProductBarcode |
| ScanContext | Acquisition history preserved (not rewritten on identifier change) |
| Save Draft | public step stays **5** |
| Save & Continue | public step → **6** (Pricing & Tax) |
| Status | **DRAFT** — no publish |
| Side effects | No B4 HTTP / B5 generate / B6 / B7 calls |

## 4. Reconciliation

Create / update / soft-delete (clear optional barcode) / idempotent repeat; tenant uniqueness via `FindSkuConflictsAsync` / `FindBarcodeConflictsAsync`; DB unique → `product.duplicate_sku` / `product.duplicate_barcode`.

## 5. Tests

| Suite | Result |
|---|---|
| Focused B10 unit (composite service) | **5 passed** |
| Focused B10 integration | **5 passed** |
| CatalogProduct Unit | **435 passed** |
| CatalogProduct API | **110 passed** |
| CatalogProduct Integration | **104 passed** |
| Full UnitTests | **1815 passed** |
| Full ApiTests | **562 passed** |

Failures: **none**.

## 6. Database

**NO NEW MIGRATION**  
**NO NEW TABLE**

## 7. Remaining

B11 publish revalidation onward only.

## 8. Status line

`BACKEND B10 STEP 5 IDENTIFIER RECONCILIATION COMPLETE — READY FOR B11 PUBLISH REVALIDATION`
