<!-- title: 02. Tenant Foundation -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- source: Updated from uploaded ERD image: 02_Tenant Foundation.png -->

# 02. Tenant Foundation

## Purpose

This file documents the entity tables, attributes, keys, nullability, constraints, and external references for this ERD module. Enum/domain data types from the image are represented as `varchar(...)` plus CHECK/notes, not database enum types.

## Entity Tables

| Table | Purpose |
|---|---|
| `currencies` | Stores supported currencies. |
| `business_types` | Stores platform business type master records. |
| `tenants` | Stores tenant core account data. |
| `tenant_profiles` | Stores tenant legal/profile data. |
| `tenant_addresses` | Stores tenant address records. |
| `tenant_domains` | Stores tenant domain configuration and verification status. |
| `setting_definitions` | Stores platform-defined tenant setting metadata. |
| `tenant_settings` | Stores tenant-specific setting values. |

## `currencies`

Purpose: Stores supported currencies.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `currency_code` | char(3) |  | NOT NULL | ISO currency code |
| `currency_name` | varchar(100) |  | NOT NULL |  |
| `currency_symbol` | varchar(20) |  | NULL |  |
| `decimal_places` | smallint |  | NOT NULL |  |
| `is_active` | boolean |  | NOT NULL |  |
| `sort_order` | int |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(currency_code)
CHECK(decimal_places >= 0)
CHECK(sort_order >= 0)
```

## `business_types`

Purpose: Stores platform business type master records.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `business_code` | varchar(80) |  | NOT NULL |  |
| `business_name` | varchar(150) |  | NOT NULL |  |
| `description` | text |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(business_code)
```

## `tenants`

Purpose: Stores tenant core account data.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_code` | varchar(60) |  | NOT NULL |  |
| `tenant_slug` | varchar(100) |  | NOT NULL |  |
| `display_name` | varchar(200) |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: tenant_status |
| `base_currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `default_timezone` | varchar(80) |  | NOT NULL |  |
| `data_region` | varchar(50) |  | NULL |  |
| `activated_at` | timestamptz |  | NULL |  |
| `suspended_at` | timestamptz |  | NULL |  |
| `archived_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(tenant_code)
UNIQUE(tenant_slug)
```

Relationships:

- tenants.base_currency_code -> currencies.currency_code
- tenants.created_by_platform_user_id -> platform_users.id
- tenants.updated_by_platform_user_id -> platform_users.id

## `tenant_profiles`

Purpose: Stores tenant legal/profile data.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `business_type_id` | uuid | FK | NULL | References business_types(id) |
| `legal_name` | varchar(250) |  | NOT NULL |  |
| `trading_name` | varchar(250) |  | NULL |  |
| `primary_contact_name` | varchar(200) |  | NULL |  |
| `primary_email` | varchar(255) |  | NULL |  |
| `primary_phone` | varchar(40) |  | NULL |  |
| `website_url` | varchar(500) |  | NULL |  |
| `logo_url` | varchar(500) |  | NULL |  |
| `description` | text |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(tenant_id)
```

Relationships:

- tenant_profiles.tenant_id -> tenants.id
- tenant_profiles.business_type_id -> business_types.id

## `tenant_addresses`

Purpose: Stores tenant address records.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `address_type` | varchar(40) |  | NOT NULL | Original ERD domain: tenant_address_type |
| `address_line1` | varchar(250) |  | NOT NULL |  |
| `address_line2` | varchar(250) |  | NULL |  |
| `city` | varchar(120) |  | NULL |  |
| `state_or_province` | varchar(120) |  | NULL |  |
| `postal_code` | varchar(30) |  | NULL |  |
| `country_code` | char(2) |  | NOT NULL |  |
| `is_primary` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
One active primary address per tenant and address_type
```

Relationships:

- tenant_addresses.tenant_id -> tenants.id

## `tenant_domains`

Purpose: Stores tenant domain configuration and verification status.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `domain_type` | varchar(40) |  | NOT NULL | Original ERD domain: domain_type |
| `domain_name` | varchar(255) |  | NOT NULL |  |
| `is_primary` | boolean |  | NOT NULL |  |
| `verification_status` | varchar(40) |  | NOT NULL | Original ERD domain: domain_verification_status |
| `verification_token_hash` | varchar(255) |  | NULL |  |
| `verified_at` | timestamptz |  | NULL |  |
| `ssl_status` | varchar(40) |  | NOT NULL | Original ERD domain: domain_ssl_status |
| `ssl_issued_at` | timestamptz |  | NULL |  |
| `ssl_expires_at` | timestamptz |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(domain_name)
UNIQUE(verification_token_hash) WHERE verification_token_hash IS NOT NULL
One primary domain per tenant
```

Relationships:

- tenant_domains.tenant_id -> tenants.id

## `setting_definitions`

Purpose: Stores platform-defined tenant setting metadata.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `setting_key` | varchar(120) |  | NOT NULL |  |
| `display_name` | varchar(150) |  | NOT NULL |  |
| `value_type` | varchar(30) |  | NOT NULL |  |
| `default_value` | jsonb |  | NULL |  |
| `description` | text |  | NULL |  |
| `is_tenant_editable` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(setting_key)
```

## `tenant_settings`

Purpose: Stores tenant-specific setting values.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `setting_definition_id` | uuid | FK | NOT NULL | References setting_definitions(id) |
| `setting_value` | jsonb |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(tenant_id, setting_definition_id)
```

Relationships:

- tenant_settings.tenant_id -> tenants.id
- tenant_settings.setting_definition_id -> setting_definitions.id

## Reference Entities (External)

| Table | Key Fields | Note |
|---|---|---|
| `platform_users` | id uuid PK | External platform audit reference |

## Module Notes

- The uploaded ERD image contains 8 main entity tables; `sales_channels` was not included in this image and is not included in this updated module file.

