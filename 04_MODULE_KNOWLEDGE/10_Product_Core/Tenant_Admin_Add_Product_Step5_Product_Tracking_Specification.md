<!-- title: Tenant Admin Add Product — Step 5 Product Tracking Specification -->
<!-- status: Active Target -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-24 -->
<!-- supersedes: n/a — new specification for 6-step wizard -->
<!-- extended: 2026-09-24 — VARIANT Quantity opening stock & outlet allocation documented -->

# Tenant Admin Add Product — Step 5 Product Tracking Specification

## 1. Executive Summary & Scope

This document defines the canonical specification for **Step 5: Product Tracking** in the new Tenant Admin 6-step Add Product wizard.

Step 5 is **entirely optional**. It owns:

- **Tracking Method Selection** (Quantity, Batch/Lot, Batch+Expiry)
- **Quantity-path** initial Opening Stock orchestration + Outlet Allocation
- **Batch-path** initial Batch identity configuration
- **Batch+Expiry-path** initial Batch + Expiry identity configuration

**Ownership boundary (LOCKED):**

Product Setup owns the onboarding workflow orchestration.

Inventory owns the actual stock ledger, movements, and operational state.

**Authority:**
- Corrected CHUNK 1 Audit: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/CHUNK_1_AUDIT_CORRECTED_2026-09-20]]
- Scanner-first decision: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]]
- Canonical 6-step decision: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20]]

---

## 2. Step 5 — Product Tracking (Entirely Optional)

### 2.1 Skip Behaviour

**If user selects Skip:**

```text
Step 5 Product Tracking
    ↓
[Skip button]
    ↓
Step 6 Review & Create
```

**Result:** No Product Tracking configuration.

**Persistence:** 

```text
is_stock_tracked = false
```

or equivalent no-tracking state in `product_inventory_settings`.

---

### 2.2 Tracking Method Selection

If user does NOT skip:

**Display selection card:**

```
Choose how to track this product:

○ Quantity
  Track stock quantity by location and outlet

○ Batch / Lot
  Track products by batch/lot number for traceability

○ Batch + Expiry
  Track products by batch with expiry date management
```

**LOCKED UI Rule:**

Do NOT show "None" as a tracking option.

Do NOT show "Serial / IMEI" in this UI (classified as LEGACY/DEFERRED).

Do NOT use terminology such as "Track Stock Yes/No" toggle.

---

## 3. Quantity Tracking Method

### 3.1 Flow

```text
Step 5 Product Tracking
    ↓
Select: Quantity
    ↓

[ For SIMPLE Product ]

[Internal Page 1] Opening Stock (compact card)
    ├─ Display Product / Variant info
    ├─ Enter Opening Quantity (numeric, >= 0)
    └─ [Next]
    ↓
If Opening Quantity > 0:
    [Internal Page 2] Outlet Allocation
        ├─ Display Opening Quantity
        ├─ Allocate to authorized outlets
        ├─ Validate SUM(allocations) = Opening Quantity
        └─ [Continue]
If Opening Quantity = 0:
    Skip Outlet Allocation → Step 6 directly
    ↓
Step 6 Review & Create

[ For VARIANT Product ]

[Internal Page 1] Variant Opening Stock
    ├─ Display all sellable Variants (from Step 3)
    ├─ Enter Opening Quantity per Variant (>= 0; read-only Variant name & SKU)
    └─ [Continue]
    ↓
For each Variant:
    If OpeningQuantity > 0:
        [Outlet Allocation for that Variant]
            ├─ Variant section / card (expandable)
            ├─ Allocate to authorized outlets
            ├─ Validate SUM(allocations for Variant) = Variant.OpeningQuantity
            └─ Per-Variant exact reconciliation
    If OpeningQuantity = 0:
        No Outlet Allocation required for that Variant
    ↓
All Variants valid
    ↓
Step 6 Review & Create
```

Opening Stock and Outlet Allocation are **separate internal pages**.

