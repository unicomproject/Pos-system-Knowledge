# Product CRUD Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 10_Product_Core |
| Feature | Product CRUD |
| Feature Type | Create / Update / Delete / Read / Workflow |
| API Endpoint | `/api/v1/products` |
| Application Service | `ProductService` |
| Required Permission | `catalog.products.create`, `catalog.products.view`, `catalog.products.update`, `catalog.products.delete` |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | High |

## Purpose

Defines validation, access, and database tests for the Product CRUD functionality in TM-EPOS MVP.

## Preconditions

- Tenant exists and is active.
- User is authenticated.
- User has required permissions.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| PROD-CRUD-001 | Valid request to create product succeeds | API / Integration | High | Product created with default variant and default price mapping |
| PROD-CRUD-002 | Required name or SKU is missing | API / Unit | High | 400 validation response |
| PROD-CRUD-003 | User does not have create permission | API / Unit | High | 403 forbidden |
| PROD-CRUD-004 | Cross-tenant access attempted | API / Integration | High | Data isolation prevents access to other tenant's products |
| PROD-CRUD-005 | Duplicate SKU or barcode | Unit / Integration | Medium | 409 conflict |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| PROD-CRUD-SUCCESS-001 | Create simple product with price | Default price list exists | Product name, SKU, price | Call CreateAsync | Product created and price item added to default price list | Passed |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| PROD-CRUD-VALIDATION-001 | Missing product code | Empty product code | 400 validation response | Passed |
| PROD-CRUD-VALIDATION-002 | Duplicate product code | Existing product code | 409 duplicate code | Passed |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| PROD-CRUD-PERMISSION-001 | User has required create permission | catalog.products.create | Product created successfully | Passed |
| PROD-CRUD-PERMISSION-002 | User missing create permission | None | 403 forbidden | Passed |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| PROD-CRUD-TENANT-001 | Access other tenant product | Tenant B product exists | 404 not found or empty response | Passed |

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| PROD-CRUD-DB-001 | Product details persisted correctly | products table has name, slug, code, and auditing fields | Passed |
| PROD-CRUD-DB-002 | Default variant is persisted | product_variants has default variant linked to product | Passed |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | ProductServiceTests.cs | CreateAsync_WithoutCreatePermission_ReturnsPermissionDenied | Passed |
| E_POS.UnitTests | ProductServiceTests.cs | CreateAsync_WithCreatePermission_NormalizesCodeAndPersists | Passed |
| E_POS.IntegrationTests | ProductRepositoryTests.cs | ProductCodeExistsAsync_ReturnsTrue_WhenCodeExistsForTenant | Passed |
| E_POS.IntegrationTests | ProductRepositoryTests.cs | SkuExistsAsync_ReturnsTrue_WhenSkuExistsForTenant | Passed |
| E_POS.IntegrationTests | ProductRepositoryTests.cs | ListAsync_ReturnsPaginatedProductsWithDetails | Passed |

## Test Commands

```powershell
dotnet test --filter "FullyQualifiedName~ProductServiceTests"
dotnet test --filter "FullyQualifiedName~ProductRepositoryTests"
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed |
| Integration Tests | Passed |
| API Tests | Passed |
| Manual Verification | Done |
| Known Gaps | None |
