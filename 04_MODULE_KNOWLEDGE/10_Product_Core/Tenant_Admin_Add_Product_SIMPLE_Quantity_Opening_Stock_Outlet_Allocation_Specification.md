<!-- title: Tenant Admin Add Product — Quantity Tracking: Opening Stock & Outlet Allocation Specification (SIMPLE & VARIANT) -->
<!-- status: Active Canonical -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-24 -->
<!-- supersedes: vague opening stock references in earlier Step 5 specs -->
<!-- extended: 2026-09-24 — VARIANT Product Quantity tracking sections added (BR-VQ-001 through BR-VQ-015) -->

# Quantity Tracking: Opening Stock & Outlet Allocation Specification (SIMPLE & VARIANT)

## 1. Executive Summary & Scope

This document defines the **canonical and approved** specification for SIMPLE Product Quantity Tracking flow within Step 5: Product Tracking of the Tenant Admin 6-step Add Product wizard.

**Canonical Flow:**

```
Step 5 Product Tracking (Select Quantity)
    ↓
Opening Stock (Internal Page 1)
    ↓
Outlet Allocation (Internal Page 2)
    ↓
Step 6 Review & Create
```

**Locked Rules:**

1. **Product Type = SIMPLE only.** This flow does NOT apply to VARIANT or BUNDLE products.
2. **Single stock owner.** SIMPLE Product uses its canonical default sellable `product_variants` row as the stock owner.
3. **Opening Stock is required.** Must be > 0 to proceed to Outlet Allocation.
4. **Outlet Allocation must fully reconcile.** Total allocated quantity must equal Opening Stock before continuing to Step 6.
5. **No product creates Outlets.** Product Setup selects existing pre-created Outlets; it never creates Outlets.
6. **No Batch fields.** Opening Stock for Quantity method does NOT include Batch Number, Expiry Date, or Serial Number. Those belong to Batch/Batch+Expiry tracking methods.
7. **Draft persists intent only.** No inventory mutations, no stock movements, no balance creation until final publish.
8. **Final publish is atomic.** Step 6 Publish creates auditable opening stock movement(s) and initializes inventory balance(s) per outlet.

---

## 2. SIMPLE Product Stock Ownership (LOCKED)

### 2.1 Canonical Relationship

```
SIMPLE Product
    ↓ [owns one default sellable variant]
product_variants row (is_sellable = true)
    ↓ [is stock owner for opening stock]
quantity (stock-tracked)
```

**Evidence:**

- SIMPLE Product receives one default `product_variants` row created during Product Setup finalization.
- This default variant is marked `is_sellable = true`.
- This variant is the ONLY stock owner for SIMPLE Quantity tracking.
- Do NOT create a second variant just for Opening Stock.
- Do NOT invent a variant-less SIMPLE stock ownership model.

### 2.2 Product / Variant Identifiers for Stock

For Opening Stock operations, use:

```
ProductId
SimpleStockOwnerReference (Backend implementation audit must determine if this maps to ProductId, draft Variant identifier, or existing ProductVariantId)
```

Stock owner reference must be resolved by the backend before persisting or posting inventory.

---

## 3. Opening Stock — Final UI/UX (CANONICAL)

### 3.1 Screen Title & Context

```
Product Tracking — Opening Stock
```

Displayed immediately after user selects "Quantity" tracking method.

### 3.2 Display Fields (Read-Only)

| Field | Source | Display Rule |
|---|---|---|
| Product Name | Step 2 Basic Details | Read-only, non-editable |
| Tracking Method | User selection on Step 5 | Display: "Quantity" (read-only) |
| Base Unit | Step 3 Product Type & Configuration | Read-only, exact UOM name/label from unit master |
| Unit Cost | Step 4 Pricing & Tax (Cost Price) | Read-only if actor has catalog.product_cost.view permission (or current equivalent). Otherwise hidden. |
| Opening Stock Value | Derived | Display only if actor has cost permission. Do not leak restricted cost. |

### 3.3 Editable Field

| Field | Rules | Validation |
|---|---|---|
| Opening Quantity | Primary user input | Required, numeric, > 0, non-negative, must follow existing inventory numeric precision (integer for whole UOM; decimal for fractional UOM) |

### 3.4 Sample Card Layout

```
┌─────────────────────────────────────────────────────────┐
│ Opening Stock                                            │
│                                                          │
│ Nestle KitKat Chocolate                                  │
│ Quantity Tracking                                        │
│                                                          │
│ Base Unit                Opening Quantity                │
│ Piece                    [ 250            ]              │
│                                                          │
│ Unit Cost                Opening Stock Value             │
│ LKR 80.00                LKR 20,000.00                   │
└─────────────────────────────────────────────────────────┘

[Back] [Cancel] [Save Draft] [Skip] [Continue →]
```

### 3.5 Validation Rules

| Rule | Condition | Error Message / Behavior |
|---|---|---|
| **Required** | Opening Quantity must be provided | "Opening Quantity is required" |
| **Positive** | Opening Quantity >= 0 | "Opening Quantity cannot be negative" |
| **Non-negative** | Opening Quantity ≥ 0 (technically; but >0 required) | Reject negative values |
| **Numeric Type** | Must be numeric (integer or decimal per UOM rules) | "Opening Quantity must be a valid number" |
| **Decimal Precision** | Follow existing inventory UOM decimal rules | "Opening Quantity exceeds allowed decimal places" (if applicable) |
| **Tenant Validation** | Product must belong to current tenant | 403 Forbidden if not |
| **Product State** | Product must exist and be in valid setup state | 404 Not Found if product missing |

### 3.6 Zero Quantity Edge Case

**Canonical Rule:**

```
Opening Quantity = 0
→ ACCEPT
→ Outlet Allocation Not Required
→ Proceed to Step 6
```

A product with zero opening stock **is** valid during Product Setup Quantity flow. Outlet allocation is skipped.

**Rationale:** Zero quantity tracking implies intent to track stock in the future, starting from zero.

---

## 4. Opening Quantity Attributes

| Attribute | Value | Notes |
|---|---|---|
| **Data Type** | Numeric (DECIMAL or INTEGER per UOM) | Use exact type from existing inventory UOM master |
| **Minimum** | >= 0 | Zero is valid for Quantity tracking |
| **Maximum** | No fixed cap (system-dependent) | Use existing inventory rules; do NOT invent a limit |
| **Precision** | Per UOM rules (integer for whole, decimal for fractional) | Query existing UOM configuration; match exactly |
| **Nullable** | NO — required field | No null/blank allowed |
| **Sign** | Positive only | Reject negative values |
| **Persistence** | Saved in draft; finalized at publish | Stored in product setup draft payload; moved to inventory at publish |

---

## 5. Unit Cost Source & Display

### 5.1 Source

Unit Cost **MUST** come from **Step 4: Pricing & Tax**.

