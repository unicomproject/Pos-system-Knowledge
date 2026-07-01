<!-- title: Invitations, Authentication, Tokens & Security Audit -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 07. Invitations, Authentication, Tokens & Security Audit

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `user_invites` | Stores user invites records for this module. |
| `user_setup_tokens` | Stores user setup tokens records for this module. |
| `email_verification_tokens` | Stores email verification tokens records for this module. |
| `password_reset_tokens` | Stores password reset tokens records for this module. |
| `tenant_auth_sessions` | Stores tenant auth sessions records for this module. |
| `tenant_refresh_tokens` | Stores tenant refresh tokens records for this module. |
| `tenant_login_audits` | Stores tenant login audits records for this module. |

## user_invites

Module: Invitations, Authentication, Tokens & Security Audit

Purpose: Stores user invites records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| invite_status | varchar(30) | CHECK | CHECK(invite_status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')) |
| invite_token_hash | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, invite_token_hash)
CHECK(invite_status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'))
```

## user_setup_tokens

Module: Invitations, Authentication, Tokens & Security Audit

Purpose: Stores user setup tokens records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| status | varchar(30) | CHECK | CHECK(status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| token_hash | varchar(255) | UNIQUE | Unique business key. |
| user_invite_id | uuid | FK NOT | References `user_invites(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(user_invite_id) REFERENCES user_invites(id)
UNIQUE(token_hash)
CHECK(status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED'))
```

## email_verification_tokens

Module: Invitations, Authentication, Tokens & Security Audit

Purpose: Stores email verification tokens records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| status | varchar(30) | CHECK | CHECK(status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'REVOKED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| token_hash | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(token_hash)
CHECK(status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'REVOKED'))
```

## password_reset_tokens

Module: Invitations, Authentication, Tokens & Security Audit

Purpose: Stores password reset tokens records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| status | varchar(30) | CHECK | CHECK(status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| token_hash | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(token_hash)
CHECK(status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED'))
```

## tenant_auth_sessions

Module: Invitations, Authentication, Tokens & Security Audit

Purpose: Stores tenant auth sessions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'EXPIRED', 'REVOKED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| session_token_hash | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(session_token_hash)
CHECK(status IN ('ACTIVE', 'EXPIRED', 'REVOKED'))
```

## tenant_refresh_tokens

Module: Invitations, Authentication, Tokens & Security Audit

Purpose: Stores tenant refresh tokens records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| tenant_auth_session_id | uuid | FK NOT | References `tenant_auth_sessions(id)`. |
| token_hash | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_auth_session_id) REFERENCES tenant_auth_sessions(id)
UNIQUE(token_hash)
CHECK(status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED'))
```

## tenant_login_audits

Module: Invitations, Authentication, Tokens & Security Audit

Purpose: Stores tenant login audits records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| login_result | varchar(255) | CHECK | CHECK(login_result IN ('SUCCESS', 'FAILED', 'LOCKED')) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_user_id) REFERENCES tenant_users(id)
CHECK(login_result IN ('SUCCESS', 'FAILED', 'LOCKED'))
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
