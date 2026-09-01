# Online Order OO-03 Canonicalization Status — 2026-09-01

## 1. Chunk scope and result

This tracker canonicalizes **OO-03 — Start Fulfilment Confirmation** only.
Chunk 1 changes Second Brain documentation only. It does not modify Flutter,
backend, database, migrations, tests or remotes.

**Chunk 1 result: COMPLETE — canonical contract synchronized.**

OO-03 is confirmation, not a separate workflow owner. OO-02 owns detail and
Start entry; OO-04 owns picking. Opening OO-03 is side-effect free.

## 2. Functional flow

```text
OO-02 authoritative detail
  → permitted/eligible Start action
  → OO-03 opens from current detail (no request, no mutation)
  → Cancel: close only
  → Confirm: one Start POST with current expectedVersion
      → success: refresh authority → OO-04 Picking
      → 409: no navigation → refetch OO-02 lifecycle/version → safe conflict
      → other failure: safe error; no local success
```

Required confirmation facts are Order, Customer, Collection outlet, Collect by,
server-time-derived remaining/overdue text, item count and unit count. Full
line-item picking belongs to OO-04. Prototype values are never production data.

## 3. Business and transaction rules

- Sales order must be `CONFIRMED` or `ACCEPTED`.
- Fulfilment may start only from `PENDING` or `ALLOCATED`; `PICKING`, `PICKED`,
  `PACKED`, `READY`, `FULFILLED`, `CANCELLED` and other ineligible states reject.
- Order, fulfilment, reservations and outlet must belong to the same tenant and
  authorized resource scope.
- Pickup header is `PENDING` with a confirmed slot reservation for the order.
- Inventory reservation is confirmed, same order/outlet and unexpired at
  authoritative server time.
- One transaction assigns the authenticated tenant user, transitions to
  `PICKING`, updates audit fields, increments `row_version`, appends exactly one
  `FULFILLMENT_STARTED` event, saves and commits.
- Any failed validation or concurrency error commits no partial mutation.
- Flutter never creates the event or establishes local `PICKING` success.

## 4. Permissions and permission-driven reflow

| Capability | Permission |
|---|---|
| Read order/detail context | `commerce.online_order.orders.access` + `commerce.online_order.orders.view` |
| Open/confirm Start through normal UI | `commerce.online_order.fulfilment.start` |

The frontend hides the complete Start region when Start permission is absent;
OO-02 reflows without an empty reserved slot and OO-03 has no normal bypass
route. Backend independently validates TenantOnly context, active tenant/user,
Click & Collect entitlement, active/authorized outlet, resource scope and Start
permission. Role-name authorization is forbidden.

## 5. API contract

Detail reuse/refresh:

```http
GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}?outletId={outletId}
```

Opening OO-03 should reuse the fresh loaded detail. The GET is used for normal
OO-02 load and required conflict refresh, not redundantly on every dialog open.

Confirmed Start:

```http
POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/fulfilment/start?outletId={outletId}
Content-Type: application/json

{ "expectedVersion": <current fulfillmentVersion> }
```

Success returns authoritative order/fulfilment identifiers, `PICKING` status,
assignee, server start timestamp and updated version. Existing common outcomes:
401 unauthenticated; 403 permission/entitlement/outlet authorization; 404
non-disclosing unavailable resource; 409 stale version, invalid lifecycle or
invalid reservation; 400 other safe validation. No OO-03 API or generic status
PATCH is authorized.

## 6. Concurrency and duplicate submission

`expectedVersion` is compared with `fulfillment_orders.row_version`. A stale
request returns HTTP 409 and never overwrites current state. OO-03 must not retry
blindly; Flutter refetches detail and replaces stale lifecycle/version.

While Confirm is in flight, the action is loading/disabled and a second request
is ignored. This is UX reliability only; backend concurrency token, lifecycle
validation and atomic transaction remain authoritative.

## 7. Database and attribute ownership

New OO-03 table: **NO**. New OO-03 column: **NO**. New OO-03 migration: **NO**.
Existing shared migration `20260831064535_AddSharedFulfillmentOrderConcurrency`
already owns `fulfillment_orders.row_version`; it is not screen-specific.

Reused authorities include sales orders/lines/history, fulfilment orders/lines/
events, pickup orders/events/slot reservations/slots, fulfilment-method outlets,
outlets, customers, sales channels, inventory reservations/lines/locations,
tenant users, payments, products/variants/images/media.

