<!-- title: UOM Seed List Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: UOM Seed/List -->
<!-- last_updated: 2026-07-03 -->

# UOM Seed/List Test Cases

## Feature Scope

Tenant-authenticated clients can list unit-of-measure reference data for product setup.

The first version supports global/system UOM rows where `tenant_id IS NULL`, plus tenant-specific UOM rows if custom UOM support is added later. This feature does not include UOM create/update/delete APIs.

## Planned Functional Test Cases

| Case | Expected Result |
|---|---|
| List UOM with valid tenant context and `catalog.products.view` permission | API returns global UOM rows and tenant-specific rows for the current tenant. |
| List UOM without tenant context | API returns unauthorized. |
| List UOM without catalog permission | API returns forbidden. |
| Global seeded UOM rows exist | `PCS`, `KG`, `G`, `L`, `ML`, `BOX`, and `PACK` exist with `tenant_id NULL`. |
| Tenant A lists UOM when Tenant B has custom UOM | Tenant B custom UOM is not returned. |

## Permission Cases

| Endpoint | Permission |
|---|---|
| `GET /api/v1/unit-of-measures` | `catalog.products.view` |

## Tenant Isolation Cases

| Case | Expected Result |
|---|---|
| Global UOM row has `tenant_id NULL` | Visible to every tenant. |
| Tenant-owned UOM row has current tenant id | Visible only to that tenant. |
| Tenant-owned UOM row belongs to another tenant | Not returned. |

## Database / Integration Cases

| Case | Expected Result |
|---|---|
| Migration makes `unit_of_measures.tenant_id` nullable | Global seed rows can be inserted. |
| Global UOM unique index exists | Duplicate global `uom_code` is prevented. |
| Tenant UOM unique index exists | Duplicate tenant `uom_code` is prevented per tenant. |
| Repository list query filters by `tenant_id IS NULL OR tenant_id = current tenant` | Only global/current tenant rows are returned. |

## Idempotency Cases

No idempotency key is required because this is a read-only list API. Seed migration uses conflict-safe insert behavior.

## Current Automated Test Coverage

| Test Suite | Coverage |
|---|---|
| Unit tests | Permission denial and successful list result from service. |
| API tests | Tenant context extraction, unauthorized request, forbidden mapping, TenantOnly policy. |
| Integration tests | Repository returns global/current tenant UOM and excludes another tenant UOM. |

## Test Commands

```powershell
dotnet build E_POS.sln -m:1 --no-restore
dotnet ef database update --project src\E_POS.Infrastructure --startup-project src\E_POS.Api
dotnet test E_POS.sln -m:1 --no-restore
```

## Result Summary

| Command | Result |
|---|---|
| `dotnet build E_POS.sln -m:1 --no-restore` | Passed, 0 warnings, 0 errors on 2026-07-03. |
| `dotnet ef database update --project src\E_POS.Infrastructure --startup-project src\E_POS.Api` | Passed; UOM nullable tenant/index/seed migration applied. |
| `dotnet test E_POS.sln -m:1 --no-restore` | Passed on 2026-07-03: Unit 129, Integration 51, API 92. |