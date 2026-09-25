<!-- title: CHUNK 2.1 Consistency Closure Report -->
<!-- status: Complete -->
<!-- date: 2026-09-20 -->

# CHUNK 2.1 CONSISTENCY CLOSURE REPORT
## Second Brain Documentation Consistency Status

**SCOPE:** Document consistency audit and closure status  
**DATE:** 2026-09-20  
**STATUS:** PRIMARY CANONICAL FLOW COMPLETE; CROSS-REFERENCES REQUIRE UPDATE  

---

## 1. PRIMARY CANONICAL FILES — COMPLETE ✅

These files are now the active canonical authorities and are internally consistent with the 6-step flow:

### Canonical Main Authority

| File | Status | Purpose |
|---|---|---|
| **`06_Tenant_Admin_Add_Product_6_Step_Contract.md`** | ✅ COMPLETE | Main 6-step wizard contract (replaces superseded 7-step) |
| **`Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md`** | ✅ COMPLETE | Step 5 Product Tracking (Quantity/Batch/Batch+Expiry methods) |
| **`PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md`** | ✅ COMPLETE | Formal decision record explaining restructuring rationale |

### Superseded Authority (Marked)

| File | Status | Notes |
|---|---|---|
| **`05_Tenant_Admin_Add_Product_7_Step_Contract.md`** | ⚠️ SUPERSEDED | Marked with supersession notice; kept for historical traceability |

---

## 2. FILES REQUIRING CONSISTENCY UPDATES (Priority Order)

### CRITICAL (Must Complete for Consistency)

| Priority | File | Update Required | Current Status | Complexity |
|---|---|---|---|---|
| 🔴 **P1** | `Tenant_Admin_Product_Type_Tracking_Specification.md` | Remove all Tracking toggles; consolidate Units/Packs/Variant Matrix ownership into Step 3 | PARTIALLY UPDATED (header only) | HIGH — Full rewrite needed |
| 🔴 **P1** | `09_Product_Management_Flow.md` | Rewrite main user journey from 7-step to 6-step with Product Tracking branches | STILL 7-STEP | HIGH — Full user journey rewrite |
| 🔴 **P1** | `Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md` | Create/rename to `6_Step_Permission_Matrix.md`; update step mappings | STILL 7-STEP | MEDIUM — Rename + renumber steps |

### HIGH (Important for Consistency)

| Priority | File | Update Required | Current Status | Complexity |
|---|---|---|---|---|
| 🟠 **P2** | `Tenant_Admin_Product_Units_Pack_Conversion_Specification.md` | Move ownership from Step 4 (standalone) to Step 3 (Simple Product sub-section) | STILL Step 4 | MEDIUM — Rename + refocus |
| 🟠 **P2** | `01_Module_Overview.md` | Update wizard reference from 7-step to 6-step | STILL 7-STEP | LOW — Header update only |
| 🟠 **P2** | `00_START_HERE/Developer_Reading_Guide.md` | Update to direct developers to 6-step canonical files | OUTDATED | LOW — List update only |
| 🟠 **P2** | `00_START_HERE/Current_Source_Of_Truth.md` | Update to list 6-step files as active authority | OUTDATED | LOW — List update only |

### MEDIUM (Nice-to-Have for Full Consistency)

| Priority | File | Update Required | Current Status | Complexity |
|---|---|---|---|---|
| 🟡 **P3** | `Tenant_Admin_Add_Product_Draft_Lifecycle_Specification.md` | Update step references from 7 to 6; keep Quantity draft storage marked PENDING | 7-STEP REFERENCES | LOW-MEDIUM |
| 🟡 **P3** | `Tenant_Admin_Add_Product_Review_Create_Specification.md` | Renumber to Step 6; add method-specific Tracking summary section | STEP 7 (RENUMBERED TO 6) | LOW — Mostly renumbering |
| 🟡 **P3** | `Tenant_Admin_Product_Setup_Scan_Barcode_Specification.md` | Update cross-references to downstream steps (3→3, 4→4, 5→5, 6→6) | STEP 1 OK; DOWNSTREAM REFS | LOW — Cross-ref updates |
| 🟡 **P3** | `Tenant_Admin_Product_Identifier_SKU_Barcode_Specification.md` | Clarify ownership: Step 1 acquires; Step 3 owns context; no Step 5 identifiers | REFERENCES OLD STEP 5 | LOW-MEDIUM |

