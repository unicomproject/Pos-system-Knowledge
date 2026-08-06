<!-- title: Flutter Tenant Admin Layout -->
<!-- status: Active — shared shell + white sidebar approved -->
<!-- system: OneVerz POS MVP POS -->
<!-- last_updated: 2026-07-29 -->

# Flutter Tenant Admin Layout

## Purpose

Flutter Tenant Admin layout guidance for OneVerz POS MVP POS.

## Layout Rule

Use one shared reusable shell for all Tenant Admin pages. Responsive behaviour changes presentation; business logic stays shared.

Canonical architecture: [[Tenant_Admin_Settings_Shared_Layout_Architecture]]

## Shared Shell (Locked 2026-07-29)

```text
TenantAdminSharedShell
├── Shared Fixed Black Header
├── Shared White Tenant Admin Sidebar
├── Responsive Dynamic Content Area
└── Shared Fixed Black Footer Navigation
```

| Piece | Rule |
|---|---|
| Header | Required on all TA pages; provider-driven; no hardcoded context |
| Sidebar | Required; **white/light**; approved order; Products nested |
| Footer | Required on all TA pages; Home / New Sale / Orders / Customers / Settings |

Detail notes:

- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Product_Management_Navigation]]
- [[Tenant_Admin_Inventory_Navigation]]
- [[Tenant_Admin_Settings_Responsive_Design]]
- [[Tenant_Admin_Settings_Component_Catalogue]]

## Permission Rule

Menu items depend on backend feature entitlement + permission. Do not hardcode role names. Do not invent permission keys.

## Online Store Boundary

Online Store is an approved **top-level sidebar item**. Customer-facing storefront UI is not part of Flutter POS. Route is currently a **gap** — see sidebar navigation note.

## Offline UI Rule

Tenant admin write operations should clearly show when action requires online connection.

## Superseded

- Dark-blue full sidebar as final shared layout
- Footer Settings-area-only / footer excluded
- Products without nested children
- Settings inside Products
- Inventory under Hardware

## Related Files

- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]
- [[Flutter_Permission_Based_UI_Rendering]]
- [[Flutter_Routing_Guards]]
