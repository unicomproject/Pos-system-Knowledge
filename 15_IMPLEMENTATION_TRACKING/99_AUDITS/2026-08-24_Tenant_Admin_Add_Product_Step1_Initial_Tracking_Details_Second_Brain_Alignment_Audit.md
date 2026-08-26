<!-- title: Tenant Admin Add Product Step 1 Initial Tracking Details Second Brain Alignment Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

# Tenant Admin Add Product Step 1 Initial Tracking Details Second Brain Alignment Audit

## 1. Executive Summary

Approved Product Setup change: Step 1 Basic Details now collects optional
initial Batch Number, Expiry Date, and Serial Number. The wizard stays 7 steps.
Step 2 remains tracking-policy authority. Actual identity still belongs to
inventory tables, created only at Step 7 Publish.

This audit inspected active Product Setup and Inventory Second Brain files,
read-only Flutter/backend evidence, listed contradictions, locked the safest
integration, and updated documentation. No production code, migrations, or
tests were changed in this phase.

Final verdict: **SECOND BRAIN ALIGNED — READY FOR IMPLEMENTATION**

Variant ownership, draft persistence, and data lifecycle are locked below.
Remaining items are implementation gaps, not unresolved architecture.

## 2. Sources Inspected

### Start Here

- `00_START_HERE/README.md`
- `00_START_HERE/Current_Source_Of_Truth.md`
- `00_START_HERE/Markdown_Writing_Rules.md`
- `00_START_HERE/Developer_Reading_Guide.md`
- `00_START_HERE/Project_Glossary.md`

### Product Core

- `04_MODULE_KNOWLEDGE/10_Product_Core/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Type_Tracking_Specification.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Draft_Lifecycle_Specification.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Review_Create_Specification.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Units_Pack_Conversion_Specification.md`

Note: `Tenant_Admin_Add_Product_Final_Create_Specification.md` does not exist as
a separate active file. Step 7 publish is owned by the Review & Create spec.

### UI / Flutter / Journeys / Tests / DB / Decisions / Audits

- `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md`
- `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md`
- `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
- `03_USER_JOURNEYS/Tenant_Admin/10_Inventory_Stock_Management_Flow.md`
- `03_USER_JOURNEYS/_USER_JOURNEY_TEMPLATE.md`
- `10_TESTING_QA/Test_Case/10_Product_Core/Product_Crud_Test_Cases.md`
- `10_TESTING_QA/Test_Case/10_Product_Core/Bundle_Add_Product_Test_Cases.md`
- `06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
- `06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`
- `06_DATABASE_KNOWLEDGE/Tables/17_Reservations_Stock_Movements_Serial_And_Cost_Allocation.md`
- `06_DATABASE_KNOWLEDGE/Status_And_Type_Check_Rules.md`
- `04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/*`
- `13_DECISIONS_AND_CHANGES/Scope_Change_Log.md`
- `13_DECISIONS_AND_CHANGES/Open_Questions.md`
- Product audits under `15_IMPLEMENTATION_TRACKING/99_AUDITS/` (7-step, Step 1
  image, Step 2 tracking, Step 3, Step 4, Step 5)

### Read-only implementation evidence (not modified)

- Flutter `step_1_basic_details.dart` and `AddProductWizardState` (no initial tracking fields; `currentStep` 1–7)
- Backend `SaveProductDraftRequest` (no `initialBatchNumber` / expiry / serial)
- EF snapshot: `ck_products_setup_step` = `BETWEEN 1 AND 7`
- CURRENT inventory CHECKs on `product_inventory_settings` including serial vs batch/expiry exclusivity
- `product_batches.batch_number varchar(100)`, `expiry_date`, `manufactured_at`
- `serial_numbers.serial_number varchar(150)`, `current_inventory_balance_id` nullable

## 3. Current Architecture Found

| Concern | CURRENT |
|---|---|
| Wizard | 7 steps. Step 7 Review & Create. Channel Visibility is Step 1, not a step. |
| Step 1 | Product master + images + POS/Online toggles only |
| Step 2 | Structure + tracking **policy** → `product_inventory_settings` |
| Draft | Unified `PUT .../draft` + `GET .../setup`; Product row + related setup tables |
| Batch/Expiry | `product_batches` — identity + expiry metadata, not Product master |
| Serial | `serial_numbers` — physical unit identity |
| Quantity | Opening Stock / stock receiving / stock movements |
| Bundle parent | Component-based; parent tracking forced off |
| VARIANT inventory | Exact `product_variant_id`; parent must not hold physical stock |
| SIMPLE inventory | `product_id` + `product_variant_id` NULL for batch/serial |

