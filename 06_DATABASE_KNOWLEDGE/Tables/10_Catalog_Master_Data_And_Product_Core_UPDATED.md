<!-- title: Catalog Master Data & Product Core -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-11 -->
<!-- source: Updated from uploaded ERD image: 10_Catalog Master Data & Product Core(3).png -->
<!-- supersedes: current_setup_step_basic_details_first_semantics -->

# 10. Catalog Master Data & Product Core

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for the Catalog Master Data & Product Core module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Entity tables, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD. Enum/domain datatypes from the ERD are written as `varchar(40)` with CHECK constraints where applicable.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `business_types` | Stores system/product business type classifications. |
| `departments` | Stores tenant department master records. Remains for unrelated modules. **Not** part of TARGET Category Management (ADR 010). |
| `categories` | Stores tenant categories in a recursive parent/child hierarchy. **No Department relationship** (migration `20260827140000_DecoupleCategoryFromDepartment` applied). |
| `brands` | Stores tenant brand master records. |
| `collections` | Stores tenant product collections and effective date windows. |
| `unit_of_measures` | Stores global and tenant-specific unit of measure records. |
| `return_policies` | Stores tenant product return policy records. |
| `products` | Stores tenant product master records. |
| `product_setup_initial_tracking` | **EXISTING** 1:1 Product Setup draft for Initial Batch/Expiry/Serial collected on **CURRENT Step 3**. Migration evidence: `20260824095742_AddProductSetupInitialTracking`. **Not** scanner-first B1 scope. Live DB/E2E acceptance remains governed by [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/TENANT_ADMIN_PRODUCT_SETUP_INITIAL_TRACKING_PERMISSION_FIRST_IMPLEMENTATION_CLOSURE_2026-08-24]] — do not infer production acceptance from docs alone. |
| `product_setup_scan_context` | **IMPLEMENTED IN BACKEND SOURCE** — 1:1 Product Setup draft for Step 1 Scan Barcode acquisition/bootstrap context. Migration `20260912085454_AddProductSetupScannerIdentifierContext`. Local Postgres test DB applied; **production/shared apply not claimed**. Table ≠ B8 bootstrap logic. |
| `product_variants` | Stores sellable product variants. |
| `product_reviews` | Stores 1-5 star customer ratings and text reviews for products. |
| `product_rating_summaries` | Stores the aggregated rating summary for fast loading on product pages. |

## `business_types`

Purpose: Stores system/product business type classifications.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `business_type_key` | varchar(100) |  | NOT NULL | Unique system/business type key |
| `business_type_name` | varchar(150) |  | NOT NULL | Display name |
| `description` | text |  | NULL | Optional description |
| `is_system_type` | boolean |  | NOT NULL DEFAULT true | True for system supplied type |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |

Indexes / Constraints / Notes:

