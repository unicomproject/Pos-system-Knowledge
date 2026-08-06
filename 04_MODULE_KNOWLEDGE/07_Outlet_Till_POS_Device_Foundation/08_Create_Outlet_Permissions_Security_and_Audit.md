# 08 Create Outlet Permissions Security and Audit

> Last Verified Date: 2026-08-06
> Source basis: `TenantAdminOutletsController.cs` and `SeedTenantLoginUsers.cs` migration

## 1. Access Control Matrix

The security boundary for the Create Outlet workflow is governed by tenant staff permissions and feature entitlements:

### 1.1 Entitlements
- **Feature Entitlement**: The tenant must have an active subscription plan containing `outlet_management`.

### 1.2 Current Active Permissions
- `tenant.outlets.view`: Enables viewing the outlets sidebar menu, list, and details.
- `tenant.outlets.manage`: Enables creating, editing, deactivating, and assigning managers.

### 1.3 Target Granular Permission Scheme
To allow for finer-grained user administration, the following granular permissions are proposed:

| Action | Proposed Permission Code | Boundary Level |
|---|---|---|
| View Outlet Directory | `tenant.outlets.view` | Menu / Page |
| Register New Outlet | `tenant.outlets.create` | API / Button |
| Update Outlet Settings | `tenant.outlets.update` | API / Button |
| Designate Central Status | `tenant.outlets.set_central` | API / Toggle |
| Set Till Preselection Default | `tenant.tills.set_default_outlet` | API / Toggle |
| Assign Primary Manager | `tenant.outlets.assign_manager` | API / Field |

---

## 2. Security & Tenant Isolation

- **Database-Level Enforcements**: Every query to `outlets`, `outlet_addresses`, and `outlet_business_hours` must apply a filter condition matching the `TenantId` resolved from the active JWT request context.
- **Cross-Tenant Manager Restriction**: When assigning an Outlet Manager, the backend must validate that the requested user `TenantUserId` belongs to the active tenant ID before completing the assignment.
- **Tenant-Scoped Unique Codes**: The uniqueness check for `outlet_code` is scoped to the tenant (`uq_outlets_tenant_id_outlet_code`). Different tenants can use the same outlet codes without conflict.

---

## 3. Audit Log Events

All mutations related to the create outlet wizard must write structured audit events into the database logs:

### 3.1 Supported Audit Events
- `outlet.create.started`: Triggered when the administrator opens Step 1 of the wizard.
- `outlet.created`: Written atomically when the database transaction commits successfully.
- `outlet.create.failed`: Logged with context-safe error codes on submission failure.
- `outlet.central_changed`: Logged when the central outlet designation is changed from an old outlet to the new one.
- `outlet.default_till_outlet_changed`: Logged when the till-preselection default settings are updated.

### 3.2 Event Data Structure
Each event record must include:
- `tenant_id`
- `outlet_id` (newly created or target)
- `user_id` (initiating administrator)
- `correlation_id` / `idempotency_key`
- `previous_value` / `new_value` (specifically for central/default swaps)
- `timestamp`
- `success` / `failure_code`
- **Important**: Event details must never log user credentials, tokens, or sensitive personal data.
