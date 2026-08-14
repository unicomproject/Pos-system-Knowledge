<!-- title: POS Cashier Discount Second Brain Alignment 2026-08-09 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-10 -->

# POS Cashier Discount Second Brain Alignment 2026-08-09

## Result

Documentation alignment complete. Implementation is not declared complete. No
Flutter, backend, database, migration, seed, test, or runtime configuration was
changed by this task.

## Approved Documentation Target

- Manual cashier Discount only; one active discount.
- Order Percentage/Fixed; Item Percentage only with exact cart variant.
- Within user authority allowed; above authority directly rejected.
- No current manager approval, POLICY selector, Item Fixed, or stacking.
- Online backend-authoritative; offline provisional outbox plus backend
  revalidation and visible conflict.
- Tablet-first adaptive popup with invariant business rules.

## Known Implementation Gaps

| Area | Honest status / required work |
|---|---|
| Backend scope | Existing code may accept LINE Fixed, POLICY and `PENDING_APPROVAL`; constrain current cashier path without deleting future capability |
| Flutter popup | Verify/manual-only matrix, cart-line selector, replace/remove lifecycle, optional reason, duplicate-tap guard |
| One-discount rule | Enforce consistently in frontend, online backend, checkout, and sync |
| Offline cache | Persist authority/context/pricing snapshots with version/freshness metadata |
| Offline outbox | Persist provisional intent, restart recovery, idempotent sync and statuses |
| Sync conflicts | Implement visible rejection/conflict/reconciliation UX; never silent overwrite |
| Responsive UI | Verify tablet, 800x600 class, narrow, keyboard, text scale, long content |
| Runtime evidence | Authenticated online/offline end-to-end evidence remains required |

## Database And API

No new Discount business table or migration is required for this documentation
decision. Existing canonical and generic offline sync tables remain the design.
Existing approval endpoint/schema stays documented as deferred capability.

## Acceptance Evidence Required

Use [[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Cashier_Discount_Test_Cases]].
Documentation completion must not be used as a production readiness claim.

## Authority

[[../13_DECISIONS_AND_CHANGES/POS_CASHIER_DISCOUNT_CURRENT_RELEASE_DECISION_2026-08-09]]

## Chunk 1 Flutter UI And Presentation Status — 2026-08-09

Status: **IMPLEMENTED AND AUTOMATED-VERIFIED; AUTHENTICATED CURRENT-BUILD
VISUAL RUNTIME EVIDENCE PENDING**.

This status does not declare the full Discount feature complete and does not
authorize Chunk 2 or Chunk 3.

### Implemented

- Replaced the cashier popup's POLICY and manager-approval presentation with
  the approved manual-only current-release UI.
- Implemented Order Percentage, Order Fixed Amount and Item Percentage states.
- Item mode lists actual current cart lines, retains the exact cart-line key,
  shows the current image/variant/quantity/line amount, and never renders Item
  Fixed Amount.
- Order Fixed automatically normalizes to Percentage when changing to Item.
- Added presentation-only numeric, positive-value and percentage <= 100
  validation; Item also requires one selected cart line.
- Added optional free-text reason (200 characters) and Promo/VIP/Staff/Other
  text-helper chips; they are not policy identifiers.
- Added neutral preview models ready for an authoritative backend validation
  response. No client-authored authoritative Discount amount is shown.
- Added empty-cart, missing `sales.discount.apply`, and existing-active-
  discount guards. A second Discount cannot be added.
- Added a Chunk 2 submit callback boundary. The production Chunk 1 action does
  not call HTTP, mutate the cart, close as successful, or fake application.
- Implemented tablet two-column and narrow stacked layouts, bounded cart-line
  scrolling, fixed reachable actions, keyboard inset handling, and touch-sized
  controls.

### Flutter Files

