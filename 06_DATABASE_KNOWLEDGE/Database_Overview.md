<!-- title: Database Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# Database Overview

## Purpose

This folder documents the TM-EPOS MVP database design using the uploaded
Unified Commerce database design as the source of truth.

This version expands every module into implementation-style table attribute
sections.

## Important Source Note

The uploaded design provides entity tables with PK/FK/UNIQUE/CHECK constraints.
These Markdown files expand those constraints into practical implementation
attribute tables using consistent TM-EPOS database standards.

## Enum Rule

Database enum datatypes are not used.

Status, type, source, method, category, priority, direction, operation, and
similar domain value columns must use varchar/text plus `CHECK(...)` constraints.

## Duplicate Removal Rule

Modules 03 and 04 in the uploaded design contain the same catalogue, plan, add-on,
and entitlement table set.

They are combined into one file:

```text
03_04_Catalog_And_Subscription_Catalog_Plans_Addons_And_Entitlements.md
```

No duplicate table documentation is created.

## Module Index

| No. | Module | Table Count | File |
|---:|---|---:|---|
| 01 | Platform Administration | 10 | [[Tables/01_Platform_Administration]] |
| 02 | Tenant Foundation | 9 | [[Tables/02_Tenant_Foundation]] |
| 03_04 | Catalog + Subscription Catalog, Plans, Add-ons & Entitlements | 12 | [[Tables/03_04_Catalog_And_Subscription_Catalog_Plans_Addons_And_Entitlements]] |
| 05 | Subscription, Billing, Payments & Usage | 10 | [[Tables/05_Subscription_Billing_Payments_And_Usage]] |
| 06 | Tenant Users, Roles, Permissions & Outlet Access | 11 | [[Tables/06_Tenant_Users_Roles_Permissions_And_Outlet_Access]] |
| 07 | Invitations, Authentication, Tokens & Security Audit | 7 | [[Tables/07_Invitations_Authentication_Tokens_And_Security_Audit]] |
| 08 | Outlet, Till & POS Device Foundation | 7 | [[Tables/08_Outlet_Till_And_POS_Device_Foundation]] |
| 09 | Hardware Operations, Till Session & Cash Control | 8 | [[Tables/09_Hardware_Operations_Till_Session_And_Cash_Control]] |
| 10 | Catalog Master Data & Product Core | 8 | [[Tables/10_Catalog_Master_Data_And_Product_Core]] |
| 11 | Product Mapping, Media, Attributes & Channel Visibility | 9 | [[Tables/11_Product_Mapping_Media_Attributes_And_Channel_Visibility]] |
| 12 | Product Option Templates & Variant Configuration | 6 | [[Tables/12_Product_Option_Templates_And_Variant_Configuration]] |
| 13 | Product Combo, Choice Options & Inventory Impact | 9 | [[Tables/13_Product_Combo_Choice_Options_And_Inventory_Impact]] |
| 14 | Pricing & Tax Management | 9 | [[Tables/14_Pricing_And_Tax_Management]] |
| 15 | Discount & Expiry Discount Management | 9 | [[Tables/15_Discount_And_Expiry_Discount_Management]] |
| 16 | Inventory Foundation, Product Tracking & Stock Availability | 8 | [[Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]] |
| 17 | Reservations, Stock Movements, Serial & Cost Allocation | 7 | [[Tables/17_Reservations_Stock_Movements_Serial_And_Cost_Allocation]] |
| 18 | Stock Adjustment, Transfer & Stocktake | 9 | [[Tables/18_Stock_Adjustment_Transfer_And_Stocktake]] |
| 19 | Customer Basic, Authentication & Consent | 7 | [[Tables/19_Customer_Basic_Authentication_And_Consent]] |
| 20 | Unified Order & Sales | 10 | [[Tables/20_Unified_Order_And_Sales]] |
| 21 | POS Operations | 10 | [[Tables/21_POS_Operations]] |
| 22 | Cart & Checkout | 9 | [[Tables/22_Cart_And_Checkout]] |
| 23 | Fulfilment & Pickup | 9 | [[Tables/23_Fulfilment_And_Pickup]] |
| 24 | Payment & Refund | 7 | [[Tables/24_Payment_And_Refund]] |
| 25 | Return, Inspection & Exchange | 8 | [[Tables/25_Return_Inspection_And_Exchange]] |
| 26 | Notification | 10 | [[Tables/26_Notification]] |
| 27 | Platform-Level Integration Core | 5 | [[Tables/27_Platform_Level_Integration_Core]] |
| 28 | Offline Operation & Sync | 7 | [[Tables/28_Offline_Operation_And_Sync]] |

## Caching Rule

Do not create generic database cache tables for virtual caching.

Offline support uses sync tracking tables such as `offline_clients`,
`device_sync_states`, `offline_number_blocks`, `sync_batches`, `sync_items`,
`offline_id_mappings`, and `sync_conflicts`.

## Related Files

- [[Migration_Rules]]
- [[Status_And_Type_Check_Rules]]
- [[Tenant_Id_Rules]]
- [[Table_Naming_Standards]]
