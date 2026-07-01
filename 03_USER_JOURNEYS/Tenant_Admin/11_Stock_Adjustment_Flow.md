<!-- title: Tenant Admin Stock Adjustment Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Stock Adjustment Flow

## Purpose

Defines stock quantity adjustment with validation, reason capture, and audit tracking.

## Actor

Tenant Admin

## Source

Derived from `Slide 11 - Stock Adjustment Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin chooses stock adjustment.

## Preconditions

- Tenant Admin has stock adjustment permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open inventory module | System opens inventory. |
| 2 | Select outlet | Tenant Admin selects outlet. |
| 3 | Search product | Tenant Admin selects product. |
| 4 | Open product stock details | System shows current stock. |
| 5 | Choose stock adjustment | Tenant Admin starts adjustment. |
| 6 | View current stock | System shows stock quantity. |
| 7 | Set adjustment type | Tenant Admin selects increase/decrease. |
| 8 | Enter adjustment quantity | Tenant Admin enters quantity. |
| 9 | Enter reason | Tenant Admin enters reason. |
| 10 | Review updated stock | System previews updated stock. |
| 11 | Validate adjustment | System validates details. |
| 12 | Save adjustment | System saves adjustment, updates inventory, and writes audit log. |

## Data Used Or Captured

- Product
- Outlet
- Current quantity
- Adjustment type
- Adjustment quantity
- Reason

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Reason is mandatory.
- Negative stock handling must follow inventory rules.

## Validation And Error Cases

- Invalid quantity/reason
- Stock below zero if not allowed
- Permission denied

## Outcome

Stock adjustment is saved and audited.

## Related Modules

- 16_Inventory_Foundation_Stock_Availability
- 17_Reservations_Stock_Movements_Serial_Cost
- 18_Stock_Adjustment_Transfer_Stocktake

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/18_Stock_Adjustment_Transfer_And_Stocktake.md
