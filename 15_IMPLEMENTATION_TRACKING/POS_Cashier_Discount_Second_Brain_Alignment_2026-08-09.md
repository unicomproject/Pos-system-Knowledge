<!-- title: POS Cashier Discount Second Brain Alignment 2026-08-09 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->

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
