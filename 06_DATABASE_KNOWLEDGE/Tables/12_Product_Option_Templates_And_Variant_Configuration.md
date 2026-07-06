<!-- title: Product Option Templates & Variant Configuration -->
<!-- status: ERD aligned -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->
<!-- source: 12_Product Option Templates & Variant Configuration(2).png -->

# 12. Product Option Templates & Variant Configuration

## Purpose

This module defines platform option templates, tenant product options, product option values, and variant-option value mapping.

## Entity Tables

| No | Table | Purpose |
|---|---|---|
| 1 | `product_option_templates` | Platform-level option template master. |
| 2 | `product_option_template_values` | Platform-level default values for option templates. |
| 3 | `business_type_option_templates` | Maps business types to default option templates. |
| 4 | `product_options` | Tenant product-specific option definitions. |
| 5 | `product_option_values` | Tenant product-specific option values. |
| 6 | `product_variant_option_values` | Maps product variants to selected option values. |

## Reference Entities

`business_types`, `products`, `product_variants`, `tenants`, `tenant_users`, `platform_users`

## product_option_templates

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `template_code` | varchar(80) | NOT NULL UNIQUE | Platform-unique option template code. |
| `template_name` | varchar(150) | NOT NULL | Template display name. |
| `option_type` | varchar(40) | NOT NULL CHECK | Logical ERD type: product_option_type. |
| `input_type` | varchar(40) | NOT NULL CHECK | Logical ERD type: product_option_input_type. |
| `sort_order` | int | NOT NULL DEFAULT 0 CHECK | Display order. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_platform_user_id` | uuid | FK NULL | References platform_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_platform_user_id` | uuid | FK NULL | References platform_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
UNIQUE(template_code)
FK(created_by_platform_user_id) REFERENCES platform_users(id)
FK(updated_by_platform_user_id) REFERENCES platform_users(id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## product_option_template_values

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `option_template_id` | uuid | FK NOT NULL | References product_option_templates(id). |
| `value_code` | varchar(80) | NOT NULL UNIQUE | Template value code within option template. |
| `value_name` | varchar(150) | NOT NULL | Value display name. |
| `display_name` | varchar(150) | NULL | Optional UI display name. |
| `color_hex` | varchar(20) | NULL | Optional color value. |
| `image_url` | varchar(500) | NULL | Optional value image URL. |
| `sort_order` | int | NOT NULL DEFAULT 0 CHECK | Display order. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_platform_user_id` | uuid | FK NULL | References platform_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_platform_user_id` | uuid | FK NULL | References platform_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(option_template_id) REFERENCES product_option_templates(id)
FK(created_by_platform_user_id) REFERENCES platform_users(id)
FK(updated_by_platform_user_id) REFERENCES platform_users(id)
UNIQUE(option_template_id, value_code)
UNIQUE(option_template_id, id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## business_type_option_templates

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `business_type_id` | uuid | FK NOT NULL | References business_types(id). |
| `option_template_id` | uuid | FK NOT NULL | References product_option_templates(id). |
| `is_default_template` | boolean | NOT NULL DEFAULT false | Marks template as default for the business type. |
| `sort_order` | int | NOT NULL DEFAULT 0 CHECK | Display order. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_platform_user_id` | uuid | FK NULL | References platform_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_platform_user_id` | uuid | FK NULL | References platform_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(business_type_id) REFERENCES business_types(id)
FK(option_template_id) REFERENCES product_option_templates(id)
FK(created_by_platform_user_id) REFERENCES platform_users(id)
FK(updated_by_platform_user_id) REFERENCES platform_users(id)
UNIQUE(business_type_id, option_template_id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## product_options

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `product_id` | uuid | FK NOT NULL | References products(id). |
| `source_option_template_id` | uuid | FK NULL | Optional source template copied from product_option_templates(id). |
| `option_code` | varchar(80) | NOT NULL UNIQUE | Tenant product option code. |
| `option_name` | varchar(150) | NOT NULL | Product option display name. |
| `option_type` | varchar(40) | NOT NULL CHECK | Logical ERD type: product_option_type. |
| `input_type` | varchar(40) | NOT NULL CHECK | Logical ERD type: product_option_input_type. |
| `is_required` | boolean | NOT NULL DEFAULT true | Whether option is required. |
| `sort_order` | int | NOT NULL DEFAULT 0 CHECK | Display order. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_id) REFERENCES products(id)
FK(source_option_template_id) REFERENCES product_option_templates(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, option_code)
UNIQUE(tenant_id, product_id, id)
UNIQUE(tenant_id, id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## product_option_values

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `product_option_id` | uuid | FK NOT NULL | References product_options(id). |
| `source_option_template_value_id` | uuid | FK NULL | Optional source template value copied from product_option_template_values(id). |
| `value_code` | varchar(80) | NOT NULL UNIQUE | Value code within product option. |
| `value_name` | varchar(150) | NOT NULL | Value name. |
| `display_name` | varchar(150) | NULL | Optional UI display name. |
| `color_hex` | varchar(30) | NULL | Optional color value. |
| `image_url` | varchar(500) | NULL | Optional value image URL. |
| `sort_order` | int | NOT NULL DEFAULT 0 CHECK | Display order. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_option_id) REFERENCES product_options(id)
FK(source_option_template_value_id) REFERENCES product_option_template_values(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_option_id, value_code)
UNIQUE(tenant_id, product_option_id, id)
UNIQUE(tenant_id, id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## product_variant_option_values

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `product_id` | uuid | FK NOT NULL | References products(id). |
| `product_variant_id` | uuid | FK NOT NULL | References product_variants(id). |
| `product_option_id` | uuid | FK NOT NULL | References product_options(id). |
| `product_option_value_id` | uuid | FK NOT NULL | References product_option_values(id). |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(product_option_id) REFERENCES product_options(id)
FK(product_option_value_id) REFERENCES product_option_values(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_variant_id, product_option_id)
Full duplicate variant-combination prevention is enforced via product_variants.option_combination_hash.
```

