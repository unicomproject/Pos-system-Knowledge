<!-- title: Tenant Admin Sidebar Navigation -->
<!-- status: Active — white sidebar + menu order approved; implementation not complete -->
<!-- system: TM-EPOS MVP / OneVerz POS -->
<!-- last_updated: 2026-07-29 -->
<!-- doc_type: Architecture approval — documentation only -->

# Tenant Admin Sidebar Navigation

## Purpose

Define the **final approved** shared white/light Tenant Admin sidebar for all `/tenant-admin/*` screens.

Parent architecture: [[Tenant_Admin_Settings_Shared_Layout_Architecture]]

This note does **not** mark implementation complete.

## Visual Design (Approved)

| Rule | Value |
|---|---|
| Background | White or very light |
| Text | Dark |
| Icons | Muted outline |
| Active background | Light purple |
| Active icon + text | Purple |
| Active container | Rounded |
| Nested children | Clear indent/spacing under parent |
| Edge | Thin subtle border between sidebar and content |
| Consistency | Same visual design on all Tenant Admin pages |

**Do not** use a dark-blue full sidebar for the final shared Tenant Admin layout.

**Current code reality (2026-07-29):** `TenantAdminSidebar` still uses a dark navy gradient. That is **not** the approved final visual — treat as pending implementation work.

## Top-Level Menu Order (Locked)

Exact logical order — do not reorder without product approval:

1. Dashboard
2. Outlets
3. Tills
4. Users
5. Online Store
6. Roles & Access
7. Hardware
8. Inventory
9. Products
10. Settings

Settings is the **final** sidebar item and must remain visually separate from the Products expanded group.

### Current catalog vs approved order (inspected)

Current `tenantAdminMenuCatalog` order differs:

`Dashboard → Outlets → Tills → Users → Roles & Access → Products → Stock → Reports → Billing → Settings → Activity`

Gaps / mismatches to resolve in implementation (not invented here):

| Approved item | Current code |
|---|---|
| Online Store | **Missing** route + menu item |
| Hardware | **Missing** route + menu item |
| Inventory | Present as **Stock** → `/tenant-admin/stock/current` |
| Products | Present; children list differs (see below) |
| Settings | Present as final-ish item but not last (Activity follows) |
| Reports / Billing / Activity | Present in current catalog; **not** in approved top-level order — product must decide keep-as-secondary vs remove from primary sidebar |

## Products Nested Menu (Approved)

Products is a collapsible parent.

```text
Products
├── Product List
├── Add Product
├── Categories
├── Brands
├── Inventory
└── Import
```

Rules:

- Expand/collapse indicator on Products parent
- Products remains expanded when any child route is active
- Active child uses light purple highlight
- Only one active child at a time
- Child routes must use **existing** GoRouter routes — do not invent paths
- Child visibility follows permissions + feature entitlements

Detail: [[Tenant_Admin_Product_Management_Navigation]]

### Current Products children (inspected)

Current `ProductsSidebarVisibility` children:

1. Product Dashboard → `/tenant-admin/products/dashboard`
2. Product List → `/tenant-admin/products`
3. Add Product → `/tenant-admin/products/add`
4. Categories → `/tenant-admin/categories`
5. Brands → `/tenant-admin/brands`
6. Variant Templates → `/tenant-admin/variant-templates`

| Approved child | Status |
|---|---|
| Product List | Exists |
| Add Product | Exists |
| Categories | Exists |
| Brands | Exists |
| Inventory | **Gap** — not in current children; see [[Tenant_Admin_Inventory_Navigation]] |
| Import | Route exists `/tenant-admin/products/import` but **not** in current children list |
| Product Dashboard / Variant Templates | Present in code; **not** in approved child list — product confirmation needed before removal |

## Settings Menu

- Final sidebar item
- Outside Products children
- Opens Tenant Admin Settings module (`/tenant-admin/settings` exists)
- On Settings screen: sidebar Settings **and** footer Settings are both active

## Permission / Feature Model

Each menu item configuration must support typed fields:

| Field | Purpose |
|---|---|
| `key` | Stable id |
| `label` | Display label |
| `icon` | Outline icon |
| `route` | Existing GoRouter path |
| `required permission` | Existing permission code / alias |
| `required feature entitlement` | Existing feature code |
| `child items` | Nested children when expandable |
| `active state` | Route match |
| `expanded state` | Parent expand |
| `disabled/unavailable state` | Missing route or denied access |

Suggested typed model: `TenantAdminSidebarItemModel` with `key`, `label`, `icon`, `route`, `permission`, `featureEntitlement`, `children`, `isExpandable`.

Do not invent permission keys. Prefer existing Flutter aliases + backend canonical codes.

## Component Architecture

One reusable shared sidebar:

```text
TenantAdminSidebar
├── TenantAdminSidebarItem
├── TenantAdminSidebarExpandableItem
├── TenantAdminSidebarChildItem
├── TenantAdminSidebarActiveIndicator
└── TenantAdminSidebarMobileDrawer
```

Rules:

- Typed models — not raw maps where models fit
- Same menu order on desktop sidebar and mobile drawer
- Drawer closes after successful navigation
- Do not build a separate sidebar per feature page

## Pages That Must Use This Sidebar

Dashboard, Outlets, Tills, Users, Online Store, Roles & Access, Hardware, Inventory, Product List, Add Product, Categories, Brands, Product Inventory, Import, Settings, and all approved future Tenant Admin pages.

## Related Files

- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Product_Management_Navigation]]
- [[Tenant_Admin_Inventory_Navigation]]
- [[Tenant_Admin_Settings_Responsive_Design]]
- [[Tenant_Admin_Settings_Component_Catalogue]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]
- [[Flutter_Tenant_Admin_Layout]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_UI_Rules]]
