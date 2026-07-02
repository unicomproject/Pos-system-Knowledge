<!-- title: Flutter Tenant Admin Layout -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Tenant Admin Layout

## Purpose

This file defines Flutter tenant admin layout guidance for TM-EPOS MVP.

Tenant admin is part of the Flutter business app experience and supports business
setup and operational management.

## Tenant Admin Scope

| Area | Included |
|---|---|
| Dashboard | KPI cards, alerts, recent activity |
| Outlets | Manage outlets |
| Tills | Manage tills |
| Devices | POS device setup |
| Users | Tenant users |
| Roles & Permissions | Permission assignment |
| Products | Products and variants |
| Inventory | Stock, alerts, movements |
| Orders | Unified order visibility |
| Pickup/Fulfilment | Staff order preparation |
| Reports | Operational reports |

## Layout Rule

Use responsive layout for tablet/desktop-sized screens and simplified navigation
for phone-sized screens.

Do not create separate duplicated business logic for different screen sizes.

## Permission Rule

Menu items must depend on backend feature and permission context.

## Online Store Boundary

Tenant admin may show online store setup/order support if backend APIs exist.
Customer-facing storefront UI is not part of Flutter POS.

## Offline UI Rule

Tenant admin write operations should clearly show when action requires online
connection.

Do not silently queue sensitive admin changes unless sync rules explicitly allow
it.

## Related Files

- [[Flutter_Permission_Based_UI_Rendering]]
- [[Flutter_Device_Platform_Support]]
- [[Flutter_Order_ClickCollect_Fulfilment]]
