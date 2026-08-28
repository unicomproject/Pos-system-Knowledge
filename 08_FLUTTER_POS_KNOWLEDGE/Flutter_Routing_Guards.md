<!-- title: Flutter Routing Guards -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-27 -->

# Flutter Routing Guards

## Purpose

This file defines Flutter navigation and route-guard rules for OneVerz POS MVP, standardized against the canonical **4-Tier Permission Taxonomy** (`domain.module.feature.action`).

Routing must evaluate authentication, tenant status, feature entitlement, canonical permissions, outlet assignment, till session, device trust, and offline state.

---

## Router Decision

- **Router Framework:** GoRouter for Flutter app navigation.
- **Context Evaluation:** Route guards must read backend-driven context from Riverpod providers (`authSessionProvider`, `posSessionBootstrapProvider`, `tillProvider`, `deviceActivationProvider`).

---

## Guard Layers

| Guard | Meaning / Evaluation |
|---|---|
| **Auth Guard** | User session is hydrated and access token is valid / refreshed (`isAuthenticated`) |
| **Tenant Guard** | Tenant account is active |
| **Feature Guard** | Tenant has required feature entitlement (e.g. `pos.sales`, `click_collect`) |
| **Permission Guard** | User session contains the required canonical 4-tier permission code |
| **Outlet Guard** | User has assigned access to the active outlet |
| **Till Guard** | Active open till session is required for billing/sale mutations |
| **Device Guard** | Active device is trusted and paired with a valid till |
| **Offline Guard** | Allow only verified offline-safe routes and actions |

---

## POS Route Mapping to Canonical 4-Tier Permissions

| Route Path | Screen Name | Canonical 4-Tier Permission Code | Legacy Alias (Deprecated) | Context Requirements |
|---|---|---|---|---|
| `/pos/home` | POS Home Dashboard | `pos.sales.dashboard.view` | `pos.home.view`, `pos.dashboard.view` | Authenticated tenant user |
| `/pos/new-sale` | New Sale / Product Catalog | `pos.sales.new_sale.create` (or `pos.sales.new_sale.view`) | `sales.create`, `pos.new_sale.view` | Open till session, trusted device |
| `/pos/new-sale/payment` | Payment Method Selection | `pos.sales.checkout.execute` | `sales.checkout` | Non-empty cart, open till |
| `/pos/new-sale/payment/customer` | Checkout Customer Selector | `pos.customers.management.view` | `customers.view` | In-flight checkout session |
| `/pos/new-sale/payment/cash` | Cash Payment Screen | `pos.sales.checkout.execute` **and** `pos.payments.cash.accept` | `sales.checkout` + `payments.cash.accept` | Open till session |
| `/pos/new-sale/payment/cash/success` | Payment Success Screen | `pos.sales.order_history.view` (or `pos.receipts.digital.view`) | `sales.view`, `receipts.view` | Completed sale context |
| `/pos/customers` | POS Customer Management | `pos.customers.management.view` | `customers.view`, `pos.customers.view` | Authenticated tenant user |
| `/pos/parked-sales` | Parked / Held Sales Screen | `pos.sales.held_sales.view` | `sales.park.view` | Assigned till, open till session |
| `/pos/returns-refunds` | Returns & Exchanges (Step 1) | `pos.returns.search_sale.view` | `returns.view` | Assigned outlet, open till |
| `/pos/returns-refunds/summary` | Return Sale Summary | `pos.returns.search_sale.view` + `pos.returns.workflow.create` | `returns.view` + `returns.create` | Selected eligible sale |
| `/pos/cash-drawer` | Cash Drawer Screen | `pos.cash_drawer.position.view` | `cash_drawer.view` | Assigned till |
| `/pos/cash-drawer/cash-in` | Cash In Screen | `pos.cash_drawer.movements.create` | `cash_drawer.movement.create` | Open till session |
| `/pos/cash-drawer/cash-drop` | Cash Drop Screen | `pos.cash_drawer.movements.create` | `cash_drawer.movement.create` | Open till session |
| `/pos/cash-drawer/close-till` | Close Till / End Shift | `pos.till.session.close` | `pos.till.close` | Open till session |
| `/pos/open-till` | Open Till Screen | `pos.till.session.open` | `pos.till.open` | Trusted device, closed till |
| `/pos/device-activation` | Device Activation Screen | `tenant.tills.management.manage` | `tenant.till.manage` | Untrusted device context |
| `/pos/online-orders` | Online Orders List | `commerce.online_order.orders.access` + `commerce.online_order.orders.view` | `pos.online_orders.manage` | `click_collect` entitlement |
| `/pos/online-orders/:id/picking` | Order Picking Screen | `commerce.online_order.picking.view` | `pos.online_orders.picking.view` | Assigned order in picking state |

---

## Admin Route Rules

- Tenant admin routes (`/tenant-admin/*`) require tenant admin feature entitlement and canonical `tenant.*` permissions.
- Hardcoding role names (`if role == 'admin'`) is strictly prohibited.

---

## Offline Route Restrictions

Offline mode must not expose routes that require backend-authoritative validation:
- Card/QR payment initiation.
- Exception refund/exchange final approval.
- Final till session close & reconciliation.

---

## UX Access Denied Rules

When route access is denied by guards, the router must display clear contextual messaging or redirect cleanly:
- **Login required:** Redirect to `/tenant-login`.
- **Feature disabled:** Display "Feature Not Available" notice.
- **Permission denied:** Render `TenantAdminForbiddenScreen` or display "Permission Denied" snackbar.
- **Till not open:** Redirect to `/pos/open-till` or show "An open till is required".
- **Device not trusted:** Redirect to `/pos/device-activation`.

---

## Related Files

- [[Flutter_Permission_Based_UI_Rendering]]
- [[../02_ACCESS_CONTROL/Permission_Code_List]]
- [[../13_DECISIONS_AND_CHANGES/ADR/ADR_007_Permission_Code_Strategy]]
- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_Security_Guardrails]]
