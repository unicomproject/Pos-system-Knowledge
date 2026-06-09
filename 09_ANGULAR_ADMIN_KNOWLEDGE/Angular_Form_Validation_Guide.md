<!-- title: Angular Form Validation Guide -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Angular Form Validation Guide

## Purpose

This file defines Angular Reactive Form validation rules for the Platform Admin
Web Portal.

Frontend validation improves UX.

Backend validation remains authoritative.

## Form Technology

Use Angular Reactive Forms for Release 1 forms.

Do not put business validation only in templates.

## Form Locations

| Form Area | Feature |
|---|---|
| Login | `features/auth` |
| Tenant wizard | `features/admin` |
| Subscription assignment | `features/admin` |
| Feature entitlement | `features/admin` |
| Platform user form | `features/admin` |
| Tenant user form | `features/admin` |
| Role/permission form | `features/admin` |
| Outlet/till forms | `features/admin` |
| Product form | `features/products` |
| Category form | `features/categories` |
| Report filter | `features/reports` |

## Validation Layers

| Layer | Responsibility |
|---|---|
| Template | Display errors only |
| Component | Form group setup and submit orchestration |
| Validator utility | Reusable field/group validators |
| Feature service/store | Submit state and API calls |
| Backend | Authoritative business validation |

## Required Field Rules

Required fields must show validation before submit when touched/dirty and after
submit attempt.

Do not show all errors on initial page load.

## Backend Error Mapping

Backend validation errors should map to field error, form-level error, step-level
error in tenant wizard, or safe global error for unexpected failures.

## Tenant Wizard Validation

Tenant wizard must validate each step before moving forward.

Backend still validates final create/update.

Wizard state must not bypass backend validation.

## Product and Category Validation

Product/category forms must support tenant-scoped validation.

Duplicate SKU, barcode, product code, category slug, and similar conflicts are
backend authoritative.

Frontend may validate format and required fields only.

## Submit State

Every submit action must show loading/submitting state, disabled duplicate submit,
success feedback, safe backend error, and retry path where useful.

## Validation Anti-Patterns

Do not hardcode tenant/product/category data, trust frontend tenant ID, put
business rules only in template conditions, ignore backend 400/403/409, or keep
stale form state after tenant switch.

## Related Files

- [[Tenant_Wizard_State]]
- [[Angular_API_Integration_Guide]]
- [[Reusable_Component_Strategy]]
- [[../07_UI_UX_KNOWLEDGE/Empty_Error_Loading_States]]