Specifically: the **Cost Price** field selected/entered by the user on Step 4.

**Key Point:** Do NOT allow Opening Stock to define or override Cost Price. Cost Price belongs to Step 4. Opening Stock reads it.

### 5.2 Display Behavior

- **Currency:** Tenant default currency (configured during tenant setup)
- **Format:** Currency-formatted with 2 decimal places (e.g., `LKR 80.00`)
- **Editable:** NO — read-only display only
- **If Missing:** If user skipped Step 4 Pricing, or Cost Price is not set, display placeholder or "Not set"

### 5.3 Opening Stock Value Calculation

```
Opening Stock Value = Opening Quantity × Unit Cost
```

**Example:**
```
Opening Quantity = 250
Unit Cost = LKR 80.00
Opening Stock Value = 250 × 80 = LKR 20,000.00
```

**Rules:**
- **Derived field:** Read-only, calculated by frontend + revalidated by backend.
- **Persistence:** Display-only. NOT persisted as a stored field in the database.
- **Rounding:** Use tenant currency rounding rules for final display.
- **Currency:** Same currency as tenant.

---

## 6. Back Navigation & Field Preservation

### 6.1 Back Button

If user presses **Back** from Opening Stock page:

```
Opening Stock [Back]
    ↓
Step 5 Product Tracking (Quantity / Batch / Batch+Expiry selector)
```

Return to the tracking method selector.

### 6.2 Field Preservation

If user:
1. Enters Opening Quantity: `250`
2. Presses Back
3. Confirms Quantity tracking again

**Behavior:** Re-display the previously entered value `250` in the Opening Quantity field (unless user explicitly pressed Skip or navigated away entirely).

**Persistence:** Draft must preserve the Opening Quantity value across back/forward navigation.

---

## 7. Continue / Next Button & Transition to Outlet Allocation

### 7.1 Continue Button

Label: **"Continue"** or **"Next"** (use existing Product Setup action bar convention).

### 7.2 Validation Before Transition

Before allowing transition to Outlet Allocation page:

✓ Opening Quantity >= 0
✓ Numeric value
✓ Product valid and belongs to tenant
✓ UOM valid (from Step 3)
✓ Cost Price accessible from Step 4 (if present)

**If validation fails:**
- Display inline field error message (do NOT transition)
- Do NOT advance step

**If validation passes:**
- Transition to Outlet Allocation internal page
- Preserve Opening Quantity value
- Prepare outlet selector

---

## 8. Outlet Allocation — Final UI/UX (CANONICAL)

### 8.1 Screen Title & Context

```
Outlet Allocation
```

Displayed after user successfully enters Opening Quantity.

### 8.2 Display Section — Allocation Summary (Always Visible)

```
Opening Quantity       Allocated         Remaining
250 Pieces             0 Pieces          250 Pieces
```

**Calculation:**
```
Allocated = SUM(all selected outlet quantities)
Remaining = Opening Quantity - Allocated
```

**Update Rule:** UI must recalculate and display in real-time as user adds/removes/modifies outlet quantities.

### 8.3 Add Outlet Control

```
[ + Add Outlet ]
```

Primary action to select and add an outlet.

### 8.4 Outlet Selection and Quantity Entry (Modal/Inline)

When user clicks **Add Outlet**:

**Display:**
```
Select Outlet
[ Development Main Store ▼ ]  (Dropdown of authorized outlets only)

Allocated Quantity
[ 150 ]  (Numeric input)

[ Add ]
```

**Rules:**
- **Outlet Dropdown:** Display ONLY outlets the current user is authorized to allocate to (backend-authoritative; Flutter filtering is UX only).
- **Outlet Dropdown:** Do NOT pre-select; require explicit user choice.
- **Allocated Quantity:** Required, numeric, > 0 (at minimum; cannot be zero for a single allocation row).
- **Allocated Quantity validation:** Must be ≤ Remaining quantity.
- **Duplicate Prevention:** After an Outlet is selected, remove/disable it from the dropdown until its allocation row is removed.

### 8.5 Selected Allocations Display

After user adds one or more allocations:

```
Outlet                          Allocated Quantity    Action

Development Main Store          [ 150 ]               [Remove]
Jaffna Outlet                   [ 100 ]               [Remove]

[ + Add Outlet ]
```

**Rules:**
- **Display only selected outlets** — do NOT show all tenant outlets with 0/blank quantity.
- **Editable Quantity:** Allow inline editing of each allocation's quantity (or open a modal).
- **Remove Action:** Allow deletion of any allocation row; immediately update remaining calculation.
- **Quantity Input:** Same validation as Add Outlet: numeric, > 0, ≤ Remaining.

### 8.6 Sample Full Layout

```
┌─────────────────────────────────────────────────────────┐
│ Outlet Allocation                                       │
│                                                          │
│ Opening Quantity       Allocated       Remaining        │
│ 250 Pieces             0 Pieces        250 Pieces       │
│                                                          │
│ [ + Add Outlet ]                                        │
└─────────────────────────────────────────────────────────┘

[ After 1st Outlet Added ]

┌─────────────────────────────────────────────────────────┐
│                                                          │
│ Opening Quantity       Allocated       Remaining        │
│ 250 Pieces             150 Pieces      100 Pieces       │
│                                                          │
│ Outlet                   Allocated Qty    Action        │
│ Development Main Store   [ 150 ]          [Remove]      │
│                                                          │
│ [ + Add Outlet ]                                        │
└─────────────────────────────────────────────────────────┘

[ After 2nd Outlet Added ]

┌─────────────────────────────────────────────────────────┐
│                                                          │
│ Opening Quantity       Allocated       Remaining        │
│ 250 Pieces             250 Pieces      0 Pieces         │
│                                                          │
│ Outlet                   Allocated Qty    Action        │
│ Development Main Store   [ 150 ]          [Remove]      │
│ Jaffna Outlet            [ 100 ]          [Remove]      │
│                                                          │
│ [ + Add Outlet ]                                        │
└─────────────────────────────────────────────────────────┘

[Back] [Cancel] [Save Draft] [Skip] [Continue → Step 6]
```

---

## 9. Outlet Authorization & Selection Rules (LOCKED)

### 9.1 Authorized Outlet List

Backend must resolve and return ONLY outlets that:

1. Belong to the same tenant as the Product
2. Are marked ACTIVE
3. Current user has authorization to allocate stock to them

**Security:** Backend is authoritative. Flutter dropdown filtering is UX only. Backend must re-validate on every persist/publish.

### 9.2 Duplicate Outlet Prevention

**Rule:** The same Outlet may NOT appear twice in the selected allocations for the same Product Quantity tracking.

**Example Invalid State:**
```
Development Main Store   150
Development Main Store   100
```