Relevant existing facts include order id/number/status/placed/source/tenant/
outlet; optional authoritative customer identity/classification; collection
outlet/window/timezone/reservation; fulfilment id/status/assignment/version;
item/unit/requested/picked/remaining quantities; and event prior/target state,
actor and timestamp. Today/Tomorrow/remaining/overdue/display labels are derived
presentation values and are not columns.

## 8. Frontend ownership and data flow

Canonical root: `lib/features/fulfilment_pickup/`.

- OO-03 presentation: `presentation/widgets/start_fulfilment_dialog.dart`.
- OO-02 entry/navigation: `presentation/screens/online_order_detail_screen.dart`.
- State/mutation/refetch: `presentation/providers/pos_online_orders_provider.dart`.
- Domain/data: existing entity, repository abstraction, repository
  implementation and remote datasource in the same feature.

```text
OO-02 / OO-03 UI
  → provider/controller
  → repository abstraction
  → repository implementation
  → remote datasource
  → existing staff API
```

Direct Dio calls, business mutation logic, backend DTO authority and mock
production values inside the dialog are forbidden.

## 9. Component reuse and theme

| Need | Owner | Decision |
|---|---|---|
| Wide confirmation route | `showAppDialog` | REUSE |
| Phone confirmation route | `showAppModalBottomSheet` | REUSE |
| Confirm | `PosPrimaryActionButton` | REUSE |
| Cancel | `PosBottomOutlinedButton` | REUSE |
| Theme/type/spacing/radius | `ThemeData` and canonical component registry | REUSE |
| Confirmation/summary composition | `StartFulfilmentDialog` | FEATURE-LOCAL |

The primary action consumes the backend-driven POS theme. Default `#FF6A00`
may become another tenant primary such as pink without feature code changes.
Semantic errors/successes remain semantic. No feature-local hardcoded Orange or
duplicated Material modal shell is canonical.

Conceptual responsibility breakdown: dialog icon/header; compact order,
customer, collection, collect-by and item/unit summary; Confirm; Cancel. This
does not require one class/file per row.

## 10. Responsive and accessibility

- Desktop/tablet landscape/tablet portrait: constrained shared dialog where
  space permits; phone: shared scroll-safe bottom sheet.
- No overflow or clipped actions; summary remains readable; keyboard insets,
  safe area and supported text scaling retain reachable Confirm/Cancel.
- Semantic dialog title, Confirm and Cancel; logical reading/focus order;
  keyboard/focus support and shared Escape/barrier dismissal behaviour.
- Touch targets follow the shared controls. No status or urgency meaning is
  communicated by colour alone.

## 11. Security, reliability and performance

- Tenant isolation, active tenant/user/outlet, entitlement, permission and
  resource scope are backend enforced; frontend hiding is not security.
- Errors are safe/non-disclosing. Do not display or log QR token/hash, auth
  tokens, payment/card secrets or unnecessary customer PII.
- Opening uses loaded detail and creates no extra network work. Confirm creates
  one mutation request; conflict creates one authoritative detail refresh. No
  OO-03 polling, N+1 or per-row API fan-out is authorized.
- No false navigation, silent stale overwrite, duplicate event or fake local
  lifecycle is allowed.

## 12. Observability

Safe backend facts may include correlation/trace id, tenant id, outlet id,
order id, fulfilment id, actor id, operation, previous/target status, result and
latency. QR material, auth/payment secrets and unnecessary customer PII are
excluded.

## 13. Current source audit and Chunk decisions

Current source proves the existing `ClickCollectOrdersController`, Start
application service/repository, `FulfillmentOrder.StartPicking`, EF concurrency
configuration, detail/Start DTOs, Flutter dialog/provider/repository/datasource
and focused tests. The command already enforces the canonical transaction and
error mapping.

**Chunk 2 decision: ALREADY COMPLETE / VERIFICATION ONLY.** No backend change is
expected unless verification finds drift from the current source audited here.

Chunk 3 owns final Flutter OO-03 acceptance: confirm the shared modal invocation
and feature-local content, real detail fields, expected version, duplicate lock,
success-only OO-04 navigation, 409 refetch, permission reflow, responsive and
accessibility behaviour, tenant-theme override, focused/full tests and
authenticated UI→API→database E2E. Existing source may be reused; no automatic
implementation starts from this tracker.

