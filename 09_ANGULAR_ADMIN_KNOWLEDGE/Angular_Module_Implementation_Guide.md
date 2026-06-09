<!-- title: Angular Module Implementation Guide -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Angular Module Implementation Guide

## Purpose

This file defines how to implement Release 1 Angular feature modules for
SCS-TIX Platform Admin Web.

Use this guide for `auth`, `admin`, `products`, `categories`, and `reports`.

## Feature Implementation Rule

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

Do not put feature-specific logic into shared folders.

## Implementation Order

Recommended order:

1. Core auth/session setup.
2. Layout shell and sidebar.
3. Guards and directives.
4. Admin dashboard and tenant list.
5. Tenant wizard.
6. Tenant context and tenant switcher.
7. Entitlement and permission screens.
8. Outlet/till/user/role screens.
9. Products and categories.
10. Reports and exports.

## Page Component Rule

Pages should read route state, connect to feature store/service, compose reusable
components, and handle page-level loading/error state.

Pages should not build raw API URLs, duplicate reusable layouts, contain backend
business rules, or repeat permission logic.

## Feature Store Rule

Feature stores/services manage list state, filters, pagination, selected record,
loading/error state, submit workflow, and tenant context reset behavior.

## Model Rule

Feature models belong inside `features/<feature>/models`.

Shared models such as API response, current user, permission, entitlement, and
tenant context belong inside `core/models`.

## Utility Rule

Feature utilities stay inside `features/<feature>/utils`.

Move a utility to `shared/utils` only when reused by two or more features.

## Guard Rule

Routes must define required access metadata.

Guard logic must be reusable and not duplicated per feature.

## Reusable Component Rule

Before creating a component, check `shared/ui`, `shared/components`, and current
feature `components`.

If the same UI pattern appears in two or more features, move it to shared.

## Feature Acceptance Checklist

- Feature uses lazy-loaded routes.
- APIs are called through typed services.
- Tenant-scoped pages require tenant context.
- Permission and entitlement guards exist where required.
- Empty/loading/error states are implemented.
- No hardcoded final data.
- Only Platform Admin Web Release 1 routes are present.

## Related Files

- [[Platform_Admin_Folder_Structure]]
- [[Reusable_Component_Strategy]]
- [[Routing_And_Guards]]