**Enforcement:**
- After Outlet is selected in Add Outlet, disable/remove it from the dropdown until its row is removed.
- Backend must reject duplicate allocations on save/publish.
- Error message: "This outlet has already been allocated. Update the existing allocation or remove it first."

### 9.3 Cross-Tenant Outlet Rejection

If a user attempts to allocate to an Outlet belonging to a different tenant:

- **Result:** 403 Forbidden (Unauthorized)
- **Message:** "You do not have permission to allocate stock to this outlet."

---

## 10. Allocation Quantity Validation

### 10.1 Valid Allocation Quantity Rules

| Rule | Details |
|---|---|
| **Required** | Each selected outlet must have a quantity |
| **Positive** | Quantity > 0 (cannot be zero for a single allocation) |
| **Numeric** | Must be numeric, matching UOM precision rules |
| **Not Exceeds Remaining** | Quantity ≤ Remaining available allocation |
| **Non-negative** | Cannot be negative |

### 10.2 Real-Time Validation Feedback

As user enters allocation quantities:

- **Valid entry:** Accept and update Allocated / Remaining totals in real-time.
- **Invalid entry (zero):** Show inline error: "Quantity must be greater than 0"
- **Invalid entry (exceeds remaining):** Show inline error: "Quantity cannot exceed remaining allocation (X Pieces)"
- **Non-numeric input:** Show inline error: "Quantity must be a valid number"

### 10.3 Outlet Quantity Reconciliation Rules

**LOCKED RULE:**

```
SUM(Allocated Quantity per Outlet)
=
Opening Quantity
```

is **REQUIRED** before proceeding to Step 6.

**Example Valid:**
```
Opening Quantity = 250
Development Main Store = 150
Jaffna Outlet = 100
Total Allocated = 250
Remaining = 0
→ VALID: Proceed to Continue / Step 6
```

**Example Invalid (Under-Allocation):**
```
Opening Quantity = 250
Development Main Store = 200
Total Allocated = 200
Remaining = 50
→ INVALID: Cannot continue; must allocate remaining 50 or adjust allocations
```

**Example Invalid (Over-Allocation):**
```
Opening Quantity = 250
Development Main Store = 200
Jaffna Outlet = 100
Total Allocated = 300
Remaining = -50
→ INVALID: Over-allocated by 50; must reduce allocations
```

---

## 11. Continue / Continue to Step 6 Button

### 11.1 Eligibility Criteria

The **Continue** button is enabled **ONLY WHEN:**

```
Remaining = 0
AND
All allocation quantities are valid (numeric, > 0, per UOM rules)
AND
No duplicate outlets
```

### 11.2 If Ineligible

If user clicks Continue while Remaining ≠ 0 or validation fails:

- **Result:** Show validation error banner or inline errors
- **Message:** "Please allocate all opening stock before continuing. Remaining: X Pieces"
- **Do NOT advance step**

### 11.3 If Eligible

If all criteria met:

- **Result:** Transition to Step 6 Review & Create
- **Preserve:** All outlet allocation values
- **Update:** Internal draft state with confirmed outlet allocations

---

## 12. Back Button Behavior

### 12.1 Back from Outlet Allocation

If user presses **Back** from Outlet Allocation:

```
Outlet Allocation [Back]
    ↓
Opening Stock (redisplay Opening Quantity value)
```

Return to Opening Stock page with previously entered Opening Quantity value preserved.

### 12.2 Preserve Allocations

If user:
1. Enters Opening Quantity: 250
2. Adds allocations: Development=150, Jaffna=100
3. Presses Back
4. Returns to Outlet Allocation

**Behavior:** Redisplay the previously entered allocations (Development=150, Jaffna=100).

**Draft Preservation Rule:** All allocation rows must be persisted in draft across back/forward navigation.

---

## 13. Skip Behavior from Outlet Allocation (EDGE CASE)

### 13.1 Skip Button During Outlet Allocation

If user is in Outlet Allocation and presses **Skip**:

**Current Behavior (Proposal):**

```
Outcome: UNCLEAR — NEEDS CLARIFICATION

Scenario A: Skip is disabled once in Outlet Allocation
    (User MUST complete allocation or go Back to Opening Stock and Skip there)

Scenario B: Skip from Outlet Allocation → cancels Quantity tracking entirely
    (Return to Step 5 Tracking Method selector; Quantity tracking cleared)
```

**Canonical Decision (TO BE CONFIRMED):**

Use **Scenario A** — Skip button is disabled/hidden once user enters Outlet Allocation.

**Rationale:** If user selected Quantity tracking and entered Opening Quantity, they have committed to Quantity flow. Allowing Skip from Outlet Allocation is confusing. Users who change their mind must go Back to Opening Stock, then Skip there.

---

## 14. Save Draft Behavior

### 14.1 Save Draft from Opening Stock

If user clicks **Save Draft** while on Opening Stock page (before Outlet Allocation):

```
Persist:
  - trackingMethod (CONCEPTUAL PAYLOAD EXAMPLE) = "QUANTITY"
  - openingQuantity (CONCEPTUAL PAYLOAD EXAMPLE) = [entered value]
  - outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE) = [] (empty; no allocations yet)

No inventory mutations occur.

User may resume later; draft is saved server-side.
```

### 14.2 Save Draft from Outlet Allocation

If user clicks **Save Draft** while on Outlet Allocation page:

```
Persist:
  - trackingMethod (CONCEPTUAL PAYLOAD EXAMPLE) = "QUANTITY"
  - openingQuantity (CONCEPTUAL PAYLOAD EXAMPLE) = [value from Opening Stock]
  - outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE) = [all selected allocations with quantities]

No inventory mutations occur.

User may resume later; draft is saved server-side.

Note: Draft may be "incomplete" (Remaining ≠ 0).
```

**Allow Incomplete Draft:** Yes. User may save even if allocations don't fully reconcile. Backend validates at publish time.

---

## 15. Draft Persistence (LOCKED)

### 15.1 What Must Be Persisted

| Field | Persisted? | Where |
|---|---|---|
| `trackingMethod (CONCEPTUAL PAYLOAD EXAMPLE)` | YES | Draft payload |
| `openingQuantity (CONCEPTUAL PAYLOAD EXAMPLE)` | YES | Draft payload |
| `outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE)[]` | YES | Draft payload (array) |
| `outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE)[].outletId` | YES | Draft payload |
| `outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE)[].quantity` | YES | Draft payload |
| `productId` | YES | Draft context |
| `productVariantId` | YES | Draft context (default sellable variant) |

### 15.2 What Must NOT Be Persisted

| Field | Why NOT |
|---|---|
| `openingStockValue` | Derived; recalculated at display/publish |
| `allocated` | Derived; recalculated at display |
| `remaining` | Derived; recalculated at display |
| Outlet display names | Looked up at display time; not stored in draft |

### 15.3 Draft Storage Design (PENDING BACKEND AUDIT)