## 14. Contradictions resolved

1. Active documents claiming detail/Start backend handlers were missing were
   updated to the implemented canonical controller/service/repository status.
2. `Start Preparation` naming was normalized to **Start Fulfilment
   Confirmation**.
3. Feature-local orange was replaced by backend-driven theme-primary authority.
4. Permission-missing Start now means hidden with natural reflow, not a disabled
   reserved action.
5. Start response documentation no longer invents an `alreadyStarted` field;
   current authoritative response exposes updated `fulfillmentVersion`.
6. The shared concurrency migration is distinguished from the decision that
   OO-03 requires no new migration.

Historical trackers may retain dated discovery evidence where later sections
clearly supersede it.

## 15. Chunk 1 validation status

```text
Functional/business/permission/API/DB/frontend/backend rules: CANONICALIZED
New controller/API/table/OO-03 column/OO-03 migration: NO
Backend Chunk 2: ALREADY COMPLETE / VERIFICATION ONLY
Flutter Chunk 3 scope: DOCUMENTED
Flutter/backend/database source changed by Chunk 1: NO
Commit/push: NO
```

## 19. Strict visual alignment pass — COMPLETE (2026-09-01)

OO-03 presentation was aligned to the approved fixed confirmation target while
preserving the verified Start behaviour. The wide/tablet dialog now has a 420
logical-pixel maximum width, 16 radius and 20 padding. The phone route continues
to reuse the shared bottom-sheet helper, but OO-03 content is fixed and
non-scrollable on every tested viewport.

The feature-local composition separates the dialog icon, order summary and
summary-row presentation beneath `StartFulfilmentDialog`. It renders a centered
theme-primary fulfilment icon, centered title and two-line supporting copy, one
subtle bordered summary surface with five icon/value rows, semantic collection
urgency and a vertical full-width Confirm-then-Cancel action stack. The actions
continue to reuse `PosPrimaryActionButton` and `PosBottomOutlinedButton`.

Long production values are visually bounded to two lines with ellipsis while
their complete label/value remains available to semantics. No prototype order,
customer, outlet, time, count or branding colour was embedded.

### Runtime visual and responsive evidence

The updated debug build was installed and exercised on the connected Android 15
Pixel Tablet at 2560 × 1600. The authenticated cashier journey Home → Online
Orders → accepted order → Start Fulfilment rendered the updated modal completely
inside one centered surface. Direct screenshot comparison found the approved
hierarchy, narrower/taller proportion, icon, centered copy, summary card, row
icons, right-aligned values, semantic overdue emphasis and vertical full-width
button stack materially aligned. No content was clipped, overflowed or placed
below the visible modal.

Deterministic responsive coverage exercised desktop 1440 × 900, tablet
landscape 1180 × 820, tablet portrait 800 × 1100, phone 600 × 900 and small phone
390 × 844. Every viewport displayed the icon, all five summary facts, Confirm
and Cancel with no exception. The target modal path contains no internal
scrollable.

```text
Focused OO-03/related tests:               54 passed, 0 failed, 0 skipped
Full Flutter suite:                        1,362 passed, 0 failed, 1 skipped
  (pre-existing opt-in physical Local Print Agent acceptance test)
Actual Pixel Tablet screenshot:             PASS
Fixed/non-scrollable modal:                  PASS
Overflow/clipping:                           NONE
Backend/API/database/migration changed:      NO
Provider/business/permission/navigation:     NO CHANGE
Commit/push:                                 NO
```

## 16. Chunk 2 backend verification — BLOCKED (2026-09-01)

Chunk 2 began as verification-only and stopped when static source inspection
proved a production rule mismatch. No production/test/database/migration/API
code was changed and no Chunk 3 work began.

### Verified blocker: pickup reservation outlet scope is not enforced

Canonical rule: Start requires a confirmed pickup-slot reservation for the same
tenant, order **and requested fulfilment outlet**.

Actual owner:
`src/E_POS.Infrastructure/Modules/ECommerce/CustomerOrders/Repositories/PosOnlineOrderStartFulfillmentRepository.cs`,
`StartAsync`, lines 80–85 at verification time.

The current `pickupReservationValid` query checks only:

- reservation tenant;
- reservation id linked from the pickup header;
- sales order id;
- `CONFIRMED` status.

