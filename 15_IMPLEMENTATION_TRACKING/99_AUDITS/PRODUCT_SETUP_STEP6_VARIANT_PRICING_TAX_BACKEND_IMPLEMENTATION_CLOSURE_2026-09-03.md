# PRODUCT SETUP Step 6 — VARIANT Pricing & Tax BACKEND Implementation Closure

<!-- status: Active -->
<!-- last_updated: 2026-09-03 -->

**Scope:** Backend only (Unified-Commerce).  
**Did NOT:** Flutter UI, migrations, parallel Pricing module, Bundle pricing, Tax Management rewrite.

Canonical authority: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]] §6.1–6.5  
Second Brain readiness: [[PRODUCT_SETUP_STEP6_PRICING_TAX_SIMPLE_VARIANT_SECOND_BRAIN_CLOSURE_2026-09-03]]

---

## 1. Second Brain authorities read

- `Current_Source_Of_Truth.md` (Step 6 lock)
- Backend engineering standards / reusable governance / feature workflow templates
- Product 7-Step §6.1–6.5; Variant Configuration §8; Pricing Functional/Technical; Tax Management Canonical
- SIMPLE Step5/Step6 closure; Tax Management backend closure; Step 6 SB closure
- API_ENDPOINTS Step 6 note; Permission matrix §12; Step 6 QA cases; Review Create

## 2. Backend files audited

DTOs, `TenantAdminProductService`, `TenantAdminProductRequestValidator`, `TenantAdminProductRepository.Wizard(.Create)`, `PriceListItem` / `ProductTaxAssignment`, TaxRateResolution, POS/Storefront price resolvers, EF schema for `price_list_items.product_variant_id`.

## 3. Pre-implementation gap matrix

| Area | Current Runtime | Canonical Target | Gap | Action |
|---|---|---|---|---|
| PricingTax request DTO | Scalar only | + `variantPrices[]` | Gap | **EXTEND** |
| PricingTax response DTO | Scalar / first row | Structure-aware + variantPrices + derived counts/range | Gap | **EXTEND** |
| SIMPLE validation | Cost optional; selling+tax required | Preserve | None | **KEEP** |
| VARIANT validation | Cost required; scalar selling | Cost optional; variantPrices; no fan-out | Gap | **MODIFY** |
| Save Draft | Fan-out one price | Partial PENDING allowed | Gap | **MODIFY** |
| Save & Continue | Scalar | All included priced | Gap | **MODIFY** |
| Wizard Create | Scalar fan-out | clientCombinationKey → per-variant prices | Gap | **MODIFY** |
| Publish | Scalar remap | Recheck all included prices | Gap | **EXTEND** |
| Price persistence | Fan-out all non-archived | Included sellable only; upsert by variant id | Gap | **MODIFY** |
| Tax persistence | Fan-out + Option B | Keep pattern for included; SoftDelete excluded | Gap | **EXTEND** |
| Tax validation | Option B present | Preserve | None | **KEEP** |
| Setup projection | First price row | Per-variant graph | Gap | **MODIFY** |
| Variant reconciliation | No price SoftDelete | SoftDelete prices/tax on archive/exclude/structure change | Gap | **EXTEND** |
| Permissions | Existing matrix | Reuse | None | **KEEP** |
| Tenant isolation | Existing | Preserve + tests | None | **KEEP** |
| POS / Ecommerce price | Prefer variant row | No rewrite | None | **KEEP** |
| Migrations | `product_variant_id` exists | No new table | None | **KEEP** |
| Tests | Validator cost rule | Structure-aware + PG wizard | Gap | **EXTEND** |

## 4. Reuse matrix

| Responsibility | Owner |
|---|---|
| Wizard / draft | `TenantAdminProductService` + `TenantAdminProductRepository` |
| Validation | `TenantAdminProductRequestValidator` + service coverage check |
| Price entity | `PriceListItem` |
| Tax assignment | `ProductTaxAssignment` |
| Effective rate | `TaxRateResolution` (projection) |
| Client key bridge | Existing `BuildVariantLookupKeysAsync` / `VariantLookupMatches` |
| POS / Storefront | Existing resolvers (unchanged) |

## 5. Files changed

- `TenantAdminProductWizardDtos.cs` — `VariantPriceConfigurationDto` / response extensions
- `TenantAdminProductRequestValidator.cs` — structure-aware Step 6
- `TenantAdminProductService.cs` — wizard-create + publish mapping + continue coverage
- `TenantAdminProductRepository.Wizard.cs` — apply/project/publish/reconcile
- Unit + integration tests updated/added

