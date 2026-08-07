<!-- title: POS Park Recall Sale Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-07 -->

# POS Park Recall Sale Test Cases

## Purpose

Required automated and authenticated acceptance for Park/Recall. Automated suites
below are **executed / verified**. Full authenticated cashier E2E remains
**pending** — do not treat documentation alone as runtime completion.

## Execution summary (2026-08-07)

| Suite | Result | Status |
|---|---|---|
| Flutter park provider/modal/list suites | Passed | Verified (automated) |
| Flutter Parked Sales screen + router tests | Passed | Verified (automated) |
| Backend Unit affected Park/permission | 46 passed | Verified |
| Backend API affected Park/error mapping | 19 passed | Verified |
| Backend Integration PosHold incl. concurrency | 8 passed | Verified |
| Authenticated full cashier Park → List → Recall → Cancel E2E | Not run | **Pending** |

## Action Visibility (Decision A)

| ID | Scenario | Expected result |
|---|---|---|
| PRK-V01 | Non-empty cart (valid lines) | Show Park Sale; hide Recall Sale |
| PRK-V02 | Empty cart (no valid lines) | Hide Park Sale; show Recall Sale |
| PRK-V03 | Customer-only cart | Counts as empty; Recall Sale shown |
| PRK-V04 | Discount-only cart | Counts as empty; Recall Sale shown |
| PRK-V05 | Successful recall restores lines | Cart non-empty; Park Sale shown; Recall Sale hidden; New Sale route |
| PRK-V06 | Recall with non-empty cart | Overwrite blocked; no silent merge |

## Parked Sales Card Summary (Decision B)

| ID | Scenario | Expected result |
|---|---|---|
| PRK-S01 | One product line | That product name displayed |
| PRK-S02 | Two product lines | Both names displayed |
| PRK-S03 | More than two lines | First two names + `+N more` |
| PRK-S04 | Long product names | Wrap/truncate; no card overflow |
| PRK-S05 | itemCount vs names | Both shown; itemCount meaning unchanged |

## Cancel Reason (Decision C)

| ID | Scenario | Expected result |
|---|---|---|
| PRK-X01 | Cancel action | Confirmation opens with Park Reference |
| PRK-X02 | Empty Cancel Reason | Rejected client + service; no cancel |
| PRK-X03 | Whitespace-only Cancel Reason | Rejected; no cancel |
| PRK-X04 | 250-character trimmed reason | Accepted |
| PRK-X05 | 251-character trimmed reason | Rejected |
| PRK-X06 | Double-tap Confirm Cancel | Exactly one request |
| PRK-X07 | Retryable cancel failure | Entered reason preserved |

## Till Scope (Decision D)

| ID | Scenario | Expected result |
|---|---|---|
| PRK-T01 | Current till records | Displayed when HELD and non-expired |
| PRK-T02 | Another till’s records | Excluded |
| PRK-T03 | Till/session change | List reloads; prior-till rows gone |
| PRK-T04 | Expired/released/cancelled | Remain excluded (`ExpireDueHolds`) |
| PRK-T05 | Home parked-sales count | Same active-hold predicate as list |

## Functional and UI (existing)

| ID | Scenario | Expected result |
|---|---|---|
| PRK-F01 | Open Park with valid non-empty cart | Modal opens; cart remains |
| PRK-F02 | Park when empty | Park Sale hidden; no Park modal |
| PRK-F03 | Cancel/X on Park modal | Cart unchanged |
| PRK-F04 | Empty optional park note | Create allowed |
| PRK-F05 | 250 trimmed park note | Accepted |
| PRK-F06 | 251 trimmed park note | Rejected |
| PRK-F07 | Selected customer | CustomerId sent; no free-text field |
| PRK-F08 | Successful create | 201; PS reference; list/count refresh |
| PRK-F09 | Cart clearing | After 201, **before** success dialog |
| PRK-F10 | Done on success | Closes modal only; no second API |
| PRK-F11 | Recall eligible | Recalculated response restores cart on New Sale |
| PRK-F12 | Cancel eligible | 204; leaves active list |
| PRK-F13 | Home `/pos/parked-sales` | `PosParkedSalesScreen`; same provider |
| PRK-U01 | Submit in progress | No second create dispatch |
| PRK-U02 | Tablet/desktop layout | No overflow; accessible labels |
| PRK-U03 | Long error | Wraps without hiding actions |

## Authorization, Lifecycle, Idempotency, Stock

