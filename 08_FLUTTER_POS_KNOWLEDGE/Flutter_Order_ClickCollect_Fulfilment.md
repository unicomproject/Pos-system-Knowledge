<!-- title: Flutter Order Click Collect Fulfilment -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Order Click Collect Fulfilment

## Purpose

This file defines Flutter staff-side order, click-and-collect, fulfilment, and
pickup workflow guidance.

Customer storefront is browser/web-facing.
Flutter supports staff-side order handling and pickup operations.

## Staff Workflows

| Workflow | Flutter Support |
|---|---|
| Online order list | View new/paid/pending orders |
| Order detail | View items, options, pickup details |
| Fulfilment preparation | Mark preparing/ready where permitted |
| Pickup order | Verify and mark collected |
| Cancellation | Permit only valid status/permission |
| Status history | Show order/pickup timeline where API provides it |

## Status Rule

Flutter must not invent status transitions.

Allowed transitions must come from backend rules or API response.

## Permission Rule

Staff needs order, fulfilment, or pickup permission before seeing or changing
order/pickup state.

## Offline Rule

Pickup status changes should normally require online backend validation.

If queued offline later, the UI must clearly mark the action as pending and not
show it as final collected until sync succeeds.

## UX Rule

Show clear sections:

- New orders.
- Preparing.
- Ready for pickup.
- Collected.
- Cancelled/failed.
- Sync pending/conflict if applicable.

## Data Rule

Order totals, payment status, refund state, and pickup completion are backend
validated.

## Related Files

- [[Flutter_API_Integration]]
- [[Flutter_Permission_Based_UI_Rendering]]
- [[Flutter_Offline_Operation_Sync]]
