<!-- status: Active canonical target; implementation partial -->
<!-- last_updated: 2026-08-12 -->
# Tenant Admin Category and Brand Management Flow

Category behavior remains governed by its own current contracts. This document locks the reconciled Brand journey.

## Current Brand source

Brand CRUD is tenant-protected, but Flutter currently opens Add/Edit in a modal/right overlay, has no selection state, and edits from an incomplete list summary. **P0 CURRENT DATA INTEGRITY DEFECT:** because list/detail responses omit Description, changing only Name can submit null and erase an existing Description.

## Target Brand journey

1. Open `/tenant-admin/brands`; load list only.
2. Keep `selectedBrandId = null`; do not request detail because list data arrived.
3. Show `No brand selected` and `Select a brand from the list to view its details.` in the permanent right region.
4. Row click sets Brand ID, highlights only that row, calls `GET /api/v1/brands/{id}`, and loads full detail in the right region while list stays mounted.
5. Edit uses full Name, Code, Description, SortOrder, image/media and Status. Regression: with Description `Original description` and SortOrder 5, changing only Name preserves both values after save.
6. `+ Add Brand` switches the same right region to Create with empty Name/Code, null Description, SortOrder 0, no image and ACTIVE. Cancel returns to no selection.
7. Delete confirmation names the Brand. If the selected Brand is deleted, clear selection, refresh list, select no replacement, and restore no-selection state.

## Rules

- Authentication and operation-specific Brand permission/Manage override are mandatory; tenant context is server-resolved.
- Code is trimmed, max 80, uppercase canonical and tenant-unique. Allowed characters, deleted-code reuse and restore semantics remain unresolved.
- Name is required/trimmed/max 150; Description optional/max 255; SortOrder integer/default 0/nonnegative; editable status ACTIVE/INACTIVE.
- Product mapping accepts nullable BrandId but target DB integrity requires a same-tenant composite FK.
- Image partial failure must state: `Brand details were saved, but the image upload failed.`

Implementation status: **TARGET — TO BE IMPLEMENTED** except verified existing CRUD/security elements documented in `04_Tenant_Admin_Brand_Management_Fresh_Source_Truth.md`.