It does not join `PickupSlotReservation.PickupSlotId` to `PickupSlot`, then
`PickupSlot.FulfillmentMethodOutletId` to `FulfillmentMethodOutlet`, and does not
prove that the slot's outlet equals the requested `outletId`. The model contains
both relationships, so a confirmed same-order reservation belonging to another
outlet can satisfy the current predicate. Inventory reservation outlet scope is
checked separately and does not repair the pickup-slot scope omission.

Expected behaviour: mismatched pickup-slot outlet returns
`online_orders.invalid_reservation`/HTTP 409 with no fulfilment mutation,
assignment, version increment or event.

Actual behaviour: when the other current predicates are valid, the pickup
reservation predicate can pass without proving its outlet. Existing integration
tests cover valid reservations and missing reservations, but no wrong-slot-
outlet rejection test exists.

Minimum proposed fix, pending explicit approval:

1. extend the existing bounded reservation validation query to join the slot and
   fulfilment-method-outlet and require the canonical `outletId`/tenant scope;
2. add a repository integration test with a confirmed same-order reservation
   attached to a slot for a different outlet;
3. assert failure, unchanged status/assignment/version and zero
   `FULFILLMENT_STARTED` events;
4. rerun focused unit/API/integration suites and solution build.

API contract change: **NO**. Database/schema/migration change: **NO**. New
controller/service/repository: **NO**.

### Verification disposition

```text
Ownership/routes/detail/start DTO: SOURCE-VERIFIED
Authentication/permission/entitlement/concurrency/lifecycle/event structure:
  SOURCE-VERIFIED, but full Chunk 2 acceptance stopped at blocker
Focused tests/build/Development DB/authenticated runtime:
  NOT EXECUTED after blocker, per stop-on-defect instruction
Backend production files changed by Chunk 2: NO
Test files changed by Chunk 2: NO
Flutter/database/migration/API contract changed by Chunk 2: NO
Chunk 2 final status: BLOCKED — VERIFIED BACKEND DEFECT
Chunk 3 readiness: NOT READY
```

## 17. Chunk 2 backend defect resolution — COMPLETE (2026-09-01)

Section 16 remains the dated discovery record. The explicitly approved bounded
fix is now implemented and supersedes its blocked disposition.

### Root cause and production fix

The existing `StartAsync` pickup-reservation predicate proved tenant,
reservation id, sales order and `CONFIRMED` status, but did not prove that the
reservation's slot belonged to the requested fulfilment outlet.

The canonical repository now performs one bounded server-side query across:

```text
PickupSlotReservation
  → PickupSlot (same tenant and pickup_slot_id)
  → FulfillmentMethodOutlet (same tenant and fulfilment_method_outlet_id)
  → requested outletId
```

It also retains the same-tenant, same-order and `CONFIRMED` reservation
predicates. A mismatch continues through the existing safe
`online_orders.invalid_reservation` business-conflict mapping. The validation
remains before assignment, lifecycle mutation, version increment, event append,
`SaveChanges` and transaction commit.

Production owner changed:

- `src/E_POS.Infrastructure/Modules/ECommerce/CustomerOrders/Repositories/PosOnlineOrderStartFulfillmentRepository.cs`
  — `StartAsync` only.

No route, request/response DTO, controller, service, domain lifecycle, database
schema or migration was changed for this fix.

### Regression evidence

Repository/integration coverage now proves:

- a valid same-outlet reservation succeeds, assigns the authenticated tenant
  user, transitions `PENDING` to `PICKING`, increments version `5 → 6`, and
  appends exactly one `FULFILLMENT_STARTED` event;
- a confirmed same-order reservation whose slot resolves to another outlet is
  rejected with unchanged status, null assignment, unchanged version `5`, and
  zero events;
- unconfirmed, wrong-order and cross-tenant pickup reservations are rejected
  without mutation or event;
- an expired inventory reservation is rejected without mutation or event;
- two requests using expected version `5` produce one success and one
  concurrency conflict, without reassignment, second transition, second version
  increment or duplicate event;
- missing reservations remain rejected without mutation or event.

The existing domain/service/API coverage also re-verifies eligible
`PENDING`/`ALLOCATED` transitions, terminal-state rejection, authenticated actor,
server-clock authority, permission, entitlement, stable non-disclosing error
codes, route/binding/auth pipeline and HTTP 409 mapping.

### Verification results

