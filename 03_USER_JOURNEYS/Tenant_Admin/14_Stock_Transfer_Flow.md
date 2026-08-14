<!-- title: Tenant Admin Stock Transfer Flow -->
<!-- status: Deferred -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Stock Transfer Flow

## Contract lock (current Inventory release)

```text
DEFERRED
NOT PART OF CURRENT IMPLEMENTATION LOCK
```

This journey remains documented. It is not implementation-ready for the 29-screen Inventory release.

Canonical lock: [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

## Purpose

Documents transfer between outlets shown in the deck, but marks it deferred unless approved for MVP.

## Current 29-screen implementation scope

**DEFERRED / OUT OF CURRENT 29-SCREEN SCOPE.** Consistent with this file's Deferred status. Not a 29-screen blocker.

## Actor

Tenant Admin

## Source

Derived from `Slide 14 - Stock Transfer Flow` in `tenant-full-journey.pptx` and aligned to OneVerz POS MVP Second Brain scope.

## Trigger

Tenant Admin chooses stock transfer.

## Preconditions

- Tenant Admin has inventory access.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open inventory module | System opens inventory. |
| 2 | Select source outlet | Tenant Admin selects source. |
| 3 | Search product | Tenant Admin finds product. |
| 4 | Open product stock details | System shows source stock. |
| 5 | Choose stock transfer | Tenant Admin selects transfer action. |
| 6 | Select destination outlet | Tenant Admin selects destination. |
| 7 | Enter transfer quantity | Tenant Admin enters quantity. |
| 8 | Add batch/expiry if needed | Tenant Admin enters batch details if applicable. |
| 9 | Validate transfer | System validates stock and destination. |
| 10 | Save transfer | System would create transfer and update source/destination stock if feature is approved. |

## Data Used Or Captured

- Source outlet
- Destination outlet
- Product
- Transfer quantity
- Batch/expiry if applicable

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Inter-outlet stock transfer is excluded/deferred in current MVP unless separately approved.

## Validation And Error Cases

- Feature not enabled
- Invalid destination
- Insufficient stock
- Permission denied

## Outcome

For current MVP, this flow should remain documented/deferred unless scope is approved.

## Related Modules

- 18_Stock_Adjustment_Transfer_Stocktake

## Related Files

- 01_RELEASE_SCOPE/Excluded_Features.md
- 06_DATABASE_KNOWLEDGE/Tables/18_Stock_Adjustment_Transfer_And_Stocktake.md
- 07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Approved_UI_Prototype.md

## Approved UI Prototype Reference

Prototype Status: APPROVED (29-screen Inventory pack)

Implementation Audit: Pending

UI/UX Lock: Pending

Related Prototype Screens:

- None in the approved 29-screen Inventory prototype pack

AUDIT GAP closed: stock transfer remains **DEFERRED / OUT OF CURRENT 29-SCREEN SCOPE** (Flow 14). Module 18 transfer tables are retained. Not a 29-screen blocker.

## Implementation Notes

- Do not implement active stock transfer unless scope change approves it.
