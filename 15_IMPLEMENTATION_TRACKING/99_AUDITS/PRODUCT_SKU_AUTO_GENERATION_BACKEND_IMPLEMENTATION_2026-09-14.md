<!-- title: Product SKU Auto Generation Backend Implementation -->
<!-- status: Implemented -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-14 -->

# Product SKU Auto Generation Backend Implementation — 2026-09-14

## Scope and result

Implemented the Step 1 no-barcode AUTO SKU lifecycle defined by
[[../../13_DECISIONS_AND_CHANGES/PRODUCT_SKU_AUTO_GENERATION_CANONICAL_DECISION_2026-09-14]].
Flutter and barcode behavior were not changed.

| Capability | Before | Target | Source change | Tests | Status |
|---|---|---|---|---|---|
| Step 1 base | `SKU-{name stem}`, non-reserved | `{CATEGORY_CODE}-{TENANT_SEQUENCE:000000}` | Existing generate route/DTO/service/generator extended | Unit + API | PASS |
| Category authority | Product name stem | Persisted `categories.category_code` by `categoryId` | Repository resolves active/effectively selectable Category | Unit | PASS |
| Tenant sequence | None | Atomic tenant-wide sequence, no annual/outlet reset | Existing `tenant_user_code_sequences`; `sequence_type=PRODUCT_SKU`, `year=0`; PostgreSQL `INSERT … ON CONFLICT … RETURNING` | Real PostgreSQL concurrent/tenant-isolation test | PASS |
| Draft stability | Preview string | Stable Product base in existing scan context | Reuse `product_setup_scan_context.generated_sku_candidate`; GET setup remains read-only | Integration | PASS |
| SIMPLE | Manual final SKU | Base unchanged | Composite Step 5 server finalization | Integration | PASS |
| VARIANT | Manual rows | Base + ordered `product_option_values.value_code` | Option `sort_order`, then `option_code`; one base for all variants | Integration, 4 combinations | PASS |
| MANUAL | Existing | Never overwrite explicit MANUAL | Optional `barcodeSkuConfiguration.skuMode`; heuristic compatibility | Unit/B10 regression | PASS |
| Category change | Undefined | Reject stale base; explicit regenerate | Same generate route accepts `productId` + `expectedRowVersion` and replaces scan-context base | Unit + integration | PASS |
| Duplicate Product | SKUs cleared; no scan context copied | New explicit generation required | Existing duplicate behavior retained | Existing regression | PASS |
| Publish | Persisted identifier validation | No sequence allocation; validate final SKUs | Existing B11 path unchanged | B11 unit/repository regression | PASS |
| Barcode | Existing B10 rules | Unchanged | AUTO path strips only submitted SKU before barcode persistence | B10 regression | PASS |

## Exact implementation

- Product base: `ProductSkuCandidateGenerator.BuildProductBase`.
- Variant final: `ProductSkuCandidateGenerator.BuildVariantSku`.
- API: `POST /api/v1/tenant-admin/products/sku-candidates/generate`.
- Request: `purpose`, required `categoryId`, `mode=AUTO`; optional
  `productId` + required `expectedRowVersion` for an existing no-barcode DRAFT.
- Response: `{ candidate, reserved: true }`.
- Base draft owner: `product_setup_scan_context.generated_sku_candidate`.
- Final owner: `product_variants.sku`.
- Final uniqueness: existing partial unique index
  `uq_product_variants_tenant_id_sku`.
- Permissions: existing `catalog.products.create` + `product_catalog`;
  existing Step 5 identifier gate remains unchanged.

## Database

Migration: **NO**.

The existing scan-context column is sufficient for stable base persistence, and
the existing atomic sequence table supports a distinct Product sequence type.
No Product SKU column, Variant Value code column, index, or ownership table was
added.

## Backend files changed

- `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductSetupScanContext.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Contracts/ITenantAdminProductRepository.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Dtos/TenantAdmin/GenerateSkuCandidateDtos.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Dtos/TenantAdmin/SaveProductDraftCommand.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Dtos/TenantAdmin/TenantAdminProductWizardDtos.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/TenantAdminProductService.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Validators/ProductSkuCandidateGenerator.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Validators/TenantAdminProductRequestValidator.cs`
- `src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Repositories/TenantAdminProductRepository.Wizard.cs`

## Tests changed

- `tests/E_POS.UnitTests/CatalogProduct/ProductSkuCandidateGeneratorTests.cs`
- `tests/E_POS.UnitTests/CatalogProduct/TenantAdminProductServiceTests.cs`
- `tests/E_POS.UnitTests/CatalogProduct/TenantAdminProductDraftServiceTests.cs`
- `tests/E_POS.UnitTests/CatalogProduct/TenantAdminProductScannerStep5ServiceTests.cs`
- `tests/E_POS.ApiTests/CatalogProduct/TenantAdminProductsControllerTests.cs`
- `tests/E_POS.IntegrationTests/CatalogProduct/TenantAdminProductScannerStep5RepositoryTests.cs`
- `tests/E_POS.IntegrationTests/AccessControl/TenantUserStaffCodePostgreSqlTests.cs`

## Validation evidence

| Suite | Result |
|---|---|
| Build `E_POS.sln --no-restore` | PASS; 0 errors |
| Focused AUTO SKU Unit | 20/20, then regeneration set 10/10 |
| Focused API | 6/6 |
| SIMPLE + VARIANT Step 5 repository | 7/7 before stale-category addition; current CatalogProduct integration included below |
| PostgreSQL concurrent Product sequence | 1/1 |
| CatalogProduct Unit | 453/453 |
| CatalogProduct API | 110/110 |
| CatalogProduct + Product sequence Integration | 109/109 |
| B10 focused Unit | 9/9 |
| B11 focused Unit | 8/8 |
| B11 publish repository | 1/1 |
| Full UnitTests | 1,834/1,834 |
| Full ApiTests | 562/562 |
| Full IntegrationTests | 704 passed, 1 skipped, 1 failed (706 total) |

The full Integration failure is outside Catalog/SKU:
`TenantAdminBootstrapPermissionProjectionTests.Resolve_PosProductOutletTill_GrantsCashierTemplateWithoutOnlineStoreOrInventory`
expected `pos.payments.card.accept` to be absent. No AUTO SKU source participates
in that test. The complete CatalogProduct/PostgreSQL regression set is green.

## Remaining SKU gaps

None in the requested backend scope. Flutter must adopt the documented request
and display contract in a separate task. BUNDLE AUTO formula remains outside
scope.

## Source control

No Git/GitHub/branch/commit/push/pull/merge/rebase/stash/PR/tag/reset operation
was performed.

## Final status

**ONEVERZ PRODUCT-TYPE-AWARE AUTO SKU BACKEND COMPLETE — SECOND BRAIN SYNCHRONIZED**