Do NOT combine them into one page.

---

### 3.2 Opening Stock Page

#### For Simple Product

**Display:**
```text
Product: Coca-Cola 500ml

Opening Stock Quantity
[           ]  units
```

**Rules:**
- Numeric, non-negative
- Follow existing inventory numeric precision
- Opening Quantity >= 0 (zero is valid — bypasses Outlet Allocation; see SIMPLE spec Part A)
- Product must belong to tenant

#### For Variant Product

**Display:**
```text
Variant        SKU       Opening Quantity

Black / S      TS-B-S    [    ]
Black / M      TS-B-M    [    ]
Black / L      TS-B-L    [    ]

Total Opening Stock: 0
```

**Rules:**
- Each sellable included Variant gets an input row
- Variant Name: **read-only** (from Step 3)
- SKU: **read-only** (from Step 3)
- Opening Quantity: **editable per Variant**
- Opening Stock belongs to exact Variant identity (no new Variants created)
- Numeric, non-negative (>= 0)
- Zero is valid for any Variant
- Total Opening Stock shown as informational SUM only (NOT validation authority)
- Follow existing precision
- Product Tracking Policy is PRODUCT-LEVEL (Quantity for all Variants; no mixed policies)

**No Batch field.**
**No Expiry field.**
**No Serial field.**
**No new Variant creation.**

---

### 3.3 Outlet Allocation Page

#### Display Opening Quantity

Show the entered total:

```text
Opening Stock: 100 units
```

#### Allocate to Outlets

Provide controlled selection of authorized outlets:

```text
Colombo      [  60  ]
Jaffna       [  40  ]

Total allocated: 100
Remaining:      0
```

**Business Rule (LOCKED):**

Total outlet allocation must equal Opening Stock before final publish.

Do NOT allow:

```text
Opening Stock = 100
Allocated total = 80
Remaining = 20
```

unless an existing approved canonical partial-allocation rule exists.

If partial allocation is required, document the rule explicitly.

**Authorization Rule:**

Only outlets authorized for the current user may be selected.

Backend is authoritative for outlet access validation.

Flutter filtering is UX only.

---

### 3.4 Quantity Summary on Review (Step 6)

#### For SIMPLE Product

```text
Product Tracking
Method: Quantity

Opening Stock: 100 units

Outlet Allocation:
- Colombo    60 units
- Jaffna     40 units
```

#### Quantity Path (VARIANT)

```text
Product Tracking
Method: Quantity

Total Opening Stock: 160 Pieces

Black / S
Opening Stock: 50
Colombo: 30
Jaffna: 20

Black / M
Opening Stock: 70
Colombo: 40
Jaffna: 30

Black / L
Opening Stock: 40
Colombo: 20
Jaffna: 20

Black / XL
Opening Stock: 0
Outlet Allocation: Not required
```

> Variant-level detail must remain visible in Review. Do NOT show only Product Total.

### 3.5 Quantity Publish Behaviour

At Step 6 final publish:

**Quantity path creates stock for Variants with OpeningQuantity > 0.**

Inventory domain:

- For SIMPLE: Validates Opening Stock quantity and creates `stock_movements` (reason: OPENING_STOCK) + `inventory_balances` per outlet/variant
- For VARIANT: For each Variant with OpeningQuantity > 0, creates `stock_movements` and `inventory_balances` per outlet
- For Variant with OpeningQuantity = 0: No stock mutation
- Uses existing Inventory ledger authoritative semantics

**Permission:**

Actual Opening Stock mutation requires:

- `tenant.stock.opening` permission (if confirmed in backend authorization)
- Outlet authorization scope
- `inventory_tracking` entitlement (VERIFY during backend audit — do not assume)

**Permission Entitlement Status:**

```text
REQUIRES BACKEND AUDIT
Do not assume inventory_tracking is needed for Quantity.
Verify existing entitlement semantics.
```

---

## 4. Batch / Lot Tracking Method

### 4.1 Flow

