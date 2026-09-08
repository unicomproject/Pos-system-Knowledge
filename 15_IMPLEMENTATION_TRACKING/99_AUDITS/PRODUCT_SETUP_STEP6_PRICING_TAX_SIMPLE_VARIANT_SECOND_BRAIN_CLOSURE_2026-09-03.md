# PRODUCT SETUP Step 6 — Pricing & Tax (SIMPLE + VARIANT) Second Brain Closure

<!-- status: Active — documentation only -->
<!-- last_updated: 2026-09-03 -->

**Scope:** Second Brain / source-of-truth update only.  
**Did NOT:** implement Backend, Flutter, migrations, wizard redesign, or a parallel Pricing module.

Authority: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]] §6.1–6.5.

---

## 1. Files analysed (minimum set)

| Area | Paths inspected |
|---|---|
| 00_START_HERE | `Current_Source_Of_Truth.md`, glossary tax/pricing pointers |
| 03_USER_JOURNEYS | `Tenant_Admin/09_Product_Management_Flow.md`, Tax Management journey / TA-UJ-069 |
| 04 Product Core | `05_Tenant_Admin_Add_Product_7_Step_Contract.md`, Review Create, Draft Lifecycle, Type & Tracking, Barcode/SKU |
| 04 Variant | `12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification.md` |
| 04 Pricing/Tax | Functional Rules, Technical Contract, Module Overview, Tax Management Canonical Contract |
| 05 Backend | `API_ENDPOINTS.md` (tenant-admin products draft/setup/create-options) |
| 06 Database | `Tables/14_Pricing_And_Tax_Management.md` (`price_list_items`, tax assignments) |
| 07 UI / 08 Flutter | Add Product 7-Step UI + Flutter specs § Step 6 |
| 02 Access | `Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md` §12 |
| 10 QA | Existing Product CRUD / list cases; new Step 6 cases file |
| 15 Tracking | SIMPLE Step5/Step6 closure; Tax Management closures; Step5 VARIANT closures |
| Archive | Confirmed stale 8-step / pre-simplification Pricing docs live under `99_Archive` only |

Conflict resolution order used: Current SoT → latest closures → active module contracts → archive last.

---

## 2. Current canonical wizard confirmed

Fixed **7 steps**: Basic Details → Product Type & Tracking → Units & Pack → Product Configuration → Barcode & SKU → **Pricing & Tax** → Review & Create.  
No Channel Visibility as a standalone step. Channel visibility remains Step 1. Bundle/Kit not expanded in this Pricing task beyond existing BUNDLE notes. Current Product Setup commercial focus: **SIMPLE + VARIANT**.

## 3. Stale 8-step files discovered

Active tree: **none** claiming an 8-step Product Setup as current.  
Historical 8-step / pre-canonical Pricing copies remain under `99_Archive/` (non-canonical). Not rewritten.

## 4. Simple Product journey found

Basic Details → Type & Tracking → Units → **bypass Product Configuration** → Barcode & SKU → Pricing & Tax → Review.  
One sellable identity; no variant matrix on Step 6.

## 5. Existing Simple Pricing contract

Confirmed (and preserved): Standard Selling Price *; Tax Class * (rate in label); Tax Exclusive / Inclusive; client Tax Preview.  
No Cost / Discount / Effective Tax Rate field / currency banner / currency dropdown on SIMPLE UI.  
Persist via existing `price_list_items` + `product_tax_assignments` + `products.is_tax_exclusive`; currency from tenant `create-options.currencyCode`.

## 6. Whether Simple Product required changes

**Minimal doc alignment only** — no rewrite of SIMPLE business behaviour. Clarified ownership tables and that SIMPLE must not get a Variant Pricing table.

## 7. Files modified for Simple Product (among others)

- `05_Tenant_Admin_Add_Product_7_Step_Contract.md` §6.2 CONFIRMED  
- UI §4.3.2 (removed contradictory currency **info banner** leftover)  
- Flutter §1.2 SIMPLE IMPLEMENTED block  
- Journey Step 6 row; Review Create §F; Tax contract Step 6 notes; SoT Wizard Step Rule

## 8. Generic Step 6 sections refactored

Into: **6.1 Shared → 6.2 SIMPLE → 6.3 VARIANT → 6.4 Tax Management Integration → 6.5 Draft / Resume / Validation**. Shared Step 6 concept retained.

## 9. Variant Pricing canonical contract added

§6.3 + UI §4.3.3 + Flutter TARGET + Variant Spec §8 pricing reconciliation + Pricing Functional/Technical + API_ENDPOINTS Step 6 note + QA scenarios.

## 10. Standard Selling Price ownership

| Structure | Owner |
|---|---|
| SIMPLE | One applicable selling configuration for the sellable identity → `price_list_items` |
| VARIANT | **Per `ProductVariantId`** → `price_list_items.selling_price` |

Authoritative POS/Online price = selected sellable ProductVariant (not parent Default Selling Price).

## 11. Cost Price ownership decision

**Product-level only:** `products.reference_cost_price`.  
No variant cost column in current schema. Not on SIMPLE UI; not on VARIANT matrix R1 UI. Optional on persist when authorized (`catalog.product_cost.view`).

## 12. Discount Price ownership decision

