<!-- title: Customer Basic, Authentication & Consent -->
<!-- status: Updated -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->
<!-- source: 19_Customer Basic, Authentication & Consent ERD image -->

# 19. Customer Basic, Authentication & Consent

## Purpose

This file documents customer identity, authentication, verification, refresh-token session handling, and consent records.

## Design Rules Applied

- No database enum datatypes are used in this markdown.
- Status/type columns use `varchar(...)` with `CHECK(...)` constraints.
- Customer email and phone live in `customers`; password/security data lives in `customer_auth_accounts`.
- `customers` does not store password or password hash.
- Customer addresses are intentionally excluded for the current click-and-collect scope.

## Entity Tables

| # | Table | Purpose |
|---|---|---|
| 1 | `customers` | Customer master identity and contact details. |
| 2 | `customer_auth_accounts` | Customer password and authentication security state. |
| 3 | `customer_verification_otps` | Email/phone OTP verification requests. |
| 4 | `customer_password_reset_tokens` | Password reset token records linked to customer auth accounts. |
| 5 | `customer_auth_sessions` | Customer login sessions. |
| 6 | `customer_refresh_tokens` | Refresh-token family and replacement chain. |
| 7 | `customer_consents` | Customer privacy/marketing consent records. |

---

## 1. `customers`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `customer_code` | varchar(80) | UNIQUE | NOT NULL | Tenant-scoped customer code. |
| `first_name` | varchar(100) |  | NULL | Customer first name. |
| `last_name` | varchar(100) |  | NULL | Customer last name. |
| `display_name` | varchar(150) |  | NOT NULL | Display name. |
| `email` | varchar(150) |  | NULL | Raw customer email. |
| `normalized_email` | varchar(150) | UNIQUE | NULL | Normalized email for lookup/unique check. |
| `phone` | varchar(50) |  | NULL | Raw phone number. |
| `normalized_phone` | varchar(50) | UNIQUE | NULL | Normalized phone for lookup/unique check. |
| `source_type` | varchar(40) | CHECK | NOT NULL | Customer acquisition source. |
| `source_sales_channel_id` | uuid | FK | NULL | References `sales_channels(id)`. |
| `status` | varchar(40) | CHECK | NOT NULL | Customer lifecycle status. |
| `anonymized_at` | timestamptz |  | NULL | Privacy/anonymization timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(source_sales_channel_id) REFERENCES sales_channels(id)
UNIQUE(tenant_id, customer_code)
UNIQUE(tenant_id, id)
UNIQUE(tenant_id, normalized_email) WHERE normalized_email IS NOT NULL AND status <> 'DELETED'
UNIQUE(tenant_id, normalized_phone) WHERE normalized_phone IS NOT NULL AND status <> 'DELETED'
CHECK(source_type IN ('POS', 'ECOMMERCE', 'CLICK_AND_COLLECT', 'IMPORT', 'MANUAL'))
CHECK(status IN ('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED'))
```

---

## 2. `customer_auth_accounts`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `customer_id` | uuid | FK UNIQUE | NOT NULL | References `customers(id)`. One auth account per customer. |
| `password_hash` | varchar(255) |  | NULL | Hashed password only. |
| `email_verified_at` | timestamptz |  | NULL | Email verified timestamp. |
| `phone_verified_at` | timestamptz |  | NULL | Phone verified timestamp. |
| `failed_login_count` | int | CHECK | NOT NULL DEFAULT 0 | Failed login count. |
| `last_failed_login_at` | timestamptz |  | NULL | Last failed login timestamp. |
| `locked_until` | timestamptz |  | NULL | Account lock expiry timestamp. |
| `last_login_at` | timestamptz |  | NULL | Last successful login timestamp. |
| `last_password_changed_at` | timestamptz |  | NULL | Last password change timestamp. |
| `status` | varchar(40) | CHECK | NOT NULL | Auth account status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, customer_id) REFERENCES customers(tenant_id, id)
UNIQUE(tenant_id, id)
UNIQUE(tenant_id, customer_id)
CHECK(failed_login_count >= 0)
CHECK(status IN ('ACTIVE', 'LOCKED', 'DISABLED', 'DELETED'))
```

