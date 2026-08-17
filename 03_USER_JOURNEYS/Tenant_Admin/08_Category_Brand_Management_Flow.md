<!-- status: Active canonical target; implementation partial -->
<!-- last_updated: 2026-08-15 -->
# Tenant Admin Category and Brand Management Flow

Category remains governed by its own contracts. Brand source truth is [[../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/04_Tenant_Admin_Brand_Management_Fresh_Source_Truth]].

## Current Brand Management

- No selection: full-width Brand list.
- Selection: Brand list plus read-only Brand Details.
- List and read-only details are IMPLEMENTED. Add/Edit actions are deferred.

## Locked Add journey

`Brand Management → Add Brand` opens Add Brand content inside the existing Tenant Admin common layout. Heading: `Add Brand`. Breadcrumb: `Product / Brand / Brand Management / Add Brand`. Use one shared Add/Edit form with empty/default values, fields Name*, Code*, Sort Order, optional Logo, Description and Status*, and actions Back to List, Cancel and Save Brand. No Brand Preview.

## Locked Edit journey

`Brand Management → Edit → route with brandId → loading → GET /api/v1/brands/{id} → guarded one-time prefill of the same form`. Heading: `Edit Brand`. Breadcrumb: `Product / Brand / Brand Management / Edit Brand`. Existing logo is shown; unchanged logo is not uploaded.

Back/Cancel with dirty data requires confirmation using an existing shared pattern if available. During save, disable Save, show progress, prevent a second request and retain the form on failure.

Current Add/Edit implementation: **MISSING / BLOCKED BY BACKEND P0 CONTRACT CLOSURE**.
