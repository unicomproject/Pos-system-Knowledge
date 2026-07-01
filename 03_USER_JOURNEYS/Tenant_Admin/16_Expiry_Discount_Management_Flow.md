<!-- title: Tenant Admin Expiry Discount Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Expiry Discount Management Flow

## Purpose

Defines creation and activation of expiry-based discounts for near-expiry products or batches.

## Actor

Tenant Admin

## Source

Derived from `Slide 16 - Expiry Discount Management Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

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

## Data Used Or Captured

- Product/batch
- Expiry date
- Available quantity
- Discount percentage/value
- Valid period
- Outlet/POS screen

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

## Outcome

Expiry discount is applied and visible where configured.

## Related Modules

- 15_Discount_Expiry_Discount_Management
- 10_Product_Core
- 16_Inventory_Foundation_Stock_Availability

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/15_Discount_And_Expiry_Discount_Management.md
