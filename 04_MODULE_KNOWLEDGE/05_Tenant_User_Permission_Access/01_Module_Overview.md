<!-- title: Tenant Users, Roles, Permissions & Outlet Access Module Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Tenant Users, Roles, Permissions & Outlet Access Module Overview

## Purpose

Manage tenant staff, role templates, tenant roles, role permissions, direct permissions, outlet-scoped roles, and outlet-scoped permissions.

This module is part of the new OneVerz POS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Tenant_User_Permission_Access` |
| Module number | 05 |
| Primary users | Tenant Admin, Store Manager, Platform Admin support |
| Frontend surfaces | Tenant user management, Roles and permissions screen, Outlet access assignment, Permission catalog UI |
| API groups | `/api/v1/tenant-admin/users`, `/api/v1/tenant-admin/roles`, `/api/v1/tenant-admin/permission-catalog`, `/api/v1/tenant-admin/outlet-access` |

## Main Tables

| Table | Role |
|---|---|
| `tenant_users` | Used by this module |
| `role_templates` | Used by this module |
| `role_template_versions` | Used by this module |
| `role_template_version_permissions` | Used by this module |
| `tenant_roles` | Used by this module |
| `tenant_role_permissions` | Used by this module |
| `permission_definitions` | Used by this module |
| `tenant_user_roles` | Used by this module |
| `tenant_user_permissions` | Used by this module |
| `outlet_user_roles` | Used by this module |
| `outlet_user_permissions` | Used by this module |

## Core Business Rules

- No hardcoded cashier, manager, or administrator behavior.
- Permission definitions are database-driven and module-scoped.
- Outlet access can narrow a user role to specific outlets.
- Tenant user email and phone uniqueness are tenant-scoped.
- Backend authorization remains final even when UI hides actions.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | Required for staff/admin protected actions |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../02_Tenant_Foundation/01_Module_Overview]]
- [[../03_Subscription_Catalog_Entitlements/01_Module_Overview]]
- [[../07_Outlet_Till_POS_Device_Foundation/01_Outlet_Management_Overview]]

## Out Of Scope

- Platform role management
- Customer website accounts
- Payment provider credentials
- Offline conflict resolution

## Related Files

- [[04_MODULE_KNOWLEDGE/05_Tenant_User_Permission_Access/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/05_Tenant_User_Permission_Access/03_Technical_Contract]]

<!-- RBAC_HARDENING_2026_08_15_START -->
## RBAC Contract Correction - 2026-08-15

The module supports tenant users, tenant roles, tenant role permissions, direct tenant user permissions, outlet roles, outlet direct permissions, permission definitions, role templates, and role template versions at the data-model level.

Current verified gaps:

- Tenant Admin role management backend APIs are missing.
- Runtime effective permission resolvers need revoked-row hardening.
- Outlet-scoped grants are not fully represented in the session effective permission resolver.
- Explicit deny is not implemented.

Canonical role setup is five steps: Role Details & Template, Select Modules, Configure Permissions, Assign Users & Access Scope, Review & Create.
<!-- RBAC_HARDENING_2026_08_15_END -->

