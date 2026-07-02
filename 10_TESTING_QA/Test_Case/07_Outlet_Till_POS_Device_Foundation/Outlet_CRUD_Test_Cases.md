<!-- title: Outlet CRUD Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->

# Outlet CRUD Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 07_Outlet_Till_POS_Device_Foundation |
| Feature | Outlet CRUD |
| Feature Type | Create / Read / Update / Delete |
| API Endpoint | `/api/v1/outlets` |
| Application Service | `IOutletService` / `OutletService` |
| Required Permission | Reads: `tenant.outlets.view` or `tenant.outlets.manage`; writes: `tenant.outlets.manage` |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | High |

## Purpose

Tenant admins manage full outlet profile data used by POS setup, online visibility, business hours, and click-and-collect collection point assignment.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| OUTLET-CRUD-001 | Valid full profile create succeeds | Unit / Integration / API | High | 201/API success and outlet, address, hours, optional pickup mapping are persisted |
| OUTLET-CRUD-002 | Required profile/address data missing | Unit | High | `outlet.validation_failed` / 400 |
| OUTLET-CRUD-003 | User lacks required outlet permission | Unit / API | High | 403 forbidden |
| OUTLET-CRUD-008 | User has `tenant.outlets.view` only | Unit / API | Medium | Read succeeds; create/update/delete denied |
| OUTLET-CRUD-004 | Cross-tenant detail access | Integration | High | 404 without data leak |
| OUTLET-CRUD-005 | Duplicate outlet code in tenant | Unit / Integration | High | `outlet.duplicate_code` / 409 |
| OUTLET-CRUD-006 | Collection point enabled without active PICKUP method | Unit | Medium | `outlet.pickup_method_missing` / 400 |
| OUTLET-CRUD-007 | Delete outlet with active till/device | Unit | High | `outlet.delete_conflict` / 409 |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | `OutletTillDevice/OutletServiceTests.cs` | Permission split, duplicate code, business hours, pickup method missing, delete conflict | Passed |
| E_POS.IntegrationTests | `OutletTillDevice/OutletCrudIntegrationTests.cs` | Persist full profile, tenant isolation, duplicate code | Passed |
| E_POS.ApiTests | `OutletTillDevice/OutletsControllerTests.cs` | Tenant context extraction, 401, 403, TenantOnly policy | Passed |

## Test Commands

```powershell
dotnet build E_POS.sln -m:1 --no-restore
dotnet test E_POS.sln -m:1 --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed |
| Integration Tests | Passed |
| API Tests | Passed |
| Manual Verification | Not Done |
| Known Gaps | No live Swagger/manual API call recorded in this step. |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added where database behavior matters.
- [x] API tests added for endpoint behavior.
- [x] Permission denied case tested.
- [x] Tenant isolation case tested.
- [x] Idempotency marked not required.
- [x] Test commands and results recorded.