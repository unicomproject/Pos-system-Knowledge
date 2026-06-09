<!-- title: Platform Settings Audit -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Platform Settings Audit

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| platform_settings | Platform-wide configurable settings such as billing gateway, default currency, notification sender and security limits. | 8 |
| document_sequences | Tenant/outlet-aware business document number generator. | 10 |
| audit_logs | Immutable audit trail for platform and tenant business actions. | 14 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `platform_settings`

**Purpose:** Platform-wide configurable settings such as billing gateway, default currency, notification sender and security limits.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.6`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| setting_key | varchar(120) | NOT NULL UNIQUE | Setting key. |
| setting_value | jsonb | NOT NULL | Validated setting payload. |
| is_secret | boolean | NOT NULL DEFAULT false | True if value is a secret reference only. |
| description | text | NULL | Setting explanation. |
| updated_by_platform_user_id | uuid | NULL FK | References platform_users(id). |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(setting_key) |

### Design Notes

- No explicit design note was provided.


## Entity: `document_sequences`

**Purpose:** Tenant/outlet-aware business document number generator.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.10`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | References outlets(id); null for tenant-level sequence. |
| document_type | varchar(40) | NOT NULL CHECK | sale, return, exchange, receipt, invoice, stock_adjustment, stocktake. |
| prefix | varchar(40) | NOT NULL | Document prefix. |
| current_value | bigint | NOT NULL DEFAULT 0 | Last allocated number. |
| reset_policy | varchar(20) | NOT NULL CHECK | none, daily, monthly, yearly. |
| last_reset_at | timestamptz | NULL | Last reset time. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, outlet_id, document_type) |

### Design Notes

- No explicit design note was provided.


## Entity: `audit_logs`

**Purpose:** Immutable audit trail for platform and tenant business actions.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.12`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | bigserial | PK | Primary key. |
| tenant_id | uuid | NULL FK | Null for platform-level action. |
| actor_platform_user_id | uuid | NULL FK | References platform_users(id). |
| actor_user_id | uuid | NULL FK | References users(id). |
| actor_device_id | uuid | NULL FK | References pos_devices(id). |
| actor_type | varchar(30) | NOT NULL CHECK | platform_user, tenant_user, system, device, api. |
| entity_type | varchar(100) | NOT NULL | Entity/table name. |
| entity_id | uuid | NULL | Affected entity id. |
| action | varchar(100) | NOT NULL | Action name. |
| old_values | jsonb | NULL | Before snapshot. |
| new_values | jsonb | NULL | After snapshot. |
| ip | inet | NULL | Source IP. |
| user_agent | text | NULL | User agent. |
| created_at | timestamptz | NOT NULL | Audit time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- Append-only. Application users must not update/delete audit rows.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