## 4. New Approved Requirement

Step 1 must offer optional Initial Tracking Details without knowing Step 2
policy yet. Step 2 decides applicability. Step 7 persists compatible identities
into inventory tables without fabricating stock quantity.

## 5. Contradictions Found

| ID | Finding | Resolution |
|---|---|---|
| C-01 | Active Product Type Tracking spec still says **8-stage** wizard, Stage 8 Review, `INT 1–8`, `channel_visibility.dart` | Corrected to 7-step / Step 7 / 1–7 |
| C-02 | Technical Contract `currentSetupStep=1..8` and link to `05_Tenant_Admin_Add_Product_8_Step_Contract` | Corrected to 1..7 and 7-step contract |
| C-03 | Functional Rules and Units spec still link the archived 8-step contract | Relinked |
| C-04 | 7-Step contract still says footer is shared across **all 8 wizard steps** | Corrected to 7 |
| C-05 | Table 10 still documents `CHECK(current_setup_step BETWEEN 1 AND 8)` while CURRENT EF is **1 AND 7** | Docs updated to CURRENT 1–7 |
| C-06 | Previous architecture placed actual Batch/Expiry/Serial only in inventory ops | Not rejected; integrated as draft-then-publish identity |
| C-07 | Risk of documenting `products.batch_number` etc. | Explicitly forbidden |
| C-08 | SIMPLE dummy-variant contradiction (SKU default variant vs inventory NULL variant) | Inventory identity stays `product_variant_id` NULL for SIMPLE |
| C-09 | Table 16 omits serial-vs-batch CHECK that CURRENT EF already has | Noted; policy unchanged |
| C-10 | Status rules use `manufactured_date`; table 16 / EF use `manufactured_at` | Canonical column is `manufactured_at` |
| C-11 | Step 2 skip: Type Tracking spec allows skip after structure; 7-step contract says NON-SKIPPABLE | Unchanged here; 7-step contract remains wizard-footer authority |
| C-12 | Technical Contract forbids step-specific save methods while 7-step contract also describes `SaveStep2DraftCommand` | Unrelated; unified pipeline remains canonical |
| C-13 | Review Create and Draft Lifecycle files lacked metadata-first headers | Added |
| C-14 | `initialBatchNumber` etc. did not exist anywhere in Second Brain or DTOs | Added as TARGET |

## 6. Canonical Decisions

See [[../../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP1_DECISION_2026-08-24]].

Locked: 7-step wizard; Option A API + Option B draft table; Step 2 policy
authority; inventory table final owners; no fake quantity; SIMPLE base-product
ownership; VARIANT Option 2 with Step 7 assignment; Bundle confirm-and-clear.

## 7. Step 1 Updated Contract

See [[../../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]].

Section A unchanged. Section B adds optional Batch / Expiry / Serial. None
required for Save Draft or Save & Continue. Values do not enable Step 2 toggles.

## 8. Step 2 Reconciliation Contract

Step 2 shows found Step 1 values, preserves compatible ones, and requires
confirmation before clearing incompatible ones. Confirmation API flag required.
Normalized state is what Back navigation shows.

## 9. Simple / Variant / Bundle Impact

| Structure | TARGET |
|---|---|
| SIMPLE | Publish identity to base Product (`product_variant_id` NULL) |
| VARIANT | Provisional until Step 7 `initialTrackingAssignedVariantId` |
| BUNDLE | Cannot apply to parent; confirm clear |

## 10. Draft Lifecycle

CURRENT: Step 1 fields persist on `products` / media / channels. No tracking
identity draft store.

TARGET: same wizard save/resume/back/restart pipeline, plus
`product_setup_initial_tracking`. Consumed at publish.

GAP: table, DTO fields, processors, Flutter state, resume mapping.

## 11. API Impact

TARGET fields on existing draft/setup DTOs. No new public Product Setup route.
Distinguish Initial Tracking Values from Tracking Policy. Confirmation flag and
VARIANT assignment field required.

CURRENT `SaveProductDraftRequest` / `ProductDraftResponse` lack these fields.

## 12. Database Impact

| Item | Label |
|---|---|
| `product_inventory_settings` policy columns | CURRENT — reuse |
| `product_batches` / `serial_numbers` | CURRENT final identity — write at publish only |
| `products.batch_number` etc. | NOT TARGET |
| `product_setup_initial_tracking` | TARGET / GAP |
| `current_setup_step` 1–7 | CURRENT in EF; docs were stale |

