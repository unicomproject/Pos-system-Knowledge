<!-- title: Flutter Tax Management Implementation -->
<!-- status: Target Contract / Not yet re-implemented to canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-03 -->
<!-- authority: [[../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]] -->
<!-- supersedes: pre-2026-09-03 form-top + Tax Type PERCENTAGE/amount implementation notes as canonical UX -->

# Flutter Tax Management Implementation (Target Specification)

## Status

This document is the **target Flutter implementation specification** aligned to the Tax Management Canonical Contract (2026-09-03).

Current Flutter code under `lib/features/tenant_admin/pricing_tax/tax_management/` may still reflect the **legacy** single-page form (Tax Type PERCENTAGE/amount). That runtime is **implementation debt**, not Second Brain authority.

**Do not** implement from the superseded 2026-08-14 form layout.

## Feature ownership

Bounded context: `pricing_tax`  
Path: `lib/features/tenant_admin/pricing_tax/tax_management/`

Navigation (visual): `Products → Tax Setup`  
Code ownership remains `pricing_tax`.

## Screens to implement (later)

1. Tax Setup List (+ empty state)
2. Add Tax Setup
3. Edit Tax Setup
4. Schedule Rate Change modal/sheet
5. Activate/Deactivate confirmation
6. Products Using Tax

No breadcrumb. No Used For. No Summary & Preview on Add.

## API integration (target)

Prefer existing aggregate:

- `GET/POST /api/v1/tax`
- `GET/PUT /api/v1/tax/{id}`
- Schedule/status/products-using extensions per canonical contract

Product Setup tax options: prefer `GET /api/v1/tenant-admin/products/create-options`.

## Domain models (target)

- Tax Setup: id, name, code, description, treatment, status, currentRate, nextRate, productCount
- Treatment: TAXABLE | ZERO_RATED | EXEMPT
- TaxPriceMode on product: INCLUSIVE | EXCLUSIVE (`taxExclusive` bool alias)

## Permissions (UI gating only)

TARGET: `pricing.tax_classes.view|create|update|status.manage`, `pricing.tax_rates.view|schedule.manage`, `pricing.tax_classes.products.view`  
Backend remains authority.

## Related

- [[../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Tax_Management]]
- [[../03_USER_JOURNEYS/Tenant_Admin/10_Tax_Management_Flow]]
