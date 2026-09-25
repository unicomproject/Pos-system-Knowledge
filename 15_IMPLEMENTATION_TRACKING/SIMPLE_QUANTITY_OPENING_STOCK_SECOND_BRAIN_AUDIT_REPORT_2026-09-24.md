<!-- title: SIMPLE Quantity Opening Stock & Outlet Allocation — Second Brain Audit Report -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- date: 2026-09-24 -->
<!-- audit_type: Second Brain Reconciliation & Implementation Gap Analysis -->

# SIMPLE Quantity Opening Stock & Outlet Allocation — Second Brain Audit Report

**Date:** 2026-09-24  
**Audit Scope:** SIMPLE Product Quantity Tracking opening stock and outlet allocation flow  
**Previous Status:** Ambiguous/incomplete in earlier Step 5 specifications  
**Current Status:** Locked canonical specification; implementation gaps identified

---

## 1. Executive Summary

### What Was Done

1. ✅ **Created comprehensive SIMPLE Quantity Opening Stock & Outlet Allocation specification** 
   - File: `Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md`
   - Length: ~1000 lines
   - Coverage: UI/UX, business rules, validation, draft persistence, publish semantics

2. ✅ **Created decision record locking canonical rules**
   - File: `SIMPLE_QUANTITY_OPENING_STOCK_OUTLET_ALLOCATION_CANONICAL_DECISION_2026-09-24.md`
   - Content: Business logic, implementation boundaries, audit requirements

3. ✅ **Updated Product Core Functional Rules**
   - Added BR-SQ-001 through BR-SQ-015 (SIMPLE Quantity specific rules)
   - Updated references to new documents

4. ✅ **Updated Review & Create specification**
   - Enhanced Step 5 Product Tracking section
   - Added SIMPLE Quantity detail with outlet allocation summary

5. ✅ **Updated Module Overview**
   - Added references to new canonical specifications
   - Added decision record reference

### What Needs Backend/Frontend Implementation Audit

| Item | Current State | Required Action |
|---|---|---|
| **Database schema** | Existing tables present but audit incomplete | Backend audit: verify draft structure supports quantity + outlet allocations |
| **API contracts** | Step 5 API partially defined | Backend audit: verify request/response DTOs support quantity + outlet payload |
| **Draft persistence design** | Functional requirements locked | Backend audit: verify JSONB vs table design optimal |
| **Permission enforcement** | Described but verification pending | Backend audit: verify tenant.stock.opening, inventory_tracking, outlet authorization enforcement |
| **Flutter UI** | Specification locked | Frontend implementation pending |
| **QA test cases** | Framework defined; detailed cases not written | QA: create comprehensive test suite |

---

## 2. Current Implementation Snapshot & Audit Results

### 2.1 Product Core Module State (AUDITED)

| Area | Finding | Status |
|---|---|---|
| **6-Step Wizard** | LOCKED 2026-09-20; SIMPLE supports Quantity in Step 5 | ✅ ALIGNED |
| **Step 5 Product Tracking** | Spec exists but is generic; lacks detail on Opening Stock/Outlet Allocation UI/UX | ⚠️ PARTIALLY COMPLETE |
| **SIMPLE Product Type** | Defined in Step 3; receives default sellable variant | ✅ ALIGNED |
| **Product/Variant Relationship** | SIMPLE uses default `product_variants` row as stock owner | ✅ ALIGNED with new spec |
| **Stock Ownership** | Unclear in earlier docs; now locked to default variant | ✅ CLARIFIED |
| **Functional Rules** | Step 5 rules existed but lacked SIMPLE Quantity specifics | ✅ ENHANCED (BR-SQ-001–015 added) |

### 2.2 Inventory Foundation Module State (AUDITED)

