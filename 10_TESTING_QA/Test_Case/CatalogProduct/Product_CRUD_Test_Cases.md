<!-- title: Product CRUD Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->

# Product CRUD Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | CatalogProduct |
| Feature | Product CRUD |
| Feature Type | Create / Update / Delete / Read |
| API Endpoint | `/api/v1/products` |
| Application Service | `ProductService` |
| Required Permission | `catalog.products.view`, `catalog.products.create`, `catalog.products.update` |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | High |

## Purpose

Defines validation and behavior tests for the backend Product CRUD operations and its default variant provision, mapping tables, and pricing lists.

## Preconditions

- Tenant exists and is active.
- User is authenticated.
- User has required permission.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| PROD-CRUD-001 | Valid create request succeeds | API / Integration | High | Product response is returned with default variant, pricing, and sales channel visibilities mapped |
| PROD-CRUD-002 | Missing required name field | API / Unit | High | 400 validation response |
| PROD-CRUD-003 | User does not have permission | API | High | 403 forbidden |
| PROD-CRUD-004 | Cross-tenant access attempted | API / Integration | High | 404/403 or filtered out from list |
| PROD-CRUD-005 | Duplicate product code or SKU | Unit / Integration | Medium | 409 conflict |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| PROD-CRUD-SUCCESS-001 | Create Product with SKU and Price | User has catalog.products.create | Product details with price | Invoke CreateAsync | Product returned with price and variant details | Passed |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| PROD-CRUD-VALIDATION-001 | Missing required name | Name = "" | 400 validation response | Passed |
| PROD-CRUD-VALIDATION-002 | Negative Price | Price = -10.00 | 400 validation response | Passed |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| PROD-CRUD-PERMISSION-001 | User has required permission | Allowed | Feature succeeds | Passed |
| PROD-CRUD-PERMISSION-002 | User does not have required permission | Missing permission | 403 forbidden | Passed |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| PROD-CRUD-TENANT-001 | Tenant A accesses Tenant A data | Tenant A data exists | Allowed | Passed |
| PROD-CRUD-TENANT-002 | Tenant A accesses Tenant B data | Tenant B data exists | Filtered out | Passed |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| PROD-CRUD-RULE-001 | Unique SKU check | SKU exists | 409 conflict | Passed |

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
dotnet test --filter "FullyQualifiedName~Product"
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed |
| Integration Tests | Passed |
| API Tests | Not Run |
| Manual Verification | Not Done |
| Known Gaps | None |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added where database behavior matters.
- [x] Permission denied case tested.
- [x] Tenant isolation case tested.
- [x] Test commands and results recorded.