---

## 3. `customer_verification_otps`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `customer_id` | uuid | FK | NULL | References `customers(id)`. Nullable for pre-customer verification. |
| `verification_purpose` | varchar(40) | CHECK | NOT NULL | Verification purpose. |
| `delivery_channel` | varchar(40) | CHECK | NOT NULL | OTP delivery channel. |
| `recipient_value` | varchar(150) |  | NOT NULL | Email or phone destination. |
| `normalized_recipient_value` | varchar(150) | UNIQUE | NOT NULL | Normalized destination. |
| `otp_hash` | varchar(255) |  | NULL | Hashed OTP. |
| `status` | varchar(40) | CHECK | NOT NULL | OTP status. |
| `attempt_count` | int | CHECK | NOT NULL DEFAULT 0 | Verification attempt count. |
| `max_attempts` | int | CHECK | NOT NULL DEFAULT 5 | Maximum allowed attempts. |
| `resend_count` | int | CHECK | NOT NULL DEFAULT 0 | Resend count. |
| `sent_at` | timestamptz |  | NOT NULL | First send timestamp. |
| `last_sent_at` | timestamptz |  | NULL | Last send timestamp. |
| `expires_at` | timestamptz | CHECK | NOT NULL | Expiry timestamp. |
| `verified_at` | timestamptz |  | NULL | Verified timestamp. |
| `invalidated_at` | timestamptz |  | NULL | Invalidated timestamp. |
| `provider_name` | varchar(80) |  | NULL | SMS/email provider name. |
| `provider_message_id` | varchar(150) |  | NULL | Provider message reference. |
| `request_ip_address` | inet |  | NULL | Request IP address. |
| `request_user_agent` | text |  | NULL | Request user agent. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, customer_id) REFERENCES customers(tenant_id, id)
UNIQUE(tenant_id, verification_purpose, normalized_recipient_value) WHERE status = 'PENDING'
CHECK(verification_purpose IN ('EMAIL_VERIFY', 'PHONE_VERIFY', 'PASSWORD_RESET', 'LOGIN_VERIFY'))
CHECK(delivery_channel IN ('EMAIL', 'SMS', 'WHATSAPP'))
CHECK(status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'INVALIDATED', 'FAILED'))
CHECK(attempt_count >= 0)
CHECK(max_attempts > 0)
CHECK(resend_count >= 0)
CHECK(expires_at > sent_at)
```

---

## 4. `customer_password_reset_tokens`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `customer_auth_account_id` | uuid | FK | NOT NULL | References `customer_auth_accounts(id)`. |
| `verified_otp_id` | uuid | FK | NULL | References `customer_verification_otps(id)`. |
| `token_hash` | varchar(255) | UNIQUE | NOT NULL | Hashed reset token. |
| `status` | varchar(40) | CHECK | NOT NULL | Token status. |
| `expires_at` | timestamptz |  | NOT NULL | Expiry timestamp. |
| `used_at` | timestamptz |  | NULL | Used timestamp. |
| `revoked_at` | timestamptz |  | NULL | Revoked timestamp. |
| `revoked_reason` | varchar(250) |  | NULL | Revocation reason. |
| `request_ip_address` | inet |  | NULL | Request IP address. |
| `request_user_agent` | text |  | NULL | Request user agent. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, customer_auth_account_id) REFERENCES customer_auth_accounts(tenant_id, id)
FK(tenant_id, verified_otp_id) REFERENCES customer_verification_otps(tenant_id, id)
UNIQUE(tenant_id, token_hash)
CHECK(status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED'))
```

---