**Options:**

1. **Reuse existing `product_setup_initial_tracking` table:** If existing JSONB field supports nested array structures, extend it to hold `outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE)[]`.
2. **Extend existing draft payload DTO:** If `SaveProductDraftRequest` already supports polymorphic `quantityTracking (CONCEPTUAL PAYLOAD EXAMPLE)` field, reuse it.
3. **New table (if necessary):** Only if existing structures are fundamentally incompatible.

**Decision:** DEFER to backend technical design phase. Do NOT decide schema here. Backend audit must verify existing structures.

---

## 16. Resume / Hydration (Draft Reopen)

### 16.1 GET Setup Endpoint

When user resumes a saved draft:

```
GET /api/v1/tenant-admin/products/{productId}/setup
```

Backend must return:

```json
{
  "currentSetupStep": 5,
  "trackingMethod (CONCEPTUAL PAYLOAD EXAMPLE)": "QUANTITY",
  "quantityTracking (CONCEPTUAL PAYLOAD EXAMPLE)": {
    "openingQuantity (CONCEPTUAL PAYLOAD EXAMPLE)": 250,
    "outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE)": [
      {
        "outletId": "outlet-dev-main",
        "quantity": 150
      },
      {
        "outletId": "outlet-jaffna",
        "quantity": 100
      }
    ]
  }
}
```

### 16.2 Rehydration Rules

- **Redisplay values exactly as persisted** (no normalization or recalculation).
- **Outlet names:** Look up outlet names at display time; do NOT rely on stored names.
- **Cost Price:** Fetch from Step 4 Pricing state; do NOT expect it in draft payload.
- **Recalculate derived fields:** Allocated, Remaining, Opening Stock Value (from current Step 4 Cost Price).

---

## 17. Final Publish Behavior (Step 6 → Finalize)

### 17.1 Pre-Publish Validation

At Step 6 Review before final publish, backend must:

1. **Revalidate Opening Quantity**
   - Required: > 0
   - Numeric, UOM-compatible
   - Product still exists and belongs to tenant

2. **Revalidate Outlet Allocations**
   - Each outlet still authorized for user
   - Each outlet still belongs to tenant
   - Quantity > 0 and matches UOM rules
   - No duplicate outlets
   - Total allocated = Opening Quantity

3. **Revalidate Permission**
   - User has `catalog.products.publish` permission
   - User has appropriate outlet authorization (if scoped)
   - Tenant has `inventory_tracking (IMPLEMENTATION VERIFICATION REQUIRED)` entitlement (VERIFY if required)
   - Tenant has `tenant.stock.opening (IMPLEMENTATION VERIFICATION REQUIRED)` permission (if such permission exists)

### 17.2 Publish Execution (Atomic)

If all validations pass, at publish:

```
1. Create Product (activate)
2. Create/Activate Product default Variant (SIMPLE sellable)
3. Create Opening Stock Movement(s)
   - One movement per outlet
   - reason = "OPENING_STOCK"
   - quantity = allocated quantity for that outlet
   - productVariantId = default sellable variant
   - outletId = selected outlet
   - reference = productId
   - timestamp = NOW
   - actor = current user
4. Initialize/Update Inventory Balance(s)
   - One balance per (outlet, productVariant) pair
   - on_hand_quantity = allocated quantity
   - reserved = 0
   - damaged = 0
   - quarantine = 0
5. Audit Log Entry
   - event = "PRODUCT_SETUP_PUBLISH_OPENING_STOCK_CREATED"
   - metadata = { productId, productVariantId, outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE)[], actor, timestamp }
6. Commit atomically
```

**Atomicity Rule:** If ANY step fails, ROLLBACK entire transaction. Do NOT create partial state.

### 17.3 Idempotency

Retry of publish must not create duplicate movements or balances.

Use existing Product Setup draft idempotency pattern (e.g., check if already published via `is_published` flag or similar).

### 17.4 Success Response

On successful publish:

```json
{
  "status": "SUCCESS" (TO BE VERIFIED),
  "productId": "uuid",
  "productVariantId": "uuid",
  "message": "Product created successfully with opening stock"
}
```

---

## 18. Review & Create (Step 6) Summary Display

### 18.1 Quantity Tracking Section

In Step 6 Review, display:

```
Product Tracking

Method
Quantity

Opening Stock
250 Pieces

Outlet Allocation
Development Main Store    150 Pieces
Jaffna Outlet             100 Pieces
```

### 18.2 Optional: Opening Stock Value Display

```
Opening Stock Value
LKR 20,000.00
```

**Rule:** Display ONLY if approved after valuation audit. If uncertain, omit for now.

### 18.3 Edit Link

```
[Edit] link → Returns to Step 5 Product Tracking
```

User can click Edit to go back and modify quantity/allocations before final publish.

---

## 19. Outlet Authorization Matrix (Derived from Access Control)

### 19.1 Permission Context

The following permissions must be evaluated by backend:

| Permission | Required For | Verification |
|---|---|---|
| `catalog.products.publish` | Publishing product setup draft | Backend enforces; Flutter cannot assume |
| `tenant.stock.opening (IMPLEMENTATION VERIFICATION REQUIRED)` (if exists) | Initiating opening stock | VERIFY in backend permission audit |
| `inventory_tracking (IMPLEMENTATION VERIFICATION REQUIRED)` entitlement | Tracking any stock | VERIFY if required for Quantity |
| Outlet assignment scope | Selecting outlet for allocation | User-outlet relationship (query actual access model) |

### 19.2 Authorization Audit Required

Backend audit must determine:

```
□ Is tenant.stock.opening (IMPLEMENTATION VERIFICATION REQUIRED) permission enforced?
□ Is it required during draft save or only at publish?
□ Is inventory_tracking (IMPLEMENTATION VERIFICATION REQUIRED) entitlement required for Quantity method?
□ How is user-outlet authorization resolved? (by user record? by role? by delegation?)
□ Can user allocate to ALL tenant outlets, or a scoped subset?
```

Do NOT assume. Document exact implementation.

---

## 20. Functional Rules (SIMPLE Quantity Tracking)