```text
PK(id)
UNIQUE(business_type_key)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `departments`

Purpose: Stores tenant department master records. Not part of TARGET Category Management (ADR 010). CURRENT Category runtime still FKs here until TARGET MIGRATION.

| Attribute                   | Type         | Key | Null               | Reference / Note              |     |     |
| --------------------------- | ------------ | --- | ------------------ | ----------------------------- | --- | --- |
| `id`                        | uuid         | PK  | NOT NULL           | Primary key                   |     |     |
| `tenant_id`                 | uuid         | FK  | NOT NULL           | References tenants(id)        |     |     |
| `department_code`           | varchar(80)  |     | NOT NULL           | Tenant-scoped department code |     |     |
| `department_name`           | varchar(150) |     | NOT NULL           | Display name                  |     |     |
| `description`               | text         |     | NULL               | Optional description          |     |     |
| `sort_order`                | int          |     | NOT NULL DEFAULT 0 | Display order                 |     |     |
| `status`                    | varchar(40)  |     | NOT NULL           | Record status                 |     |     |
| `created_at`                | timestamptz  |     | NOT NULL           | Created timestamp             |     |     |
| `created_by_tenant_user_id` | uuid         | FK  | NULL               | References tenant_users(id)   |     |     |
| `updated_at`                | timestamptz  |     | NOT NULL           | Updated timestamp             |     |     |
| `updated_by_tenant_user_id` | uuid         | FK  | NULL               | References tenant_users(id)   |     |     |
|                             |              |     |                    |                               |     |     |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, department_code)
UNIQUE(tenant_id, id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `categories`

Purpose: Stores tenant categories in a recursive parent/child hierarchy. **No Department relationship.** Migration **`20260827140000_DecoupleCategoryFromDepartment`** applied.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `parent_category_id` | uuid | FK | NULL | Self reference; NULL = root |
| `category_code` | varchar(80) |  | NOT NULL | Stored normalized: trim + uppercase |
| `category_name` | varchar(150) |  | NOT NULL | Display name |
| `category_slug` | varchar(180) |  | NOT NULL | URL/display slug |
| `description` | varchar(2000) |  | NULL | Optional description |
| `image_media_asset_id` | uuid | FK | NULL | References media_assets(tenant_id, id) composite |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `status` | varchar(40) |  | NOT NULL | ACTIVE / INACTIVE / DELETED |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints (CURRENT — post-migration):

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, parent_category_id) REFERENCES categories(tenant_id, id)   -- composite parent integrity
FK(tenant_id, image_media_asset_id) REFERENCES media_assets(tenant_id, id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE INDEX uq_categories_tenant_id_category_code (tenant_id, category_code)
UNIQUE INDEX uq_categories_tenant_id_normalized_category_name (tenant_id, LOWER(BTRIM(category_name)))
UNIQUE INDEX uq_categories_tenant_id_category_slug (tenant_id, category_slug)
UNIQUE INDEX uq_categories_tenant_id_id (tenant_id, id)
CHECK(parent_category_id IS NULL OR parent_category_id <> id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
INDEX (tenant_id, status)
INDEX (tenant_id, parent_category_id)
```

**Uniqueness rules:**

* **Code:** tenant-wide; `NormalizeCode` = trim + uppercase; DB enforces on stored column.
* **Name:** tenant-wide, case-insensitive, trimmed, **including DELETED**; expression index `LOWER(BTRIM(category_name))`. No `normalized_category_name` physical column.

**Parent integrity:** Application requires same-tenant parent. Database composite FK `(tenant_id, parent_category_id) → categories(tenant_id, id)` enforces tenant-safe parent links.

**Duplicate error mapping:** `uq_categories_tenant_id_category_code` → `category.duplicate_code`; `uq_categories_tenant_id_normalized_category_name` → `category.duplicate_name`.

Derived UI values (`level`, `hierarchy_path`, `child_count`, `product_count`, `has_children`) are **not** columns.

**CAT-MIG-PREFLIGHT-001** (executed as part of migration readiness): checks duplicate normalized code/name per tenant, dangling parent, cross-tenant parent, self-parent, parent cycle, hierarchy depth > 5. On conflict: **STOP SAFELY** — no silent merge/rename/delete/ID regeneration/product remapping.

Migration characteristics: Department decoupling; Category IDs preserved; `product_categories` mappings preserved; forward-only rollback (restore from backup).

**HISTORICAL:** pre-migration schema included `department_id` and department-scoped unique indexes. See ADR 010 and migration file for audit evidence.

`departments` table unchanged. Department remains available to unrelated modules only — not Category Management.

Authority: [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]], [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_BACKEND_GAP_FIX_CLOSURE_2026-08-27]]

## `brands`

