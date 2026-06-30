<!-- title: Feature Test Case Template -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Feature Test Case Template

## Feature Summary

| Field | Value |
|---|---|
| Module |  |
| Feature |  |
| Feature Type | Create / Update / Delete / Read / Workflow / Integration |
| API Endpoint |  |
| Application Service |  |
| Required Permission |  |
| Tenant Scoped | Yes / No |
| Idempotency Required | Yes / No |
| Criticality | Low / Medium / High / Critical |

## Purpose

Describe what this feature must do and what business rule or user journey it supports.

## Preconditions

- Tenant exists and is active.
- User is authenticated.
- User has required permission.
- Required reference data exists.
- Any feature-specific setup is available.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| MOD-FEATURE-001 | Valid request succeeds | API / Integration | High | Expected success response and database state |
| MOD-FEATURE-002 | Required field missing | API / Unit | High | 400 validation response |
| MOD-FEATURE-003 | User does not have permission | API | High | 403 forbidden |
| MOD-FEATURE-004 | Cross-tenant access attempted | API / Integration | High | Access denied or not found without data leak |
| MOD-FEATURE-005 | Duplicate or invalid business rule | Unit / Integration | Medium | Conflict or validation error |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| MOD-FEATURE-SUCCESS-001 |  |  |  |  |  | Not Started |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| MOD-FEATURE-VALIDATION-001 | Missing required field |  | 400 validation response | Not Started |
| MOD-FEATURE-VALIDATION-002 | Invalid status/type value |  | 400 validation response | Not Started |
| MOD-FEATURE-VALIDATION-003 | Max length exceeded |  | 400 validation response | Not Started |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| MOD-FEATURE-PERMISSION-001 | User has required permission | Allowed | Feature succeeds | Not Started |
| MOD-FEATURE-PERMISSION-002 | User does not have required permission | Missing permission | 403 forbidden | Not Started |
| MOD-FEATURE-PERMISSION-003 | User has related but wrong permission | Wrong permission | 403 forbidden | Not Started |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| MOD-FEATURE-TENANT-001 | Tenant A accesses Tenant A data | Tenant A data exists | Allowed | Not Started |
| MOD-FEATURE-TENANT-002 | Tenant A accesses Tenant B data | Tenant B data exists | Denied or not found | Not Started |
| MOD-FEATURE-TENANT-003 | Tenant list endpoint is filtered | Tenant A and Tenant B data exists | Only current tenant data returned | Not Started |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| MOD-FEATURE-RULE-001 |  |  |  | Not Started |

## Idempotency Test Cases

Use this section only when `Idempotency Required = Yes`.

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| MOD-FEATURE-IDEMPOTENCY-001 | Same key and same payload repeated | First request already succeeded | Same result or safe no-op | Not Started |
| MOD-FEATURE-IDEMPOTENCY-002 | Same key with different payload | First request already succeeded | Conflict/error response | Not Started |

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| MOD-FEATURE-DB-001 | Data is persisted correctly | Expected row exists with correct tenant_id/audit fields | Not Started |
| MOD-FEATURE-DB-002 | Failed request does not persist data | No unexpected row created | Not Started |
| MOD-FEATURE-DB-003 | Constraint is enforced | Unique/FK/check constraint behaves correctly | Not Started |

## Current Automated Test Coverage

Update this section after automated tests are implemented.

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests |  |  | Not Started |
| E_POS.IntegrationTests |  |  | Not Started |
| E_POS.ApiTests |  |  | Not Started |

## Test Commands

```powershell
dotnet test tests\E_POS.UnitTests\E_POS.UnitTests.csproj --no-restore
dotnet test tests\E_POS.IntegrationTests\E_POS.IntegrationTests.csproj --no-restore
dotnet test tests\E_POS.ApiTests\E_POS.ApiTests.csproj --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Not Run |
| Integration Tests | Not Run |
| API Tests | Not Run |
| Manual Verification | Not Done |
| Known Gaps |  |

## Completion Checklist

- [ ] Planned test cases written.
- [ ] Unit tests added where service/domain logic exists.
- [ ] Integration tests added where database behavior matters.
- [ ] API tests added for endpoint behavior.
- [ ] Permission denied case tested.
- [ ] Tenant isolation case tested.
- [ ] Idempotency tested if required.
- [ ] Regression impact checked.
- [ ] Test commands and results recorded.

## Related Standards

- [[../Testing_Strategy]]
- [[../API_Testing_Standards]]
- [[../Permission_Test_Cases]]
- [[../Tenant_Isolation_Test_Cases]]
- [[../Idempotency_Test_Cases]]
- [[../Regression_Checklist]]