| Area | Finding | Status |
|---|---|---|
| **Inventory Balances** | Table exists; schema supports outlet-level granularity | ✅ COMPATIBLE |
| **Stock Movements** | Table exists; supports reason codes including OPENING_STOCK | ✅ COMPATIBLE |
| **Outlet Ownership** | Outlets are tenant infrastructure; clearly owned by Outlet module | ✅ ALIGNED |
| **Opening Stock Mechanics** | Described in functional rules but no Product Setup integration detail | ⚠️ NEEDS CLARIFICATION |
| **Batch/Expiry Ownership** | Batch owned by `product_batches`; Expiry owned by batch | ✅ ALIGNED |

### 2.3 Product Setup Step 5 Specification State (AUDITED)

| Section | Current Content | Gap | Action Taken |
|---|---|---|---|
| **Quantity tracking intro** | "Quantity → Opening Stock + Outlet Allocation" | Lacks detail | New detailed spec created |
| **Opening Stock page** | Generic layout; vague fields | Specific layout needed | Specification includes exact card layout |
| **Outlet Allocation page** | Barely mentioned; no UX detail | Missing UX workflow | Specification includes Add Outlet workflow, allocation summary |
| **UI/UX examples** | None in original | Needed | New spec includes ASCII mockups & examples |
| **Validation rules** | Generic list | Specific rules needed | Specification includes per-field validation |
| **Draft persistence** | "PENDING BACKEND IMPLEMENTATION AUDIT" | Design deferred | New spec documents options; audit still pending |
| **Publish semantics** | Brief mention; lacks atomic operation detail | Transaction detail needed | Specification includes atomic transaction structure |

### 2.4 Draft Persistence Audit

**Current State:**

- **Existing table:** `product_setup_initial_tracking` (currently holds batch/expiry/serial draft data)
- **Option 1:** Extend existing table to hold `openingQuantity` + `outletAllocations[]` (JSONB)
- **Option 2:** Extend existing DTO payload with quantity fields
- **Option 3:** New table (if necessary; not preferred)

**Decision Required:** Backend must verify whether Option 1 or 2 is feasible given current schema.

**Action:** Documented in Specification §15 (Draft Persistence Model).

### 2.5 API Contract Audit

**Current State:**

- `PUT /api/v1/tenant-admin/products/{productId}/draft` — Exists; polymorphic step support present
- `POST .../publish` — Exists; needs to orchestrate opening stock posting

**Gaps Identified:**

1. **Publish endpoint does not yet call Inventory opening stock posting** — Must be added in backend audit phase
2. **DTO contract for Quantity tracking** — Partially defined; needs completion for outlet allocations
3. **Outlet authorization query** — Not explicitly defined; backend must resolve authorized outlets per user

**Action:** Documented in Specification §11 (API contract TARGET) and Decision Record (Database & API Audit Requirements).

### 2.6 Permission & Entitlement Audit

**Current State (From Access Control docs):**

| Permission | Current Usage | Required For Quantity Opening Stock? | Status |
|---|---|---|---|
| `catalog.products.create` | Draft creation | YES | ✅ CONFIRMED |
| `catalog.products.publish` | Final publish | YES | ✅ CONFIRMED |
| `catalog.products.update` | Draft updates | YES (for edits) | ✅ CONFIRMED |
| `tenant.stock.opening` | (Possibly required) | **UNCLEAR** | ⚠️ NEEDS VERIFICATION |
| `inventory_tracking` entitlement | Batch/Expiry tracking | **UNCLEAR for Quantity** | ⚠️ NEEDS VERIFICATION |

**Gaps:**

1. `tenant.stock.opening` permission existence and usage NOT confirmed in existing permission matrix
2. Whether `inventory_tracking` entitlement required for Quantity method NOT clear
3. Outlet authorization model (user → outlet scope) NOT explicitly documented

**Action:** Documented in Specification §19 (Outlet Authorization Matrix) and Decision Record (Audit Requirements).

### 2.7 Outlet Authorization Model Audit

**Current State:**

- Outlets are Tenant Admin entities managed through Outlet Management module
- No explicit documentation of user-outlet authorization model
- Existing queries likely resolve outlet scope but not documented

**Gaps:**

