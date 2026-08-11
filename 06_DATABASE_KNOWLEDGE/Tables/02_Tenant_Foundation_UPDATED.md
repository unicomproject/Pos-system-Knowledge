<!-- title: 02. Tenant Foundation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
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
| `sales_channels` | Stores tenant-owned sales/order channels such as POS and E-commerce. |
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
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: tenant_status; lifecycle-only (`DRAFT`, `PENDING_PAYMENT`, `PENDING_ACTIVATION`, `ACTIVE`, `SUSPENDED`, `CANCELLED`) |
| `base_currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `default_timezone` | varchar(80) |  | NOT NULL |  |
| `default_locale` | varchar(20) |  | NULL | Wizard/create `defaultLocale`; nullable for legacy rows |
| `operating_mode` | varchar(40) |  | NULL | Catalogue: `unified_epos`, `pos_online_store`, `pos_only` |
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
Approved lifecycle-only values: DRAFT, PENDING_PAYMENT, PENDING_ACTIVATION, ACTIVE, SUSPENDED, CANCELLED
Do not store billing-cycle, subscription-type, subscription-status, or payment-status values in tenants.status
Migration order: 1) RepairTenantLifecycleStatusData 2) AddTenantLifecycleStatusCheckConstraint
```

DATA MIGRATION RULES (approved mapping for `RepairTenantLifecycleStatusData` only — not future workflow states):

- valid lifecycle values remain unchanged
- `pending` / `unpaid` / `overdue` / `failed` -> `PENDING_PAYMENT`
- `paid` / `verified` / `waived` and not activated -> `PENDING_ACTIVATION`
- `setup_pending` -> `ACTIVE` (`setup_pending` is **not** an approved lifecycle value)
- `inactive` with previous activation evidence -> `SUSPENDED` (`inactive` is **not** an approved lifecycle value)
- `inactive` without previous activation evidence -> `DRAFT`
- explicit cancelled -> `CANCELLED`
- explicit suspended -> `SUSPENDED`
- authoritative activation evidence such as `activated_at` or `is_active` takes priority over billing labels, except explicit suspended/cancelled state
- unknown values must fail safely or be reported for manual correction; never silently default

Relationships:

- tenants.base_currency_code -> currencies.currency_code
- tenants.created_by_platform_user_id -> platform_users.id
- tenants.updated_by_platform_user_id -> platform_users.id

## `sales_channels`

Purpose: Stores tenant-owned sales/order channels. POS and E-commerce are stored as rows in this common table, linked to the global `platform_sales_channels` master data.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id); sales channels are tenant-specific |
| `platform_sales_channel_id` | uuid | FK | NOT NULL | References platform_sales_channels(id) |
| `custom_name` | varchar(150) |  | NOT NULL | Tenant's custom display name |
| `status` | varchar(40) |  | NOT NULL | Active/inactive lifecycle |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order; lower values appear first |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp |

Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(platform_sales_channel_id) REFERENCES platform_sales_channels(id)
UNIQUE(tenant_id, platform_sales_channel_id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
CHECK(sort_order >= 0)
```

Relationships:

- sales_channels.tenant_id -> tenants.id
- sales_channels.platform_sales_channel_id -> platform_sales_channels.id

Example rows:

```text
Tenant A + Platform Channel 1 (PHYSICAL) -> custom_name = 'Main POS'
Tenant A + Platform Channel 2 (ONLINE) -> custom_name = 'Web Store'
```

## `tenant_profiles`

Purpose: Stores tenant legal/profile data.

| Attribute                     | Type         | Key | Null     | Reference / Note              |
| ----------------------------- | ------------ | --- | -------- | ----------------------------- |
| `id`                          | uuid         | PK  | NOT NULL | Primary key                   |
| `tenant_id`                   | uuid         | FK  | NOT NULL | References tenants(id)        |
| `business_type_id`            | uuid         | FK  | NULL     | References business_types(id) |
| `legal_name`                  | varchar(250) |     | NOT NULL |                               |
| `trading_name`                | varchar(250) |     | NULL     |                               |
| `primary_contact_name`        | varchar(200) |     | NULL     |                               |
| `primary_email`               | varchar(255) |     | NULL     |                               |
| `primary_phone`               | varchar(40)  |     | NULL     |                               |
| `website_url`                 | varchar(500) |     | NULL     |                               |
| `logo_media_asset_id`         | uuid         | FK  | NULL     | References `media_assets(id)`; canonical tenant logo reference |
| `description`                 | text         |     | NULL     |                               |
| `created_at`                  | timestamptz  |     | NOT NULL |                               |
| `updated_at`                  | timestamptz  |     | NOT NULL |                               |
| `created_by_platform_user_id` | uuid         | FK  | NULL     | References platform_users(id) |
| `updated_by_platform_user_id` | uuid         | FK  | NULL     | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(tenant_id)
```

Relationships:

- tenant_profiles.tenant_id -> tenants.id
- tenant_profiles.business_type_id -> business_types.id
- tenant_profiles.logo_media_asset_id -> media_assets.id

`logo_url` is a removed legacy field. Public/renderable logo URLs are resolved
through the referenced `media_assets` row; new features must not restore or read
`tenant_profiles.logo_url`.

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
| `sales_channel_id` | uuid | FK | NULL | References sales_channels(id); Used to link a domain to a specific storefront/channel. |
| `domain_type` | varchar(40) |  | NOT NULL | Original ERD domain: domain_type (e.g. STOREFRONT, ADMIN_PORTAL) |
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
- tenant_domains.sales_channel_id -> sales_channels.id

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

- The uploaded ERD image contains 8 visible foundation tables.
- Design update: `sales_channels` is added to Tenant Foundation because many modules reference sales/order channels.
- POS and E-commerce are rows in `sales_channels`; separate `pos_channels` or `ecommerce_channels` tables are not required.
- Requested minimal `sales_channels` version is used: no `default_price_list_id`, no payment/order/return enable flags, no audit user columns.
- `sales_channels.tenant_id` is NOT NULL because channels are tenant-specific configuration.
## POS Login Branding Current State (2026-08-10)

POS login branding reuses `setting_definitions`, `tenant_settings`,
`tenant_profiles` and `media_assets`. It does not introduce a branding table or
physical branding columns.

The following tenant-editable definitions are active and were applied to the
Local Development database through data-only migrations:

- `pos.login.system_name`
- `pos.login.description`
- `pos.login.subtitle_template`
- `pos.login.background_mode`
- `pos.login.background_color`
- `pos.login.background_media_asset_id`
- `pos.login.hero_media_asset_id`

Optional media UUID defaults use an empty JSON string to represent unset state,
which is compatible with the existing typed-settings provisioner. Runtime
resolution treats empty or invalid UUIDs as absent and falls back safely.

Existing `media_assets.asset_purpose` supports `POS_LOGIN_BACKGROUND` and
`POS_LOGIN_HERO`. Branding media must be ACTIVE, tenant-owned image media with
an allowed MIME/extension and a maximum size of 5 MiB.

Final Local Development verification applied a deterministic data-only fixture
migration for same-tenant and cross-tenant branding acceptance. The database
contains exactly one ACTIVE definition for each of the seven keys. No branding
table and no physical branding column were introduced.
