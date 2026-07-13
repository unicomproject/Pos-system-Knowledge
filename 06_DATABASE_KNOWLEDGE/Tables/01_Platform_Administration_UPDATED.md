<!-- title: 01. Platform Administration -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- source: Updated from uploaded ERD image: 01_Platform Adminstration.png -->

# 01. Platform Administration

## Purpose

This file documents the entity tables, attributes, keys, nullability, constraints, and external references for this ERD module. Enum/domain data types from the image are represented as `varchar(...)` plus CHECK/notes, not database enum types.

## Entity Tables

| Table | Purpose |
|---|---|
| `platform_users` | Stores platform administrator users. |
| `platform_roles` | Stores platform-level roles. |
| `platform_permissions` | Stores platform permission catalog. |
| `platform_user_roles` | Assigns platform roles to platform users. |
| `platform_role_permissions` | Grants platform permissions to platform roles. |
| `platform_user_permissions` | Direct allow/deny platform permission overrides for a user. |
| `platform_auth_sessions` | Stores platform authentication sessions. |
| `platform_refresh_tokens` | Stores platform refresh tokens and token replacement chain. |
| `platform_password_reset_tokens` | Stores platform user password reset tokens. |
| `platform_login_audits` | Append-only platform login audit log. |
| `platform_sales_channels` | Global master data for types of sales channels. |

## `platform_users`

Purpose: Stores platform administrator users.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `email` | varchar(255) |  | NOT NULL | Login email |
| `normalized_email` | varchar(255) |  | NOT NULL | Normalized login email |
| `password_hash` | varchar(255) |  | NOT NULL | Password hash only; raw password is never stored |
| `first_name` | varchar(100) |  | NULL |  |
| `last_name` | varchar(100) |  | NULL |  |
| `display_name` | varchar(150) |  | NULL |  |
| `phone` | varchar(40) |  | NULL |  |
| `job_title` | varchar(120) |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: platform_user_status |
| `email_verified_at` | timestamptz |  | NULL |  |
| `failed_login_count` | int |  | NOT NULL |  |
| `locked_until` | timestamptz |  | NULL |  |
| `last_login_at` | timestamptz |  | NULL |  |
| `password_changed_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | Self reference to platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | Self reference to platform_users(id) |

Constraints / Notes:

```text
UNIQUE(normalized_email)
```

Relationships:

- platform_users.created_by_platform_user_id -> platform_users.id
- platform_users.updated_by_platform_user_id -> platform_users.id

## `platform_roles`

Purpose: Stores platform-level roles.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `role_code` | varchar(100) |  | NOT NULL |  |
| `role_name` | varchar(150) |  | NOT NULL |  |
| `description` | text |  | NULL |  |
| `is_system_role` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(role_code)
```

Relationships:

- platform_roles.created_by_platform_user_id -> platform_users.id
- platform_roles.updated_by_platform_user_id -> platform_users.id

## `platform_permissions`

Purpose: Stores platform permission catalog.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `permission_code` | varchar(120) |  | NOT NULL |  |
| `permission_name` | varchar(150) |  | NOT NULL |  |
| `module_key` | varchar(100) |  | NOT NULL |  |
| `description` | text |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(permission_code)
```

Relationships:

- platform_permissions.created_by_platform_user_id -> platform_users.id
- platform_permissions.updated_by_platform_user_id -> platform_users.id

## `platform_user_roles`

Purpose: Assigns platform roles to platform users.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `platform_user_id` | uuid | FK | NOT NULL | References platform_users(id) |
| `platform_role_id` | uuid | FK | NOT NULL | References platform_roles(id) |
| `assigned_at` | timestamptz |  | NOT NULL |  |
| `assigned_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `revoked_at` | timestamptz |  | NULL |  |
| `revoked_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `revoked_reason` | varchar(250) |  | NULL |  |

Constraints / Notes:

```text
UNIQUE(platform_user_id, platform_role_id) WHERE revoked_at IS NULL
```

Relationships:

- platform_user_roles.platform_user_id -> platform_users.id
- platform_user_roles.platform_role_id -> platform_roles.id
- platform_user_roles.assigned_by_platform_user_id -> platform_users.id
- platform_user_roles.revoked_by_platform_user_id -> platform_users.id

## `platform_role_permissions`

Purpose: Grants platform permissions to platform roles.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `platform_role_id` | uuid | FK | NOT NULL | References platform_roles(id) |
| `platform_permission_id` | uuid | FK | NOT NULL | References platform_permissions(id) |
| `granted_at` | timestamptz |  | NOT NULL |  |
| `granted_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `revoked_at` | timestamptz |  | NULL |  |
| `revoked_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `revoked_reason` | varchar(250) |  | NULL |  |

Constraints / Notes:

```text
UNIQUE(platform_role_id, platform_permission_id) WHERE revoked_at IS NULL
```

Relationships:

- platform_role_permissions.platform_role_id -> platform_roles.id
- platform_role_permissions.platform_permission_id -> platform_permissions.id
- platform_role_permissions.granted_by_platform_user_id -> platform_users.id
- platform_role_permissions.revoked_by_platform_user_id -> platform_users.id

## `platform_user_permissions`

Purpose: Direct allow/deny platform permission overrides for a user.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `platform_user_id` | uuid | FK | NOT NULL | References platform_users(id) |
| `platform_permission_id` | uuid | FK | NOT NULL | References platform_permissions(id) |
| `assigned_at` | timestamptz |  | NOT NULL |  |
| `reason` | varchar(250) |  | NULL |  |
| `assigned_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `revoked_at` | timestamptz |  | NULL |  |
| `revoked_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `revoked_reason` | varchar(250) |  | NULL |  |

Constraints / Notes:

```text
UNIQUE(platform_user_id, platform_permission_id) WHERE revoked_at IS NULL
CHECK(permission_effect IN ('ALLOW', 'DENY'))
```

Relationships:

- platform_user_permissions.platform_user_id -> platform_users.id
- platform_user_permissions.platform_permission_id -> platform_permissions.id
- platform_user_permissions.assigned_by_platform_user_id -> platform_users.id
- platform_user_permissions.revoked_by_platform_user_id -> platform_users.id

## `platform_auth_sessions`

Purpose: Stores platform authentication sessions.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `platform_user_id` | uuid | FK | NOT NULL | References platform_users(id) |
| `ip_address` | inet |  | NULL |  |
| `user_agent` | text |  | NULL |  |
| `device_name` | varchar(150) |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `last_seen_at` | timestamptz |  | NULL |  |
| `revoked_at` | timestamptz |  | NULL |  |
| `revoked_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `revoke_reason` | varchar(250) |  | NULL |  |

