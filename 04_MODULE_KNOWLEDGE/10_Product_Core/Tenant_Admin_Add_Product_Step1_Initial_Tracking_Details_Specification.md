<!-- title: Tenant Admin Add Product Step 1 Initial Tracking Details Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

# Tenant Admin Add Product Step 1 Initial Tracking Details Specification

## Purpose

Canonical TARGET contract for optional Initial Tracking Details inside Tenant
Admin Add Product **Step 1 — Basic Details**. This is an approved Product Setup
change. It does not add an 8th wizard step and does not move tracking policy
out of Step 2.

Authority: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP1_DECISION_2026-08-24]].

## CURRENT vs TARGET vs GAP

| Layer | CURRENT | TARGET | GAP |
|---|---|---|---|
| Wizard length | 7 steps | Remain 7 steps | None |
| Step 1 fields | Product master + images + channels | Plus optional Batch / Expiry / Serial inputs | Flutter/API/DB draft storage |
| Tracking policy | Step 2 → `product_inventory_settings` | Unchanged | None |
| Actual Batch/Expiry | Inventory `product_batches` | Same final owner | Product Setup publish path |
| Actual Serial | Inventory `serial_numbers` | Same final owner | Product Setup publish path |
| `products.batch_number` / `expiry_date` / `serial_number` | Do not exist | Must **not** be added as Product master identity | Do not invent these columns |

## Wizard Remains Exactly 7 Steps

1. Basic Details
2. Product Type & Tracking
3. Units & Pack Conversion
4. Product Configuration
5. Barcode & SKU
6. Pricing & Tax
7. Review & Create

`products.current_setup_step` CURRENT EF constraint is `BETWEEN 1 AND 7`.

## Step 1 Layout — Two Logical Sections Plus Channels

### Section A — Product Basic Information

Existing fields remain: Product Name, Internal Product Code / Short Name,
Category, Brand, Short Description, Long Description, Product Images,
In-Store POS, Online Store.

### Section B — Initial Tracking Details

Compact card. Helper: `Tracking behaviour will be configured in the next step.`

| UI label | State / API | Type | Max | Example | Helper |
|---|---|---|---|---|---|
| Batch Number | `initialBatchNumber` | `String?` | 100 | `BAT-2026-0001` | `Enter the batch/lot identifier for this product if applicable.` |
| Expiry Date | `initialExpiryDate` | `Date?` (`YYYY-MM-DD`) | date picker | `2027-06-30` | `Enter the initial expiry date if this product will use expiry tracking.` |
| Serial Number | `initialSerialNumber` | `String?` | 150 | `SN-LAP-000001` | `Enter the unique serial number for this item if applicable.` |

Lengths follow CURRENT `product_batches.batch_number varchar(100)` and
`serial_numbers.serial_number varchar(150)`.

## Step 1 Behaviour

These values are **INITIAL TRACKING INPUT** until Step 2 makes them semantically
valid. They are not tracking policy.

- All three are optional in Step 1.
- Save Draft may persist all three empty.
- Save & Continue must not require any of the three.
- Entering a value must **not** auto-enable a Step 2 toggle.
- Forward/back navigation must preserve entered values until explicit
  confirmation clears incompatible ones.
- Syntax validation still applies (trim, max length, valid date). Duplicate
  uniqueness is deferred until Product identity/ownership is finalized at
  publish (or VARIANT assignment).

Successful Step 1 Save & Continue: `current_setup_step = 2`.

## Draft Persistence Decision (LOCKED)

**Selected strategy: Option A logical API + Option B physical store.**

| Option | Decision |
|---|---|
| A — Existing wizard draft pipeline | **SELECTED for API/lifecycle.** Reuse `POST/PUT .../draft` and `GET .../setup`. Do not invent a second Product Setup endpoint. |
| B — Dedicated draft-safe entity | **SELECTED for persistence.** TARGET table `product_setup_initial_tracking` (1:1 with `products`). |
| C — `products` temporary identity columns | **REJECTED.** Would pollute Product master semantics and imply one lifetime Batch/Serial. |

### Why Option B

