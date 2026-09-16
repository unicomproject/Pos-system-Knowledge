<!-- title: Product Setup Scanner-First Backend B8 Draft Bootstrap + Scan Context Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Implementation evidence — Backend B8 only; no Flutter; no B9+; no Git -->

# PRODUCT SETUP SCANNER-FIRST — BACKEND B8 DRAFT BOOTSTRAP + SCAN CONTEXT (2026-09-13)

**BACKEND B8 DRAFT BOOTSTRAP + SCAN CONTEXT COMPLETE — READY FOR B9 SETUP HYDRATION + LEGACY REMAP**

Flutter: **NOT TOUCHED**. B9+: **NOT IMPLEMENTED**.  
No Git/GitHub/branch/commit/push operations performed.

Authority: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]] (`persist_2_plus_write_map`).

---

## 1. Scope delivered

| Item | Result |
|---|---|
| Route | Reused `POST /api/v1/tenant-admin/products/draft` |
| Request | Nested `SaveProductDraftRequest.ScanBootstrap` (`ProductSetupScanBootstrapRequest`) |
| Persist | `products.current_setup_step = 2` (Basic Details public semantics) |
| Internal processor | Routes create through `ProductWizardStage.BasicDetails = 1` via mapper |
| Constants | **Not** globally renumbered |
| Atomicity | Product DRAFT + `product_setup_scan_context` in existing `SaveProductDraftAsync` transaction |
| Final identifiers | **No** `product_barcodes` row; **no** final `ProductVariant.sku` |
| Duplicate safety | Write-boundary via `FindBarcodeResolveMatchAsync` (B4 helper); **409** `product.duplicate_barcode` |
| B7 | Still **no** tenant duplicate checking |
| Migration | **None** |

---

## 2. Write-stage mapper

Class: `E_POS.Application...Services.ScannerFirstWizardStageMapper`

| Scanner API step | Legacy processor |
|---:|---|
| 2 | BasicDetails (1) |
| 3 | ProductTypeTracking (2) |
| 4 | UnitsPackConversion (3) |
| 5 | **SPECIAL/COMPOSITE** → ProductConfiguration (4); BarcodeSku also maps public→5; B10 owns identifier section |
| 6 | PricingTax (6) |
| 7 | ReviewCreate (7) |

Detection: create = `scanBootstrap != null`; subsequent = `HasScanContextAsync`; legacy without scan context = unchanged numbering.

---

## 3. Scan bootstrap contract

`ProductSetupScanBootstrapRequest`: `acquisitionMode`, `creationAction`, `candidateIdentifier`, `identifierStandard`, `symbologyHint`, `noBarcodeReason`, `externalLookupStatus`, `externalSourceReference`, `normalizedPrefill` (`ExternalProductSuggestion`), `generatedSkuCandidate`.

Normalizer: `ProductSetupScanBootstrapNormalizer` — validates modes/actions; classifies identifiers via `ProductBarcodeFormatValidator.Classify`; canonical external no-lookup = `NOT_STARTED`.

Actions: `USE_THIS_PRODUCT` | `CREATE_MANUALLY` | `CONTINUE_WITH_BARCODE` | `CONTINUE_TO_BASIC_DETAILS` (orchestration only — not a DB column).

---

## 4. Tests / regression (2026-09-13)

| Suite | Result |
|---|---|
| Focused B8 unit (mapper/normalizer/service) | **33 passed** |
| API SaveDraft_* | **4 passed** |
| Integration `TenantAdminProductScanBootstrapRepositoryTests` | **4 passed** |
| CatalogProduct Unit | **400 passed** |
| CatalogProduct API | **106 passed** |
| CatalogProduct Integration | **86 passed** |
| Full UnitTests | **1780 passed** |
| Full ApiTests | **558 passed** |

Failures: **none**. Classification: n/a.

---

## 5. Key source files

- `ScannerFirstWizardStageMapper.cs`
- `ProductSetupScanBootstrapDtos.cs` / `ProductSetupScanBootstrapNormalizer.cs`
- `TenantAdminProductService.SaveOrUpdateDraftAsync` (scanner routing + duplicate gate)
- `TenantAdminProductRepository.Wizard.cs` (ScanContext insert + TX duplicate recheck)
- `SaveProductDraftRequest.ScanBootstrap` / `SaveProductDraftCommand.ScanBootstrap`
- Tests: `ScannerFirstWizardStageMapperTests`, `ProductSetupScanBootstrapNormalizerTests`, `TenantAdminProductScanBootstrapServiceTests`, `TenantAdminProductScanBootstrapRepositoryTests`, API SaveDraft facts

---

## 6. Remaining

B9 GET `/setup` hydration + legacy read remap onward only. Step 5 composite identifier persistence = B10.

## 7. Status line

`BACKEND B8 DRAFT BOOTSTRAP + SCAN CONTEXT COMPLETE — READY FOR B9 SETUP HYDRATION + LEGACY REMAP`