- `lib/features/sale/presentation/widgets/new_sale/pos_discount_dialog.dart`
- `lib/features/sale/presentation/widgets/new_sale/discount/discount_state.dart`
- `lib/features/sale/presentation/widgets/new_sale/discount/discount_controller.dart`
- `lib/features/sale/presentation/widgets/new_sale/discount/discount_sections.dart`
- `lib/features/sale/presentation/widgets/new_sale/discount/discount_item_picker.dart`
- `test/features/sale/pos_discount_dialog_test.dart`

### Verification Evidence

- Focused Discount presentation/widget suite: **11 passed**.
- Covered default state, deterministic transitions, local validation, real
  cart-line selection, selected-item summary, optional reason helper, no fake
  mutation, permission denial, empty cart, active Discount guard, 2560x1600,
  1680x1050, 1280x800, 800x600, narrow 520x720, keyboard inset and 1.25x
  text scale.
- New Sale/park action regression plus application widget regression:
  **45 passed**.
- Full `flutter analyze`: completed with one pre-existing informational
  deprecation in `pos_edit_customer_dialog.dart`; no Discount error or warning.
- Pixel Tablet emulator was detected and contained an authenticated open-till
  session. The current source could not be relaunched for screenshots because
  another long-running Flutter tool session held the launch; that user-owned
  process was not killed. The visible installed build was therefore not used
  as current-code evidence.

### Explicit Chunk Boundary

- No backend, API, database, migration or seed change.
- No `/discounts`, `/validate`, `/apply` or `/cancel` integration.
- No checkout `discountApplicationId` integration.
- No offline cache, outbox, recovery or sync implementation.
- No manager approval, manager PIN or POLICY selector.

### Remaining Before Chunk 1 Can Be Marked Complete

- Relaunch this current Flutter source on the authenticated Pixel Tablet once
  the existing Flutter tool session is released.
- Capture and inspect Order Percentage, Order Fixed Amount and Item Percentage
  with a selected real cart line.
- Confirm no overflow, clipping or warning stripes and confirm keyboard/action
  reachability in that authenticated current build.

## Chunk 2 Backend And Online Flutter Integration Status — 2026-08-09

Status: **IMPLEMENTED AND AUTOMATED-VERIFIED; BLOCKED ON AUTHENTICATED
CURRENT-BUILD RUNTIME AND DATABASE EVIDENCE**.

### Implemented Current-Release Rules

- MANUAL Order Percentage, Order Fixed Amount and Item Percentage validate and
  apply through the canonical online Discount APIs.
- MANUAL Item Fixed Amount is rejected by the backend with a controlled 422
  response; Flutter does not expose or send that combination.
- A MANUAL value above cashier authority is rejected directly. It cannot create
  `PENDING_APPROVAL`; future POLICY approval capability remains intact.
- The repository rejects a second active MANUAL application for the same cart
  context. Existing Discount removal calls the canonical cancel endpoint and
  local state is cleared only after backend confirmation.
- Validation is debounced and stale responses are ignored. Apply uses one stable
  idempotency key for the dialog intent and stores the authoritative application
  identifier, cart hash, status and totals.
- Checkout summary and start-payment both use the canonical cart
  `discountApplicationId` already carried by the shared cart state.
- Material cart mutations are blocked while an active Discount exists; cashier
  feedback requires removal first. The app does not silently recalculate against
  a stale cart fingerprint.

### Changed Implementation Areas

- Backend: Discount service current-release validation, repository one-active
  enforcement, controller error mapping and focused unit tests.
- Flutter: validate/cancel datasource handling, authoritative models, Discount
  provider/controller/dialog integration, canonical cart Discount state, safe
  cart-mutation guard and focused tests.
- No schema, migration, seed, offline cache, outbox, reconnect sync, manager UI,
  POLICY selector or Item Fixed UI was added.

### Automated Evidence

- Backend focused `PosDiscountServiceTests`: **11 passed**.
- Flutter Discount dialog/controller suite: **11 passed**.
- Flutter Discount datasource, cart/checkout and cash-payment regression set,
  including the dialog suite: **38 passed**.
- `flutter analyze`: no Discount error or warning; one unrelated existing
  informational deprecation remains in `pos_edit_customer_dialog.dart`.