| ID | Rule | Step |
|---|---|---|
| **BR-SQ-001** | SIMPLE Product Quantity tracking uses default sellable ProductVariant as sole stock owner. | Setup |
| **BR-SQ-002** | Opening Stock is required (> 0) for Quantity tracking method. | Step 5 |
| **BR-SQ-003** | Opening Quantity must be numeric, non-negative, and match UOM decimal rules. | Step 5 |
| **BR-SQ-004** | Opening Stock zero (0) is invalid and must be rejected. | Step 5 |
| **BR-SQ-005** | Unit Cost is read-only, sourced from Step 4 Pricing & Tax (Cost Price). | Step 5 |
| **BR-SQ-006** | Opening Stock Value is derived (Opening Qty × Unit Cost), read-only, display-only. | Step 5 |
| **BR-SQ-007** | Outlet Allocation distributes Opening Stock to one or more authorized outlets. | Step 5 |
| **BR-SQ-008** | Total outlet allocation must equal Opening Stock before proceeding to Step 6 (exact reconciliation required). | Step 5 |
| **BR-SQ-009** | The same Outlet may NOT appear twice in outlet allocations for the same SIMPLE product. | Step 5 |
| **BR-SQ-010** | Outlets are pre-existing tenant entities; Product Setup NEVER creates Outlets. | Setup |
| **BR-SQ-011** | Only outlets the current user is authorized to allocate to may be selected (backend-authoritative). | Step 5 |
| **BR-SQ-012** | Draft persistence preserves Opening Quantity and outlet allocations across back/forward navigation. | Draft |
| **BR-SQ-013** | No inventory mutations (movements, balance creation) occur during draft save. | Draft |
| **BR-SQ-014** | Final publish creates auditable opening stock movement(s) per outlet and initializes inventory balance(s). | Publish |
| **BR-SQ-015** | Publish is atomic: all movements, balances, and audit entries created together or none at all. | Publish |

---

## 21. Business Logic (SIMPLE Quantity Tracking)

### 21.1 Opening Stock Entry

```
1. Validate Opening Quantity (numeric, > 0, UOM-compatible)
2. Resolve SIMPLE stock owner (default sellable ProductVariant)
3. Resolve Base Unit from ProductVariant
4. Fetch Unit Cost from Step 4 Pricing state
5. Persist draft intent (trackingMethod (CONCEPTUAL PAYLOAD EXAMPLE), openingQuantity (CONCEPTUAL PAYLOAD EXAMPLE), productVariantId)
6. Display Opening Stock card with derived Opening Stock Value
7. Transition to Outlet Allocation
```

### 21.2 Outlet Add/Selection

```
1. Validate Outlet:
   - Exists in system
   - Belongs to same tenant
   - Is marked ACTIVE
2. Validate User Authorization:
   - User has permission to allocate to this outlet (backend-authoritative)
3. Reject if Duplicate:
   - Outlet already in allocations for this product
   - Error: "Already allocated"
4. Accept & Add:
   - Create allocation row: (outletId, quantity=0 or blank initially)
   - Remove outlet from dropdown (disable until removed)
5. Prompt for Allocation Quantity:
   - Required, > 0, ≤ Remaining
   - Accept input
6. Update Allocations List:
   - Add row with outletId and quantity
   - Recalculate Allocated, Remaining
```

### 21.3 Allocation Calculation

```
For each allocated outlet:
    allocatedTotal += outlet.quantity

remaining = openingQuantity (CONCEPTUAL PAYLOAD EXAMPLE) - allocatedTotal
```

**Real-Time Update:** Recalculate on every quantity change.

### 21.4 Quantity Validation During Allocation

```
When user enters allocation quantity:
    if quantity <= 0:
        error("Quantity must be > 0")
    elif quantity > remaining:
        error("Cannot exceed remaining allocation")
    elif NOT numeric:
        error("Must be numeric")
    elif NOT UOM-compatible (decimal rules):
        error("Invalid decimal places")
    else:
        accept()
        recalculate(remaining)
        update_ui()
```

### 21.5 Continue Eligibility Check

```
if remaining == 0 AND all quantities valid:
    enable_continue_button()
    transition_to_outlet_allocation() [if on Opening Stock]
    transition_to_step_6() [if on Outlet Allocation]
else:
    disable_continue_button()
    show_error("Allocate all opening stock before continuing")
```

### 21.6 Final Publish

```
1. Revalidate all data (same as draft validation)
2. Recheck permissions (catalog.products.publish, outlet authorization)
3. Create Product (if not yet persisted)
4. For each outlet allocation:
    a. Create stock_movements row
       - quantity = allocated quantity
       - reason = "OPENING_STOCK"
       - outlet = allocation outlet
       - product_variant_id = stock owner variant
    b. Create/Update inventory_balances row
       - on_hand_quantity = allocated quantity
       - outlet = allocation outlet
       - product_variant_id = stock owner variant
5. Audit log
6. Commit atomically
7. Return success
```

---

## 22. Non-Functional Requirements

### 22.1 Security

- **Tenant Isolation:** All queries filter by `tenant_id`
- **Outlet Authorization:** Backend validates; Flutter is UX only
- **Permission Checks:** Server-side only; no client-side auth assumed
- **No Data Leakage:** 403 if unauthorized; 404 if not found

### 22.2 Performance

- **Draft Save:** < 100ms (no N+1 per outlet)
- **Outlet Dropdown:** < 200ms (fetch authorized outlets; paginate if > 50)
- **Resume Draft:** < 200ms (hydrate with product/variant/outlet data)

### 22.3 Concurrency

- **Row Version:** Use existing `products.row_version` optimistic locking
- **Conflict:** 409 Conflict if concurrent edit detected
- **Retry:** Idempotent publish (no duplicate movements)

### 22.4 Transactionality

- **Atomicity:** Entire publish (product + movements + balances + audit) atomic
- **Rollback:** All-or-nothing; no partial state
- **Isolation:** Backend uses appropriate transaction level

### 22.5 Mobile & Tablet UX

- **Responsive:** Adapt card layout for existing responsive target widths
- **Touch-Friendly:** Buttons and inputs adequate size (≥ 44px)
- **No Horizontal Scroll:** All content visible within viewport

---

## 23. Error Codes & Validation

| HTTP Status | Error Code | Message |
|---|---|---|
| **400** | `Use existing OneVerz error code (TO BE VERIFIED)` | Opening Stock quantity is required. |
| **400** | `Use existing OneVerz error code (TO BE VERIFIED)` | Opening Stock must be greater than 0. |
| **400** | `product.quantity.opening_stock_invalid` | Opening Stock is not a valid number. |
| **400** | `product.quantity.opening_stock_decimal_invalid` | Opening Stock exceeds allowed decimal places. |
| **400** | `Use existing OneVerz error code (TO BE VERIFIED)` | Total outlet allocation (X) does not equal Opening Stock (Y). |
| **400** | `Use existing OneVerz error code (TO BE VERIFIED)` | Outlet allocation quantity must be greater than 0. |
| **400** | `product.quantity.outlet_allocation_exceeds_remaining` | Outlet allocation exceeds remaining quantity. |
| **400** | `Use existing OneVerz error code (TO BE VERIFIED)` | This outlet is already allocated. Remove or update the existing allocation. |
| **403** | `Use existing OneVerz error code (TO BE VERIFIED)` | You are not authorized to allocate to this outlet. |
| **403** | `product.quantity.permission_denied` | Missing required permission for opening stock operation. |
| **404** | `product.not_found` | Product not found. |
| **404** | `outlet.not_found` | Outlet not found. |
| **409** | `product.row_version_conflict` | Product was modified by another user. Refresh and try again. |

