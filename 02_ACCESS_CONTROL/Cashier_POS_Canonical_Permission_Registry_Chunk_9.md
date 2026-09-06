<!-- title: Cashier POS Canonical Permission Registry — Chunk 9 -->
<!-- status: Active — Global Shell / Top Bar / Bottom Nav / Notifications Flutter Visibility -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-05 -->

# Cashier POS Canonical Permission Registry — Chunk 9

## Scope

Chunk 9 applies Chunk 8 `PermissionGate` / exact membership to the **Global POS Shell**:

- Top bar (container + children)
- Bottom navigation (container + destinations)
- Notifications (bell, panel, unread, message fields)

This chunk does **not**:

- Full Flutter route guards
- Sales / Home action-card / New Sale / Product / Cart rollout (Chunk 10)
- Payments rollout
- Customers / Orders / Returns screen rollout
- Cash Drawer / Till screen rollout
- Tenant Admin permission UI
- Backend production changes
- New / renamed permission codes

## 1. Global Shell permission architecture

```
Backend effective set (Chunk 5)
        ↓
AuthSession.permissionCodes
        ↓
effectivePermissionSetProvider (Chunk 8)
        ↓
PosShellTopBarVisibility / filterPosCashierNavDestinations / PermissionGate
        ↓
Shell UI (hide = SizedBox.shrink / omit from list — no gap)
```

## 2. Chunk 8 PermissionGate usage

- Prefer `PermissionGate` / shared helpers over per-widget providers.
- Denied → omit / `SizedBox.shrink()` — never `Visibility(maintainSize: true)`.
- One permission source: `effectivePermissionSetProvider`.

## 3. Top-bar container rule

| Condition | Behaviour |
| --- | --- |
| `pos.shell.topbar.container` absent | Entire top bar absent (phone AppBar / desktop strip) — no reserved height |
| Container present + zero children | Top bar collapsed (`shouldRenderTopBar` false) |
| Container + children | Container renders; each child independently gated |

## 4. Exact top-bar control → permission mapping

| Component | Canonical permission |
| --- | --- |
| Container | `pos.shell.topbar.container` |
| Brand / logo | `pos.shell.topbar.brand` |
| Session status | `pos.shell.topbar.session_status` |
| Outlet | `pos.shell.topbar.outlet` |
| Till label | `pos.shell.topbar.till` |
| Connectivity indicator | `pos.shell.topbar.connectivity` |
| Clock | `pos.shell.topbar.clock` |
| Notification bell | `pos.shell.topbar.notification_bell` |
| Offline banner | `pos.shell.navigation.offline_banner` |

**STOP / no current surface:** `pos.shell.navigation.offline_banner` — no POS shell offline-banner widget exists. Not invented. Connectivity chip on New Sale top bar uses `pos.shell.topbar.connectivity` only.

## 5. Bottom-navigation container rule

| Condition | Behaviour |
| --- | --- |
| `pos.shell.bottom_nav.container` absent | Nav absent — no reserved height |
| Container present + 0 destinations | Nav absent |
| Container + N destinations | N items reflow across bar |

## 6. Exact destination → permission mapping

| Destination | Canonical / REUSE |
| --- | --- |
| Container | `pos.shell.bottom_nav.container` |
| Home | `pos.sales.dashboard.view` (+ legacy home/dashboard aliases via `PosPermissionAccess.homeAccessCodes`) |
| New Sale | `pos.sales.new_sale.view` (+ legacy new-sale aliases) |
| Orders | `pos.receipts.digital.view` / `receipts.view` (existing Orders route business permission — not a shell alias) |

> **Chunk 10 Part 0 verification (2026-09-05):** Bottom-nav “Orders” → `/pos/orders` → `PosReceiptHistoryScreen` (Receipt History) → `/api/v1/pos/receipts`. Classification: **TRANSACTION_RECEIPT_HISTORY**. Mapping confirmed correct; **no correction**. Online Orders remains `/pos/online-orders`. See [[Cashier_POS_Canonical_Permission_Registry_Chunk_10]].
| Customers | `pos.customers.management.view` |
| Settings | `pos.shell.navigation.settings` |

## 7. Dynamic nav filtering / reflow

`posCashierNavAllDestinations()` → `filterPosCashierNavDestinations(set)` → build only visible items.

