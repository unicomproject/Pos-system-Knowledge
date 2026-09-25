<!-- title: SIMPLE Product Quantity Tracking: Opening Stock & Outlet Allocation Canonical Decision -->
<!-- status: Approved -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- date: 2026-09-24 -->
<!-- decision_id: SIMPLE-QUANTITY-OPENING-STOCK-001 -->

# SIMPLE Product Quantity Tracking: Opening Stock & Outlet Allocation — Canonical Decision

## Decision Summary

This decision document **locks** the canonical and approved specification for SIMPLE Product Quantity Tracking within the Tenant Admin 6-step Add Product wizard (Step 5: Product Tracking).

**Key Approvals:**
- Opening Stock as a single compact card (NOT a large spreadsheet)
- Outlet Allocation as separate internal page (NOT combined with Opening Stock)
- Exact reconciliation required (Total allocated = Opening Stock)
- Only SIMPLE Product support in this task (VARIANT quantity flows deferred)
- Product Setup NEVER creates Outlets

**Effective Date:** 2026-09-24

**Supersedes:** Vague Opening Stock references in earlier Step 5 specifications; informal quantity flow discussions.

---

## Context & Problem

Previous Second Brain documentation was ambiguous or incomplete regarding:

1. **Opening Stock UI/UX Detail:** Step 5 Product Tracking spec mentioned Opening Stock but did not specify exact UI layout, field display rules, or validation detail.
2. **Outlet Allocation UX:** No specification existed for how outlet selection and allocation quantities should be presented or edited.
3. **Stock Ownership:** Unclear whether SIMPLE Product creates a new variant for Opening Stock or reuses existing default variant.
4. **Reconciliation Requirement:** Unclear whether partial allocation (Allocated < Opening Stock) is allowed during draft or only at publish.
5. **No Product-Created Outlets:** Unclear whether Product Setup should support creating outlets as part of the flow.
6. **SIMPLE vs VARIANT:** Earlier specs referenced "Variant Products" for Quantity tracking without clarifying that SIMPLE and VARIANT flows differ.

**Business Impact:** Ambiguity led to:
- Unclear UI/UX implementation direction
- Potential stock ownership conflicts
- Unclear permission boundaries
- Unspecified draft persistence behavior

---

## Approved Business Rules (LOCKED)

### Product Type & Stock Ownership

| Decision | Rationale |
|---|---|
| **SIMPLE Product Only** | This specification (Part A) applies to SIMPLE Product Quantity tracking. VARIANT Quantity flows are documented in Part B (extension 2026-09-24) of the same specification file. BUNDLE products do not receive Quantity tracking in opening stock flow. | 
| **Default Sellable Variant = Stock Owner** | SIMPLE Product's canonical default sellable `product_variants` row is the SOLE stock owner for Quantity tracking. Do NOT create a second variant for Opening Stock. Reuse the default variant created during Product Setup finalization. |
| **Product/Variant IDs Required** | Backend must validate both `ProductId` and `ProductVariantId` (the default sellable variant). Both identifiers required for opening stock operations. |

### Opening Stock Flow

| Decision | Rationale |
|---|---|
| **Compact Card Layout** | Display as single compact "Opening Stock" card, NOT a large spreadsheet. Fields: Product Name, Tracking Method, Base Unit, Opening Quantity (editable), Unit Cost, Opening Stock Value. |
| **Opening Quantity >= 0** | Opening Quantity is mandatory and must be >= 0. Zero (0) is valid. Negative quantity is invalid. If zero, skip Outlet Allocation and proceed to Step 6. |
| **Unit Cost Read-Only** | Unit Cost sourced from Step 4 Pricing & Tax (Cost Price field). Display only if the actor is authorized to view cost. Do NOT allow Opening Stock to define or override Cost Price. |
| **Opening Stock Value Derived** | Calculated as `Opening Quantity × Unit Cost`. Display-only, informational, and only visible if actor is authorized to view cost. NOT persisted as stored field in database unless required. |
| **Separate Internal Pages** | Opening Stock and Outlet Allocation are separate pages, NOT combined. Opening Stock → Outlet Allocation → Step 6 Review. |

