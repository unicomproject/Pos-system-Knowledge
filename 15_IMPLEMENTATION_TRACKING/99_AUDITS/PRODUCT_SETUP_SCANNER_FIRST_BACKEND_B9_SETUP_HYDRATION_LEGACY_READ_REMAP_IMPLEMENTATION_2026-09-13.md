<!-- title: Product Setup Scanner-First Backend B9 Setup Hydration + Legacy Read Remap Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Implementation evidence — Backend B9 only; no Flutter; no B10+; no Git -->

# PRODUCT SETUP SCANNER-FIRST — BACKEND B9 SETUP HYDRATION + LEGACY READ REMAP (2026-09-13)

**BACKEND B9 SETUP HYDRATION + LEGACY READ REMAP COMPLETE — READY FOR B10 STEP 5 IDENTIFIER RECONCILIATION**

Flutter: **NOT TOUCHED**. B10+: **NOT IMPLEMENTED**.  
No Git/GitHub/branch/commit/push/pull/merge/rebase/stash/PR/tag/reset operations performed.

Authority: Technical Contract; D11; [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]] (WSM-5 B9 boundary).

---

## 1. Scope delivered

| Item | Result |
|---|---|
| Endpoint | Reused `GET /api/v1/tenant-admin/products/{id}/setup` |
| Controller | `TenantAdminProductsController.GetSetup` |
| Service | `TenantAdminProductService.GetSetupAsync` → `ValidateReadAccessAsync` → repo → `ScannerFirstSetupReadMapper.ApplyReadCompatibility` → `RedactSetup` |
| Repository | `TenantAdminProductRepository.GetSetupAsync` + `ProjectScanContextAsync` (typed prefill deserialize) |
| Read mapper | `ScannerFirstSetupReadMapper` (explicit semantic map; **not** reverse of `ScannerFirstWizardStageMapper`) |
| Detection | ScanContext row present (`setup.ScanContext != null`) → scanner-first; **no** legacy remap |
| Legacy | No ScanContext → map steps + `acquisitionMode = LEGACY` (no invented history) |
| DB mutation | **None** — GET `/setup` is **PURE READ** (no Product / step / ScanContext / barcode / SalesChannel / ProductChannelVisibility / PlatformSalesChannel writes) |
| Migration | **None** |

### Explicit legacy read map

| Old persisted | Public scanner-first |
|---|---|
| 1 | 2 |
| 2 | 3 |
| 3 | 4 |
| 4 | 5 |
| 5 | 5 |
| 6 | 6 |
| 7 | 7 |

### BUNDLE composition

1. Establish scanner-first vs legacy  
2. Legacy-remap current step if required  
3. `ResolveTargetSetupStep`: BUNDLE at public Units (4) → TargetSetupStep 5  

### DTO

`ProductSetupWizardDto.ScanContext` → `ProductSetupScanContextDto`  
(`acquisitionMode`, `candidateIdentifier`, `identifierStandard`, `symbologyHint`, `noBarcodeReason`, `externalLookupStatus`, `externalSourceReference`, `normalizedPrefill` as `ExternalProductSuggestion`, `generatedSkuCandidate`)

`BarcodeSkuAssignmentDto.IdentifierStandard` projected from primary barcode when present.

### Authorization (unchanged)

`ProductWizardAccessPolicy.ValidateReadAccessAsync`: view **OR** create **OR** update (+ baseline entitlement). Wrong tenant / missing product → `product.not_found` (404).

### Side effects

**NO WRITES**  
**NO B4 CALL**  
**NO B5 CALL**  
**NO B6 CALL**  
**NO B7 CALL**

GET path uses `FindPosAndOnlineChannelIdsAsync` + `ProjectSetupChannelVisibilityFlagsAsync` only (AsNoTracking).  
Missing POS/ONLINE **SalesChannel** or missing **ProductChannelVisibility** → in-memory canonical default `false` / `false` (same semantics as prior `GetChannelFlagsAsync` when visibility absent).  
**Does not** call write-path `ResolvePosAndOnlineChannelIdsAsync` (that helper still provisions on draft create/save only).  
Prefill is deserialized from stored JSON only. Corrupt prefill JSON → `null` prefill.

### Zero-write gap closure (2026-09-13 same-day)

| Item | Evidence |
|---|---|
| Removed GET mutation | `GetSetupAsync` no longer calls `ResolvePosAndOnlineChannelIdsAsync` / `SaveChanges` |
| Missing channels | Read-only fallback projection only — **no** SalesChannel / ProductChannelVisibility INSERT |
| Idempotent GET | Repeated GET leaves Product, channels, visibility, ScanContext, barcodes, variants, rowVersion, `current_setup_step` unchanged |
| Focused zero-write tests | `TenantAdminProductSetupZeroWriteRepositoryTests` — **6 passed** |

---

## 2. Tests

| Suite | Result |
|---|---|
| Focused zero-write GET setup | **6 passed** |
| Focused B9 unit (mapper + GetSetup service) | **30 passed** (within B8+B9 focused **51**) |
| Focused B9 integration (hydration + zero-write + B8 bootstrap filter) | **17 passed** combined B8/B9 setup filters |
| Focused B9 API (`GetSetup_*`) | **4 passed** |
| CatalogProduct Unit | **430 passed** |
| CatalogProduct API | **110 passed** |
| CatalogProduct Integration | **99 passed** |
| Full UnitTests | **1810 passed** |
| Full ApiTests | **562 passed** |

Failures: **none**.

---

## 3. Second Brain updated

- `00_START_HERE/Current_Source_Of_Truth.md` — B1–B9 IMPLEMENTED; B10+ PENDING  
- Module Product Core specs + Technical Contract + Architecture  
- `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md`  
- Checklist / Gap Matrix / Full Feature Status Index  
- Write-stage mapping decision footer  

---

## 4. Remaining

B10 Step 5 identifier persistence / reconciliation onward only.

---

## 5. Status line

`BACKEND B9 SETUP HYDRATION + LEGACY READ REMAP COMPLETE — READY FOR B10 STEP 5 IDENTIFIER RECONCILIATION`
