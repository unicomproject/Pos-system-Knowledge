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
- Base sellable Simple Products carry primary catalog identity directly on `products` and do NOT require dummy or shadow rows in `product_variants`.
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