Purpose: Stores tenant brand master records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `brand_code` | varchar(80) |  | NOT NULL | Tenant-scoped brand code |
| `brand_name` | varchar(150) |  | NOT NULL | Display name |
| `brand_slug` | varchar(180) |  | NOT NULL | URL/display slug |
| `description` | text |  | NULL | Optional description |
| `logo_url` | varchar(500) |  | NULL | Brand logo URL |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, brand_code)
UNIQUE(tenant_id, brand_slug)
UNIQUE(tenant_id, id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `collections`

Purpose: Stores tenant product collections and effective date windows.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `collection_code` | varchar(80) |  | NOT NULL | Tenant-scoped collection code |
| `collection_name` | varchar(150) |  | NOT NULL | Display name |
| `collection_slug` | varchar(180) |  | NOT NULL | URL/display slug |
| `description` | text |  | NULL | Optional description |
| `collection_type` | varchar(40) |  | NOT NULL | Collection type |
| `starts_at` | timestamptz |  | NULL | Collection start timestamp |
| `ends_at` | timestamptz |  | NULL | Collection end timestamp |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, collection_code)
UNIQUE(tenant_id, collection_slug)
UNIQUE(tenant_id, id)
CHECK(sort_order >= 0)
CHECK(ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `unit_of_measures`

Purpose: Stores global and tenant-specific unit of measure records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NULL | References tenants(id); NULL for global/system UOM |
| `uom_code` | varchar(30) |  | NOT NULL | UOM code |
| `uom_name` | varchar(100) |  | NOT NULL | Display name |
| `uom_type` | varchar(40) |  | NOT NULL | UOM type |
| `symbol` | varchar(20) |  | NULL | Display symbol |
| `base_uom_id` | uuid | FK | NULL | Self reference to unit_of_measures(id) |
| `conversion_factor` | numeric(18,6) |  | NOT NULL DEFAULT 1 | Conversion factor to base UOM |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(base_uom_id) REFERENCES unit_of_measures(id)
UNIQUE(uom_code) WHERE tenant_id IS NULL
UNIQUE(tenant_id, uom_code) WHERE tenant_id IS NOT NULL
CHECK(conversion_factor > 0)
CHECK(base_uom_id IS NULL OR base_uom_id <> id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `return_policies`

Purpose: Stores tenant product return policy records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `return_policy_code` | varchar(80) |  | NOT NULL | Tenant-scoped return policy code |
| `return_policy_name` | varchar(150) |  | NOT NULL | Display name |
| `description` | text |  | NULL | Optional description |
| `return_window_days` | int |  | NOT NULL | Allowed return window in days |
| `exchange_window_days` | int |  | NOT NULL | Allowed exchange window in days |
| `requires_receipt` | boolean |  | NOT NULL DEFAULT true | Receipt required flag |
| `allow_defective_return` | boolean |  | NOT NULL DEFAULT true | Defective return allowed flag |
| `requires_manager_approval` | boolean |  | NOT NULL DEFAULT false | Manager approval required flag |
| `is_default_policy` | boolean |  | NOT NULL DEFAULT false | Default policy flag |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, return_policy_code)
UNIQUE(tenant_id, id)
CHECK(return_window_days >= 0)
CHECK(exchange_window_days >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
One active default policy per tenant.
```

## `products`

Purpose: Stores tenant product master records.

| Attribute                   | Type         | Key | Null                  | Reference / Note               |
| --------------------------- | ------------ | --- | --------------------- | ------------------------------ |
| `id`                        | uuid         | PK  | NOT NULL              | Primary key                    |
| `tenant_id`                 | uuid         | FK  | NOT NULL              | References tenants(id)         |
| `product_code`              | varchar(80)  |     | NOT NULL              | Tenant-scoped product code     |
| `product_name`              | varchar(200) |     | NOT NULL              | Product name                   |
| `product_slug`              | varchar(220) |     | NOT NULL              | URL/display slug               |
| `product_type`              | varchar(40)  |     | NOT NULL              | Product type                   |
| `product_structure`         | varchar(40)  |     | NOT NULL              | Product structure              |
| `business_type_id`          | uuid         | FK  | NULL                  | References business_types(id)  |
| `brand_id`                  | uuid         | FK  | NULL                  | References brands(id)          |
| `return_policy_id`          | uuid         | FK  | NULL                  | References return_policies(id) |
| `short_description`         | text         |     | NULL                  | Short description              |
| `long_description`          | text         |     | NULL                  | Long description               |
| `is_sellable`               | boolean      |     | NOT NULL DEFAULT true | Sellable flag                  |
| `is_taxable`                | boolean      |     | NOT NULL DEFAULT true | Taxable flag                   |
| `is_tax_exclusive`          | boolean      |     | NOT NULL DEFAULT false| True if tax is calculated on top, false if inclusive |
| `status`                    | varchar(40)  |     | NOT NULL              | Product status                 |
| `reference_cost_price`      | numeric(18,4)|     | NULL                  | Reference cost price           |
| `current_setup_step`        | int          |     | NOT NULL DEFAULT 1    | Wizard setup step progress (semantics below) |
| `draft_saved_at`            | timestamptz  |     | NULL                  | Draft creation timestamp       |
| `published_at`              | timestamptz  |     | NULL                  | Timestamp of publication       |
| `published_by_tenant_user_id`| uuid        | FK  | NULL                  | References tenant_users(id)    |
| `archived_at`               | timestamptz  |     | NULL                  | Timestamp of soft delete       |
| `archived_by_tenant_user_id` | uuid        | FK  | NULL                  | References tenant_users(id)    |
| `row_version`               | bigint       |     | NOT NULL DEFAULT 1    | Optimistic concurrency token   |
| `created_at`                | timestamptz  |     | NOT NULL              | Created timestamp              |
| `created_by_tenant_user_id` | uuid         | FK  | NULL                  | References tenant_users(id)    |
| `updated_at`                | timestamptz  |     | NOT NULL              | Updated timestamp              |
| `updated_by_tenant_user_id` | uuid         | FK  | NULL                  | References tenant_users(id)    |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(business_type_id) REFERENCES business_types(id)
FK(tenant_id, brand_id) REFERENCES brands(tenant_id, id)
FK(tenant_id, return_policy_id) REFERENCES return_policies(tenant_id, id)
FK(published_by_tenant_user_id) REFERENCES tenant_users(id)
FK(archived_by_tenant_user_id) REFERENCES tenant_users(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_code)
UNIQUE(tenant_id, product_slug)
UNIQUE(tenant_id, id)
CHECK(status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'))
CHECK(current_setup_step BETWEEN 1 AND 7)
CHECK(row_version >= 0)
```

CURRENT EF already enforces `ck_products_setup_step` as `BETWEEN 1 AND 7`
(migration `ConsolidateProductWizardTo7Steps`). Stale `1 AND 8` documentation
is superseded.

### `current_setup_step` semantics (LOCKED 2026-09-11)

| Value | Meaning |
|---:|---|
| 1 | Scan Barcode |
| 2 | Basic Details |
| 3 | Product Type & Tracking (Initial Tracking collection) |
| 4 | Unit & Pack Conversion |
| 5 | Product Configuration (matrix/bundle **and** identifier section; former standalone Barcode & SKU absorbed) |
| 6 | Pricing & Tax |
| 7 | Review & Create |

Fresh drafts after Step 1 creation-path normally start at `2`. Legacy remapping (old 1→2 … old 5→5 identifiers): [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]].

Do **not** add `products.batch_number`, `products.expiry_date`, or
`products.serial_number`. Initial Tracking Details are draft data on
`product_setup_initial_tracking` (collected on **Step 3** after Product Type is
selected). Final identity remains `product_batches` / `serial_numbers`.

## `product_setup_scan_context` (IMPLEMENTED IN BACKEND SOURCE — local test DB applied)

Migration: `20260912085454_AddProductSetupScannerIdentifierContext`.  
Ownership / rollout: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scanner_First_Implementation_Architecture]] (§13, §37).  
**Applied:** local PostgreSQL test DB only (`UnifiedCommerceDb`). **Not claimed:** production/shared environments.  
**B8 status:** draft-bootstrap write logic is implemented; DRAFT and scan
context are persisted atomically.