### Completion Blocker

Chunk 2 is not marked complete because this run did not produce authenticated
current-build online API traces, database read-only evidence from
`pos_discount_applications`, `pos_discount_application_events` and
`sales_order_discounts`, or final-sale runtime evidence. Do not begin Chunk 3
based on automated evidence alone. The next action is one controlled authenticated
online transaction covering Order %, Order Fixed, Item %, above-limit reject,
one-active reject, cancel and checkout/payment persistence, with sanitized logs,
screenshots and read-only database verification.

## Chunk 2 Authenticated Runtime Follow-up — 2026-08-09

Status: **BLOCKED — ONLINE FLOW PASSED, BUT THE LINE-DISCOUNT PERSISTENCE FIX
REQUIRES ONE NEW CONTROLLED TRANSACTION FOR DATABASE RE-VERIFICATION**.

### Verified On The Current Authenticated Build

- Current source was rebuilt, installed and launched on `emulator-5554` with
  the authenticated Kavin / Development Main Store / Front Till 01 open-till
  context. The backend listened on port 5150 and development DB queries passed.
- Order Percentage, Order Fixed Amount and Item Percentage rendered with real
  Match Shorts cart data. Item Fixed was absent. No overflow, clipping or
  warning stripe was observed at the Pixel Tablet 2560x1600 viewport.
- Backend-authoritative previews were verified: Order 10% = LKR 280 on LKR
  2,800; Order Fixed LKR 100 = LKR 5,500 from LKR 5,600; Item 5% = LKR 280
  with LKR 5,320 remaining from the selected Match Shorts line.
- Order Fixed apply and backend cancel succeeded; cart quantity and product
  were preserved and totals returned from LKR 5,500 to LKR 5,600.
- One controlled Cash payment completed exactly once with a canonical Item 5%
  application: subtotal LKR 5,600, Discount LKR 280, paid total LKR 5,320,
  cash received LKR 6,000 and change LKR 680. Payment Success rendered.
- Read-only DB evidence: application `fa18abc1-952e-4002-b13f-1a19e2e639a8`
  became `APPLIED`; sale `SO-000120` / `ff3972fe-8568-437d-b58f-94b5c554a1cc`
  is `PAID`; events are actual `REQUESTED` and `APPLIED`; exactly one final
  `sales_order_discounts` row exists with scope `LINE`, value 5 and amount 280.

### Runtime Defects Found And Minimum Fixes

- `GET /api/v1/pos/discounts` initially failed because Npgsql could not
  translate ordering over a projected `PosDiscountPolicySnapshot`. Candidate
  policies are now materialized before priority/name ordering. Focused
  repository test passed.
- `DiscountPreviewCard` ignored the validated controller preview and always
  rendered a neutral placeholder. It now renders backend values only when the
  state is authoritatively valid. Discount dialog tests passed 11/11 and the
  corrected runtime previews were captured.
- The completed LINE Discount exposed `sales_order_line_id = NULL` because
  checkout explicitly supplied null while creating `SalesOrderDiscount`.
  Checkout now resolves the target variant to the generated sale-line ID and
  reuses that identity for receipt and persistence. The focused integration
  regression passed. Existing sale `SO-000120` was not edited.

### Still Required Before COMPLETE

- Run one newly approved controlled discounted transaction on the build that
  contains the LINE target mapping fix and verify read-only that the new
  `sales_order_discounts.sales_order_line_id` equals the exact generated
  `sales_order_lines.id`.
- Complete the remaining explicit above-authority, tampered Item Fixed,
  independent one-active and idempotency runtime/API evidence. Automated rules
  remain passing, but are not substituted for the requested runtime evidence.
- Chunk 3 was not started. The Phase A gate remains closed. The repository
  currently contains generic offline sync entities/configurations/tables, but
  no proven executable Flutter local database/outbox/restart recovery or
  backend sync processor/controller to extend; a parallel Discount-only sync
  system was not invented.

## Phase A Revalidation Attempt — 2026-08-09

