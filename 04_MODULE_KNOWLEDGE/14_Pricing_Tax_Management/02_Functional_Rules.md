<!-- title: Pricing & Tax Management Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-03 -->

# Pricing & Tax Management Functional Rules

## Purpose

Defines business and UX rules for `Pricing_Tax_Management` in the OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

**Tax Setup authority:** [[Tenant_Admin_Tax_Management_Canonical_Contract]]  
**Inclusive/Exclusive authority:** [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_PRODUCT_TAX_INCLUSIVE_EXCLUSIVE_DECISION_2026-08-27]]

## Business Rules — Price lists

- Price can vary by outlet and sales channel through price_list_outlets and price_list_channels.
- A tenant can mark one active default price list; backend must resolve the best active price list by outlet/channel, validity window, and priority.
- Price list items can be product-level when product_variant_id is null, or variant-level when it is present.
- selling_price must be non-negative; compare_at_price must be null or greater than or equal to selling_price.
- min_quantity enables quantity-tier pricing and must be greater than zero.

### Product Setup Step 6 — structure-aware selling price (LOCKED)

Authority: [[../10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]] §6.1–6.5.

- **SIMPLE:** one sellable identity → one applicable selling-price configuration on the default price list (do not invent `products.selling_price` or a parallel product_pricing table).
- **VARIANT:** multiple sellable identities → **independent** `price_list_items.selling_price` rows keyed by `product_variant_id`. Do **not** force all variants to share one final selling price. Parent Step 6 **Set Same Price for All Variants** is a bulk helper only (not “Default Selling Price”) — POS / Online Store use the selected ProductVariant’s price.
- **Cost:** product-level `products.reference_cost_price` only (no variant cost column in current schema).
- **Discount (compare_at):** supported by `price_list_items.compare_at_price` where Product Setup uses Discount Price (SIMPLE path when configured). VARIANT Step 6 R1 UI does not require Discount columns.
- Cashier variant changes re-resolve the active variant/UOM price; backend cart calculation remains authoritative.

## Business Rules — Tax Setup (canonical)

- Every Tax Setup belongs to exactly one tenant (BR-TAX-001).
- Tax Code is unique within the tenant; normalize trim + uppercase (BR-TAX-002).
- Tax Treatment is `TAXABLE` | `ZERO_RATED` | `EXEMPT` (BR-TAX-014 distinguishes Zero Rated vs Exempt).
- Tax Setup has **no** Used For / Applies To / Goods / Services / Both (BR-TAX-004).
- Tax rates are effective-dated; current rate is derived server-side (BR-TAX-007, BR-TAX-008).
- Future schedules must not overlap or share EffectiveFrom (BR-TAX-009, TR-03/04).
- Only ACTIVE Tax Setups may be newly assigned in Product Setup (BR-TAX-003).
- INACTIVE Tax Setups: existing product assignments continue (DEC-TAX-012 Option B); new assignments forbidden (BR-TAX-017, BR-TAX-018).
- Product owns TaxPriceMode INCLUSIVE/EXCLUSIVE (BR-TAX-006).
- Historical transaction tax is immutable snapshot; refunds reverse original snapshot (BR-TAX-015, BR-TAX-016).
- Tax jurisdictions may remain hierarchical/technical (DEFAULT-{COUNTRY}); a jurisdiction cannot be its own parent. Jurisdiction is **not** Tenant Admin Tax Setup UX.
- Product tax assignments must not overlap for the same product/variant when active.
- Rates ≥ 0 and ≤ 100 percent; ZERO_RATED must be exactly 0%.

## Tax Calculation Contract

Products define tax interaction via TaxPriceMode (`taxExclusive` flag):

- **Inclusive (`taxExclusive = false`)**: Selling price already includes tax.  
  `NetAmount = GrossAmount / (1 + Rate/100)`; `TaxAmount = GrossAmount - NetAmount`. Never add tax again to an inclusive price.
- **Exclusive (`taxExclusive = true`)**: Selling price excludes tax.  
  `TaxAmount = NetAmount × Rate/100`; `GrossAmount = NetAmount + TaxAmount`.
- **ZERO_RATED / EXEMPT**: `TaxAmount = 0` with distinct reporting treatment.

**Discount Order**: Tax is calculated on the *effective* selling price (e.g., Discount Price if active). Sequence: 1) effective price, 2) TaxPriceMode, 3) compute tax amount.

Use decimal arithmetic and canonical rounding. Do not use binary floating-point.

Cached price/tax is only a reference; backend validates final totals.  
Do not store gateway fees or accounting tax journals here.  
Cashier variant changes re-resolve the active variant/UOM price; the popup is display-only for money and the backend cart-calculation response remains authoritative.

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | May manage platform-owned setup only when platform permission exists |
| Tenant Admin | May manage tenant-owned Tax Setup / price lists when entitlement and permission pass |
| Cashier / Stall Operator | May perform POS actions only with outlet, trusted device, and till context |
| Customer | May access online store/customer actions only through customer-facing APIs |
| Backend Worker | May process derived records, sync, notifications, or reports using service identity and audit |

## UI Rules

- Show this module only when the tenant plan, feature entitlement, and user permission allow it.
- Tax Setup screens: list/empty/add/edit/schedule/products-using per canonical UI inventory.
- Use loading, empty, error, permission-denied, feature-disabled, offline, and conflict states where relevant.
- Do not hardcode role names as authorization logic.
- Do not show fake data, fake counts, fake success states, or hardcoded module rows.
- Mobile, tablet, iPad, laptop, and desktop layouts must keep the same business rules.

## Backend Rules

- Resolve tenant context server-side for every tenant-owned mutation.
- Validate foreign-key ownership within the same tenant before saving.
- Use typed request/response DTOs and map them to domain models/entities.
- Return standard 400, 401, 403, 404, 409, and 500 responses.
- Never expose passwords, POS PINs, token hashes, payment secrets, card data, or cross-tenant records.
- Effective rate resolution and tax calculation are backend authorities.

## Offline And Cache Rules

- Cache can speed up safe reference data only.
- Backend database remains final truth for sale totals, stock, payments, refunds, exchanges, permissions, and sync acceptance.
- Offline operations must be marked pending until accepted by backend sync.
- Conflicts must be visible; do not silently overwrite backend truth.

## Error Rules

| Case | Expected Behavior |
|---|---|
| Missing login | Return 401 and send user to login/session recovery |
| Permission denied | Return 403 and show access denied state |
| Feature disabled | Return 403 and show feature not enabled state |
| Invalid business data | Return 400 with safe field/form errors |
| Duplicate or conflict | Return 409 with safe conflict message |
| Offline blocked action | Explain that online backend validation is required |

## Out Of Scope

- Subscription plan pricing
- Payment settlement
- Discount policy approval
- Inventory cost layers

## Related Files

- [[01_Module_Overview]]
- [[03_Technical_Contract]]
- [[Tenant_Admin_Tax_Management_Canonical_Contract]]
