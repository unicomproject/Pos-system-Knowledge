# Online Orders OO-01 — Canonicalization Status

**Updated:** 2026-09-09  
**Journey:** `POS-UJ-036`  
**Scope:** Chunks 1–3 — Second Brain, backend contract and Flutter OO-01  
**Status:** COMPLETE — implementation, static validation and authenticated runtime acceptance passed

## Search scan extension (2026-09-10)

Scope: extend only the existing search interaction, not the original whole-screen acceptance above. Search field EXTEND (`Oo01Header`); scanner service REUSE (`PosBarcodeScannerListener` / `PosHidScannerInputService`); list, search repository/API and 400 ms debounce REUSE. No new shared component, role checks, backend, DB, migration, commit or push.

OO-01 search accepts typed text or scanner input through the same canonical search pipeline. Scanner events provide query input only; authoritative matching remains the existing Online Orders API.

Placement: existing search prefix + `Search by order number, customer, phone or scan...` + vertical divider + compact right-side scan icon. Material styling inherits tenant theme. Tooltip/semantic label: `Scan order`; field: `Search or scan online orders`. Icon selects/focuses the field for HID input; background HID capture does not require tapping it. Focused text input and background capture are mutually exclusive. No camera integration or picking-card UI is added.

Backend evidence: `PosOnlineOrderDetailRepository.ListAsync` search predicates match `OrderNumber`, `ExternalOrderReference`, `CustomerNameSnapshot`, `CustomerPhoneSnapshot`. Plain searchable order/reference text is supported; opaque QR payloads/collection tokens are not interpreted. Unknown input uses the normal no-results state; empty/incomplete capture is silent; no auto-open or local result synthesis. Physical HID disconnection is not detectable through keyboard events, so no false hardware-health claim is made.

Provider extension cancels old list requests when query changes and rejects late responses by token/outlet identity. Outlet change clears old results and resets page; realtime refresh keeps query/filter/page. Widget lifecycle disables background capture off-route or while paused and disposes owned resources.

Automated evidence: scanner/affordance tests cover three sizes (1280x800, 1180x820, 1100x700), orange/pink themes, accessibility, HID, typing/debounce, empty/unknown/duplicate input, clear, focus/lifecycle and stale/outlet responses. Final focused OO-01 run: 16 passed / 0 failed / 0 skipped. Online Orders + HID listener + realtime regression run: 169 passed / 0 failed / 0 skipped (includes the focused tests; totals are not additive). Physical scanner/device acceptance is not claimed; use the existing hardware acceptance matrix. No live customer order is mocked in production.

Task-scoped frontend and documentation diff checks pass. The full Second Brain worktree diff check still reports a pre-existing trailing blank line in the unrelated OO05 prototype `README_COMPONENT_MAP.md`; this task preserves that edit. Application changes are limited to `pos_online_orders_screen.dart`, `oo01_online_orders_widgets.dart` and `pos_online_orders_provider.dart`; new coverage is `test/features/online_orders/oo01_scan_search_test.dart`. Existing unrelated edits remain untouched.

Full `flutter analyze --no-pub`: PASS, no issues (final run). Software implementation and automated validation are complete; authenticated physical-scanner/device acceptance remains separate and unverified.

## Realtime list refresh (2026-09-09 Chunk 1)

OO-01 list previously refreshed only on screen open / local fulfilment mutations. Chunk 1 wires `ecommerce.order_placed.staff` (and related Ecommerce order event types) through `NotificationInboxController` → `posOnlineOrdersProvider.refreshFromRealtime()` without resetting search/filter/page and without inserting raw socket DTOs. Bell ownership: `posNotificationsProvider`. Tracker: [[Online_Order_Realtime_Cashier_Refresh_Chunk1_2026-09-09]]. Live runtime proof deferred to Chunk 2.

## Layer status

