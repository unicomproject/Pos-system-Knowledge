<!-- title: Tenant Admin Category Brand Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Category Brand Management Flow

## Purpose

Defines category and brand creation for product organization.

## Actor

Tenant Admin

## Source

Derived from `Slide 8 - Category / Brand Management Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens category or brand management.

## Preconditions

- Tenant Admin has catalog management permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open category/brand management | System opens category/brand list. |
| 2 | View existing categories/brands | System displays existing records. |
| 3 | Click add category/brand | Tenant Admin starts new record. |
| 4 | Enter name | Tenant Admin enters category or brand name. |
| 5 | Add description if needed | Tenant Admin adds optional description. |
| 6 | Set status | Tenant Admin sets active/inactive. |
| 7 | Validate details | System checks required fields and duplicates. |
| 8 | Save category/brand | System saves record. |
| 9 | Available for product mapping | Category/brand can be selected on products. |

## Data Used Or Captured

- Category name
- Brand name
- Description
- Status

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Category/brand data must be tenant-scoped.

## Validation And Error Cases

- Duplicate name
- Missing name
- Permission denied

## Outcome

Category or brand is available for product setup.

## Related Modules

- 09_Catalog_Master_Data
- 10_Product_Core

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core.md
