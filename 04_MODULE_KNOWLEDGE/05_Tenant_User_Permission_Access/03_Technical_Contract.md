<!-- title: Tenant Users, Roles, Permissions & Outlet Access Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-26 -->

# Tenant Users, Roles, Permissions & Outlet Access Technical Contract

## User Creation Command

`POST /api/v1/tenant-admin/users` is the single atomic create command and requires `Idempotency-Key`. `GET /api/v1/tenant-admin/users/create-options` supplies assignable roles, active outlets, permission groups, and supported statuses.

Current create fields include full name, email, nullable phone, one `roleId`, outlet IDs, permission override flag/IDs, invite choice, employee ID, `INACTIVE`/`INVITED` create status, and optional profile media asset ID. Tenant and actor IDs are server-derived.

## Corrected Step Mapping

| Step | API/persistence mapping | Status |
|---|---|---|
| 1 Basic Information | Identity/profile/account mode; no role selection | Supported; phone-required backend validation gap |
| 2 Assign Base Role | One `roleId` from delegable create options | Supported |
| 3 Configure Permissions | Additive direct `tenant_user_permissions` only | Supported with permission-override authority |
| 4 All Outlets | Empty outlet IDs → `tenant_user_roles` | Supported |
| 4 Selected Outlets | Non-empty IDs → `outlet_user_roles` | Supported |
| 4 No Outlet Access | Empty IDs conflict with tenant-wide meaning | Not supported; omit |
| Default Outlet / Till IDs / Default Till | No current create DTO/service mapping | Implementation gap |
| 5 Security & Review | `INVITED` or `INACTIVE`, atomic final save | Supported |

## Permission Invariant

`BR-UCR-PERM-001`: Add New User must never mutate `tenant_role_permissions`. The selected role remains immutable in this flow. Direct user overrides are additive grants; inherited permissions cannot be denied here. Unknown, inactive, unentitled, platform, or non-delegable grant IDs are rejected server-side.

Conceptually: `Base Role Permissions + Accepted Additive User Grants = User Effective Permissions`, followed by canonical tenant, entitlement, active-definition, revocation, and context filtering.

## Review Derivation

Module and permission counts are distinct counts from final effective permissions. Outlet count derives from final scope. No Till Count or defaults are authoritative until supported. No Low/Medium/High Access Level formula exists, so Access Level is not part of the contract.

## Account and Invitation

Create supports `INVITED` and `INACTIVE`; direct `ACTIVE` create is rejected. Invited users receive a one-time expiring setup flow and set their own password. Inactive users cannot sign in and must not be described as awaiting invitation unless invite state actually exists.

## Security Feature Classification

| Feature | Classification |
|---|---|
| Temporary Password | Out of scope/prohibited by token onboarding |
| Force Password Change | Supported differently in the domain model; not exposed by create contract |
| Two-Factor Authentication | Implementation gap |
| Access Start Date | Implementation gap |
| Save Draft | Implementation gap / out of current scope |
| Dedicated user photo upload | Implementation gap; media attachment ID is supported |
| Notes during create | Implementation gap; entity capability exists |
| Outlet-specific role override | Implementation gap in create DTO/service |

## Atomicity and Security

Final create revalidates role, outlets, media, direct grants, delegation ceiling, entitlements, tenant isolation, and account mode. User, assignments, direct grants, invite/outbox state, and audit are committed as one logical mutation. Soft-revoked assignment rows are reactivated instead of duplicated.
