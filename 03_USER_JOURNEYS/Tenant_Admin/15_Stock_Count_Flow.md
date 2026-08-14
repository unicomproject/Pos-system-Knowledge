<!-- title: Tenant Admin Stock Count Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Stock Count Flow

## Contract lock (current Inventory release)

```text
DEFERRED
NOT PART OF CURRENT IMPLEMENTATION LOCK
```

This journey remains documented. It is not implementation-ready for the 29-screen Inventory release.

Canonical lock: [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

## Purpose

Defines stock count/stocktake workflow for physical count and reconciliation.

## Current 29-screen implementation scope

**DEFERRED / OUT OF CURRENT 29-SCREEN SCOPE.** The Inventory Dashboard Stock Count tile is visible but must not open this wizard.

## Actor

Tenant Admin

## Source

Derived from `Slide 15 - Stock Count Flow` in `tenant-full-journey.pptx` and aligned to OneVerz POS MVP Second Brain scope.

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
- 07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Approved_UI_Prototype.md

## Approved UI Prototype Reference

Prototype Status: APPROVED (29-screen Inventory pack)

Implementation Audit: Pending

UI/UX Lock: Pending

Related Prototype Screens:

- INV-UJ01-S01 `01_inventory_dashboard.html` (Stock Count quick-action tile only)

No Stock Count wizard screens are included in the 29-screen pack.

AUDIT GAP closed: TA-UJ-049 is **DEFERRED / OUT OF CURRENT 29-SCREEN SCOPE**. Dashboard Stock Count tile remains visible and must not open a stocktake wizard. Not a 29-screen blocker.