## 8. Stable destination identity / index handling

`PosCashierNavDestinationId` + route path matching. No static index map after filtering.

**Current route hidden:** Chunk 9 does not add redirects. Nav item disappears; route may remain if already open (full route guards deferred). No crash / no fabricated item.

## 9. Notification bell rule

Bell visibility: **`pos.shell.topbar.notification_bell`** only (not `alerts.view` alone).

## 10. Panel rule

Panel open/render: **`pos.notifications.panel.view`**.

Bell granted + panel denied → bell may show; tap does **not** open panel.

## 11. Unread-count rule

Badge: **`pos.notifications.panel.unread_count`**. Denied → no badge and not `0`.

## 12. Message-list rule

Rows: **`pos.notifications.messages.list`**. Denied → no list body.

## 13. Title / body / timestamp rules

| Field | Code | Current UI |
| --- | --- | --- |
| Title | `pos.notifications.messages.title` | Gated on tile |
| Body | `pos.notifications.messages.body` | Gated on tile |
| Timestamp | `pos.notifications.messages.timestamp` | **STOP** — no timestamp widget in current panel (not invented; no leak) |

Empty row (list granted, all visible fields denied): omitted.

## 14. Open / mark-read / dismiss / mark-all-read rules

| Action | Code | Chunk 9 status |
| --- | --- | --- |
| Open | `pos.notifications.messages.open` | **STOP** — no detail route/API; `onTap` remains null (no gesture invent) |
| Mark read | `pos.notifications.messages.mark_read` | **STOP** — no Flutter API/action widget |
| Dismiss | `pos.notifications.messages.dismiss` | **STOP** — no swipe/button surface |
| Mark all read | `pos.notifications.messages.mark_all_read` | **STOP** — no action surface |

Unauthorized bypass count for present surfaces: **0**. Future action UI must gate these exact codes.

## 15. Gesture / alternate-action protection

No dismissible / context-menu / keyboard shortcuts for denied actions (none existed; none added without API).

## 16. Accessibility / semantics protection

Denied title/body are not placed in the widget tree or Semantics label.

## 17. Permission vs business-state ordering

1. Permission denied → hide  
2. Else → business state (online/offline data, unread count value, loading/error)

## 18. Runtime permission refresh

Session / `effectivePermissionSetProvider` update rebuilds shell. No app restart required.

## 19. Phone / Tablet / Desktop consistency

Shared helpers: `PosShellTopBarVisibility`, `filterPosCashierNavDestinations`. Layout may differ; permission semantics identical. No device-specific permission codes.

## 20. Zero-gap / collapse behaviour

Filtered lists + `SizedBox.shrink` gates. No disabled placeholders for permission denial.

## 21. Full-access regression

With compatibility children granted (Chunk 3/5), shell chrome matches prior authorized experience aside from intentional removal of disabled nav placeholders and Settings now requiring `pos.shell.navigation.settings`.

## 22. Permission-code freeze

Canonical permissions added/removed/renamed: **0**. Flutter constant mirrors only for existing catalog codes.

## 23–27. Explicit deferred notes

- Full route guard rollout **NOT** implemented  
- Sales / Home / New Sale rollout **NOT** implemented  
- Payment rollout **NOT** implemented  
- Customer / Orders / Returns screen rollout **NOT** implemented  
- Cash Drawer / Till screen rollout **NOT** implemented  

## 28. Chunk 10 deferred scope

Home action cards, New Sale chrome, Product, Cart, Held Sales permission visibility.

## Flutter entry points

| Area | Primary files |
| --- | --- |
| Scaffold gates | `pos_shell_scaffold.dart` |
| Top bar | `pos_top_bar.dart`, `pos_mobile_top_bar.dart`, `pos_desktop_top_bar.dart`, `pos_dashboard_top_bar_content.dart` |
| Connectivity | `pos_new_sale_top_bar_content.dart` (`_TerminalOnlineChip`) |
| Bottom nav | `pos_shell_bottom_nav_destinations.dart`, `pos_cashier_bottom_navigation.dart` |
| Notifications | `pos_top_bar_notification_button.dart`, `pos_notifications_dialog.dart`, home header notification chrome |
| Helpers | `pos_shell_top_bar_visibility.dart` |
| Constants | `pos_access_codes.dart` (mirrors only) |