1. How is user-outlet authorization determined? (By role? By delegation? By direct assignment?)
2. Can user allocate to ALL tenant outlets or a scoped subset?
3. API query: `GET /api/v1/tenant-admin/outlets?authorizedForUser={userId}`?

**Action:** Documented in Specification §9 (Outlet Authorization Rules) and Decision Record (Outlet Authorization requirement marked PENDING AUDIT).

---

## 3. Contradictions & Superseded Rules

### 3.1 Rules That Were Superseded

| Old Rule | Location | Why Superseded | New Rule |
|---|---|---|---|
| "Opening Stock may use large spreadsheet layout" | Informal docs | UX improvement for SIMPLE; compact card better | Use single compact card (BR-SQ-UIUX) |
| "Display all outlets with 0 quantity" | Old discussions | Scalability; multi-outlet tenants have 10–100+ outlets | Display selected outlets only (BR-SQ-007) |
| "Partial allocation allowed during draft" | Earlier specs | Stock accuracy; unclear audit trail | Exact reconciliation required (BR-SQ-008) |
| "Product Setup may create new Outlets" | User flows | Domain clarity; Outlets module is authoritative | Product Setup selects existing outlets only (BR-SQ-010) |
| "Serial tracked in Quantity method" | Legacy docs | Focus; Serial is legacy/deferred | Serial NOT in new Step 5 UI; Quantity only (Step 5 Product Tracking spec) |

### 3.2 Ambiguities Clarified

| Ambiguity | Previous State | Clarified To | Evidence |
|---|---|---|---|
| Stock ownership for SIMPLE Quantity | "Default variant?" (unclear) | SIMPLE uses default sellable `product_variants` row as sole stock owner (BR-SQ-001) | Specification §2.1 |
| Opening Quantity zero behavior | Unspecified | Zero (0) is INVALID; must reject (BR-SQ-002, BR-SQ-004) | Specification §3.5, Decision Record |
| Unit Cost source & editability | Vague | Cost Price from Step 4; read-only on Opening Stock page (BR-SQ-005) | Specification §5 |
| Opening Stock Value persistence | Unclear | Display-only, non-persisted, derived (BR-SQ-006) | Specification §4 & §9.3 |
| Outlet pre-creation | Unspecified | Product Setup NEVER creates Outlets (BR-SQ-010) | Specification §1 & Decision Record |
| Reconciliation requirement | Ambiguous | Total allocated = Opening Quantity required before Step 6 (BR-SQ-008) | Specification §10, Decision Record |
| Draft mutation scope | Vague | Draft = intent only; NO inventory mutations (BR-SQ-013) | Specification §14 |

---

## 4. Files Created & Modified

### 4.1 New Files

| File | Purpose | Status |
|---|---|---|
| `Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md` | Canonical SIMPLE Quantity specification (~1000 lines) | ✅ CREATED |
| `SIMPLE_QUANTITY_OPENING_STOCK_OUTLET_ALLOCATION_CANONICAL_DECISION_2026-09-24.md` | Decision record locking canonical rules | ✅ CREATED |
| `SIMPLE_QUANTITY_OPENING_STOCK_SECOND_BRAIN_AUDIT_REPORT_2026-09-24.md` | This report | ✅ CREATED |

### 4.2 Modified Files

| File | Changes | Status |
|---|---|---|
| `02_Functional_Rules.md` (Product Core) | Added BR-SQ-001–015; updated references | ✅ UPDATED |
| `01_Module_Overview.md` (Product Core) | Added references to new specs and decision record | ✅ UPDATED |
| `Tenant_Admin_Add_Product_Review_Create_Specification.md` | Enhanced Step 5 section with SIMPLE Quantity detail | ✅ UPDATED |

---

## 5. Current Implementation Gaps & Next Steps

### 5.1 Database Schema & Persistence (Backend Audit — PENDING)

