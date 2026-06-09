<!-- title: Platform Identity -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Platform Identity

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| platform_users | Platform administrator accounts used to create tenants, configure packages, manage billing and access support tools. | 9 |
| platform_roles | Platform-side role definitions for Super Admin, Billing Admin, Support Admin and similar roles. | 8 |
| platform_permissions | Platform permission catalog for platform administration actions. | 9 |
| platform_role_permissions | Mapping between platform roles and platform permissions. | 4 |
| platform_user_roles | Mapping between platform users and platform roles. | 6 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `platform_users`

**Purpose:** Platform administrator accounts used to create tenants, configure packages, manage billing and access support tools.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.1`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| email | citext | NOT NULL UNIQUE | Platform login email. |
| password_hash | varchar(255) | NOT NULL | Password hash only. |
| full_name | varchar(200) | NOT NULL | Display name. |
| phone | varchar(40) | NULL | Optional phone. |
| status | varchar(30) | NOT NULL CHECK | active, inactive, suspended. |
| last_login_at | timestamptz | NULL | Last successful login. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(email) |

### Design Notes

- No explicit design note was provided.


## Entity: `platform_roles`

**Purpose:** Platform-side role definitions for Super Admin, Billing Admin, Support Admin and similar roles.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.2`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| code | varchar(80) | NOT NULL UNIQUE | Role code. |
| name | varchar(150) | NOT NULL | Role label. |
| description | text | NULL | Role description. |
| is_system | boolean | NOT NULL DEFAULT false | System protected role. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(code) |

### Design Notes

- No explicit design note was provided.


## Entity: `platform_permissions`

**Purpose:** Platform permission catalog for platform administration actions.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.3`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| code | varchar(120) | NOT NULL UNIQUE | Permission code, e.g. platform.tenant.create. |
| name | varchar(150) | NOT NULL | Permission label. |
| module_key | varchar(80) | NOT NULL | Logical platform area. |
| description | text | NULL | Explanation. |
| is_system | boolean | NOT NULL DEFAULT true | Seeded permission flag. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(code) |

### Design Notes

- No explicit design note was provided.


## Entity: `platform_role_permissions`

**Purpose:** Mapping between platform roles and platform permissions.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.4`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| platform_role_id | uuid | NOT NULL FK | References platform_roles(id). |
| platform_permission_id | uuid | NOT NULL FK | References platform_permissions(id). |
| created_at | timestamptz | NOT NULL | Assignment timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(platform_role_id, platform_permission_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `platform_user_roles`

**Purpose:** Mapping between platform users and platform roles.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.5`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| platform_user_id | uuid | NOT NULL FK | References platform_users(id). |
| platform_role_id | uuid | NOT NULL FK | References platform_roles(id). |
| assigned_by_platform_user_id | uuid | NULL FK | References platform_users(id). |
| assigned_at | timestamptz | NOT NULL | Assignment timestamp. |
| revoked_at | timestamptz | NULL | Revocation timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(platform_user_id, platform_role_id) WHERE revoked_at IS NULL |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
