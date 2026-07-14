<!-- title: Discount & Expiry Discount Management -->
<!-- status: ERD aligned -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-13 -->
<!-- source: 15_Discount & Expiry Discount Management(1).png -->

# 15. Discount & Expiry Discount Management

## Purpose

This module defines discount types, tenant discount policies, policy outlet/channel targeting, product/category/brand/collection targets, flexible conditions, expiry discount rules, expiry tiers, and applied expiry discounts per batch and outlet.

## Entity Tables

| No | Table | Purpose |
|---|---|---|
| 1 | `discount_types` | System discount calculation/type catalog. |
| 2 | `discount_policies` | Tenant discount policy header and core rules. |
| 3 | `discount_policy_outlets` | Outlet targeting for discount policies. |
| 4 | `discount_policy_channels` | Sales channel targeting for discount policies. |
| 5 | `discount_policy_targets` | Product/category/brand/collection include/exclude targets. |
| 6 | `discount_policy_conditions` | JSON condition rules grouped with AND/OR. |
| 7 | `expiry_discount_rules` | Expiry markdown rule linked to a discount policy. |
| 8 | `expiry_discount_rule_tiers` | Date-window tiers for expiry discounts. |
| 9 | `expiry_discount_applications` | Applied/approved expiry discount per product batch and outlet. |
| 10 | `pos_discount_authority_limits` | Per-user POS percentage and fixed-amount authority. |
| 11 | `pos_discount_applications` | Persistent POS cart discount request, approval, hash, and sale linkage. |
| 12 | `pos_discount_application_events` | Append-only POS discount lifecycle audit. |

## POS Runtime Discount Extension

`pos_discount_authority_limits` is unique by `(tenant_id, tenant_user_id)` and
stores `max_percentage`, `max_fixed_amount`, `currency_code`, and lifecycle status.

