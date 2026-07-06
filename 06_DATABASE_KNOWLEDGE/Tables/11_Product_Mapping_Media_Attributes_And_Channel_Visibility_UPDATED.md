<!-- title: Product Mapping, Media, Attributes & Channel Visibility -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-05 -->
<!-- source: Updated from uploaded ERD image: 11_Product Mapping, Media, Attributes & Channel Visibility(3).png -->

# 11. Product Mapping, Media, Attributes & Channel Visibility

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for the Product Mapping, Media, Attributes & Channel Visibility module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Entity tables, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD. Enum/domain datatypes from the ERD are written as `varchar(40)` with CHECK constraints where applicable.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `product_categories` | Maps products to categories and marks a primary category. |
| `product_collections` | Maps products to collections. |
| `product_images` | Stores product/variant images by optional sales channel. |
| `product_barcodes` | Stores product/variant barcodes by optional UOM. |
| `product_attribute_definitions` | Defines tenant product attributes. |
| `product_attribute_options` | Defines selectable options for option/list attributes. |
| `product_attribute_values` | Stores product/variant attribute values. |
| `product_attribute_value_options` | Maps multi/select attribute values to selected options. |
| `product_channel_visibility` | Controls product/variant visibility and orderability per sales channel. |

## `product_categories`

Purpose: Maps products to categories and marks a primary category.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `category_id` | uuid | FK | NOT NULL | References categories(id) |
| `is_primary_category` | boolean |  | NOT NULL DEFAULT false | Primary category flag |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `created_at` | timestamp |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamp |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
FK(tenant_id, category_id) REFERENCES categories(tenant_id, id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, category_id)
UNIQUE(tenant_id, product_id) WHERE is_primary_category = true
CHECK(sort_order >= 0)
```

## `product_collections`

Purpose: Maps products to collections.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `collection_id` | uuid | FK | NOT NULL | References collections(id) |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `created_at` | timestamp |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamp |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
FK(tenant_id, collection_id) REFERENCES collections(tenant_id, id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, collection_id)
CHECK(sort_order >= 0)
```

## `product_images`