## 6. DTO before → after

**Before:** `PricingTaxConfigurationDto(Cost, StandardSelling, Discount, TaxClassId, TaxExclusive)`  
**After:** same + optional `VariantPrices: [{ ProductVariantId?, ClientCombinationKey?, SellingPrice? }]`  
**Response:** + `VariantPrices`, `PricedVariantCount`, `PendingVariantCount`, `PriceFrom`, `PriceTo` (derived)

## 7–15. Behaviour summary

| Topic | Behaviour |
|---|---|
| SIMPLE regression | Scalar selling + tax; cost optional; discount compare_at mapping preserved |
| VARIANT request | `variantPrices[]` authoritative; scalar StandardSellingPrice **rejected** when &gt;1 included variant |
| Identity | ProductVariantId preferred; ClientCombinationKey via same lookup as SKU |
| Persistence | One ACTIVE `price_list_items` row per included variant; no parent-null fake price |
| Partial draft | `sellingPrice: null` → SoftDelete ACTIVE row → PENDING |
| Continue | Service checks every included sellable target priced &gt; 0 |
| GET setup | Structure-aware projection; ordered by ProductVariantId |
| Wizard-create | Local variants + client key bridge before flush |
| Publish | `ValidatePublishPricingAsync` requires all included priced + tax |

## 16–20. Reconciliation / Tax / Permissions / Tenant

- Archive / exclude / VARIANT→SIMPLE: SoftDelete variant `price_list_items` + `product_tax_assignments` before remove
- Tax Class common; Option B retained; omitted `TaxExclusive` preserves existing
- Permissions unchanged (`catalog.product_pricing.manage`, cost.view, pricing.tax_*)
- Tenant scoping via `TenantRequestContext` + entity TenantId filters

## 21–23. POS / Ecommerce

No resolver rewrite. Existing variant-preferring `PriceListItem` selection remains. Integration suite includes storefront/POS suites in full regression (PASS).

## 24. Migration

**NOT REQUIRED** — `price_list_items.product_variant_id` and tax assignment columns already exist.

## 25–27. Test results (actual)

| Suite | Result |
|---|---|
| CatalogProduct unit filter | **276 passed** |
| PricingTax / related unit filter | **56 passed** |
| WizardProductCreate PostgreSQL | **4/4 passed** |
| POS/Storefront/PricingTax unit filter | **77 passed** |
| **Full `dotnet test E_POS.sln`** | Unit **1287**, Api **488**, Integration **597**, LocalPrint **50**, Flow4 **17** — **0 failed** |

## 28. Second Brain updated

- `Current_Source_Of_Truth.md` — VARIANT backend COMPLETE note
- `05_Tenant_Admin_Add_Product_7_Step_Contract.md` §6.3 status
- This closure file

## 29. Remaining gaps

- Flutter VARIANT Step 6 UI (Default Selling Price / Apply to All / matrix)
- Optional: create-options rate pick still inline (projection uses `TaxRateResolution`)
- Broader dedicated POS A/B price regression tests beyond existing suite (not failing)

## 30. Flutter readiness

**YES** — backend contract ready for Flutter VARIANT Step 6 implementation against `variantPrices[]` + GET setup projection.

---

## Final gates

| Gate | Result |
|---|---|
| SIMPLE PRICING BACKEND | **PASS** |
| VARIANT PER-VARIANT PRICING BACKEND | **PASS** |
| VARIANT DRAFT / REHYDRATION | **PASS** |
| VARIANT RECONCILIATION | **PASS** |
| TAX INTEGRATION | **PASS** |
| TENANT ISOLATION | **PASS** |
| POS VARIANT PRICE RESOLUTION | **PASS** (existing; no rewrite) |
| ECOMMERCE VARIANT PRICE RESOLUTION | **PASS** (existing; no rewrite) |
| DATABASE MIGRATION | **NOT REQUIRED** |
| FULL BACKEND REGRESSION | **PASS** |
| BACKEND READY FOR FLUTTER STEP 6 | **YES** |

### Draft semantics chosen

When `PricingTax.VariantPrices != null` on a VARIANT product: **full snapshot** of included sellable variants. Missing included ids are treated as PENDING (`null`). Omitted `VariantPrices` property = do not mutate prices (tax/cost-only). Never fan scalar `StandardSellingPrice` across multiple included variants.
