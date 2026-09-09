<!-- title: Tenant Admin Role Permission Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-26 -->

# Tenant Admin Role Permission Management Flow

## Purpose

Defines the canonical Tenant Admin flow for creating roles, selecting modules, configuring permissions, assigning users/scope, and reviewing before save.

## Actor

Tenant Admin with role management permissions.

## Important Correction

The canonical Role & Permission setup flow is five steps. Previous Second Brain notes that described a six-step frontend flow are superseded.

Confirmation is a result state after Step 5. It is not Step 6.

## Preconditions

- Tenant Admin is authenticated.
- Tenant context is resolved server-side.
- Tenant feature entitlements are loaded.
- Tenant Admin has the required role/permission management permission.
- Backend permission catalog is available.

## Canonical Five-Step Flow

| Step | Screen | User Intent | System Behaviour |
|---:|---|---|---|
| 1 | Role Details & Template | Define role identity and optional template. | Validates tenant-unique role name/code and captures template source/version when used. |
| 2 | Select Modules | Choose entitled modules available to the role. | Shows modules filtered by tenant subscription/feature entitlement. |
| 3 | Configure Permissions | Select module actions. | Loads permissions from backend catalog and prevents permissions outside entitlement/allowed module scope. |
| 4 | Assign Users & Access Scope | Assign users and tenant/outlet scope. | Applies selected users and scope without leaking unauthorized users/outlets. |
| 5 | Review & Create | Review and save. | Creates or updates role, permissions, assignments, audit logs, and returns success/failure result. |

## Data Captured

- Role name and description
- Role lifecycle intent
- Source role template and template version when used
- Selected modules
- Permission definition IDs/codes
- Assigned tenant users
- Tenant-wide or selected outlet scope

## Security Rules

- Backend is final authority.
- Role cannot grant permissions for modules/features the tenant is not entitled to use.
- Revoked role/user/permission rows must not contribute to effective access.
- Last-admin/super-admin safety must be enforced before disabling/removing critical access.
- Role creation and mutation must persist audit events in `audit_logs`.

## Current Implementation Reality

| Area | Verified State | Status |
|---|---|---|
| Database RBAC tables | Tenant roles, role permissions, tenant user roles/direct permissions, outlet roles/direct permissions, templates, template versions exist. | Implemented |
| Flutter route | `/tenant-admin/roles-permissions` exists as canonical frontend route. | Partial |
| Flutter datasource | Calls `/api/v1/tenant-admin/roles` and `/api/v1/tenant-admin/permission-catalog`. | Source-aligned |
| Backend Tenant Admin role APIs | Lifecycle, catalog, permission, assignment, setup-options, and atomic setup contracts exist. | Implemented in source |
| Effective permission resolver | Canonical resolver exists; runtime environment verification remains separate. | Implemented in source |

## Related Files

- `02_ACCESS_CONTROL/Tenant_Effective_Permission_Resolution.md`
- `02_ACCESS_CONTROL/Permission_Code_List.md`
- `02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md`
- `04_MODULE_KNOWLEDGE/05_Tenant_User_Permission_Access/03_Technical_Contract.md`
- `13_DECISIONS_AND_CHANGES/ADR/ADR_009_Tenant_Effective_Permission_Resolution.md`

## Runtime Reconciliation Addendum - 2026-08-21

This is a five-step tenant-scoped journey. Step 1 offers only the
`TENANT_ADMIN` and `CASHIER` templates. `SUPER_ADMIN` and platform roles must
not appear in Tenant Admin Role Access setup.

Steps 2 and 3 are driven by `GET /api/v1/tenant-admin/permission-catalog`.
During an edit, active role grants must be assignable or explicitly locked and
preserved; they must never be silently omitted and then revoked on save.

Authenticated validation on 2026-08-21 found 44 active Cashier grants with no
matching catalog entries. Current source includes later reconciliation
migrations. Each environment must apply current migrations and rerun catalog,
seed, entitlement, delegation, and role-edit checks before production PASS.

The Add New User journey consumes active delegable roles and this permission
catalog through [[07_User_Management_Add_New_User_Flow]].

Roles & Access is the only journey that changes global role permissions. Add New User Step 3 may create additive user-specific grants but must never mutate the selected Base Role.