Purpose: Stores product/variant images by optional sales channel.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `product_variant_id` | uuid | FK | NULL | References product_variants(id) |
| `sales_channel_id` | uuid | FK | NULL | References sales_channels(id) |
| `image_storage_key` | varchar(500) |  | NOT NULL | Storage key/path |
| `image_url` | varchar(500) |  | NULL | Public image URL |
| `alt_text` | varchar(255) |  | NULL | Alt text |
| `image_purpose` | varchar(40) |  | NOT NULL | Image purpose |
| `mime_type` | varchar(100) |  | NULL | MIME type |
| `file_size_bytes` | bigint |  | NULL | File size in bytes |
| `width_px` | int |  | NULL | Image width |
| `height_px` | int |  | NULL | Image height |
| `checksum_hash` | varchar(128) |  | NULL | Checksum/hash |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `is_primary_image` | boolean |  | NOT NULL DEFAULT false | Primary image flag |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamp |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamp |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
FK(tenant_id, product_variant_id) REFERENCES product_variants(tenant_id, id)
FK(sales_channel_id) REFERENCES sales_channels(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(sort_order >= 0)
One primary image per scope: product global, product channel, variant global, or variant channel.
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `product_barcodes`

Purpose: Stores product/variant barcodes by optional UOM.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `product_variant_id` | uuid | FK | NULL | References product_variants(id) |
| `barcode` | varchar(100) |  | NOT NULL | Barcode value |
| `barcode_type` | varchar(40) |  | NOT NULL | Barcode type |
| `uom_id` | uuid | FK | NULL | References unit_of_measures(id) |
| `quantity_per_scan` | numeric(18,4) |  | NOT NULL | Quantity represented by one scan |
| `is_primary_barcode` | boolean |  | NOT NULL DEFAULT false | Primary barcode flag |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamp |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamp |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
FK(tenant_id, product_variant_id) REFERENCES product_variants(tenant_id, id)
FK(tenant_id, uom_id) REFERENCES unit_of_measures(tenant_id, id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, barcode)
CHECK(quantity_per_scan > 0)
One primary barcode per product / variant.
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `product_attribute_definitions`

Purpose: Defines tenant product attributes.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `attribute_key` | varchar(80) |  | NOT NULL | Tenant-scoped attribute key |
| `attribute_name` | varchar(150) |  | NOT NULL | Display name |
| `attribute_type` | varchar(40) |  | NOT NULL | Attribute type |
| `default_uom_id` | uuid | FK | NULL | References unit_of_measures(id) |
| `is_filterable` | boolean |  | NOT NULL DEFAULT false | Filterable flag |
| `is_searchable` | boolean |  | NOT NULL DEFAULT false | Searchable flag |
| `is_required` | boolean |  | NOT NULL DEFAULT false | Required flag |
| `applies_to` | varchar(40) |  | NOT NULL | Attribute applies-to scope |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamp |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamp |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, default_uom_id) REFERENCES unit_of_measures(tenant_id, id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, attribute_key)
UNIQUE(tenant_id, id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `product_attribute_options`

Purpose: Defines selectable options for option/list attributes.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `attribute_definition_id` | uuid | FK | NOT NULL | References product_attribute_definitions(id) |
| `option_code` | varchar(80) |  | NOT NULL | Option code |
| `option_label` | varchar(150) |  | NOT NULL | Option label |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamp |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamp |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, attribute_definition_id) REFERENCES product_attribute_definitions(tenant_id, id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, attribute_definition_id, option_code)
UNIQUE(tenant_id, attribute_definition_id, id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `product_attribute_values`

Purpose: Stores product/variant attribute values.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `product_variant_id` | uuid | FK | NULL | References product_variants(id) |
| `attribute_definition_id` | uuid | FK | NOT NULL | References product_attribute_definitions(id) |
| `attribute_value_text` | text |  | NULL | Text value |
| `attribute_value_number` | numeric(18,6) |  | NULL | Number value |
| `attribute_value_boolean` | boolean |  | NULL | Boolean value |
| `attribute_value_date` | date |  | NULL | Date value |
| `attribute_value_uom_id` | uuid | FK | NULL | References unit_of_measures(id) |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamp |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamp |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
FK(tenant_id, product_variant_id) REFERENCES product_variants(tenant_id, id)
FK(tenant_id, attribute_definition_id) REFERENCES product_attribute_definitions(tenant_id, id)
FK(tenant_id, attribute_value_uom_id) REFERENCES unit_of_measures(tenant_id, id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, attribute_definition_id) WHERE product_variant_id IS NULL
UNIQUE(tenant_id, product_variant_id, attribute_definition_id) WHERE product_variant_id IS NOT NULL
CHECK(num_nonnulls(attribute_value_text, attribute_value_number, attribute_value_boolean, attribute_value_date) <= 1)
CHECK(attribute_value_uom_id IS NULL OR attribute_value_number IS NOT NULL)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `product_attribute_value_options`

Purpose: Maps multi/select attribute values to selected options.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_attribute_value_id` | uuid | FK | NOT NULL | References product_attribute_values(id) |
| `attribute_definition_id` | uuid | FK | NOT NULL | References product_attribute_definitions(id) |
| `attribute_option_id` | uuid | FK | NOT NULL | References product_attribute_options(id) |
| `created_at` | timestamp |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_attribute_value_id, attribute_definition_id) REFERENCES product_attribute_values(tenant_id, id, attribute_definition_id)
FK(tenant_id, attribute_definition_id, attribute_option_id) REFERENCES product_attribute_options(tenant_id, attribute_definition_id, id)
UNIQUE(tenant_id, product_attribute_value_id, attribute_option_id)
```

## `product_channel_visibility`

Purpose: Controls product/variant visibility and orderability per sales channel.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `product_variant_id` | uuid | FK | NULL | References product_variants(id) |
| `sales_channel_id` | uuid | FK | NOT NULL | References sales_channels(id) |
| `is_visible` | boolean |  | NOT NULL DEFAULT true | Visibility flag |
| `is_orderable` | boolean |  | NOT NULL DEFAULT true | Orderable flag |
| `available_from` | timestamp |  | NULL | Availability start |
| `available_until` | timestamp |  | NULL | Availability end |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamp |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamp |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
FK(tenant_id, product_variant_id) REFERENCES product_variants(tenant_id, id)
FK(sales_channel_id) REFERENCES sales_channels(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, sales_channel_id) WHERE product_variant_id IS NULL
UNIQUE(tenant_id, product_variant_id, sales_channel_id) WHERE product_variant_id IS NOT NULL
CHECK(available_until IS NULL OR available_from IS NULL OR available_until >= available_from)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK, tenant_code varchar(100), domain varchar(200), status varchar(20) | Tenant reference |
| `tenant_users` | id uuid PK, tenant_id uuid FK, email varchar(255), full_name varchar(255), status varchar(20) | User/audit reference |
| `products` | id uuid PK, tenant_id uuid FK, product_code varchar(80), product_name varchar(200), status varchar(20) | Product reference |
| `product_variants` | id uuid PK, tenant_id uuid FK, product_id uuid FK, variant_code varchar(80), sku varchar(100), status varchar(20) | Variant reference |
| `categories` | id uuid PK, tenant_id uuid FK, department_id uuid FK, category_code varchar(80), category_name varchar(150), status varchar(20) | Category reference |
| `collections` | id uuid PK, tenant_id uuid FK, collection_code varchar(80), collection_name varchar(150), status varchar(20) | Collection reference |
| `unit_of_measures` | id uuid PK, uom_code varchar(30), uom_name varchar(100), uom_type varchar(40), status varchar(20) | UOM reference |
| `sales_channels` | id uuid PK, channel_code varchar(50), channel_name varchar(100), status varchar(20) | Sales channel reference |

## Module Notes

- Tenant-owned tables include `tenant_id` for data isolation.
- Product images support product-level, variant-level, channel-level, and variant-channel level scopes.
- Product attribute values allow only one scalar value type per row unless options are used through `product_attribute_value_options`.

## Related Files

- [[10_Catalog_Master_Data_And_Product_Core]]
- [[12_Product_Option_Templates_And_Variant_Configuration]]
- [[14_Pricing_And_Tax_Management]]
