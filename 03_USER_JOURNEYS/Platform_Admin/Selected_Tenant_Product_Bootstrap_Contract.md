<!-- title: Selected Tenant Product Bootstrap Contract -->
<!-- status: Canonical / Locked -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->
<!-- lock_date: 2026-08-12 -->

# Selected Tenant Product Bootstrap Contract

## Authority

Locks **GAP 2 — Bootstrap product minimum field contract** for SA-ST-UJ-009 (manual onboarding).

Super Admin bootstrap creates **minimum viable SIMPLE products** for operational go-live. It does **not** replicate Tenant Admin 7-step wizard.

## Scope

| In scope | Out of scope (Tenant Admin) |
|---|---|
| SIMPLE structure only | VARIANT / BUNDLE |
| Single-SKU create | Variant matrix, options |
| ACTIVE or DRAFT status | Full publish workflow UI |
| Optional opening stock | Channel visibility matrix |
| Manual single-product form | Media gallery, attributes, collections |
| | Tax configuration UI |
| | Online store visibility rules |
| | Duplicate / archive / import repair beyond CSV journey |

## Bootstrap product type lock

| Field | Value |
|---|---|
| `product_structure` | `SIMPLE` (fixed for bootstrap) |
| `product_type` | `STANDARD` (default) |
| Variant mode | **Not supported** in bootstrap |

## Field contract — manual bootstrap (ST-06A)

| UI Label | Domain Attribute | DB Table.Column | Required | Default | Validation | Permission | Entitlement | Bootstrap reason |
|---|---|---|---|---|---|---|---|---|
| Product Name | `productName` | `products.product_name` | **Yes** | — | 2–200 chars, trim | `bootstrap.products.manage` | catalog/products module | Identify sellable item |
| SKU | `sku` | `product_variants.sku` | **Yes** | — | Unique per tenant; 1–80 chars | same | same | POS lookup / inventory key |
| Sale Price | `sellingPrice` | `product_prices` (default price row) | **Yes** | — | ≥ 0; tenant currency | same | same | Minimum sellable price |
| Category | `categoryId` | `products.category_id` | No | null | Must exist if provided | same | same | Optional organization |
| Barcode | `barcode` | `product_barcodes.barcode` | No | null | Unique per tenant if provided | same | same | Optional scan support |
| Track Inventory | `trackInventory` | `product_inventory_settings.is_stock_tracked` | No | `true` | boolean | same | same | Controls stock behaviour |
| Opening Stock Qty | `openingStockQuantity` | stock movement ledger | No | 0 | ≥ 0; requires outlet if > 0 | same | same + inventory | Optional initial stock |
| Outlet | `outletId` | `inventory_balances` scope | Conditional | — | Required when opening stock > 0; must be tenant outlet | same | outlet exists | Stock location |
| Status | `status` | `products.status` | No | `ACTIVE` | `ACTIVE` or `DRAFT` only | same | same | Bootstrap default ACTIVE for immediate POS use |

## Intentionally deferred to Tenant Admin

| Field / capability | Why deferred |
|---|---|
| Brand | Not required for first sellable SKU |
| Unit / UOM wizard (Step 3) | Bootstrap uses tenant default UOM `EA` (each) server-side |
| Cost price | Not required for POS sale bootstrap |
| Tax mode / tax class | Uses tenant default tax settings |
| Product code (`product_code`) | Server auto-generates if omitted |
| POS channel visibility flags | ACTIVE SIMPLE product visible to POS when entitled |
| Online / e-commerce visibility | TA storefront configuration |
| Images / media | TA product enrichment |
| Variants / bundles | TA 7-step wizard |
| Draft resume / 7-step state | TA lifecycle |
| Low stock threshold | TA inventory settings |

## Server-side defaults (bootstrap create)

| Attribute | Default when omitted |
|---|---|
| `products.product_structure` | `SIMPLE` |
| `products.status` | `ACTIVE` |
| `product_inventory_settings.is_stock_tracked` | `true` |
| Default UOM | Tenant default unit `EA` or first active tenant UOM |
| `products.current_setup_step` | Not used — bootstrap bypasses wizard; product created atomically |
| Channel visibility | POS-enabled when catalog + POS entitlements effective |

## Business rules

1. SKU uniqueness enforced tenant-wide at create.
2. Barcode uniqueness enforced tenant-wide when provided.
3. Opening stock writes **ledger movement** (`opening_stock` reason) — never direct balance mutation.
4. Bootstrap product create is **idempotent** when `Idempotency-Key` header supplied.
5. Product limit from subscription plan enforced → `422 outlet.limit_reached` equivalent `platform_tenants.bootstrap.limit_reached`.

## API

See [[../../05_BACKEND_ARCHITECTURE/Platform_Selected_Tenant_API_Contract#post-bootstrapproducts]].

## Acceptance criteria

1. Super Admin can create one SIMPLE product with name + SKU + price only.
2. Optional opening stock requires outlet selection.
3. No variant/bundle fields exposed.
4. Created product appears in tenant product count for hub derivation.
5. Tenant Admin can later enrich product via full wizard/management.
