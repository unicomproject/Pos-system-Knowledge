<!-- title: Flutter Park Recall Sale Implementation Specification -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Flutter Park Recall Sale Implementation Specification

## Objective

Replace the independent device-local Park authority with typed backend Holds integration while preserving the active cart until confirmed success. This file specifies future work; it does not claim implementation.

## Composition

| Component | Responsibility |
|---|---|
| New Sale action | Permission-aware Park Sale entry; block empty cart |
| Park modal | Header, generated-after-success reference text, one short note, 24-hour message and actions |
| Parked Sales view | Backend list/count, loading/empty/error states and accessible row actions |
| Recall confirmation | Explain recalculation and protect an existing active cart |
| Cancel confirmation | Optional reason within backend limit |
| Status feedback | Returned reference, conflict/expiry/permission/network messages |

Modal fields must not include free-text customer, assigned cashier, context, totals or editable expiry. Customer comes from `PosNewSaleCartState.selectedCustomer`.

## Architecture Boundaries

- Remote datasource owns `/api/v1/pos/holds` HTTP serialization and safe error mapping.
- Repository maps typed API DTOs to Park domain entities; widgets never parse raw maps.
- Providers own create/list/recall/cancel state, stable create intent/idempotency and reconciliation.
- Cart provider exports a request snapshot and applies recalled backend lines/summary.
- Permission rendering uses canonical `sales.park.create/view/recall`; backend remains final authority.

## Typed Contracts

Create maps deviceId, saleType, selected customerId, lines, optional note to reason, discountApplicationId and stable idempotencyKey. Flutter must stop sending editable `expiresAt` after backend alignment. Response mapping includes holdId/number, sale identifiers, till/session, customer, reason, status, totals, heldAt/expiresAt and lines. Recall maps deviceId and consumes backend checkout summary.

## Create State Machine

`idle → editing → submitting → succeeded | knownFailure | unknownOutcome`.

- Same unchanged intent preserves its key across timeout/reconciliation.
- Button and close semantics prevent repeat dispatch while submitting.
- Success displays the returned reference, invalidates list/count, then clears sale-scoped cart state.
- Every failure leaves cart/customer/discount intact.
- Never mint a new key automatically after an unknown outcome.

## Recall and Cancel

- Fetch active backend records; never merge them silently with legacy local rows.
- Recall applies only the successful backend recalculation response and marks the hold released once.
- Wrong till, expired, released, cancelled and concurrent recall produce typed conflict states.
- Cancel removes an item from the active view only after 204; duplicate/unknown outcomes require reconciliation.

## Local Storage Replacement

1. Treat `pos.parked_sales` as legacy device-local data, not backend truth.
2. Do not upload legacy rows automatically because references, totals and identity were client-generated.
3. During migration, show a clearly separate legacy/local recovery section or provide an approved one-time discard/export path.
4. Remove local create/recall authority only after backend flow and migration UX are accepted.
5. Future offline Park uses an explicit outbox with pending/failed/synced states and backend reconciliation.

## UI and Accessibility

- Support tablet and desktop landscape without overflow; short-note field remains compact.
- Provide semantic labels, keyboard focus order, 44px-equivalent targets and sufficient contrast.
- Loading is announced and not colour-only. Long error messages wrap without covering actions.
- Scanner and keyboard input must not leak into the modal or be broken after closing it.

## Errors and Observability

Map 400/401/403/404/409/500, network timeout and unknown outcome separately. Log safe action, correlation, tenant/user/device/till/hold identifiers and transition result; never log note text, tokens or full customer data.

## Required Tests

- DTO/domain mapping for all create/list/recall fields and errors.
- Create intent stable-key replay and changed-payload conflict.
- Empty-cart gate, note boundaries, customer/discount mapping and cart preservation.
- Success-only clearing, reference display and list/count invalidation.
- Permission hiding plus backend-denial handling.
- Recall recalculation, wrong-till/terminal-state conflicts and concurrent actions.
- Legacy storage separation/migration, responsive widgets, focus and long errors.
- Authenticated E2E against backend plus read-only persistence/duplicate checks.

## Delivery Order

Backend contract alignment → Flutter datasource/repository/provider → UI widgets → automated tests → authenticated runtime acceptance. Offline outbox remains a separate chunk.

## Related Files

- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../03_USER_JOURNEYS/Cashier/12_Park_Recall_Sale_Flow]]
- [[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Park_Recall_Sale_Test_Cases]]
