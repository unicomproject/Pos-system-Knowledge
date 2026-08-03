<!-- title: Tenant Admin Expiry Discount Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-31 -->

# Tenant Admin Expiry Discount Management Flow

## Purpose

Defines creation and activation of expiry-based discounts, general discount policies, and price lists that populate the Cashier POS "Offers" discovery segment.

## Actor

Tenant Admin

## Source

Derived from `Slide 16 - Expiry Discount Management Flow` in `tenant-full-journey.pptx` and aligned to OneVerz POS MVP Second Brain scope.

## Trigger

Tenant Admin opens expiry discount management.

## Preconditions

- Tenant Admin has discount permission.
- Products/batches exist where expiry applies.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open expiry alerts module | System opens expiry alert/discount area. |
| 2 | View near-expiry products/batches | System lists products/batches near expiry. |
| 3 | Search/filter expiry items | Tenant Admin filters list. |
| 4 | Select product or batch | Tenant Admin chooses target. |
| 5 | Review expiry date and available quantity | System shows expiry and quantity. |
| 6 | Enter discount percentage or value | Tenant Admin enters discount. |
| 7 | Set valid period | Tenant Admin sets discount period. |
| 8 | Choose applicable outlet/POS screen | Tenant Admin chooses where discount applies. |
| 9 | Confirm discount rules | System validates rule. |
| 10 | Apply discount | System activates discount for eligible products/batches. |

## POS Offer Configuration Flow (Discount Policies & Special Prices)

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Discount Policy / Price List management | System opens discount/pricing config. |
| 2 | Create/Edit policy or special price | Admin defines percentage, fixed discount, or compare-at prices. |
| 3 | Select target products/variants/categories | Admin links targets (using include/exclude targets). |
| 4 | Assign outlet and channel limits | System validates outlet and POS channel mappings. |
| 5 | Save and Activate | Active configuration is immediately indexed by the backend POS catalog and becomes discoverable under the Cashier New Sale "Offers" segment. |

## Data Used Or Captured

- Product/batch
- Expiry date
- Available quantity
- Discount percentage/value
- Valid period
- Outlet/POS screen
- Targeted products, categories, brands, or collections
- Compare-at and selling prices (for special price list items)

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Discount must be permission controlled.
- Discount must not bypass backend final sale total validation.

## Validation And Error Cases

- Invalid discount value
- Expired product/batch not eligible
- Permission denied
- Overlapping discount rule
- Cross-tenant policy targeting (fails validation)

## Outcome

Expiry discount or general promotional offer is applied, and the product becomes visible under the Cashier POS Offers segment.

## Related Modules

- 15_Discount_Expiry_Discount_Management
- 10_Product_Core
- 14_Pricing_Tax_Management
- 16_Inventory_Foundation_Stock_Availability
- 21_POS_Operations

## Related Files

- [[../../06_DATABASE_KNOWLEDGE/Tables/15_Discount_And_Expiry_Discount_Management]]
- [[../../04_MODULE_KNOWLEDGE/21_POS_Operations/06_Offers_Product_Discovery_Feature]]