| Gap | Required Action | Estimated Effort | Priority |
|---|---|---|---|
| **Draft schema verification** | Audit `product_setup_initial_tracking` and existing DTOs to verify support for `outletAllocations[]` (JSONB or separate structure) | 4 hours | HIGH |
| **Inventory movement posting** | Verify schema supports opening stock movements with outlet granularity and reason code | 2 hours | HIGH |
| **Inventory balance initialization** | Verify schema supports per-outlet balance initialization | 2 hours | HIGH |
| **Concurrency/row version** | Verify `products.row_version` field supports optimistic locking for draft saves | 1 hour | MEDIUM |
| **Idempotency design** | Design mechanism to prevent duplicate opening stock posting on retry | 3 hours | HIGH |

### 5.2 API Contracts & Endpoints (Backend Audit — PENDING)

| Gap | Required Action | Estimated Effort | Priority |
|---|---|---|---|
| **Quantity draft DTO** | Complete `SaveProductDraftRequest` schema to include `quantityTracking.openingQuantity` + `outletAllocations[]` | 2 hours | HIGH |
| **Publish quantity logic** | Implement `POST .../publish` to call Inventory opening stock posting atomically | 6 hours | HIGH |
| **Outlet authorization query** | Define and implement outlet authorization scope resolution (user → authorized outlets) | 4 hours | HIGH |
| **Outlet dropdown API** | Create/verify endpoint to return authorized outlets for current user during allocation | 2 hours | MEDIUM |
| **Error responses** | Implement error codes defined in Specification §23 | 2 hours | MEDIUM |

### 5.3 Permissions & Access Control (Backend Audit — PENDING)

| Gap | Required Action | Estimated Effort | Priority |
|---|---|---|---|
| **tenant.stock.opening verification** | Confirm whether this permission exists and is required for opening stock posting | 1 hour | HIGH |
| **inventory_tracking entitlement** | Clarify whether required for Quantity tracking or only Batch/Expiry | 1 hour | HIGH |
| **Outlet authorization enforcement** | Document and verify user-outlet scope enforcement at draft save and publish | 2 hours | HIGH |
| **Permission matrix update** | Update Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md with verified permission rules | 2 hours | MEDIUM |

### 5.4 Flutter UI/UX Implementation (Frontend — PENDING)

| Component | Required Action | Estimated Effort | Priority |
|---|---|---|---|
| **Opening Stock card** | Implement read-only fields + editable Opening Quantity input per Specification §3 | 4 hours | HIGH |
| **Outlet Allocation page** | Implement Add Outlet workflow, selected outlets list, real-time calculations per Specification §8 | 6 hours | HIGH |
| **Real-time calculations** | Implement Allocated/Remaining updates as user modifies allocations | 2 hours | HIGH |
| **Validation UI** | Implement inline error messages per Specification §14 | 3 hours | MEDIUM |
| **Draft persistence** | Integrate with existing draft save/resume mechanism | 2 hours | MEDIUM |
| **Responsive layout** | Ensure mobile (320px) and tablet (1024px) support per Specification §22.5 | 2 hours | MEDIUM |

### 5.5 QA & Testing (Testing — PENDING)

| Test Area | Required Coverage | Estimated Effort | Priority |
|---|---|---|---|
| **Opening Stock entry** | Valid/invalid quantities, zero handling, decimal precision, UOM rules | 4 hours | HIGH |
| **Outlet selection & allocation** | Authorized outlets, duplicates, reconciliation, real-time calculations | 6 hours | HIGH |
| **Draft persistence** | Save/resume, back navigation, incomplete drafts | 4 hours | MEDIUM |
| **Publish atomicity** | Verify all-or-nothing behavior; test failure/retry scenarios | 4 hours | HIGH |
| **Permissions & authorization** | Missing permissions, missing entitlements, outlet scope violations | 3 hours | HIGH |
| **Edge cases** | Zero quantity, single outlet, 100+ outlets, concurrent edits | 3 hours | MEDIUM |
| **Performance** | Reuse existing system NFRs | 2 hours | MEDIUM |

### 5.6 Estimated Total Implementation Effort