---

## 24. Related Documents

- [[06_Tenant_Admin_Add_Product_6_Step_Contract.md]] (main wizard)
- [[Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] (Step 5 parent spec)
- [[Tenant_Admin_Add_Product_Review_Create_Specification.md]] (Step 6)
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]] (permissions)
- [[02_Functional_Rules.md]] (Product Core functional rules)
- [[../../04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/02_Functional_Rules.md]] (Inventory foundation)
- [[../../04_MODULE_KNOWLEDGE/17_Reservations_Stock_Movements_Serial_Cost/02_Functional_Rules.md]] (Stock movements)
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]] (decision)

---

**STATUS: Active Canonical Specification**

**APPROVAL:** Locked 2026-09-24

**IMPLEMENTATION STATUS:** Pending backend and Flutter implementation

**NEXT STEPS:** Backend audit of database schema, API endpoints, and permission enforcement

---

---

# PART B — VARIANT Product Quantity Tracking: Opening Stock & Outlet Allocation Specification

<!-- status: Active Canonical -->
<!-- last_updated: 2026-09-24 -->

> **Scope:** This section defines the canonical specification for VARIANT Product Quantity Tracking within Step 5: Product Tracking of the Tenant Admin 6-step Add Product wizard.
> SIMPLE Product rules remain in Part A above and are NOT replaced or altered by this section.

---

## B-1. Executive Summary & Scope

This section defines the canonical and approved specification for **VARIANT Product Quantity Tracking** flow within Step 5: Product Tracking of the Tenant Admin 6-step Add Product wizard.

**Canonical VARIANT Quantity Flow:**

```
VARIANT Product
    ↓
Existing sellable Variants from Step 3
    ↓
Step 5 Product Tracking
    ↓
Quantity
    ↓
Variant Opening Stock (internal page 1)
    ↓
For EACH Variant:
    ├─ Opening Quantity = 0  → No Outlet Allocation required for that Variant
    └─ Opening Quantity > 0 → Variant Outlet Allocation (internal page 2)
                               → Exact per-Variant reconciliation
    ↓
All Variants valid
    ↓
Step 6 Review & Create
    ↓
Publish → Existing Inventory Domain → Variant + Outlet stock
```

**Locked Rules:**

1. **Applies to VARIANT Product only.** This section does NOT replace SIMPLE Product rules (Part A).
2. **Variants are pre-existing from Step 3.** Opening Stock MUST NOT create new Variants.
3. **Tracking policy is product-level.** Quantity tracking applies to the entire Product, not per-Variant.
4. **Each Variant is an independent stock owner.** Opening Stock is assigned per existing sellable ProductVariant.
5. **Per-Variant Opening Quantity >= 0.** Zero is valid and means no Outlet Allocation for that Variant.
6. **Per-Variant exact reconciliation.** For each Variant with OpeningQuantity > 0, SUM(allocations) must equal that Variant's OpeningQuantity.
7. **Product-total reconciliation is NOT sufficient.** Overall total cannot replace per-Variant validation.
8. **No new Outlets created.** Product Setup selects existing pre-created Outlets only.
9. **Draft stores intent only.** No inventory mutations until final publish.
10. **Final publish is atomic per Variant.** Each Variant with OpeningQuantity > 0 creates auditable opening stock movements.

---

## B-2. Preconditions (VARIANT Quantity)

### B-2.1 Variant Identity Source

```
Step 3 Product Type & Configuration
    ↓
[generates and persists actual sellable ProductVariants]
    ↓
Step 5 Product Tracking
    ↓
[REUSES those existing sellable ProductVariants]
```

Opening Stock must REUSE the actual existing ProductVariant records produced by Step 3.

Do NOT create:
- New Variant for stock purposes
- Default Variant for VARIANT Product
- Duplicate ProductVariant
- Temporary operational Variant

### B-2.2 Tracking Policy Ownership

Tracking Method selection is **product-level**:

```
Product: Classic T-Shirt
Tracking Method: Quantity
```

Do NOT allow mixed tracking methods such as:
```
Red / S = Quantity
Red / M = Batch
Blue / S = None
```

for the same Product.

**Tracking Policy = Quantity** applies across the Product; however, actual stock ownership is variant-level.

### B-2.3 Variant Stock Ownership Model

Each sellable ProductVariant is an independent stock owner:

```
Product: Classic T-Shirt
├─ ProductVariant Red / S  → independent stock owner
├─ ProductVariant Red / M  → independent stock owner
├─ ProductVariant Blue / S → independent stock owner
└─ ProductVariant Blue / M → independent stock owner
```

---

## B-3. Variant Opening Stock Page (CANONICAL)

### B-3.1 Screen Title

```
Product Tracking — Opening Stock
```

Displayed after user selects "Quantity" tracking method for a VARIANT Product.

### B-3.2 Display Fields (Read-Only)

| Field | Source | Display Rule |
|---|---|---|
| Product Name | Step 2 Basic Details | Read-only |
| Tracking Method | User selection on Step 5 | Display: "Quantity" (read-only) |
| Total Opening Stock | Derived SUM of all Variant OpeningQuantities | Display / informational only — NOT validation authority |

### B-3.3 Per-Variant Row Fields

| Field | Editable? | Rule |
|---|---|---|
| Variant Name | Read-only | Name as generated in Step 3 |
| SKU | Read-only | SKU assigned to variant in Step 3 |
| Opening Quantity | Editable per Variant | >= 0; numeric; UOM-compatible |

### B-3.4 Sample Layout

```
Product Tracking — Opening Stock

Product: Classic T-Shirt
Tracking: Quantity

Variant        SKU         Opening Quantity

Red / S        TS-R-S      [50            ]
Red / M        TS-R-M      [70            ]
Blue / S       TS-B-S      [40            ]
Blue / M       TS-B-M      [0             ]

Total Opening Stock: 160 Pieces

[Back] [Cancel] [Save Draft] [Skip] [Continue →]
```

### B-3.5 Total Opening Stock Display

```
TotalOpeningStock = SUM(all Variant OpeningQuantity)
```

Example: 50 + 70 + 40 + 0 = 160

**This is display / summary only.**

Do NOT validate against this total. Canonical validation is per-Variant.

---

## B-4. Per-Variant Opening Quantity Rules

### B-4.1 Validation Rule

For EACH sellable Variant:

```
Variant.OpeningQuantity >= 0
```

| Value | Valid? | Behaviour |
|---|---|---|
| Negative | INVALID | Reject; error: "Opening Quantity cannot be negative" |
| 0 (zero) | VALID | No Outlet Allocation required for this Variant |
| Positive | VALID | Outlet Allocation required; exact per-Variant reconciliation |