Purpose: 1:1 Product Setup **draft/bootstrap** store for Step 1 Scan Barcode acquisition
mode, candidate identifier, identifier standard, no-barcode reason, external lookup
status, minimal normalized prefill snapshot, and generated SKU candidate.

Do **not** overload `products.product_structure`, `product_barcodes`, or
`product_setup_initial_tracking`. This table is **never** a final barcode owner.

Field set reconciled 2026-09-12 (removed duplicated `bootstrap_kind`; renamed
`barcode_type_hint` → `symbology_hint` with GTIN values forbidden). Authority:
[[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] TD-3.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Own primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id); tenant scope mandatory |
| `product_id` | uuid | FK | NOT NULL | References products(tenant_id, id); 1:1 with Product DRAFT |
| `acquisition_mode` | varchar(40) |  | NOT NULL | `SCAN` / `MANUAL` / `NO_BARCODE` / `LEGACY` — single mode field |
| `candidate_identifier` | varchar(100) |  | NULL | Validated candidate string; leading zeros preserved; NULL for `NO_BARCODE` / `LEGACY` |
| `identifier_standard` | varchar(40) |  | NULL | `GTIN8` / `GTIN12` / `GTIN13` / `GTIN14` / `OTHER` |
| `symbology_hint` | varchar(40) |  | NULL | Reported symbology only (`EAN13`/`EAN8`/`UPCA`/`CODE128`/`CODE39`/`UNKNOWN`). **GTIN values are invalid here** |
| `no_barcode_reason` | varchar(40) |  | NULL | `OWN_MADE` / `SERVICE_FEE` / `UNLABELLED` |
| `external_lookup_status` | varchar(40) |  | NULL | `NOT_STARTED` / `FOUND` / `NO_MATCH` / `TEMPORARY_FAILURE` |
| `external_source_reference` | varchar(100) |  | NULL | Provider-neutral reference. **Never** credentials/tokens |
| `normalized_prefill_json` | jsonb |  | NULL | Smallest normalized **confirmed** prefill needed for resume. **Not** raw provider payload |
| `generated_sku_candidate` | varchar(100) |  | NULL | Stable no-barcode AUTO Product SKU base; final SKU ownership remains `product_variants.sku` |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `row_version` | bigint |  | NOT NULL DEFAULT 1 | Internal. API concurrency token remains `products.row_version` / `expectedRowVersion` |