CURRENT `SaveProductDraftRequest` persists Step 1 into `products` master columns
and Step 2 into `product_inventory_settings`. There is **no CURRENT safe column**
for provisional Batch/Expiry/Serial. Creating `product_batches` /
`serial_numbers` during Step 1 is forbidden because structure, policy, and
variant ownership are unknown.

### TARGET table `product_setup_initial_tracking` (GAP — migration required)

| Column | Type | Null | Meaning |
|---|---|---|---|
| `id` | uuid | NOT NULL PK | Own primary key |
| `tenant_id` | uuid | NOT NULL | Tenant isolation |
| `product_id` | uuid | NOT NULL | Wizard Product (1:1) |
| `initial_batch_number` | varchar(100) | NULL | Provisional Batch |
| `initial_expiry_date` | date | NULL | Provisional Expiry |
| `initial_serial_number` | varchar(150) | NULL | Provisional Serial |
| `assigned_product_variant_id` | uuid | NULL | VARIANT assignment at Step 7 |
| `incompatible_clear_confirmed_at` | timestamptz | NULL | Last explicit clear |
| `consumed_at` | timestamptz | NULL | Set when publish creates inventory identity |
| `created_at` | timestamptz | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | NULL | FK tenant_users |
| `updated_at` | timestamptz | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | NULL | FK tenant_users |
| `row_version` | bigint | NOT NULL DEFAULT 1 | Internal; incremented in the same transaction as `products.row_version`. **API concurrency token remains `products.row_version` / `expectedRowVersion` only.** |

### TARGET constraints (no Step 1 combination CHECK)

```text
PK(id)
UNIQUE(tenant_id, id)
UNIQUE(tenant_id, product_id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id) ON DELETE CASCADE
  NAME fk_product_setup_initial_tracking_product_id_products
FK(tenant_id, assigned_product_variant_id) REFERENCES product_variants(tenant_id, id)
  NAME fk_product_setup_initial_tracking_assigned_variant
  (nullable)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
  NAME fk_product_setup_initial_tracking_created_by
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
  NAME fk_product_setup_initial_tracking_updated_by
CHECK(row_version >= 1)
INDEX(tenant_id, product_id)
INDEX(tenant_id, consumed_at) WHERE consumed_at IS NULL
```

Do **not** CHECK-forbid Batch+Expiry+Serial together on this draft table.
Combination validation is application/domain until Step 2 normalization.
Final `product_batches` / `serial_numbers` keep their existing identity CHECKs.

Delete behaviour: CASCADE when the Product row is removed. Product ARCHIVE
keeps this row. After `consumed_at` is set, treat as read-only history.

Idempotency: UNIQUE(tenant_id, product_id) prevents a second draft row.
Repeated Save Draft updates the same row.

Cleanup: on successful publish, create applicable inventory identity rows, set
`consumed_at`, and stop treating draft values as editable wizard input.

Resume: `GET .../setup` MUST return the three values and any assigned variant id.

## Step 2 Remains Authoritative Tracking Policy

Unchanged fields: Product Structure (`SIMPLE` / `VARIANT` / `BUNDLE`), Track
Inventory, Batch Tracking, Expiry Tracking, Serial Tracking.

Canonical policy table remains `product_inventory_settings`.

Release 1 mutual exclusivity CURRENT and TARGET:

- Serial + Batch = forbidden
- Serial + Expiry = forbidden
- Batch + Expiry = allowed
- Expiry requires Batch
- Track Inventory OFF forces Batch/Expiry/Serial OFF

## Step 1 → Step 2 Reconciliation Matrix

| Step 1 Input | Step 2 Tracking Policy | Result |
|---|---|---|
| None | Quantity only | Valid |
| Batch only | Batch ON | Preserve Batch |
| Batch + Expiry | Batch + Expiry ON | Preserve both |
| Serial only | Serial ON | Preserve Serial |
| Batch + Expiry + Serial | Batch + Expiry ON | Preserve Batch + Expiry; confirm clearing Serial |
| Batch + Expiry + Serial | Serial ON | Preserve Serial; confirm clearing Batch + Expiry |
| Any values | Track Inventory OFF | Confirm and clear tracking values |
| Expiry only | Expiry ON | Block **finalization** until Batch Number supplied |
| Serial + Batch | Serial ON | Confirm removal of Batch |
| Serial + Expiry | Serial ON | Confirm removal of Expiry |