### B-4.2 Zero-Quantity Variant Rule

For a Variant with OpeningQuantity = 0:

```
Quantity tracking remains active
Outlet Allocation not required for that Variant
Do NOT create a zero allocation row
Do NOT force the user to Skip Product Tracking
```

### B-4.3 Mixed Zero/Positive Is Valid

Example (VALID):

```
Red / S   = 50
Red / M   = 0
Blue / S  = 40
Blue / M  = 0
```

Only Red / S and Blue / S require Outlet Allocation.

Zero-stock variants do NOT block Product creation.

### B-4.4 All Variants May Start at Zero

This is also valid:

```
Red / S   = 0
Red / M   = 0
Blue / S  = 0
Blue / M  = 0
```

Flow:
```
Quantity → Variant Opening Stock → all variants zero
→ Outlet Allocation not required → Step 6 Review & Create
```

Future stock may enter through the Inventory module.

---

## B-5. Outlet Allocation — Variant Level (CANONICAL)

### B-5.1 Per-Variant Allocation

Outlet Allocation operates PER VARIANT.

Example:

```
Red / S
Opening = 50

Colombo = 30
Jaffna  = 20
```

And independently:

```
Red / M
Opening = 70

Colombo = 40
Jaffna  = 30
```

Each Variant has its own:
```
Opening
Allocated
Remaining
```

### B-5.2 Per-Variant Reconciliation Rule (LOCKED)

For EACH Variant:

```
if OpeningQuantity = 0:
    allocations are not required

if OpeningQuantity > 0:
    SUM(allocations for THAT Variant) = THAT Variant.OpeningQuantity
    [required before Continue / Publish]
```

### B-5.3 Product-Total Reconciliation Is NOT Sufficient (LOCKED)

Example:

```
Red / S Opening = 50
Red / M Opening = 70
Product Total   = 120
```

This allocation is **INVALID** even though overall total matches:

```
Red / S Allocated = 70   ← WRONG: must be 50
Red / M Allocated = 50   ← WRONG: must be 70
Total Allocated   = 120  ← superficially matches, but INVALID
```

Canonical validation is PER VARIANT:
```
Red / S must reconcile to 50
Red / M must reconcile to 70
```

### B-5.4 Allocation Row Rule

For a positive-stock Variant, each allocation row:

```
AllocatedQuantity > 0
```

Zero or negative allocation row: **INVALID**.

### B-5.5 Duplicate Outlet Rule (Per Variant)

Within ONE Variant, the same OutletId must NOT appear twice:

**INVALID:**
```
Red / S
Colombo = 30
Colombo = 20   ← duplicate, INVALID
```

**VALID — same Outlet across different Variants:**
```
Red / S → Colombo = 30
Red / M → Colombo = 40
```

Because inventory ownership is variant-specific, the same physical outlet can hold stock for multiple Variants.

---

## B-6. Outlet Allocation UI Model (VARIANT)

### B-6.1 Preferred Conceptual UX

Avoid a large Variants × Outlets spreadsheet matrix. Use variant sections/cards/expandable sections:

```
Outlet Allocation

Total Opening Stock: 160
Allocated: 120
Remaining: 40

▼ Red / S
  Opening: 50
  Allocated: 50
  Remaining: 0

  Colombo 30
  Jaffna  20
  + Add Outlet

▼ Red / M
  Opening: 70
  Allocated: 70
  Remaining: 0

  Colombo 40
  Jaffna  30
  + Add Outlet

▼ Blue / S
  Opening: 40
  Allocated: 0
  Remaining: 40

  + Add Outlet

[Blue / M — Opening: 0 — Allocation not required]
```

Do NOT render every Outlet for every Variant by default.

### B-6.2 Zero-Stock Variant Display

Variants with OpeningQuantity = 0 may be:
- Omitted from allocation sections, OR
- Shown with a clear label: "No opening stock — allocation not required"

Depending on existing OneVerz UX. Do not require the user to allocate zero.

### B-6.3 Large Variant Count Scalability

For large variant sets, support conceptual filtering/search:

```
All | With Opening Stock | Zero Stock | Incomplete | Complete
```

This is a UX requirement. Do NOT prescribe a new implementation component if current Flutter architecture already has appropriate patterns.

---

## B-7. Draft, Continue & Publish Rules (VARIANT)

### B-7.1 Draft Allocation Rule

During Save Draft:

```
For each Variant:
    AllocatedTotal <= Variant.OpeningQuantity
```

Under-allocation may remain incomplete in draft.

Example (VALID draft, BLOCKED Continue):
```
Red / S
Opening = 50
Allocated = 30
Remaining = 20
→ Save Draft: ALLOWED
→ Continue: BLOCKED until Remaining reaches zero
```

### B-7.2 Continue Rule

Before Step 6, for EVERY sellable Variant:

```
Either:
    OpeningQuantity = 0

OR:
    OpeningQuantity > 0
    AND AllocatedTotal = OpeningQuantity
```

Only then: Product Tracking complete → Step 6 Review & Create.

### B-7.3 Over-Allocation Rule

At any point:

```
AllocatedTotal > Variant.OpeningQuantity
```

is **INVALID**. Do not allow Save Draft with over-allocation.

### B-7.4 Remaining Quantity (Per Variant)

```
Remaining = OpeningQuantity - AllocatedTotal
```

Derived only. Do NOT persist `Remaining` unless current implementation already does so.

### B-7.5 Edit Allocation Formula (LOCKED)

Do NOT validate an edited row using only `newQuantity <= Remaining`.

Correct per-Variant formula:

```
otherAllocated      = SUM(all other allocation rows for the same Variant)
projectedAllocated  = otherAllocated + editedQuantity
projectedRemaining  = Variant.OpeningQuantity - projectedAllocated

Valid for draft when:
    editedQuantity > 0
    AND projectedAllocated <= Variant.OpeningQuantity

Continue requires:
    projectedAllocated == Variant.OpeningQuantity
```

---

## B-8. Skip & Back Navigation (VARIANT)

### B-8.1 Skip

Skip remains available according to current Product Tracking behavior.

If user Skips while VARIANT Quantity intent is unpublished:

```
clear/deactivate unpublished Variant Quantity opening-stock intent
clear unpublished Variant outlet allocations
preserve unrelated Product/Variant configuration
do not mutate operational Inventory
do NOT delete existing published Inventory
```

### B-8.2 Back

Back navigation should preserve current in-memory Variant opening/allocation intent according to existing Product Setup behavior.

Do not regenerate Variants or lose Step 3 Variant identities.

---

## B-9. Draft Persistence — Conceptual Only

The required business intent to persist:

```
(CONCEPTUAL PAYLOAD EXAMPLE)

TrackingMethod = Quantity

Per sellable Variant:
    VariantReference        (existing ProductVariant from Step 3)
    OpeningQuantity         (>= 0)
    OutletAllocations[]
        OutletId
        AllocatedQuantity   (> 0)
```