Identity-without-stock is schema-permitted. Quantity tables must not be written
from these inputs alone.

## 13. Flutter Impact

TARGET state: `initialBatchNumber`, `initialExpiryDate`, `initialSerialNumber`,
plus Step 2 reconciliation and Step 7 Review/assignment on
`AddProductWizardController`. Do not duplicate rules in widgets.

CURRENT `AddProductWizardState` and Step 1 widgets have none of this.

## 14. UI/UX Impact

Step 1 gains a compact Initial Tracking Details card; 1024×768 tablet layout
must not grow into nested scrolling. Step 2 gains a contextual found/conflict
panel. Unrelated UI unchanged.

## 15. User Journey Updated

`03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md` now includes the
Step 1 optional identity → Step 2 validate → preserve/warn → Review → persist
identity path. Inventory journey clarifies quantity remains Opening Stock /
stock actions.

## 16. Business Rules

BR-TRACK-001 through BR-TRACK-015 are canonical in the Step 1 specification and
Product Core functional rules.

## 17. Validation Rules

Syntax at Step 1. Policy reconciliation at Step 2. Uniqueness, ownership,
Bundle restriction, VARIANT assignment, and expiry-requires-batch at
finalization/publish.

## 18. Test Coverage Required

Twenty-four cases listed in `Product_Crud_Test_Cases.md` (accept fields, draft
resume, preserve/conflict, Bundle, duplicates, Review, back nav, no fake stock).
Bundle file gains an explicit parent-identity restriction case.

## 19. Files Updated

- `00_START_HERE/Current_Source_Of_Truth.md`
- `00_START_HERE/Developer_Reading_Guide.md`
- `00_START_HERE/Project_Glossary.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Type_Tracking_Specification.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Draft_Lifecycle_Specification.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Review_Create_Specification.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Units_Pack_Conversion_Specification.md`
- `04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/02_Functional_Rules.md`
- `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md`
- `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md`
- `06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
- `06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`
- `06_DATABASE_KNOWLEDGE/Tables/17_Reservations_Stock_Movements_Serial_And_Cost_Allocation.md`
- `06_DATABASE_KNOWLEDGE/Status_And_Type_Check_Rules.md`
- `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
- `03_USER_JOURNEYS/Tenant_Admin/10_Inventory_Stock_Management_Flow.md`
- `10_TESTING_QA/Test_Case/10_Product_Core/Product_Crud_Test_Cases.md`
- `10_TESTING_QA/Test_Case/10_Product_Core/Bundle_Add_Product_Test_Cases.md`
- `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md`
- `13_DECISIONS_AND_CHANGES/Scope_Change_Log.md`
- `13_DECISIONS_AND_CHANGES/Open_Questions.md`

## 20. Files Created

- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification.md`
- `13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP1_DECISION_2026-08-24.md`
- `15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-24_Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Second_Brain_Alignment_Audit.md`

## 21. Files Superseded / Archived

No additional archive folder. Obsolete 8-step contracts were already archived.
Active stale 8-step wording was corrected in place.

Superseded claims:

- “Actual Batch/Expiry/Serial may only ever be captured in inventory screens”
  for Tenant Admin **manual Add Product** (inventory ops remain the lifetime
  owner for later lots/units).
- Any remaining active “8-stage / Stage 8 / `current_setup_step` 1–8” wording.

## 22. Remaining Implementation Gaps

| GAP | Work |
|---|---|
| G-01 | Flutter Step 1 card + wizard state/controller persistence |
| G-02 | Flutter Step 2 found-values panel + confirmation dialog |
| G-03 | Flutter Step 7 Review display + VARIANT assignment selector |
| G-04 | Extend `SaveProductDraftRequest` / setup/response DTOs |
| G-05 | Step processors: persist, reconcile, confirm-clear |
| G-06 | Migration `product_setup_initial_tracking` |
| G-07 | Publish: create identity rows; consume draft; no qty/movement |
| G-08 | Map identity-only `product_batches.status` and `serial_numbers.serial_status` to existing inventory constants (no invented Product-level serial) |
| G-09 | Automated tests for the 24 cases |

G-08 is an implementation mapping gap, not an ownership blocker.

## 23. Final Second Brain Verdict

**SECOND BRAIN ALIGNED — READY FOR IMPLEMENTATION**
