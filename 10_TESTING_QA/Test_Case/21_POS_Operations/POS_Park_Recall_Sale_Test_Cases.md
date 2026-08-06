<!-- title: POS Park Recall Sale Test Cases -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# POS Park Recall Sale Test Cases

## Purpose

Defines required automated and authenticated runtime acceptance for backend-authoritative Park/Recall. These tests are specified, not yet executed for the approved target.

## Functional and UI

| ID | Scenario | Expected result |
|---|---|---|
| PRK-F01 | Open with non-empty valid cart | Modal opens without API wait; cart remains |
| PRK-F02 | Open with empty cart | Action blocked with guidance |
| PRK-F03 | Cancel button or X | Modal closes; cart/customer/discount unchanged |
| PRK-F04 | Empty optional note | Create allowed |
| PRK-F05 | 250 trimmed characters | Accepted and mapped to Reason |
| PRK-F06 | 251 trimmed characters | Client and backend reject |
| PRK-F07 | Selected customer | Existing CustomerId sent; no free-text customer field |
| PRK-F08 | Successful create | 201; returned PS reference shown; list/count refreshed |
| PRK-F09 | Cart clearing | Occurs only after confirmed success |
| PRK-F10 | Recall eligible record | Backend recalculates; response restores active cart |
| PRK-F11 | Cancel eligible record | 204 and record leaves active list |
| PRK-U01 | Submit in progress | Button disabled/loading; second dispatch impossible |
| PRK-U02 | Tablet/desktop modal | No clipping/overflow; accessible focus and labels |
| PRK-U03 | Long error | Wraps without hiding actions |

## Authorization and Context

| ID | Scenario | Expected result |
|---|---|---|
| PRK-A01 | Missing `sales.park.create` | UI hidden/disabled and backend 403 |
| PRK-A02 | Missing `sales.park.view` | List/count unavailable and backend 403 |
| PRK-A03 | Missing `sales.park.recall` | Recall unavailable and backend 403 |
| PRK-A04 | Legacy aliases | Compatibility only where code explicitly supports it |
| PRK-C01 | Empty/unknown/untrusted device | Request rejected; cart preserved |
| PRK-C02 | Missing device assignment/open session | Request rejected; cart preserved |
| PRK-C03 | Wrong till recall | 409 till mismatch |
| PRK-C04 | Cross-tenant identifier | No disclosure; 404/authorized error contract |
| PRK-C05 | Different holding user | Not visible/recallable under current scope |

## Lifecycle and Concurrency

| ID | Scenario | Expected result |
|---|---|---|
| PRK-L01 | Expired hold | Excluded from list; recall/cancel blocked |
| PRK-L02 | Released hold | Cannot recall again |
| PRK-L03 | Cancelled hold | Cannot recall/cancel again |
| PRK-L04 | Concurrent recall | Exactly one transition to RELEASED |
| PRK-L05 | Duplicate cancel | Exactly one transition; later request conflicts safely |
| PRK-L06 | Active-list filter | Excludes expired/released/cancelled records |
| PRK-L07 | Standard expiry | `expires_at = held_at + 24h` from server time |

## Idempotency and Failure Safety

| ID | Scenario | Expected result |
|---|---|---|
| PRK-I01 | Same key and same payload | Same persisted/resulting hold; count remains one |
| PRK-I02 | Same key and changed payload | 409 idempotency conflict |
| PRK-I03 | Double tap | One network dispatch and hold |
| PRK-I04 | Timeout then retry | Reuse key/reconcile; no duplicate |
| PRK-E01 | 400/401/403/404/409/500 | Typed error; active cart preserved |
| PRK-E02 | Network timeout/unknown outcome | Cart/key preserved; no blind new attempt |
| PRK-E03 | Any failed Park | No completed sale, payment, receipt, stock deduction, print or drawer action |

## Data Revalidation

| ID | Scenario | Expected result |
|---|---|---|
| PRK-D01 | Client sends altered totals/prices | Backend ignores them and recalculates |
| PRK-D02 | Price changed before recall | Current backend price returned or typed failure |
| PRK-D03 | Stock reduced before recall | Current stock validation blocks/adjusts by contract |
| PRK-D04 | Tax/discount changed | Current valid calculation returned |
| PRK-D05 | Customer deleted/deactivated | Typed tenant/customer result where supported |
| PRK-D06 | Persistence | One held order, expected lines and one `pos_order_holds` row |

## Required Test Layers

- Backend unit: validation, reference/expiry, permissions, replay and state transitions.
- Backend integration/API: status/error envelopes, tenant/till/user isolation, concurrent updates and persistence.
- Flutter unit/widget: DTO mapping, state machines, modal boundaries, permissions, cart preservation and legacy separation.
- Authenticated runtime: create/list/count/recall/cancel with safe read-only DB reconciliation.
- Offline/outbox tests belong to the separate offline implementation contract.

## Acceptance Evidence

Record commands, pass counts, correlation/idempotency references, returned Park Reference, timestamps, relevant row counts, screenshots and environment. Do not mark complete from documentation or mocked tests alone.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Park_Recall_Sale_Implementation_Specification]]
- [[../../../13_DECISIONS_AND_CHANGES/ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]]
