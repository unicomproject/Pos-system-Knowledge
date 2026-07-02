<!-- title: Tenant Identity Roles -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Tenant Identity Roles

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| users | Tenant-bound staff and tenant administrators. | 17 |
| roles | Tenant-owned role definitions. | 9 |
| permissions | Platform-owned permission catalog assigned to tenant roles. | 9 |
| role_permissions | Maps tenant roles to platform permissions. | 5 |
| tenant_user_roles | Tenant-scope role assignments. | 7 |
| outlet_user_roles | Outlet-scope role assignments and cashier outlet access. | 9 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `users`

**Purpose:** Tenant-bound staff and tenant administrators.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.13`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| email | citext | NULL | Original email. |
| normalized_email | citext | NULL | Lowercase normalized email. |
| phone | varchar(40) | NULL | Original phone. |
| normalized_phone | varchar(40) | NULL | Normalized phone. |
| password_hash | varchar(255) | NULL | Required after setup. |
| full_name | varchar(200) | NOT NULL | Display name. |
| status | varchar(30) | NOT NULL CHECK | invited, active, inactive, suspended. |
| last_login_at | timestamptz | NULL | Last successful login. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| username | varchar(120) | NULL | Optional username/login alias. |
| pos_pin_hash | varchar(255) | NULL | Hashed manager/cashier PIN for POS approvals; never store raw PIN. |
| is_tenant_admin | boolean | NOT NULL DEFAULT false | Marks invited primary tenant admin. |
| failed_login_count | int | NOT NULL DEFAULT 0 | Security counter. |
| locked_until | timestamptz | NULL | Temporary lock timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, normalized_email) WHERE normalized_email IS NOT NULL |
| Unique / Index | UNIQUE(tenant_id, normalized_phone) WHERE normalized_phone IS NOT NULL |
| Unique / Index | UNIQUE(tenant_id, username) WHERE username IS NOT NULL |

### Design Notes

- No explicit design note was provided.


## Entity: `roles`

**Purpose:** Tenant-owned role definitions.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.14`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| code | varchar(80) | NOT NULL | Role code. |
| name | varchar(150) | NOT NULL | Role label. |
| scope | varchar(20) | NOT NULL CHECK | tenant, outlet. |
| is_system | boolean | NOT NULL DEFAULT false | Seeded/protected role. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, code) |

### Design Notes

- No explicit design note was provided.


## Entity: `permissions`

**Purpose:** Platform-owned permission catalog assigned to tenant roles.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.15`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| module_id | uuid | NOT NULL FK | References platform_modules(id). |
| code | varchar(120) | NOT NULL UNIQUE | Permission code such as pos.sale.create. |
| name | varchar(150) | NOT NULL | Permission label. |
| description | text | NULL | Explanation. |
| is_system | boolean | NOT NULL DEFAULT true | Seeded flag. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(code) |

### Design Notes

- No explicit design note was provided.


## Entity: `role_permissions`

**Purpose:** Maps tenant roles to platform permissions.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.16`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| role_id | uuid | NOT NULL FK | References roles(id). |
| permission_id | uuid | NOT NULL FK | References permissions(id). |
| created_at | timestamptz | NOT NULL | Creation timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, role_id, permission_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `tenant_user_roles`

**Purpose:** Tenant-scope role assignments.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.17`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| user_id | uuid | NOT NULL FK | References users(id). |
| role_id | uuid | NOT NULL FK | References roles(id). |
| assigned_by | uuid | NULL FK | References users(id). |
| assigned_at | timestamptz | NOT NULL | Assignment timestamp. |
| revoked_at | timestamptz | NULL | Revocation timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, user_id, role_id) WHERE revoked_at IS NULL |

### Design Notes

- No explicit design note was provided.


## Entity: `outlet_user_roles`

**Purpose:** Outlet-scope role assignments and cashier outlet access.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.18`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| user_id | uuid | NOT NULL FK | References users(id). |
| role_id | uuid | NOT NULL FK | References roles(id). |
| employee_code | varchar(80) | NULL | Optional employee code. |
| is_primary_outlet | boolean | NOT NULL DEFAULT false | Primary outlet flag. |
| assigned_at | timestamptz | NOT NULL | Assignment timestamp. |
| relieved_at | timestamptz | NULL | End timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, outlet_id, user_id, role_id) WHERE relieved_at IS NULL |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
