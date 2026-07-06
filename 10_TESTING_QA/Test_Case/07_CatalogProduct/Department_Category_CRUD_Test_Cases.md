<!-- title: Department Category CRUD Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: Department CRUD / Category CRUD -->
<!-- last_updated: 2026-07-03 -->

# Department CRUD / Category CRUD Test Cases

## Feature Scope

Tenant-authenticated users can create, list, view, update, and soft-delete catalog departments and categories.

The first version supports tenant-owned department master data and category hierarchy with nullable root `parent_category_id`. Delete is soft delete by setting status to `DELETED`.

## Planned Functional Test Cases

| Case | Expected Result |
|---|---|
| Create department with valid tenant context and create permission | Department is created with normalized uppercase code. |
| Create department with duplicate code in same tenant | API returns conflict. |
| List departments | API returns non-deleted departments for current tenant only. |
| Get department by id from another tenant | API returns not found. |
| Update department | Department name/code/status are updated. |
| Delete department | Department status becomes `DELETED`. |
| Create root category with no parent | Category is created with `parent_category_id NULL`. |
| Create child category with valid parent | Category is created and detail/list response includes parent info. |
| Create/update category with missing parent | API returns not found. |
| Update category with itself as parent | API returns validation error. |
| Update category causing parent cycle | API returns validation error. |
| Delete category with active child categories | API returns conflict. |
| Delete category linked to active products | API returns conflict. |

## Permission Cases

| Endpoint | Permission |
|---|---|
| `GET /api/v1/departments` | `catalog.departments.view` or `catalog.departments.manage` |
| `GET /api/v1/departments/{id}` | `catalog.departments.view` or `catalog.departments.manage` |
| `POST /api/v1/departments` | `catalog.departments.create` or `catalog.departments.manage` |
| `PUT /api/v1/departments/{id}` | `catalog.departments.update` or `catalog.departments.manage` |
| `DELETE /api/v1/departments/{id}` | `catalog.departments.delete` or `catalog.departments.manage` |
| `GET /api/v1/categories` | `catalog.categories.view` or `catalog.categories.manage` |
| `GET /api/v1/categories/{id}` | `catalog.categories.view` or `catalog.categories.manage` |
| `POST /api/v1/categories` | `catalog.categories.create` or `catalog.categories.manage` |
| `PUT /api/v1/categories/{id}` | `catalog.categories.update` or `catalog.categories.manage` |
| `DELETE /api/v1/categories/{id}` | `catalog.categories.delete` or `catalog.categories.manage` |

## Tenant Isolation Cases

| Case | Expected Result |
|---|---|
| Request body includes no `tenant_id` | Tenant is resolved from JWT/server context only. |
| Tenant A lists departments/categories | Tenant B records are not returned. |
| Tenant A gets/updates/deletes Tenant B department/category id | API returns not found. |
| Duplicate department/category code exists in another tenant | Current tenant can use the same code. |

## Database / Integration Cases

| Case | Expected Result |
|---|---|
| `categories.parent_category_id` is nullable | Root categories are supported. |
| Department/category status excludes `DELETED` in list/detail | Soft-deleted rows are hidden. |
| Category list includes parent category code/name | Parent fields are projected without returning EF entities. |
| Category cycle detection query walks parent chain | Descendant cannot become parent. |
| Permission seed migration inserts department/category permissions | Tenant roles receive expected development permissions. |

## Idempotency Cases

No idempotency key is required for Department/Category CRUD. Duplicate department/category code is handled with `409 Conflict`.

## Current Automated Test Coverage

| Test Suite | Coverage |
|---|---|
| Unit tests | Department permission denial, create normalization, root category create, missing parent, self-parent validation, delete child conflict. |
| API tests | Tenant context extraction, unauthorized request, duplicate conflict mapping, missing parent mapping, TenantOnly policy. |
| Integration tests | Department tenant/deleted filtering, category parent projection, tenant filtering, parent cycle detection. |

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
| `dotnet ef database update --project src\E_POS.Infrastructure --startup-project src\E_POS.Api` | Passed; Department/Category CRUD support migration applied. |
| `dotnet test E_POS.sln -m:1 --no-restore` | Passed on 2026-07-03: Unit 135, Integration 54, API 99. |