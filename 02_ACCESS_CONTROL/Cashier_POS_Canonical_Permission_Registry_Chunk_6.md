<!-- title: Cashier POS Canonical Permission Registry — Chunk 6 -->
<!-- status: Active — Backend Core Authorization; Sensitive DTO / Flutter UI Deferred -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Cashier POS Canonical Permission Registry — Chunk 6

## Scope

Chunk 6 enforces **backend core authorization** for POS business APIs using the
Chunk 5 effective-permission set (via JWT → `TenantRequestContext.HasPermission`).

This chunk does **not** implement:

- Sensitive DTO / field filtering (Chunk 7)
- Flutter UI visibility / PermissionGate
- Flutter route guards
- New permission codes / seeds / assignment redesign
- User deny model

## Architecture

```
Login/refresh → Chunk 5 resolver (+ Expand aliases only)
        ↓
JWT permissions claim
        ↓
TenantRequestContext.HasPermission / HasAnyPermission
        ↓
Application service guard (before mutation)
        ↓
403 permission_denied  OR  proceed to business validation
```

| Concern | Rule |
| --- | --- |
| Effective source | Chunk 5 resolver at login/refresh |
| Request checks | Membership in JWT effective set (+ Expand aliases) |
| Expand | Alias bridges only — **never** parent→all-children |
| Fail-closed | Missing permission → deny; no allow-all |
| 401 vs 403 | Auth failure → 401; authenticated missing permission → 403 |

## Expand invariant

`TenantPermissionAliases.Expand` does **not** invent Cashier children.

Parent-only `pos.payments.cash.accept` does **not** add Exact Cash / Numpad children.

## High-risk enforcement fixes (Chunk 6)

| Operation | Required permission(s) |
| --- | --- |
| Cancel held sale | `pos.sales.held_sales.cancel` only |
| Create/view/recall hold | Legacy `sales.park.*` **OR** canonical `pos.sales.held_sales.*` |
| Cash In / Out / Drop | `pos.cash_drawer.movements.cash_in` / `cash_out` / `cash_drop` (type-resolved **before** mutate) |
| Physical drawer open / register | `cash_drawer.manage` **OR** `pos.cash_drawer.physical.manage` |
| Drawer view | `cash_drawer.view` **OR** `pos.cash_drawer.position.view` |
| Open / Close till | Legacy `pos.till.open/close` **OR** `pos.till.session.open/close` |
| Attach customer | `pos.customers.management.attach_sale` |
| Cash/Card/QR/Split pay | Existing independent `pos.payments.*.accept` (unchanged) |

## Unchanged / already correct

POS Home, products, checkout execute, discounts, receipts, customer CRUD view/create/update,
returns (existing returns.*), online orders (commerce.*), notifications list view.

## Deferred / known gaps (not Chunk 6 blockers for Chunk 7)

| Item | Notes |
| --- | --- |
| Cart calculate | Still gated by `sales.cart.update_item` only (client-side cart; no separate clear endpoint) |
| `pos.refund.approve` | Helper exists; not wired to a complete path |
| Drawer finalize | Agent status callback remains authenticated-only (register now permission-gated) |
| Customer deactivate | No POS deactivate endpoint found |
| Field-level filtering | Chunk 7 |

## Permission code freeze

Role-assignable catalog size remains **333**. Chunk 6 added **zero** codes.

## Chunk 7 deferred

Sensitive field filtering inside otherwise authorized responses
(customer phone/email, expected cash, movement amounts, receipt tender, metrics).