Indexes / Constraints / Notes:

```text
PK(id)
UNIQUE(tenant_id, id)
UNIQUE(tenant_id, product_id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
  ON DELETE CASCADE
  NAME fk_product_setup_scan_context_product_id_products
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
  NAME fk_product_setup_scan_context_created_by
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
  NAME fk_product_setup_scan_context_updated_by
CHECK(acquisition_mode IN ('SCAN', 'MANUAL', 'NO_BARCODE', 'LEGACY'))
CHECK(no_barcode_reason IS NULL OR no_barcode_reason IN ('OWN_MADE', 'SERVICE_FEE', 'UNLABELLED'))
CHECK(row_version >= 1)
INDEX(tenant_id, product_id)
```

**Lifecycle:** created with the Product DRAFT → updated while Step 1/Step 2 bootstrap is
relevant → read on draft resume (`GET .../setup`) → **never** the final catalogue identity
source after publish → cascades with Product delete per draft lifecycle.

**Backward compatibility:** legacy drafts have no row; resume represents them as
`acquisition_mode = 'LEGACY'` (materialized on demand or projected read-only). Absence of a
row is valid and must not block resume.

Authority: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]].

## `product_setup_initial_tracking` (EXISTING draft store)

Purpose: 1:1 Product Setup draft store for optional Initial Tracking
Details collected on **CURRENT Step 3**. Not Product master identity. Not inventory quantity.

**Status:** **EXISTING** — EF migration `20260824095742_AddProductSetupInitialTracking`.  
**Out of scanner-first B1 scope.** Scanner-first B1 is only: `product_setup_scan_context`, `product_barcodes.identifier_standard`, `barcode_type` UNKNOWN support.  
Live DB/E2E status: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/TENANT_ADMIN_PRODUCT_SETUP_INITIAL_TRACKING_PERMISSION_FIRST_IMPLEMENTATION_CLOSURE_2026-08-24]] — do not infer production migration acceptance from documentation alone.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Own primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(tenant_id, id); 1:1 |
| `initial_batch_number` | varchar(100) |  | NULL | Provisional Batch |
| `initial_expiry_date` | date |  | NULL | Provisional Expiry |
| `initial_serial_number` | varchar(150) |  | NULL | Provisional Serial |
| `assigned_product_variant_id` | uuid | FK | NULL | VARIANT assignment at Step 7 |
| `incompatible_clear_confirmed_at` | timestamptz |  | NULL | Last explicit incompatible clear |
| `consumed_at` | timestamptz |  | NULL | Set when publish creates inventory identity |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `row_version` | bigint |  | NOT NULL DEFAULT 1 | Internal increment with `products.row_version`. API token remains `products.row_version` / `expectedRowVersion` |