```text
Step 5 Product Tracking
    ↓
Select: Batch / Lot
    ↓
[Page] Initial Batch Details
    ├─ Batch Number (optional, max 100 chars)
    ├─ Explicit "Skip Initial Details" action
    └─ [Continue]
    ↓
Step 6 Review & Create
```

---

### 4.2 Initial Batch Details Page

**Display:**
```text
Batch / Lot Tracking

Batch Number
[                    ]

( ) Skip Initial Details
```

**Rules:**
- Batch Number is optional
- Max 100 characters
- Alphanumeric, trim whitespace
- Do NOT validate uniqueness yet (deferred to publish)

**Explicit Skip Action:**

If user selects "Skip Initial Details":

```text
Tracking Method: Batch / Lot
Initial Batch: Not provided
→ Future batch details will be captured in Inventory when stock is received.
```

---

### 4.3 Batch Summary on Review (Step 6)

**If initial Batch Number entered:**

```text
Product Tracking
Method: Batch / Lot
Initial Batch Number: BAT-2026-0001
```

**If skipped:**

```text
Product Tracking
Method: Batch / Lot
Initial Batch Number: Not provided
Future batch details will be captured in Inventory.
```

---

### 4.4 Batch Publish Behaviour

At Step 6 final publish:

**Batch method does NOT create stock.**

- Initial Batch Number persisted to `product_setup_initial_tracking`
- `product_batches` row created ONLY if Batch Number was entered
- No `stock_movements` created
- No `inventory_balances` initialized
- Actual stock receiving happens later through Inventory module

**Permission:**

```text
catalog.products.publish
```

+ subgraph recheck if `inventory_tracking` entitlement required (VERIFY).

---

## 5. Batch + Expiry Tracking Method

### 5.1 Flow

```text
Step 5 Product Tracking
    ↓
Select: Batch + Expiry
    ↓
[Page] Initial Batch & Expiry Details
    ├─ Batch Number (optional, max 100 chars)
    ├─ Expiry Date (optional, date picker YYYY-MM-DD)
    ├─ Explicit "Skip Initial Details" action
    └─ [Continue]
    ↓
Step 6 Review & Create
```

---

### 5.2 Initial Batch & Expiry Details Page

**Display:**
```text
Batch + Expiry Tracking

Batch Number
[                    ]

Expiry Date
[  YYYY-MM-DD  ]  📅 date picker

( ) Skip Initial Details
```

**Rules:**

#### Entered State (User provided values)

If user chooses to ENTER initial details:

- `Batch Number` = REQUIRED (min 1 char, max 100)
- `Expiry Date` = REQUIRED (valid date, YYYY-MM-DD)
- Both fields must be populated together

**Do NOT allow:**

```text
Batch Number = blank
Expiry Date = 2028-12-31
```

**Do NOT allow:**

```text
Batch Number = BAT-001
Expiry Date = blank
```

#### Skipped State

If user selects "Skip Initial Details":

```text
Tracking Method: Batch + Expiry
Initial Batch: Not provided
Initial Expiry: Not provided
→ Future batch and expiry details will be captured in Inventory when stock is received.
```

---

### 5.3 Expiry Ownership

**LOCKED Rule:**

Expiry belongs to Batch/Lot.

Do NOT add `expiry_date` to Product master.

Correct conceptual relationship:

```text
Product / Variant
    ↓
Batch (product_batches)
    ↓
Expiry Date (batch_record.expiry_date)
```

Same Product may later have multiple batches with different expiry dates:

```text
Batch A → 2028-12-31
Batch B → 2029-03-15
Batch C → 2029-06-30
```

---

### 5.4 Batch + Expiry Summary on Review (Step 6)

**If initial Batch + Expiry entered:**

```text
Product Tracking
Method: Batch + Expiry
Initial Batch Number: BAT-2026-0001
Expiry Date: 2028-12-31
```

**If skipped:**

