<!-- title: Product Import Batches And Rows Table Schemas -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# 15. Product Import Batches And Rows

This file defines the database schemas, foreign keys, unique constraints, and indexes for `product_import_batches` and `product_import_rows` tables, enabling tenant-isolated CSV imports.

## `product_import_batches`

Purpose: CSV product import batch header metadata.

| Attribute | Type | Key | Null | Reference / Note |
| :--- | :--- | :--- | :--- | :--- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `original_file_name` | varchar(255) | | NOT NULL | Original upload file name |
| `storage_key` | varchar(500) | | NOT NULL | Object storage reference key |
| `file_sha256` | char(64) | | NOT NULL | Integrity hash to check duplicate uploads |
| `import_status` | varchar(30) | | NOT NULL | Batch status |
| `total_rows` | int | | NOT NULL DEFAULT 0 | Total rows parsed |
| `valid_rows` | int | | NOT NULL DEFAULT 0 | Validated rows eligible for import |
| `invalid_rows` | int | | NOT NULL DEFAULT 0 | Failed validation rows count |
| `imported_rows` | int | | NOT NULL DEFAULT 0 | Successfully created/updated variants count |
| `failed_rows` | int | | NOT NULL DEFAULT 0 | Rows failed during transaction commit phase |
| `idempotency_key` | varchar(255) | | NULL | Unique key to prevent double validation/commit |
| `requested_by_tenant_user_id` | uuid | FK | NOT NULL | References tenant_users(id) |
| `validation_started_at` | timestamptz | | NULL | Processing start timestamp |
| `validation_completed_at` | timestamptz | | NULL | Processing end timestamp |
| `import_started_at` | timestamptz | | NULL | Commit start timestamp |
| `import_completed_at` | timestamptz | | NULL | Commit completion timestamp |
| `created_at` | timestamptz | | NOT NULL | Timestamp created |
| `updated_at` | timestamptz | | NOT NULL | Timestamp updated |
| `row_version` | bigint | | NOT NULL DEFAULT 1 | Optimistic concurrency version |

### Indexes & Constraints
```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(requested_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL
UNIQUE(tenant_id, file_sha256)
CHECK(total_rows >= 0)
CHECK(valid_rows >= 0)
CHECK(invalid_rows >= 0)
CHECK(imported_rows >= 0)
CHECK(failed_rows >= 0)
CHECK(row_version >= 0)
CHECK(import_status IN ('UPLOADED', 'VALIDATING', 'VALIDATED', 'IMPORTING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED', 'CANCELLED'))
```

---

## `product_import_rows`

Purpose: CSV rows parsed payloads and validation errors tracking.

| Attribute | Type | Key | Null | Reference / Note |
| :--- | :--- | :--- | :--- | :--- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `batch_id` | uuid | FK | NOT NULL | References product_import_batches(id) |
| `row_number` | int | | NOT NULL | CSV line row index |
| `raw_payload_json` | jsonb | | NOT NULL | Raw CSV row content serialized |
| `normalized_payload_json` | jsonb | | NULL | Mapped fields context after normalization |
| `row_status` | varchar(30) | | NOT NULL | Status of row |
| `error_code` | varchar(100) | | NULL | Machine readable error code |
| `error_message` | text | | NULL | Human readable validation message |
| `product_id` | uuid | FK | NULL | Created product reference |
| `product_variant_id` | uuid | FK | NULL | Created variant reference |
| `created_at` | timestamptz | | NOT NULL | Timestamp created |
| `updated_at` | timestamptz | | NOT NULL | Timestamp updated |

### Indexes & Constraints
```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(batch_id) REFERENCES product_import_batches(id) ON DELETE CASCADE
FK(product_id) REFERENCES products(id) ON DELETE SET NULL
FK(product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
UNIQUE(tenant_id, batch_id, row_number)
CHECK(row_number > 0)
CHECK(row_status IN ('PENDING', 'VALIDATING', 'VALID', 'INVALID', 'COMMITTING', 'IMPORTED', 'FAILED'))
```

---

## Related Files
- [[10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_And_Import_Contract]]
