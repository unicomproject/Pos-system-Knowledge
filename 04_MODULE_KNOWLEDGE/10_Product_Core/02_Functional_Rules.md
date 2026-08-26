<!-- title: Product Core Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-24 -->

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
- Step 4 for VARIANT mode defines options, values, Cartesian matrix, display labels, variant inclusion toggles (`Include Variant`), and variant image overrides. It does NOT configure SKU, Barcode, Selling Price, Cost Price, Tax, Opening Stock, Stock Quantity, or Channel Visibility (belonging to Step 1).
- Inactive products cannot be sold through POS or online store.
- POS may cache product reference data, but backend remains final authority.
- Optional Step 1 Initial Tracking Details (Batch / Expiry / Serial) do not enable tracking policy. See BR-TRACK-001 to BR-TRACK-020 in [[Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]. Permission matrix: [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].

| ID | Rule |
|---|---|
| BR-TRACK-001 | Step 1 may collect optional initial Batch Number. |
| BR-TRACK-002 | Step 1 may collect optional initial Expiry Date. |
| BR-TRACK-003 | Step 1 may collect optional initial Serial Number. |
| BR-TRACK-004 | Step 1 tracking values do not determine tracking policy. |
| BR-TRACK-005 | Step 2 is authoritative for tracking enable/disable state. |
| BR-TRACK-006 | Expiry Tracking requires Batch Tracking. |
| BR-TRACK-007 | Serial Tracking is mutually exclusive with Batch/Expiry in Release 1. |
| BR-TRACK-008 | Incompatible Step 1 values must never be silently discarded. |
| BR-TRACK-009 | Expiry remains batch-owned domain data. |
| BR-TRACK-010 | Serial remains physical-unit identity data. |
| BR-TRACK-011 | Step 1 serial is an INITIAL serial, not a Product-wide reusable serial. |
| BR-TRACK-012 | Step 1 batch is an INITIAL batch; later batches may be added. |
| BR-TRACK-013 | No positive inventory quantity may be invented from Batch/Expiry/Serial input alone. |
| BR-TRACK-014 | Variant tracking identity must resolve to an exact Variant before final physical ownership. |
| BR-TRACK-015 | Bundle parent cannot receive direct physical tracking identities while Bundle inventory remains component-based. |
| BR-TRACK-016 | Initial Tracking mutation uses Product Setup authorization and does not imply Stock Adjustment permission. |
| BR-TRACK-017 | Unauthorized specialized fields must never be persisted merely because they were included in a generic draft payload. |
| BR-TRACK-018 | Publish revalidates all permissions required for mutations performed during publish. |
| BR-TRACK-019 | Cost data must not be returned to callers without `catalog.product_cost.view`. |
| BR-TRACK-020 | Permission denial must not cause silent destructive normalization of draft data. |

## Related Specifications

- [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[Tenant_Admin_Product_Type_Tracking_Specification]]
- [[Tenant_Admin_Product_Units_Pack_Conversion_Specification]]
- [[05_Tenant_Admin_Add_Product_7_Step_Contract]]
- [[Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]

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
