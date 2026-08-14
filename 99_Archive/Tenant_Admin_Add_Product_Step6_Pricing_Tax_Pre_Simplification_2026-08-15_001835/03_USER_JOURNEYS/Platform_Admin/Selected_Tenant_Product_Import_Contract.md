<!-- title: Selected Tenant Product Import Contract -->
<!-- status: Canonical / Locked -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->
<!-- lock_date: 2026-08-12 -->

# Selected Tenant Product Import Contract

## Authority

Locks **GAP 3 — CSV import canonical contract** for SA-ST-UJ-010.

Reuses domain validation semantics from archived [[../../99_Archive/Tenant_Admin_Product_List_Pre_UI_Alignment_2026-08-06_23-00/04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_And_Import_Contract]] and active [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]] tenant-admin import endpoints — adapted for **bootstrap subset** and **platform bootstrap APIs**.

## Template identity

| Property | Value |
|---|---|
| Template ID | `OVZ-ST-PRODUCT-IMPORT-v1` |
| Header version row | `# oneverz_bootstrap_product_import_version=1` (optional first line comment) |
| Encoding | UTF-8 (BOM tolerated, stripped) |
| Delimiter | Comma (`,`) |
| Quote character | Double quote (`"`) per RFC 4180 |
| Line ending | CRLF or LF |
| Max file size | **5 MB** |
| Max row count | **2,000** data rows (excluding header) |
| Blank rows | Ignored |
| One row | One SIMPLE sellable SKU (bootstrap does not support VARIANT rows) |

## Column contract

| Column | Required | Domain attribute | Type | Example | Validation |
|---|---|---|---|---|---|
| `product_name` | **Yes** | `products.product_name` | string | `Rice 1kg` | 2–200 chars |
| `sku` | **Yes** | `product_variants.sku` | string | `RICE-1KG` | Unique tenant-wide; unique within file |
| `selling_price` | **Yes** | default selling price | decimal | `450.00` | ≥ 0 |
| `category_code` | No | `categories.category_code` lookup | string | `GROCERY` | Must resolve if present |
| `brand_code` | No | `brands.brand_code` lookup | string | `OWN` | Must resolve if present |
| `barcode` | No | `product_barcodes.barcode` | string | `4790011122334` | Unique if present |
| `track_inventory` | No | `is_stock_tracked` | boolean | `true` | Default `true` |
| `outlet_code` | Conditional | outlet lookup | string | `OUT-2026-0001` | Required if `opening_stock` > 0 |
| `opening_stock` | No | ledger qty | decimal | `100` | ≥ 0; requires `outlet_code` when > 0 |
| `status` | No | `products.status` | string | `ACTIVE` | `ACTIVE` or `DRAFT`; default `ACTIVE` |

**Excluded from bootstrap template (TA-only):** `product_key`, `product_type=VARIANT`, `variant_name`, bundle/combo types.

## Duplicate behaviour

| Duplicate type | Behaviour |
|---|---|
| SKU duplicate in file | **Invalid row** — error `import.duplicate_sku_in_file` |
| SKU exists in DB | **Invalid row** — error `import.duplicate_sku_exists` |
| Barcode duplicate in file | **Invalid row** |
| Barcode exists in DB | **Invalid row** |

## Unknown reference handling

| Reference | Behaviour |
|---|---|
| Unknown `category_code` | **Invalid row** — `import.unknown_category` |
| Unknown `brand_code` | **Invalid row** — `import.unknown_brand` |
| Unknown `outlet_code` | **Invalid row** — `import.unknown_outlet` |

## Stock handling

- Opening stock uses authoritative ledger movement (`opening_stock` reason) — same as TA import contract.
- Never write `inventory_balances` directly.

## Import behaviour (LOCKED)

| Phase | Behaviour |
|---|---|
| Validate | Parse all rows; classify valid/invalid; **no DB product writes** |
| Preview | Return counts + first N invalid rows |
| Commit | **Partial success** — commit **valid rows only**; invalid rows remain in batch log |
| All-or-nothing | **NOT used** for bootstrap import |

Matches existing TA import batch engine semantics.

## Idempotency

| Header | Rule |
|---|---|
| `Idempotency-Key` on commit | Replaying same key returns same batch result without duplicate products |

## Concurrency

- One in-flight bootstrap import batch per tenant at a time → `409 import.batch_in_progress`
- Commit uses row-level transaction per product graph (same as TA import)

## Audit event

`platform.tenant_bootstrap.products_imported` with `importId`, `validRows`, `invalidRows`, `actorPlatformUserId`, `tenantId`.

## API mapping (platform bootstrap)

| Step | Method | Path |
|---|---|---|
| Download template | `GET` | `/api/v1/platform-admin/tenants/{tenantId}/bootstrap/products/import/template` |
| Upload + validate | `POST` | `/api/v1/platform-admin/tenants/{tenantId}/bootstrap/products/import/validate` |
| Commit | `POST` | `/api/v1/platform-admin/tenants/{tenantId}/bootstrap/products/import/{importId}/commit` |
| Error export | `GET` | `/api/v1/platform-admin/tenants/{tenantId}/bootstrap/products/import/{importId}/errors.csv` |

Permission: `platform.tenants.bootstrap.products.import`

## Error report format

CSV export appends columns: `row_number`, `error_code`, `error_detail` (formula-injection safe).

## Preview UI (ST-06B)

Upload → validate → preview table → confirm import → result summary. **Not separate journeys.**

## Product decision alignment

`catalog.products.import` remains deferred for **Tenant Admin UI** per API authorization notes, but **platform bootstrap import** uses parallel batch semantics under `platform.tenants.bootstrap.products.import` — **no conflicting rule**.
