<!-- title: SIMPLE Quantity Opening Stock & Outlet Allocation — Implementation Blueprint -->
<!-- status: Active Planning -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- date: 2026-09-24 -->
<!-- phase: PRE-DEVELOPMENT AUDIT & PLANNING -->

# SIMPLE Quantity Opening Stock & Outlet Allocation — Implementation Blueprint

**Objective:** Establish the authoritative gap matrix, implementation strategy, and code ownership roadmap BEFORE development begins.

**Status:** Ready for backend team audit phase (prerequisite for coding)

---

## 1. Project Summary

### Scope

- **Feature:** SIMPLE Product Quantity Tracking with Opening Stock & Outlet Allocation
- **Product Type:** SIMPLE only (VARIANT & BUNDLE out of scope)
- **Wizard Step:** Step 5 Product Tracking (optional)
- **Internal Pages:** 2 (Opening Stock → Outlet Allocation)
- **Final Boundary:** Step 6 Review & Create (publish triggers inventory posting)

### Success Criteria

| Item | Criteria | Evidence |
|---|---|---|
| **Second Brain Authority** | Canonical specification locked; no conflicts | ✅ [[../SIMPLE_QUANTITY_OPENING_STOCK_SECOND_BRAIN_AUDIT_REPORT_2026-09-24.md]] |
| **Backend Implementation** | All APIs, DTOs, DB changes working; tests passing | ⏳ PENDING |
| **Flutter Implementation** | Opening Stock + Outlet Allocation pages working; responsive 1024×768 | ⏳ PENDING |
| **Inventory Integration** | Atomic opening stock posting; no duplicates on retry | ⏳ PENDING |
| **Testing** | Full coverage (unit, integration, widget, regression) | ⏳ PENDING |

---

## 2. Current Implementation Status (PRE-AUDIT)

### 2.1 Backend Status (PENDING DETAILED AUDIT)

**Architecture (Confirmed):**
- Layered: Domain → Application → Infrastructure → API
- Solution: `E_POS.sln` in `Unified-Commerce/src/`
- Subdirectories: E_POS.Domain, E_POS.Application, E_POS.Infrastructure, E_POS.Api

**Product Setup Implementation (Exists but Audit Required):**
- 6-step wizard API likely exists
- Draft persistence likely exists
- Step 5 Product Tracking partially implemented (Batch/Expiry tracking exists)

**Quantity Tracking (Audit Required):**
- Likely exists in legacy form; contract unknown
- Opening Stock + Outlet Allocation integration status unclear
- Draft DTO schema for quantity payload unknown

**Inventory Services (Audit Required):**
- Opening stock movement posting service likely exists
- Inventory balance initialization likely exists
- Atomic transaction wrapper status unknown

**Permission Enforcement (Audit Required):**
- `catalog.products.publish` likely enforced
- `tenant.stock.opening` permission existence uncertain
- `inventory_tracking` entitlement scope uncertain
- Outlet authorization enforcement model unknown

**Outlet Authorization (Audit Required):**
- User-outlet scope resolution mechanism unknown
- Authorization query API unknown

### 2.2 Flutter Status (PENDING DETAILED AUDIT)

**Project Structure (Confirmed):**
- Location: `Nytroz-POS-App/`
- Feature folder: `lib/features/tenant_admin/products/`
- Architecture: Riverpod + Repository pattern

**Product Setup UI (Likely Exists):**
- Scan Barcode, Basic Details, Product Type, Pricing likely implemented
- Step 5 Product Tracking likely partially implemented
- Review & Create likely exists

**Step 5 Product Tracking UI (Audit Required):**
- Tracking method selector likely exists
- Batch/Expiry initial details likely implemented
- Quantity opening stock page status unknown
- Outlet allocation page status unknown

**State Management (Audit Required):**
- Product setup Riverpod notifier structure unknown
- Draft save/resume mechanism unknown
- Internal page navigation state unknown

**Responsive Design (Audit Required):**
- Current 1024×768 tablet support unknown
- Outlet selection UX pattern unknown

### 2.3 Database Status (PENDING DETAILED AUDIT)

**Existing Tables (Likely Present):**
- `products` — Core product records
- `product_variants` — Variant details (SIMPLE products have one default sellable)
- `outlets` — Tenant outlets
- `inventory_balances` — Stock per outlet/variant
- `stock_movements` — Audit trail of movements

**Draft Persistence (Audit Required):**
- `product_setup_initial_tracking` — Exists but payload structure unclear
- Draft payload support for quantity + outlet allocations unknown
- JSONB support status unknown