Do NOT invent actual DTO/property names.

Backend implementation must audit existing:
- `OpeningStockDraftDto` or actual equivalents
- `StockOwners` architecture
- `ProductVariant` references
- Product Setup JSON persistence structures

Do NOT decide in documentation that this requires a new table, new JSONB column, new DTO, or new migration. That determination belongs to the backend audit.

---

## B-10. Publish Domain Boundary (VARIANT)

### B-10.1 Variant Publish

At final publish, for each Variant where OpeningQuantity > 0:

```
Product Setup Publish
    → existing Inventory / Opening Stock service
    → Stock Movement / ledger semantics
    → Inventory Balance (per Variant + per Outlet)
```

Use existing Inventory domain/service. Do NOT prescribe direct SQL. Do NOT invent movement reason names.

### B-10.2 Zero-Quantity Variant Publish

For Variant.OpeningQuantity = 0:

```
No operational opening-stock mutation should occur for that Variant
(unless existing Inventory architecture explicitly requires a zero no-op)
```

Do not create fake stock.

### B-10.3 Future Stock Ownership

Product Setup owns ONLY initial opening-stock intent and initial Variant-wise Outlet Allocation.

After Product is published:

```
Future receiving, adjustment, stock transfer,
stock count, returns, and other stock changes
→ Inventory module
```

---

## B-11. Outlet Authorization (VARIANT)

Only existing authorized Outlets may be allocated.

Product Setup must NOT create an Outlet.

Each selected Outlet must satisfy:

```
Tenant ownership
AND actor-specific Outlet authorization
```

Exact API/permission implementation remains an implementation concern (IMPLEMENTATION VERIFICATION REQUIRED). Do NOT invent a new Product Setup-specific Outlet authorization model.

---

## B-12. Permissions (VARIANT)

Reuse existing permission architecture conceptually.

Implementation must verify existing:

```
Product create/update/publish permissions
Opening Stock permission (if confirmed in backend)
Outlet authorization scope
Cost-view permission if cost is shown
```

Actual permission codes must be sourced from backend implementation. Do NOT hard-code new permission codes from documentation alone.

All permission codes marked: **(IMPLEMENTATION VERIFICATION REQUIRED)**

---

## B-13. Non-Functional Requirements (VARIANT)

Use existing OneVerz NFRs:

| NFR | Requirement |
|---|---|
| Tenant isolation | All queries filter by `tenant_id` |
| Data integrity | Per-Variant reconciliation enforced server-side |
| Atomic publish | Entire publish (product + per-variant movements + balances + audit) atomic |
| Retry safety / idempotency | Publish retry must not create duplicate movements per Variant |
| Decimal-safe quantities | All quantity calculations use decimal-safe arithmetic; no floating-point drift |
| Tablet-first usability | Variant sections/cards must be usable on tablet primary target |
| Large Variant count scalability | Conceptual filtering (All / With Opening Stock / Zero Stock / Incomplete / Complete) must be supported |
| Auditability | Opening stock posting per Variant logged with full context |

Do NOT invent specific performance thresholds (e.g. `<100ms`, `<200ms`). Use existing system NFRs for actual targets.

---

## B-14. Review & Create (Step 6) — VARIANT Quantity Summary

Step 6 must summarize Variant Quantity tracking at variant level.

Do NOT summarize only Product Total.

**Example display:**

```
Product Tracking
Method: Quantity

Total Opening Stock: 160 Pieces

Red / S
Opening Stock: 50
Colombo: 30
Jaffna: 20

Red / M
Opening Stock: 70
Colombo: 40
Jaffna: 30

Blue / S
Opening Stock: 40
Colombo: 20
Jaffna: 20

Blue / M
Opening Stock: 0
Outlet Allocation: Not required
```

Variant-level stock detail must remain visible.

---

## B-15. Functional Rules (VARIANT Quantity Tracking — LOCKED 2026-09-24)

| ID | Rule | Step |
|---|---|---|
| **BR-VQ-001** | VARIANT Product may use Quantity tracking. | Setup |
| **BR-VQ-002** | Quantity tracking policy is selected at Product level; applies to all Variants. | Step 5 |
| **BR-VQ-003** | Each sellable Variant is an independent stock owner. | Step 5 |
| **BR-VQ-004** | Each Variant Opening Quantity must be >= 0. | Step 5 |
| **BR-VQ-005** | Variant Opening Quantity = 0 is valid; requires no Outlet Allocation for that Variant. | Step 5 |
| **BR-VQ-006** | Variant Opening Quantity > 0 requires Outlet Allocation for that Variant. | Step 5 |
| **BR-VQ-007** | Allocation reconciliation is enforced independently per Variant. | Step 5 |
| **BR-VQ-008** | Each allocation quantity must be > 0. | Step 5 |
| **BR-VQ-009** | Duplicate Outlet within the same Variant is invalid. | Step 5 |
| **BR-VQ-010** | Same Outlet may hold stock for multiple Variants (valid). | Step 5 |
| **BR-VQ-011** | Draft may remain under-allocated per Variant, but must never be over-allocated per Variant. | Draft |
| **BR-VQ-012** | Continue/Publish requires exact per-Variant reconciliation for all Variants with OpeningQuantity > 0. | Step 5 / Publish |
| **BR-VQ-013** | Overall Product stock total is informational only and cannot replace per-Variant validation. | Step 5 |
| **BR-VQ-014** | Opening Stock must reuse existing sellable ProductVariants from Step 3; no new Variants created at Stock time. | Setup |
| **BR-VQ-015** | Product Setup initialises stock for Quantity-tracked Variants; future stock operations belong to Inventory. | Publish |

Authority: This document (Part B)

Parent specification: [[Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]]

---

## B-16. Related Documents

- [[06_Tenant_Admin_Add_Product_6_Step_Contract.md]] (main wizard)
- [[Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] (Step 5 parent spec)
- [[Tenant_Admin_Add_Product_Review_Create_Specification.md]] (Step 6)
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]] (permissions)
- [[02_Functional_Rules.md]] (Product Core functional rules — includes BR-VQ rules)
- [[../../13_DECISIONS_AND_CHANGES/SIMPLE_QUANTITY_OPENING_STOCK_OUTLET_ALLOCATION_CANONICAL_DECISION_2026-09-24.md]] (original SIMPLE decision; VARIANT extension 2026-09-24)
- [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification.md]] (Variant configuration — Step 3)

---

**PART B STATUS: Active Canonical Specification**

**APPROVAL:** Locked 2026-09-24

**IMPLEMENTATION STATUS:** Pending backend and Flutter implementation

**NEXT STEPS:** Backend audit of existing ProductVariant, draft persistence, and per-Variant Inventory domain publish boundary