Incompatible values must never be silently discarded (BR-TRACK-008).

Confirmation copy:

`Tracking is disabled for the entered Batch/Expiry/Serial values. These values will be cleared if you continue.`

After confirmation, persist the **normalized** draft state. Back to Step 1 must
show the normalized values, not restored discarded values.

API must require an explicit confirmation flag such as
`confirmClearIncompatibleInitialTracking: true` before clearing. Otherwise
HTTP 400 `product.initial_tracking.incompatible_values_require_confirmation`.

## Structure Ownership

### SIMPLE — CURRENT inventory owner is the base Product

At Step 7 publish, if applicable:

```text
product_batches.product_id = ProductId
product_batches.product_variant_id = NULL
serial_numbers.product_id = ProductId
serial_numbers.product_variant_id = NULL
```

Expiry lives on the initial Batch: `product_batches.expiry_date`.

### VARIANT — LOCKED Option 2

Step 1 values stay provisional until an exact included Variant is selected.
Do not create parent-Product Batch/Serial rows for VARIANT products.

**Assignment surface: Step 7 Review & Create**, not Step 4. Step 4 remains
variant matrix only (no Opening Stock / Batch / Serial capture).

If applicable initial identities remain at Review:

- Require `initialTrackingAssignedVariantId` for an included sellable Variant.
- If exactly one included Variant exists, pre-select it and still display it.
- Publish is blocked until assignment or the user clears the identities.

Final rows MUST use that `product_variant_id`.

### BUNDLE / KIT

Bundle parent inventory remains component-based. Step 1 identities cannot become
Bundle-parent `product_batches` / `serial_numbers`.

Warning:

`Batch, expiry, and serial tracking applies to physical component products. Initial tracking values entered in Step 1 cannot be applied directly to a Bundle/Kit parent.`

Confirm clearing. Do not create physical Bundle-parent stock identity records.

## Final Create / Review

Step 7 displays **Initial Tracking Details** only for remaining applicable
values. Examples:

```text
Tracking Method: Batch + Expiry
Initial Batch Number: BAT-2026-0001
Initial Expiry Date: 2027-06-30
```

```text
Tracking Method: Serial
Initial Serial Number: SN-LAP-000001
```

Publish revalidates structure, policy, remaining inputs, ownership, uniqueness,
tenant scope, variant applicability, Bundle restriction, and expiry validity.

## When Actual Inventory Records Are Created

```text
Step 1  → store wizard draft state
Step 2  → determine tracking policy + reconcile
Steps 3–6 → units / variants / identifiers / pricing
Step 7  → validate complete Product model
        → Create/Publish Product
        → persist applicable initial Batch / Serial identity
```

Step 1 itself creates **no** `product_batches` or `serial_numbers`.

Identity without positive stock is allowed by CURRENT schema (`serial_numbers.current_inventory_balance_id` nullable; `product_batches` has no quantity). Product Setup MUST NOT fabricate:

- `inventory_balances` on-hand quantity
- `stock_movements`
- cost layers
- assumed Opening Stock

Opening Stock / Stock Receiving remain responsible for quantity.

## Domain Semantics

Expiry UI in Step 1 is convenience only. Domain owner remains
`product_batches.expiry_date`. One Product may later have many batches with
different expiries. Step 1 expiry is the **initial** Batch expiry only.

Serial identifies one physical unit, not a Product-wide reusable code. Later
receiving may add more serials.

Batch identifies a lot. Later receiving may add more batches.

## Business Rules

