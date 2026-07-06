# Price Lists Setup Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 14_Pricing_Tax_Management |
| Feature | Price Lists Setup |
| Feature Type | Create / Update / Delete / Read / Workflow |
| API Endpoint | `/api/v1/pricing/price-lists` |
| Application Service | `PriceListService` |
| Required Permission | `pricing.price_lists.create`, `pricing.price_lists.view`, `pricing.price_lists.update`, `pricing.price_lists.delete` |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | High |

## Purpose

Defines validation, access, and database tests for the Price Lists Setup functionality in TM-EPOS MVP.

## Preconditions

- Tenant exists and is active.
- User is authenticated.
- User has required permissions.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| PR-PL-001 | Valid request to create price list succeeds | API / Integration | High | Price list created with outlet/channel assignments |
| PR-PL-002 | Required name or code is missing | API / Unit | High | 400 validation response |
| PR-PL-003 | User does not have create permission | API / Unit | High | 403 forbidden |
| PR-PL-004 | Cross-tenant outlet/channel allocation attempted | API / Integration | High | Data isolation prevents linking other tenant's outlets/channels |
| PR-PL-005 | Duplicate price list code | Unit / Integration | Medium | 409 conflict |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| PR-PL-SUCCESS-001 | Create price list with assignments | Outlets and channels exist | Price list code, name, type, currency, assignments | Call CreateAsync | Price list and PriceListOutlet/PriceListChannel associations created | Passed |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| PR-PL-VALIDATION-001 | Missing price list code | Empty code | 400 validation response | Passed |
| PR-PL-VALIDATION-002 | Invalid valid period | valid_until < valid_from | 400 validation response | Passed |
| PR-PL-VALIDATION-003 | Duplicate price list code | Existing code | 409 duplicate code | Passed |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| PR-PL-PERMISSION-001 | User has required create permission | pricing.price_lists.create | Price list created successfully | Passed |
| PR-PL-PERMISSION-002 | User missing create permission | None | 403 forbidden | Passed |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| PR-PL-TENANT-001 | Access other tenant price list | Tenant B list exists | 404 not found | Passed |

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| PR-PL-DB-001 | Price list persisted correctly | price_lists table has priority, currency, type, dates, and auditing fields | Passed |
| PR-PL-DB-002 | Outlet and channel assignments persisted | price_list_outlets and price_list_channels rows created | Passed |
| PR-PL-DB-003 | Default flag cleared from other lists | Only one default active price list remains for tenant | Passed |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | PriceListServiceTests.cs | CreateAsync_WithoutPermission_ReturnsPermissionDenied | Passed |
| E_POS.UnitTests | PriceListServiceTests.cs | CreateAsync_WithPermission_Succeeds | Passed |
| E_POS.UnitTests | PriceListServiceTests.cs | CreateAsync_WithDuplicateCode_ReturnsConflict | Passed |
| E_POS.UnitTests | PriceListServiceTests.cs | CreateAsync_WithInvalidCurrency_ReturnsError | Passed |
| E_POS.UnitTests | PriceListServiceTests.cs | CreateAsync_WithInvalidOutlets_ReturnsError | Passed |
| E_POS.UnitTests | PriceListServiceTests.cs | GetByIdAsync_WhenExists_ReturnsPriceList | Passed |
| E_POS.UnitTests | PriceListServiceTests.cs | DeleteAsync_SetsStatusToDeleted | Passed |
| E_POS.IntegrationTests | PriceListRepositoryTests.cs | PriceListCodeExistsAsync_ReturnsTrue_WhenCodeExists | Passed |
| E_POS.IntegrationTests | PriceListRepositoryTests.cs | ClearOtherDefaultsAsync_ClearsDefaultFlagsForOtherLists | Passed |
| E_POS.IntegrationTests | PriceListRepositoryTests.cs | GetByIdAsync_RetrievesCorrectAssignments | Passed |
| E_POS.ApiTests | PriceListsControllerTests.cs | Create_WithTenantClaims_Returns201Created | Passed |
| E_POS.ApiTests | PriceListsControllerTests.cs | Controller_RequiresTenantOnlyPolicy | Passed |

## Test Commands

```powershell
dotnet test --filter "FullyQualifiedName~PriceListServiceTests|FullyQualifiedName~PriceListRepositoryTests|FullyQualifiedName~PriceListsControllerTests"
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed |
| Integration Tests | Passed |
| API Tests | Passed |
| Manual Verification | Done |
| Known Gaps | None |
