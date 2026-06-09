<!-- title: Tenant Feature Access -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Tenant Feature Access

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| tenant_feature_entitlements | Platform enables features for a tenant. | 7 |
| feature_flags | Runtime feature enablement at tenant, outlet or user scope. | 10 |
| role_feature_assignments | Assigns tenant-enabled features to roles. | 7 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `tenant_feature_entitlements`

**Purpose:** Platform enables features for a tenant.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.11`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| feature_id | uuid | NOT NULL FK | References platform_features(id). |
| enabled | boolean | NOT NULL | Entitlement state. |
| enabled_by_platform_user_id | uuid | NULL FK | References platform_users(id). |
| enabled_at | timestamptz | NOT NULL | Entitlement time. |
| config | jsonb | NULL | Non-secret entitlement config. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, feature_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `feature_flags`

**Purpose:** Runtime feature enablement at tenant, outlet or user scope.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.12`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| feature_id | uuid | NOT NULL FK | References platform_features(id). |
| enabled | boolean | NOT NULL | Runtime state. |
| scope | varchar(20) | NOT NULL CHECK | tenant, outlet, user. |
| outlet_id | uuid | NULL FK | Required when scope=outlet. |
| user_id | uuid | NULL FK | Required when scope=user. |
| config | jsonb | NULL | Runtime configuration. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, feature_id, scope, outlet_id, user_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `role_feature_assignments`

**Purpose:** Assigns tenant-enabled features to roles.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.19`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| role_id | uuid | NOT NULL FK | References roles(id). |
| feature_id | uuid | NOT NULL FK | References platform_features(id). |
| allowed | boolean | NOT NULL | Allowed flag. |
| assigned_by | uuid | NULL FK | References users(id). |
| assigned_at | timestamptz | NOT NULL | Assignment time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, role_id, feature_id) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
