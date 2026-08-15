<!-- title: Flutter Parked Sales Recall Screen Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-07 -->

# Flutter Parked Sales Recall Screen Implementation Specification

## Purpose and Identity

Defines the Dashboard **Parked Sales / Recall Sale list screen**, not the Park Sale creation dialog. It remains inside the existing POS shell and reuses header,
session, outlet/till context and bottom navigation.

## Current Verified State

- Dashboard route `/pos/parked-sales` loads `PosParkedSalesScreen`; recall success goes to `/pos/new-sale`.
- `PosParkedSalesScreen` reuses `PosParkedSalesPanel`; the panel now provides Today/This Shift/All Parked Sales filters, responsive table headings, typed View, Recall and Cancel actions, authoritative summary metadata, pagination and Start New Sale.
- `pos.parked_sales` is legacy non-authoritative storage and is not merged online.
- `PosParkedSaleNotifier` owns scope/page/pageSize plus backend count/value/currency metadata and refreshes the active query after lifecycle mutations. Backend `itemCount` is preserved as authoritative display data.
- Chunk 2 automated Flutter validation is complete; authenticated cashier runtime and visual acceptance remain Chunk 3 work.

## Approved Terminology

| Screenshot wording | Approved cashier wording |
|---|---|
| Held Sales / Held Sales Summary | Parked Sales / Parked Sales Summary |
| Sale No. / `HS-0008` | Park Reference / backend-returned reference |
| Held Time / Resume / Delete | Parked Time / Recall Sale / Cancel Parked Sale |
| All/Total Held Sales / Total Held Value | All/Total Parked Sales / Total Parked Value |

Internal entities and `/holds` retain Hold terminology. Cancel changes lifecycle;
it never physically deletes a database row.

## Entry, Composition and Filters

1. Dashboard Recall Sale opens `/pos/parked-sales`; `sales.park.view` guards data.
2. Existing shell/header/navigation remain; back follows current router behaviour.
3. Title **Parked Sales**; default **Today**; other filters **This Shift** and **All Parked Sales**.
4. Columns: Park Reference, Customer, Items, Parked Time, Amount, Actions. No Cashier while holding-user-only.
5. Actions: View, Recall Sale, Cancel Parked Sale. Summary: authoritative Total Parked Sales/Value. Include Start New Sale.

| Filter | Server-authoritative scope |
|---|---|
| Today | Active rows on outlet business date/timezone; never tablet clock |
| This Shift | Active rows for authoritative current `tillSessionId` |
| All Parked Sales | All accessible active rows, not lifecycle history |

Every filter remains tenant + current till + holding user + `HELD` + not
cancelled/released/expired, ordered `heldAt` descending. Rows/count/value refresh
from one scope.

## Traceable Requirements

| ID | Requirement |
|---|---|
| PSR-01–03 | Guard entry; initial loading; Today default/business-timezone boundary |
| PSR-04–06 | This Shift; All active; newest-first sorting |
| PSR-07–10 | Park Reference; customer/Walk-in fallback; quantity-sum Items; parked date/time |
| PSR-11–13 | Backend currency; authoritative filtered count/value; never aggregate one page |
| PSR-14–16 | Typed View; Start New Sale with `sales.create`; responsive states |
| PSR-17–20 | Recall/cart protection; cancel/reason; double-tap guard; no cart loss |
| PSR-21–24 | Refresh after Park/Recall/Cancel/resume; conflict and unknown-outcome recovery |

## Recall, Cancel and State

Recall verifies `sales.park.recall`, blocks a non-empty cart, disables repeat row
actions and calls `POST /api/v1/pos/holds/{holdId}/recall`. Backend validates
tenant/user/device/till/session/status/expiry and live checkout data. Exactly one
conditional `HELD → RELEASED` succeeds. Apply only the successful response,
refresh and navigate to New Sale; failure preserves cart and parked record.

Cancel uses `sales.park.create` (no `sales.park.cancel`), confirmation and the
current required trimmed reason of 1–250 characters. DELETE conditionally performs
`HELD → CANCELLED`; remove/refresh only after success. Reconcile timeout/conflict
before assuming outcome. State owns filter/page/rows/count/value/currency,
loading/error, per-row operation and refresh context; never auto-retry unknowns.

## Existing Theme and Shared Components

No `RecallSaleColors`, replacement theme, feature hex, direct colour constants or
duplicated token is approved. Record screenshot differences as token gaps.

