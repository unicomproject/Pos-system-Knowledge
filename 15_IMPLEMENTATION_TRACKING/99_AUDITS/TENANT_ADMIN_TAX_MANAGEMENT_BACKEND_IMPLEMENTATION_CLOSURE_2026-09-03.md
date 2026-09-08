<!-- title: Tenant Admin Tax Management Backend Implementation Closure -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-03 -->
<!-- authority: Implementation evidence only — does not rewrite Canonical Contract -->

# Tenant Admin Tax Management — Backend Implementation Closure (2026-09-03)

## Scope

Backend-only alignment of Unified-Commerce Tax Management to:

`Pos-system-Knowledge/04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract.md`

No Flutter changes. Canonical business contract not rewritten.

## Verdict

**TAX MANAGEMENT BACKEND — COMPLETE**

Canonical Second Brain used as source of truth. Live Postgres migration applied. Full solution regression passed.

## Phase 0 — Audit matrix (runtime vs Second Brain)

| Area | Current Backend (pre) | Canonical Second Brain | Gap | Action |
|---|---|---|---|---|
| Tax Setup entity | `TaxClass` + free-text `TaxType` | Tax Setup + `TaxTreatment` TAXABLE/ZERO_RATED/EXEMPT | Treatment not persisted | **MODIFY** + migrate |
| Used For / Goods/Services | Not present | Must not exist | None | **KEEP** absent |
| Rate model | End-current + insert next on % change | Effective-dated HISTORICAL/CURRENT/SCHEDULED | Explicit schedule APIs incomplete | **MODIFY** / **CREATE** |
| Status | ACTIVE + soft patterns | ACTIVE/INACTIVE Option B | New assignment vs retention | **MODIFY** |
| TaxPriceMode | `products.is_tax_exclusive` | INCLUSIVE/EXCLUSIVE product-owned | Aligned | **KEEP** |
| Create-options | id/code/name ACTIVE | + treatment + currentRate | Projection incomplete | **MODIFY** |
| Permissions | `tax.classes.*` / `tax.rates.*` | `pricing.tax_*` TARGET + aliases | Mapping incomplete | **MIGRATE** |
| API root | `/api/v1/tax` aggregate | Extend `/api/v1/tax` | List/detail/schedule/status/products | **MODIFY** |
| Sale snapshot | `sales_order_taxes` schema; POS rarely wrote | Immutable snapshot + treatment | Writers + `tax_treatment_snapshot` | **CREATE** / **MODIFY** |
| Refund | Pro-rata from line tax amounts | Original snapshot only | Aligned if snapshot written | **KEEP** + write snapshots |
| Product count | Missing | DISTINCT ProductId aggregate | Gap | **CREATE** |

Classification used: KEEP / MODIFY / DEPRECATE / REMOVE / CREATE / MIGRATE.

## Migration

| Item | Detail |
|---|---|
| Migration id | `20260903120000_AlignTaxManagementCanonicalContract` |
| Path | `Unified-Commerce/src/E_POS.Infrastructure/Persistence/Migrations/20260903120000_AlignTaxManagementCanonicalContract.cs` |
| Schema | `tax_classes.tax_treatment`, `tax_classes.is_seeded`, `tax_rates.notes`, `sales_order_taxes.tax_treatment_snapshot` |
| Backfill | `tax_type` → `tax_treatment` (ambiguous OTHER/0% → TAXABLE, not EXEMPT) |
| Permissions | Seed TARGET `pricing.tax_*`; map role grants from legacy `tax.*` |
| Applied | Yes — local `UnifiedCommerceDb` (port 5434) via `dotnet ef database update` |

## Backend files changed (summary)