| Layer | Status | Decision |
|---|---|---|
| Approved OO-01 experience | Implemented | Horizontal order-card queue with six authoritative aggregate cards and debounced server-side search. |
| Staff list API | Implemented | `GET /api/v1/tenant/ecommerce/click-collect/orders` supplies the bounded queue, six full-scope summary buckets, server time and bounded product previews. |
| Detail API | Reused | `GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}` is the read-only detail authority. |
| Theme API | Integrated | Authenticated `GET /api/v1/pos/theme` supplies primary and secondary colours; Flutter keeps centralized safe fallbacks for unavailable or malformed responses. |
| Database | No schema change | Existing order, customer, fulfilment, pickup, payment, setting-definition and tenant-setting authorities are reused. |
| Flutter | Implemented | Canonical owner is `lib/features/fulfilment_pickup/`; the prior `lib/features/online_orders/` implementation was reconciled into this owner. |
| Static validation | Passed | `flutter analyze` completed with no issues. The full Flutter suite completed with 1,240 passed, 1 intentional skip and 0 failures; focused customer, Online Orders, POS Shell, theme and tenant-admin inventory visual suites also passed. |
| Runtime/E2E | Passed | The Development API started successfully on port 5150 with working database connectivity. On the authenticated Pixel Tablet session, OO-01 loaded real API data and the order chevron opened the authoritative order-detail route successfully. |

## Final Flutter ownership

- Domain, data, provider, screen and widget ownership: `lib/features/fulfilment_pickup/`.
- OO-01 composition: `presentation/screens/pos_online_orders_screen.dart`.
- OO-01 target widgets: `presentation/widgets/oo01_online_orders_widgets.dart`.
- Stable detail-route adapter: `presentation/screens/pos_online_order_detail_route_screen.dart`.
- Shared POS route ownership remains `lib/features/pos_shell/pos_shell_router.dart`.
- Theme DTO, parser, repository and session-scoped provider remain shared under `lib/core/theme/`.

## Implemented canonical behaviour

- Reuses the existing cashier POS header and bottom navigation without introducing an Online Orders-specific shell.
- Shows title, approved subtitle and one wide debounced server-side search control.
- Shows exactly six backend-authoritative aggregate cards: New, Preparing, Ready, Delayed, Collected and Cancelled.
- Derives the aggregate total from those six backend buckets; no unsupported `totalCount` field is required.
- Renders full order/reference and customer values without prototype truncation.
- Uses backend `serverTime` for relative collection-window presentation.
- Shows item/unit information, payment/display status, bounded real product previews, remaining-preview count and a detail chevron.
- Navigates the chevron to `/pos/online-orders/:orderId`; OO-01 itself performs no fulfilment mutation.
- Provides loading, refresh-in-progress, error/retry, empty and empty-search states.
- Uses authenticated permission/entitlement checks through existing permission helpers; no role-name authorization is introduced.
- Fetches POS theme once per authenticated user session and resets cached state when the session identity changes.
- Uses centralized `#FF6A00` / `#000000` values only as safe theme fallbacks, not as OO-01 widget-local authority.

## Explicitly absent from OO-01

- Filters
- Status tabs
- Sort controls
- Table headers
- `Open` or `Start` action buttons
- Visible pagination controls
- Prototype mock order/customer/item/count data

Backend status, sort and pagination parameters may remain internal to the bounded data contract and later journey states.

## Responsive implementation

- Wide layouts use a horizontal title/search header, six-card summary row and horizontal order cards.
- Compact layouts stack the header, wrap summary cards and use stacked order-card content.
- Content remains real provider/API data in every viewport; no responsive branch introduces mock data.

## Evidence added

- Theme colour parsing and fallback tests.
- Online-order model/query/server-time/product-preview mapping tests.
- OO-01 widget checks for the approved header, six summary labels, removed legacy controls and empty-search state.

## Historical conflict resolution

