<!-- title: Product Setup Step 2–6 Backend Reality Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Reality audit — source-first; precedes gap closure -->

# PRODUCT_SETUP_STEP2_TO_STEP6_BACKEND_REALITY_AUDIT_2026-09-13

**Scope:** Unified-Commerce CatalogProduct draft wizard Steps 2–6 (scanner-first public numbering).  
**Flutter:** NOT IN SCOPE.  
**Git:** NOT PERFORMED.  
**Authority:** Live source + Second Brain contracts (7-Step, Draft Lifecycle, Architecture).  
**Write map:** `persist_2_plus_write_map` via `ScannerFirstWizardStageMapper`.

---

## 0. Write routing (shared)

| Requirement | SB status | Backend evidence | DB | Tests | Classification | Action |
|---|---|---|---|---|---|---|
| Public 2→proc BasicDetails(1); 3→Type(2); 4→Units(3); 5 SPECIAL→Config(4)+IDs; 6→Pricing(6); 7→Review(7) | LOCKED WSM | `ScannerFirstWizardStageMapper` | Persist **public** `current_setup_step` | `ScannerFirstWizardStageMapperTests` | **IMPLEMENTED** | None |
| Save Draft stays on public step; Continue advances | DOCUMENTED | `SaveOrUpdateDraftAsync` target step rules | `products.current_setup_step` | Bootstrap + draft service tests | **IMPLEMENTED** | None |
| VARIANT + Track Inventory ON → Step 4 REQUIRED | 7-Step Contract §Step4 matrix | `ResolveNextApplicableStage` **always skips Units for VARIANT** | n/a | **MISSING** routing matrix tests | **CONFLICT** | **FIX routing** |
| BUNDLE Step 4 NOT_APPLICABLE (advance + read) | DOCUMENTED | Advance skip + `ScannerFirstSetupReadMapper` target 5; **no hard write reject** | n/a | Read mapper tests | **PARTIAL** | Soft-skip OK; optional hard reject |
| Legacy no ScanContext remumber on GET | B9 | `ScannerFirstSetupReadMapper` | zero-write | Hydration/zero-write tests | **IMPLEMENTED** | None |

---

## 1. Step 2 — Basic Details

| Requirement | SB status (pre-audit) | Backend evidence | DB evidence | Test evidence | Classification | Action |
|---|---|---|---|---|---|---|
| Name, code, category, brand, descriptions, channels, media | Gap matrix PARTIAL | `SaveProductDraftRequest` + `UpdateWizardStep1Profile` + category/channel/media | `products`, `product_categories`, `product_channel_visibility`, media link | Draft validator; category inactive rules; access policy | **IMPLEMENTED** | Doc reconcile |
| Category ACTIVE/assignable; Brand ACTIVE; tenant scope | DOCUMENTED | `ActiveCategoryExistsAsync` / `BrandBelongsToTenantAsync` | masters | Service unit tests | **IMPLEMENTED** | None |
| External text ≠ auto-create masters | DOCUMENTED | Prefill editable only via bootstrap fields | scan_context JSON | B8 tests | **IMPLEMENTED** | None |
| Save Draft stay 2; Continue → 3 | DOCUMENTED | Scanner target step | `current_setup_step` | Bootstrap Step2 mapping | **IMPLEMENTED** | None |
| GET `/setup` PURE READ restore | B9 | `GetSetupAsync` | zero-write | Hydration suite | **IMPLEMENTED** | None |
| Publish masters revalidation | B11 | `ValidatePublishMastersAsync` | — | Publish unit tests | **IMPLEMENTED** | None |
| Permissions | Matrix | create/update + `product_catalog`; channels/media sanitize | — | `ProductWizardAccessPolicyTests` | **IMPLEMENTED** | None |

**Step 2 final:** **IMPLEMENTED** (stale PARTIAL labels only).

---

## 2. Step 3 — Product Type & Tracking