```text
Product Tracking
Method: Batch + Expiry
Initial Batch Number: Not provided
Initial Expiry Date: Not provided
Future batch and expiry details will be captured in Inventory.
```

---

### 5.5 Batch + Expiry Publish Behaviour

At Step 6 final publish:

**Batch + Expiry method does NOT create stock.**

- Initial Batch Number and Expiry Date persisted to `product_setup_initial_tracking`
- `product_batches` row created with `batch_number` and `expiry_date` ONLY if both fields entered
- No `stock_movements` created
- No `inventory_balances` initialized
- Actual stock receiving happens later through Inventory module

**Permission:**

```text
catalog.products.publish
```

+ subgraph recheck if `inventory_tracking` entitlement required (VERIFY).

---

## 6. Variant + Batch Assignment

### 6.1 Current Handling

For Variant Product with Batch or Batch+Expiry tracking:

Initial Batch/Expiry identity must eventually belong to the exact sellable Variant.

**Implementation Status:**

```text
REUSE EXISTING ASSIGNMENT FLOW
If existing canonical assigned_product_variant_id field
is sufficient to support assignment, use it.

Do NOT invent new assignment mechanism.
```

**Decision Status:**

Assignment UI timing (Step 5 vs Step 7 vs Review context):

```text
VERIFY DURING BACKEND/FLUTTER IMPLEMENTATION AUDIT
```

---

## 7. Draft Persistence Model

### 7.1 Functional Requirement (LOCKED)

Draft must preserve across:

- Save & Continue
- Back navigation
- Forward navigation
- Exit / Resume
- Concurrent edits

**For Quantity:**

- Product / Variant identity
- Opening Quantity value
- Outlet allocation rows (location, quantity)

**For Batch:**

- Product / Variant identity
- Initial Batch Number (if entered)
- Skip Initial Details flag (if used)

**For Batch + Expiry:**

- Product / Variant identity
- Initial Batch Number (if entered)
- Initial Expiry Date (if entered)
- Skip Initial Details flag (if used)

### 7.2 Physical Storage Design

```text
PENDING BACKEND IMPLEMENTATION AUDIT

Functional requirement above is LOCKED.

Physical storage design (JSONB vs new table vs modifying existing table):

DEFER to backend technical design phase.

Do NOT decide schema-level implementation here.
```

**What backend audit must verify:**

1. Search existing draft persistence structures
2. Determine whether current `product_setup_initial_tracking` can safely hold opening stock + outlet allocations
3. Determine whether existing DTO/JSON models already support nested data
4. Only if existing structures are insufficient, propose normalized table design
5. Do NOT add columns/tables just for convenience

---

## 8. Step 5 to Step 6 Transition

### 8.1 Continue / Next Button

From Opening Stock page:

```text
[Next → Outlet Allocation]
```

From Outlet Allocation page:

```text
[Continue → Review & Create]
```

### 8.2 Validation Before Transition

#### Quantity Path

**From Opening Stock → Outlet Allocation:**

- Opening Quantity >= 0 (required for Quantity tracking)
- Product / Variant valid and belongs to tenant

**From Outlet Allocation → Review:**

- Total outlet allocation = Opening Quantity
- All selected outlets are authorized for user
- Quantity values valid (numeric, non-negative)

#### Batch Path

**From Initial Batch Details → Review:**

- If Batch Number entered, it is valid (max 100 chars)
- Trim whitespace
- No uniqueness check (deferred to publish)

#### Batch + Expiry Path

**From Initial Batch & Expiry Details → Review:**

- If both fields entered, both are valid (Batch: max 100 chars; Expiry: valid date)
- Do NOT allow partial entry (one field filled, other blank)
- If only one field has a value, reject with clear error message requiring both or "Skip Initial Details"

---

## 9. Permissions & Entitlements

### 9.1 Step 5 Selection & Policy

**Required for Step 5 access:**

```text
catalog.products.create (fresh draft)
OR
catalog.products.update (edit published product)
```

**Entitlement:**

```text
product_catalog
```