| ID | Scenario | Expected result |
|---|---|---|
| PRK-A01–A03 | Missing create/view/recall | UI hide/disable + backend 403; canonical codes only |
| PRK-C01–C05 | Device/session/till/tenant/user | Reject or scope correctly; cart safe |
| PRK-L01–L07 | Expired/released/cancelled/concurrency/expiry | Atomic safe transitions; lazy EXPIRED |
| PRK-I01–I04 | Idempotency/double-tap/timeout | One hold; key + fingerprint replay/conflict |
| PRK-E01–E03 | Errors/side effects | Cart preserved; no payment/stock deduct/drawer |
| PRK-ST01 | Park stock | Soft validate only; no reserve/deduct |
| PRK-ST02 | Recall stock | May return StockWarnings; checkout hard |
| PRK-PP01 | Partially paid SourceSaleId | `pos_holds.sale_partially_paid_cannot_be_parked` |
| PRK-D01–D06 | Revalidation/persistence | Backend totals; one hold row; DRAFT after recall |
| PRK-AU01 | Audit events | PARK_CREATED / REPLAY / RECALLED / CANCELLED / EXPIRED |

## Exact Parked Sales Screen Target Tests

Backend scope/aggregate/pagination cases were executed in Chunk 1. Flutter Chunk
2 focused provider and responsive widget cases are automated and passing;
authenticated mandatory screen/runtime cases were executed in Chunk 3.

| IDs | Coverage and expected result |
|---|---|
| PSR-N01–N03 | Dashboard Recall navigation; missing view permission denied; Start New Sale requires `sales.create` and uses `/pos/new-sale` |
| PSR-F01–F06 | Today default; outlet business-date/timezone boundary; This Shift; All active; newest-first; filter state survives resize |
| PSR-D01–D07 | Walk-in fallback; long customer/reference; quantity-sum item semantics; backend currency; Parked Time; View typed details; no Cashier column |
| PSR-S01–S03 | Filtered total count/value; aggregate not one page; rows/count/value share scope |
| PSR-R01–R04 | Recall empty cart; block non-empty cart; double tap one request; success refresh + New Sale |
| PSR-C01–C05 | Cancel confirmation; 1/250/251 boundaries; no hard delete; 409 expired/recalled/cancelled; concurrent recall/cancel exactly one success |
| PSR-E01–E05 | Loading, empty, error, permission-denied and unknown-outcome recovery; no cart loss/automatic retry |
| PSR-L01–L07 | 1, 8, 50+ rows; 1280×800; medium; narrow; 130% text; rotation; no RenderFlex/clipping/navigation overlap |
| PSR-A01–A03 | Semantics, keyboard focus/visible focus and status not conveyed by colour alone |
| PSR-T01–T04 | Existing theme tokens, shared buttons/cards/shell reused; no hardcoded feature colours; no screen colour class |
| PSR-DB01–DB03 | No new table, no duplicate attributes, existing conditional lifecycle transition remains atomic |

These cases become verified only after real test execution evidence is recorded.
Screen authority:
[[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]].

## Acceptance Evidence

Record commands, pass counts, references, timestamps and environment.

**Automated backend Chunk 1 (verified 2026-08-07):** solution build passed with
zero warnings/errors; focused Unit PosHold 28, API PosHold 14 and repository 4;
affected Unit Park/permission 46, API Park/error mapping 19 and Integration
PosHold including concurrency 8 passed. The repository fixture verifies Today,
This Shift, All Active, newest-first, page slicing, authoritative currency and
aggregate-before-pagination behavior.

**Authenticated Flutter Chunk 3 (verified 2026-08-07):** Pixel Tablet emulator,
local API and PostgreSQL-backed development data. Real UI navigation verified
Today, This Shift, All Parked Sales, authoritative empty/non-empty summaries,
newest-first ordering, View details and close-state retention. A real Recall
transitioned `HELD → RELEASED`, restored Match Shorts/Small quantity 1 to New
Sale and produced no payment/receipt/printer/drawer side effect. A non-empty cart
blocked Recall and remained intact. A separate hold rejected an empty Cancel
Reason, accepted one valid reason once, transitioned `HELD → CANCELLED`, inserted
the lifecycle event, retained the hold row and refreshed to 0 / LKR 0.00.

Runtime screenshots cover 1280×800, approximately 1680×1050, 2560×1600 and
constrained 800×600 logical equivalents; no Flutter overflow/assertion/exception
was logged. Final focused Flutter regression: 44/44 passed; `flutter analyze`:
no issues. Runtime data volume reached three active rows, so pagination volume
was not exercised; role switching, 130% text scale and forced fault responses
remain automated-only evidence and were not fabricated as runtime passes.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Park_Recall_Sale_Implementation_Specification]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]]
- [[../../../13_DECISIONS_AND_CHANGES/ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]]
- [[../../../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Park_Recall_Sale_Implementation_Status]]
- [[../../../15_IMPLEMENTATION_TRACKING/Backend/POSOperations/Pos_Park_Recall_Sale_Implementation_Status]]
