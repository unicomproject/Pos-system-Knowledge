<!-- title: Platform Admin Role Management -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-23 -->

# Platform Admin Role Management

## Purpose

This file documents the backend Platform Admin role-management contract.

The feature reuses existing platform identity/access tables. It does not add a parallel role or permission architecture.

## APIs Added

Base route: `/api/v1/platform-admin/roles`

All endpoints require platform JWT authentication.

| Method | Route | Permission |
|---|---|---|
| GET | `/api/v1/platform-admin/roles` | `platform.roles.view` |
| POST | `/api/v1/platform-admin/roles` | `platform.roles.create` |
| PUT | `/api/v1/platform-admin/roles/{roleId}` | `platform.roles.update` |
| GET | `/api/v1/platform-admin/roles/{roleId}/permissions` | `platform.roles.permissions.view` |
| PUT | `/api/v1/platform-admin/roles/{roleId}/permissions` | `platform.roles.permissions.update` |

## DTO Contracts

Role list response includes `roles[]` with `id`, `code`, `name`, `description`, `isSystem`, `status`, `assignedUserCount`, `permissionCount`, `createdAt`, and `updatedAt`.

Create role request: `code`, `name`, `description`, `status`.

Update role request: `name`, `description`, `status`.

Role permissions response: `roleId`, `roleCode`, `roleName`, `isSystem`, `status`, `assignedUserCount`, `assignedPermissionCodes`, and `assignedPermissionIds`.

Permission update request accepts `permissionCodes[]` and/or `permissionIds[]`.

## Reused Tables

| Table | Purpose |
|---|---|
| `platform_roles` | Platform role metadata |
| `platform_permissions` | Platform permission catalog source |
| `platform_role_permissions` | Role-to-permission assignment |
| `platform_user_roles` | Platform user-to-role assignment |
| `audit_logs` | Platform role create/update and permission replacement audit |

## Permissions Seeded

Migration `20260623120000_SeedPlatformRoleManagementPermissions` adds:

| Code | Purpose |
|---|---|
| `platform.roles.view` | List platform roles |
| `platform.roles.create` | Create non-system platform roles |
| `platform.roles.update` | Update non-system platform roles |
| `platform.roles.permissions.view` | Read platform role permission assignments |
| `platform.roles.permissions.update` | Replace platform role permission assignments |

The permissions are seeded under module `platform_users` and feature `platform_role_management`, then granted to `super_administrator`.

## Validation Rules

- Role `code` is required on create, trimmed, and normalized to lowercase.
- Role `code` must be unique.
- Role `name` is required for create/update.
- Role `status` is limited to `active` or `inactive`.
- Permission update validates all submitted permission codes against active `platform_permissions`.
- Empty permission updates are allowed and replace the role assignment with no permissions.

## System Role Protection

System roles (`platform_roles.is_system = true`) are protected:

- Metadata update returns conflict.
- Permission replacement returns conflict.
- System roles remain readable.

This protects `super_administrator` from accidental lockout through the role-management UI.

## Role Permission Update Rule

`PUT /api/v1/platform-admin/roles/{roleId}/permissions` replaces the complete permission set for the target role. The frontend must send the intended final set, not a patch.

## Audit Behavior

Implemented audit actions:

| Action | Entity Type |
|---|---|
| `PLATFORM_ROLE_CREATED` | `platform_role` |
| `PLATFORM_ROLE_UPDATED` | `platform_role` |
| `PLATFORM_ROLE_PERMISSIONS_UPDATED` | `platform_role_permissions` |

Audit rows use `ActorType = platform_user` and `ActorPlatformUserId`.

## Verification

Verified on 2026-06-23 through real backend APIs, not mock data:

- Backend build passed.
- Backend tests passed: 119 unit, 49 API, 22 integration.
- Migration `20260623120000_SeedPlatformRoleManagementPermissions` applied.
- Login used `posunique001@gmail.com` / `123456`.
- `GET /api/v1/platform-admin/permission-catalog` returned 15 modules.
- `GET /api/v1/platform-admin/roles` returned the existing platform role list.
- `GET /api/v1/platform-admin/roles/{superAdminId}/permissions` returned 14 assigned permissions, including `platform.roles.view` and `platform.roles.permissions.update`.
- `POST /api/v1/platform-admin/roles` created smoke role `qa_platform_role_145431`.
- `PUT /api/v1/platform-admin/roles/{roleId}/permissions` assigned `platform.roles.view` and `platform.roles.permissions.view` successfully.

## Angular UI Requirements And Gaps

Angular Platform Admin UI is not yet implemented for this backend feature.

When implemented:

- Load roles from `GET /api/v1/platform-admin/roles`.
- Load permission catalog from `GET /api/v1/platform-admin/permission-catalog`.
- Load assignments from `GET /api/v1/platform-admin/roles/{roleId}/permissions`.
- Save assignments through the matching PUT endpoint.
- Do not hardcode roles, permission counts, assignment counts, or catalog rows.
- Respect system role read-only protection in the UI.

## Related Files

- [[Backend_Driven_Permission_Catalog]]
- [[Permission_Code_List]]
- [[API_Authorization_Rules]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../05_BACKEND_ARCHITECTURE/Authorization_And_Permissions]]
- [[../05_BACKEND_ARCHITECTURE/Seed_Data_Standards]]
- [[../06_DATABASE_KNOWLEDGE/Migration_Rules]]
- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Angular_API_Integration_Guide]]

## Role Detail Endpoint Update 2026-06-23

`GET /api/v1/platform-admin/roles/{roleId}` was added for Angular Platform Admin role editor screens.

Authorization permission: `platform.roles.view`.

Response DTO uses the same role detail shape as create/update responses: `id`, `code`, `name`, `description`, `isSystem`, `status`, `assignedUserCount`, `permissionCount`, `createdAt`, and `updatedAt`.

If `roleId` does not exist, the endpoint returns the standard API error response with HTTP 404 and error code `NOT_FOUND`. It never returns a successful null role.

Smoke verification used a real Platform Admin JWT from `POST /api/v1/auth/platform-login`, then called `GET /api/v1/platform-admin/roles`, `GET /api/v1/platform-admin/roles/{roleId}`, and `GET /api/v1/platform-admin/roles/{roleId}/permissions`. The selected `super_administrator` detail returned successfully with `permissionCount = 14`.