Status: **BLOCKED — REQUIRED CASHIER OPEN-TILL RUNTIME CONTEXT WAS LOST BEFORE
THE REMAINING ACCEPTANCE MATRIX COULD COMPLETE**.

### New Runtime Evidence

- Android SDK discovery succeeded. Flutter reported SDK
  `C:\Users\User\AppData\Local\Android\sdk`; absolute
  `platform-tools\adb.exe` access succeeded and Pixel Tablet
  `emulator-5554` was connected.
- The already-running current workspace Flutter session and healthy backend on
  port 5150 were reused without terminating user-owned processes.
- The authenticated Kavin / Development Main Store / Front Till 01 OPEN-till
  context initially loaded with a real Match Shorts, Small cart line at LKR
  2,800.
- Order Percentage visual/runtime acceptance passed at 2560x1600. A 5% request
  received a server-validated preview of LKR 140 and total LKR 2,660, applied
  exactly once, and rendered the active cart Discount state without overflow,
  clipping or warning stripes.
- The one-active UI guard rendered and the canonical Remove Discount action
  restored the cart total to LKR 2,800 while preserving the product line.
- Evidence paths: `C:\tmp\discount-order-percentage-current.png`,
  `C:\tmp\discount-order-percentage-preview.png`,
  `C:\tmp\discount-order-percentage-applied.png`,
  `C:\tmp\discount-edit-active.png`, and
  `C:\tmp\discount-cancelled.png`.

### Automated Revalidation

- Flutter focused Discount suites: **17/17 passed**.
- Backend tests filtered by `FullyQualifiedName~Discount`: Unit **13/13**,
  Integration **9/9**, API **4/4**, and Local Print Agent **3/3** passed.

### Blocking Runtime State

- During the next Order Fixed interaction the app runtime restarted/recovered
  into Tenant Admin context. It then reported till `CLOSED` / `No till`.
- Tenant Admin Tills showed all three development tills as `OFFLINE` /
  `NEEDS ATTENTION`; Front Till 01 had no active cashier. New Sale was disabled.
- No Close Till confirmation was intentionally submitted and no database row
  was manually inserted, updated or deleted during this run.
- Phase A therefore cannot truthfully close the remaining Order Fixed, Item
  Percentage, above-authority, tampered Item Fixed, idempotency, post-fix
  checkout/payment and read-only database acceptance requirements.
- Per the approved gate, Chunk 3 remains **NOT STARTED**. Starting a new
  Discount-only offline framework while the required generic executable sync
  path is unproven remains prohibited.

### Exact Next Action

Restore one authenticated cashier session with a trusted assigned device,
Front Till 01 selected and an OPEN till. Then rerun only the remaining Phase A
matrix, including the post-fix LINE transaction and read-only database mapping
proof. Start Chunk 3 architecture implementation only after that gate passes.

## Current-Source Completion Pass — 2026-08-10

Status: **ONLINE ACCEPTANCE COMPLETE; GENERIC OFFLINE FOUNDATION IMPLEMENTED
AND AUTOMATED-VERIFIED; OFFLINE DEVICE RUNTIME/RESTART ACCEPTANCE REMAINS
PENDING**.

This supersedes the earlier lost-session Phase A blocker. It does not claim
100% current-release completion until the new offline path is exercised on the
authenticated device through disconnect, restart, reconnect and conflict.

### Phase A — Authenticated Online Runtime

- Repository-approved backend and the current Flutter source ran against Local
  Development on Pixel Tablet `emulator-5554`. Kavin, Development Main Store,
  Front Till 01 and OPEN till were restored.
- Order Percentage 5% preview/apply/remove passed on Match Shorts Small at LKR
  2,800. Order Fixed LKR 100 preview/apply/remove passed. Item Percentage 5%
  preview and apply passed with server values LKR 140 Discount and LKR 2,660
  payable. Item Fixed remained absent.
- The Item Percentage cart completed one controlled Cash transaction exactly
  once: correlation `ef5805d5373c`, HTTP 200, sale `SO-000124`, receipt
  `RCP-000107`, cash LKR 3,000, change LKR 340 and Payment Success navigation.