Relationships:

- platform_auth_sessions.platform_user_id -> platform_users.id
- platform_auth_sessions.revoked_by_platform_user_id -> platform_users.id

## `platform_refresh_tokens`

Purpose: Stores platform refresh tokens and token replacement chain.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `platform_user_id` | uuid | FK | NOT NULL | References platform_users(id) |
| `platform_auth_session_id` | uuid | FK | NOT NULL | References platform_auth_sessions(id) |
| `token_hash` | varchar(255) |  | NOT NULL |  |
| `token_family_id` | uuid |  | NOT NULL |  |
| `replaced_by_token_id` | uuid | FK | NULL | Self reference to platform_refresh_tokens(id) |
| `created_at` | timestamptz |  | NOT NULL |  |
| `expires_at` | timestamptz |  | NOT NULL |  |
| `used_at` | timestamptz |  | NULL |  |
| `revoked_at` | timestamptz |  | NULL |  |
| `revoked_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `revoke_reason` | varchar(250) |  | NULL |  |

Constraints / Notes:

```text
UNIQUE(token_hash)
UNIQUE(replaced_by_token_id)
```

Relationships:

- platform_refresh_tokens.platform_user_id -> platform_users.id
- platform_refresh_tokens.platform_auth_session_id -> platform_auth_sessions.id
- platform_refresh_tokens.replaced_by_token_id -> platform_refresh_tokens.id
- platform_refresh_tokens.revoked_by_platform_user_id -> platform_users.id

## `platform_password_reset_tokens`

Purpose: Stores platform user password reset tokens.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `platform_user_id` | uuid | FK | NOT NULL | References platform_users(id) |
| `token_hash` | varchar(255) |  | NOT NULL |  |
| `requested_at` | timestamptz |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `expires_at` | timestamptz |  | NOT NULL |  |
| `used_at` | timestamptz |  | NULL |  |
| `revoked_at` | timestamptz |  | NULL |  |

Constraints / Notes:

```text
UNIQUE(token_hash)
```

Relationships:

- platform_password_reset_tokens.platform_user_id -> platform_users.id

## `platform_login_audits`

Purpose: Append-only platform login audit log.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `platform_auth_session_id` | uuid | FK | NULL | References platform_auth_sessions(id) |
| `authentication_method` | varchar(255) |  | NOT NULL |  |
| `attempted_at` | timestamptz |  | NOT NULL |  |
| `ip_address` | inet |  | NULL |  |
| `user_agent` | text |  | NULL |  |
| `login_status` | varchar(40) |  | NOT NULL | Original ERD domain: login_audit_status |
| `failure_reason` | varchar(250) |  | NULL |  |
| `risk_score` | int |  | NULL |  |

Constraints / Notes:

```text
Append-only audit log
```

Relationships:

- platform_login_audits.platform_user_id -> platform_users.id
- platform_login_audits.platform_auth_session_id -> platform_auth_sessions.id

## `platform_sales_channels`

Purpose: Global master data for types of sales channels available across the platform (e.g. PHYSICAL, ONLINE).

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `channel_code` | varchar(50) | | NOT NULL | Developer code (e.g. PHYSICAL) |
| `default_name` | varchar(100) | | NOT NULL | Default display name |
| `channel_type` | varchar(40) | | NOT NULL | Type (PHYSICAL, ONLINE, AGGREGATOR, B2B, OTHER) |
| `created_at` | timestamptz | | NOT NULL | |
| `updated_at` | timestamptz | | NOT NULL | |

Constraints / Notes:

```text
UNIQUE(channel_code)
CHECK(channel_type IN ('PHYSICAL', 'ONLINE', 'AGGREGATOR', 'B2B', 'OTHER'))
```

Relationships:

- (None)

## Reference Entities (External)

| Table | Key Fields | Note |
|---|---|---|
| `platform_users` | id uuid PK | Self/audit references inside the same module |

## Module Notes

- No database enum types are used in this markdown; ERD domain/status fields are represented as varchar plus CHECK/notes.

