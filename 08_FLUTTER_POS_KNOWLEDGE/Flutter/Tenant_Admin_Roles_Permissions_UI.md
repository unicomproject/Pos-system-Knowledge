<!-- title: Tenant Admin Roles Permissions UI -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-24 -->

# Tenant Admin Roles Permissions UI

## Purpose

Documents the Flutter Tenant Admin Roles & Access implementation contract for the backend-driven role-permission flow.

## Routes

| Route | Purpose |
|---|---|
| `/tenant-admin/roles-permissions` | Roles & Access entry screen and role picker |
| `/tenant-admin/roles-permissions/:roleId` | Role permission editor for a selected role |
| `/tenant-admin/roles` | Redirects to `/tenant-admin/roles-permissions` |
| `/tenant-admin/roles-access` | Redirects to `/tenant-admin/roles-permissions` |

## Backend APIs

All role, catalog, assignment, count, and save behavior must come from real backend APIs:

- `GET /api/v1/tenant-admin/context`
- `GET /api/v1/tenant-admin/permission-catalog`
- `GET /api/v1/tenant-admin/roles/{roleId}/permissions`
- `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`

The role dropdown uses `roles[]` from tenant-admin context until a dedicated tenant role list API exists.

## Context And Access Rules

- Parse `effectivePermissions` first; fall back to legacy `permissions` only for compatibility.
- Parse `enabledFeatures` first; fall back to legacy `features` only for compatibility.
- `tenant_admin_access_codes.dart` contains typed constants only. It is not the permission catalog source.
- Access checks must use permission codes and feature keys, not role names.
- Frontend hiding is UX only; backend authorization remains authoritative.

## Catalog Rules

- The permission catalog is backend-driven and entitlement-filtered.
- Flutter must not hardcode module rows, feature rows, permission trees, role list data, assigned permission counts, or fake save results.
- `PUT /api/v1/tenant-admin/roles/{roleId}/permissions` replaces the intended role permission set and validates submitted codes against tenant entitlements.
- Permission aliases may be normalized for compatibility, but canonical backend codes remain authoritative.

## Verification

Final verification on 2026-06-23 used real backend APIs with `USE_DEV_API_FALLBACK` disabled:

- `/tenant-admin/roles-permissions` was the active route.
- Role picker used `roles[]` from tenant-admin context.
- Backend catalog returned 5 modules and 99 permissions.
- `tenant_admin_dev` returned 84 assigned permissions.
- `activity.view` toggled off successfully through the real PUT endpoint.
- `activity.view` toggled back on successfully through the real PUT endpoint.
- `.\flutter\bin\flutter.bat test --no-pub` passed 90/90.
- `.\flutter\bin\flutter.bat analyze` passed after commit `ebb0903dcd99fc46221b38c1ed05b7d5a111876a` fixed test const lint issues.

Visual browser/remote-debug click-through was not completed; backend-driven UI flow was verified through real API calls and Flutter tests.

## Related Files

- [[../../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]]
- [[../../03_USER_JOURNEYS/Tenant_Admin/06_Role_Permission_Flow]]
- [[Flutter_Routing_Guards]]
- [[Flutter_API_Network]]
