<!-- title: Product Onboarding Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Product Onboarding Flow

## Purpose

Defines initial product setup for a tenant by Platform Admin through manual entry or CSV import.

## Actor

Platform Admin

## Source

Derived from `Slide 6 - Product Onboarding Flow Updated` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens product onboarding for a tenant.

## Preconditions

- Tenant exists.
- Product/catalog permissions are available.
- Outlet exists if assigning stock quantity.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open product onboarding | System opens product onboarding. |
| 2 | Choose input method | Platform Admin chooses manual add or CSV import. |
| 3 | Manual add details | Platform Admin enters product details one by one. |
| 4 | Manual save | System saves entered product details. |
| 5 | CSV upload | Platform Admin uploads CSV file with product data. |
| 6 | Extract CSV data | System reads and loads CSV data. |
| 7 | Validate data | System validates extracted data. |
| 8 | Edit details if needed | Platform Admin fixes incorrect data. |
| 9 | Assign outlet and stock quantity | Platform Admin assigns product to outlets and initial stock quantity. |
| 10 | Save | System saves product data. |

## Data Used Or Captured

- Product details
- CSV file
- Category/variant information where applicable
- Outlet assignment
- Initial stock quantity

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Platform Admin may do initial onboarding; permitted tenant users can manage products later.
- Product data must remain tenant-scoped.

## Validation And Error Cases

- Invalid CSV format
- Duplicate SKU/barcode
- Missing required product fields
- Invalid outlet assignment
- Stock quantity invalid

## Outcome

Products are ready for POS and inventory operations.

## Related Modules

- 09_Catalog_Master_Data
- 10_Product_Core
- 11_Product_Media_Attributes_Channel_Visibility
- 12_Product_Option_Variant_Configuration
- 16_Inventory_Foundation_Stock_Availability

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core.md
- 06_DATABASE_KNOWLEDGE/Tables/11_Product_Mapping_Media_Attributes_And_Channel_Visibility.md
