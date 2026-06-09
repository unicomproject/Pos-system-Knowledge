<!-- title: Platform Admin Folder Structure -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Platform Admin Folder Structure

## Purpose

This file defines the Release 1 Angular folder structure for the SCS-TIX Platform
Admin Web Portal.

Use only the implemented Release 1 feature folders.

## Top-Level Structure

```text
src/app/
  core/
    services/
    interceptors/
    guards/
    models/
    config/
  shared/
    components/
    directives/
    pipes/
    utils/
    ui/
  layout/
    header/
    footer/
    sidebar/
    main-layout/
  features/
    auth/
    admin/
    products/
    categories/
    reports/
  app-routing.module.ts
```

## Standard Feature Pattern

```text
features/<feature>/
  pages/
  components/
  services/
  models/
  store/
  routes/
  utils/
```

## Folder Responsibilities

| Folder | Responsibility |
|---|---|
| `core/services` | Auth, tenant context, permissions, entitlements, session, API error handling |
| `core/interceptors` | Auth token, selected tenant context, correlation ID, global errors |
| `core/guards` | Auth, permission, entitlement, tenant-context guards |
| `core/models` | Shared app models such as API response, auth session, current user |
| `core/config` | Route paths, menu config, endpoint names, storage keys, app config |
| `shared/components` | Data table, page header, empty/error/loading, permission-denied |
| `shared/directives` | `hasPermission`, `hasFeature`, access helpers |
| `shared/pipes` | Date, money, status label formatting |
| `shared/ui` | Button, input, modal, tabs, drawer, toast, skeleton |
| `layout` | Header, sidebar, main platform admin shell |

## Admin Feature Structure

```text
features/admin/
  pages/
    dashboard-page/
    tenant-list-page/
    tenant-create-page/
    tenant-detail-page/
    subscription-plan-list-page/
    subscription-assignment-page/
    module-feature-control-page/
    feature-entitlement-page/
    platform-user-list-page/
    tenant-user-list-page/
    role-list-page/
    permission-matrix-page/
    outlet-list-page/
    till-list-page/
    audit-log-page/
    system-settings-page/
    tenant-settings-page/
  components/
    tenant-wizard/
    tenant-switcher/
    permission-matrix/
    entitlement-selector/
    module-feature-tree/
    setup-checklist/
  services/
  models/
  store/
  routes/
  utils/
```

## Tenant-Scoped Features

Products, categories, and reports are tenant-scoped feature folders.

They must require selected tenant context, permission, and feature entitlement.

Product, category, and report list screens must use backend pagination, filtering, and sorting.

## Related Files

- [[Angular_App_Architecture]]
- [[Angular_Module_Implementation_Guide]]
- [[Reusable_Component_Strategy]]
- [[Routing_And_Guards]]
