<!-- title: Tenant Admin Settings Shared Layout Architecture -->
<!-- status: Active — shared shell + white sidebar approved; implementation not complete -->
<!-- system: TM-EPOS MVP / OneVerz POS -->
<!-- last_updated: 2026-07-29 -->
<!-- doc_type: Architecture approval — documentation decision recorded; UI implementation status must remain truthful -->

# Tenant Admin Shared Layout Architecture

## Purpose

Approve the **final shared reusable layout** for **all** Tenant Admin screens.

This note is **documentation only**. It does **not** mark Flutter or backend implementation complete.

Canonical companion notes:

- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Product_Management_Navigation]]
- [[Tenant_Admin_Inventory_Navigation]]
- [[Tenant_Admin_Settings_Responsive_Design]]
- [[Tenant_Admin_Settings_Component_Catalogue]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]

## Final Approved Shell (2026-07-29)

All Tenant Admin pages must use one shared reusable layout:

```text
TenantAdminSharedShell
├── Shared Fixed Black Header
├── Shared White Tenant Admin Sidebar
├── Responsive Dynamic Content Area
│   ├── Breadcrumb
│   ├── Page Header
│   ├── Page-specific Card Components
│   └── Optional Right-side Details Panel
└── Shared Fixed Black Footer Navigation
```

Rules:

- Header, **white/light sidebar**, and footer remain visually consistent on every Tenant Admin page
- Only the central page content and optional side panel may change
- Do not duplicate header / sidebar / footer inside feature screens
- Do not replace the Tenant Admin office shell with the Cashier/POS shell

## Shared Header (Required)

Shared reusable component (target name: `TenantAdminHeader` / current code: `TenantAdminAppHeader`).

| Area | Contents |
|---|---|
| Left | OneVerz POS logo; Till Session card; OPEN / CLOSED status; "Till Session" secondary label |
| Right | Current outlet selector; Current till selector; Notification bell + badge; Current user/profile area when supported |

Rules:

- Same header on every approved Tenant Admin page
- Fixed at the top; must not scroll with page content
- Must not be duplicated inside individual screens
- No hardcoded outlet, till, session status, or notification count
- Values from current application context / providers
- Responsive without overflow

## Shared White Sidebar (Required)

**Final visual decision:** white / very light sidebar — **not** a dark-blue full sidebar.

See [[Tenant_Admin_Sidebar_Navigation]] for:

- Exact top-level order
- Products nested menu
- Settings placement (final item)
- Permission / feature model
- Component structure

**Supersedes:** any active guidance that the final Tenant Admin shared layout uses a dark-blue full sidebar.

## Shared Footer (Required)

Fixed black footer on **all** approved Tenant Admin screens.

Items: Home · New Sale · Orders · Customers · Settings

On Tenant Admin Settings / catalog pages: Settings active (orange icon, orange label, orange bottom indicator).

Rules: shared reusable component; fixed; must not scroll away; must not cover content; safe-area aware; real routes; permission + feature checks; never duplicated per page.

## Brands Example Composition

```text
TenantAdminSharedShell
├── Shared Header
├── Shared White Sidebar
│   ├── Products expanded
│   └── Brands active
├── BrandsManagementScreen
│   ├── Breadcrumb
│   ├── Page Header Card
│   ├── Search and Filter Card
│   ├── Brand Table Card
│   └── Optional Brand Details Side Panel
└── Shared Fixed Footer
    └── Settings active
```

Brand table fields: Brand Logo, Brand Name, Code, Product Count, Sort Order, Status, Updated On, Actions.

## Routing Inspection Baseline (2026-07-29 — Do Not Invent)

Inspected: `tenant_admin_route_definition.dart`, `tenant_admin_menu_catalog.dart`, `products_sidebar_routes.dart`, `products_sidebar_visibility.dart`, `inventory_routes.dart`, POS shell footer destinations.

| Area | Existing route / status |
|---|---|
| Dashboard | `/tenant-admin/dashboard` |
| Outlets | `/tenant-admin/outlets` |
| Tills | `/tenant-admin/tills` |
| Users | `/tenant-admin/staff` |
| Roles & Access | `/tenant-admin/roles-permissions` |
| Products list | `/tenant-admin/products` |
| Add Product | `/tenant-admin/products/add` |
| Categories | `/tenant-admin/categories` |
| Brands | `/tenant-admin/brands` |
| Import | `/tenant-admin/products/import` |
| Top-level stock/inventory | `/tenant-admin/stock` (+ `/current`, `/in`, …) |
| Settings | `/tenant-admin/settings` |
| Online Store | **Gap** — no Tenant Admin route found |
| Hardware | **Gap** — no Tenant Admin route found |
| Products → Inventory child | **Gap** — not in current Products children; must not silently alias full Stock module without approved business rule |
| Footer Home | `/pos/home` |
| Footer New Sale | `/pos/new-sale` |
| Footer Orders | **Gap** — unavailable today |
| Footer Customers | `/pos/customers` |
| Footer Settings | `/tenant-admin/settings` |

## Permission Rules

Use existing permission + feature-entitlement architecture only.

- Do not invent permission keys
- Inspect backend canonical permissions, Flutter aliases, tenant context entitlements
- Hide/disable with approved existing behaviour
- Do not show an item and navigate to an unrelated page
- Do not bypass auth or tenant isolation
- Do not duplicate permission logic inside each screen

## Superseded Statements

| Older guidance | Status |
|---|---|
| Dark-blue full sidebar as final shared TA layout | **Superseded** — white/light required |
| Footer Settings-area-only | **Superseded** — footer on all TA pages |
| Footer excluded from Tenant Admin | **Superseded** |
| Separate sidebar per feature page | **Superseded** — one shared sidebar |
| Settings inside Products children | **Not approved** |
| Inventory under Hardware | **Not approved** — Inventory is its own top-level item |
| Products without nested children | **Superseded** — Products is expandable |

Do not delete archive history.

## Related Files

- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Product_Management_Navigation]]
- [[Tenant_Admin_Inventory_Navigation]]
- [[Tenant_Admin_Settings_Responsive_Design]]
- [[Tenant_Admin_Settings_Component_Catalogue]]
- [[Brands_Management_Screen_Specification]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]
- [[Flutter_Tenant_Admin_Layout]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_UI_Rules]]