| ID | Rule |
|---|---|
| BR-TRACK-001 | Step 1 may collect optional initial Batch Number. |
| BR-TRACK-002 | Step 1 may collect optional initial Expiry Date. |
| BR-TRACK-003 | Step 1 may collect optional initial Serial Number. |
| BR-TRACK-004 | Step 1 tracking values do not determine tracking policy. |
| BR-TRACK-005 | Step 2 is authoritative for tracking enable/disable state. |
| BR-TRACK-006 | Expiry Tracking requires Batch Tracking. |
| BR-TRACK-007 | Serial Tracking is mutually exclusive with Batch/Expiry in Release 1. |
| BR-TRACK-008 | Incompatible Step 1 values must never be silently discarded. |
| BR-TRACK-009 | Expiry remains batch-owned domain data. |
| BR-TRACK-010 | Serial remains physical-unit identity data. |
| BR-TRACK-011 | Step 1 serial is an INITIAL serial, not a Product-wide reusable serial. |
| BR-TRACK-012 | Step 1 batch is an INITIAL batch; later batches may be added. |
| BR-TRACK-013 | No positive inventory quantity may be invented from Batch/Expiry/Serial input alone. |
| BR-TRACK-014 | Variant tracking identity must resolve to an exact Variant before final physical ownership. |
| BR-TRACK-015 | Bundle parent cannot receive direct physical tracking identities while Bundle inventory remains component-based. |
| BR-TRACK-016 | Initial Tracking mutation uses Product Setup authorization and does not imply Stock Adjustment permission. |
| BR-TRACK-017 | Unauthorized specialized fields must never be persisted merely because they were included in a generic draft payload. |
| BR-TRACK-018 | Publish revalidates all permissions required for mutations performed during publish. |
| BR-TRACK-019 | Cost data must not be returned to callers without `catalog.product_cost.view`. |
| BR-TRACK-020 | Permission denial must not cause silent destructive normalization of draft data. |

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-IT-001 | Step 1 captures optional Batch Number. |
| FR-IT-002 | Step 1 captures optional Expiry Date. |
| FR-IT-003 | Step 1 captures optional Serial Number. |
| FR-IT-004 | Save Draft / resume / back restore the three values. |
| FR-IT-005 | Step 2 reconciles values against tracking policy. |
| FR-IT-006 | Confirmation required before destructive clearing. |
| FR-IT-007 | SIMPLE identity publishes to base Product (`product_variant_id` NULL). |
| FR-IT-008 | VARIANT identity requires Step 7 assignment. |
| FR-IT-009 | BUNDLE parent cannot receive identity rows. |
| FR-IT-010 | Publish creates applicable identity rows only. |
| FR-IT-011 | No quantity, balance, or stock movement is created from these inputs. |
| FR-IT-012 | Server-side permission and entitlement enforcement. |
| FR-IT-013 | Tenant isolation on every read/write. |
| FR-IT-014 | Optimistic concurrency via `expectedRowVersion` against `products.row_version`. |
| FR-IT-015 | Sensitive fields (cost/stock) redacted per permission matrix; tracking identity is not cost-class. |

## Authorization & Permissions