| Purpose | Verified name | Source |
|---|---|---|
| Shell/header/nav | `PosShellScaffold`, `PosDesktopTopBar`, `PosCashierBottomNavigation` | `lib/features/pos_shell/presentation/widgets/common/`; `lib/features/pos/presentation/widgets/new_sale/navigation/` |
| Actions | `PosPrimaryActionButton`, `PosPrimaryActionTokens`, `PosBottomOutlinedButton` | `lib/shared/widgets/pos_action_buttons.dart` |
| Colours | `TenantAdminColors.surface/bodyText/mutedText/success/warning/danger/border` | `lib/features/tenant_admin/presentation/theme/tenant_admin_theme.dart` |
| Type/layout | `TenantAdminTextStyles`, `TenantAdminSpacing`, `TenantAdminRadius`, `TenantAdminShadows.card` | same theme file |
| Responsive | `TenantAdminBreakpoints`, `TenantAdminInsets.pageForWidth` | same theme file |

Current `_ParkedSaleCard` is private, not shared. No shared POS table was verified; reuse available shared primitives first.

## API and Permission Mapping

Current GET `/api/v1/pos/holds?deviceId=` returns `holds` + `totalCount`; items
include IDs, customer snapshots, quantity-sum count, totals, currency, timestamps
and typed lines sufficient for View. It lacks scope/page/pageSize, filtered
`totalValue`, summary currency and pagination metadata. Approved pending extension
keeps GET and adds equivalent `scope=today|current-shift|all-active`, controlled
paging and server aggregates. Flutter never supplies tenant/cashier authority.

| Action | Permission |
|---|---|
| Open/list/detail | `sales.park.view` |
| Recall | `sales.park.recall` |
| Create/cancel | `sales.park.create` |
| Start New Sale | `sales.create` |

## Database Decision

No new business table or mandatory column is required. Reuse `pos_order_holds`, `pos_order_hold_events`, `sales_orders`, `sales_order_lines`, `till_sessions`,
`tills`, `pos_devices`, `till_device_assignments`, `customers`, `tenant_users`
and existing pricing/discount/tax/inventory tables. Till/session/customer/totals/
currency/count come from canonical relations or API calculation, not duplicated
hold columns. Conditional updates already permit one recall/cancel winner; no
row-version is mandatory. Assess an active-list composite index (tenant, holding
user, status, held time, expiry) before high-volume paging; no migration here.

## Non-Functional and Acceptance

Primary 1280×800 landscape: wide list+summary side by side; medium compact;
narrow summary below/secondary data in View. Reuse shared breakpoints; support
1/8/50+ rows, vertical scroll, 100–130% text, rotation, 44-pixel targets,
ellipsis/wrap, semantics, keyboard focus and non-colour status. No overflow,
clipping or navigation overlap. Backend enforces tenant/scope/totals; do not log
notes, tokens or full customer data. Correlate request, tenant/user/device/till/
session/hold/transition/result safely. Offline requires a separate outbox.

Specified tests cover navigation/permissions, filter/timezone boundaries, sort,
fallback/count/currency/aggregate, View, recall/cart protection, cancel/reason/no
hard delete, 409/unknown outcomes, states, responsive datasets/viewports/text,
shared-token reuse, no DB duplication and concurrent exactly-once transition.
They are covered by the executed focused suite and the limitations recorded
below. Documentation, Flutter/API implementation and authenticated mandatory
runtime validation are complete.

## Related Files

- [[Flutter_Park_Recall_Sale_Implementation_Specification]]
- [[../03_USER_JOURNEYS/Cashier/12_Park_Recall_Sale_Flow]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Park_Recall_Sale_Test_Cases]]
- [[../13_DECISIONS_AND_CHANGES/ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]]

## Chunk 3 Authenticated Runtime Acceptance — 2026-08-07

Authenticated cashier acceptance completed on Pixel Tablet (`emulator-5554`)
against the local API and PostgreSQL-backed development environment. The real
Dashboard → Recall Sale flow opened the existing `/pos/parked-sales` route in the
existing POS shell. Today, This Shift and All Parked Sales, authoritative
count/value/currency, newest-first rows, read-only View, empty-cart Recall,
non-empty-cart protection, required Cancel Reason and post-action refresh were
verified with real backend records.

Runtime fixes were limited to the existing implementation: give the route the
approved surface background, replace obsolete home wording, pop View with its
dialog context, and retain a stable provider/navigation context across
authoritative Recall/Cancel refresh. No duplicate route, screen, provider, theme
class, backend contract or database migration was introduced.

Runtime layout evidence passed at 1280×800, approximately 1680×1050,
2560×1600 and constrained 800×600 logical equivalents without Flutter overflow,
clipping or navigation loss. The final focused Flutter suite passed 44/44 and
`flutter analyze` reported no issues. Runtime pagination volume was limited to
three active holds; page mechanics remain covered by automated tests. Runtime
role switching, 130% text scale and forced network/401/403/409 failures were not
performed because safe environment controls were unavailable; existing
authorization, conflict, text/layout and error automated coverage remains the
authority for those ancillary cases.
