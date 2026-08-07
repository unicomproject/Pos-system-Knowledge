<!-- title: POS Park Recall Sale Backend Implementation Status -->
<!-- status: Testing -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-07 -->

# POS Park Recall Sale Backend Implementation Status

## Status

**CODE + AUTOMATED TESTS IMPLEMENTED — AUTHENTICATED FULL RUNTIME E2E PENDING.**

Controller: `PosHoldsController`. Gap closure (DB idempotency, soft stock, partial-
pay reject, lazy EXPIRED, hold events, mandatory cancel reason, device-resolved
current-till list) is Implemented with unit/API/integration evidence. Do **not**
mark Fully Completed without authenticated full cashier E2E.

## Implemented surface

- Application: `PosHoldService`, `ParkSaleReference`, `ExpireDueHolds`.
- API: `POST/GET /api/v1/pos/holds`, `POST /{holdId}/recall`, `DELETE /{holdId}`.
- List: `GET /api/v1/pos/holds?deviceId=` — till resolved via
  `ResolveCurrentSessionAsync` (trusted device + open session). Never client
  `tillId`.
- Parked Sales query: `scope=today|current-shift|all-active` (Today default),
  page 1/pageSize 25 defaults, maximum 100; full-filter `totalCount`,
  `totalValue`, currency and page metadata. Park creation snapshots the open
  till session business date onto the existing SalesOrder.
- Cancel: query `reason` mandatory; trim; empty/whitespace → typed 400; max 250.
- Infrastructure: `PosHoldRepository`; migration
  `20260806190000_AddPosHoldIdempotencyAndEvents`.
- Permissions: `sales.park.create|view|recall` (cancel uses create).

## Automated Evidence (verified 2026-08-07)

| Check | Result |
|---|---|
| Solution build | **Passed — 0 warnings, 0 errors** |
| Focused Unit / API / Repository | **28 / 14 / 4 passed** |
| Affected Unit / API / Integration | **46 / 19 / 8 passed** |

## Runtime

Local API listening on `http://0.0.0.0:5150`. Authenticated cashier login for
`CASHIER001@GMAIL.COM` and documented Oneverce admin candidates returned
`tenant_auth.invalid_credentials`. Full Park → List → Recall → Cancel E2E and
read-only DB acceptance remain **Runtime Verification Pending**.

## Parked Sales screen API foundation

Chunk 1 is implemented. Today uses authoritative till-session business date;
This Shift uses current session ID; All Active retains tenant/current-till/
holding-user/lifecycle/expiry scope. Aggregates are computed before deterministic
newest-first pagination. Existing lines remain sufficient for read-only View.
No new table, column, row version, endpoint, migration or speculative index was
added. Flutter target implementation and authenticated E2E remain pending.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../../../13_DECISIONS_AND_CHANGES/ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/21_POS_Operations_UPDATED]]
- [[../../Flutter/Sales/Park_Recall_Sale_Implementation_Status]]
