<!-- title: Brand Collection CRUD Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: Brand CRUD / Collection CRUD -->
<!-- last_updated: 2026-07-03 -->

# Brand CRUD / Collection CRUD Test Cases

## Feature Scope

Tenant-authenticated users can create, list, view, update, and soft-delete catalog brands and collections.

The first version supports tenant-owned brand and collection master data. Delete is soft delete by setting status to `DELETED`. Collection delete is blocked while active products are linked through `product_collections`.

## Planned Functional Test Cases

| Case | Expected Result |
|---|---|
| Create brand with valid tenant context and create permission | Brand is created with normalized uppercase code. |
| Create brand with duplicate code in same tenant | API returns conflict. |
| List brands | API returns non-deleted brands for current tenant only. |
| Get brand by id from another tenant | API returns not found. |
| Update brand | Brand name/code/status are updated. |
| Delete brand | Brand status becomes `DELETED`. |
| Create collection with valid tenant context and create permission | Collection is created with normalized uppercase code. |
| Create collection with duplicate code in same tenant | API returns conflict. |
| List collections | API returns non-deleted collections for current tenant only. |
| Get collection by id from another tenant | API returns not found. |
| Update collection | Collection name/code/status are updated. |
| Delete collection without product links | Collection status becomes `DELETED`. |
| Delete collection with active product links | API returns conflict. |

## Permission Cases

| Endpoint | Permission |
|---|---|
| `GET /api/v1/brands` | `catalog.brands.view` or `catalog.brands.manage` |
| `GET /api/v1/brands/{id}` | `catalog.brands.view` or `catalog.brands.manage` |
| `POST /api/v1/brands` | `catalog.brands.create` or `catalog.brands.manage` |
| `PUT /api/v1/brands/{id}` | `catalog.brands.update` or `catalog.brands.manage` |
| `DELETE /api/v1/brands/{id}` | `catalog.brands.delete` or `catalog.brands.manage` |
| `GET /api/v1/collections` | `catalog.collections.view` or `catalog.collections.manage` |
| `GET /api/v1/collections/{id}` | `catalog.collections.view` or `catalog.collections.manage` |
| `POST /api/v1/collections` | `catalog.collections.create` or `catalog.collections.manage` |
| `PUT /api/v1/collections/{id}` | `catalog.collections.update` or `catalog.collections.manage` |
| `DELETE /api/v1/collections/{id}` | `catalog.collections.delete` or `catalog.collections.manage` |

## Tenant Isolation Cases

| Case | Expected Result |
|---|---|
| Request body includes no `tenant_id` | Tenant is resolved from JWT/server context only. |
| Tenant A lists brands/collections | Tenant B records are not returned. |
| Tenant A gets/updates/deletes Tenant B brand/collection id | API returns not found. |
| Duplicate brand/collection code exists in another tenant | Current tenant can use the same code. |

## Database / Integration Cases

| Case | Expected Result |
|---|---|
| Brand/collection status excludes `DELETED` in list/detail | Soft-deleted rows are hidden. |
| Brand/collection code is unique per tenant | Duplicate current-tenant codes are rejected. |
| Collection delete checks `product_collections` through current-tenant active products | Linked active products block delete. |
| Permission seed migration inserts brand/collection permissions | Tenant roles receive expected development permissions. |

## Idempotency Cases

No idempotency key is required for Brand/Collection CRUD. Duplicate brand/collection code is handled with `409 Conflict`.

## Current Automated Test Coverage

| Test Suite | Coverage |
|---|---|
| Unit tests | Brand permission denial, brand create normalization, collection create normalization, collection delete conflict. |
| API tests | Tenant context extraction, unauthorized request, duplicate conflict mapping, collection delete conflict mapping, TenantOnly policy. |
| Integration tests | Brand tenant/deleted filtering, collection tenant/deleted filtering, collection active product-link detection. |

## Test Commands

```powershell
dotnet build E_POS.sln -m:1 --no-restore
dotnet ef migrations has-pending-model-changes --project src\E_POS.Infrastructure --startup-project src\E_POS.Api
dotnet ef database update --project src\E_POS.Infrastructure --startup-project src\E_POS.Api
dotnet test E_POS.sln -m:1 --no-restore
```

## Result Summary

| Command | Result |
|---|---|
| `dotnet build E_POS.sln -m:1 --no-restore` | Passed, 0 warnings, 0 errors on 2026-07-03. |
| `dotnet ef migrations has-pending-model-changes --project src\E_POS.Infrastructure --startup-project src\E_POS.Api` | Passed; no pending model changes. |
| `dotnet ef database update --project src\E_POS.Infrastructure --startup-project src\E_POS.Api` | Passed; Brand/Collection permission seed migration applied. |
| `dotnet test E_POS.sln -m:1 --no-restore` | Passed on 2026-07-03: Unit 139, Integration 57, API 106. |