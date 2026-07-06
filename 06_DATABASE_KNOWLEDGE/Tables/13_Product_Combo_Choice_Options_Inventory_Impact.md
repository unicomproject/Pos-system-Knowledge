<!-- title: Product Combo, Choice Options & Inventory Impact -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->
<!-- source: Uploaded ERD Image: 13_Product Combo, Choice Options & Inventory Impact -->

# 13. Product Combo, Choice Options & Inventory Impact

## Purpose

This file documents the database tables and attributes for the **Product Combo, Choice Options & Inventory Impact** module.

This module handles:

- Fixed combo definitions and fixed components.
- Configurable combo groups and selectable combo group items.
- Reusable choice groups and choice options.
- Product-specific choice configuration.
- Inventory impact caused by selected choice options.

## Important Design Rules

- Custom enum/database enum types are not used in this document.
- Status/type columns are written as `varchar(40)` and must be controlled by `CHECK(...)` constraints or backend constants.
- All tenant-owned tables include `tenant_id` for tenant data isolation.
- Product variant references must belong to the same product where applicable.
- No duplicate combo, group, choice, or inventory impact rows should be allowed.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `combo_definitions` | Defines combo products or variant-specific combo definitions. |
| `combo_components` | Stores fixed components included in a combo. |
| `combo_groups` | Stores configurable groups inside a combo. |
| `combo_group_items` | Stores selectable items inside configurable combo groups. |
| `choice_groups` | Stores reusable choice groups. |
| `choice_options` | Stores options under reusable choice groups. |
| `product_choice_groups` | Applies reusable choice groups to products or variants. |
| `product_choice_options` | Configures choice options available for a product choice group. |
| `choice_option_inventory_impacts` | Defines inventory deduction/impact caused by selected choice options. |

## combo_definitions

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Defines combo configuration for a product or a specific product variant.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK NOT NULL | Primary key. |
| tenant_id | uuid | FK NOT NULL | References `tenants(id)`. |
| product_id | uuid | FK NOT NULL | References `products(id)`. Combo parent product. |
| product_variant_id | uuid | FK NULL | References `product_variants(id)`. Variant-specific combo definition. |
| combo_code | varchar(80) | NOT NULL | Combo business code. |
| combo_name | varchar(200) | NOT NULL | Combo display name. |
| pricing_mode | varchar(40) | NOT NULL | Combo pricing mode. |
| inventory_deduction_mode | varchar(40) | NOT NULL | Inventory deduction mode for the combo. |
| status | varchar(40) | NOT NULL | Record lifecycle status. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| created_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| updated_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, combo_code) WHERE product_variant_id IS NULL
UNIQUE(tenant_id, product_variant_id, combo_code) WHERE product_variant_id IS NOT NULL
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
-- One active combo definition per product or per variant must be enforced by partial unique index/business rule.
-- If product_variant_id is present, it must belong to product_id.
```

## combo_components

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores fixed products/variants that are always included in a combo.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK NOT NULL | Primary key. |
| tenant_id | uuid | FK NOT NULL | References `tenants(id)`. |
| combo_definition_id | uuid | FK NOT NULL | References `combo_definitions(id)`. |
| component_product_id | uuid | FK NOT NULL | References `products(id)`. Fixed component product. |
| component_variant_id | uuid | FK NULL | References `product_variants(id)`. Fixed component variant. |
| component_uom_id | uuid | FK NOT NULL | References `unit_of_measures(id)`. |
| quantity | numeric(18,4) | NOT NULL | Component quantity. |
| base_price_adjustment | numeric(18,4) | NOT NULL DEFAULT 0 | Price adjustment for this component. |
| sort_order | int | NOT NULL DEFAULT 0 | Display order. |
| status | varchar(40) | NOT NULL | Record lifecycle status. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| created_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| updated_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(combo_definition_id) REFERENCES combo_definitions(id)
FK(component_product_id) REFERENCES products(id)
FK(component_variant_id) REFERENCES product_variants(id)
FK(component_uom_id) REFERENCES unit_of_measures(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(combo_definition_id, component_product_id, component_uom_id) WHERE component_variant_id IS NULL
UNIQUE(combo_definition_id, component_variant_id, component_uom_id) WHERE component_variant_id IS NOT NULL
CHECK(quantity > 0)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
-- If component_variant_id is present, it must belong to component_product_id.
```

