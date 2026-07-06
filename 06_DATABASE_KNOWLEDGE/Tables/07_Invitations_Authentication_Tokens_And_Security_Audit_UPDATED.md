<!-- title: 07. Invitations, Authentication, Tokens & Security Audit -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-06 -->
<!-- source: Updated from uploaded ERD image -->

# 07. Invitations, Authentication, Tokens & Security Audit

## Purpose

This module documents invitation, tenant-user account setup, verification, password recovery, authentication-session, refresh-token, and security-audit tables exactly from the uploaded ERD image.

## Entity Tables

| Table | Purpose |
|---|---|
| `user_invites` | Stores invitation records for tenant users before account setup. |
| `user_setup_tokens` | Stores account setup tokens for invited or newly created tenant users. |
| `email_verification_tokens` | Stores tenant user email verification tokens. |
| `password_reset_tokens` | Stores tenant user password reset tokens. |
| `tenant_auth_sessions` | Stores tenant user authentication sessions. |
| `tenant_refresh_tokens` | Stores tenant user refresh tokens for session/token rotation. |
| `tenant_login_audits` | Stores append-only login audit events for tenant authentication. |

## Table Details

## `user_invites`

Purpose: Stores invitation records for tenant users before account setup.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant that owns the invite. |
| `invited_email` | varchar(255) |  | NOT NULL | Email address invited to join the tenant. |
| `normalized_invited_email` | varchar(255) |  | NOT NULL | Normalized invited email used for duplicate checks. |
| `invited_phone` | varchar(40) |  | NULL | Optional invited phone number. |
| `normalized_invited_phone` | varchar(40) |  | NULL | Optional normalized invited phone number. |
| `accepted_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). User created/linked after invite acceptance. |
| `initial_role_id` | uuid | FK | NULL | References tenant_roles(id). Initial role to assign after acceptance. |
| `initial_outlet_id` | uuid | FK | NULL | References outlets(id). Initial outlet scope after acceptance. |
| `invite_token_hash` | varchar(255) | UNIQUE | NOT NULL | Hashed invite token. Raw invite token is never stored. |
| `invite_status` | varchar(40) |  | NOT NULL | Original ERD domain: user_invite_status. |
| `invited_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who sent the invite. |
| `invited_by_platform_user_id` | uuid | FK | NULL | References platform_users(id). Platform user who sent the invite. |
| `sent_at` | timestamptz |  | NULL | Timestamp when invite was sent. |
| `last_sent_at` | timestamptz |  | NULL | Timestamp when invite was last resent. |
| `resend_count` | int |  | NOT NULL | Number of resend attempts. |
| `expires_at` | timestamptz |  | NOT NULL | Invite expiry timestamp. |
| `accepted_at` | timestamptz |  | NULL | Timestamp when invite was accepted. |
| `cancelled_at` | timestamptz |  | NULL | Timestamp when invite was cancelled. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |


Constraints / Notes:

```text
UNIQUE(invite_token_hash)
UNIQUE(tenant_id, normalized_invited_email) WHERE invite_status IN ('PENDING', 'SENT')
CHECK(expires_at > created_at)
CHECK(resend_count >= 0)
```

Relationships:

- user_invites.tenant_id -> tenants(id)
- user_invites.accepted_tenant_user_id -> tenant_users(id)
- user_invites.initial_role_id -> tenant_roles(id)
- user_invites.initial_outlet_id -> outlets(id)
- user_invites.invited_by_tenant_user_id -> tenant_users(id)
- user_invites.invited_by_platform_user_id -> platform_users(id)

## `user_setup_tokens`

Purpose: Stores account setup tokens for invited or newly created tenant users.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant context for setup token. |
| `user_id` | uuid | FK | NOT NULL | References tenant_users(id). User completing account setup. |
| `token_hash` | varchar(255) | UNIQUE | NOT NULL | Hashed setup token. Raw token is never stored. |
| `purpose` | varchar(40) |  | NOT NULL | Original ERD domain: user_setup_purpose. |
| `expires_at` | timestamptz |  | NOT NULL | Setup token expiry timestamp. |
| `used_at` | timestamptz |  | NULL | Timestamp when token was used. |
| `revoked_at` | timestamptz |  | NULL | Timestamp when token was revoked. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |


Constraints / Notes:

```text
UNIQUE(token_hash)
CHECK(expires_at > created_at)
```

