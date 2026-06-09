<!-- title: Reusable Component Strategy -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Reusable Component Strategy

## Purpose

This file defines reusable component rules for SCS-TIX Angular Platform Admin
Web Release 1.

The app must not copy/paste the same table, form, modal, badge, loading, empty,
or error layout into multiple pages.

## Component Layers

| Layer | Location | Rule |
|---|---|---|
| UI primitives | `shared/ui` | Inputs/outputs only, no business logic |
| Shared admin components | `shared/components` | Reusable page blocks |
| Shared directives/pipes | `shared/directives`, `shared/pipes` | Access, format, focus helpers |
| Feature components | `features/<feature>/components` | Reusable only inside one feature |
| Page components | `features/<feature>/pages` | Route-level orchestration only |

## Required Shared Components

| Component | Used By |
|---|---|
| `page-header` | All route pages |
| `data-table` | Tenants, users, products, categories, reports, audit lists |
| `filter-panel` | Product, category, report, user, admin list pages |
| `form-card` | Tenant, product, category, user, role, settings forms |
| `status-badge` | Tenant, subscription, product, stock, report statuses |
| `confirm-dialog` | Deactivate, disable, reset, destructive actions |
| `empty-state` | Empty data screens |
| `loading-state` | Data-heavy screens |
| `error-state` | API and form errors |
| `permission-denied` | Permission blocked routes/actions |
| `tenant-context-banner` | Tenant-scoped pages |

## Reuse Rule

Before creating a new component, check `shared/ui`, `shared/components`, and the
current feature `components`.

If the same UI pattern is needed in two or more features, move it to shared.

## Shared Component Rule

Shared components must communicate through inputs and outputs only.

Shared components must not inject feature API services.

Shared components must not contain tenant-specific business rules.

## Feature Component Rule

Feature components can know feature-specific view models.

Examples include `product-form`, `category-tree`, `permission-matrix`,
`entitlement-selector`, and `report-filter-panel`.

## Page Rule

Pages should compose reusable components and connect to feature store/service.

Pages should not duplicate reusable UI patterns.

## Directive Rule

Permission and feature display logic should use reusable directives instead of
repeated if/else logic in every template.

## Related Files

- [[Platform_Admin_Folder_Structure]]
- [[Angular_Module_Implementation_Guide]]
- [[Permission_Based_Menu]]
- [[../07_UI_UX_KNOWLEDGE/Design_System]]
