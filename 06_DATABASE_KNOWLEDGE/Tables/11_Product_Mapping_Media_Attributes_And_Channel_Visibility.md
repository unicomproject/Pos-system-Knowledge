<!-- title: Product Mapping, Media, Attributes & Channel Visibility -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 11. Product Mapping, Media, Attributes & Channel Visibility

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `product_categories` | Stores product categories records for this module. |
| `product_collections` | Stores product collections records for this module. |
| `product_images` | Stores product images records for this module. |
| `product_barcodes` | Stores product barcodes records for this module. |
| `product_attribute_definitions` | Stores product attribute definitions records for this module. |
| `product_attribute_options` | Stores product attribute options records for this module. |
| `product_attribute_values` | Stores product attribute values records for this module. |
| `product_attribute_value_options` | Stores product attribute value options records for this module. |
| `product_channel_visibility` | Stores product channel visibility records for this module. |

## product_categories

Module: Product Mapping, Media, Attributes & Channel Visibility

Purpose: Stores product categories records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| category_id | uuid | FK NOT UNIQUE | References `categories(id)`. Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(category_id) REFERENCES categories(id)
UNIQUE(product_id, category_id)
```

## product_collections

Module: Product Mapping, Media, Attributes & Channel Visibility

Purpose: Stores product collections records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| collection_id | uuid | FK NOT UNIQUE | References `collections(id)`. Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(collection_id) REFERENCES collections(id)
UNIQUE(product_id, collection_id)
```

## product_images

Module: Product Mapping, Media, Attributes & Channel Visibility

Purpose: Stores product images records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| image_url | varchar(255) | UNIQUE | Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| sort_order | integer | CHECK | CHECK(sort_order >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
CHECK(sort_order >= 0)
UNIQUE(product_id, image_url)
```

## product_barcodes

Module: Product Mapping, Media, Attributes & Channel Visibility

Purpose: Stores product barcodes records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| barcode_value | varchar(255) | UNIQUE | Unique business key. |
| product_id | uuid | FK NOT | References `products(id)`. |
| product_variant_id | uuid | FK NULL | References `product_variants(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
UNIQUE(tenant_id, barcode_value)
```

## product_attribute_definitions

Module: Product Mapping, Media, Attributes & Channel Visibility

Purpose: Stores product attribute definitions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| attribute_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, attribute_code)
```

## product_attribute_options

Module: Product Mapping, Media, Attributes & Channel Visibility

Purpose: Stores product attribute options records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| attribute_definition_id | uuid | FK NOT UNIQUE | References `product_attribute_definitions(id)`. Unique business key. |
| option_code | varchar(80) | UNIQUE | Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(attribute_definition_id) REFERENCES product_attribute_definitions(id)
UNIQUE(attribute_definition_id, option_code)
```

## product_attribute_values

Module: Product Mapping, Media, Attributes & Channel Visibility

Purpose: Stores product attribute values records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| attribute_definition_id | uuid | FK NOT UNIQUE | References `product_attribute_definitions(id)`. Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(attribute_definition_id) REFERENCES product_attribute_definitions(id)
UNIQUE(product_id, attribute_definition_id)
```

## product_attribute_value_options

Module: Product Mapping, Media, Attributes & Channel Visibility

Purpose: Stores product attribute value options records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| attribute_option_id | uuid | FK NOT UNIQUE | References `product_attribute_options(id)`. Unique business key. |
| product_attribute_value_id | uuid | FK NOT UNIQUE | References `product_attribute_values(id)`. Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_attribute_value_id) REFERENCES product_attribute_values(id)
FK(attribute_option_id) REFERENCES product_attribute_options(id)
UNIQUE(product_attribute_value_id, attribute_option_id)
```

## product_channel_visibility

Module: Product Mapping, Media, Attributes & Channel Visibility

Purpose: Stores product channel visibility records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| sales_channel_id | uuid | FK NOT UNIQUE | References `sales_channels(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
UNIQUE(product_id, sales_channel_id)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