Relationships:

- user_setup_tokens.tenant_id -> tenants(id)
- user_setup_tokens.user_id -> tenant_users(id)

## `email_verification_tokens`

Purpose: Stores tenant user email verification tokens.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant context for email verification. |
| `user_id` | uuid | FK | NOT NULL | References tenant_users(id). User verifying email. |
| `email_to_verify` | varchar(255) |  | NOT NULL | Email address to verify. |
| `normalized_email_to_verify` | varchar(255) |  | NOT NULL | Normalized email address to verify. |
| `token_hash` | varchar(255) | UNIQUE | NOT NULL | Hashed verification token. Raw token is never stored. |
| `expires_at` | timestamptz |  | NOT NULL | Verification token expiry timestamp. |
| `verified_at` | timestamptz |  | NULL | Timestamp when email was verified. |
| `revoked_at` | timestamptz |  | NULL | Timestamp when token was revoked. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |


Constraints / Notes:

```text
UNIQUE(token_hash)
CHECK(expires_at > created_at)
```

Relationships:

- email_verification_tokens.tenant_id -> tenants(id)
- email_verification_tokens.user_id -> tenant_users(id)

## `password_reset_tokens`

Purpose: Stores tenant user password reset tokens.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant context for password reset. |
| `user_id` | uuid | FK | NOT NULL | References tenant_users(id). User requesting password reset. |
| `token_hash` | varchar(255) | UNIQUE | NOT NULL | Hashed password reset token. Raw token is never stored. |
| `requested_ip_address` | inet |  | NULL | IP address used when reset was requested. |
| `requested_user_agent` | text |  | NULL | User agent used when reset was requested. |
| `expires_at` | timestamptz |  | NOT NULL | Password reset token expiry timestamp. |
| `used_at` | timestamptz |  | NULL | Timestamp when token was used. |
| `revoked_at` | timestamptz |  | NULL | Timestamp when token was revoked. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |


Constraints / Notes:

```text
UNIQUE(token_hash)
CHECK(expires_at > created_at)
```

Relationships:

- password_reset_tokens.tenant_id -> tenants(id)
- password_reset_tokens.user_id -> tenant_users(id)

## `tenant_auth_sessions`

Purpose: Stores tenant user authentication sessions.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant context for session. |
| `user_id` | uuid | FK | NOT NULL | References tenant_users(id). Logged-in tenant user. |
| `ip_address` | inet |  | NULL | IP address used for the session. |
| `user_agent` | text |  | NULL | User agent used for the session. |
| `device_name` | varchar(150) |  | NULL | Client/device display name. |
| `pos_device_id` | uuid | FK | NULL | References pos_devices(id). Optional POS device session link. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `last_seen_at` | timestamptz |  | NULL | Last activity timestamp. |
| `expires_at` | timestamptz |  | NOT NULL | Session expiry timestamp. |
| `revoked_at` | timestamptz |  | NULL | Timestamp when session was revoked. |
| `revoked_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who revoked the session. |
| `revoked_by_platform_user_id` | uuid | FK | NULL | References platform_users(id). Platform user who revoked the session. |
| `revoke_reason` | varchar(250) |  | NULL | Reason for session revocation. |


Constraints / Notes:

```text
CHECK(expires_at > created_at)
CHECK(NOT (revoked_by_tenant_user_id IS NOT NULL AND revoked_by_platform_user_id IS NOT NULL))
```

Relationships:

- tenant_auth_sessions.tenant_id -> tenants(id)
- tenant_auth_sessions.user_id -> tenant_users(id)
- tenant_auth_sessions.pos_device_id -> pos_devices(id)
- tenant_auth_sessions.revoked_by_tenant_user_id -> tenant_users(id)
- tenant_auth_sessions.revoked_by_platform_user_id -> platform_users(id)

## `tenant_refresh_tokens`

Purpose: Stores tenant user refresh tokens for session/token rotation.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant context for refresh token. |
| `tenant_auth_session_id` | uuid | FK | NOT NULL | References tenant_auth_sessions(id). Parent authentication session. |
| `user_id` | uuid | FK | NOT NULL | References tenant_users(id). Token owner. |
| `token_hash` | varchar(255) | UNIQUE | NOT NULL | Hashed refresh token. Raw token is never stored. |
| `token_family_id` | uuid |  | NOT NULL | Refresh token family identifier for token rotation. |
| `replaced_by_token_id` | uuid | FK | NULL | References tenant_refresh_tokens(id). Replacement token created during rotation. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `used_at` | timestamptz |  | NULL | Timestamp when refresh token was used. |
| `expires_at` | timestamptz |  | NOT NULL | Refresh token expiry timestamp. |
| `revoked_at` | timestamptz |  | NULL | Timestamp when refresh token was revoked. |
| `revoked_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who revoked token. |
| `revoked_by_platform_user_id` | uuid | FK | NULL | References platform_users(id). Platform user who revoked token. |
| `revoke_reason` | varchar(250) |  | NULL | Reason for refresh token revocation. |


