<!-- title: OO06 Backend Chunk 2 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# OO06 Backend Chunk 2

Status: COMPLETE — OO-06 Chunk 2 backend/API/DB. Chunk 3 Flutter implementation remains PENDING; backend contract is ready for consumption.

## Verified closure (2026-09-09)

- Existing picking GET supports PICKING, PACKED and authoritative READY; terminal orders/pickups are rejected. READY requires fulfillment READY with ReadyAt, pickup READY without CollectedAt, and nonterminal sales order. No replacement GET.
- READY GET requires commerce.online_order.orders.access, commerce.online_order.orders.view and commerce.online_order.collection.view_ready. PICKING/PACKED retain picking.view. Notify additionally requires commerce.online_order.collection.notify_customer. Existing tenant/outlet assignment and click_collect entitlement checks remain. No role-name checks.
- Exact notify route: POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/notify-ready?outletId={outletId}. No body, client recipient, channel, tenant, actor or timestamp. No expectedVersion because notification does not mutate fulfillment version.
- ClickCollectOrdersController delegates to PosOnlineOrderReadyService, reusing NotificationService and ECommerceOrderNotificationFactory.OrderStatusChanged. Recipient is active, same-tenant Customer referenced by SalesOrder.CustomerId. Missing phone/email is not a blocker for customer IN_APP.
- Event key: ecommerce.order_ready_for_collection. Logical event number: ECOM-ORDER-READY-{orderId:N}, normalized uppercase by existing notification service. Existing factory supplies content; no separate template key/version is introduced.
- Verified channel: IN_APP only. notification_events, notification_messages and notification_inbox_items own persistence. Existing event type/channel configuration is reused. Actor derives from authenticated request context; timestamps use injected backend time.
- Sequential and concurrent calls reuse the same event, message and inbox item. PostgreSQL order/fulfillment/pickup row locks serialize scoped notification transactions; existing unique constraints are a backstop. Unique/serialization/deadlock conflicts return safe 409 and may be retried. No resend semantics or exactly-once external delivery claim.
- Failure before commit rolls back notification writes only. Retry after unknown outcome resolves the deterministic event; successful existing events return AlreadyExisted. No fulfillment/pickup status, ReadyAt, CollectedAt, quantities or row version changes.
- Errors preserve existing envelope: 400 invalid request/recipient unavailable; 401 no auth context; 403 permissions/entitlement/outlet; 404 scoped order not found; 409 lifecycle/concurrency conflict; 503 notification failure.
- Customer tracking remains SalesOrder.GetClickAndCollectCustomerStatus / CustomerOrderRepositoryBase.MapStatus, independent of notification persistence.
- No new table, column, migration or seed. Pre-existing unrelated migrations/seed/domain changes are not this chunk's work.

## Verification evidence

Backend build PASS (0 errors). Focused TRX evidence in backend test project TestResults:

| Run | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| oo06-unit.trx | 45 | 0 | 0 |
| oo06-api.trx | 24 | 0 | 0 |
| oo06-integration.trx | 55 | 0 | 0 |
| oo06-postgres.trx | 1 | 0 | 0 |

Unit run: picking service 20, ready service 14, shared NotificationService 3, IN_APP handler 2, POS notification regression 6. Integration run: ready repository 21, picking repository 12, packing regression 14, customer tracking repository 8. Categories overlap: ready repository tests also assert notification and tracking invariants. Total focused execution: 125 passed, 0 failed, 0 skipped; not the full backend suite.

Real local PostgreSQL opt-in test used approved ECOMM-SEED-ACCEPTED-002 only after asserting READY/READY/CollectedAt-null. Two independent DbContexts issued Notify concurrently: same logical event ID, one message/inbox, unchanged lifecycle/version/quantities/events; real READY repository projection and customer tracking succeeded. Existing notification records are retained, not deleted. This is real persistence/application validation using a test permission context, NOT authenticated HTTP or device acceptance. Live deployed GET/POST HTTP checks NOT EXECUTED; running API is a separate build. No production deployment performed.

Remaining Flutter scope: consume READY projection, wire optional notify action/errors/retry, preserve lifecycle separation, UI/widget/device acceptance. No Flutter source/tests modified, no commit/push.

## Pre-change capability matrix

Recorded before implementation. Existing source and Chunk1 authority inspected; no schema or Flutter change authorized.

| # | Capability | Classification | Evidence / owner |
|---|---|---|---|
| 1 | Load READY order | EXTEND | Picking repository rejects READY |
| 2 | Load Pickup READY | EXTEND | Existing pickup entity; join projection |
| 3 | Return ReadyAt | EXTEND | Existing fulfillment field |
| 4 | Return CollectedAt | EXTEND | Existing pickup field |
| 5 | Return serverTime | REUSE | IDateTimeProvider |
| 6 | Return customer | REUSE | Order snapshot |
| 7 | Collection outlet/window | EXTEND | Add existing end/timezone snapshot |
| 8 | Order metrics | EXTEND | Cancel-aware effective units |
| 9 | Picked/pending/issues | EXTEND | Existing lines; aggregate issue count |
| 10 | orders.access | REUSE | TenantRequestContext |
| 11 | orders.view | REUSE | TenantRequestContext |
| 12 | collection.view_ready | MISSING | Catalog exists; runtime gate missing |
| 13 | Notify endpoint | MISSING | Existing controller family extension |
| 14 | Notify service | EXTEND | Existing NotificationService; application ready orchestration |
| 15 | Recipient resolution | EXTEND | Tenant-scoped authoritative customer existence |
| 16 | IN_APP | REUSE | Existing channel handler |
| 17 | Event/template | REUSE | Existing ready factory |
| 18 | Notification persistence | REUSE | Existing repository |
| 19 | Notification audit | REUSE | Existing event actor/timestamps |
| 20 | Sequential duplicates | REUSE | Deterministic event key |
| 21 | Concurrent duplicates | EXTEND | Database transaction/row locks; uniqueness fallback |
| 22 | Retry semantics | EXTEND | Safe persisted-result reuse |
| 23 | Tenant isolation | REUSE | Existing scoped queries |
| 24 | Outlet isolation | REUSE | Existing ValidateAccessAsync |
| 25 | READY validation | EXTEND | Shared read-only domain policy |
| 26 | Terminal rejection | EXTEND | Reject inconsistent/terminal aggregates |
| 27 | No Ready mutation | REUSE | Notification-only operation |
| 28 | No Collected mutation | REUSE | Notification-only operation |
| 29 | Independent tracking | REUSE | SalesOrder / CustomerOrderRepositoryBase |
| 30 | Safe errors | EXTEND | Existing envelope; notify failures |

## Implementation design

Extend existing picking GET, preserving PICKING/PACKED authorization and using collection.view_ready for READY. Add typed status/timestamp/window/metric fields only; no DB columns. Shared domain predicate validates READY and terminal safety.

POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/notify-ready?outletId={outletId} follows existing action suffix routes. No body or client recipient/version required. Existing controller dispatches to application ready orchestration, existing picking repository provides scoped transaction, and existing NotificationService/factory persists customer IN_APP notification. Server actor/time only.

The ready-notification transaction locks authoritative order/fulfillment/pickup rows on PostgreSQL before reloading/validating. Identical concurrent requests serialize and reuse the deterministic event key; uniqueness remains a backstop for other writers. Notification failures roll back only notification work, never the prior Ready transaction. No aggregate version or lifecycle is changed. No external exactly-once delivery claim. Tests must cover permissions, scope, state, failure, duplicates and real relational concurrency.
