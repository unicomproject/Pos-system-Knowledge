<!-- title: Flutter Offline Operation Sync -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Offline Operation Sync

## Purpose

This file defines Flutter offline operation and sync rules for TM-EPOS MVP.

Offline mode allows limited POS continuity.
It does not make the device the final business authority.

## Offline Principle

```text
Offline action = pending
Sync = backend submission
Backend = final validation
```

## Allowed Offline Actions

| Action | Offline Behavior |
|---|---|
| Product lookup | Use cached product/category/barcode data |
| Product grid/search | Use cached catalogue |
| Price/tax calculation | Use cached reference data |
| Active cart | Save and restore locally |
| Cash sale | Capture as pending offline cash sale |
| Receipt print | Print offline receipt where template exists |
| Park/hold sale | Store locally and sync later |
| Current till session | Continue current local session state |
| Recent customer lookup | Limited cached lookup |
| Inventory movement | Queue pending movement |
| Sync outbox | Store pending operations |

## Blocked Offline Finalization

Do not finalize offline:

- Card payment.
- QR payment.
- Refund.
- Exchange.
- Loyalty/store credit.
- Till final close.
- Final stock.
- Final sale total.

## Sync Outbox

Every offline operation must have:

- Local client ID.
- Tenant ID.
- Outlet/till/device context where applicable.
- Operation type.
- Payload.
- Idempotency key.
- Created timestamp.
- Sync status.
- Retry count.
- Last error.

## Conflict Rule

If backend rejects or conflicts with offline data, show conflict state and do not
silently overwrite backend truth.

## UX Rule

Staff must clearly see:

- Offline mode active.
- Pending sync count.
- Failed sync count.
- Conflict count.
- Last successful sync time.

## Related Files

- [[Flutter_Virtual_Caching_Strategy]]
- [[Flutter_Local_Storage_Cache]]
- [[Flutter_Error_Handling]]
