<!-- title: Customer Basic, Authentication & Consent -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 19. Customer Basic, Authentication & Consent

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `customers` | Stores customers records for this module. |
| `customer_auth_accounts` | Stores customer auth accounts records for this module. |
| `customer_verification_otps` | Stores customer verification otps records for this module. |
| `customer_password_reset_tokens` | Stores customer password reset tokens records for this module. |
| `customer_auth_sessions` | Stores customer auth sessions records for this module. |
| `customer_refresh_tokens` | Stores customer refresh tokens records for this module. |
| `customer_consents` | Stores customer consents records for this module. |

## customers

Module: Customer Basic, Authentication & Consent

Purpose: Stores customers records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. Unique business key. Partial unique where normalized_email IS NOT NULL AND status <> 'DELETED'. Unique business key. Partial unique where normalized_phone IS NOT NULL AND status <> 'DELETED'. |
| name | varchar(200) | NOT | Display name. |
| normalized_email | citext | UNIQUE | Unique business key. Partial unique where normalized_email IS NOT NULL AND status <> 'DELETED'. |
| normalized_phone | varchar(40) | UNIQUE | Unique business key. Partial unique where normalized_phone IS NOT NULL AND status <> 'DELETED'. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| customer_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, customer_code)
UNIQUE(tenant_id, normalized_email) WHERE normalized_email IS NOT NULL AND status <> 'DELETED'
UNIQUE(tenant_id, normalized_phone) WHERE normalized_phone IS NOT NULL AND status <> 'DELETED'
```

## customer_auth_accounts

Module: Customer Basic, Authentication & Consent

Purpose: Stores customer auth accounts records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| customer_id | uuid | FK NULL UNIQUE | References `customers(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| failed_login_count | integer | CHECK | CHECK(failed_login_count >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(customer_id) REFERENCES customers(id)
UNIQUE(tenant_id, customer_id)
CHECK(failed_login_count >= 0)
```

## customer_verification_otps

Module: Customer Basic, Authentication & Consent

Purpose: Stores customer verification otps records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. Partial unique where status = 'PENDING'. |
| customer_id | uuid | FK NULL | References `customers(id)`. |
| status | varchar(30) | NOT | OTP lifecycle status used by partial unique filter. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| attempt_count | integer | CHECK | CHECK(attempt_count >= 0) |
| max_attempts | integer | CHECK | CHECK(max_attempts > 0) |
| normalized_recipient_value | varchar(255) | UNIQUE | Unique business key. Partial unique where status = 'PENDING'. |
| verification_purpose | varchar(255) | UNIQUE | Unique business key. Partial unique where status = 'PENDING'. |

Source constraints from uploaded design:

```text
PK(id)
FK(customer_id) REFERENCES customers(id)
UNIQUE(tenant_id, verification_purpose, normalized_recipient_value) WHERE status = 'PENDING'
CHECK(attempt_count >= 0)
CHECK(max_attempts > 0)
```

## customer_password_reset_tokens

Module: Customer Basic, Authentication & Consent

Purpose: Stores customer password reset tokens records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| customer_auth_account_id | uuid | FK NOT | References `customer_auth_accounts(id)`. |
| token_hash | varchar(255) | UNIQUE | Unique business key. |
| verified_otp_id | uuid | FK NULL | References `customer_verification_otps(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(customer_auth_account_id) REFERENCES customer_auth_accounts(id)
FK(verified_otp_id) REFERENCES customer_verification_otps(id)
UNIQUE(tenant_id, token_hash)
```

## customer_auth_sessions

Module: Customer Basic, Authentication & Consent

Purpose: Stores customer auth sessions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| customer_auth_account_id | uuid | FK NOT | References `customer_auth_accounts(id)`. |
| session_token_hash | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(customer_auth_account_id) REFERENCES customer_auth_accounts(id)
UNIQUE(tenant_id, session_token_hash)
```

## customer_refresh_tokens

Module: Customer Basic, Authentication & Consent

Purpose: Stores customer refresh tokens records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK UNIQUE | Primary key. Unique business key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| customer_auth_session_id | uuid | FK NOT | References `customer_auth_sessions(id)`. |
| token_hash | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(customer_auth_session_id) REFERENCES customer_auth_sessions(id)
UNIQUE(tenant_id, token_hash)
UNIQUE(tenant_id, id)
```

## customer_consents

Module: Customer Basic, Authentication & Consent

Purpose: Stores customer consents records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| customer_id | uuid | FK NULL UNIQUE | References `customers(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| consent_type | varchar(40) | UNIQUE | Unique business key. |
| sales_channel_id | uuid | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(customer_id) REFERENCES customers(id)
UNIQUE(tenant_id, customer_id, consent_type, sales_channel_id)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