---

## 3. STALE REFERENCES FOUND (NOT Exhaustive)

### Active Documents Still Mentioning 7-Step (Sample)

| Location | Context | Action |
|---|---|---|
| `02_ACCESS_CONTROL/Permission_Code_List.md` | References 7-step wizard in general descriptions | UPDATE WHEN ENCOUNTERED |
| `02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md` | May reference old step entitlements | VERIFY + UPDATE |
| `04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract.md` | May contain legacy step references | AUDIT + UPDATE |
| `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification.md` | Filename says "Step1" (legacy); content says Step 3 (current) | RENAME if updating; clarify Step 5 ownership |
| Release scope & onboarding docs | Various 7-step references in business documentation | DEFER to documentation sprint |

---

## 4. CRITICAL PATH FOR CONSISTENCY CLOSURE

### To Achieve Full Consistency, Complete (in order):

1. **Step 3 Specification Complete Rewrite** (2-3 hours)
   - Remove Tracking toggles
   - Add Units/Packs section for SIMPLE
   - Move Variant Matrix ownership to Step 3
   - Remove Step 5 references
   - Finalize naming: "Product Type & Configuration"

2. **User Journey Update** (2-3 hours)
   - Replace 7-step flow with 6-step flow
   - Add Product Tracking method branching (Skip/Quantity/Batch/Batch+Expiry)
   - Update step descriptions per new ownership
   - Add "Future Stock → Inventory" clarification

3. **Permission Matrix Rename & Update** (1-2 hours)
   - Create `Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md`
   - Renumber steps 1-6
   - Mark old 7-step matrix as superseded
   - Keep existing permission semantics

4. **Cross-Reference Cleanup** (2-3 hours)
   - Units & Pack Conversion spec ownership change
   - Draft Lifecycle step references
   - Review & Create renumbering
   - Barcode/SKU ownership clarification

5. **Developer Reading Guide Update** (30 min)
   - Point to 6-step contract as primary authority
   - List Step 5 Product Tracking spec as active

**Estimated Total:** 8-12 hours of focused documentation work.

---

## 5. DECISION: PROCEED TO CHUNK 3 STATUS

### Option A: Complete All Cross-References First (Thorough)

✅ **Advantages:**
- Full Second Brain consistency before implementation
- No ambiguity for Backend/Flutter teams
- Easier to audit later

❌ **Disadvantages:**
- 8-12 hours additional documentation work
- Delays Backend/Flutter implementation
- May uncover edge cases requiring rework

### Option B: Proceed to CHUNK 3 with Known Outstanding Updates (Pragmatic)

✅ **Advantages:**
- Primary canonical flow is locked and consistent
- Backend can begin implementation audit against 6-step contract
- Cross-references can be updated in parallel
- Documentation consistency is **tracked and known**, not hidden

❌ **Disadvantages:**
- Backend/Flutter teams must be aware of pending doc updates
- Risk of implementing against outdated cross-references
- Requires discipline to not skip documentation later

---

## 6. RECOMMENDED APPROACH: HYBRID

**Proceed to CHUNK 3 with P1 documents completed before Backend audit starts.**

**Rationale:**

The three P1 files (Step 3, User Journey, Permission Matrix) are the primary reference materials that Backend and Flutter will use.

Completing these ensures:
- ✅ 6-step flow is locked
- ✅ Ownership boundaries are clear
- ✅ Permissions are correctly scoped
- ✅ User journey is unambiguous

The P2/P3 files can be updated in parallel as documentation consistency pass (CHUNK 3+).

---

## 7. PRIMARY CANONICAL FLOW — LOCKED

### Final 6-Step Wizard (No Changes)

```
1. Scan Barcode
2. Basic Details
3. Product Type & Configuration
4. Pricing & Tax
5. Product Tracking (Optional)
6. Review & Create
```

