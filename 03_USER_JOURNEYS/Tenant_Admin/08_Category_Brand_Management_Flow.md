<!-- title: Tenant Admin Category & Brand Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-30 -->

# Tenant Admin Category & Brand Management Flow

## Purpose

Defines category (hierarchical) and brand (flat) creation for product organization.

## Actor

Tenant Admin

## Source

Derived from `Slide 8 - Category / Brand Management Flow` in `tenant-full-journey.pptx` and aligned to OneVerz POS MVP Second Brain scope.

## Trigger

Tenant Admin opens category or brand management.

## Preconditions

- Tenant Admin has `catalog.categories.view`/`catalog.brands.view` or `manage` permissions.
- `product_catalog` entitlement is enabled.

## Main Flow - Categories

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open category management | System displays recursive category tree and list. |
| 2 | Click add category | Tenant Admin starts new category record. |
| 3 | Enter details | Tenant Admin enters Name, Code, Description, Image (optional), Status, and Sort Order. Slug is generated. Department is not collected. |
| 4 | Assign Parent (Optional) | Tenant Admin selects an existing ACTIVE category as a parent (Max Depth: 5). INACTIVE/DELETED parents are not newly selectable. |
| 5 | Set status | Tenant Admin sets ACTIVE/INACTIVE via the same save/update contract (`PUT`), not a separate status API. |
| 6 | Save category | System validates tenant uniqueness, no circular dependencies, subtree depth ≤ 5, and saves atomically. |
| 7 | Product mapping | Product Setup loads ACTIVE Categories from `GET /api/v1/tenant-admin/products/create-options`, not from Category Management `/categories/tree`. Inactivating does not delete existing product mappings. |

## Main Flow - Brands

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open brand management | System displays flat brand list. |
| 2 | Click add brand | Tenant Admin starts new brand record. |
| 3 | Enter details | Tenant Admin enters Name, Code, and Description. |
| 4 | Upload Logo (Optional) | Tenant Admin uploads brand logo. |
| 5 | Set status | Tenant Admin sets ACTIVE/INACTIVE. |
| 6 | Save brand | System validates uniqueness and saves. |
| 7 | Product mapping | Brand is available in Product Setup. |

## Data Used Or Captured

- Category: Name, Code, Parent Category, Description, Image, Status, Sort Order
- Brand: Name, Code, Logo, Description, Status

## Access And Security Rules

- Tenant Admin must be authenticated.
- Tenant status, feature entitlement (`product_catalog`), and permission must be enforced.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.

## Validation And Error Cases

- Duplicate Name (`category.duplicate_name`) / Duplicate Code (`category.duplicate_code`) — tenant-wide
- Circular Parent Dependency (Categories)
- Hierarchy Depth > 5 (Categories)
- Missing Name/Code
- Permission denied
- INACTIVE parent on create/re-parent (`category.parent_inactive`)

## Implementation Status

| Layer | Status |
|---|---|
| Backend | **IMPLEMENTED** |
| Flutter | **PENDING** |
| End-to-End | **NOT COMPLETE** |

> [!NOTE]
> Canonical contract IMPLEMENTED (ADR 010 + 2026-08-27 backend closure). **Department is not part of Category Management.** Category Code and Name uniqueness are tenant-wide (including DELETED). Migration `20260827140000_DecoupleCategoryFromDepartment` applied with CAT-MIG-PREFLIGHT-001.
>
> Product Setup uses `GET /api/v1/tenant-admin/products/create-options`, not `/categories/tree`. Effective Product Setup selectability requires Category + all ancestors ACTIVE (**BR-CAT-PRODUCT-SELECT-001**).
>
> Authority: [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]], [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_BACKEND_GAP_FIX_CLOSURE_2026-08-27]]

## Outcome

Category or brand is available for product setup.

## Related Modules

- 09_Catalog_Master_Data
- 10_Product_Core

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md
- 04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/Tenant_Admin_Category_Management_Specification.md
- 08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Category_Management_Flutter_Implementation_Specification.md
- 10_TESTING_QA/Test_Case/07_CatalogProduct/Tenant_Admin_Category_Management_QA_Contract.md
- 15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_FINAL_CONTRACT_CLOSURE_2026-08-27.md
- 15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_FINAL_CONTRACT_HARDENING_2026-08-27.md
- 13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department.md