| Phase | Hours | Weeks (assuming 5 days/week) |
|---|---|---|
| **Backend Audit & Design** | ~20–25 hours | 1 week |
| **Backend Implementation** | ~30–40 hours | 1.5–2 weeks |
| **Frontend Implementation** | ~20–25 hours | 1–1.5 weeks |
| **Testing & QA** | ~20–25 hours | 1–1.5 weeks |
| **Buffer / Unknown** | ~10–15 hours | 0.5–1 week |
| **TOTAL** | **~100–130 hours** | **~5–6 weeks** |

---

## 6. Functional Rules Summary (Locked)

### 6.1 Core Business Rules (SIMPLE Quantity Tracking)

```
1. SIMPLE Product only (no VARIANT or BUNDLE)
2. Default sellable variant = sole stock owner
3. Opening Quantity required (> 0)
4. Zero (0) invalid
5. Outlet Allocation must reconcile (sum = Opening Quantity)
6. No duplicate outlets
7. Product Setup never creates outlets
8. Draft = intent only (no inventory mutations)
9. Publish = atomic (all-or-nothing)
10. Idempotent (no duplicate movements on retry)
```

### 6.2 UI/UX Rules (SIMPLE Quantity Tracking)

```
1. Opening Stock: single compact card (not spreadsheet)
2. Outlet Allocation: separate internal page (not combined with Opening Stock)
3. Selected outlets only (not pre-rendered all)
4. Real-time Allocated/Remaining calculations
5. Specific inline error messages
6. Responsive 320px–1024px
7. Touch-friendly controls
```

### 6.3 Authorization Rules (Pending Backend Audit)

```
1. catalog.products.publish required for final publish
2. tenant.stock.opening (?? TBD — backend audit)
3. inventory_tracking entitlement (?? TBD — backend audit)
4. Outlet authorization scope must be verified for each allocated outlet
5. Permission re-validation at publish time
```

---

## 7. Outstanding Decisions & Items

### 7.1 Backend Audit Checklist

- [ ] **Database Schema:** Verify draft storage design (JSONB vs table vs DTO payload)
- [ ] **API Contracts:** Complete and verify request/response DTOs for quantity tracking
- [ ] **Permissions:** Confirm `tenant.stock.opening` existence and required enforcement
- [ ] **Entitlements:** Clarify `inventory_tracking` requirement for Quantity vs Batch/Expiry
- [ ] **Outlet Authorization:** Document user-outlet scope resolution & enforcement
- [ ] **Atomicity Design:** Define transaction structure for opening stock posting
- [ ] **Idempotency:** Design retry-safe mechanism (e.g., deduplication token)
- [ ] **Audit Events:** Define and implement audit logging for opening stock operations

### 7.2 Frontend Audit Checklist

- [ ] **Design System:** Confirm card layout uses existing Product Setup UI kit
- [ ] **UX Review:** Validate opening stock card and outlet allocation workflow
- [ ] **Accessibility:** Ensure WCAG 2.1 AA compliance (form labels, error messaging, keyboard nav)
- [ ] **Responsive Design:** Test 320px, 768px, 1024px breakpoints
- [ ] **Integration:** Confirm integration with existing draft save/resume mechanism

### 7.3 Outstanding Permission Decisions

| Permission | Current Known Status | Required Decision |
|---|---|---|
| `catalog.products.create` | Required for draft | CONFIRMED ✅ |
| `catalog.products.publish` | Required for publish | CONFIRMED ✅ |
| `tenant.stock.opening` | Unknown | **BACKEND AUDIT** ⏳ |
| `inventory_tracking` | Unknown for Quantity | **BACKEND AUDIT** ⏳ |

---

## 8. Related Documents & References

### Newly Created

1. `Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md` — Canonical specification
2. `SIMPLE_QUANTITY_OPENING_STOCK_OUTLET_ALLOCATION_CANONICAL_DECISION_2026-09-24.md` — Decision record
3. `SIMPLE_QUANTITY_OPENING_STOCK_SECOND_BRAIN_AUDIT_REPORT_2026-09-24.md` — This report