| Requirement | SB status | Backend evidence | DB | Tests | Classification | Action |
|---|---|---|---|---|---|---|
| SIMPLE / VARIANT / BUNDLE only | DOCUMENTED | `ProductStructureConstants` | `products.product_structure` | Validator | **IMPLEMENTED** | Doc reconcile |
| Tracking flags + combination rules | DOCUMENTED | `ProductTrackingRules`; BUNDLE forced off | `product_inventory_settings` | Validator + rules tests | **IMPLEMENTED** | None |
| Initial tracking | EXISTING | `ProductSetupInitialTrackingRules` + upsert | `product_setup_initial_tracking` | Rules + hydration | **IMPLEMENTED** | None |
| `inventory_tracking` entitlement | DOCUMENTED | Access policy payload gate | — | Policy tests | **IMPLEMENTED** | None |
| Continue routing structure-specific | DOCUMENTED | See §0 CONFLICT for VARIANT+Units | — | Missing matrix | **PARTIAL** until routing fix | **FIX** |
| GET restore structure/tracking/initial | DOCUMENTED | Setup DTO projection | — | Hydration | **IMPLEMENTED** | None |

**Step 3 final (post-routing fix):** **IMPLEMENTED**.

---

## 3. Step 4 — Unit & Pack Conversion

| Requirement | SB status | Backend evidence | DB | Tests | Classification | Action |
|---|---|---|---|---|---|---|
| SINGLE / MULTIPLE unit models; base/selling/purchase/outer; conversions | Gap matrix PENDING / EXTEND | `ApplyUnitsPackConversionAsync` + validators | `product_unit_settings`, `product_unit_conversions`, inventory UOM | `ProductUnitsPackConversionTests` | **IMPLEMENTED** (SIMPLE path) | Doc reconcile |
| ACTIVE tenant/platform UOM; positive factors | DOCUMENTED | Repo UOM lookup + validator | `unit_of_measures` | Validator matrix | **IMPLEMENTED** | None |
| BUNDLE skip | DOCUMENTED | Advance+read; no hard write reject | — | Read mapper | **PARTIAL** (soft) | Optional hard reject |
| VARIANT + Track ON visits Step 4 | REQUIRED by contract | Routing bug §0 | — | Missing | **CONFLICT** | **FIX routing** |
| GET restore units | DOCUMENTED | Setup projection | — | Mapper/hydration | **IMPLEMENTED** | None |
| Repo integ dedicated Step 4 draft | — | Path exists | — | Thin (create path stronger) | **STALE DOCUMENTATION** on “pending” | Doc only |

**Step 4 final (post-routing fix):** **IMPLEMENTED** for applicable structures; BUNDLE remains NOT_APPLICABLE by design.

---

## 4. Step 5 — Product Configuration (+ identifiers)

| Requirement | SB status | Backend evidence | DB | Tests | Classification | Action |
|---|---|---|---|---|---|---|
| SIMPLE identity-only + identifiers | PARTIAL labels | Default sellable + B10 composite | `product_variants`, `product_barcodes` | Scanner Step5 suites | **IMPLEMENTED** | Doc |
| VARIANT options/values/Cartesian/hash/tombstones/reconcile | PARTIAL labels | `VariantConfigurationCombinationGenerator`, SHA-256, `ProjectVariantConfigurationAsync`, max **100** (`ProductConstants.MaxVariants`) | options/values/variants/hashes | Variant reconciliation + calculator + Step5 | **IMPLEMENTED** | Doc |
| BUNDLE component graph | REQUIRED by 7-Step | Validators exist; **repo validation stubs return []**; **no draft persist** of `combo_*`; GET only counts | `combo_definitions` / `combo_components` schema exist unused on draft | Thin | **PARTIAL** | **Do not fake COMPLETE**; full graph = separate backend work |
| Identifiers B10 atomic composite | B10 DONE | `ApplyCompositeStep5Identifiers` same TX | barcodes + sku | Scanner Step5 | **IMPLEMENTED** | None (no rewrite) |
| Save Draft stay 5; Continue → 6 | DOCUMENTED | Service target step | — | Step5 tests | **IMPLEMENTED** | None |
| GET config + identifiers zero-write | B9 | Projectors | — | Hydration | **IMPLEMENTED** (BUNDLE graph missing) | Keep PARTIAL note |
| Explicit ExpectedRowVersion compare | Contract concurrency | Config **requires** RV but **does not compare** | `row_version` | Thin | **PARTIAL** | **FIX compare** |

**Step 5 final:** **PARTIAL** — SIMPLE/VARIANT+IDs complete; **BUNDLE component graph incomplete**.

---

## 5. Step 6 — Pricing & Tax

