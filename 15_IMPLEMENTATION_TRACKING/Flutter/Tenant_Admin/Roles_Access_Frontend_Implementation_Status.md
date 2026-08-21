<!-- title: Roles & Access Frontend Implementation Status -->
<!-- status: Corrected - frontend partial, backend contract gap -->
<!-- last_updated: 2026-08-15 -->

# Roles & Access Frontend Implementation Status

## Current Verdict

`FRONTEND PARTIAL - BACKEND CONTRACT GAP`

The Flutter Roles & Access feature contains route, UI, datasource, and provider work, but the tenant role management backend endpoints it calls were not verified in the backend source.

Do not treat earlier `Completed` notes as release-ready until the backend role API contract is implemented and runtime verified.

## Verified Frontend State

| Item | Status |
|---|---|
| Canonical frontend route `/tenant-admin/roles-permissions` | Present |
| Compatibility redirects from `/tenant-admin/roles-access` and `/tenant-admin/roles` | Present / expected |
| Role permission datasource | Present |
| Datasource catalog URL | `/api/v1/tenant-admin/permission-catalog` |
| Datasource role URL | `/api/v1/tenant-admin/roles` |
| Permission visibility provider model | Present |

## Backend Contract Gap

The Flutter feature calls these backend endpoints:

- `GET /api/v1/tenant-admin/permission-catalog`
- `GET /api/v1/tenant-admin/roles`
- `GET /api/v1/tenant-admin/roles/{roleId}/permissions`
- `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`

Backend source inspection did not find Tenant Admin controllers for these endpoints. Platform Admin permission catalog/role controllers are not substitutes for Tenant Admin role management.

## Correct Canonical Wizard Flow

The approved Create Role flow is five steps:

1. Role Details & Template
2. Select Modules
3. Configure Permissions
4. Assign Users & Access Scope
5. Review & Create

Confirmation is a post-save result, not a sixth wizard step.

## Required Before Marking Complete

- Implement backend Tenant Admin role and permission catalog endpoints.
- Add backend tests for the role APIs.
- Verify Flutter can load real backend catalog/role data.
- Verify create/edit/save/disable/user assignment flows against backend.
- Verify no revoked permission/role assignment appears effective.
- Verify audit logs persist role mutations.
- Re-run Flutter analyzer/tests and browser runtime verification.

## Related Docs

- `02_ACCESS_CONTROL/Tenant_Effective_Permission_Resolution.md`
- `03_USER_JOURNEYS/Tenant_Admin/06_Role_Permission_Management_Flow.md`
- `04_MODULE_KNOWLEDGE/05_Tenant_User_Permission_Access/03_Technical_Contract.md`