Architecture supports `price_list_items.compare_at_price` / selling mapping (SIMPLE path when Discount used).  
**VARIANT Step 6 R1 UI does not require Discount columns** — do not invent unsupported screenshot-only fields. Can extend later via existing price-list model.

## 13. Default Selling Price / Apply to All rules

Default Selling Price = **bulk helper only**, not parent authoritative sale price.  
Entering default alone must **not** silently overwrite. **Apply to All** is explicit; afterwards each row owns its value independently.

## 14. ProductVariantId ownership

Pricing identity = stable `product_variants.id` / combination key. Never UI row index or display label alone.

## 15. Priced / Pending rules

Derived from required price completeness. Draft may mix PRICED/PENDING. Save & Continue requires all **included/sellable** variants PRICED (+ tax). Do not store UI labels as duplicate DB enums.

## 16. Price Range rules

Derived min–max of valid priced included variants; single price if one; empty/pending if none. Not a manually editable parent field.

## 17. Tax Class ownership

Tax Class / Rate / Treatment masters = **Tax Management**. Product Setup selects ACTIVE Tax Class only. Product owns TaxPriceMode (`taxExclusive` / `is_tax_exclusive`).

## 18. Tax Management integration

Aligned with Tax Management Canonical Contract + DEC-TAX-012 Option B. Effective Tax Rate read-only/derived. VARIANT: common Product Tax Class for current scope; calc uses each variant selling price. No per-row Tax Class unless Tax Management later requires override.

## 19. Draft / resume rules

SIMPLE restores cost (if any), selling, discount (if any), tax assignment, Inclusive/Exclusive, rowVersion.  
VARIANT restores included variants, ProductVariantIds, SKUs, per-variant prices, pending rows, tax, derived counts/range. Do not wipe Step 6 on rebuild; do not shuffle prices across variants.

## 20. Variant reconciliation rules

Documented in Variant Configuration Spec §8 + Step 6 §6.3/6.5: retained prices by stable identity; no price leak from tombstoned/excluded; new included → PENDING unless Apply to All; cleanup of variant price_list_items with draft cleanup.

## 21. Validation / security

Backend-authoritative: tenant + product scoped IDs; reject stale/cross-product/cross-tenant variant and tax; monetary decimals; Discount ≤ Standard when Discount path used; inactive tax not newly assignable. Frontend filter = UX only.

## 22. Permissions

Reused existing catalog: `catalog.product_pricing.manage`, `catalog.product_cost.view`, tax lookup `pricing.tax_classes.view` / compat `tax.classes.view`. No duplicate aliases. Matrix §12 updated for per-variant selling + Apply to All helper.

## 23. Contradictions removed / corrected

- Journey “Cost+Selling+Discount for all” → structure-aware  
- UI “VARIANT unchanged full form” + SIMPLE currency **info banner** leftover → §4.3.2/4.3.3  
- Flutter “VARIANT keeps Cost/Discount; Continue requires cost” → TARGET §6.3  
- Review VARIANT single Cost/Selling/Discount summary → price range / counts  
- Pricing docs: clarified SIMPLE one-identity vs VARIANT independent prices; scalar fan-out marked **superseded TARGET gap**  
- Permission matrix stray broken table row after Tax paragraph cleaned  
- Active 8-step Product Setup: none found outside archive

## 24. Remaining blockers / unknowns

| Item | Status |
|---|---|
| Backend `PricingTaxConfigurationDto` still scalar; `ApplyPricingTaxConfigurationAsync` fans one price to all variants | **Implementation gap** (documented) |
| Flutter VARIANT Step 6 still scalar form | **Implementation gap** |
| Whether UX requires overwrite confirmation dialog before Apply to All when rows already priced | Not mandated by current UI system; document as optional UX if product later requires it |
| Variant-level Discount / Cost UI | Intentionally out of R1 matrix; architecture Cost=product, Discount via compare_at if later needed |

## 25. Backend impact — documentation only

Extend existing draft/wizard-create pricing path + `price_list_items` per `product_variant_id`. Conceptual `variantPrices[]`. Do **not** invent VariantPrice2 / NewProductPricing / products.selling_price. Stop VARIANT scalar fan-out.

## 26. Flutter impact — documentation only

Implement VARIANT UI per UI §4.3.3 / Flutter §1.2 TARGET. Preserve SIMPLE `_buildSimpleForm`. Map rows by ProductVariantId; Apply to All explicit; derived Priced/Pending + Price Range.

---

## Final status

| Gate | Result |
|---|---|
| **SIMPLE PRODUCT PRICING CONTRACT** | **CONFIRMED** (docs preserved; minor alignment) |
| **VARIANT PRODUCT PRICING CONTRACT** | **READY** (Second Brain); runtime code still blocked until backend+Flutter |
| **TAX INTEGRATION** | **ALIGNED** with Tax Management canonical contract |
| **SECOND BRAIN READY FOR BACKEND IMPLEMENTATION** | **YES** |

Locked canonical rule:

```text
SIMPLE: one sellable identity → one applicable pricing configuration
        → Cost (product-level arch) / Standard Selling / Discount (when used)
        → Product Tax Assignment

VARIANT: Parent Product
           + ProductVariant A|B|C → independent selling prices
           + common Product Tax Assignment (current scope)
         Default Selling Price = bulk helper only
         Authoritative POS/Online price = selected ProductVariant
```

**STOP** — no Backend / Flutter implementation in this task.
