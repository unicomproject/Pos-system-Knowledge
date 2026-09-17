<!-- title: Product Setup Scanner-First Backend B5 SKU Candidate Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-12 -->
<!-- type: Implementation evidence — Backend B5 only; no Flutter; no B6+ -->

# PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B5_SKU_CANDIDATE_IMPLEMENTATION_2026-09-12

> **HISTORICAL B5 IMPLEMENTATION EVIDENCE.** The `SKU-{STEM}` / `SKU-NB`,
> `reserved=false`, no-sequence behavior below accurately records 2026-09-12.
> It is superseded for `NO_BARCODE_PRODUCT` by
> [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SKU_AUTO_GENERATION_CANONICAL_DECISION_2026-09-14]].
> Do not rewrite the historical counts or claim the old formatter is current.

## Verdict

**BACKEND B5 SKU CANDIDATE COMPLETE — READY FOR B6 EXTERNAL PROVIDER ABSTRACTION**

Flutter: **NOT TOUCHED**. B6+ (external provider / lookup / draft bootstrap / remapper / Step 5 identifiers / publish revalidation): **NOT IMPLEMENTED**.  
No migration. No sequence burn. No reservation. No Git/GitHub operations.

## Repository

- Root: `c:\Users\user\Desktop\E-Pos\Unified-Commerce`
- Work performed in Backend source, Backend tests, and Second Brain tracking only

## Prerequisite gate (verified before B5)

| Item | Evidence |
|---|---|
| B1 scan-context + identifier_standard | Prior Phase 1 / B4 audits |
| B2 `ValidateProductSetupCreateAccessAsync` + `product_catalog` | `ProductWizardAccessPolicy` |
| B3 barcode classify | `ProductBarcodeFormatValidator` |
| B4 barcodes/resolve | B4 audit |
| `TenantAdminProductsController` / `TenantAdminProductService` | Present |
| SKU uniqueness owner | `product_variants.sku` via `ITenantAdminProductRepository.SkuExistsAsync` (tenant-scoped, EF `==`, excludes Archived) |
| No dedicated SKU sequence | `ICodeSequenceRepository` has no SKU key — preview must not call `GetNextCodeAsync` |

## Existing SKU assets reused

| Capability | Owner | Reusable? | Extension |
|---|---|---|---|
| Uniqueness query | `TenantAdminProductRepository.SkuExistsAsync` | Yes | None |
| Step 5 conflict scan | `FindSkuConflictsAsync` | Not needed for B5 | — |
| Sequence / reservation | None for SKU | N/A | Do **not** invent reservation table |
| Formatting for preview | No prior non-mutating SKU preview helper | New `ProductSkuCandidateGenerator` | Aligns to max length 100 + Ordinal uniqueness; format `SKU-{STEM}` / `SKU-NB` + `-2…` |

Draft product-code path (`DRF-{guid}`) intentionally **not** reused for sellable SKU candidates.

## Endpoint

- **Method / route:** `POST /api/v1/tenant-admin/products/sku-candidates/generate`
- **Controller:** `TenantAdminProductsController.GenerateSkuCandidate` (thin; no Sku/Scanner controller)
- **Auth:** `catalog.products.create` + entitlement `product_catalog` via `ValidateProductSetupCreateAccessAsync`
- **Side effects:** none (no SaveChanges, Product, Variant, Draft, scan-context, reservation, sequence, audit mutation, external network)

### Request

```json
{ "purpose": "NO_BARCODE_PRODUCT", "productName": "House Lemon Juice" }
```

- Required: `purpose` (`NO_BARCODE_PRODUCT` only; unsupported → `product.validation_failed`)
- Optional: `productName` (null / empty / whitespace → stem `NB`)
- Tenant from auth context only

### Response (`HTTP 200` `{ data: ... }` envelope)

```json
{ "candidate": "SKU-HOUSELEMONJUICE", "reserved": false }
```

`reserved` **always** `false`. Candidate is best-effort currently unused; Step 5 + DB unique remain authoritative (non-reservation race acceptable).

## Candidate algorithm

1. Authorize create access  
2. Validate purpose  
3. `BuildBaseCandidate(productName)` → `SKU-` + A–Z0–9 stem (uppercase) or `SKU-NB`; truncate to **100**  
4. Attempt 0..31: `BuildCandidate` (attempt 0 = base; 1 → `-2`; 2 → `-3`; …)  
5. `SkuExistsAsync(tenantId, candidate)` — skip if exists  
6. First free → success with `reserved: false`  
7. Exhausted → `product.sku_candidate_exhausted`

No persistent sequence advancement. No write path.

## Tenant uniqueness

- Owner: `product_variants.sku`  
- Predicate: same tenant, exact SKU equality (matches Step 5 Ordinal / EF `==`), status ≠ Archived  
- Cross-tenant: other tenant’s SKU does not block / does not disclose  

## Source files

| Layer | Path |
|---|---|
| DTOs | `src/E_POS.Application/.../Dtos/TenantAdmin/GenerateSkuCandidateDtos.cs` |
| Generator | `src/E_POS.Application/.../Validators/ProductSkuCandidateGenerator.cs` |
| Contract | `ITenantAdminProductService.GenerateSkuCandidateAsync` |
| Service | `TenantAdminProductService.GenerateSkuCandidateAsync` |
| Controller | `TenantAdminProductsController` (`HttpPost("sku-candidates/generate")`) |
| Uniqueness (existing) | `TenantAdminProductRepository.SkuExistsAsync` |

## Tests

| Suite | Result |
|---|---|
| B5 unit (`ProductSkuCandidateGenerator*` + `GenerateSkuCandidateAsync*`) | **17 passed** |
| Focused unit (B5 + B4 resolve + policy + barcode format) | **75 passed** |
| CatalogProduct unit filter | **331 passed** |
| Full `E_POS.UnitTests` | **1711 passed, 0 failed** |
| B5 API controller tests | **6 passed** |
| CatalogProduct API filter | **94 passed** |
| Full `E_POS.ApiTests` | **546 passed, 0 failed** |
| B5 InMemory integration (`TenantAdminProductSkuCandidateRepositoryTests`) | **4 passed** |
| CatalogProduct integration filter | **82 passed** |

Failure classification during this run: **none** (0 failed across suites above).

## Database changes

**NO NEW MIGRATION / NO NEW TABLE**

## Second Brain updated

- `15_IMPLEMENTATION_TRACKING/PRODUCT_SETUP_SCANNER_FIRST_FINAL_IMPLEMENTATION_CHECKLIST_2026-09-12.md` — B5 IMPLEMENTED  
- `15_IMPLEMENTATION_TRACKING/PRODUCT_SETUP_SCANNER_FIRST_FINAL_GAP_MATRIX_2026-09-12.md` — SKU candidate → IMPLEMENTED  
- `00_START_HERE/Current_Source_Of_Truth.md` — B1–B5 COMPLETE  
- `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md` — sku-candidates → IMPLEMENTED B5  
- `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md` — status row  
- This audit file

## Explicit non-goals (still pending)

B6 external provider abstraction · B7 external lookup · B8 draft bootstrap / scan-context write · B9 hydration/remap · B10 Step 5 identifier persistence · B11 publish revalidation · Flutter Step 1

## Git / GitHub

**NO GIT / GITHUB / BRANCH / COMMIT / PUSH / PR OPERATION PERFORMED**
