<!-- title: Product Setup Scanner-First Backend Phase 1 B1 B2 B3 Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-12 -->
<!-- type: Implementation evidence — Backend Phase 1 only; no Flutter; no B4+ -->

# PRODUCT_SETUP_SCANNER_FIRST_BACKEND_PHASE1_B1_B2_B3_IMPLEMENTATION_2026-09-12

## Verdict

**BACKEND PHASE 1 B1+B2+B3 COMPLETE — READY FOR B4 BARCODE RESOLVE**

Flutter: **NOT TOUCHED**. Resolve / external-lookup / sku-candidates endpoints: **NOT IMPLEMENTED**. Production/shared DB migration apply: **NOT CLAIMED**.

## Repository

- Root: `Unified-Commerce`
- Branch: `main`
- Unrelated dirty tree (controller moves / appsettings) left untouched

## Reuse matrix (executed)

| Capability | Owner | Action |
|---|---|---|
| Barcode format / GTIN checksum | `ProductBarcodeFormatValidator` | **EXTEND** (`Classify`, UNKNOWN, GTIN14 standard) |
| Product barcode entity | `ProductBarcode` | **EXTEND** (`IdentifierStandard`) |
| Initial tracking | `ProductSetupInitialTracking` + `20260824095742_...` | **REUSE** — not in B1 |
| Wizard access | `ProductWizardAccessPolicy` | **EXTEND** create/barcode helpers |
| Permissions | `ProductConstants` + `TenantPermissionAliases` | **REUSE** |
| Entitlement | `PlatformTenantFeatureCodes.ProductCatalog` | **REUSE** |
| Scan context | — | **NEW** entity/config/migration |

## B1 Database

Migration: `20260912085454_AddProductSetupScannerIdentifierContext`

Changes:
- `product_barcodes.identifier_standard` nullable varchar(40) + CHECK (`GTIN8|GTIN12|GTIN13|GTIN14|OTHER` or NULL)
- `product_setup_scan_context` 1:1 `(tenant_id, product_id)` unique; CASCADE to products; acquisition_mode CHECK; no_barcode_reason CHECK
- `UNKNOWN` symbology via validator CanonicalTypes (barcode_type remains varchar; **no** GTIN14/ITF14/EAN14 as symbology)
- Preserved `uq_product_barcodes_tenant_id_barcode`
- Verified `20260824095742_AddProductSetupInitialTracking` exists; **not** recreated

Local/dev/prod apply: **not performed** in this phase. Model compiles; snapshot updated.

## B2 Permissions

- Canonical codes already seeded (`catalog.products.create`, `catalog.barcodes.manage`, …)
- Alias expand: `tenant.products.*` → `catalog.*` via `TenantPermissionAliases` / `TenantRequestContext.HasPermission`
- Entitlement: `product_catalog` only (not `product_management`)
- New policy methods: `ValidateProductSetupCreateAccessAsync`, `ValidateBarcodeManageAccessAsync`

## B3 Identifier validator

- Location: `E_POS.Application/.../Validators/ProductBarcodeFormatValidator.cs`
- Result: `ProductIdentifierValidationResult`
- Responsibilities: classify/validate only — no DB, no duplicate lookup, no provider
- GTIN mod-10 for 8/12/13/14; leading zeros preserved; standard ≠ symbology

## Tests

Focused filter: **52 passed** (validator + policy + scan context + Step5 CanonicalTypes).  
CatalogProduct filter: **301 passed**.  
Full `E_POS.UnitTests`: **1681 passed, 0 failed**.

## Remaining

B4 resolve → B5 SKU candidate → B6–B7 external → B8 draft bootstrap → B9 remap → B10 Step5 wire → B11 publish → B12 tests. Flutter F1+.

## Flutter status

**NOT TOUCHED IN THIS PHASE**
