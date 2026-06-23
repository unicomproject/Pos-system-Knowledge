<!-- title: Platform Admin Roles Permissions UI -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-23 -->

# Platform Admin Roles Permissions UI

## Purpose

Documents the Angular Platform Admin Roles & Permissions screen implemented for `/admin/roles-permissions`.

## Source Files

- `src/app/features/admin/pages/platform-permission-catalog-page/platform-permission-catalog-page.ts`
- `src/app/features/admin/pages/platform-permission-catalog-page/platform-permission-catalog-page.spec.ts`
- `src/app/features/admin/models/platform-role-management.model.ts`
- `src/app/features/admin/services/platform-role-management-api.service.ts`
- `src/app/features/admin/services/platform-role-management-api.service.spec.ts`
- `src/app/core/config/api-endpoints.ts`
- `src/app/core/config/permission-keys.ts`

## Backend APIs Used

All role, catalog, count, assigned permission, and save data comes from real backend APIs:

- `GET /api/v1/platform-admin/permission-catalog`
- `GET /api/v1/platform-admin/permission-catalog/flat`
- `GET /api/v1/platform-admin/roles`
- `POST /api/v1/platform-admin/roles`
- `GET /api/v1/platform-admin/roles/{roleId}`
- `PUT /api/v1/platform-admin/roles/{roleId}`
- `GET /api/v1/platform-admin/roles/{roleId}/permissions`
- `PUT /api/v1/platform-admin/roles/{roleId}/permissions`

## UI Rules

- Do not use mock roles, fake assigned permissions, hardcoded module rows, hardcoded permission trees, or copied sample counts.
- Use a two-panel desktop layout only: left role list and center role editor with permission tree.
- Do not keep a permanent right-side role summary panel.
- Render the left role list from `GET /roles`.
- Render the center permission tree from `GET /permission-catalog`.
- Render checked permissions from `GET /roles/{roleId}/permissions`.
- Put compact summary counts inside the center editor: available permissions, granted, not granted, sensitive, assigned users, and unsaved changes.
- Open Preview Impact from the bottom action bar or dirty-change banner.
- Preview Impact modal owns the role summary, added/removed permission impact, sensitive permission list, and can/cannot access preview.
- Apply Changes in the modal closes the modal only; backend save still happens through Save Changes.
- Create sends role metadata first, then saves selected permission codes if any are selected.
- Edit saves metadata and then replaces the full permission code set.
- System roles remain readable but are not editable in the UI because backend protects them.
- The route stays `/admin/roles-permissions` and uses the existing route guard convention.

## Permission Modes

- Custom Access: manual checkbox selection.
- Read Only: selects permissions where the code ends with `.view` or action is `view`.
- Full Access: selects all permissions returned by the backend catalog.
- Mode changes are local until Save Changes is clicked.

## Verification

Verified on 2026-06-23:

- `npm run build` passed.
- `npx.cmd ng test --watch=false` passed: 19 files / 106 tests.
- Real backend smoke passed using a Platform Admin JWT from `POST /api/v1/auth/platform-login`.
- Smoke covered permission catalog tree, flat catalog (`data.items`), platform role list, role detail, and role permissions.

Known warning: Angular build reports style budget warnings for multiple component files, including the role page. The build still completed successfully.

## Related Files

- [[../02_ACCESS_CONTROL/Platform_Admin_Role_Management]]
- [[../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]]
- [[Routing_And_Guards]]
- [[Angular_API_Integration_Guide]]
