<!-- title: Platform User Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-03 -->

# Platform User Management Flow

## Purpose

Defines how Platform Admin lists, creates, updates, and assigns roles to internal platform-side users through `PlatformAdminUsersController`.

## Actor

Platform Admin

## Source

Derived from `Slide 8 - Platform User Management Flow` in `SYSTEM_USER_JOURNEY.pptx`, aligned to TM-EPOS MVP scope and the implemented Unified Commerce backend + Angular Platform Admin UI.

## Trigger

Platform Admin opens **Platform Users** (`/admin/platform-users`).

## Preconditions

- Platform Admin is authenticated with a platform JWT.
- Route guard requires `platform.users.view`.
- Create, status update, and role assignment actions require their respective granular permissions (see below).

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open platform users | Angular loads `GET /api/v1/platform-admin/users` and `GET /api/v1/platform-admin/roles` in parallel. |
| 2 | View existing users | Table shows email, display name, status, role names, permission count, last login, updated date. Client-side search filters by email, role, or status. |
| 3 | Click add platform user | Slide-over editor opens when caller has `platform.users.create`. |
| 4 | Enter email and status | Platform Admin enters email and selects status (`ACTIVE`, `INACTIVE`, or `LOCKED`). |
| 5 | Assign platform roles | Platform Admin selects one or more roles from the roles API response. **Do not hardcode role names in UI.** Only active roles (`status` not `Inactive`) are offered. |
| 6 | Create user | Angular posts `POST /api/v1/platform-admin/users` with `{ email, status, roleIds }`. Backend creates the user and invite record; response includes `invitePending`. |
| 7 | Edit user | Row click loads `GET /api/v1/platform-admin/users/{userId}` into the slide-over editor. |
| 8 | Update status | When caller has `platform.users.update`, status is saved via `PUT /api/v1/platform-admin/users/{userId}` with `{ status }`. |
| 9 | Assign roles | When caller has `platform.users.roles.assign`, selected role IDs are saved via `PUT /api/v1/platform-admin/users/{userId}/roles` with `{ roleIds }`. Permissions are inherited from assigned roles; there is no per-user permission picker on this screen. |

## Permissions

| Action | Permission code |
|---|---|
| View list / open editor | `platform.users.view` |
| Create user | `platform.users.create` |
| Update status | `platform.users.update` |
| Replace assigned roles | `platform.users.roles.assign` |

Role options for create/edit come from `GET /api/v1/platform-admin/roles` (`platform.roles.view`). The users screen does not maintain a static role list.

## Data Used Or Captured

| Field | Create | Edit status | Edit roles | Notes |
|---|---|---|---|---|
| Email | Required | Read-only | — | Normalized server-side |
| Status | Optional (defaults server-side) | Required | — | `ACTIVE`, `INACTIVE`, `LOCKED`, `DELETED` (UI exposes first three) |
| Role IDs | Required (at least one) | — | Required (at least one) | Resolved from roles API; backend also accepts `roleCodes` |
| Display name | — | Read-only in list/detail | — | Set after invite acceptance / profile update |
| Invite pending | Response only | Shown in detail | — | `invitePending` on detail DTO |

Not in current API contract: phone, job title, manual per-user permission selection on this screen.

## Access And Security Rules

- Platform Admin must be authenticated (`PlatformOnly` policy).
- Backend enforces permission codes in `PlatformUserService`; frontend guards are UX only.
- Protected super-administrator role assignment requires an active super administrator caller.
- Backend blocks super-administrator lockout (last active super admin cannot be deactivated or stripped of role).
- Platform users are internal staff and distinct from tenant users.
- Platform-level actions must not use frontend-provided `tenant_id` as trusted authority.

## Validation And Error Cases

- Duplicate platform user email → HTTP 409 `platform_users.conflict`
- Missing email or roles on create → HTTP 400 `platform_users.validation_failed`
- Invalid status → HTTP 400 `platform_users.validation_failed`
- Permission denied → HTTP 403 `platform_users.access_denied`
- User not found → HTTP 404 `platform_users.not_found`
- Protected role / super-admin lockout → HTTP 403/409 with documented error codes

## Angular Implementation

| Artifact | Path |
|---|---|
| Route | `/admin/platform-users` — `admin.routes.ts`, `requiredPermission: platform.users.view` |
| Page | `platform-users-page.ts` — list, search, loading/empty/error states, slide-over create/edit |
| API service | `platform-user-api.service.ts` — list, detail, create, update, assign roles |
| Role source | `platform-role-management-api.service.ts` — `getRoles()` for checkbox options |
| Models / mappers | `platform-user.model.ts`, `platform-user.mapper.ts` |

UI states: loading banner, empty state with create CTA, error state with retry, editor validation (email + at least one role), success toasts after create/update.

## Outcome

Internal platform users are provisioned with role-based access. Permissions flow from assigned platform roles, not from ad-hoc UI selection on the users screen.

## Related Modules

- 01_Platform_Administration
- 06_Auth_Tokens_Security_Audit

## Related Files

- [[02_ACCESS_CONTROL/Platform_Admin_Role_Management]]
- [[02_ACCESS_CONTROL/Permission_Code_List]]
- [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract]]