This is now LOCKED in canonical files.

All active contradictory 7-step references must be updated to reference this flow.

---

## 8. CURRENT GIT STATUS (Product Setup Documentation)

```
NEW FILES:
+ 06_Tenant_Admin_Add_Product_6_Step_Contract.md
+ Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md
+ PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md
+ CHUNK_2_COMPLETION_REPORT_2026-09-20.md
+ CHUNK_2_1_CONSISTENCY_CLOSURE_REPORT_2026-09-20.md

MODIFIED FILES:
~ 05_Tenant_Admin_Add_Product_7_Step_Contract.md (marked superseded)
~ Tenant_Admin_Product_Type_Tracking_Specification.md (partial header update)

UNTRACKED OUTSTANDING:
- 09_Product_Management_Flow.md (needs 7→6 rewrite)
- Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md (needs rename + renumber)
- Tenant_Admin_Product_Type_Tracking_Specification.md (needs complete content rewrite)
- Cross-reference updates (P2/P3 files)
```

---

## 9. OUTSTANDING DECISIONS STILL PENDING BACKEND AUDIT

These remain unchanged from CHUNK 2:

```
🔴 Database: current_setup_step constraint (1-7 → 1-6)
🔴 Storage: Quantity draft persistence design
🔴 Permissions: tenant.stock.opening verification
🔴 Entitlements: inventory_tracking scope for Quantity
🔴 Resume: Old draft hydration logic
🔴 Backward-Compat: Serial/Bundle legacy handling
```

---

## 10. FINAL STATUS

### Second Brain State

✅ **COMPLETE FOR CHUNK 3:**
- Primary 6-step canonical flow locked
- Step 5 Product Tracking specified
- Formal decision record created
- Old 7-step marked superseded
- Canonical 6-step contract established

⏳ **OUTSTANDING (Parallel Consistency Pass):**
- Step 3 complete content rewrite
- User journey 7→6 conversion
- Permission matrix renaming + renumbering
- Cross-reference cleanup (P2/P3)

### Implementation Readiness

🟢 **BACKEND CAN BEGIN AUDIT AGAINST:**
- `06_Tenant_Admin_Add_Product_6_Step_Contract.md`
- `Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md`
- `PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md`

🟢 **FLUTTER CAN BEGIN AUDIT AGAINST:**
- Same files as Backend
- Will benefit from Step 3 complete spec (when ready)

⚠️ **MUST BE AWARE OF:**
- P1 files still requiring finalization (Step 3, User Journey, Permission Matrix)
- Implementation should reference 6-step contract as primary authority
- Cross-references will be updated in parallel

---

## 11. RECOMMENDATION

**PROCEED TO CHUNK 3: BACKEND/FLUTTER IMPLEMENTATION AUDIT**

**With the following conditions:**

1. ✅ Primary canonical 6-step flow is LOCKED
2. ✅ Backend audit must use 6-step contract as authority
3. ✅ Document P1 files (Step 3/User Journey/Permission Matrix) as CRITICAL NEXT STEP
4. ⚠️ Backend/Flutter aware that outstanding cross-references will be updated
5. ⚠️ Implementation audit must flag any 7-step references as stale

---

## 12. CHUNK 2.1 SIGN-OFF

**STATUS:** ✅ **READY FOR CHUNK 3**

Primary canonical 6-step Product Setup flow is documented, locked, and consistent.

Outstanding documentation updates are tracked and prioritized.

Backend and Flutter can begin implementation audit against established canonical authorities.

---

**Next Steps:**

1. **Immediately:** Begin Backend/Flutter audit against 6-step contract
2. **In Parallel:** Complete P1 documentation updates (Step 3, User Journey, Permission Matrix)
3. **Before Release:** Complete P2/P3 cross-reference cleanup

**Authority:**
- [[06_Tenant_Admin_Add_Product_6_Step_Contract.md]]
- [[Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]]
- [[PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]]
- [[CHUNK_2_COMPLETION_REPORT_2026-09-20.md]]

---

END OF CHUNK 2.1 REPORT
