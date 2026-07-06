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
| `sales_channels` | Stores tenant-owned sales/order channels such as POS, E-commerce, Click & Collect, Portable POS, Kiosk, Marketplace, or Manual. |
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
| `currency_name` | varchar(100) |  | NOT NULL | Currency display name |
| `currency_symbol` | varchar(20) |  | NULL | Optional currency symbol such as Rs, $, or £ |
| `decimal_places` | smallint |  | NOT NULL | Number of decimal places used for money formatting |
| `is_active` | boolean |  | NOT NULL | Indicates whether this master record is active for use |
| `sort_order` | int |  | NOT NULL | Display ordering value; lower numbers appear first |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |

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
| `business_code` | varchar(80) |  | NOT NULL | Unique platform business type code |
| `business_name` | varchar(150) |  | NOT NULL | Business type display name |
| `description` | text |  | NULL | Optional description or notes |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |

Constraints / Notes:

```text
UNIQUE(business_code)
```

## `tenants`

Purpose: Stores tenant core account data.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_code` | varchar(60) |  | NOT NULL | Unique human-readable tenant code |
| `tenant_slug` | varchar(100) |  | NOT NULL | Unique URL-safe tenant slug |
| `display_name` | varchar(200) |  | NOT NULL | Tenant display name shown in UI |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: tenant_status |
| `base_currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `default_timezone` | varchar(80) |  | NOT NULL | Tenant default IANA timezone |
| `data_region` | varchar(50) |  | NULL | Optional data residency / hosting region code |
| `activated_at` | timestamptz |  | NULL | Timestamp when tenant became active |
| `suspended_at` | timestamptz |  | NULL | Timestamp when tenant was suspended |
| `archived_at` | timestamptz |  | NULL | Timestamp when tenant was archived |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |
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

## `sales_channels`

Purpose: Stores tenant-owned sales/order channels. POS and E-commerce are stored as rows in this common table; separate `pos_channels` or `ecommerce_channels` tables are not required.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `channel_code` | varchar(80) |  | NOT NULL | Tenant-scoped stable channel code, e.g. POS, ECOM, CLICK_COLLECT |
| `channel_name` | varchar(150) |  | NOT NULL | Display name |
| `channel_type` | varchar(40) |  | NOT NULL | POS, E_COMMERCE, CLICK_AND_COLLECT, PORTABLE_POS, KIOSK, MARKETPLACE, or MANUAL |
| `channel_mode` | varchar(40) |  | NULL | OFFLINE, ONLINE, or HYBRID |
| `description` | text |  | NULL | Optional notes |
| `default_price_list_id` | uuid | FK | NULL | References price_lists(id) |
| `default_currency_code` | char(3) | FK | NULL | References currencies(currency_code) |
| `is_order_enabled` | boolean |  | NOT NULL DEFAULT true | Whether order creation is enabled for this channel |
| `is_payment_enabled` | boolean |  | NOT NULL DEFAULT true | Whether payments are enabled for this channel |
| `is_return_enabled` | boolean |  | NOT NULL DEFAULT true | Whether returns are enabled for this channel |
| `is_offline_enabled` | boolean |  | NOT NULL DEFAULT false | Whether offline operation is enabled for this channel |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Constraints / Notes:

```text
UNIQUE(tenant_id, channel_code)
CHECK(channel_type IN ('POS', 'E_COMMERCE', 'CLICK_AND_COLLECT', 'PORTABLE_POS', 'KIOSK', 'MARKETPLACE', 'MANUAL'))
CHECK(channel_mode IS NULL OR channel_mode IN ('OFFLINE', 'ONLINE', 'HYBRID'))
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
CHECK(sort_order >= 0)
```

Relationships:

- sales_channels.tenant_id -> tenants.id
- sales_channels.default_price_list_id -> price_lists.id
- sales_channels.default_currency_code -> currencies.currency_code
- sales_channels.created_by_tenant_user_id -> tenant_users.id
- sales_channels.updated_by_tenant_user_id -> tenant_users.id

Example rows:

```text
Tenant A + POS  -> channel_type = 'POS'
Tenant A + ECOM -> channel_type = 'E_COMMERCE'
Tenant A + CLICK_COLLECT -> channel_type = 'CLICK_AND_COLLECT'
```


## `tenant_profiles`