`pos_discount_applications` snapshots tenant/outlet/till/session/device/requester,
policy/type, calculation method, requested/cashier/absolute values, cart and eligible
subtotals, discount outcome, currency, canonical cart JSON, SHA-256 cart hash,
idempotency key, approval decision, expiry, and final sales-order linkage. Status is
one of `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `EXPIRED`, `APPLIED`, `CANCELLED`.

`pos_discount_application_events` is append-only and records requester/manager actor,
from/to status, event type, note, and occurrence time.

2026-07-13 implementation note:

- No new discount schema objects were required.
- Development POS seed data includes internal manual policies for order percentage,
  order fixed amount, line percentage, and line fixed amount. These rows are
  policy configuration, not user-entered request data.
- Development POS seed data also includes one predefined line policy targeting
  the seeded team jersey product variant for runtime line-discount verification.
- POS policy matching reads `discount_policy_targets` for `PRODUCT`, `PRODUCT_VARIANT`, `CATEGORY`, `BRAND`, and `COLLECTION`.
- Target matching is tenant-scoped and derives catalog relationships from backend product tables.
- `discount_policy_conditions` active rows are fail-closed. POS runtime supports minimum amount, minimum quantity, and customer-required conditions; unsupported condition types are not treated as eligible.
- Admin policy create/update writes policies as `INACTIVE` until activated, matching the existing `ACTIVE`/`INACTIVE`/`DELETED` status constraint.
- Cancellation changes `pos_discount_applications.application_status` to `CANCELLED` and appends a `pos_discount_application_events` row.

## Reference Entities

`products`, `product_variants`, `categories`, `brands`, `collections`, `outlets`, `sales_channels`, `currencies`, `tenant_users`, `product_batches`

## discount_types

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `discount_type_code` | varchar(80) | NOT NULL UNIQUE | System-unique discount type code. |
| `discount_type_name` | varchar(150) | NOT NULL | Display name. |
| `calculation_method` | varchar(40) | NOT NULL CHECK | Calculation method. |
| `is_system_type` | boolean | NOT NULL | System-defined flag. |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
UNIQUE(discount_type_code)
CHECK(calculation_method IN ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_ITEM', 'PRICE_OVERRIDE'))
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## discount_policies

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `discount_type_id` | uuid | FK NOT NULL | References discount_types(id). |
| `discount_policy_code` | varchar(80) | NOT NULL UNIQUE | Tenant-unique policy code. |
| `discount_policy_name` | varchar(150) | NOT NULL | Policy name. |
| `description` | text | NULL | Optional description. |
| `discount_scope` | varchar(40) | NOT NULL CHECK | Discount scope. |
| `discount_value` | numeric(18,4) | NOT NULL CHECK | Discount value. |
| `currency_code` | char(3) | FK NULL | References currencies(currency_code). |
| `max_discount_amount` | numeric(18,4) | NULL CHECK | Maximum discount amount. |
| `min_order_amount` | numeric(18,4) | NULL CHECK | Minimum order amount. |
| `min_quantity` | numeric(18,4) | NULL CHECK | Minimum quantity. |
| `requires_manager_approval` | boolean | NOT NULL | Manager approval flag. |
| `is_stackable` | boolean | NOT NULL | Stackable flag. |
| `stacking_group_code` | varchar(80) | NULL | Stacking group code. |
| `priority` | int | NOT NULL CHECK | Priority order. |
| `starts_at` | timestamptz | NULL CHECK | Start timestamp. |
| `ends_at` | timestamptz | NULL CHECK | End timestamp. |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(discount_type_id) REFERENCES discount_types(id)
FK(currency_code) REFERENCES currencies(currency_code)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, discount_policy_code)
CHECK(discount_scope IN ('ORDER', 'LINE', 'PRODUCT', 'CATEGORY', 'BRAND', 'COLLECTION', 'BATCH'))
CHECK(discount_value >= 0)
CHECK(max_discount_amount IS NULL OR max_discount_amount >= 0)
CHECK(min_order_amount IS NULL OR min_order_amount >= 0)
CHECK(min_quantity IS NULL OR min_quantity > 0)
CHECK(priority >= 0)
CHECK(ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## discount_policy_outlets

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `discount_policy_id` | uuid | FK NOT NULL | References discount_policies(id). |
| `outlet_id` | uuid | FK NOT NULL | References outlets(id). |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
FK(outlet_id) REFERENCES outlets(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, discount_policy_id, outlet_id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## discount_policy_channels

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `discount_policy_id` | uuid | FK NOT NULL | References discount_policies(id). |
| `sales_channel_id` | uuid | FK NOT NULL | References sales_channels(id). |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, discount_policy_id, sales_channel_id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## discount_policy_targets

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `discount_policy_id` | uuid | FK NOT NULL | References discount_policies(id). |
| `target_type` | varchar(40) | NOT NULL CHECK | Target type. |
| `target_mode` | varchar(40) | NOT NULL CHECK | INCLUDE or EXCLUDE target mode. |
| `product_id` | uuid | FK NULL | References products(id). |
| `product_variant_id` | uuid | FK NULL | References product_variants(id). |
| `category_id` | uuid | FK NULL | References categories(id). |
| `brand_id` | uuid | FK NULL | References brands(id). |
| `collection_id` | uuid | FK NULL | References collections(id). |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(category_id) REFERENCES categories(id)
FK(brand_id) REFERENCES brands(id)
FK(collection_id) REFERENCES collections(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(target_mode IN ('INCLUDE', 'EXCLUDE'))
CHECK(target_type IN ('PRODUCT', 'PRODUCT_VARIANT', 'CATEGORY', 'BRAND', 'COLLECTION'))
One target per row based on target_type.
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## discount_policy_conditions

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `discount_policy_id` | uuid | FK NOT NULL | References discount_policies(id). |
| `condition_group_no` | int | NOT NULL CHECK | Condition group number. |
| `group_operator` | varchar(40) | NOT NULL CHECK | Group operator. |
| `condition_type` | varchar(40) | NOT NULL CHECK | Condition type. |
| `condition_operator` | varchar(40) | NOT NULL CHECK | Condition operator. |
| `condition_value_json` | jsonb | NOT NULL | Condition value JSON. |
| `sort_order` | int | NOT NULL CHECK | Display/calculation order. |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(condition_group_no > 0)
CHECK(group_operator IN ('AND', 'OR'))
CHECK(sort_order >= 0)
Conditions grouped with AND / OR.
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## expiry_discount_rules

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `discount_policy_id` | uuid | FK NOT NULL | References discount_policies(id). |
| `rule_code` | varchar(80) | NOT NULL UNIQUE | Tenant-unique expiry rule code. |
| `rule_name` | varchar(150) | NOT NULL | Rule display name. |
| `description` | text | NULL | Optional description. |
| `requires_manager_approval` | boolean | NOT NULL | Manager approval flag. |
| `is_auto_apply` | boolean | NOT NULL | Auto-apply flag. |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, rule_code)
Linked to discount policy for scope targeting; targets, outlets, and channels are reused from discount policy.
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## expiry_discount_rule_tiers

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `expiry_discount_rule_id` | uuid | FK NOT NULL | References expiry_discount_rules(id). |
| `tier_name` | varchar(120) | NULL | Optional tier name. |
| `starts_days_before_expiry` | int | NOT NULL CHECK | Start window in days before expiry. |
| `ends_days_before_expiry` | int | NOT NULL CHECK | End window in days before expiry. |
| `discount_percent` | numeric(8,4) | NOT NULL CHECK | Discount percentage. |
| `sort_order` | int | NOT NULL CHECK | Display/calculation order. |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(expiry_discount_rule_id) REFERENCES expiry_discount_rules(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(starts_days_before_expiry >= 0)
CHECK(ends_days_before_expiry >= 0)
CHECK(starts_days_before_expiry >= ends_days_before_expiry)
CHECK(discount_percent >= 0)
CHECK(discount_percent <= 100)
CHECK(sort_order >= 0)
Tier date windows must not overlap for the same expiry_discount_rule_id.
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## expiry_discount_applications

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `expiry_discount_rule_id` | uuid | FK NOT NULL | References expiry_discount_rules(id). |
| `expiry_discount_rule_tier_id` | uuid | FK NOT NULL | References expiry_discount_rule_tiers(id). |
| `product_batch_id` | uuid | FK NOT NULL | References product_batches(id). |
| `outlet_id` | uuid | FK NOT NULL | References outlets(id). |
| `discount_percent` | numeric(8,4) | NOT NULL CHECK | Applied discount percentage. |
| `application_source` | varchar(40) | NOT NULL CHECK | Application source. |
| `application_status` | varchar(30) | NOT NULL CHECK | Application lifecycle status. |
| `applied_from` | timestamptz | NOT NULL CHECK | Applied start timestamp. |
| `applied_until` | timestamptz | NULL CHECK | Applied end timestamp. |
| `approved_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `approved_at` | timestamptz | NULL | Approval timestamp. |
| `approval_note` | text | NULL | Approval note. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(expiry_discount_rule_id) REFERENCES expiry_discount_rules(id)
FK(expiry_discount_rule_tier_id) REFERENCES expiry_discount_rule_tiers(id)
FK(product_batch_id) REFERENCES product_batches(id)
FK(outlet_id) REFERENCES outlets(id)
FK(approved_by_tenant_user_id) REFERENCES tenant_users(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_batch_id, outlet_id) WHERE application_status = 'ACTIVE'
CHECK(discount_percent >= 0)
CHECK(discount_percent <= 100)
CHECK(applied_until IS NULL OR applied_until >= applied_from)
CHECK(application_status IN ('ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED', 'DELETED'))
```