**Selecting Quantity / Batch / Batch+Expiry:**

```text
product_catalog entitlement
(no additional special permission for policy selection)
```

### 9.2 Entering / Saving Initial Identity Values

**For Batch and Batch + Expiry (non-empty values):**

```text
Requires: inventory_tracking entitlement
(or leave as optional; VERIFY during backend audit)
```

**For Quantity Opening Stock:**

```text
VERIFY during backend audit:
Does inventory_tracking also gate Quantity opening stock?
Or only Batch/Expiry/Serial?
```

### 9.3 Publishing Step 5 Data

**Publish Quantity opening stock:**

```text
catalog.products.publish
+ tenant.stock.opening (if confirmed in backend)
+ outlet authorization scope
+ inventory_tracking entitlement (VERIFY)
```

**Publish Batch / Batch+Expiry identity:**

```text
catalog.products.publish
+ inventory_tracking entitlement (if non-empty initial values)
```

### 9.4 Permission Status Summary

```text
LOCKED:
- catalog.products.create/update for draft access
- product_catalog entitlement for Step 5 access
- catalog.products.publish for final publish

VERIFY DURING BACKEND AUDIT:
- inventory_tracking scope for Quantity vs Batch
- tenant.stock.opening permission existence + usage
- entitlement checks for opening stock mutation
```

---

## 10. Legacy / Deferred Features

### 10.1 Serial / IMEI (Status: LEGACY / DEFERRED)

**Current Implementation:**

Serial supported in old Product Setup as optional initial tracking.

**Target Decision:**

Remove Serial from new Step 5 UI.

**Rationale:**

Serial tracking is complex; focus current Product Tracking on Quantity/Batch/Batch+Expiry.

**Backward Compatibility:**

- Do NOT drop `product_setup_initial_tracking.initial_serial_number` column
- Do NOT delete `serial_numbers` table
- Existing products with Serial policy remain operational in Inventory module
- Existing drafted products with Serial values preserved
- If old draft with Serial is resumed in new UI, mark Serial as LEGACY with clear indication

**Future Enhancement:**

Serial support deferred for separate future Product Tracking expansion.

---

## 11. API Contract (TARGET — PENDING IMPLEMENTATION AUDIT)

### 11.1 Update Draft Step 5 Endpoint

`PUT /api/v1/tenant-admin/products/{productId}/draft`

**Request Body (Extended):**

```json
{
  "currentSetupStep": 5,
  "trackingMethod": "QUANTITY",
  
  "quantityTracking": {
    "openingStock": [
      {
        "productVariantId": null,
        "quantity": 100
      }
    ],
    "outletAllocations": [
      {
        "outletId": "outlet-colombo-id",
        "quantity": 60
      },
      {
        "outletId": "outlet-jaffna-id",
        "quantity": 40
      }
    ]
  },
  
  "batchTracking": {
    "initialBatchNumber": null,
    "skipInitialDetails": false
  },
  
  "batchExpiryTracking": {
    "initialBatchNumber": null,
    "initialExpiryDate": null,
    "skipInitialDetails": false
  },
  
  "expectedRowVersion": 12
}
```

**OR for Batch:**

```json
{
  "currentSetupStep": 5,
  "trackingMethod": "BATCH",
  "batchTracking": {
    "initialBatchNumber": "BAT-2026-0001",
    "skipInitialDetails": false
  },
  "expectedRowVersion": 12
}
```

**OR for Batch+Expiry:**

```json
{
  "currentSetupStep": 5,
  "trackingMethod": "BATCH_EXPIRY",
  "batchExpiryTracking": {
    "initialBatchNumber": "BAT-2026-0001",
    "initialExpiryDate": "2028-12-31",
    "skipInitialDetails": false
  },
  "expectedRowVersion": 12
}
```

**Status:** TARGET CONTRACT — IMPLEMENTATION AUDIT REQUIRED.

Do not finalize schema or implement until backend has audited existing draft structures.

