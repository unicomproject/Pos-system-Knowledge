<!-- title: Tenant Users, Roles, Permissions & Outlet Access Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-25 -->

# Tenant Users, Roles, Permissions & Outlet Access Technical Contract

## Source-Verified Status

This contract supersedes the pre-2026-08-25 statements that Tenant Admin role and permission-catalog APIs were missing. Current source contains user CRUD/invitation APIs, role lifecycle APIs, permission catalog, role permission replacement, role assignment replacement, role setup options, and atomic role setup. Runtime deployment evidence is tracked separately and must not be inferred from source presence.

## User Creation API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v1/tenant-admin/users/create-options` | Assignable roles, active outlets, permission groups, statuses |
| POST | `/api/v1/tenant-admin/users` | Atomic user creation and access assignment |
| GET | `/api/v1/tenant-admin/users/{userId}` | Authoritative user detail |
| PUT | `/api/v1/tenant-admin/users/{userId}` | Update user and assignment state |
| POST | `/api/v1/tenant-admin/users/{userId}/resend-invite` | Rotate/resend active invitation |
| POST | `/api/v1/tenant-admin/users/{userId}/revoke-invite` | Revoke invitation |

Create supports `fullName`, `email`, optional `phoneNumber`, `roleId`, `outletIds`, additive direct permission override IDs, `sendInviteEmail`, `employeeId`, `createStatus`, `profileMediaAssetId`, and account status. Tenant and actor identifiers come only from authenticated server context. `Idempotency-Key` is required.

## Five-Step Mapping

| Wizard step | Current contract mapping | Status |
|---|---|---|
| Basic Information | User create DTO; staff code generated server-side | Supported |
| Assign Role | `create-options.roles` plus role detail/catalog preview | Supported |
| Configure Permissions | Additive `overriddenPermissionIds`; actor ceiling enforced | Supported |
| Outlet Scope | Empty IDs = tenant-wide; non-empty IDs = selected outlets | Supported |
| Till Scope / Default Till | No user-create DTO or canonical assignment relation | Implementation gap |
| Security & Review | Invite/inactive status, idempotent atomic create | Supported |

## Persistence Mapping

| Intent | Canonical persistence |
|---|---|
| Tenant-wide role | Active `tenant_user_roles` row |
| Selected-outlet role | Active `outlet_user_roles` rows |
| Direct additive permission | Active `tenant_user_permissions` row |
| Profile image reference | `tenant_users.profile_image_url` stores media asset identifier in current model |
| Invitation | `user_invites`, protected token material, delivery secret/outbox, audit |

Soft-revoked assignment rows are reactivated instead of duplicated. Role, user, outlet, permission, and media ownership are tenant-validated before mutation.

## Role and Catalog APIs

Current source implements `/api/v1/tenant-admin/roles`, `/roles/setup-options`, `/permission-catalog`, `/roles/{roleId}/permissions`, `/roles/{roleId}/assignments`, compatible `/roles/{roleId}/users`, and atomic `/roles/{roleId}/setup`. Role Setup Options exposes only `TENANT_ADMIN` and `CASHIER`; user create options may expose other active delegable tenant roles.

## Permission Semantics

Authorization is permission-based, not role-name-based. Direct user overrides are additive. The effective resolver unions active tenant role grants, active direct tenant grants, and outlet-context role/direct grants, then applies tenant, user, role, definition, entitlement, and context filters. Frontend visibility is not authorization.

## Unsupported or Different Contracts

| Reference UI concept | Classification |
|---|---|
| Store Supervisor hardcoded choice | Not current scope; display only if returned as an active delegable role |
| Save Draft | Implementation gap |
| Outlet-specific different role per outlet in create | Storage-capable, but user-create contract gap |
| Access Start Date | Implementation gap |
| Notes during create | Entity capability exists; create API gap |
| Access Level Low/Medium/High | Not current scope; no authoritative formula |
| Temporary Password | Prohibited by invite-token onboarding contract |
| Force Password Change toggle | Model capability differs; not exposed by create contract |
| Two-Factor Authentication toggle | Implementation gap |
| Dedicated user photo upload | Implementation gap; attachment ID is supported |

## Security Requirements

Delegation ceiling, tenant isolation, entitlement filtering, last-admin protection where applicable, idempotency, audit, and backend revalidation are mandatory. Cross-tenant IDs must fail without existence leakage. No plaintext setup token or password may be persisted or logged.
