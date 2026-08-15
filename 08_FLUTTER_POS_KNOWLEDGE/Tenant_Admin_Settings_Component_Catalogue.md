<!-- title: Tenant Admin Settings Component Catalogue -->
<!-- status: Active — shared shell components approved; implementation not complete -->
<!-- system: OneVerz POS MVP POS -->
<!-- last_updated: 2026-07-29 -->
<!-- doc_type: Architecture approval — documentation only -->

# Tenant Admin Component Catalogue

## Purpose

Reusable components for **all** Tenant Admin screens inside `TenantAdminSharedShell`.

Parent: [[Tenant_Admin_Settings_Shared_Layout_Architecture]]  
Sidebar: [[Tenant_Admin_Sidebar_Navigation]]  
Responsive: [[Tenant_Admin_Settings_Responsive_Design]]

Rules:

- Do not implement a complete screen in one large widget
- Do not duplicate header / sidebar / footer code
- Do not duplicate card styles
- One clear responsibility per component
- Support loading, empty, error, disabled, permission states
- Use shared theme / design tokens
- Typed parameters — not raw maps where models fit

## Shared Layout Components

| Component | Responsibility |
|---|---|
| `TenantAdminSharedShell` | Owns header + white sidebar/drawer + content + footer |
| `TenantAdminHeader` | Fixed black OneVerz header |
| `TenantAdminSidebar` | White/light reusable sidebar |
| `TenantAdminFooterNavigation` | Fixed black footer |
| `TenantAdminBreadcrumb` | Typed crumbs |
| `TenantAdminResponsiveContentArea` | Scrollable content host with correct insets |
| `TenantAdminDetailsSidePanel` | Optional right panel / mobile full-screen form |

### Sidebar subcomponents

```text
TenantAdminSidebar
├── TenantAdminSidebarItem
├── TenantAdminSidebarExpandableItem
├── TenantAdminSidebarChildItem
├── TenantAdminSidebarActiveIndicator
└── TenantAdminSidebarMobileDrawer
```

Typed model example: `TenantAdminSidebarItemModel` — key, label, icon, route, permission, featureEntitlement, children, isExpandable.

### Footer component

`TenantAdminFooterNavigation` items: Home, New Sale, Orders, Customers, Settings.

Settings is active only for Settings ownership. On Brand, Product/Brand are active and Settings is inactive.

**Supersedes:** earlier catalogue statements that marked this footer as Excluded from Tenant Admin.

## Shared Card Components

| Component | Responsibility |
|---|---|
| `TenantAdminPageHeaderCard` | Title + primary actions |
| `TenantAdminSearchCard` | Search |
| `TenantAdminFilterCard` | Filters |
| `TenantAdminTableCard` | Table + pagination |
| `TenantAdminFormCard` | Form groups |
| `TenantAdminSummaryCard` | Summary metrics |
| `TenantAdminImageUploadCard` | Image upload/preview |
| `TenantAdminStatusBadge` | Status chip |
| `TenantAdminEmptyStateCard` | Empty |
| `TenantAdminErrorStateCard` | Error + retry |
| `TenantAdminPermissionDeniedCard` | No access |
| `TenantAdminConfirmationDialog` | Confirmations |

## Brands Composition

```text
TenantAdminSharedShell
├── Shared Header
├── Shared Black Sidebar
│   ├── Products expanded
│   └── Brands active
├── BrandsManagementScreen
│   ├── Breadcrumb
│   └── One continuous white Brand workspace
│       ├── First region: breadcrumb/header/Add/search/table/pagination
│       └── Second region: permanent details/no-selection/form
└── Shared Fixed Footer
    └── Settings inactive on Brand route
```

## Current Code Name Mapping (Truthful)

| Approved name | Current code (if any) | Status |
|---|---|---|
| `TenantAdminSharedShell` | `TenantAdminLayout` | Partial — rename/align pending |
| `TenantAdminHeader` | `TenantAdminAppHeader` | Present (black header) |
| `TenantAdminSidebar` | `TenantAdminSidebar` | Present but **dark blue** — white redesign pending |
| `TenantAdminFooterNavigation` | `TenantAdminFooterNavigation` | Present |
| Card catalogue names | Mixed / partial feature widgets | Not fully unified |

Do not mark the catalogue as fully implemented.

## Theme / Token Rule

Use tokens listed in [[Tenant_Admin_Settings_Responsive_Design]]. No magic numbers per screen.

## Related Files

- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Settings_Responsive_Design]]
- [[Brands_Management_Screen_Specification]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]
- [[Flutter_Tenant_Admin_Layout]]