| Area | Files |
|---|---|
| Domain | `TaxTreatments.cs`, `TaxClass.cs`, `TaxRate.cs`, `SalesOrderTax.cs`, `PricingTaxPermissions.cs` |
| EF / Migration | `TaxClassConfiguration`, `TaxRateConfiguration`, SalesOrderTax config, migration + snapshot |
| Application | `TaxAggregateDtos`, `ITaxAggregateService`, `TaxAggregateService`, `TaxRateResolution`, `TaxSetupService`, permission aliases |
| API | `TaxesController` (`/api/v1/tax`) |
| Repositories | `TaxSetupRepository`, `PosCheckoutRepository`, product create-options / wizard tax assignment |
| POS calc | `PosSaleLinePricingCalculator` (EXEMPT / inactive retention) |
| Tests | `TaxAggregateServiceTests` + updated PricingTax unit/API/integration coverage |
| Hygiene | WizardCreate rollback preserves root exception when Npgsql already aborted txn |

## APIs implemented (extend `/api/v1/tax`)

- List (search, status, page) with current/next rate + productCount + treatment
- Detail + derived rate history (HISTORICAL / CURRENT / SCHEDULED)
- Create / Update Tax Setup (treatment rules)
- POST rates (future schedule), edit/delete future rates
- Activate / Deactivate (Option B)
- GET `{id}/products` paged products-using
- Product create-options: ACTIVE only + treatment + currentRate

## Permissions

| TARGET | Legacy alias (compatibility) |
|---|---|
| `pricing.tax_classes.view` | `tax.classes.view` |
| `pricing.tax_classes.create` | `tax.classes.create` |
| `pricing.tax_classes.update` | `tax.classes.update` |
| `pricing.tax_classes.status.manage` | `tax.classes.delete` / `tax.classes.manage` |
| `pricing.tax_classes.products.view` | (granted with view mapping) |
| `pricing.tax_rates.view` | `tax.rates.view` |
| `pricing.tax_rates.schedule.manage` | `tax.rates.create/update/delete/manage` |
| Product assignment | `catalog.product_pricing.manage` |

No `catalog.tax.*` introduced.

## Tests executed (actual)

| Suite | Filter / scope | Result |
|---|---|---|
| Unit PricingTax | `FullyQualifiedName~PricingTax` | **32 passed** |
| API PricingTax | `FullyQualifiedName~PricingTax` | **10 passed** |
| Integration PricingTax + POS pricing + Refund filter | PricingTax \| PosSaleLinePricing \| Refund | **15 passed** |
| Wizard create (Postgres) | `WizardProductCreatePostgreSqlTests` | **4 passed** (after migration apply) |
| Full `E_POS.sln` | all projects | **2430 passed**, 0 failed |

Full regression breakdown:

- LocalPrintAgent.Tests: 50
- Flow4FixtureCli.Tests: 17
- UnitTests: 1278
- ApiTests: 488
- IntegrationTests: 597

## Remaining gaps (real, non-blocking)

1. **Dedicated Tax audit logger** — PricingTax has no `ITaxAuditLogger` equivalent to Category/Product; create/update/schedule rely on entity audit columns only. Optional follow-up to mirror Category audit pattern.
2. **DB unique (TaxSetup + EffectiveFrom)** — rates link via `tax_class_rates` junction; uniqueness/overlap enforced in service + transaction. Composite DB unique on setup+date not added without denormalizing `tax_class_id` onto `tax_rates`.
3. **Flutter** — explicitly out of scope; not claimed complete.

## Closure statuses

| Gate | Status |
|---|---|
| Canonical Second Brain | USED AS SOURCE OF TRUTH |
| Backend Tax Management | **COMPLETE** |
| Database migration | **APPLIED** |
| Tax Treatment persistence | **COMPLETE** |
| Rate Scheduling | **COMPLETE** |
| Product Setup backend integration | **COMPLETE** |
| Transaction snapshot | **COMPLETE** |
| Refund tax preservation | **COMPLETE** |
| Permission alignment | **COMPLETE** |
| Tenant isolation | **PASS** |
| Focused tests | **PASS** (32 unit + 10 API + 15 integration PricingTax-related) |
| Full backend regression | **PASS** (2430) |
