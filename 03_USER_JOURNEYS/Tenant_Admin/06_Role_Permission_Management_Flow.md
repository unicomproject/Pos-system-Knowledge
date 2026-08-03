<!-- title: Tenant Admin Role Permission Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Role Permission Management Flow

## Purpose

Defines how Tenant Admin creates roles and assigns feature/outlet permissions.

## Actor

Tenant Admin

## Source

Derived from `Slide 6 - Role & Permission Management Flow` in `tenant-full-journey.pptx` and aligned to OneVerz POS MVP Second Brain scope.

## Trigger

Tenant Admin opens role and permissions management.

## Preconditions

- Tenant Admin has role/permission permission.
- Tenant entitlements are loaded.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open roles and permissions | System opens role management. |
| 2 | View role list | System displays roles. |
| 3 | Click add role | Tenant Admin starts role creation. |
| 4 | Enter role name | Tenant Admin names the role. |
| 5 | Select modules | Tenant Admin selects enabled modules for role. |
| 6 | Assign feature permissions | Tenant Admin assigns permitted actions. |
| 7 | Set outlet scope if needed | Tenant Admin restricts access to outlets/locations. |
| 8 | Validate permissions | System checks entitlements and required constraints. |
| 9 | Save role | System saves role. |
| 10 | Role ready for user assignment | Role can be assigned to tenant users. |

## Data Used Or Captured

- Role name
- Modules
- Permission codes
- Outlet scope
- Role status

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Permissions must be feature-based, not hardcoded by role name.
- Role cannot grant features tenant is not entitled to use.

## Validation And Error Cases

- Permission selection invalid
- Entitlement missing
- Duplicate role name
- Cannot remove required admin access

## Outcome

Role is ready for tenant user assignment.

## Related Modules

- 05_Tenant_User_Permission_Access
- 03_Subscription_Catalog_Entitlements

## Related Files

- 02_ACCESS_CONTROL/Permission_Code_List.md
- 02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md

## Flutter Implementation Update — 2026-07-22

- Tenant Admin Roles & Access frontend now uses `/tenant-admin/roles-permissions` as the canonical root route.
- Compatibility redirects remain from `/tenant-admin/roles-access` and `/tenant-admin/roles` to the canonical route.
- Implemented six-step frontend flow: Role Details, Select Modules, Configure Permissions, Assign Users, Review & Save, Confirmation.
- Role list, details, create, edit, status, duplicate, delete, permission catalog, permission replacement and assigned-user APIs are wired through the existing Flutter `role_permissions` feature.
- Role list no longer depends on Tenant Admin context roles as the primary data source.
- Permission matrix rows/actions are derived from backend permission catalog data.
- Assigned user summaries come from the backend role-user API; user selection reuses the existing Tenant Admin users API.
- Validation/result: `flutter analyze` passed and full `flutter test` passed with 554 tests.
- Remaining gap: manual browser/API verification was not performed; Advanced Rules are intentionally not implemented until a backend contract exists.

## Integration Stabilization Update — 2026-07-22

- Added centralized Flutter route constants for Tenant Admin Roles & Access.
- Preserved canonical root `/tenant-admin/roles-permissions` and compatibility redirects from `/tenant-admin/roles-access` and `/tenant-admin/roles`.
- Save Draft behavior now saves through the real backend as `DRAFT`, clears active user assignments for draft saves, and moves newly-created drafts to the returned edit route so later saves use update semantics instead of duplicate create semantics.
- Added role-specific frontend API error mapper for known backend role error codes, avoiding raw Dio/SQL/stack messages in UI.
- Added centralized `RolePageVisibility` provider model for role page/action visibility derived from effective permissions.
- Verification: Flutter analyze passed, focused role tests passed, backend build passed, backend tests passed, and EF pending-model check reported no pending model changes.

## UI Alignment Update — 2026-07-22

| Item | Value |
|---|---|
| Feature | Roles & Access frontend UI alignment |
| Module | Tenant User Permission Access |
| Platform | Flutter |
| Status | Completed |
| Source App | Tenantadmin/Nytroz-POS-App |
| Backend/API Changes | None |
| Folder Structure Changes | None |
| Validation | flutter analyze passed; focused role tests passed |

### Completed Scope
- Updated the active Roles & Access screen to match the approved master-detail Tenant Admin design more closely.
- Kept the implementation backend-driven: role list, permission catalog, assigned users, status, scope, and actions continue to come from the API/provider layer.
- Combined role details and module permissions into the primary right-side card, with assigned users and bottom actions below.
- Added responsive permission rendering: table layout on tablet/desktop and expandable module cards on narrow screens.
- Preserved existing permission gating, unsaved-change protection, provider refresh, auth handling, and route structure.

### Validation
- `flutter analyze` — Passed, no issues found.
- `flutter test test/features/tenant_admin/role_permissions_screen_test.dart test/features/tenant_admin/tenant_admin_navigation_guard_test.dart` — Passed, 6 tests.

## Create Role Details Drawer Update — 2026-07-22

| Item | Value |
|---|---|
| Feature | Create New Role Step 1 frontend |
| Route | `/tenant-admin/roles-permissions/create/details` |
| Status | Verified |
| Backend/API Changes | None |
| Folder Structure Changes | None |
| Validation | `flutter analyze` passed; focused role/navigation tests passed |

### Implemented Behaviour
- Create Role route is guarded by role create visibility derived from the centralized tenant access checker.
- Desktop renders the create flow as a right-side drawer-style panel; tablet/mobile use a constrained/full-width responsive panel.
- Step label is corrected to `Step 1 of 6` for Role Details.
- Role Name maps to `roleName`, trims before request serialization, validates required/length, and does not expose editable `roleCode`.
- Description maps to `description`, remains optional, and uses the current frontend contract length limit.
- Role Type uses backend create-options role templates plus the supported Custom Role/null-template path.
- Status uses the typed `RoleLifecycleStatus` Active/Inactive toggle; Save Draft still submits `DRAFT`.
- Footer actions remain stable: Cancel/Back, Save Draft, Continue.
- No mock role data, backend URL, tenant ID, role ID, or permission data was added.