Constraints / Notes:

```text
UNIQUE(token_hash)
UNIQUE(replaced_by_token_id) WHERE replaced_by_token_id IS NOT NULL
CHECK(expires_at > created_at)
CHECK(NOT (revoked_by_tenant_user_id IS NOT NULL AND revoked_by_platform_user_id IS NOT NULL))
```

Relationships:

- tenant_refresh_tokens.tenant_id -> tenants(id)
- tenant_refresh_tokens.tenant_auth_session_id -> tenant_auth_sessions(id)
- tenant_refresh_tokens.user_id -> tenant_users(id)
- tenant_refresh_tokens.replaced_by_token_id -> tenant_refresh_tokens(id)
- tenant_refresh_tokens.revoked_by_tenant_user_id -> tenant_users(id)
- tenant_refresh_tokens.revoked_by_platform_user_id -> platform_users(id)

## `tenant_login_audits`

Purpose: Stores append-only login audit events for tenant authentication.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant context for login audit. |
| `user_id` | uuid | FK | NULL | References tenant_users(id). Null when login did not resolve a user. |
| `auth_session_id` | uuid | FK | NULL | References tenant_auth_sessions(id). Session created by successful login. |
| `pos_device_id` | uuid | FK | NULL | References pos_devices(id). Optional POS device used during login. |
| `attempted_identifier` | varchar(255) |  | NOT NULL | Email/phone/username attempted during login. |
| `authentication_method` | varchar(40) |  | NOT NULL | Original ERD domain: authentication_method. |
| `login_status` | varchar(40) |  | NOT NULL | Original ERD domain: tenant_login_status. |
| `failure_code` | varchar(60) |  | NULL | Short failure code for failed login. |
| `failure_detail` | text |  | NULL | Detailed failure information. |
| `ip_address` | inet |  | NULL | IP address used during login attempt. |
| `user_agent` | text |  | NULL | User agent used during login attempt. |
| `attempted_at` | timestamptz |  | NOT NULL | Timestamp of login attempt. |


Constraints / Notes:

```text
Append-only audit table.
```

Relationships:

- tenant_login_audits.tenant_id -> tenants(id)
- tenant_login_audits.user_id -> tenant_users(id)
- tenant_login_audits.auth_session_id -> tenant_auth_sessions(id)
- tenant_login_audits.pos_device_id -> pos_devices(id)

## Reference Entities (External)

| Table | Key Fields | Note |
|---|---|---|
| `tenants` | id uuid PK | Tenant reference used by every tenant-auth/security table. |
| `tenant_users` | id uuid PK, tenant_id uuid FK | Tenant user reference for invited/accepted/authenticated users. |
| `tenant_roles` | id uuid PK, tenant_id uuid FK | Initial role reference for user invites. |
| `outlets` | id uuid PK, tenant_id uuid FK | Initial outlet reference for user invites. |
| `platform_users` | id uuid PK | Platform admin audit/revocation reference. |
| `pos_devices` | id uuid PK, tenant_id uuid FK | POS device reference for sessions and login audits. |

## Double-check Summary

```text
Tables checked: 7
Total attribute rows checked: 90
user_invites: 20 attributes
user_setup_tokens: 9 attributes
email_verification_tokens: 10 attributes
password_reset_tokens: 10 attributes
tenant_auth_sessions: 14 attributes
tenant_refresh_tokens: 14 attributes
tenant_login_audits: 13 attributes
Missing tables: None
Extra tables: None
Enum/domain datatype remaining: None
Blank Reference / Note cells: 0
```

## Module Notes

- Enum/domain names shown in the ERD image are represented as varchar(40) plus notes; no database enum datatype is used.

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
