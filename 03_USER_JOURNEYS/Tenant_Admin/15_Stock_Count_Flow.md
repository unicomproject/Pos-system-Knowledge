<!-- title: Tenant Admin Stock Count Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Stock Count Flow

## Purpose

Defines stock count/stocktake workflow for physical count and reconciliation.

## Actor

Tenant Admin

## Source

Derived from `Slide 15 - Stock Count Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin chooses stock count.

## Preconditions

- Tenant Admin has stock count permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open inventory module | System opens inventory. |
| 2 | Select outlet | Tenant Admin selects outlet. |
| 3 | Open stock count | System opens count flow. |
| 4 | Choose count scope | Tenant Admin chooses full outlet, category, product count, scheduled count, or spot check. |
| 5 | Start count | System starts count session. |
| 6 | Compare with system stock | System compares physical count with expected stock. |
| 7 | Review variance | Tenant Admin reviews differences. |
| 8 | Validate count | System validates count values. |
| 9 | Confirm count | Tenant Admin confirms count. |
| 10 | Save count result | System saves count and reconciles inventory if allowed. |
| 11 | Audit log created | System records audit trail. |

## Data Used Or Captured

- Outlet
- Count scope
- Product
- System quantity
- Count quantity
- Variance
- Count status

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Variance review is mandatory before reconciliation.

## Validation And Error Cases

- Invalid count
- Concurrent count/session conflict
- Permission denied

## Outcome

Stock count is saved and inventory is reconciled/audited according to policy.

## Related Modules

- 18_Stock_Adjustment_Transfer_Stocktake
- 16_Inventory_Foundation_Stock_Availability

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/18_Stock_Adjustment_Transfer_And_Stocktake.md
