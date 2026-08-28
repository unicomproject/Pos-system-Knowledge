<!-- title: Tenant Admin Role Permission Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

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
| Flutter datasource | Calls `/api/v1/tenant-admin/roles` and `/api/v1/tenant-admin/permission-catalog`. | Ahead of backend |
| Backend Tenant Admin role APIs | No implemented tenant role/permission-catalog controllers verified. | Missing |
| Effective permission resolver | Current auth/context resolvers are partial and need revoked-row/outlet-source hardening. | Gap |

## Related Files

- `02_ACCESS_CONTROL/Tenant_Effective_Permission_Resolution.md`
- `02_ACCESS_CONTROL/Permission_Code_List.md`
- `02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md`
- `04_MODULE_KNOWLEDGE/05_Tenant_User_Permission_Access/03_Technical_Contract.md`
- `13_DECISIONS_AND_CHANGES/ADR/ADR_009_Tenant_Effective_Permission_Resolution.md`