### Outlet Allocation Rules

| Decision | Rationale |
|---|---|
| **Selected Outlets Only** | Display ONLY explicitly selected outlets with allocations. Do NOT pre-render all tenant outlets with 0 quantity. This eliminates clutter for multi-outlet tenants. |
| **Exact Reconciliation Required** | SUM(allocated quantities) must equal Opening Stock before proceeding to Step 6. Under-allocation and over-allocation both rejected. "Allocate all opening stock before continuing." |
| **No Outlet Creation** | Product Setup NEVER creates Outlets. All outlets are pre-existing tenant entities managed through Tenant Admin Outlets module. Product Setup only selects and allocates to existing outlets. |
| **Duplicate Prevention** | The same Outlet CANNOT appear twice in allocations for the same SIMPLE product. After outlet selected, remove/disable from dropdown until allocation removed. Backend must also reject duplicates. |
| **Authorized Outlets Only** | Outlet dropdown filtered to outlets current user is authorized to allocate to. Backend is authoritative; Flutter filtering is UX only. Backend re-validates at save/publish. |
| **Add Outlet Workflow** | User clicks "+ Add Outlet", selects from dropdown, enters quantity, clicks "Add". Allocation row added to list. Remaining quantity recalculates in real-time. |

### Draft & Publish Boundaries

| Decision | Rationale |
|---|---|
| **Draft = Intent Only** | Save Draft persists tracking method and allocation intent but creates NO inventory mutations. No stock movements, no balance initialization during draft save. |
| **Publish = Atomic Operations** | Final publish (Step 6 button) creates: (1) Product activation, (2) Opening Stock movement(s) per outlet, (3) Inventory balance(s) per outlet, (4) Audit log. All-or-nothing transaction. |
| **Idempotency** | Retry of publish must not create duplicate movements. Use existing Product Setup draft idempotency pattern. |
| **Back Navigation Preserves State** | Back button returns to Opening Stock with previously entered values preserved. Outlet allocations persisted across navigation. |

### UX/UI Details

| Decision | Rationale |
|---|---|
| **Bottom Action Bar** | Use existing Product Setup shared action bar: [Back] [Cancel] [Save Draft] [Skip] [Continue]. Skip is allowed and clears inactive tracking intent. |
| **Real-Time Calculations** | UI recalculates Allocated and Remaining in real-time as user modifies outlet quantities. |
| **Zero Opening Quantity Bypass** | Zero (0) is valid. If zero, Outlet Allocation is bypassed. |
| **Incomplete Draft Allowed** | Allow Save Draft even if Remaining ≠ 0. Backend validates at publish. |
| **Clear Error Messages** | Specific inline errors: "Opening Quantity cannot be negative", "Cannot exceed remaining allocation", "This outlet has already been allocated", etc. |
| **Responsive Layout** | Support existing responsive target widths; tablet-first primary target. No horizontal scroll. Touch-friendly controls. |

### Permissions & Authorization

| Decision | Pending | Rationale |
|---|---|---|
| **catalog.products.publish** | LOCKED | Required for final publish. |
| **tenant.stock.opening (IMPLEMENTATION VERIFICATION REQUIRED)** | **VERIFY** | Backend audit must confirm whether this permission exists and is required. |
| **inventory_tracking (IMPLEMENTATION VERIFICATION REQUIRED)** entitlement | **VERIFY** | Unclear if required for Quantity tracking or only for Batch/Expiry. Backend audit required. |
| **Outlet Authorization Scope** | **VERIFY** | How is user-outlet relationship enforced? By user role? By delegation? By direct assignment? Backend audit required. |

---

## Implementation Boundaries (LOCKED)

### Product Core Module Owns

```
✓ Product Setup wizard orchestration (Steps 1–6)
✓ Quantity tracking method selection (Step 5)
✓ Opening Quantity entry UI
✓ Outlet selection (from existing Outlet master)
✓ Draft persistence (quantity + allocations)
✓ Final publish orchestration triggering inventory operations
✓ Permission validation coordination
```

