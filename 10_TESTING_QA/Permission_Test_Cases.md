<!-- title: Permission Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Permission Test Cases

## Purpose

This file defines standard permission test cases for backend features.

## Permission Test Rule

Every protected feature must test both allowed and denied access. Do not test only successful requests.

## Standard Cases

| Case | Expected Result |
|---|---|
| User has required permission | feature is allowed |
| User lacks required permission | 403 forbidden |
| User has related but not exact permission | 403 forbidden |
| User role is inactive/deleted | access denied |
| Permission is inactive/deleted | access denied |
| Outlet-scoped permission missing for outlet feature | access denied |
| Platform user tries tenant-only endpoint incorrectly | access denied |
| Tenant user tries platform-only endpoint | access denied |

## Feature Permission Checklist

For each feature document:

- Record required permission code.
- Record whether it is platform, tenant, outlet, or customer scoped.
- Test exact permission match.
- Test missing permission.
- Test wrong tenant or outlet scope.
- Test permission denied error response.

## Backend Enforcement Rule

Permissions must be enforced in backend code. Frontend hiding buttons is not security.

## Regression Cases

Run permission regression tests after changes to:

- Auth pipeline.
- Current user context.
- Tenant context.
- Role assignment logic.
- Permission seed data.
- Feature entitlement checks.

## Related Files

- [[../02_ACCESS_CONTROL/Permission_Code_List]]
- [[../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[Testing_Strategy]]