## combo_groups

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores configurable choice groups inside a combo definition.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK NOT NULL | Primary key. |
| tenant_id | uuid | FK NOT NULL | References `tenants(id)`. |
| combo_definition_id | uuid | FK NOT NULL | References `combo_definitions(id)`. |
| group_code | varchar(80) | NOT NULL | Combo group business code. |
| group_name | varchar(150) | NOT NULL | Combo group display name. |
| min_select | int | NOT NULL DEFAULT 0 | Minimum selectable item count. |
| max_select | int | NOT NULL | Maximum selectable item count. |
| sort_order | int | NOT NULL DEFAULT 0 | Display order. |
| status | varchar(40) | NOT NULL | Record lifecycle status. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| created_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| updated_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(combo_definition_id) REFERENCES combo_definitions(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, combo_definition_id, group_code)
CHECK(min_select >= 0)
CHECK(max_select > 0)
CHECK(max_select >= min_select)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## combo_group_items

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores selectable products/variants inside configurable combo groups.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK NOT NULL | Primary key. |
| tenant_id | uuid | FK NOT NULL | References `tenants(id)`. |
| combo_group_id | uuid | FK NOT NULL | References `combo_groups(id)`. |
| item_product_id | uuid | FK NOT NULL | References `products(id)`. Selectable product item. |
| item_variant_id | uuid | FK NULL | References `product_variants(id)`. Selectable variant item. |
| item_uom_id | uuid | FK NOT NULL | References `unit_of_measures(id)`. |
| quantity | numeric(18,4) | NOT NULL | Item quantity. |
| base_price_adjustment | numeric(18,4) | NOT NULL DEFAULT 0 | Price adjustment for this item. |
| is_default_item | boolean | NOT NULL DEFAULT false | Indicates default item in the group. |
| sort_order | int | NOT NULL DEFAULT 0 | Display order. |
| status | varchar(40) | NOT NULL | Record lifecycle status. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| created_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| updated_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(combo_group_id) REFERENCES combo_groups(id)
FK(item_product_id) REFERENCES products(id)
FK(item_variant_id) REFERENCES product_variants(id)
FK(item_uom_id) REFERENCES unit_of_measures(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(combo_group_id, item_product_id, item_uom_id) WHERE item_variant_id IS NULL
UNIQUE(combo_group_id, item_variant_id, item_uom_id) WHERE item_variant_id IS NOT NULL
CHECK(quantity > 0)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
-- If item_variant_id is present, it must belong to item_product_id.
```

## choice_groups

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores reusable choice groups that can be applied to products or variants.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK NOT NULL | Primary key. |
| tenant_id | uuid | FK NOT NULL | References `tenants(id)`. |
| group_code | varchar(80) | NOT NULL | Choice group business code. |
| group_name | varchar(150) | NOT NULL | Choice group display name. |
| min_select | int | NOT NULL DEFAULT 0 | Minimum selectable option count. |
| max_select | int | NOT NULL | Maximum selectable option count. |
| sort_order | int | NOT NULL DEFAULT 0 | Display order. |
| status | varchar(40) | NOT NULL | Record lifecycle status. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| created_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| updated_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, group_code)
CHECK(min_select >= 0)
CHECK(max_select > 0)
CHECK(max_select >= min_select)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## choice_options

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Stores selectable options under a reusable choice group.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK NOT NULL | Primary key. |
| tenant_id | uuid | FK NOT NULL | References `tenants(id)`. |
| choice_group_id | uuid | FK NOT NULL | References `choice_groups(id)`. |
| option_code | varchar(80) | NOT NULL | Choice option business code. |
| option_name | varchar(150) | NOT NULL | Choice option display name. |
| default_price_adjustment | numeric(18,4) | NOT NULL DEFAULT 0 | Default price adjustment for this option. |
| sort_order | int | NOT NULL DEFAULT 0 | Display order. |
| status | varchar(40) | NOT NULL | Record lifecycle status. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| created_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| updated_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(choice_group_id) REFERENCES choice_groups(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, choice_group_id, option_code)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## product_choice_groups

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Applies reusable choice groups to a product or a specific product variant.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK NOT NULL | Primary key. |
| tenant_id | uuid | FK NOT NULL | References `tenants(id)`. |
| product_id | uuid | FK NOT NULL | References `products(id)`. |
| product_variant_id | uuid | FK NULL | References `product_variants(id)`. Variant-specific choice group. |
| choice_group_id | uuid | FK NOT NULL | References `choice_groups(id)`. |
| min_select_override | int | NULL | Product-specific minimum selection override. |
| max_select_override | int | NULL | Product-specific maximum selection override. |
| sort_order | int | NOT NULL DEFAULT 0 | Display order. |
| status | varchar(40) | NOT NULL | Record lifecycle status. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| created_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| updated_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(choice_group_id) REFERENCES choice_groups(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, choice_group_id) WHERE product_variant_id IS NULL
UNIQUE(tenant_id, product_variant_id, choice_group_id) WHERE product_variant_id IS NOT NULL
CHECK(min_select_override IS NULL OR min_select_override >= 0)
CHECK(max_select_override IS NULL OR max_select_override > 0)
CHECK(max_select_override IS NULL OR min_select_override IS NULL OR max_select_override >= min_select_override)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
-- If product_variant_id is present, it must belong to product_id.
```

## product_choice_options

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Configures which options are available under an applied product choice group.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK NOT NULL | Primary key. |
| tenant_id | uuid | FK NOT NULL | References `tenants(id)`. |
| product_choice_group_id | uuid | FK NOT NULL | References `product_choice_groups(id)`. |
| choice_group_id | uuid | FK NOT NULL | References `choice_groups(id)`. |
| choice_option_id | uuid | FK NOT NULL | References `choice_options(id)`. |
| price_adjustment_override | numeric(18,4) | NULL | Product-specific price adjustment override. |
| is_default_option | boolean | NOT NULL DEFAULT false | Indicates default option. |
| is_available | boolean | NOT NULL DEFAULT true | Indicates option availability for this product. |
| sort_order_override | int | NULL | Product-specific sort order override. |
| status | varchar(40) | NOT NULL | Record lifecycle status. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| created_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| updated_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_choice_group_id) REFERENCES product_choice_groups(id)
FK(choice_group_id) REFERENCES choice_groups(id)
FK(choice_option_id) REFERENCES choice_options(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_choice_group_id, choice_option_id)
CHECK(sort_order_override IS NULL OR sort_order_override >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
-- choice_option_id must belong to the same choice_group_id referenced by product_choice_group_id.
```

## choice_option_inventory_impacts

Module: Product Combo, Choice Options & Inventory Impact

Purpose: Defines inventory impact/deduction caused by selecting a product choice option.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK NOT NULL | Primary key. |
| tenant_id | uuid | FK NOT NULL | References `tenants(id)`. |
| product_choice_option_id | uuid | FK NOT NULL | References `product_choice_options(id)`. |
| impact_product_id | uuid | FK NOT NULL | References `products(id)`. Inventory product affected by this option. |
| impact_variant_id | uuid | FK NULL | References `product_variants(id)`. Inventory variant affected by this option. |
| impact_uom_id | uuid | FK NOT NULL | References `unit_of_measures(id)`. |
| inventory_effect_type | varchar(40) | NOT NULL | Inventory effect type. |
| quantity | numeric(18,4) | NOT NULL | Quantity affected. |
| status | varchar(40) | NOT NULL | Record lifecycle status. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| created_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| updated_by_tenant_user_id | uuid | FK NULL | References `tenant_users(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_choice_option_id) REFERENCES product_choice_options(id)
FK(impact_product_id) REFERENCES products(id)
FK(impact_variant_id) REFERENCES product_variants(id)
FK(impact_uom_id) REFERENCES unit_of_measures(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(product_choice_option_id, impact_product_id, impact_uom_id, inventory_effect_type) WHERE impact_variant_id IS NULL
UNIQUE(product_choice_option_id, impact_variant_id, impact_uom_id, inventory_effect_type) WHERE impact_variant_id IS NOT NULL
CHECK(quantity > 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
-- If impact_variant_id is present, it must belong to impact_product_id.
```

## Correct Relationships

```text
combo_definitions 1 -> many combo_components
combo_definitions 1 -> many combo_groups
combo_groups 1 -> many combo_group_items
choice_groups 1 -> many choice_options
choice_groups 1 -> many product_choice_groups
product_choice_groups 1 -> many product_choice_options
choice_options 1 -> many product_choice_options
product_choice_options 1 -> many choice_option_inventory_impacts
```

## External Reference Entities

```text
products
product_variants
tenants
tenant_users
unit_of_measures
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
