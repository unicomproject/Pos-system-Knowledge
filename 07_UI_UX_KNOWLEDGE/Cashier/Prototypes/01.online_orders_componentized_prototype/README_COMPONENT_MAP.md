# Online Orders OO-01 — Componentized Prototype

This package is a prototype/reference implementation for the **Online Orders list screen**. It is intentionally split by production-style responsibilities rather than kept as one monolithic HTML file.

## Component boundaries

| Component | Responsibility | Permission / rule |
|---|---|---|
| `AppShell` | POS header, mobile context strip, bottom navigation | Orders nav gated by `commerce.online_order.orders.access` |
| `OnlineOrdersHeader` | Screen heading, search, filter entry | Requires screen access/view |
| `OrderSummaryCards` | New/Preparing/Ready/Delayed/Collected/Cancelled counts | View projection |
| `OrderStatusTabs` | Status filtering | View projection |
| `OrderSortControl` | Canonical sort choices | View projection |
| `ResponsiveOrderList` | Shared data -> desktop/tablet/phone presentation | `commerce.online_order.orders.view` |
| `StatusChip` | Reusable semantic order-state presentation | Status cannot rely on colour alone |
| `PaymentChip` | Reusable payment state | Text + semantic colour |
| `CollectionTime` | Collection time + derived urgency | `Delayed` remains derived, not persisted |
| `Pagination` | Server-style page interaction prototype | View projection |
| `OrderFilterModal` | Payment/urgency filters | Same query state on all devices |
| `ScreenState` | Loading, empty, error, permission denied, entitlement denied | Canonical NFR states |
| `PrototypeQaPanel` | Prototype-only stress/permission/state simulator | Not a production component |

## Responsive behavior

- **Desktop >= 1200px:** full data table.
- **Tablet 768–1199px:** compact four-region order cards; no forced desktop table.
- **Phone <= 767px:** stacked cards; all key order details remain reachable.
- Long names, order IDs, emails, phone numbers, large counts and large currency values are stress-testable from the Prototype QA control.

## Permission and entitlement gates

The prototype uses the canonical capability model:

- `click_collect` feature entitlement
- `commerce.online_order.orders.access`
- `commerce.online_order.orders.view`

Permission is not treated as a role name.

## Important prototype rule

This is an interaction/layout reference, not production Flutter code. The production Flutter implementation should preserve these component responsibilities and reuse the canonical frontend component registry before creating feature-specific widgets.