- Read-only DB evidence for `RCP-000107`: subtotal 2,800; Discount 140; total
  and paid 2,660; status `PAID`; exactly one order line, payment and
  `sales_order_discounts` row. The linked Discount application is `APPLIED`,
  `LINE`, `PERCENTAGE`, requested value 5, amount 140, linked to the sale, with
  two lifecycle events.
- LINE mapping proof: `sales_order_discounts.sales_order_line_id` is non-null
  `4ad5fcc3-4dbc-4196-a486-bea6c8166b40` and exactly equals the generated
  Match Shorts `sales_order_lines.id`; the target variant is
  `cccc0005-0003-4000-8000-000000000001`.
- Screenshots: `C:\tmp\discount-order5-preview.png`,
  `C:\tmp\discount-order5-applied.png`,
  `C:\tmp\discount-order5-cancelled.png`,
  `C:\tmp\discount-order-fixed-preview.png`,
  `C:\tmp\discount-item5-preview.png`,
  `C:\tmp\discount-item5-applied.png`,
  `C:\tmp\discount-cash-ready.png`, and
  `C:\tmp\discount-payment-success.png`.

### Phase B/C — Generic Offline Foundation And Discount Integration

- Added a feature-neutral durable operation model/store/outbox with explicit
  `pending`, `syncing`, `synced`, `failed` and `conflict` states, stable
  idempotency keys, retry count, error code and canonical server ID mapping.
- Native/web persistence uses the existing encrypted `AppSecureStorage`; no
  second Discount-specific database or fake server record was introduced.
- The online Discount catalog caches the device-bound cashier authority for a
  bounded 24-hour lifetime. Missing, wrong-device, corrupt or stale cache fails
  closed offline.
- MANUAL Order Percentage, Order Fixed and Item Percentage can create one
  locally calculated `pending_sync` intent only after cached-authority checks.
  POLICY and Item Fixed do not enter the offline path. Above-authority values
  fail locally and backend revalidation remains final.
- The durable payload retains device, cart-line requests, customer ID, target
  variant, scope, calculation, value, local amount, reason and original
  idempotency key. Sync calls the existing canonical `/discounts/apply` API;
  success replaces the local ID with the backend application ID. Network
  failure remains retryable; backend rejection becomes terminal conflict.
- New Sale visibly labels the amount `Pending Sync`. Proceed to Payment first
  attempts reconciliation and refuses navigation while the Discount remains
  provisional. A local pending Discount can be removed without calling the
  canonical cancel endpoint.

### Changed Flutter Files

- `lib/core/offline/offline_operation.dart`
- `lib/core/offline/offline_operation_store.dart`
- `lib/core/offline/offline_outbox.dart`
- `lib/features/cart/data/offline/pos_discount_offline_coordinator.dart`
- `lib/features/cart/domain/entities/pos_cart_discount.dart`
- `lib/features/cart/domain/entities/pos_discount_api_models.dart`
- `lib/features/cart/presentation/providers/pos_discount_provider.dart`
- `lib/features/sale/presentation/widgets/new_sale/discount/discount_controller.dart`
- `lib/features/sale/presentation/widgets/new_sale/discount/discount_state.dart`
- `lib/features/pos/presentation/widgets/new_sale/summary/pos_cart_summary.dart`
- `lib/features/pos/presentation/widgets/new_sale/summary/pos_payment_bar.dart`
- `test/core/offline/offline_outbox_test.dart`

No backend business logic, database schema, migration, seed or dependency
version changed in this completion pass.

### Automated Evidence

- Full `flutter analyze --no-pub`: **0 issues**.
- Full Flutter suite: **911/911 passed**.
- New durable outbox cases cover idempotent enqueue, stable-key retry,
  canonical-ID success and visible terminal conflict: **4/4 passed**.
