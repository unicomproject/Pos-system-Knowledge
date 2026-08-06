<!-- title: Park Recall Sale Flutter Implementation Status -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Park Recall Sale Flutter Implementation Status

## Status

**IN PROGRESS — READY FOR IMPLEMENTATION AFTER BACKEND ALIGNMENT.** Current functionality is device-local and disconnected from backend Holds.

## Current Verified Evidence

- `PosParkedSaleNotifier` reads/writes secure-storage key `pos.parked_sales`.
- `saveCurrentCart` creates client references such as `Parked Sale #1` using device time.
- Local records include cart items, customer snapshots, reference name/phone/note, discount and totals.
- Recall removes the local record and restores its serialized cart; delete is local cancellation.
- New Sale UI still contains `Hold Sale`, a Park Sale Reference dialog and device-local Parked Sales dialog.
- No Park/Recall remote datasource/repository or `/api/v1/pos/holds` integration was found.
- Current local tests prove local storage/dialog behavior only, not backend lifecycle.

## Approved Target

Use Park Sale/Parked Sales/Recall Sale terminology, one optional short note, active-cart customer, generated-after-success PS reference, server-controlled expiry and backend list/count/create/recall/cancel. Clear cart only after confirmed create success.

## Required Flutter Work

- Add typed Holds DTO, datasource, repository and domain mapping.
- Add create intent/idempotency state and unknown-outcome reconciliation.
- Replace modal fields and prevent fabricated reference display.
- Render canonical permissions for create/view/recall while accepting backend denial.
- Refresh backend list/count after create/cancel/recall.
- Apply backend recall recalculation response to cart safely.
- Separate or migrate legacy `pos.parked_sales`; never merge it silently as authority.
- Preserve cart on all failures and disable repeated submission.
- Add responsive, accessible loading/empty/error/conflict/expired states.

## Testing and Runtime Pending

DTO/repository/provider/widget tests, permission tests, idempotency/failure tests, legacy migration tests, authenticated backend E2E, read-only DB verification and concurrent lifecycle checks remain pending. No Flutter code was changed in documentation Phase 1. Do not mark Completed.

## Related Files

- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Park_Recall_Sale_Implementation_Specification]]
- [[../../../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Park_Recall_Sale_Test_Cases]]
- [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
