<!-- title: Tenant Admin Stock Out Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Stock Out Flow

## Purpose

Defines reducing stock with reason capture, validation, and audit tracking.

## Actor

Tenant Admin

## Source

Derived from `Slide 13 - Stock Out Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin chooses Stock Out.

## Preconditions

- Tenant Admin has stock-out permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open inventory module | System opens inventory. |
| 2 | Select outlet | Tenant Admin selects outlet. |
| 3 | Search product | Tenant Admin finds product. |
| 4 | Open product stock details | System shows current stock. |
| 5 | Choose stock out | Tenant Admin chooses stock reduction action. |
| 6 | View current stock | System shows quantity. |
| 7 | Enter stock out quantity | Tenant Admin enters quantity. |
| 8 | Select reason/destination | Tenant Admin selects reason. |
| 9 | Review remaining stock | System previews remaining stock. |
| 10 | Validate stock out | System validates stock availability. |
| 11 | Save stock out | System saves movement and audit log. |

## Data Used Or Captured

- Product
- Outlet
- Stock out quantity
- Reason
- Remaining quantity

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- System must prevent stock out beyond allowed stock policy.

## Validation And Error Cases

- Out of stock
- Invalid quantity
- Missing reason
- Permission denied

## Outcome

Stock is reduced and movement is audited.

## Related Modules

- 16_Inventory_Foundation_Stock_Availability
- 17_Reservations_Stock_Movements_Serial_Cost
- 18_Stock_Adjustment_Transfer_Stocktake

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/17_Reservations_Stock_Movements_Serial_And_Cost_Allocation.md