Indexes / Constraints / Notes:

```text
PK(id)
UNIQUE(tenant_id, id)
UNIQUE(tenant_id, product_id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
  ON DELETE CASCADE
  NAME fk_product_setup_initial_tracking_product_id_products
FK(tenant_id, assigned_product_variant_id) REFERENCES product_variants(tenant_id, id)
  NAME fk_product_setup_initial_tracking_assigned_variant
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
  NAME fk_product_setup_initial_tracking_created_by
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
  NAME fk_product_setup_initial_tracking_updated_by
CHECK(row_version >= 1)
INDEX(tenant_id, product_id)
INDEX(tenant_id, consumed_at) WHERE consumed_at IS NULL
```

Do **not** add a CHECK that forbids Batch+Expiry+Serial together. Combination
validation is application/domain until Step 2. Tenant isolation: every query
filters `tenant_id`. Optimistic concurrency for clients uses parent
`products.row_version` only.

Authority:
[[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]],
[[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP2_COLLECTION_DECISION_2026-09-01]].

## `product_variants`

Purpose: Stores sellable product variants.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `variant_code` | varchar(80) |  | NOT NULL | Product-scoped variant code |
| `sku` | varchar(100) |  | NULL | SKU, unique when present |
| `variant_name` | varchar(150) |  | NOT NULL | Display name |
| `stock_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `sales_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `option_combination_hash` | char(64) |  | NULL | Hash for duplicate option-combination prevention |
| `is_default_variant` | boolean |  | NOT NULL DEFAULT false | Default variant flag |
| `is_sellable` | boolean |  | NOT NULL DEFAULT true | Sellable flag |
| `allow_fractional_quantity` | boolean |  | NOT NULL DEFAULT false | Fractional quantity flag |
| `status` | varchar(40) |  | NOT NULL | Product variant status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
FK(tenant_id, stock_uom_id) REFERENCES unit_of_measures(tenant_id, id)
FK(tenant_id, sales_uom_id) REFERENCES unit_of_measures(tenant_id, id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, variant_code)
UNIQUE(tenant_id, sku) WHERE sku IS NOT NULL
UNIQUE(tenant_id, id)
UNIQUE(tenant_id, product_id, id)
One active default variant per product.
UNIQUE(tenant_id, product_id, option_combination_hash) WHERE option_combination_hash IS NOT NULL
CHECK(status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'))
```

## `product_reviews`

Purpose: Stores 1-5 star customer ratings and text reviews for products.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `customer_id` | uuid | FK | NOT NULL | References customers(id) |
| `rating_value` | int |  | NOT NULL | Rating 1 to 5 |
| `review_title` | varchar(150) |  | NULL | Short summary of review |
| `review_text` | text |  | NULL | Detailed review content |
| `status` | varchar(30) |  | NOT NULL | Status (PENDING, APPROVED, REJECTED) |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by` | uuid | FK | NULL | Creator ID |
| `updated_at` | timestamptz |  | NULL | Updated timestamp |
| `updated_by` | uuid | FK | NULL | Updater ID |

Indexes / Constraints / Notes:
- FK(tenant_id)
- FK(product_id) CASCADE
- FK(customer_id)

## `product_rating_summaries`

Purpose: Stores the aggregated rating summary for fast loading on product pages.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `average_rating` | numeric(3,2)|  | NOT NULL | Pre-calculated average |
| `total_reviews` | int |  | NOT NULL | Total review count |
| `five_star_count` | int |  | NOT NULL | Count of 5 stars |
| `four_star_count` | int |  | NOT NULL | Count of 4 stars |
| `three_star_count`| int |  | NOT NULL | Count of 3 stars |
| `two_star_count` | int |  | NOT NULL | Count of 2 stars |
| `one_star_count` | int |  | NOT NULL | Count of 1 stars |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by` | uuid | FK | NULL | Creator ID |
| `updated_at` | timestamptz |  | NULL | Updated timestamp |
| `updated_by` | uuid | FK | NULL | Updater ID |

Indexes / Constraints / Notes:
- UNIQUE(product_id) - One summary per product
- FK(tenant_id)
- FK(product_id) CASCADE

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK | Tenant reference |
| `tenant_users` | id uuid PK, tenant_id uuid FK | User/audit reference |

## Module Notes

- Every sellable product must have at least one `product_variants` row. Therefore, for `SIMPLE` and `BUNDLE` products, their Base SKU is stored in `product_variants.sku` on their single default variant row.
- Product Setup AUTO SKU uses an atomic tenant-wide sequence key and persists
  the allocated base in `product_setup_scan_context.generated_sku_candidate`.
  SIMPLE copies that base to the default variant; VARIANT appends ordered
  `product_option_values.value_code` tokens while retaining one parent sequence.
  No Product SKU ownership table is added.
- Only entity tables visible in the uploaded ERD image are included.
- Tenant-owned tables include `tenant_id` for data isolation.

## `product_unit_settings`

Purpose: Stores product-specific unit model setup and pack conversion attributes.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id); UNIQUE per product |
| `unit_model` | varchar(40) | | NOT NULL | CHECK ('SINGLE_UNIT', 'MULTIPLE_UNITS') |
| `base_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `selling_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `purchase_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `outer_pack_uom_id` | uuid | FK | NULL | References unit_of_measures(id) |
| `items_per_purchase_unit` | numeric(18,4) | | NULL | Items in 1 Purchase Unit |
| `purchase_units_per_outer_pack` | numeric(18,4) | | NULL | Purchase Units in 1 Outer Pack |
| `allow_decimal_quantity` | boolean | | NOT NULL DEFAULT false | Controls fractional quantities |
| `status` | varchar(30) | | NOT NULL DEFAULT 'ACTIVE' | Status |
| `created_at` | timestamptz | | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz | | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

## `product_unit_conversions`

Purpose: Stores pre-calculated conversion factors to Base Unit for every active unit level of a product.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `unit_level` | varchar(40) | | NOT NULL | CHECK ('BASE', 'SELLING', 'PURCHASE', 'OUTER_PACK') |
| `conversion_to_base_factor` | numeric(18,4) | | NOT NULL | Multiplier to get Base Units |
| `is_base_unit` | boolean | | NOT NULL DEFAULT false | Base Unit marker |
| `is_selling_unit` | boolean | | NOT NULL DEFAULT false | Selling Unit marker |
| `is_purchase_unit` | boolean | | NOT NULL DEFAULT false | Purchase Unit marker |
| `is_outer_pack_unit` | boolean | | NOT NULL DEFAULT false | Outer Pack Unit marker |
| `status` | varchar(30) | | NOT NULL DEFAULT 'ACTIVE' | Status |
| `created_at` | timestamptz | | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz | | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

## Related Files

- [[11_Product_Mapping_Media_Attributes_And_Channel_Visibility]]
- [[12_Product_Option_Templates_And_Variant_Configuration]]
- [[14_Pricing_And_Tax_Management]]
- [[16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]]
- [[15_Product_Import_Batches_And_Rows]]
# Product barcode POS lookup note (2026-07-22)

`product_barcodes` supports tenant-scoped exact POS lookup through the unique
`(tenant_id, barcode)` constraint. The lookup preserves the barcode as a string,
requires `ACTIVE` status, and returns `barcode_type`, `quantity_per_scan`, and
the exact matched barcode. `product_variant_id` may be null: one active/sellable
variant resolves successfully, multiple valid variants are ambiguous, and no
valid variant is unavailable.