```text
Unit (ECommerce.CustomerOrders):        41 passed, 0 failed, 0 skipped
API (ECommerce.CustomerOrders):         32 passed, 0 failed, 0 skipped
Integration (ECommerce.CustomerOrders): 23 passed, 0 failed, 0 skipped
Relevant backend total:                 96 passed, 0 failed, 0 skipped
Solution build:                         PASS, 0 warnings, 0 errors
Development PostgreSQL inspection:      NOT EXECUTED
  (psql and a safe credential-bearing environment connection were unavailable;
   deterministic EF integration/model coverage remains passing)
Authenticated real API runtime:         NOT EXECUTED
  (no isolated authenticated runtime dataset was established)
Static canonical Start-path audit:      PASS
Remaining verified OO-03 backend defects: NONE
Flutter changed by this Chunk 2 fix:     NO
DB schema/new table/new column:          NO
Migration created:                      NO
API contract/new controller/service:    NO
Commit/push:                             NO
Chunk 2 final status:                    BACKEND VERIFIED — COMPLETE
Chunk 3 readiness:                       READY (not started)
```

## 18. Chunk 3 Flutter implementation and validation — COMPLETE (2026-09-01)

OO-03 remains owned by
`lib/features/fulfilment_pickup/presentation/widgets/start_fulfilment_dialog.dart`.
The implementation reuses `showAppDialog` for wide viewports,
`showAppModalBottomSheet` for phone viewports, `PosPrimaryActionButton` for
Confirm and `PosBottomOutlinedButton` for Cancel. No direct Dio call or new
feature folder/modal owner was introduced.

### Implemented behaviour

- Opening uses the already loaded OO-02 detail and performs no Start request,
  local lifecycle change, assignment, version change or navigation.
- The confirmation renders authoritative order number, customer, collection
  outlet, collection time, backend-server-time-derived remaining/overdue text,
  item count and unit count. Production sample values are not embedded.
- Cancel closes only and calls no mutation.
- Confirm stays inside the modal while the existing provider/repository/
  datasource Start chain runs. It sends the selected detail's current
  `fulfillmentVersion` as `expectedVersion` with the canonical order/outlet.
- In flight, Confirm is loading/disabled, Cancel is disabled, modal dismissal is
  blocked and repeated taps cannot issue a second request.
- Success consumes the authoritative response, refreshes detail/list authority
  through the provider and navigates once to OO-04 Picking.
- HTTP 409 returns no success result/navigation, refetches OO-02 detail,
  replaces stale lifecycle/version and exposes the safe refreshed-state message.
- Start remains absent without `commerce.online_order.fulfilment.start` and for
  `PICKING`, `PICKED`, `PACKED`, `READY`, `FULFILLED` and `CANCELLED`; no empty
  action region is retained.
- Confirm colour comes from `ThemeData.colorScheme.primary`; Orange-like and
  Pink-like theme tests both pass. No OO-03 hardcoded branding colour exists.
- The shared modal/dialog semantics, Confirm/Cancel semantics and shared focus/
  dismissal policies remain in force.

### Automated evidence

```text
dart format: PASS
flutter analyze: PASS — no issues
Focused OO-03/related suite: 54 passed, 0 failed, 0 skipped
  Includes authoritative content/open/cancel, exact Start arguments,
  duplicate-submit/loading, 409 refresh/version replacement, permission,
  lifecycle, accessibility semantics, two theme primaries and desktop/tablet
  landscape/tablet portrait/phone/small-phone responsive coverage.
Full flutter test: 1,362 passed, 0 failed, 1 skipped
  Skip is the pre-existing opt-in physical Local Print Agent acceptance test.
```

### Runtime disposition

Authenticated Flutter→API→database OO-03 runtime, two-session runtime 409,
runtime permission comparison and live tenant-theme switch were **NOT EXECUTED**:
no isolated authenticated runtime dataset and safe multi-user/theme test setup
were established during this chunk. No shared/demo order or tenant setting was
mutated. Deterministic Flutter coverage and the completed Chunk 2 backend suite
provide source-level and automated contract evidence, but actual-device runtime
acceptance remains open.

```text
Backend/API/database/schema/migration changed by Chunk 3: NO
Permission code/header/footer changed by Chunk 3: NO
Remaining verified source/automated OO-03 defects: NONE
Chunk 3 final status: COMPLETE
Overall OO-03 status: RUNTIME ACCEPTANCE PENDING
Commit/push: NO
```
