<!-- title: Till CRUD Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->

# Till CRUD Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 07_Outlet_Till_POS_Device_Foundation |
| Feature | Till CRUD |
| Feature Type | Create / Update / Delete / Read |
| API Endpoint | `/api/v1/tills` |
| Application Service | `ITillService` / `TillService` |
| Required Permission | `tenant.tills.view`, `tenant.tills.create`, `tenant.tills.update`, `tenant.tills.delete`; `tenant.tills.manage` grants all till actions |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | High |

## Purpose

Tenant Admin can create, list, view, update, and soft-delete tills under tenant-owned active outlets. Till setup prepares the outlet for later POS device binding and POS session workflows.

## Preconditions

- Tenant exists and is active.
- User is authenticated as tenant user.
- User has the action permission required by the endpoint, or `tenant.tills.manage`.
- Active outlet exists for the same tenant.
- Till code is not accepted in create/update request bodies; backend auto-generates next outlet-scoped `TILL###` code. Till code remains unique within `(tenant_id, outlet_id)`.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| TILL-CRUD-001 | Valid till create succeeds | Unit / Integration / API | High | Till row created and response DTO returned |
| TILL-CRUD-002 | Required or invalid field fails | Unit / API | High | `till.validation_failed` |
| TILL-CRUD-003 | User lacks permission | Unit / API | High | 403 / `till.permission_denied` |
| TILL-CRUD-004 | Cross-tenant till access | Integration | High | `till.not_found` without data leak |
| TILL-CRUD-005 | Generated till code sequence | Unit / Integration / API | High | Backend generates outlet-scoped TILL### codes without frontend tillCode |
| TILL-CRUD-006 | Delete assigned till | Unit | Medium | 409 / `till.delete_conflict` |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| TILL-CRUD-SUCCESS-001 | Create till under active outlet | Active outlet exists | outletId, name, ACTIVE | Call create | Till persisted with generated code | Passed |
| TILL-CRUD-SUCCESS-002 | List tills for tenant | Tenant has tills | optional outletId/search/page | Call list | Only tenant-scoped tills returned | Passed |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| TILL-CRUD-VALIDATION-001 | Invalid status | `DELETED` on create/update | `till.validation_failed` | Passed |
| TILL-CRUD-VALIDATION-002 | Missing/invalid outlet | empty or inactive/cross-tenant outlet | `till.validation_failed` or `till.outlet_not_found` | Passed |
| TILL-CRUD-VALIDATION-003 | Duplicate generated till code race | same tenant/outlet/code produced concurrently | `till.duplicate_code` or retry succeeds with next code | Passed |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| TILL-CRUD-PERMISSION-001 | User has exact action permission | `tenant.tills.view/create/update/delete` as required | Feature succeeds | Passed |
| TILL-CRUD-PERMISSION-002 | User has no till permission | missing permission | `till.permission_denied` / 403 | Passed |
| TILL-CRUD-PERMISSION-003 | User has related but wrong permission | e.g. `tenant.tills.view` for create or `tenant.outlets.manage` | 403 | Passed |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| TILL-CRUD-TENANT-001 | Tenant A reads Tenant A till | Tenant A till exists | Allowed | Passed |
| TILL-CRUD-TENANT-002 | Tenant A reads Tenant B till | Tenant B till exists | `till.not_found` | Passed |
| TILL-CRUD-TENANT-003 | Tenant list endpoint is filtered | Tenant A and B tills exist | Only Tenant A rows returned | Passed |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| TILL-CRUD-RULE-000 | Auto-generated till code | Request body does not expose tillCode; backend generates next outlet-scoped TILL### code | Generated code is persisted and unique per outlet | Passed |
| TILL-CRUD-RULE-001 | Create till only under active outlet | Outlet must be same tenant and active | `till.outlet_not_found` if invalid | Passed |
| TILL-CRUD-RULE-002 | Delete assigned till | Assigned device blocks deletion | `till.delete_conflict` | Passed |
| TILL-CRUD-RULE-003 | Soft delete till | Delete sets status `DELETED` | Deleted till hidden from normal reads | Planned |

## Idempotency Test Cases

