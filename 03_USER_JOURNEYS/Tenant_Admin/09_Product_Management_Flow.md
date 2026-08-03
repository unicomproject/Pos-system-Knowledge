<!-- title: Tenant Admin Product Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-31 -->

# Tenant Admin Product Management Flow

## Purpose

Defines manual product creation, setup for sale readiness, and manual curation of the default POS Popular products list.

## Actor

Tenant Admin

## Source

Derived from `Slide 9 - Tenant Admin Product Management Flow` in `tenant-full-journey.pptx` and aligned to OneVerz POS MVP Second Brain scope.

## Trigger

Tenant Admin opens product management.

## Preconditions

- Tenant Admin has product management permission.
- Category/brand may exist.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open product management | System opens product module. |
| 2 | View product list | System displays product list. |
| 3 | Click add product | System opens product form. |
| 4 | Enter product basic details | Tenant Admin enters product name, SKU/barcode, category, brand, description, price, tax, attributes, variants, and image. |
| 5 | Add initial stock if needed | Tenant Admin enters stock quantity for outlet if required. |
| 6 | Validate product details | System checks product data. |
| 7 | If invalid | System shows validation error and user corrects details. |
| 8 | Save product | System saves product. |
| 9 | Product ready for sale | Product can be used in POS/online store according to visibility. |

## Popular Products Configuration Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Popular Products management | System opens Popular Products screen under Collection management. |
| 2 | View currently assigned popular products | System displays list in current `sort_order` sequence. |
| 3 | Add product to list | User searches active products and appends to selection list (no duplicates allowed). |
| 4 | Drag/drop or button click to reorder | User updates sequence of popular products. |
| 5 | Click Save | System transactionally deletes old `POS_POPULAR` mappings, inserts new mappings with updated `sort_order` values, and writes audit records. |

## Data Used Or Captured

- Product name
- Description
- Category
- Brand
- Attributes
- Variants
- Product image
- Barcode/SKU
- Price
- Tax
- Initial stock quantity
- Popular products selection list and order sequence

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Product is tenant-owned.
- Final stock is backend authority.
- Product visibility must respect channel/feature settings.

## Validation And Error Cases

- Duplicate SKU/barcode
- Invalid price/tax
- Missing required details
- Invalid stock quantity
- Cross-tenant product assignment (fails validation)

## Outcome

Product is ready for sale, and/or the popular products configuration is updated and sorted.

## Related Modules

- 10_Product_Core
- 11_Product_Media_Attributes_Channel_Visibility
- 12_Product_Option_Variant_Configuration
- 16_Inventory_Foundation_Stock_Availability
- 21_POS_Operations

## Related Files

- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../../04_MODULE_KNOWLEDGE/21_POS_Operations/04_Popular_Product_Discovery_Feature]]