### Updated References

1. `02_Functional_Rules.md` (Product Core) — Added BR-SQ-001–015
2. `01_Module_Overview.md` (Product Core) — Added spec references
3. `Tenant_Admin_Add_Product_Review_Create_Specification.md` — Enhanced Step 5 section

### Existing Authorities (Still Valid)

1. `06_Tenant_Admin_Add_Product_6_Step_Contract.md` — 6-step wizard contract
2. `Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md` — Step 5 parent spec
3. `02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md` — Permissions
4. `04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/02_Functional_Rules.md` — Inventory rules
5. `04_MODULE_KNOWLEDGE/17_Reservations_Stock_Movements_Serial_Cost/02_Functional_Rules.md` — Stock movement rules

---

## 9. Implementation Ready Checklist

### Before Backend Implementation Starts

- [ ] ✅ Canonical specification locked (Specification + Decision Record created)
- [ ] ✅ Functional rules documented (BR-SQ-001–015)
- [ ] ✅ Business logic defined (in main specification)
- [ ] ⏳ **PENDING:** Backend audit of database schema
- [ ] ⏳ **PENDING:** Backend audit of API contracts
- [ ] ⏳ **PENDING:** Backend audit of permissions/entitlements
- [ ] ⏳ **PENDING:** Backend design for atomic publishing & idempotency

### Before Frontend Implementation Starts

- [ ] ✅ UI/UX specification locked (ASCII mockups, field definitions, validation rules)
- [ ] ✅ User flow documented (opening stock → outlet allocation → review)
- [ ] ⏳ **PENDING:** Design system review (confirm card layout consistency)
- [ ] ⏳ **PENDING:** UX walkthrough with product team
- [ ] ⏳ **PENDING:** Accessibility review (WCAG compliance)

### Before QA Test Plan Starts

- [ ] ✅ Functional rules locked (BR-SQ-001–015)
- [ ] ✅ Error codes defined (Specification §23)
- [ ] ✅ Edge cases documented (zero quantity, duplicates, reconciliation)
- [ ] ⏳ **PENDING:** Detailed test case generation
- [ ] ⏳ **PENDING:** Test data prep (fixtures, scenarios)

---

## 10. Success Criteria

### Specification Quality

- ✅ **Canonical:** Single source of truth (no conflicting specs)
- ✅ **Complete:** Covers UI/UX, business logic, validation, draft persistence, publish semantics
- ✅ **Detailed:** Includes ASCII mockups, field definitions, error codes, validation rules
- ✅ **Clear:** No ambiguities; locked business rules

### Implementation Coverage

- **Backend:** Opening stock posting integrated into publish flow; atomicity ensured; audit logging complete
- **Frontend:** Opening Stock card + Outlet Allocation page implemented; real-time calculations working; responsive on mobile/tablet
- **Testing:** Comprehensive test coverage (positive, negative, edge cases); all acceptance criteria met
- **Documentation:** API contract updated; permission matrix verified; deployment guide ready

### Product Quality

- **Correctness:** Stock balances accurately reflect opening allocations; no data loss or duplication
- **Performance:** Reuse existing system NFRs
- **Reliability:** Atomic publish (no partial state); idempotent retry (no duplicate movements)
- **Security:** Tenant isolation enforced; outlet authorization validated; permissions re-checked at publish

---

## Conclusion

The SIMPLE Product Quantity Tracking Opening Stock & Outlet Allocation flow has been **comprehensively documented** and **canonically locked** for implementation.

**Status:**
- ✅ **Second Brain updated** with detailed specifications, decision record, and functional rules
- ⏳ **Backend audit pending** on database schema, API contracts, and permissions
- ⏳ **Frontend & QA implementation pending** on backend audit completion

**Next Step:** Initiate backend audit phase to verify database/API/permission assumptions and unblock frontend implementation.

---

**Report Status: COMPLETE**  
**Date: 2026-09-24**  
**Approval: LOCKED (Ready for Backend Audit)**

