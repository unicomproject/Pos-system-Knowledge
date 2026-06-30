<!-- title: Flutter Permission Based UI Rendering -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->


# Flutter Permission Based UI Rendering

## Purpose

This file defines permission and feature-based UI rendering for Release 1
Flutter.

## Core Rule

Flutter UI may hide, disable, or redirect for better UX.

Backend remains final authority.

## Access Inputs

| Input | Source |
|---|---|
| Auth session | Backend login response |
| Tenant context | Backend context response |
| Feature entitlements | Backend context/features response |
| Permission codes | Backend permission response |
| Outlet assignment | Backend outlet assignment |
| Till assignment | Backend till assignment |
| Device trust | Backend device activation response |
| Open till session | Backend till session response |

## UI Rules

- Do not hardcode role names.
- Do not hardcode sidebar/menu access.
- Do not hardcode button visibility.
- Use backend permission and feature context.
- Show permission-denied state when route/action is blocked.
- Show feature-not-enabled state when entitlement is missing.
- Hidden or disabled UI is only UX.

## POS Examples

| UI Action | Required Context |
|---|---|
| Start sale | Permission, outlet, trusted device, open till |
| New Sale product grid | `products.view` |
| New Sale search field | `products.search` on `/pos/new-sale` only |
| Cart qty / remove / clear | `sales.cart.update_item`, `remove_item`, `clear` |
| Proceed to Payment | `sales.checkout` + payment accept permissions |
| POS sidebar item | Permission on each `PosShellNavDestination` |
| Apply discount | Discount permission and policy |
| Redeem loyalty | Loyalty feature and redeem permission |
| Process refund | Return/refund feature and permission |
| Process exchange | Exchange/return permission and policy |
| Cash in/out | Till cash permission and open till |
| Hardware settings | Hardware permission |

## Tenant Admin Examples

| UI Area | Required Context |
|---|---|
| Dashboard | Tenant admin context |
| Outlet setup | Outlet manage permission |
| Till setup | Till manage permission |
| Users | User manage permission |
| Roles/permissions | Role/permission manage permission |
| Products | Product feature and permission |
| Reports | Report feature and permission |

## Related Files

- [[Flutter_Routing_Guards]]
- [[Flutter_Cashier_New_Sale_Implementation]]
- [[Flutter_Tenant_Admin_Layout]]
- [[../02_ACCESS_CONTROL/Access_Control_Overview]]
