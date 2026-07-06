# Price List Items Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 14_Pricing_Tax_Management |
| Feature | Price List Items |
| Feature Type | Create / Update / Delete / Read |
| API Endpoint | `/api/v1/pricing/price-list-items` |
| Application Service | `PriceListItemsService` |
| Required Permission | `pricing.price_lists.update`, `pricing.price_lists.view`, `pricing.price_lists.delete` |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | High |

## Purpose

Defines validation, access, and database unique index testing for Price List Items in TM-EPOS MVP.

## Preconditions

- Price list, product, product variant, and UOM exist and belong to the same tenant.

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| PR-PLI-SUCCESS-001 | Assign product-level price to price list | Price list and product exist | Price list id, product id, price | Call CreateAsync | Item created successfully | Passed |
| PR-PLI-SUCCESS-002 | Assign variant-level price with UOM and min quantity | All aggregates exist | IDs, price, min quantity | Call CreateAsync | Item created with variant and UOM assignments | Passed |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| PR-PLI-VALIDATION-001 | Negative selling price | SellingPrice = -5.00 | 400 validation response | Passed |
| PR-PLI-VALIDATION-002 | CompareAtPrice is less than SellingPrice | CompareAt=10, Selling=15 | 400 validation response | Passed |
| PR-PLI-VALIDATION-003 | Minimum quantity is zero or negative | MinQty = 0 | 400 validation response | Passed |
| PR-PLI-VALIDATION-004 | Invalid price list id | Non-existing Guid | 400 bad request | Passed |
| PR-PLI-VALIDATION-005 | Invalid product or variant id | Non-existing Guid | 400 bad request | Passed |

## Duplicate Entry Test Cases

| Test Case ID | Scenario | Preconditions | Expected Result | Automated |
|---|---|---|---|---|
| PR-PLI-DUP-001 | Duplicate entry for same product/variant, UOM, and min quantity | Active item exists | 409 conflict duplicate entry | Passed |
| PR-PLI-DUP-002 | Overwrite deleted duplicate item | Soft-deleted duplicate exists | Previous deleted item removed; new item created successfully | Passed |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | PriceListItemsServiceTests.cs | CreateAsync_WithoutPermission_ReturnsPermissionDenied | Passed |
| E_POS.UnitTests | PriceListItemsServiceTests.cs | CreateAsync_WithPermission_Succeeds | Passed |
| E_POS.UnitTests | PriceListItemsServiceTests.cs | CreateAsync_WithInvalidPriceList_ReturnsError | Passed |
| E_POS.UnitTests | PriceListItemsServiceTests.cs | CreateAsync_WithInvalidProduct_ReturnsError | Passed |
| E_POS.UnitTests | PriceListItemsServiceTests.cs | CreateAsync_WithDuplicateEntry_ReturnsConflict | Passed |
| E_POS.UnitTests | PriceListItemsServiceTests.cs | UpdateAsync_UpdatesProperties | Passed |
| E_POS.IntegrationTests | PriceListItemsRepositoryTests.cs | ItemExistsAsync_IdentifiesDuplicate_AndRemovesDeletedRow | Passed |
| E_POS.IntegrationTests | PriceListItemsRepositoryTests.cs | AddAsync_PersistsPriceListItem | Passed |
| E_POS.ApiTests | PriceListItemsControllerTests.cs | Create_WithTenantClaims_Returns201Created | Passed |
| E_POS.ApiTests | PriceListItemsControllerTests.cs | Controller_RequiresTenantOnlyPolicy | Passed |

## Test Commands

```powershell
dotnet test --filter "FullyQualifiedName~PriceListItemsServiceTests|FullyQualifiedName~PriceListItemsRepositoryTests|FullyQualifiedName~PriceListItemsControllerTests"
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed |
| Integration Tests | Passed |
| API Tests | Passed |
| Manual Verification | Done |
| Known Gaps | None |