**Migrations (Audit Required):**
- Latest applied migration unknown
- Need for new migration unknown
- Backward compatibility concerns unknown

---

## 3. Gap Matrix (PRE-AUDIT TEMPLATE)

This matrix will be completed after backend/Flutter/DB audits.

| Area | Canonical Requirement | Current Backend | Current Flutter | Current DB | Gap | Reuse / Modify / Add | Risk |
|---|---|---|---|---|---|---|---|
| **Stock Owner** | SIMPLE uses default sellable ProductVariant | TBD | TBD | TBD | TBD | TBD | TBD |
| **Opening Stock Draft** | Persist openingQuantity + outletAllocations[] | TBD | TBD | TBD | TBD | TBD | TBD |
| **Outlet Dropdown** | Only authorized outlets, no create action | TBD | TBD | TBD | TBD | TBD | TBD |
| **Allocation Summary** | Real-time Allocated/Remaining calculations | TBD | TBD | TBD | TBD | TBD | TBD |
| **Validation** | Opening Qty > 0, sum = opening qty | TBD | TBD | TBD | TBD | TBD | TBD |
| **Draft Persistence** | Save/resume across navigation | TBD | TBD | TBD | TBD | TBD | TBD |
| **Final Posting** | Atomic Product + Movement + Balance + Audit | TBD | TBD | TBD | TBD | TBD | TBD |
| **Permissions** | catalog.products.publish, tenant.stock.opening (?), inventory_tracking (?) | TBD | TBD | TBD | TBD | TBD | TBD |
| **Outlet Auth** | User-outlet scope enforcement | TBD | TBD | TBD | TBD | TBD | TBD |
| **Review & Create** | Display opening stock + outlet allocation summary | TBD | TBD | TBD | TBD | TBD | TBD |

---

## 4. Backend Team — Audit Checklist

### Phase 1: Code Exploration (4 hours)

**Product Setup Step 5 API:**
- [ ] Find `SaveProductDraftRequest` class
- [ ] Find `ProductDraftResponse` / `ProductSetupWizardDto`
- [ ] Find `PUT /api/v1/tenant-admin/products/{id}/draft` implementation
- [ ] Find step 5 handler/processor
- [ ] Identify current tracking method payload structure
- [ ] Determine whether quantity payload already exists

**Quantity Tracking Domain:**
- [ ] Find `ProductInventorySettings` / tracking configuration
- [ ] Find existing quantity draft storage (if any)
- [ ] Identify outlet allocation existing implementation
- [ ] Check for `openingQuantity` field existence
- [ ] Check for `outletAllocations` field/structure

**Inventory Services:**
- [ ] Find stock movement creation service
- [ ] Find inventory balance initialization/update service
- [ ] Find `StockMovementReason` enum (verify `OPENING_STOCK` exists)
- [ ] Identify atomic transaction wrapper pattern

**Authorization:**
- [ ] Find permission enforcement for `catalog.products.publish`
- [ ] Search for `tenant.stock.opening` permission (if it exists)
- [ ] Find `inventory_tracking` entitlement check location
- [ ] Identify outlet authorization service/helper

**Outlet Authorization:**
- [ ] Find user-outlet scope resolution logic
- [ ] Find authorized outlet lookup query
- [ ] Identify authorization error handling pattern

### Phase 2: Database Schema Audit (2 hours)

**Migrations & Schema:**
- [ ] List all recent migrations
- [ ] Inspect `product_setup_initial_tracking` table schema
- [ ] Check `products` table for draft fields
- [ ] Verify `product_variants` default for SIMPLE
- [ ] Confirm `outlets` table structure
- [ ] Verify `inventory_balances` outlet granularity
- [ ] Check `stock_movements` schema

**JSONB Support:**
- [ ] Confirm PostgreSQL JSONB support enabled
- [ ] Check existing JSONB usage patterns in codebase
- [ ] Verify EF Core JSONB property mapping (if applicable)

### Phase 3: Design Decisions (3 hours)

**Draft Persistence Design:**
- Evaluate: Extend `product_setup_initial_tracking` vs modify DTO vs new table
- Decision: Which option is lowest-risk & maintains backward compatibility?

**Outlet Authorization Design:**
- Document exact user-outlet scope resolution
- Identify single source of truth for authorization

**Atomic Transaction Design:**
- Map Product Setup publish → Inventory posting transaction boundary
- Identify idempotency key strategy
- Design retry safety mechanism

**API Contract Finalization:**
- Finalize request/response DTOs for quantity + outlet allocation
- Finalize error codes (map to Specification §23)

### Phase 4: Verify Permission Model (2 hours)