Idempotency is not required for Till CRUD. Duplicate business key is handled by `(tenant_id, outlet_id, till_code)` uniqueness and `till.duplicate_code` conflict handling.

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| TILL-CRUD-DB-001 | Create persists till | `tills` row exists with tenant, outlet, name, code, status | Passed |
| TILL-CRUD-DB-002 | Cross-tenant get blocked | Tenant B row not returned to Tenant A | Passed |
| TILL-CRUD-DB-003 | Duplicate code blocked | Same tenant/outlet/code rejected | Passed |
| TILL-CRUD-DB-004 | Tenant list filtering | Only current tenant rows returned | Passed |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | `OutletTillDevice/TillServiceTests.cs` | `CreateAsync_WithoutTillCreatePermission_ReturnsPermissionDenied` | Passed |
| E_POS.UnitTests | OutletTillDevice/TillServiceTests.cs | CreateAsync_WithCreatePermission_ReturnsSuccess | Passed |
| E_POS.UnitTests | OutletTillDevice/TillServiceTests.cs | CreateAsync_WithViewPermissionOnly_ReturnsPermissionDenied | Passed |
| E_POS.UnitTests | `OutletTillDevice/TillServiceTests.cs` | `CreateAsync_WithInvalidStatus_ReturnsValidationFailure` | Passed |
| E_POS.UnitTests | `OutletTillDevice/TillServiceTests.cs` | `CreateAsync_WhenOutletIsMissing_ReturnsOutletNotFound` | Passed |
| E_POS.UnitTests | `OutletTillDevice/TillServiceTests.cs` | `CreateAsync_WithDuplicateCode_ReturnsDuplicateCode` | Passed |
| E_POS.UnitTests | `OutletTillDevice/TillServiceTests.cs` | `ListAsync_WithViewPermission_ReturnsSuccess` | Passed |`r`n| E_POS.UnitTests | `OutletTillDevice/TillServiceTests.cs` | `UpdateAsync_WithUpdatePermission_ReturnsSuccess` | Passed |
| E_POS.UnitTests | `OutletTillDevice/TillServiceTests.cs` | `DeleteAsync_WithDeviceAssignment_ReturnsDeleteConflict` | Passed |
| E_POS.IntegrationTests | `OutletTillDevice/TillCrudIntegrationTests.cs` | `CreateAsync_PersistsTillUnderActiveOutlet` | Passed |
| E_POS.IntegrationTests | `OutletTillDevice/TillCrudIntegrationTests.cs` | `GetByIdAsync_WithDifferentTenant_ReturnsNotFound` | Passed |
| E_POS.IntegrationTests | `OutletTillDevice/TillCrudIntegrationTests.cs` | `CreateAsync_SecondTillWithoutCode_GeneratesNextTillCode` | Passed |
| E_POS.IntegrationTests | `OutletTillDevice/TillCrudIntegrationTests.cs` | `ListAsync_ReturnsOnlyCurrentTenantTills` | Passed |
| E_POS.ApiTests | `OutletTillDevice/TillsControllerTests.cs` | `Create_WithTenantClaims_ReturnsCreatedAndPassesServerTenantContext` | Passed |
| E_POS.ApiTests | `OutletTillDevice/TillsControllerTests.cs` | `Create_WithoutTenantClaims_ReturnsUnauthorized` | Passed |
| E_POS.ApiTests | `OutletTillDevice/TillsControllerTests.cs` | `Create_WhenServiceReturnsPermissionDenied_ReturnsForbidden` | Passed |
| E_POS.ApiTests | `OutletTillDevice/TillsControllerTests.cs` | `Create_WhenServiceReturnsDuplicateCode_ReturnsConflict` | Passed |
| E_POS.ApiTests | `OutletTillDevice/TillsControllerTests.cs` | `Controller_RequiresTenantOnlyPolicy` | Passed |

## Test Commands

```powershell
dotnet build E_POS.sln -m:1 --no-restore
dotnet test E_POS.sln -m:1 --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed: 28 |
| Integration Tests | Passed: 20 |
| API Tests | Passed: 25 |
| Manual Verification | Not Done |
| Known Gaps | Platform Admin support till setup API and audit table-backed till audit are not implemented in this slice. |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added where database behavior matters.
- [x] API tests added for endpoint behavior.
- [x] Permission denied case tested.
- [x] Tenant isolation case tested.
- [x] Idempotency documented as not required.
- [x] Regression impact checked.
- [x] Test commands and results recorded.

## Related Standards

- [[../Testing_Strategy]]
- [[../API_Testing_Standards]]
- [[../Permission_Test_Cases]]
- [[../Tenant_Isolation_Test_Cases]]
- [[../Idempotency_Test_Cases]]
- [[../Regression_Checklist]]



