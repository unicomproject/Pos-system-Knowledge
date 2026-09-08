<!-- title: Product Setup Step 6 Pricing & Tax Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-03 -->

# Product Setup Step 6 — Pricing & Tax Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 10_Product_Core / 14_Pricing_Tax_Management |
| Feature | Product Setup Step 6 — Pricing & Tax (SIMPLE + VARIANT) |
| Authority | [[../../../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]] §6.1–6.5 |
| Tax authority | [[../../../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]] |
| API | Existing draft / setup / create-options / wizard-create — no parallel pricing module |
| Permissions | `catalog.product_pricing.manage`; cost `catalog.product_cost.view`; tax lookup `pricing.tax_classes.view` (compat `tax.classes.view`) |
| Tenant Scoped | Yes |

---

## 1. SIMPLE Product

| ID | Scenario | Expected |
|---|---|---|
| PS6-S-001 | Save one valid Standard Selling Price + ACTIVE Tax Class + Exclusive | Continue succeeds; `price_list_items.selling_price` + tax assignment + `is_tax_exclusive=true` |
| PS6-S-002 | Discount path (when Discount Price used in API/state) | Discount ≤ Standard; compare_at / selling mapping per contract; invalid discount rejected |
| PS6-S-003 | Tax assignment ACTIVE Tax Class | Assignment persists; Effective rate derived; Product Setup does not create Tax Rate |
| PS6-S-004 | Tax Inclusive | `taxExclusive=false`; Tax Preview / sale formulas per ADR |
| PS6-S-005 | Tax Exclusive | `taxExclusive=true` (default); Tax Preview / sale formulas per ADR |
| PS6-S-006 | Save Draft incomplete then resume | Restores selling price, tax class, Inclusive/Exclusive, rowVersion; no wipe on rebuild |
| PS6-S-007 | Unauthorized cost access | Without `catalog.product_cost.view`, cost redacted; non-null `costPrice` → 403; omit preserves existing |
| PS6-S-008 | Currency display | Prefix from `create-options.currencyCode`; no currency dropdown; no hard-coded LKR in UI |
| PS6-S-009 | Inactive tax newly selected | Rejected; existing Option B assignment retained if already assigned |
| PS6-S-010 | Cross-tenant tax / product | Backend rejects |

---

## 2. VARIANT Product

| ID | Scenario | Expected |
|---|---|---|
| PS6-V-001 | All included variants same selling price | Each `product_variant_id` has own `price_list_items` row (or equivalent); values equal OK |
| PS6-V-002 | All variants different prices | Independent prices preserved; POS uses selected variant price — not a single parent price |
| PS6-V-003 | Apply to All | Explicit action copies **Set Same Price for All Variants** amount to target rows; entering the amount alone does **not** overwrite |
| PS6-V-004 | Apply to All then override one variant | Only that ProductVariantId changes |
| PS6-V-005 | Partial pricing + Save Draft | e.g. 4 PRICED / 2 PENDING allowed on draft |
| PS6-V-006 | Complete pricing + Save & Continue | All included/sellable variants PRICED + Tax Class + TaxPriceMode required |
| PS6-V-007 | Reopen draft | Restores ProductVariantIds, SKUs, saved prices, pending rows, tax, derived counts/range |
| PS6-V-008 | Price Range | Min–max of valid priced included variants; single price if one; empty/pending if none |
| PS6-V-009 | Priced / Pending counts | Derived from price completeness; not a separate stored enum |
| PS6-V-010 | Tax Class vs different variant prices | Common Tax Class + TaxPriceMode; tax calc uses each variant selling price |
| PS6-V-011 | Stale ProductVariantId | Reject |
| PS6-V-012 | Cross-product variant id | Reject |
| PS6-V-013 | Cross-tenant variant | Reject |
| PS6-V-014 | Inactive tax newly assigned | Reject |
| PS6-V-015 | Variant removed after Step 4 reconciliation | Price rows cleaned; no leak into another variant |
| PS6-V-016 | New variant added after Step 4 reconciliation | Starts PENDING unless explicit Apply to All |
| PS6-V-017 | Remap by display label only | Forbidden — identity must be ProductVariantId / combination key |
| PS6-V-018 | Publish with pending required prices | Blocked; ACTIVE sellable product must not carry invalid required pricing |

---

## 3. Shared / security

| ID | Scenario | Expected |
|---|---|---|
| PS6-X-001 | Missing `catalog.product_pricing.manage` | Step 6 mutate blocked (403) |
| PS6-X-002 | create-options taxes | ACTIVE only for new assignment |
| PS6-X-003 | Monetary precision | Valid decimals per tenant currency rules |

---

## Notes

- Flutter SIMPLE widget tests live under `Nytroz-POS-App/test/features/tenant_admin/products/step_6_pricing_tax_form_test.dart`.
- VARIANT matrix UI + per-variant DTO persist are **canonical TARGET** until backend/Flutter implement §6.3; document failures against that contract, not against obsolete scalar fan-out as desired behaviour.
