# PRODUCT_SETUP SIMPLE Step 5 polish + Step 6 Pricing & Tax — CLOSURE

<!-- status: Active -->
<!-- last_updated: 2026-09-03 -->

Covers work in the 2026-09-03 Product Setup conversation: SIMPLE Step 5 identifier UX polish, then SIMPLE Step 6 Pricing & Tax (screenshot contract) plus required backend.

## A. AUDIT RESULT

**Existed**
- 7-step wizard; Step 5 VARIANT table-first (see `PRODUCT_SETUP_STEP5_VARIANT_SKU_BARCODE_CLOSURE_2026-09-03.md`)
- SIMPLE Step 5 compact SKU/barcode editors + assignment table scaffolding
- Step 6 VARIANT-style Cost / Selling / Discount / Tax Setup form
- Persist: `PricingTaxConfigurationDto` (CostPrice, StandardSellingPrice, DiscountPrice, TaxClassId, TaxExclusive) → default price list + `product_tax_assignments` + `is_tax_exclusive`
- Tax math ADR 2026-08-27 (Inclusive / Exclusive)

**Missing / stale**
- SIMPLE Step 5 table still looked like VARIANT (checkbox / ⋮) instead of selected-dot + Scan + pencil
- Edit Variant drawer did not match Figma “2nd” (Barcode Type visible; missing Scan to Replace)
- Apply did not clear SIMPLE SKU/barcode fields after commit
- SIMPLE Step 6 showed Cost / Discount; no currency banner, Tax Presentation cards, or Tax Preview
- create-options had no tenant `currencyCode`
- Continue required Cost Price for SIMPLE
- Draft JSON only sent `taxId`; wizard-create needs `taxClassId`
- Second Brain Step 6 still described a single Cost+Discount form for all structures

## B. SECOND BRAIN UPDATED

| File | Change |
|---|---|
| `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Barcode_SKU_Specification.md` | SIMPLE/BUNDLE Apply-clear, assignment table, hidden barcode type |
| `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md` | Step 5 SIMPLE polish; Step 6 structure split; create-options `currencyCode` |
| `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Review_Create_Specification.md` | Review Pricing & Tax structure-aware |
| `04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract.md` | Step 6 Tax Preview is client-side only |
| `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md` | §2.1.1 SIMPLE Step 5; §4.3 SIMPLE vs VARIANT Step 6 |
| `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md` | Step 5 SIMPLE widgets; §1.2 Step 6 Flutter |

## C. BACKEND UPDATED

| Area | Files / change |
|---|---|
| Create options | `TenantAdminProductCreateOptionsResponse.CurrencyCode`; `GetCreateOptionsAsync` reads `Tenants.BaseCurrencyCode` (default `LKR`) |
| Validator | `ValidatePricingTaxContinue`: SIMPLE/BUNDLE/empty structure do **not** require CostPrice; selling price > 0; TaxClassId required; TaxExclusive required if null |
| Persist | Existing `ApplyPricingTaxConfigurationAsync` — omit CostPrice skip `UpdateReferenceCost`; still writes selling price, taxExclusive, tax assignment |
| API | No new endpoints. No EF migration (currency already on tenants; pricing columns already exist) |

## D. DATABASE

- **EF MIGRATION: NONE REQUIRED**
- Currency: `tenants.base_currency_code`
- Pricing: existing price list items + `products` tax exclusive + `product_tax_assignments`

## E. FLUTTER UPDATED

| Area | Change |
|---|---|
| Step 5 | SIMPLE assignment table without checkbox; pencil; Apply clears fields; edit drawer Figma 2nd; barcode type hidden in UI |
| Step 6 | SIMPLE/BUNDLE layout: selling price + tenant currency prefix, Tax Class (rate in label), Tax Exclusive/Inclusive, Tax Preview. **No** Effective Tax Rate field, **no** currency banner/dropdown, **no** Cost/Discount |
| Preview | `computeStep6TaxPreview` Exclusive/Inclusive/Exempt |
| Options | `TenantProductCreateOptions.currencyCode` |
| DTO | `taxId` / `taxClassId` alias on Step 6 fromJson/toJson |
| Continue | SIMPLE skips cost; requires selling price + tax class |

## F. FINAL API SNIPPETS

Create-options (excerpt):

```json
{
  "taxes": [{ "id": "…", "taxClassName": "Standard Rate", "currentRate": 15 }],
  "currencyCode": "LKR"
}
```

Wizard-create pricing (SIMPLE):

```json
{
  "productStructure": "SIMPLE",
  "pricingTax": {
    "standardSellingPrice": 750,
    "taxClassId": "…",
    "taxExclusive": true
  }
}
```

`costPrice` and `discountPrice` are omitted on SIMPLE UI. VARIANT may still send them.

## G. NFR RESULT

| NFR | Result |
|---|---|
| Currency not editable on Product Setup | YES |
| Tax Preview not persisted | YES (client estimate) |
| Sale-time tax still server-authoritative | YES |
| SIMPLE cost optional | YES |
| EF migration | NONE |
| New pricing tables | NONE |

## H. TEST RESULT

| Suite | Result |
|---|---|
| Flutter Step 5 + Step 6 + SIMPLE navigation | PASS **37/37** |
| Backend unit `TenantAdminProductDraftValidatorTests` (incl. SIMPLE cost optional) | PASS **16/16** |
| Create-options `CurrencyCode` | Covered in `TenantAdminProductCreateOptionsRepositoryTests` (integration; not re-run in this closure) |

## I. REMAINING GAPS

- VARIANT Step 6 **runtime** still uses scalar Cost/Selling/Discount fan-out — **Second Brain TARGET** is now locked in [[PRODUCT_SETUP_STEP6_PRICING_TAX_SIMPLE_VARIANT_SECOND_BRAIN_CLOSURE_2026-09-03]] / 7-Step contract §6.3 (backend + Flutter not implemented in this SIMPLE closure)
- Tax Preview uses Flutter `double` (display only); POS sale calc stays decimal on server
- Manual 1024×768 tablet verification of SIMPLE Step 6 two-column layout not done in this closure
- Full Flutter suite may still have unrelated pre-existing failures

## J. FINAL VERDICT

**IMPLEMENTED** for SIMPLE Step 5 polish + SIMPLE Step 6 Pricing & Tax (UI + create-options currency + continue validation). VARIANT Step 6 **documentation** superseded by 2026-09-03 Second Brain SIMPLE+VARIANT contract; **code** still pending.
