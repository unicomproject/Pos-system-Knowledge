<!-- title: Tenant Foundation -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 02. Tenant Foundation

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `currencies` | Stores currencies records for this module. |
| `business_types` | Stores business types records for this module. |
| `tenants` | Stores tenant/business accounts for the SaaS platform. |
| `sales_channels` | Stores tenant-owned sales/order channels shared by catalog, pricing, discount, inventory, and document numbering. |
| `tenant_profiles` | Stores tenant profiles records for this module. |
| `tenant_addresses` | Stores tenant addresses records for this module. |
| `tenant_domains` | Stores tenant domains records for this module. |
| `setting_definitions` | Stores setting definitions records for this module. |
| `tenant_settings` | Stores tenant settings records for this module. |

## currencies

Module: Tenant Foundation

Purpose: Stores currencies records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| currency_code | char(3) | UNIQUE PK | Unique business key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| decimal_places | integer | CHECK | CHECK(decimal_places >= 0) |

Source constraints from uploaded design:

```text
PK(id)
PK(currency_code)
UNIQUE(currency_code)
CHECK(decimal_places >= 0)
```

## business_types

Module: Tenant Foundation

Purpose: Stores business types records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| business_type_code | varchar(40) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(business_type_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## tenants

Module: Tenant Foundation

Purpose: Stores tenant/business accounts for the SaaS platform.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_code | varchar(60) | NOT UNIQUE | Unique business key. Human-readable tenant code. |
| currency_code | char(3) | FK NOT | References `currencies(currency_code)`. |
| name | varchar(200) | NOT | Tenant business name. |
| status | varchar(30) | NOT CHECK | pending_payment, setup_pending, active, suspended, inactive. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| base_currency | char(3) | NOT | ISO currency, e.g. LKR. |
| billing_status | varchar(30) | NOT DEFAULT pending CHECK | pending, paid, failed, overdue, waived. |
| business_type | varchar(80) | NULL | Business type selected in tenant onboarding. |
| business_type_id | uuid | FK NOT | References `business_types(id)`. |
| default_locale | varchar(20) | NOT | Default locale. |
| default_timezone | varchar(100) | NOT | IANA timezone. |
| operating_mode | varchar(30) | NOT CHECK | unified_epos, pos_online_store, pos_only if later restricted. |
| primary_domain | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(business_type_id) REFERENCES business_types(id)
FK(currency_code) REFERENCES currencies(currency_code)
UNIQUE(tenant_code)
UNIQUE(primary_domain)
```

## sales_channels

Module: Tenant Foundation

Purpose: Stores tenant-owned sales/order channels shared by catalog, pricing, discount, inventory, customer consent, and document numbering.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| channel_code | varchar(80) | NOT UNIQUE | Unique business key. Stable channel code such as E_POS or E_COMMERCE. |
| name | varchar(200) | NOT | Display name. |
| channel_type | varchar(40) | NOT CHECK | CHECK(channel_type IN ('E_POS', 'E_COMMERCE')) |
| status | varchar(30) | NOT CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, channel_code)
CHECK(channel_type IN ('E_POS', 'E_COMMERCE'))
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## tenant_profiles

Module: Tenant Foundation

Purpose: Stores tenant profiles records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id)
```

## tenant_addresses

Module: Tenant Foundation

Purpose: Stores tenant addresses records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT | References `tenants(id)`. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| address_type | varchar(40) | CHECK | CHECK(address_type IN ('BILLING', 'REGISTERED', 'CONTACT')) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
CHECK(address_type IN ('BILLING', 'REGISTERED', 'CONTACT'))
```

## tenant_domains

Module: Tenant Foundation

Purpose: Stores tenant domains records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT | References `tenants(id)`. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| domain_name | varchar(200) | UNIQUE | Unique business key. |
| domain_status | varchar(30) | CHECK | CHECK(domain_status IN ('PENDING', 'VERIFIED', 'FAILED', 'DISABLED')) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(domain_name)
CHECK(domain_status IN ('PENDING', 'VERIFIED', 'FAILED', 'DISABLED'))
```

## setting_definitions

Module: Tenant Foundation

Purpose: Stores setting definitions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| setting_key | varchar(255) | UNIQUE | Unique business key. |
| value_type | varchar(40) | CHECK | CHECK(value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE')) |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(setting_key)
CHECK(value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE'))
```

## tenant_settings

Module: Tenant Foundation

Purpose: Stores tenant settings records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| setting_definition_id | uuid | FK NOT UNIQUE | References `setting_definitions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(setting_definition_id) REFERENCES setting_definitions(id)
UNIQUE(tenant_id, setting_definition_id)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