The 2026-08-24 audit records the older visible table/tab/filter/pagination queue and `lib/features/online_orders/` ownership. It remains historical evidence only and is superseded for OO-01 by this status and the current canonical UI authorities.

## Production acceptance evidence — 2026-08-28

1. `flutter analyze` completed with `No issues found`.
2. The complete Flutter suite completed with 1,240 passed, 1 intentional skip and 0 failures.
3. Focused customer pagination/list, Online Orders OO01–OO06, POS Shell, POS theme and 29-screen tenant-admin inventory visual matrix suites passed.
4. The Development API listened on `http://0.0.0.0:5150`; startup database commands completed successfully.
5. An existing authenticated Pixel Tablet session loaded OO-01 with the assigned Development Main Store / Front Till 01 context.
6. The real staff list API produced six aggregate states, a real delayed order card, customer contact data, payment state and product preview.
7. Selecting the order chevron opened the authoritative detail view with real reference, collection, payment, item and total data.
8. No backend, API contract or database schema change was required by this final gate cleanup.

## 2026-08-28 outlet-access 403 remediation

- Root cause: the repository compared canonical lowercase `tenants.status = active` with uppercase `ACTIVE`, rejecting valid active tenants before outlet assignment evaluation.
- Backend outlet authorization now validates the active same-tenant staff record and ignores revoked outlet role/permission assignments.
- Active outlet-scoped assignments restrict access to their matching outlets; with no active scoped assignment the established tenant-wide fallback remains unchanged.
- Flutter maps `online_orders.outlet_access_denied` to a safe administrator-action message instead of a generic 403 message.
- Assignment changes are evaluated per API request, so Retry is sufficient when the activated device outlet is unchanged. A changed device assignment requires device-context refresh.
- Source, focused automated validation and authenticated runtime acceptance are recorded with the implementation handoff.
- Search debounce, six summary counts, real order cards, product previews and detail navigation are covered by the combined automated and runtime evidence above.
- Desktop, tablet landscape, tablet portrait, phone and small-phone responsive contracts pass without overflow.
- Unauthorized and API failure states are covered by focused permission/access tests without exposing backend exception text.

## 2026-08-31 root queue route regression repair

Authenticated runtime acceptance later proved that the active backend
`ClickCollectOrdersController` did not contain a parameterless `[HttpGet]`
action. The canonical root queue URL therefore returned HTTP 404 while its
GUID-constrained detail and Start routes remained registered.

The repair restores the existing bounded OO-01 list contract inside the same
controller/service/repository authority. It preserves `outletId`, `search`,
`status`, `sortBy`, `sortDirection`, `page`, and `pageSize`; the response still
provides items, six-bucket summary, pagination, total count and authoritative
server time. TenantOnly authentication, active tenant/user/outlet, Click &
Collect entitlement, both Online Order read permissions, tenant isolation and
outlet scope remain enforced. No competing controller was created.

Validation: solution build PASS; controller 12/12, auth/route pipeline 13/13,
application service 10/10 and repository integration 6/6 focused tests PASS.
The HTTP test host proves authorized root 200, unauthenticated root 401, detail
200 and Start 200 without route ambiguity. Real POS authenticated rerun remains
pending because the local API process could not remain available in this tool
session; no production-data success is claimed from the test host.

## 2026-09-01 frontend component-ownership cleanup

- `oo01_online_orders_widgets.dart` is the sole active OO-01 widget owner.
- The unreferenced alternate `online_orders_queue_widgets.dart` implementation
  was removed after proving zero production references; its two stale test
  references were migrated to the active owner.
- Six summary cards now consume named `OnlineOrderSummarySemantic` values.
- Payment presentation now uses exact normalized backend status mapping, so
  `UNPAID` cannot be classified as `PAID` by substring matching.
- Flutter analyze passed, focused Online Orders/shared-modal validation passed
  50/50, and the full Flutter suite passed 1,346 tests with one existing skip.
- No route, permission, API, backend, database or migration behaviour changed.
