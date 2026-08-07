<!-- title: Flutter Park Recall Sale Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-07 -->

# Flutter Park Recall Sale Implementation Specification

## Objective

Specify Flutter Park/Recall against backend Holds (`PosHoldsController` /
`/api/v1/pos/holds`). Code + automated tests are **Implemented**; authenticated
full cashier runtime E2E is **accepted as of 2026-08-07**.

## Composition

| Component | Responsibility |
|---|---|
| New Sale actions | Cart-derived Park Sale / Recall Sale visibility (Decision A) |
| Park modal | Generated-after-success reference text, optional note, 24h message |
| Success handling | Cart cleared after 201 **before** success dialog; Done closes modal only; no second API; double-tap guarded |
| Parked Sales list | Current-till backend list; product-name summary; row actions |
| Home route | `/pos/parked-sales` → `PosParkedSalesScreen` (same provider as New Sale) |
| Recall gate | Block overwrite of non-empty cart; on success → New Sale |
| Cancel confirmation | Required Cancel Reason; per-row submitting state |
| Status feedback | Returned PS reference (display-only); typed errors |

Exact ownership: `PosParkedSalesScreen` owns the `/pos/parked-sales` page;
`PosParkedSalesPanel` currently owns shared card/list states and row actions;
`PosParkedSaleNotifier`/`posParkedSaleProvider` own operations. The approved
table/filter/summary target is defined separately in
[[Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]]. Existing
`TenantAdminColors`, `TenantAdminTextStyles`, `TenantAdminSpacing`,
`TenantAdminRadius`, `PosPrimaryActionButton`, `PosShellScaffold`,
`PosDesktopTopBar` and `PosCashierBottomNavigation` must be reused. No new
screen-specific colour class or hardcoded feature colour is approved.

## Park Sale / Recall Sale visibility

- Derive visibility from valid cart lines only (not customer/discount alone).
- Non-empty → show **Park Sale**, hide **Recall Sale**.
- Empty → hide **Park Sale**, show **Recall Sale** (opens Parked Sales).
- Never show both buttons at once for this pair.
- After successful recall, cart is non-empty → switch back to Park Sale.
- Unrelated New Sale actions are unchanged.

## Parked Sales card presentation

- Show product-name summary from backend line order:
  - 1 name; 2 names; or first two + `+N more`.
- Keep `itemCount` as a separate element.
- Long names wrap/truncate per design system; no display-only API.

## Cancel confirmation

- Open confirmation with Park Reference, warning, Cancel Reason, Back/Close,
  Confirm Cancel.
- Validation: required; trim; reject blank/whitespace; max 250; inline errors;
  disable repeat submit; preserve reason after retryable failure.
- Clear reason only after confirmed success or intentional close.
- Backend service enforces mandatory reason.
- Cancel permission remains `sales.park.create` (no new code).

## Till / session list scope

- List and home count use backend-authoritative current tenant + till + holding
  cashier + HELD + non-expired (aligned predicate).
- Flutter must not submit or invent the authoritative till ID.
- On till/session change, invalidate and reload Parked Sales; drop prior-till rows.

## Architecture Boundaries

- Datasource owns `/api/v1/pos/holds` HTTP and error mapping.
- Repository maps typed DTOs; widgets never parse raw maps.
- Providers own create/list/recall/cancel, stable create idempotency, list refresh.
- Cart snapshot for create; apply recall response only after success.
- Permissions: canonical `sales.park.create/view/recall` only for authorizing
  UI; legacy `pos.sale.park*` demoted and must not authorize Park actions.
- Reference `PS-{UTC_YEAR}-{5 digit}` is backend-generated; Flutter display-only.
- StockWarnings from recall are informational; checkout remains hard stock authority.

## Create State Machine

`idle → editing → submitting → succeeded | knownFailure | unknownOutcome`.

- Preserve idempotency key across timeout/reconciliation for unchanged intent.
- Clear cart only after confirmed create success, **before** showing success UI.
- Done closes the success modal only (does not re-call create).
- Never mint a new key automatically after unknown outcome.
- Double-tap / concurrent submit guarded.

## Recall and Cancel

- Fetch active backend records; never silently merge legacy `pos.parked_sales`.
- Home and New Sale share the same parked-sales provider.
- Recall applies only successful recalculation; mark released once; navigate to
  New Sale with restored cart. SalesOrder stays DRAFT on the backend.
- Wrong till, expired, released, cancelled, concurrent recall → typed conflicts.
- Cancel removes from view only after 204; reconcile unknown outcomes.

## UI and Accessibility

- Landscape responsive; no card overflow from long product names.
- Semantic labels, focus order, adequate touch targets, non-colour loading cue.

## Required Tests

Include Decision A–D and gap-closure cases in
[[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Park_Recall_Sale_Test_Cases]]:
visibility toggles, empty definitions, no overwrite, name summary, cancel reason
rules, till scope and till/session refresh, exclusion of terminal/expired holds,
cart-clear-before-success, Done-no-second-API, home screen/router, StockWarnings
presentation when returned.

Automated park suites + screen/router tests: **passed** (see Flutter status).
Authenticated cashier E2E: **passed 2026-08-07** for list/filter/View,
empty-cart Recall, non-empty-cart safety, Cancel, authoritative refresh and
responsive runtime. Pagination volume, permission role switching and forced
fault injection retained automated evidence only.

## Delivery Notes

Gap-closure implementation landed 2026-08-06 (idempotency DB, stock soft path,
partial-pay reject, lazy EXPIRED, events, mandatory cancel reason). Offline
outbox remains a separate chunk. Do not mark Fully Completed without runtime E2E.
Chunk 3 authenticated runtime E2E completed 2026-08-07. Offline outbox remains a
separate feature and does not block the approved online Park/Recall screen.

## Related Files

- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../03_USER_JOURNEYS/Cashier/12_Park_Recall_Sale_Flow]]
- [[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Park_Recall_Sale_Test_Cases]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Park_Recall_Sale_Implementation_Status]]
- [[Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]]
