<!-- title: Online Order Realtime Cashier Refresh Chunk 1 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# Online Order Realtime Cashier Refresh — Chunk 1

Status: **IMPLEMENTATION + AUTOMATED VALIDATION COMPLETE — LIVE RUNTIME ACCEPTANCE PENDING CHUNK 2**

## Observed issue

Ecommerce order `ORD-000001` persisted successfully (SalesOrder CONFIRMED, fulfilment PENDING). Staff notification message DELIVERED and inbox UNREAD existed. Cashier UI could still remain stale.

## Root causes

1. POS notification bell watches `posNotificationsProvider` (`GET /api/v1/pos/notifications`), but WebSocket handler only refreshed `notificationInboxProvider` (tenant inbox API).
2. OO-01 `posOnlineOrdersProvider` had no realtime-triggered authoritative refetch; list loaded only on screen open / local mutations.

Order creation and notification persistence were **not** defective.

## Backend event evidence (unchanged contract)

| Item | Value |
|---|---|
| Owner | `StorefrontCheckoutService.ConfirmAsync` after repository commit |
| Staff event | `ecommerce.order_placed.staff` via `ECommerceOrderNotificationFactory.OrderPlacedForStaff` |
| Transport | Raw WebSocket `/ws/notifications` → `TenantNotificationSocketRegistry` by `TenantUserId` |
| Payload | `{ type, title, body, actionUrl, sourceReferenceId }` — refresh trigger only |
| Staff fan-out | Active TENANT_ADMIN / CASHIER users (tenant-wide; list API remains outlet-scoped) |

No new table/column/migration/API.

## Frontend fix

| Piece | Change |
|---|---|
| Policy | `realtime_cashier_refresh_policy.dart` |
| Coordinator | `NotificationInboxController.refreshAuthoritativeSurfaces` — debounce fan-out |
| Bell | Invalidate `posNotificationsProvider` (authoritative refetch) |
| Online Orders | `PosOnlineOrdersController.refreshFromRealtime()` preserves search/filter/page |
| Reconnect | `NotificationSocketClient.onConnected` → authoritative refresh |
| App resume | `NytrozPosApp.didChangeAppLifecycleState` → same refresh |
| Logout | Disconnect socket; invalidate POS bell cache |

Invariant: realtime never fabricates order cards or `unreadCount++`.

## Automated validation

| Suite | Result |
|---|---|
| Backend focused (factory + realtime handler + NotificationService) | 13 passed / 0 failed / 0 skipped |
| `dotnet build` Api | PASS |
| `flutter analyze` (touched) | No issues found |
| Flutter focused + OO-01/top-bar regression | 13 passed / 0 failed / 0 skipped |

## Chunk 2 live acceptance (NOT executed here)

1. Backend + POS running; fresh cashier login  
2. Keep Online Orders open; note bell count  
3. Place a safe Development Ecommerce order without manual refresh  
4. Verify WS event, bell update, OO list update, no duplicate card  
5. Verify DB order/notification/inbox; tenant/outlet correctness  
6. Screen closed→reopen; reconnect; app resume if safe  
7. Screenshots/logs + final Second Brain closure  

## Evidence links

- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment]]
- [[../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
- [[Online_Order_OO01_Canonicalization_Status_2026-08-27]]