---

## 12. Non-Functional Requirements

### 12.1 Security

- Tenant isolation: all queries filter by `tenant_id`
- Outlet authorization: backend validates authorized outlets only
- Permission checks: server-side only; Flutter is UX
- No data leakage: 403 if unauthorized; 404 for resource not found

### 12.2 Transactionality

Quantity publish must be atomic across:

- Product tracking policy update
- Opening Stock ledger creation
- Outlet stock movements
- Audit logging

If any part fails, rollback entire publish.

### 12.3 Idempotency

Retry of Step 5 publish must not:

- Double-post opening stock
- Create duplicate batches
- Duplicate outlet allocations

Use existing Product Setup draft idempotency model.

### 12.4 Concurrency

Use existing `expectedRowVersion` optimistic concurrency.

Step 5 must increment `products.row_version` on save.

### 12.5 Performance

Draft save: Use existing OneVerz NFR targets (no specific ms threshold; do not invent new thresholds).

Resume hydration: Use existing OneVerz NFR targets.

---

## 13. Audit & Logging

### 13.1 Audit Events (TARGET — IMPLEMENTATION)

Document events:

```text
PRODUCT_TRACKING_METHOD_CHANGED
PRODUCT_TRACKING_OPENING_STOCK_ENTERED
PRODUCT_TRACKING_OUTLET_ALLOCATION_ENTERED
PRODUCT_TRACKING_BATCH_ENTERED
PRODUCT_TRACKING_BATCH_EXPIRY_ENTERED
PRODUCT_TRACKING_INITIAL_DETAILS_SKIPPED
PRODUCT_SETUP_PUBLISH_OPENING_STOCK_CREATED
PRODUCT_SETUP_PUBLISH_BATCH_CREATED
PRODUCT_SETUP_PUBLISH_BATCH_EXPIRY_CREATED
```

Logged properties: `tenantId`, `productId`, `actorUserId`, `timestamp`, `trackingMethod`, `oldMethod`, `newMethod`, `rowVersion`.

---

## 14. Error Codes & Validation

| HTTP Status | Error Code | Message |
|---|---|---|
| **400** | `product.tracking.opening_stock_invalid` | Opening Stock quantity must be numeric and non-negative. |
| **400** | `product.tracking.outlet_allocation_mismatch` | Total outlet allocation does not equal Opening Stock. |
| **400** | `product.tracking.outlet_unauthorized` | One or more outlets are not authorized for this user. |
| **400** | `product.tracking.batch_number_invalid` | Batch Number exceeds maximum length. |
| **400** | `product.tracking.batch_expiry_requires_both` | Batch + Expiry requires both Batch Number and Expiry Date, or neither (use Skip Initial Details). |
| **400** | `product.tracking.expiry_date_invalid` | Expiry Date is not a valid date. |
| **409** | `product.tracking.duplicate_batch` | Batch Number already exists for this product. |
| **403** | `product.permission_denied` | Missing required permission for Product Setup. |
| **403** | `product.entitlement_denied` | Missing required entitlement for opening stock operation. |

---

## 15. Related Documents

- [[06_Tenant_Admin_Add_Product_6_Step_Contract.md]] (main wizard)
- [[Tenant_Admin_Step3_Product_Type_Configuration_Specification.md]] (Step 3 — current authority)
- [[Tenant_Admin_Add_Product_Review_Create_Specification.md]] (Step 6)
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]] (permissions)
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]] (decision)
- [[../../03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md]] (user journey)
- [[Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] (Quantity detailed spec — Part A SIMPLE + Part B VARIANT)

**Legacy / Historical (do NOT use as current authority):**
- [[Tenant_Admin_Product_Type_Tracking_Specification.md]] — SUPERSEDED; see Step 3 spec above


---

**STATUS: Active Target Specification**

**IMPLEMENTATION STATUS:** Backend and Flutter implementation pending.

**OUTSTANDING DECISIONS:** Marked VERIFY/PENDING above.