### Inventory Module Owns

```
✓ Opening Stock movement creation & ledger
✓ Inventory balance initialization & updates
✓ Stock movement append-only truth
✓ Outlet inventory operations (outside Product Setup)
✓ Future stock receiving & adjustment
```

### NOT in Scope (This Task)

```
✓ VARIANT Product Quantity opening stock (documented in Part B — 2026-09-24 extension)
✗ Serial / IMEI Quantity opening stock (legacy/deferred)
✗ Batch Quantity opening stock (does not exist; Batch ≠ Quantity)
✗ Outlet creation/management (Tenant Admin Outlets module only)
✗ Cost valuation & accounting (Inventory module; not Product Setup)
✗ Batch/Expiry/Serial opening stock (separate tracking methods, no opening stock)
```

---

## Database & API Audit Requirements (PENDING)

Backend must audit and document:

| Item | Purpose | Status |
|---|---|---|
| `products.product_structure` | Verify SIMPLE type stored correctly | AUDIT PENDING |
| `product_variants` (default) | Verify default variant created for SIMPLE | AUDIT PENDING |
| `product_setup_initial_tracking` | Verify structure supports Quantity + allocations (JSONB) | AUDIT PENDING |
| `inventory_movements` | Verify schema supports opening stock posting | AUDIT PENDING |
| `inventory_balances` | Verify schema supports outlet-scoped initialization | AUDIT PENDING |
| `outlets` | Verify authorization model (user → outlet scope) | AUDIT PENDING |
| Draft API payload | Verify `SaveProductDraftRequest` schema supports quantity + allocations | AUDIT PENDING |
| Publish API | Verify atomic opening stock posting endpoint exists or needs creation | AUDIT PENDING |
| Permissions | Verify `tenant.stock.opening (IMPLEMENTATION VERIFICATION REQUIRED)`, `inventory_tracking (IMPLEMENTATION VERIFICATION REQUIRED)` enforcement | AUDIT PENDING |

---

## Reconciliation with Existing Documentation

### Superseded Rules

The following earlier references are **superseded** by this decision:

| Old Reference | Location | Superseded By | Reason |
|---|---|---|---|
| "Opening Stock may be large spreadsheet" | Earlier informal docs | Compact single card | UX improvement for SIMPLE |
| "Outlets pre-rendered with 0 quantity" | Earlier discussions | Selected outlets only | Scalability & clarity |
| "Partial allocation allowed in draft" | Earlier informal specs | Exact reconciliation required | Stock accuracy & audit trail |
| "Product Setup may create Outlets" | Old user flows | Product Setup selects existing outlets only | Clear domain ownership |
| "Serial in Quantity tracking" | Legacy specs | Serial is legacy/deferred, not in Quantity | Focus & scope clarity |

### Related Documents Updated

- [[../04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules.md]] — Added BR-SQ-001 through BR-SQ-015
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] — References new detailed specification; vague sections remain but deferred to detailed spec
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Review_Create_Specification.md]] — Updated Step 5 review section to reference Quantity opening stock + outlet allocation summary
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] — NEW detailed specification (authority)

---

## Implementation Guidance (Not for Code Yet)

### For Backend Team

1. **Audit existing draft persistence:** Verify `product_setup_initial_tracking` or existing DTO schema supports nested `outletAllocations (CONCEPTUAL PAYLOAD EXAMPLE)[]`.
2. **Design atomic publish transaction:** Ensure opening stock movement + inventory balance operations atomic.
3. **Implement authorization checks:** Validate `catalog.products.publish`, outlet scope, and permissions at publish time.
4. **Implement idempotency:** Prevent duplicate movements on retry.
5. **Create audit events:** Log opening stock posting with full context.

### For Frontend (Flutter)

1. **Build Opening Stock card:** Implement read-only fields + editable Opening Quantity input.
2. **Build Outlet Allocation page:** Implement summary display, Add Outlet workflow, selected outlets list.
3. **Implement real-time calculations:** Update Allocated/Remaining as user edits allocations.
4. **Implement draft persistence:** Save/resume across navigation.
5. **Implement validation UI:** Specific error messages for each validation failure.

