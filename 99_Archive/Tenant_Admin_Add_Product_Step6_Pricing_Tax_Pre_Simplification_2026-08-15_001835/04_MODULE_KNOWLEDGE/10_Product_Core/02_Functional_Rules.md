<!-- title: Product Core Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-11 -->

# Product Core Functional Rules

## Purpose

Defines business and UX rules for `Product_Core` in the OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens, responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Product and variant identifiers are tenant-scoped.
- SKU and barcode uniqueness must be enforced by tenant and variant rules.
- Base sellable Simple Products carry primary catalog identity directly on `products`. However, to normalize Base SKU and price persistence, they inherently utilize a single default `product_variants` row (as dictated by the canonical database rule: every sellable product must have at least one `product_variants` row).
- Variants carry sellable identity for Variant products (`productStructure = VARIANT`); price and stock remain separate modules.
- Add Product Step 4 is polymorphic:
  - SIMPLE: Auto-bypassed / `NOT_APPLICABLE`.
  - VARIANT: Renders Variant Configuration (`Tenant_Admin_Product_Variant_Configuration_Specification`).
  - BUNDLE: Renders Kit Component Assembly.
- Step 4 for VARIANT mode defines options, values, Cartesian matrix, display labels, variant inclusion toggles (`Include Variant`), and variant image overrides. It does NOT configure SKU, Barcode, Selling Price, Cost Price, Tax, Opening Stock, Stock Quantity, or Channel Visibility (belonging to Steps 5, 6, and 7).
- Inactive products cannot be sold through POS or online store.
- POS may cache product reference data, but backend remains final authority.

## Related Specifications

- [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[Tenant_Admin_Product_Type_Tracking_Specification]]
- [[Tenant_Admin_Product_Units_Pack_Conversion_Specification]]
- [[05_Tenant_Admin_Add_Product_8_Step_Contract]]

## Bundle / Kit Functional Rules

### Component Eligibility
Eligible Simple Product components must be:
- Same tenant
- ACTIVE
- Sellable
- Inventory tracked
- Accessible
- Not Bundle (Nested bundles blocked)
- Not deleted
- Not archived
- Not Draft

For Variant Products, the component MUST resolve to one exact ACTIVE Variant.

### Required Quantity
- Mandatory
- Greater than 0
- Blank/zero/negative are invalid.
- Whole UOM: integer only.
- Fractional UOM: decimal allowed according to existing precision rules.

### Duplicates
Duplicate identity is `componentProductId` (Simple) or `componentProductId + componentVariantId` (Variant).
If already configured:
`This component is already in the bundle. Update the existing quantity?`
- Add mode: new quantity increments existing.
- Edit mode: new quantity replaces existing.
- Do NOT create duplicate DB rows.

### Zero Stock
A valid ACTIVE component with zero current Outlet stock may still be configured.
Result: `Supports Bundles = 0` and `Bundle Available Quantity = 0`. Configuration remains valid, but sale is blocked. Negative stock is not allowed.

### Nested Bundle and Substitution
- Bundle cannot contain another Bundle in Release 1.
- Self-references are blocked.
- No POS component substitution in Release 1.

### Product Structure Change
Changing `BUNDLE` → `SIMPLE` or `VARIANT` requires destructive confirmation.
- **Confirm**: Physically deletes `combo_definitions` and `combo_components` rows (for BUNDLE → SIMPLE and BUNDLE → VARIANT), clears component mappings, resets Step 4 completion, clears derived state, and applies new structure rules.
- **Cancel**: Retains BUNDLE and its components.
