<!-- title: Tenant Admin Product Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Product Management Flow

## Purpose

Defines manual product creation and setup for sale readiness.

## Actor

Tenant Admin

## Source

Derived from `Slide 9 - Tenant Admin Product Management Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

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

## Outcome

Product is ready for sale and inventory operations.

## Related Modules

- 10_Product_Core
- 11_Product_Media_Attributes_Channel_Visibility
- 12_Product_Option_Variant_Configuration
- 16_Inventory_Foundation_Stock_Availability

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core.md
