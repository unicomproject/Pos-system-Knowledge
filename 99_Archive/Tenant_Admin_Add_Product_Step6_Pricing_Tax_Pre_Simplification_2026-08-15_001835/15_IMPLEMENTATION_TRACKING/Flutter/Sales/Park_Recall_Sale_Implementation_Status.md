<!-- title: Park Recall Sale Flutter Implementation Status -->
<!-- status: Completed -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-07 -->

# Park Recall Sale Flutter Implementation Status

## Status

**COMPLETED — AUTHENTICATED RUNTIME E2E ACCEPTED 2026-08-07.**

Online Park/Recall uses backend Holds API (`PosHoldsController`). Product-contract
UX (mutually exclusive Park/Recall, product-name summary, mandatory Cancel Reason,
deviceId-scoped list reload) is Implemented with automated evidence. Full
authenticated cashier E2E is verified for the approved online Parked Sales /
Recall Sale scope.

## Current Verified Evidence (Implemented)

| Area | Evidence |
|---|---|
| Holds API integration | Typed create/list/recall/cancel; stable idempotency; canonical perms |
| Park/Recall visibility | `hasItems` gates Park vs Recall; never simultaneous; permission-aware |
| Empty-cart rules | Customer-only and discount-only remain empty (`hasItems == false`) |
| Product-name summary | `Items: Name1, Name2 +N more` (`N = lineCount - 2`) |
| Cancel Reason | Required; trim; max 250; preserve on retryable failure |
| List scope | `GET holds?deviceId=` via trusted device; reload on device change |
| Home parked sales | `/pos/parked-sales` → `PosParkedSalesScreen` |
| Exact list screen (Chunk 2) | Today/This Shift/All Active API scopes; responsive headings/cards; View; authoritative count/value/currency; pagination; Start New Sale |
| Automated (2026-08-06) | sale/cart/pos/pos_shell suites **250 passed**; visibility **9 passed** |

## Remaining verification

- Authenticated create → list → recall → cancel E2E with live Cashier session.
- Read-only DB proof for cancel reason trim, till scope, RELEASED/CANCELLED.
- Cashier credentials for `CASHIER001@GMAIL.COM` are not available in seed
  plaintext; documented candidates returned `401` against local API.

The items above are superseded by the authenticated 2026-08-07 Chunk 3 run. The
existing hydrated cashier session, open till, trusted device and local API were
used without bypassing authentication.

## Chunk 3 Final Acceptance (2026-08-07)

- Real Dashboard → Recall Sale → `/pos/parked-sales` entry passed in the existing shell.
- Today, This Shift and All Parked Sales filters and backend-authoritative summaries passed.
- View displayed real reference/customer/time/expiry/variant/quantity/value data and closed without route loss.
- Real Recall passed, restored the authoritative cart on New Sale and changed the hold to RELEASED exactly once.
- Non-empty cart Recall protection passed without a backend recall or cart loss.
- Real Cancel passed required-reason validation, changed the hold to CANCELLED, retained the row and inserted an event.
- Runtime responsive checks passed at 1280×800, ~1680×1050, 2560×1600 and 800×600 logical equivalents.
- Focused Flutter regression passed 44/44; full `flutter analyze` passed with no issues.
- Evidence: `C:\tmp\park-chunk3-evidence` and sanitized API/Flutter logs under `C:\tmp`.

Pagination volume (maximum three live active rows), permission role switching,
130% runtime text scale and intentional network/auth/conflict fault injection
were impractical in this controlled session and retain automated evidence. They
do not change completion of the mandatory authenticated Recall, Cancel,
responsive and data-authority acceptance.

## Exact list-screen documentation status

Documentation and Flutter Chunk 2 implementation are complete for the approved Parked Sales table/filter/summary
screen: [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]].
The existing `PosParkedSalesScreen`, `PosParkedSalesPanel`, provider, repository
and datasource were evolved in place; no duplicate screen, route or provider was
introduced. Today is the default and scope/page changes request authoritative
rows, count, value and currency from `GET /api/v1/pos/holds`.
Theme inspection verified `TenantAdminColors`, `TenantAdminTextStyles`,
`TenantAdminSpacing`, `TenantAdminRadius`, `TenantAdminBreakpoints` and shared
POS shell/action components; no screen-specific colour class is approved.

Focused Chunk 2 evidence (2026-08-07): targeted analysis passed; provider tests
passed 14/14. Responsive screen/dialog/router/action suites passed after the
approved label and compact-summary updates. Authenticated runtime screenshot and
real cashier lifecycle verification are superseded by the Chunk 3 evidence above.

## Related Files

- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Park_Recall_Sale_Implementation_Specification]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]]
- [[../../../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Park_Recall_Sale_Test_Cases]]
- [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../../Backend/POSOperations/Pos_Park_Recall_Sale_Implementation_Status]]