- [ ] Confirm `catalog.products.publish` enforcement
- [ ] Prove/disprove `tenant.stock.opening` requirement
- [ ] Prove/disprove `inventory_tracking` requirement
- [ ] Document exact enforcement points

### Phase 5: Deliverable — Backend Audit Report

**Report Should Include:**

1. **Stock Owner Verification**
   - SIMPLE uses default sellable variant
   - No new variant created
   - Proof with code reference

2. **Quantity Draft Contract**
   - Current structure
   - Required extensions
   - JSONB or alternative design chosen
   - Backward compatibility confirmed

3. **Outlet Authorization Model**
   - User-outlet scope resolution
   - Query/service name
   - Enforcement point(s)
   - Error handling

4. **Inventory Posting Design**
   - Atomic transaction boundary
   - Movement reason code (OPENING_STOCK)
   - Balance initialization per outlet
   - Idempotency strategy

5. **API Changes Required**
   - New endpoints: YES / NO
   - New DTOs: YES / NO / list
   - Modified endpoints: list
   - Error codes: map to Specification §23

6. **Database Changes Required**
   - New migration: YES / NO / list
   - Existing schema sufficient: YES / NO
   - Backward compatibility risk: LOW / MEDIUM / HIGH

7. **Permission Enforcement Status**
   - `catalog.products.publish`: CONFIRMED ENFORCED
   - `tenant.stock.opening`: CONFIRMED / NOT FOUND / UNCERTAIN
   - `inventory_tracking`: CONFIRMED / NOT FOUND / UNCERTAIN
   - Enforcement points documented

8. **Gap Matrix Completion** (filled in from Phase 1–4)

9. **Blockers & Risks**
   - Identified issues
   - Mitigation strategies
   - Recommended actions

10. **Estimated Backend Implementation Effort**
    - Feature development
    - Testing
    - Contingency

---

## 5. Flutter Team — Audit Checklist

### Phase 1: Project Exploration (3 hours)

**Product Setup Folder Structure:**
- [ ] Locate `lib/features/tenant_admin/products/`
- [ ] Identify feature subfolder organization
- [ ] Find presentation/data/domain subfolders
- [ ] Locate Product Setup controllers/notifiers
- [ ] Find existing step pages (Step 2, 3, 4, 5, 6)

**Step 5 Implementation:**
- [ ] Find Step 5 Product Tracking page
- [ ] Identify tracking method selector widget
- [ ] Find Batch tracking page (reference for architecture)
- [ ] Check current Step 5 state management
- [ ] Verify internal page navigation mechanism

**Quantity Tracking State (if exists):**
- [ ] Find quantity-related state/notifier
- [ ] Check existing opening stock attempt (if any)
- [ ] Verify outlet selection state (if any)

### Phase 2: Riverpod & State Architecture Audit (2 hours)

**State Management Pattern:**
- [ ] Identify Riverpod notifier pattern used
- [ ] Find `ProductSetupNotifier` or equivalent
- [ ] Verify `StateNotifierProvider` usage
- [ ] Check family/parameter passing
- [ ] Identify local mutable state pattern

**Draft Save/Resume Mechanism:**
- [ ] Find save draft logic
- [ ] Identify resume/rehydration logic
- [ ] Verify persistence across navigation
- [ ] Check localStorage/state preservation pattern

**Navigation State:**
- [ ] Find step navigation logic
- [ ] Identify internal page (sub-step) navigation
- [ ] Verify Back button preservation of state
- [ ] Check modal/dialog patterns for Add Outlet

### Phase 3: UI Component Audit (2 hours)

**Existing Step Pages:**
- [ ] Analyze Step 2 Basic Details layout
- [ ] Analyze Step 3 Product Type page
- [ ] Analyze Step 4 Pricing page
- [ ] Identify reusable component patterns
- [ ] Check card/container patterns
- [ ] Verify input/button styles

**Responsive Design:**
- [ ] Check 1024×768 support in existing pages
- [ ] Identify breakpoint handling
- [ ] Verify padding/margin patterns for tablet
- [ ] Check touch target sizes

**Form & Validation:**
- [ ] Find validation error display pattern
- [ ] Identify input widget patterns
- [ ] Check currency formatting (for Unit Cost display)
- [ ] Verify numeric input restrictions

### Phase 4: API Integration Audit (1 hour)

**API Client:**
- [ ] Find Product Setup API client
- [ ] Verify `PUT /api/v1/tenant-admin/products/{id}/draft`
- [ ] Check outlet dropdown API call
- [ ] Verify response parsing

### Phase 5: Design System Compliance (1 hour)