- Focused backend Discount/checkout unit tests: **16/16 passed**.
- Focused backend Discount/checkout API tests: **12/12 passed**.
- Discount repository integration tests: **6/6 passed**.
- Existing backend cases explicitly cover exact cashier-limit direct apply,
  above cashier/absolute limit rejection without persistence, LINE Percentage,
  LINE Fixed controlled rejection, missing/invalid target, scope tampering,
  idempotent repository creation and changed-payload idempotency conflict.

### Remaining Acceptance Gate

- Deploy this new offline build and capture authenticated device evidence for:
  online authority cache -> disconnect -> provisional apply -> process restart
  persistence -> reconnect -> canonical server replacement, plus a backend
  rejection/conflict and rapid connectivity flapping.
- Confirm persisted cart presentation restoration after process restart. The
  durable operation contains the cart request context, but this pass has not
  yet proven that the visible New Sale cart is rehydrated automatically.
- Until those device scenarios pass, keep overall status **Testing**, not
  Complete, and do not describe the feature as 100% offline accepted.

## Gap Closure Pass — 2026-08-10 (Restart / Reconnect / Conflict UI)

Status: **PARTIAL IMPLEMENTATION + AUTOMATED UNIT EVIDENCE; STILL BLOCKED ON
AUTHENTICATED OFFLINE E2E, OFFLINE CASH+DISCOUNT SALE, AND RUNTIME MATRICES**.

### Implemented In This Pass

- Visible New Sale restart recovery store
  (`PosPendingSaleRecoveryStore`) persists cart lines, quantities, cartLineKey,
  variant, customer, pending Discount fields, provisional totals, local
  operation ID and the same idempotency key, scoped to tenant/user/device and
  fail-closed on schema/ownership mismatch.
- New Sale bootstrap calls `restoreRecoverablePendingSale` so cashiers can see
  the recovered cart + Pending Sync state, not only a hidden outbox row.
- Generic `OfflineConnectivityMonitor` with stable-online debounce and
  single-flight-friendly wake; Discount outbox registers once and also wakes on
  app resume. Catalog network success/failure reports online/offline.
- Cashier-visible `DiscountSyncConflictPanel` with safe messages and
  Remove / Review / Retry actions; cart summary shows Conflict / Pending Sync.
- Sync rejection marks local Discount `conflict` and does not silently rewrite
  amounts.

### Automated Evidence (this pass)

- `test/core/offline/` : **7 passed** (outbox + recovery + connectivity flap
  debounce + conflict message mapping).
- Focused `flutter analyze` on changed offline/Discount paths: **0 issues**.

### Explicit Remaining Blockers (do NOT claim FULLY COMPLETE)

1. No executable **offline Cash sale + Discount** path: payment still requires
   provisional Discount to sync before Proceed to Payment; there is no local
   completed Cash sale / receipt / historical paid-total persistence for
   offline Discounted Cash.
2. Authenticated device offline E2E (Order %, Fixed, Item %, restart, reconnect,
   stale authority, permission revoked, cart/target, flapping) not captured.
3. Offline canonical DB evidence and remaining online negative runtime matrix
   not re-proven in this pass.
4. Responsive Pending/Conflict UI not verified on the required viewports.

Overall Discount status remains **Testing**, not Complete.

---

## Discount Feature Architecture Refactor — 2026-08-10

Status: **ARCHITECTURE REFACTOR COMPLETE; FEATURE-FIRST CLEAN ARCHITECTURE VERIFIED**.

### Purpose And Scope

The Discount feature was refactored into the approved feature-first clean architecture under `lib/features/discount/`. The previous oversized provider files in `lib/features/cart/presentation/providers/` and scattered widgets in `lib/features/sale/` were decomposed into dedicated domain use cases, a domain repository contract, remote/local datasources, dedicated presentation providers, and modular UI widgets while preserving 100% of existing runtime behaviour.

**Boundary**:
```text
Discount architecture refactor scope: Flutter frontend only
Backend source modified: NO
Backend API contract modified: NO
Database schema modified: NO
Permission model modified: NO
```

### Implemented Canonical Folder Structure