## 5. `customer_auth_sessions`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `customer_auth_account_id` | uuid | FK | NOT NULL | References `customer_auth_accounts(id)`. |
| `session_token_hash` | varchar(255) | UNIQUE | NOT NULL | Hashed session token. |
| `ip_address` | inet |  | NULL | Login IP address. |
| `user_agent` | text |  | NULL | User agent. |
| `device_name` | varchar(150) |  | NULL | Customer device name. |
| `status` | varchar(40) | CHECK | NOT NULL | Session status. |
| `last_activity_at` | timestamptz |  | NULL | Last activity timestamp. |
| `expires_at` | timestamptz |  | NOT NULL | Expiry timestamp. |
| `revoked_at` | timestamptz |  | NULL | Revoked timestamp. |
| `revoked_reason` | varchar(250) |  | NULL | Revocation reason. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, customer_auth_account_id) REFERENCES customer_auth_accounts(tenant_id, id)
UNIQUE(tenant_id, session_token_hash)
UNIQUE(tenant_id, id)
CHECK(status IN ('ACTIVE', 'EXPIRED', 'REVOKED'))
```

---

## 6. `customer_refresh_tokens`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `customer_auth_session_id` | uuid | FK | NOT NULL | References `customer_auth_sessions(id)`. |
| `token_family_id` | uuid |  | NOT NULL | Token family/group id. |
| `token_hash` | varchar(255) | UNIQUE | NOT NULL | Hashed refresh token. |
| `replaced_by_token_id` | uuid | FK | NULL | Self-reference to `customer_refresh_tokens(id)`. |
| `status` | varchar(40) | CHECK | NOT NULL | Refresh token status. |
| `expires_at` | timestamptz |  | NOT NULL | Expiry timestamp. |
| `used_at` | timestamptz |  | NULL | Used timestamp. |
| `revoked_at` | timestamptz |  | NULL | Revoked timestamp. |
| `revoked_reason` | varchar(250) |  | NULL | Revocation reason. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, customer_auth_session_id) REFERENCES customer_auth_sessions(tenant_id, id)
FK(tenant_id, replaced_by_token_id) REFERENCES customer_refresh_tokens(tenant_id, id)
UNIQUE(tenant_id, token_hash)
UNIQUE(tenant_id, id)
CHECK(status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED'))
```

---

## 7. `customer_consents`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `customer_id` | uuid | FK | NOT NULL | References `customers(id)`. |
| `consent_type` | varchar(40) | CHECK | NOT NULL | Consent type. |
| `policy_version` | varchar(50) |  | NULL | Consent policy version. |
| `consent_status` | varchar(40) | CHECK | NOT NULL | Consent status. |
| `consent_source` | varchar(40) | CHECK | NOT NULL | Consent source. |
| `sales_channel_id` | uuid | FK | NULL | References `sales_channels(id)`. |
| `recorded_at` | timestamptz |  | NOT NULL | Consent recorded timestamp. |
| `withdrawn_at` | timestamptz |  | NULL | Consent withdrawn timestamp. |
| `ip_address` | inet |  | NULL | IP address. |
| `user_agent` | text |  | NULL | User agent. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, customer_id) REFERENCES customers(tenant_id, id)
FK(sales_channel_id) REFERENCES sales_channels(id)
CHECK(consent_type IN ('MARKETING_EMAIL', 'MARKETING_SMS', 'MARKETING_WHATSAPP', 'TERMS', 'PRIVACY'))
CHECK(consent_status IN ('GRANTED', 'WITHDRAWN', 'EXPIRED'))
CHECK(consent_source IN ('POS', 'ECOMMERCE', 'CLICK_AND_COLLECT', 'ADMIN', 'IMPORT'))
```

## External Reference Entities

| Table | Key Fields | Note |
|---|---|---|
| `tenants` | id uuid PK | Tenant reference. |
| `sales_channels` | id uuid PK | Customer source and consent channel reference. |
