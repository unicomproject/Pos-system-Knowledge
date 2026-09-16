<!-- title: Product Setup Scanner-First Backend B7 External Lookup Endpoint Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Implementation evidence — Backend B7 only; no Flutter; no B8+ -->

# PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B7_EXTERNAL_LOOKUP_ENDPOINT_IMPLEMENTATION_2026-09-13

## Verdict

**BACKEND B7 EXTERNAL LOOKUP ENDPOINT COMPLETE — READY FOR B8 DRAFT BOOTSTRAP**

Flutter: **NOT TOUCHED**. B8+: **NOT IMPLEMENTED**.  
No production external product-data provider. Zero providers → **NO_MATCH**.  
No migration. No Git/GitHub operations.

## Locked contract (corrected 2026-09-13)

- **B4** owns tenant-local duplicate resolution (`FindBarcodeResolveMatchAsync` / resolve outcomes).
- **B7** performs **NO** tenant duplicate checking (TD-1 / Scan Spec §17.2 / PS1-T10).
- Same-GTIN race remains **later save/publish 409** authority — not B7.
- B7 persists nothing.

## Endpoint

- **Method / route:** `POST /api/v1/tenant-admin/products/barcodes/external-lookup`
- **Controller:** `TenantAdminProductsController.ExternalLookupBarcode`
- **Service:** `TenantAdminProductService.ExternalLookupBarcodeAsync`
- **Auth:** `catalog.products.create` + `product_catalog` via `ValidateProductSetupCreateAccessAsync`

### Request

`barcode` (string, required), optional `identifierStandard` hint.

### Response (`HTTP 200` `{ data: ... }` for business outcomes)

`status` = `FOUND` | `NO_MATCH` | `TEMPORARY_FAILURE`  
+ `suggestion?`, `sourceReference?`, `retryAllowed`

Invalid identifier → `product.validation_failed` (coordinator never called).

## Pipeline

1. Authorize  
2. `ProductBarcodeFormatValidator.Classify` (structural only)  
3. If invalid → validation failure (**not** NO_MATCH)  
4. `IExternalProductLookupCoordinator.LookupAsync`  
5. Project B6 result  

**Never:** `ResolveBarcodeAsync`, `FindBarcodeResolveMatchAsync`, catalogue ownership queries.

## Zero provider

`ExternalProductLookup:Providers: []` → B6 → **NO_MATCH** (200).

## Side effects

None — no Product/Variant/Barcode/Draft/ScanContext/Brand/Category/UOM/Media writes.

## B4 separation

`ResolveBarcodeAsync_NeverInvokesExternalCoordinator` proves B4 does not call B6.  
B4 outcomes unchanged: `VALID_LOCAL_MATCH` | `VALID_NO_LOCAL_MATCH` | `INVALID`.

## Tests

| Suite | Result |
|---|---|
| B7 unit (`ExternalLookupBarcodeAsync*`) | **8 passed** |
| Focused B3–B7 + policy | **108 passed** |
| CatalogProduct unit | **367 passed** |
| Full `E_POS.UnitTests` | **1747 passed, 0 failed** |
| B7 API (`ExternalLookupBarcode_*`) | **8 passed** (within resolve/SKU/external focused **21**) |
| CatalogProduct API | **102 passed** |
| Full `E_POS.ApiTests` | **554 passed, 0 failed** |
| CatalogProduct integration | **82 passed** |

## Source files

- `Dtos/TenantAdmin/ExternalLookupProductBarcodeDtos.cs`
- `ITenantAdminProductService` / `TenantAdminProductService.ExternalLookupBarcodeAsync`
- `TenantAdminProductsController` (`HttpPost("barcodes/external-lookup")`)
- Unit/API test updates

## Database

**NO NEW MIGRATION / NO NEW TABLE**

## Second Brain updated

SOT, checklist, gap matrix, API_ENDPOINTS, Barcode_Scanner_Integration, Architecture, Scan Spec §17.2 status, Feature Status Index, this audit.

## Remaining

B8 onward only.

## Git / GitHub

**NO GIT / GITHUB / BRANCH / COMMIT / PUSH / PULL / MERGE / REBASE / STASH / PR OPERATION PERFORMED**
