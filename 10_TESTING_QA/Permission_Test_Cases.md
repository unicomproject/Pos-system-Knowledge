<!-- title: Permission Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-25 -->

# Permission Test Cases

## Purpose

This file defines standard permission test cases for backend features.

Tenant Admin five-step user creation has a dedicated matrix at [[Test_Case/05_Tenant_User_Permission_Access/Tenant_Admin_User_Creation_5_Step_Test_Cases]]. It covers delegation ceiling, tenant isolation, role/outlet assignment, direct additive grants, invite security, idempotency, atomicity, and responsive wizard behavior.

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
- [[Test_Case/21_POS_Operations/POS_Popular_Product_Discovery_Test_Cases]]
- [[Test_Case/21_POS_Operations/POS_Frequently_Sold_Product_Discovery_Test_Cases]]
- [[Test_Case/21_POS_Operations/POS_Offers_Product_Discovery_Test_Cases]]

## Tenant Role Catalog Reconciliation Regression - 2026-08-21

| Test | Required assertion |
|---|---|
| Active role grant catalog representation | Every active persisted `tenant_role_permissions` grant for an editable role is assignable or explicitly locked and preserved in the catalog/final-save projection. |
| No silent replacement loss | A catalog omission cannot cause `PUT /roles/{roleId}/permissions` or `PUT /roles/{roleId}/setup` to revoke an unrelated active grant. |
| Cashier seed reconciliation | The default Cashier role's active grants map safely to the authenticated Tenant Admin catalog after entitlement and delegation filtering. |
| Delegation boundary | A grant that the actor cannot delegate is explicitly rejected or preserved; it is never silently removed. |
| Authenticated wizard regression | Editing the seeded Cashier role produces selected modules and selected permissions consistent with its persisted grants before save. |

Current status: `BLOCKED`. Authenticated runtime validation found 44 active
Cashier grants with zero matching catalog entries. These regressions must pass
before role editing is released.