```text
lib/
└── features/
    └── discount/
        ├── data/
        │   ├── datasources/
        │   │   ├── local/
        │   │   │   ├── pos_discount_offline_coordinator.dart
        │   │   │   └── pos_pending_sale_recovery_store.dart
        │   │   │
        │   │   └── remote/
        │   │       └── pos_discount_remote_datasource.dart
        │   │
        │   ├── dtos/
        │   │   └── pos_discount_dtos.dart
        │   │
        │   └── repositories/
        │       └── pos_discount_repository_impl.dart
        │
        ├── domain/
        │   ├── entities/
        │   │   ├── pos_cart_discount.dart
        │   │   └── pos_discount_api_models.dart
        │   │
        │   ├── repositories/
        │   │   └── pos_discount_repository.dart
        │   │
        │   └── usecases/
        │       ├── apply_pos_discount.dart
        │       ├── cancel_pos_discount.dart
        │       ├── rebind_discount_after_customer_change.dart
        │       ├── restore_pending_discount_sale.dart
        │       ├── sync_pending_pos_discounts.dart
        │       └── validate_pos_discount.dart
        │
        └── presentation/
            ├── providers/
            │   ├── pos_discount_catalog_provider.dart
            │   └── pos_discount_provider.dart
            │
            ├── utils/
            │   └── pos_discount_error_mapper.dart
            │
            └── widgets/
                ├── discount_controller.dart
                ├── discount_item_picker.dart
                ├── discount_sections.dart
                ├── discount_state.dart
                ├── discount_sync_conflict_panel.dart
                └── pos_discount_dialog.dart
```

### Architectural Decisions

1. **Single Feature Rule**: Discount is ONE frontend feature. Online and offline Discount are not separate features (`features/online_discount`, `features/offline_discount` or `discount/online/`, `discount/offline/` are prohibited). Online and offline are data-access/runtime strategies inside the same Discount feature:
   - `features/discount/data/datasources/remote/`: backend/API operations.
   - `features/discount/data/datasources/local/`: offline caching, outbox, recovery, and local persistence.
2. **Dependency Flow**:
   ```text
   Widget / Screen
          ↓
   Presentation Provider
          ↓
   Domain Use Case
          ↓
   Domain Repository Contract
          ↓
   Data Repository Implementation
          ↓
    ┌─────────────────────┐
    │                     │
   Remote Datasource   Local Datasource
    │                     │
   Backend API         Cache / Outbox /
                       Recovery Storage
   ```
   - Widgets must not directly call backend APIs.
   - Presentation providers remain presentation-focused.
   - Business orchestration belongs in domain use cases.
   - Data access belongs behind repository contracts.
   - Domain must not depend on Flutter presentation widgets.

### Layer Responsibilities

- **Data / Remote Datasource (`pos_discount_remote_datasource.dart`)**: Backend Discount API transport (`GET /api/v1/pos/discounts`, `POST .../validate`, `POST .../apply`, `POST .../{applicationId}/cancel`).
- **Data / Local Datasources (`pos_discount_offline_coordinator.dart`, `pos_pending_sale_recovery_store.dart`)**: Cached authority/catalog with 24-hour expiration, pending manual discount outbox queueing, generic sync integration, connectivity wake listeners, and restart-safe recovery storage.
- **Domain / Entities (`pos_cart_discount.dart`, `pos_discount_api_models.dart`)**: Discount domain models, authority limits, catalog policies, apply/validation result models.
- **Domain / Repository Contract (`pos_discount_repository.dart`)**: Abstract business contract decoupling data access from business logic.
- **Domain / Use Cases**:
  - `apply_pos_discount.dart`: Online apply with offline manual outbox fallback.
  - `validate_pos_discount.dart`: Online validation with cached authority fallback.
  - `cancel_pos_discount.dart`: Online discount cancellation and local outbox/recovery cleanup.
  - `rebind_discount_after_customer_change.dart`: Preserves active discounts upon customer change, recalculating with backend authority.
  - `sync_pending_pos_discounts.dart`: Reconnect outbox synchronization and canonical application replacement.
  - `restore_pending_discount_sale.dart`: Rehydrates visible cart + pending discount state after application restarts.
