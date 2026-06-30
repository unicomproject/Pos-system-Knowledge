<!-- title: Tenant Admin Stock Transfer Flow -->
<!-- status: Deferred -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Stock Transfer Flow

## Purpose

Documents transfer between outlets shown in the deck, but marks it deferred unless approved for MVP.

## Actor

Tenant Admin

## Source

Derived from `Slide 14 - Stock Transfer Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

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

## Implementation Notes

- Do not implement active stock transfer unless scope change approves it.