| Requirement | SB status | Backend evidence | DB | Tests | Classification | Action |
|---|---|---|---|---|---|---|
| SIMPLE cost/selling/discount + tax | PARTIAL labels | `ApplySimpleLikePricing` + tax assignments | `price_lists`, `price_list_items`, `product_tax_assignments`, `products.is_tax_exclusive` | PricingTax validators | **IMPLEMENTED** | Doc |
| VARIANT `variantPrices[]` | DOCUMENTED | `ApplyVariantPricingAsync`; Continue coverage | same | Validators + wizard create | **IMPLEMENTED** | Doc |
| ACTIVE tax; inclusive/exclusive; Continue requires taxClassId | DOCUMENTED | Tax rules; no omit-tax on Continue | tax tables | Validator | **IMPLEMENTED** (no-tax = assign exempt class) | Doc clarify |
| Save Draft stay 6; Continue → 7; no publish | DOCUMENTED | Target step | — | Service path | **IMPLEMENTED** | None |
| GET restore | DOCUMENTED | `ProjectPricingTaxAsync` | — | Setup | **IMPLEMENTED** | None |
| Publish pricing revalidation | B11 | `ValidatePublishPricingAsync` | — | Publish tests | **IMPLEMENTED** | None |
| Explicit ExpectedRowVersion | Contract | PricingTax branch **omits** require/compare | — | Missing | **PARTIAL** | **FIX** |

**Step 6 final (post-rowVersion fix):** **IMPLEMENTED**.

---

## 6. Permissions (live)

| Step | Baseline | Extra |
|---|---|---|
| 2–7 | `product_catalog` + `catalog.products.create`/`update` | — |
| 2 channels/media | sanitize without | `catalog.product_channels.manage` / `catalog.product_media.manage` |
| 3 advanced tracking / initial identity | — | `inventory_tracking` feature |
| 5 VARIANT | payload/stage | `catalog.variants.manage` |
| 5 BUNDLE payload | — | `catalog.combo_components.manage` |
| 5 identifiers | scanner step 5 / barcode payload | `catalog.barcodes.manage` |
| 6 | — | `catalog.product_pricing.manage` (+ cost view for cost) |
| 7 publish | — | `catalog.products.publish` + subgraph |

**Never** runtime-entitlement on `product_management`.

---

## 7. Real gaps to close in this task

1. **CONFLICT:** VARIANT + TrackInventory ON must Continue → Units (public 4), not skip to Config.  
2. **PARTIAL concurrency:** ProductConfiguration must compare `expectedRowVersion`; PricingTax must require + compare.  
3. **PARTIAL BUNDLE graph:** evidence-proven incomplete — **document only** (not a small extension; schema exists but draft path never writes).

## 8. Stale documentation only

- Gap Matrix Steps 2–4 / 6 “PARTIAL / pending” understating backend  
- Full Feature Status Index Units “DB/Backend pending”  
- Step 5 VARIANT “Backend PARTIAL” where VARIANT matrix is complete  

## 9. Out of scope (do not distort Step 2–6)

- Concrete external provider adapter  
- Duplicate Product API  
- Flutter scanner-first  
- Hardware acceptance  
- Prod migration apply  

## 10. Pre-code verdict summary

| Step | Classification |
|---|---|
| 2 Basic Details | **IMPLEMENTED** (STALE DOCUMENTATION) |
| 3 Type & Tracking | **IMPLEMENTED** after routing fix (**CONFLICT** now) |
| 4 Unit & Pack | **IMPLEMENTED** after routing fix; BUNDLE N/A |
| 5 Product Configuration | **PARTIAL** (BUNDLE graph) |
| 6 Pricing & Tax | **IMPLEMENTED** after rowVersion fix |

---

## 11. Post-closure code fixes (same day)

Applied after matrix:

1. `ProductWizardNextStageResolver` — VARIANT + TrackInventory ON → Units (align 7-Step matrix); BUNDLE still skips Units.
2. `TenantAdminProductRepository.Wizard` — ExpectedRowVersion require+compare on ProductConfiguration and PricingTax; BUNDLE Units write → `product.units_pack_not_applicable`.
3. Unit tests: `ProductWizardNextStageResolverTests`.

**Not closed here:** BUNDLE Step 5 `combo_*` draft persist / GET projection (still PARTIAL).
