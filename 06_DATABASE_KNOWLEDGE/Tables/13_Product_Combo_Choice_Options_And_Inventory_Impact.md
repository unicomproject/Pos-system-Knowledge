<!-- title: Product Combo, Choice Options & Inventory Impact -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 13. Product Combo, Choice Options & Inventory Impact

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `combo_definitions` | Stores combo definitions records for this module. |
| `combo_components` | Stores combo components records for this module. |
| `combo_groups` | Stores combo groups records for this module. |
| `combo_group_items` | Stores combo group items records for this module. |
| `choice_groups` | Stores choice groups records for this module. |
| `choice_options` | Stores choice options records for this module. |
| `product_choice_groups` | Stores product choice groups records for this module. |
| `product_choice_options` | Stores product choice options records for this module. |
| `choice_option_inventory_impacts` | Stores choice option inventory impacts records for this module. |

## combo_definitions

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores combo definitions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| combo_code | varchar(80) | UNIQUE | Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
UNIQUE(tenant_id, product_id, combo_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## combo_components

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores combo components records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| combo_definition_id | uuid | FK NOT UNIQUE | References `combo_definitions(id)`. Unique business key. |
| component_product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| component_variant_id | uuid | UNIQUE | Unique business key. |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(combo_definition_id) REFERENCES combo_definitions(id)
FK(component_product_id) REFERENCES products(id)
CHECK(quantity > 0)
UNIQUE(combo_definition_id, component_product_id, component_variant_id)
```

## combo_groups

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores combo groups records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| combo_definition_id | uuid | FK NOT UNIQUE | References `combo_definitions(id)`. Unique business key. |
| group_code | varchar(80) | UNIQUE | Unique business key. |
| max_select | integer | CHECK | CHECK(max_select >= min_select) |
| min_select | integer | CHECK | CHECK(min_select >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(combo_definition_id) REFERENCES combo_definitions(id)
CHECK(min_select >= 0)
CHECK(max_select >= min_select)
UNIQUE(combo_definition_id, group_code)
```

## combo_group_items

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores combo group items records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| combo_group_id | uuid | FK NOT UNIQUE | References `combo_groups(id)`. Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| product_variant_id | uuid | UNIQUE | Unique business key. |
| sort_order | integer | CHECK | CHECK(sort_order >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(combo_group_id) REFERENCES combo_groups(id)
FK(product_id) REFERENCES products(id)
CHECK(sort_order >= 0)
UNIQUE(combo_group_id, product_id, product_variant_id)
```

## choice_groups

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores choice groups records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| choice_group_code | varchar(80) | UNIQUE | Unique business key. |
| max_select | integer | CHECK | CHECK(max_select >= min_select) |
| min_select | integer | CHECK | CHECK(min_select >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, choice_group_code)
CHECK(min_select >= 0)
CHECK(max_select >= min_select)
```

## choice_options

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores choice options records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| choice_group_id | uuid | FK NOT UNIQUE | References `choice_groups(id)`. Unique business key. |
| option_code | varchar(80) | UNIQUE | Unique business key. |
| sort_order | integer | CHECK | CHECK(sort_order >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(choice_group_id) REFERENCES choice_groups(id)
UNIQUE(choice_group_id, option_code)
CHECK(sort_order >= 0)
```

## product_choice_groups

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores product choice groups records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| choice_group_id | uuid | FK NOT UNIQUE | References `choice_groups(id)`. Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(choice_group_id) REFERENCES choice_groups(id)
UNIQUE(product_id, choice_group_id)
```

## product_choice_options

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores product choice options records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| choice_option_id | uuid | FK NOT UNIQUE | References `choice_options(id)`. Unique business key. |
| product_choice_group_id | uuid | FK NOT UNIQUE | References `product_choice_groups(id)`. Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_choice_group_id) REFERENCES product_choice_groups(id)
FK(choice_option_id) REFERENCES choice_options(id)
UNIQUE(product_choice_group_id, choice_option_id)
```

## choice_option_inventory_impacts

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores choice option inventory impacts records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| ingredient_product_id | uuid | FK NOT | References `products(id)`. |
| product_choice_option_id | uuid | FK NOT | References `product_choice_options(id)`. |
| quantity_delta | numeric(18,4) | CHECK | CHECK(quantity_delta <> 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(product_choice_option_id) REFERENCES product_choice_options(id)
FK(ingredient_product_id) REFERENCES products(id)
CHECK(quantity_delta <> 0)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