Canonical matrix:
[[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].

- Empty Initial Tracking: `catalog.products.create` / `update` + `product_catalog`.
- Non-empty values: also `inventory_tracking`.
- Publish identity: `catalog.products.publish` + `inventory_tracking`.
- **Not required:** `inventory.stock.adjust`, `catalog.product_tracking.manage` (not invented).

## Feature Entitlements

| Runtime code | Use |
|---|---|
| `product_catalog` | Wizard access |
| `inventory_tracking` | Advanced policy + non-empty Initial Tracking + identity persist |
| `product_management` | `platform_modules.module_code` only — not a runtime entitlement check |
| `inventory_management` | Docs group for stock ops — not Product Setup tracking check |

## API Permission Matrix

Same routes as the 7-step wizard. Step 1 fields ride on `POST/PUT .../draft`.
GET `/setup` returns them. Publish consumes them. See permission matrix §16.

## NFR

| ID | Requirement |
|---|---|
| NFR-SEC-001 | Every query/mutation scoped by authenticated tenant. |
| NFR-SEC-002 | Never trust Flutter permission state. |
| NFR-SEC-003 | Specialized Product operations require specialized permissions. |
| NFR-CON-001 | `expectedRowVersion` vs `products.row_version`; stale → 409 `product.concurrency_conflict`. |
| NFR-TXN-001 | Step save atomically updates Product Setup draft tables including `product_setup_initial_tracking`. Publish atomically validates, writes Product graph, writes identity rows, sets `consumed_at`, or rolls back. |
| NFR-IDEM-001 | Repeated Save Draft must not duplicate the initial tracking row, batch row, or serial row. |
| NFR-PERF-001 | Avoid N+1. Align with existing Product Setup: Step 2 save P95 &lt; 100ms; setup GET P95 &lt; 150ms. |
| NFR-AUD-001 | Material changes audit actor, tenant, product, timestamp via existing `audit_logs` / Product draft events. |
| NFR-OBS-001 | Errors include canonical code and trace ID; no cross-tenant leakage. |
| NFR-UX-001 | Step 1 Initial Tracking card respects 1024×768 Product Setup layout. |
| NFR-ACC-001 | Keyboard, semantics, focus order, accessible date picker, labeled validation. |

## Audit Contract

CURRENT Product Setup events include `PRODUCT_DRAFT_STEP2_UPDATED`,
`PRODUCT_DRAFT_STEP5_UPDATED`, bundle events. Generic `audit_logs` exists.

TARGET events (same naming family; GAP until implemented):

| Event | When | Payload (no secrets) |
|---|---|---|
| `PRODUCT_DRAFT_INITIAL_TRACKING_UPDATED` | Step 1 persist of tracking draft fields | tenantId, productId, actor, which fields set (booleans), rowVersion — **not** full serial/batch strings if policy treats them as sensitive operational IDs; store presence flags + hashes optional |
| `PRODUCT_DRAFT_INITIAL_TRACKING_CLEARED` | Explicit incompatible clear | tenantId, productId, actor, reason/policy, rowVersion |
| `PRODUCT_DRAFT_INITIAL_TRACKING_VARIANT_ASSIGNED` | Step 7 assignment | tenantId, productId, variantId, actor, rowVersion |
| `PRODUCT_PUBLISH_INITIAL_BATCH_CREATED` | Identity batch inserted | tenantId, productId, productBatchId, actor |
| `PRODUCT_PUBLISH_INITIAL_SERIAL_CREATED` | Identity serial inserted | tenantId, productId, serialNumberId, actor |

Do not invent a separate audit subsystem. Do not log tokens or cross-tenant data.

## Field Traceability Matrix

| Step | UI Field | Flutter State | API JSON | Request DTO | Response DTO | Domain | DB Table | DB Column | Create Perm | Edit Perm | Specialized | Entitlement | Validation | Error | Audit Field |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Batch Number | `initialBatchNumber` | `initialBatchNumber` | `SaveProductDraftRequest.InitialBatchNumber` | setup/draft `initialBatchNumber` | draft then `ProductBatch.BatchNumber` | draft `product_setup_initial_tracking`; final `product_batches` | `initial_batch_number` / `batch_number` | `catalog.products.create` | `catalog.products.update` | — | `product_catalog`; `inventory_tracking` if non-empty | trim, max 100, optional | `product.initial_tracking.duplicate_batch` at persist uniqueness | presence |
| 1 | Expiry Date | `initialExpiryDate` | `initialExpiryDate` | `InitialExpiryDate` | `initialExpiryDate` | draft then `ProductBatch.ExpiryDate` | same | `initial_expiry_date` / `expiry_date` | create | update | — | same | valid date | `product.initial_tracking.invalid_expiry_date` | presence |
| 1 | Serial Number | `initialSerialNumber` | `initialSerialNumber` | `InitialSerialNumber` | `initialSerialNumber` | draft then `SerialNumber.SerialNumberValue` | draft table; final `serial_numbers` | `initial_serial_number` / `serial_number` | create | update | — | same | trim, max 150 | `product.initial_tracking.duplicate_serial` | presence |
| 2 | Confirm clear | — | `confirmClearIncompatibleInitialTracking` | bool | n/a | policy | `incompatible_clear_confirmed_at` | timestamptz | create | update | — | `product_catalog` | required when incompatible | `product.initial_tracking.incompatible_values_require_confirmation` | cleared event |
| 7 | Assign variant | `initialTrackingAssignedVariantId` | same | Guid? | same | `assigned_product_variant_id` | draft table | `assigned_product_variant_id` | create | update | `catalog.variants.manage` | `inventory_tracking` if identity remains | included sellable variant | `product.initial_tracking.variant_assignment_required` / `invalid_variant_assignment` | variant id |
| * | Row version | `rowVersion` | `expectedRowVersion` | long | `rowVersion` | `Product.RowVersion` | `products` | `row_version` | — | — | — | — | match | `product.concurrency_conflict` | rowVersion |
| * | Setup step | `currentStep` | `currentSetupStep` | int | `currentSetupStep` | `Product.CurrentSetupStep` | `products` | `current_setup_step` | — | — | — | — | 1–7 | 400 | — |

## Error Contract

| HTTP | Code | When |
|---|---|---|
| 400 | `product.initial_tracking.incompatible_values_require_confirmation` | Incompatible values and confirm flag false |
| 400 | `product.initial_tracking.batch_required_for_expiry` | Expiry tracking/identity finalization without Batch (reuse policy `BATCH_REQUIRED_FOR_EXPIRY` only for Step 2 toggles) |
| 400 | `product.initial_tracking.invalid_expiry_date` | Malformed date |
| 400 | `product.initial_tracking.bundle_parent_not_supported` | Attempt to finalize identity on BUNDLE parent |
| 400 | `product.initial_tracking.variant_assignment_required` | VARIANT identity without assigned variant |
| 400 | `product.initial_tracking.invalid_variant_assignment` | Variant not included/sellable/wrong product |
| 409 | `product.initial_tracking.duplicate_batch` | Uniqueness vs `product_batches` |
| 409 | `product.initial_tracking.duplicate_serial` | Uniqueness vs `serial_numbers` |
| 409 | `product.concurrency_conflict` | Stale `expectedRowVersion` |
| 403 | `product.permission_denied` / envelope `auth.forbidden` | Missing permission (do **not** add a duplicate `product.initial_tracking.permission_denied`) |
| 403 | `product.entitlement_denied` | Missing `product_catalog` or `inventory_tracking` |
| 404 | `product.not_found` | Inaccessible tenant resource |

## Validation

**Batch Number:** optional Step 1; trim; max 100; uniqueness
`UNIQUE(tenant_id, product_id, batch_number)` when `product_variant_id` is NULL,
or with variant when assigned; checked before final persistence.

**Expiry Date:** optional Step 1; valid date only; if Expiry Tracking ON at
finalization, Batch Number must exist; enforce
`expiry_date >= manufactured_at` when manufacture date exists (CURRENT column
`product_batches.manufactured_at`). Product Setup does not collect manufacture
date, so that check is N/A unless a later receiving/edit supplies it.

**Serial Number:** optional Step 1; trim; max 150; uniqueness CURRENT
`UNIQUE(tenant_id, product_id, serial_number)` — product-scoped, not tenant-wide.

## API — distinguish values from policy

Do not invent duplicate endpoints. Extend existing draft DTOs.

Step 1 draft input:

```json
{
  "currentSetupStep": 1,
  "expectedRowVersion": 1,
  "initialBatchNumber": "BAT-2026-0001",
  "initialExpiryDate": "2027-06-30",
  "initialSerialNumber": null
}
```

Step 2 policy (unchanged conceptually):

```json
{
  "currentSetupStep": 2,
  "expectedRowVersion": 2,
  "productStructure": "SIMPLE",
  "trackInventory": true,
  "batchTracking": true,
  "expiryTracking": true,
  "serialTracking": false,
  "confirmClearIncompatibleInitialTracking": false
}
```

Step 7 VARIANT assignment:

```json
{
  "currentSetupStep": 7,
  "expectedRowVersion": 7,
  "initialTrackingAssignedVariantId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

## Related Files

- [[05_Tenant_Admin_Add_Product_7_Step_Contract]]
- [[Tenant_Admin_Product_Type_Tracking_Specification]]
- [[Tenant_Admin_Add_Product_Draft_Lifecycle_Specification]]
- [[Tenant_Admin_Add_Product_Review_Create_Specification]]
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-24_Tenant_Admin_Product_Setup_Permission_NFR_API_DB_Contract_Closure_Audit]]