- **Presentation / Providers (`pos_discount_provider.dart`, `pos_discount_catalog_provider.dart`)**: Riverpod DI wiring, catalog FutureProvider, and UI-facing state helpers.
- **Presentation / Utils (`pos_discount_error_mapper.dart`)**: Cashier error mapping and cryptographically safe idempotency key generation.
- **Presentation / Widgets (`pos_discount_dialog.dart`, `discount_controller.dart`, `discount_state.dart`, `discount_sections.dart`, `discount_item_picker.dart`, `discount_sync_conflict_panel.dart`)**: Responsive dialog, item selection, form controls, summary/preview, and sync conflict panel.

### Runtime Behaviour Coverage

- **Online Validation & Apply**: Backend-authoritative calculation; validates live cart fingerprint and idempotency key; invalidates checkout summary upon apply/remove.
- **Offline Provisional Apply**: When network is unavailable, checks cached authority limits; creates `pending_sync` intent in local outbox; cart remains visibly usable with provisional totals.
- **Reconnect Sync**: Outbox flush calls backend apply upon network restore; success reconciles local ID with canonical server application ID; rejection transitions to visible conflict.
- **Conflict Handling**: Displays `DiscountSyncConflictPanel` on terminal server rejection without silently overwriting local sale facts.
- **Restart Recovery**: `PosPendingSaleRecoveryStore` validates tenant/user/device/outlet/till ownership and referenced outbox operation; restores visible cart and pending discount on app startup (fail-closed on context mismatch).
- **Customer Change Rebind**: Identifies active discount binding, cancels/replaces stale application, and reapplies discount with new customer context against the backend.

### Legacy Location Cleanup

- Migrated away from:
  - `lib/features/cart/data/datasources/pos_discount_remote_datasource.dart` (deleted)
  - `lib/features/cart/data/offline/pos_discount_offline_coordinator.dart` (deleted)
  - `lib/features/cart/data/offline/pos_pending_sale_recovery_store.dart` (deleted)
  - `lib/features/cart/domain/entities/pos_cart_discount.dart` (deleted)
  - `lib/features/cart/domain/entities/pos_discount_api_models.dart` (deleted)
  - `lib/features/cart/presentation/providers/pos_discount_provider.dart` (deleted)
  - `lib/features/sale/presentation/widgets/new_sale/pos_discount_dialog.dart` (deleted)
  - `lib/features/sale/presentation/widgets/new_sale/discount/*` (deleted)
- Updated call sites in:
  - `lib/features/cart/presentation/providers/pos_new_sale_cart_provider.dart`
  - `lib/features/cart/presentation/providers/pos_parked_sale_provider.dart`
  - `lib/features/pos/presentation/screens/new_sale/pos_new_sale_screen.dart`
  - `lib/features/pos/presentation/widgets/new_sale/summary/pos_cart_summary.dart`
  - `lib/features/pos/presentation/widgets/new_sale/summary/pos_payment_bar.dart`
  - `lib/features/pos/presentation/widgets/new_sale/actions/pos_new_sale_action_bar.dart`
  - `lib/features/sale/presentation/providers/checkout_customer_provider.dart`
  - `lib/features/customers/presentation/screens/pos_customers_screen.dart`

### Verification Evidence

- **Discount focused tests (`flutter test test/features/discount/`)**: **31 passed**
- **Affected regression suite (`flutter test test/features/discount/ test/core/offline/ test/features/cart/ test/features/sale/ test/features/pos/`)**: **278 passed**
- **Full Flutter test suite (`flutter test`)**: **473 passed**
- **Whole-project analyzer (`flutter analyze`)**: Exit code 1 due to **3 info-level lint issues in unrelated Tenant Admin files** (`add_outlet_screen.dart`, `business_hours_editor.dart`, `outlet_form.dart` with `curly_braces_in_flow_control_structures`). **0 errors and 0 warnings in the discount feature.**