### For QA

1. **Test opening stock entry:** Valid/invalid quantities, decimal precision, zero handling.
2. **Test outlet selection:** Authorized outlets, duplicates, dropdown filtering.
3. **Test allocation quantities:** Real-time calculations, over/under-allocation, reconciliation.
4. **Test draft persistence:** Save/resume, back navigation, incomplete drafts.
5. **Test final publish:** Atomic operations, idempotency, audit logging.
6. **Test permissions:** Missing permissions, missing entitlements, outlet authorization scope.

---

## Key Decisions Rationale

### Why Compact Card, Not Spreadsheet?

**Rationale:** SIMPLE products typically start with one or two outlets. A large spreadsheet layout adds visual clutter and cognitive overhead. A compact card is:
- Easier to scan for mobile/tablet users
- Faster to edit opening quantity
- Clear visual hierarchy (product info → input → results)
- Consistent with "SIMPLE" concept (single product type)

### Why Exact Reconciliation?

**Rationale:** Opening stock is the initial truth for inventory. Under-allocated stock creates ambiguity (where is the 50-unit remainder?). Over-allocation is impossible. Exact reconciliation ensures:
- Clear audit trail
- No "lost" stock in draft state
- Deterministic final state
- Reduced support burden (no "where is my 50 units?" questions)

### Why Selected Outlets Only?

**Rationale:** Multi-outlet tenants may have 10–100+ outlets. Pre-rendering all with 0 quantity creates:
- Scrolling fatigue
- Unclear editing intent
- Clutter
- Performance cost

Showing only selected outlets provides clarity and scales naturally.

### Why Product Setup Never Creates Outlets?

**Rationale:** Clear domain ownership. Outlets are tenant infrastructure managed through Tenant Admin Outlets module. Product Setup is for product onboarding. Conflating these:
- Unclear authorization
- Redundant UI (Outlets module exists)
- Maintenance burden (two UI entry points)
- Risk of orphaned outlets or misconfigured access

---

## Next Steps & Open Items

### Before Backend Implementation

1. ✓ Lock canonical specification (THIS DECISION)
2. ⬜ Backend audit of draft schema, inventory schema, API contracts
3. ⬜ Backend audit of permission enforcement (tenant.stock.opening (IMPLEMENTATION VERIFICATION REQUIRED), inventory_tracking (IMPLEMENTATION VERIFICATION REQUIRED), outlet authorization)
4. ⬜ Clarify whether Quantity vs Batch/Expiry share draft structure or use separate payloads

### Before Flutter Implementation

1. ✓ Lock UI/UX specification (THIS DECISION)
2. ⬜ Finalize exact field labels & help text (with product team)
3. ⬜ Finalize error message text (with UX/product team)
4. ⬜ Integrate with existing Product Setup UI kit (colors, typography, spacing)

### Before Publish/QA

1. ⬜ Create comprehensive test cases (positive, negative, edge cases)
2. ⬜ Define acceptance criteria (performance, concurrency, idempotency)
3. ⬜ Prepare audit trail verification (movement + balance creation)

---

## Sign-Off & Approval

| Role | Name | Date | Status |
|---|---|---|---|
| Product Owner | (TBD) | 2026-09-24 | APPROVED |
| Technical Lead | (TBD) | 2026-09-24 | APPROVED |
| Backend Lead | (TBD) | 2026-09-24 | PENDING AUDIT REVIEW |
| Frontend Lead | (TBD) | 2026-09-24 | PENDING AUDIT REVIEW |
| QA Lead | (TBD) | 2026-09-24 | PENDING REVIEW |

---

## References

- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] — Detailed canonical specification
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md]] — 6-step wizard contract
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] — Step 5 parent specification
- [[../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]] — Permissions matrix

---

**DECISION STATUS: LOCKED**

**APPROVAL DATE: 2026-09-24**

**CANONICAL AUTHORITY FOR:**
- SIMPLE Product Quantity opening stock UI/UX
- Outlet allocation workflow
- Draft persistence behavior
- Publish atomic operations

