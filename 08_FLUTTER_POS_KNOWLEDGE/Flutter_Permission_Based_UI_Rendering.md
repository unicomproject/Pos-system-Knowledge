<!-- title: Flutter Permission Based UI Rendering -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-27 -->

# Flutter Permission Based UI Rendering

## Purpose

This file defines permission-based UI rendering rules for OneVerz POS Flutter apps based on the canonical **4-Tier Permission Taxonomy** (`domain.module.feature.action`).

Permissions are backend-driven and must not be hardcoded by role name.

---

## Core Rule

- The Flutter UI may hide or disable actions based on effective permissions loaded from the backend auth session.
- The Backend API remains the final authorization authority.

---

## Context Sources

Flutter must load and evaluate:

1. **Feature Entitlements:** Tenant-enabled platform features (e.g. `pos.sales`, `click_collect`).
2. **Effective Permissions:** Canonical 4-tier permission codes in JWT claims.
3. **Tenant Status:** Active tenant lifecycle.
4. **Outlet Access:** Assigned outlet context.
5. **Till & Device Context:** Trusted device ID and active till session state.
6. **Offline Allowed Actions:** Permitted offline transaction boundaries.

---

## Rendering Behavior

| Condition | UI Behavior |
|---|---|
| Feature disabled | Hide menu entry or show feature unavailable message |
| Permission missing | Hide card or disable button |
| Till not open | Disable billing and payment actions; show "An open till is required" |
| Device not trusted | Redirect to `/pos/device-activation` |
| Offline blocked action | Disable and show "Online connection required" |
| Sync conflict | Show sync warning indicator |

---

## Canonical POS Permission Examples

| UI Action / Control | Canonical 4-Tier Permission Code | Legacy / Deprecated Code | UI Behavior |
|---|---|---|---|
| **Start New Sale Button** | `pos.sales.new_sale.create` | `sales.create`, `pos.sale.start` | Hide if missing; disable if till session is closed |
| **Product Grid & Scan** | `pos.sales.catalog.view`, `pos.sales.catalog.search` | `products.view`, `products.search` | Render products & enable barcode scanner |
| **Cart Line Actions** | `pos.sales.cart.add_item`, `pos.sales.cart.update_item`, `pos.sales.cart.remove_item`, `pos.sales.cart.clear` | `sales.cart.manage`, `sales.cart.*` | Render quantity adjustments and line removal |
| **Manual Discount Button** | `pos.sales.manual_discount.apply` | `sales.discount.apply`, `pos.discount.apply` | Hide discount button if missing |
| **Manager Discount Override** | `pos.sales.discount.approve` | `sales.discount.approve` | Deferred capability; not shown in standard cashier UI |
| **Park / Recall Sale** | `pos.sales.held_sales.create`, `pos.sales.held_sales.view`, `pos.sales.held_sales.recall` | `sales.park.create`, `sales.park.view`, `sales.park.recall` | Render Park / Recall buttons and list dialog |
| **Checkout Proceed** | `pos.sales.checkout.execute` | `sales.checkout` | Enable "Proceed to Payment" |
| **Cash Payment Sheet** | `pos.payments.cash.accept` | `payments.cash.accept` | Show Cash payment option in payment selector |
| **Receipt Print / Reprint** | `pos.receipts.physical.print`, `pos.receipts.history.reprint` | `receipts.print`, `receipts.reprint` | Render Print Receipt button / Reprint action with audit |
| **Returns & Exchanges** | `pos.returns.search_sale.view`, `pos.returns.workflow.create` | `returns.view`, `returns.create` | Show Returns & Exchanges card on Home Dashboard |
| **Cash Drawer Actions** | `pos.cash_drawer.position.view`, `pos.cash_drawer.movements.create` | `cash_drawer.view`, `cash_drawer.movement.create` | Render Cash Drawer screen and Cash In / Cash Drop forms |
| **Close Till / End Shift** | `pos.till.session.close` | `pos.till.close` | Render End Shift action; disable if till is already closed |

---

## Pickup & Click & Collect Examples

| UI Action / Control | Canonical 4-Tier Permission Code | UI Behavior |
|---|---|---|
| **Online Orders Queue** | `commerce.online_order.orders.access`, `commerce.online_order.orders.view` | Show Online Orders tile on Home Dashboard |
| **Order Picking Screen** | `commerce.online_order.picking.view`, `commerce.online_order.picking.pick` | Render item picking interface and scanner |
| **Order Packing Screen** | `commerce.online_order.packing.view`, `commerce.online_order.packing.pack` | Render package builder |
| **Customer Handover** | `commerce.online_order.collection.handover`, `commerce.online_order.collection.collect` | Enable Handover confirmation button |

---

## Anti-Patterns

- `if (role == 'cashier')` (Hardcoding role names).
- Using static frontend-only permission arrays without backend authority.
- Evaluating 2-tier or 3-tier codes without canonical translation.
- Permitting offline actions that the backend cannot validate during sync.

---

## Related Files

- [[Flutter_Routing_Guards]]
- [[../02_ACCESS_CONTROL/Permission_Code_List]]
- [[../13_DECISIONS_AND_CHANGES/ADR/ADR_007_Permission_Code_Strategy]]
- [[Flutter_API_Integration]]
- [[Flutter_Offline_Operation_Sync]]