Purpose: Stores tenant legal/profile data.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `business_type_id` | uuid | FK | NULL | References business_types(id) |
| `legal_name` | varchar(250) |  | NOT NULL | Registered legal business name |
| `trading_name` | varchar(250) |  | NULL | Optional public trading name |
| `primary_contact_name` | varchar(200) |  | NULL | Primary contact person name |
| `primary_email` | varchar(255) |  | NULL | Primary tenant contact email |
| `primary_phone` | varchar(40) |  | NULL | Primary tenant contact phone number |
| `website_url` | varchar(500) |  | NULL | Tenant public website URL |
| `logo_url` | varchar(500) |  | NULL | Tenant logo asset URL |
| `description` | text |  | NULL | Optional description or notes |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |
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
| `address_line1` | varchar(250) |  | NOT NULL | Primary address line |
| `address_line2` | varchar(250) |  | NULL | Optional secondary address line |
| `city` | varchar(120) |  | NULL | City / town |
| `state_or_province` | varchar(120) |  | NULL | State, province, or district |
| `postal_code` | varchar(30) |  | NULL | Postal / ZIP code |
| `country_code` | char(2) |  | NOT NULL | ISO 3166-1 alpha-2 country code |
| `is_primary` | boolean |  | NOT NULL | Marks the primary record for that tenant/scope |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |
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
| `domain_name` | varchar(255) |  | NOT NULL | Tenant domain name; must be globally unique |
| `is_primary` | boolean |  | NOT NULL | Marks the primary record for that tenant/scope |
| `verification_status` | varchar(40) |  | NOT NULL | Original ERD domain: domain_verification_status |
| `verification_token_hash` | varchar(255) |  | NULL | Hashed verification token; raw token is not stored |
| `verified_at` | timestamptz |  | NULL | Timestamp when domain verification completed |
| `ssl_status` | varchar(40) |  | NOT NULL | Original ERD domain: domain_ssl_status |
| `ssl_issued_at` | timestamptz |  | NULL | Timestamp when SSL certificate was issued |
| `ssl_expires_at` | timestamptz |  | NULL | Timestamp when SSL certificate expires |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |
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
| `setting_key` | varchar(120) |  | NOT NULL | Unique platform setting key |
| `display_name` | varchar(150) |  | NOT NULL | Tenant display name shown in UI |
| `value_type` | varchar(30) |  | NOT NULL | Setting value data type indicator |
| `default_value` | jsonb |  | NULL | Default setting value stored as JSON |
| `description` | text |  | NULL | Optional description or notes |
| `is_tenant_editable` | boolean |  | NOT NULL | Controls whether tenant users can edit this setting |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |

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
| `setting_value` | jsonb |  | NOT NULL | Tenant-specific value stored as JSON |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(tenant_id, setting_definition_id)
```

Relationships:

- tenant_settings.tenant_id -> tenants.id
- tenant_settings.setting_definition_id -> setting_definitions.id

## Relationship Summary

| From Table.Column | To Table.Column | Reference Type | Nullability | Note |
|---|---|---|---|---|
| `tenants.base_currency_code` | `currencies.currency_code` | Internal FK | NOT NULL | Tenant base currency |
| `tenants.created_by_platform_user_id` | `platform_users.id` | External FK | NULL | Platform audit user |
| `tenants.updated_by_platform_user_id` | `platform_users.id` | External FK | NULL | Platform audit user |
| `sales_channels.tenant_id` | `tenants.id` | Internal FK | NOT NULL | Sales channels belong to one tenant |
| `sales_channels.default_price_list_id` | `price_lists.id` | External FK | NULL | Optional default price list for the channel |
| `sales_channels.default_currency_code` | `currencies.currency_code` | Internal FK | NULL | Optional channel-level default currency |
| `sales_channels.created_by_tenant_user_id` | `tenant_users.id` | External FK | NULL | Tenant audit user |
| `sales_channels.updated_by_tenant_user_id` | `tenant_users.id` | External FK | NULL | Tenant audit user |
| `tenant_profiles.tenant_id` | `tenants.id` | Internal FK | NOT NULL | One profile per tenant |
| `tenant_profiles.business_type_id` | `business_types.id` | Internal FK | NULL | Optional business classification |
| `tenant_addresses.tenant_id` | `tenants.id` | Internal FK | NOT NULL | Tenant address ownership |
| `tenant_domains.tenant_id` | `tenants.id` | Internal FK | NOT NULL | Tenant domain ownership |
| `tenant_settings.tenant_id` | `tenants.id` | Internal FK | NOT NULL | Tenant setting ownership |
| `tenant_settings.setting_definition_id` | `setting_definitions.id` | Internal FK | NOT NULL | Setting metadata reference |

## Reference Entities (External)

| Table | Key Fields | Note |
|---|---|---|
| `platform_users` | `id` uuid PK | External platform audit reference used by tenants and tenant profile/audit columns. |
| `tenant_users` | `id` uuid PK, `tenant_id` uuid FK | External tenant-user audit reference used by sales_channels created/updated user fields. |
| `price_lists` | `id` uuid PK, `tenant_id` uuid FK | External pricing reference used by sales_channels.default_price_list_id. |


## Module Notes

- The uploaded ERD image contains 8 visible foundation tables.
- Design update: `sales_channels` is added to Tenant Foundation because many modules reference sales/order channels.
- POS and E-commerce are rows in `sales_channels`; separate `pos_channels` or `ecommerce_channels` tables are not required.
- `sales_channels.tenant_id` is NOT NULL because channels are tenant-specific configuration.
- All attribute rows include a Reference / Note value; no Reference / Note cell is left empty.

