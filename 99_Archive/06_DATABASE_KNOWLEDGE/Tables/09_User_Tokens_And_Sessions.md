<!-- title: User Tokens And Sessions -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# User Tokens And Sessions

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| user_invites | Invite records for tenant user creation and email link delivery. | 11 |
| user_setup_tokens | Set-password/setup token after tenant admin or staff invitation. | 9 |
| password_reset_tokens | Forgot-password and reset-password tokens for tenant users. | 9 |
| auth_sessions | Server-side login session record for app and web access. | 11 |
| refresh_tokens | Refresh token rotation store. | 10 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `user_invites`

**Purpose:** Invite records for tenant user creation and email link delivery.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.20`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| invited_email | citext | NOT NULL | Email recipient. |
| invited_user_id | uuid | NULL FK | References users(id). |
| invited_by_user_id | uuid | NULL FK | References users(id). |
| token_hash | varchar(255) | NOT NULL UNIQUE | Hashed invite token. |
| status | varchar(30) | NOT NULL CHECK | pending, accepted, expired, cancelled. |
| expires_at | timestamptz | NOT NULL | Expiry time. |
| accepted_at | timestamptz | NULL | Acceptance time. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(token_hash) |

### Design Notes

- No explicit design note was provided.


## Entity: `user_setup_tokens`

**Purpose:** Set-password/setup token after tenant admin or staff invitation.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.21`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| user_id | uuid | NOT NULL FK | References users(id). |
| token_hash | varchar(255) | NOT NULL UNIQUE | Hashed setup token. |
| purpose | varchar(30) | NOT NULL CHECK | initial_setup, invite_acceptance. |
| status | varchar(30) | NOT NULL CHECK | active, used, expired, cancelled. |
| expires_at | timestamptz | NOT NULL | Expiry time. |
| used_at | timestamptz | NULL | Used timestamp. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(token_hash) |

### Design Notes

- No explicit design note was provided.


## Entity: `password_reset_tokens`

**Purpose:** Forgot-password and reset-password tokens for tenant users.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.22`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| user_id | uuid | NOT NULL FK | References users(id). |
| token_hash | varchar(255) | NOT NULL UNIQUE | Hashed reset token. |
| status | varchar(30) | NOT NULL CHECK | active, used, expired, cancelled. |
| expires_at | timestamptz | NOT NULL | Expiry time. |
| used_at | timestamptz | NULL | Used timestamp. |
| request_ip | inet | NULL | Request IP. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(token_hash) |

### Design Notes

- No explicit design note was provided.


## Entity: `auth_sessions`

**Purpose:** Server-side login session record for app and web access.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.23`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| user_id | uuid | NOT NULL FK | References users(id). |
| device_id | uuid | NULL FK | References pos_devices(id). |
| session_token_hash | varchar(255) | NOT NULL UNIQUE | Hashed session token or session id. |
| ip | inet | NULL | Login IP. |
| user_agent | text | NULL | User agent. |
| status | varchar(30) | NOT NULL CHECK | active, revoked, expired. |
| created_at | timestamptz | NOT NULL | Login timestamp. |
| expires_at | timestamptz | NOT NULL | Expiry timestamp. |
| revoked_at | timestamptz | NULL | Revocation timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(session_token_hash) |

### Design Notes

- No explicit design note was provided.


## Entity: `refresh_tokens`

**Purpose:** Refresh token rotation store.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.24`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| auth_session_id | uuid | NOT NULL FK | References auth_sessions(id). |
| user_id | uuid | NOT NULL FK | References users(id). |
| token_hash | varchar(255) | NOT NULL UNIQUE | Hashed refresh token. |
| replaced_by_token_id | uuid | NULL FK | References refresh_tokens(id). |
| status | varchar(30) | NOT NULL CHECK | active, used, revoked, expired. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| expires_at | timestamptz | NOT NULL | Expiry timestamp. |
| revoked_at | timestamptz | NULL | Revocation timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(token_hash) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