**OneVerz Design Tokens:**
- [ ] Verify orange (#FF6A00) usage
- [ ] Check existing card layouts
- [ ] Verify typography scale
- [ ] Check input control styles
- [ ] Verify button patterns

### Phase 6: Deliverable — Flutter Audit Report

**Report Should Include:**

1. **Current Step 5 Architecture**
   - Notifier pattern
   - State structure
   - Draft persistence mechanism

2. **Opening Stock Page**
   - Layout recommendation
   - State fields needed
   - Component reuse opportunities
   - Responsive design strategy

3. **Outlet Allocation Page**
   - Dialog/modal pattern recommendation
   - Add Outlet UX pattern (modal vs inline vs bottom sheet)
   - Selected outlets list UI
   - Real-time calculation mechanism

4. **State Management Plan**
   - New notifier providers needed
   - Existing provider reuse opportunities
   - State mutations (open quantity, add allocation, remove allocation)
   - Derived state (allocated, remaining)

5. **API Integration Plan**
   - Existing API reuse
   - Outlet dropdown API call
   - Request/response mapping

6. **Component Plan**
   - New components to create
   - Existing components to reuse
   - Shared widget candidates

7. **Responsive Design Verification**
   - 320px mobile
   - 768px tablet
   - 1024px tablet (primary target)
   - No horizontal scroll confirmation

8. **Estimated Flutter Implementation Effort**
   - Opening Stock page
   - Outlet Allocation page
   - State management
   - Testing
   - Contingency

---

## 6. Database Team — Audit Checklist

### Phase 1: Schema Exploration (2 hours)

**Current Tables:**
- [ ] Query `information_schema` for all product-related tables
- [ ] Query for all inventory-related tables
- [ ] Identify draft persistence tables
- [ ] Check for JSONB columns
- [ ] Verify outlet relationship structure

**Key Tables to Inspect:**
```sql
SELECT * FROM information_schema.columns 
WHERE table_name IN (
  'products', 'product_variants', 'outlets',
  'product_setup_initial_tracking', 'inventory_balances',
  'stock_movements'
)
```

### Phase 2: Migration Audit (1 hour)

**Recent Migrations:**
- [ ] List all migration files in ascending date order
- [ ] Identify latest applied migration
- [ ] Check for any draft-related migrations
- [ ] Verify JSONB support availability

### Phase 3: Draft Persistence Review (1 hour)

**Current Draft Storage:**
- [ ] Inspect `product_setup_initial_tracking` schema
- [ ] Check existing JSONB payload structure (if present)
- [ ] Verify column nullability
- [ ] Check for foreign key constraints

**Design Options:**
1. Extend existing table with quantity JSONB
2. Use existing DTO payload in API (no DB change)
3. Create new table (if existing structure incompatible)

### Phase 4: Deliverable — Database Audit Report

**Report Should Include:**

1. **Draft Persistence Storage**
   - Current `product_setup_initial_tracking` structure
   - Capacity to hold opening quantity + outlet allocations
   - Design recommendation (extend, reuse, or new table)
   - Backward compatibility impact

2. **Inventory Tables Verification**
   - `inventory_balances` supports outlet granularity
   - `stock_movements` supports OPENING_STOCK reason code
   - Atomic transaction support verified

3. **Required Migrations**
   - New migration needed: YES / NO
   - Migration script (if needed)
   - Rollback strategy

4. **Backward Compatibility**
   - Risk assessment
   - Existing data impact
   - Rollout strategy

---

## 7. Recommended Implementation Sequence

### Phase 1: Backend Audit & Design (1 week)
- Backend team completes audit checklist
- Design decisions made (draft storage, atomicity, idempotency)
- API contracts finalized
- Database migrations designed (if needed)

### Phase 2: Backend Implementation (2 weeks)
- Implement draft persistence
- Implement opening stock posting service
- Implement outlet authorization
- Write unit + integration tests
- Verify atomic transaction behavior

### Phase 3: Flutter & Frontend (1.5 weeks)
- Flutter team audits existing architecture (done in parallel with Phase 2)
- Implement Opening Stock page
- Implement Outlet Allocation page
- Implement state management
- Widget + integration tests

### Phase 4: Integration & Testing (1 week)
- End-to-end testing (backend + Flutter)
- Responsive design verification
- Permission enforcement verification
- Regression testing (Step 5, Review & Create, Batch flows)

### Phase 5: Review & Polish (0.5 week)
- Code review
- Documentation updates
- Performance verification
- Deployment preparation

---

## 8. Code Ownership & Review Points

| Component | Owner | Primary Review | Secondary Review |
|---|---|---|---|
| **Product Setup API Step 5** | Backend | Backend Lead | Tech Lead |
| **Quantity Draft DTO** | Backend | Backend Lead | Tech Lead |
| **Outlet Authorization** | Backend | Backend Lead | Sec Review |
| **Inventory Service** | Backend | Backend Lead | Inventory Expert |
| **Database Migration** | Database | DBA | Backend Lead |
| **Opening Stock Page** | Flutter | Flutter Lead | UX/Design |
| **Outlet Allocation Page** | Flutter | Flutter Lead | UX/Design |
| **State Management** | Flutter | Flutter Lead | Backend (contract) |
| **Tests** | All | QA Lead | Team |

---

## 9. Success Metrics & Sign-Off

### Backend Completion Criteria

- [ ] Audit report complete with gap matrix filled
- [ ] All code changes implemented
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Atomic transaction verified with failure/retry testing
- [ ] Idempotency verified
- [ ] Permission enforcement verified
- [ ] Outlet authorization verified
- [ ] Code review approved by Backend Lead + Tech Lead
- [ ] No new Flutter compilation errors

### Flutter Completion Criteria

- [ ] Audit report complete
- [ ] Opening Stock page implemented per Specification
- [ ] Outlet Allocation page implemented per Specification
- [ ] State management complete and tested
- [ ] Responsive design verified at 1024×768
- [ ] All widget tests passing
- [ ] All integration tests passing
- [ ] No regressions in other Product Setup steps
- [ ] `flutter analyze` clean
- [ ] Code review approved by Flutter Lead + UX/Design

### System Completion Criteria

- [ ] E2E test scenarios passing
- [ ] Permission enforcement end-to-end verified
- [ ] Performance verified (Reuse existing system NFRs)
- [ ] Batch flows not regressed
- [ ] Variant flows not regressed
- [ ] Database migration rollback tested
- [ ] Deployment plan ready

---

## 10. Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Quantity draft storage incompatible** | MEDIUM | HIGH | Audit early; design alternative before coding |
| **Outlet authorization model differs from assumption** | MEDIUM | MEDIUM | Validate with backend team during Phase 1 audit |
| **Atomic transaction not supported** | LOW | HIGH | Verify transaction support in design phase |
| **Existing Step 5 UI conflicts** | LOW | MEDIUM | Test concurrent development in feature branch |
| **Responsive design requires component refactor** | LOW | MEDIUM | Early responsive design audit of existing pages |
| **Permission model unclear** | MEDIUM | MEDIUM | Backend audit must clarify before implementation |
| **Idempotency key strategy missing** | MEDIUM | HIGH | Design strategy upfront; test thoroughly |

---

## 11. Documentation & Knowledge Transfer

### Artifacts to Produce

1. **Gap Matrix** (completed after audits)
2. **Backend Audit Report** (design decisions, code locations)
3. **Flutter Audit Report** (architecture, reuse opportunities)
4. **Database Audit Report** (schema, migrations)
5. **API Contract Finalization** (DTOs, endpoints, error codes)
6. **Implementation Guide** (step-by-step for each component)
7. **Test Plan** (all test scenarios)
8. **Deployment Guide** (migration, rollback, verification)

### Second Brain Updates

- [ ] Add implementation status to Specification document
- [ ] Update Review & Create Specification with final field mapping
- [ ] Add API Contract detail (finalized in Phase 1 audit)
- [ ] Add Database Schema mapping (from audit)
- [ ] Add Permission Matrix detail (from audit)

---

## 12. Sign-Off & Approval

| Role | Status | Date | Notes |
|---|---|---|---|
| **Product Owner** | TBD | TBD | Approve implementation sequence & timeline |
| **Backend Lead** | TBD | TBD | Approve backend audit plan |
| **Flutter Lead** | TBD | TBD | Approve Flutter audit plan |
| **Database Admin** | TBD | TBD | Approve database audit plan |
| **Tech Lead** | TBD | TBD | Approve overall implementation blueprint |

---

## Next Steps (Immediate)

1. **Backend Team:** Schedule audit kickoff; allocate 4 hours this week
2. **Flutter Team:** Schedule audit kickoff; allocate 2 hours this week
3. **Database Team:** Schedule audit kickoff; allocate 1 hour this week
4. **Tech Lead:** Review this blueprint; provide feedback
5. **Plan Sync:** Schedule Phase 1 completion sync for end of week

---

**Blueprint Status: READY FOR AUDIT KICKOFF**

**Approval Level: PLANNING PHASE**

This blueprint serves as the foundation for all development work. No production code should be written until Phase 1 audits are complete and gap matrix is filled in.

