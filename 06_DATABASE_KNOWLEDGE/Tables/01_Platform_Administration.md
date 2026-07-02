<!-- title: Platform Administration -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 01. Platform Administration

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `platform_users` | Stores platform users records for this module. |
| `platform_roles` | Stores platform roles records for this module. |
| `platform_permissions` | Stores platform permissions records for this module. |
| `platform_user_roles` | Stores platform user roles records for this module. |
| `platform_role_permissions` | Stores platform role permissions records for this module. |
| `platform_user_permissions` | Stores platform user permissions records for this module. |
| `platform_auth_sessions` | Stores platform auth sessions records for this module. |
| `platform_refresh_tokens` | Stores platform refresh tokens records for this module. |
| `platform_password_reset_tokens` | Stores platform password reset tokens records for this module. |
| `platform_login_audits` | Stores platform login audits records for this module. |

## platform_users

Module: Platform Administration

Purpose: Stores platform users records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| email | citext | UNIQUE | Unique business key. |
| normalized_email | citext | UNIQUE | Unique business key. |
| password_hash | varchar(255) | NOT | Stores the platform user's password hash only. Raw passwords are never stored. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(email)
UNIQUE(normalized_email)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED'))
NOT NULL(password_hash)
```

## platform_roles

Module: Platform Administration

Purpose: Stores platform roles records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| role_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(role_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## platform_permissions

Module: Platform Administration

Purpose: Stores platform permissions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| permission_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(permission_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## platform_user_roles

Module: Platform Administration

Purpose: Stores platform user roles records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| platform_user_id | uuid | FK NULL UNIQUE | References `platform_users(id)`. Unique business key. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| platform_role_id | uuid | FK NOT UNIQUE | References `platform_roles(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_user_id) REFERENCES platform_users(id)
FK(platform_role_id) REFERENCES platform_roles(id)
UNIQUE(platform_user_id, platform_role_id)
```

## platform_role_permissions

Module: Platform Administration

Purpose: Stores platform role permissions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| platform_permission_id | uuid | FK NOT UNIQUE | References `platform_permissions(id)`. Unique business key. |
| platform_role_id | uuid | FK NOT UNIQUE | References `platform_roles(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_role_id) REFERENCES platform_roles(id)
FK(platform_permission_id) REFERENCES platform_permissions(id)
UNIQUE(platform_role_id, platform_permission_id)
```

## platform_user_permissions

Module: Platform Administration

Purpose: Stores platform user permissions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| platform_user_id | uuid | FK NULL UNIQUE | References `platform_users(id)`. Unique business key. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| platform_permission_id | uuid | FK NOT UNIQUE | References `platform_permissions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_user_id) REFERENCES platform_users(id)
FK(platform_permission_id) REFERENCES platform_permissions(id)
UNIQUE(platform_user_id, platform_permission_id)
```

## platform_auth_sessions

Module: Platform Administration

Purpose: Stores platform auth sessions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| platform_user_id | uuid | FK NULL | References `platform_users(id)`. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'EXPIRED', 'REVOKED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| session_token_hash | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_user_id) REFERENCES platform_users(id)
UNIQUE(session_token_hash)
CHECK(status IN ('ACTIVE', 'EXPIRED', 'REVOKED'))
```

## platform_refresh_tokens

Module: Platform Administration

Purpose: Stores platform refresh tokens records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| platform_auth_session_id | uuid | FK NOT | References `platform_auth_sessions(id)`. |
| token_hash | varchar(255) | UNIQUE | Unique business key. |
| expires_at | timestamptz | NOT CHECK | Refresh token expiry timestamp. CHECK(expires_at > created_at). |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_auth_session_id) REFERENCES platform_auth_sessions(id)
UNIQUE(token_hash)
CHECK(status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED'))
CHECK(expires_at > created_at)
```

## platform_password_reset_tokens

Module: Platform Administration

Purpose: Stores platform password reset tokens records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| platform_user_id | uuid | FK NULL | References `platform_users(id)`. |
| status | varchar(30) | CHECK | CHECK(status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| token_hash | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_user_id) REFERENCES platform_users(id)
UNIQUE(token_hash)
CHECK(status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED'))
```

## platform_login_audits

Module: Platform Administration

Purpose: Stores platform login audits records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| platform_user_id | uuid | FK NULL | References `platform_users(id)`. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| login_result | varchar(255) | CHECK | CHECK(login_result IN ('SUCCESS', 'FAILED', 'LOCKED')) |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_user_id) REFERENCES platform_users(id)
CHECK(login_result IN ('SUCCESS', 'FAILED', 'LOCKED'))
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
