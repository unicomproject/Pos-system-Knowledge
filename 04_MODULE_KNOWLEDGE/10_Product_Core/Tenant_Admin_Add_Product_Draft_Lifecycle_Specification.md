<!-- title: Tenant Admin Add Product Draft And Auto-Save Lifecycle Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-13 -->
<!-- supersedes: pre_scanner_first_draft_step_semantics -->

# Tenant Admin Add Product — Draft & Auto-Save Lifecycle Specification

> Scanner-first decision: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]].  
> Write-stage mapping (2026-09-13): [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]].  
> Scan context: [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]].

## 0. Scanner-First Pre-Draft Rules (LOCKED)

| Event | Draft behaviour |
|---|---|
| Random barcode scans / validation / local resolve / external lookup on Step 1 | **Do not** create abandoned `products` rows |
| Creation-path transition (`USE_THIS_PRODUCT` / `CREATE_MANUALLY` / `CONTINUE_WITH_BARCODE` / `CONTINUE_TO_BASIC_DETAILS`) | Create/restore Product **DRAFT**, persist `product_setup_scan_context`, enter Step 2 |
| Fresh persisted draft after those transitions | **`current_setup_step = 2` (Basic Details)** — scanner-first public semantics; never persist legacy processor `1` for a fresh scanner draft |
| Pure Step 1 pre-draft UI | No auto-save against a Product ID |

## 1. Core Concept & Separation of States
The Add Product Wizard operates on a persistent backend draft system, specifically separating two distinct states to prevent data loss while keeping the canonical Product List clean. **Draft states apply only after a Product ID exists** (post Step 1 creation-path).

### State A — IN-PROGRESS / HIDDEN (Auto-Save)
*   **Trigger:** Automatically triggered in the background as the user types or alters fields (debounced) on Steps 2–7.
*   **Backend Behavior:** Calls `SaveOrUpdateDraftAsync` with `wizardAction: null`.
*   **Database Implication:** Persists the entered data and updates the wizard progress, but explicitly leaves `DraftSavedAt = null`.
*   **Visibility:** Because `DraftSavedAt` is null, the product remains **HIDDEN** from the main Product List. 
*   **Purpose:** Ensures the user can navigate away to other screens (e.g., Inventory, Dashboard) and return later to find all their work intact without having explicitly saved it.

### State B — DRAFT / VISIBLE (Explicit Save Draft)
*   **Trigger:** The user explicitly clicks the physical "Save Draft" button (after a draft exists).
*   **Backend Behavior:** Calls `SaveOrUpdateDraftAsync` with `wizardAction: 'SAVE_DRAFT'`.
*   **Database Implication:** Explicitly sets `DraftSavedAt = DateTime.UtcNow`.
*   **Visibility:** Because `DraftSavedAt` has a timestamp, the product becomes **VISIBLE** in the Product List with the `DRAFT` status badge.
*   **Purpose:** Acknowledges the user's intent to keep this as an official, trackable draft.

## 2. Save & Continue vs Final Create

*   **Save & Continue:** Validates the current step, persists it, and advances the `CurrentSetupStep`. It does NOT mark the product as an explicit visible Draft unless the user explicitly requested it. It sends `wizardAction: 'SAVE_AND_CONTINUE'`.
*   **Final Review & Create:** Applies full canonical validation rules (variants, SKU/barcode identifiers, pricing, tax). Only upon passing does it finalize the product, marking `PublishedAt = DateTime.UtcNow` and changing the status to Active/Inactive.

## 2.1 `current_setup_step` Semantics (LOCKED — scanner-first)

| Value | Meaning |
|---:|---|
| 1 | Scan Barcode (UI may be pre-draft; persisted drafts rarely park here except compatibility) |
| 2 | Basic Details |
| 3 | Product Type & Tracking (Initial Tracking collection) |
| 4 | Unit & Pack Conversion |
| 5 | Product Configuration (matrix/bundle **and** identifier section; former standalone Barcode & SKU absorbed) |
| 6 | Pricing & Tax |
| 7 | Review & Create |

### Legacy draft migration mapping (D11)

| Old `current_setup_step` meaning | New mapping |
|---|---|
| 1 Basic Details | 2 Basic Details |
| 2 Type & Tracking | 3 Type & Tracking |
| 3 Units & Pack | 4 Unit & Pack |
| 4 Product Configuration | 5 Product Configuration |
| 5 Barcode & SKU | 5 Product Configuration (identifier section) |
| 6 Pricing & Tax | 6 Pricing & Tax |
| 7 Review & Create | 7 Review & Create |

**Where remapping happens (LOCKED 2026-09-12):** a **read-time compatibility layer in
`GET /api/v1/tenant-admin/products/{id}/setup`** — **not** a destructive data migration.
This reuses the precedent already documented for BUNDLE stale-step normalization
(`GET setup` → detect → normalize `targetSetupStep`), so no new architecture is introduced
and no historical row is rewritten. **Owner = B9.** Do not merge with the write-stage mapper.

Requirements: no Product or identifier data loss; existing identifier assignments survive
and hydrate into the Step 5 identifier section; legacy drafts without scan context are
**valid** and surface as `acquisition_mode = 'LEGACY'` (absence of a scan-context row must
never block resume); never fabricate scan or external-lookup history that did not occur.

A one-time `current_setup_step` data correction is **optional**; if ever run it must be
idempotent and must not alter identifiers. Authority:
[[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] TD-5.

### 2.2 Write-stage compatibility (LOCKED 2026-09-13 — OPTION 1 `persist_2_plus_write_map`)

Public/persisted scanner-first `current_setup_step` values **must not** be forced to equal legacy `ProductWizardStage` processor numbers. Do **not** globally renumber `ProductWizardStage`. Do **not** rewrite historical `current_setup_step` rows.

| Concern | Rule |
|---|---|
| Detection (create) | Validated nested `scanBootstrap` on `POST .../draft` |
| Detection (subsequent) | Presence of `product_setup_scan_context` |
| Legacy without scan context | Keep legacy write-stage numbering |
| Persistence | Store scanner-first public step (fresh bootstrap → **2** = Basic Details) |
| Routing | Centralized semantic mapper: API step → legacy processor; **never** persist the translated processor number |
| Forbidden | Scattered `currentStep - 1` / `currentStep + 1` |
| Step 2→processor | BasicDetails (legacy 1) |
| Step 3→processor | Type & Tracking (legacy 2) |
| Step 4→processor | Units & Pack (legacy 3) |
| Step 5→processor | **SPECIAL / COMPOSITE** (legacy config 4 + barcode/SKU 5 converge; B10 owns final composite routing) |
| Step 6→processor | Pricing & Tax (legacy 6) |
| Step 7→processor | Review (legacy 7) |
| vs B9 | Write mapper ≠ GET `/setup` read remap |

Authority: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]].

## 3. Resume & Restoration
Whenever an In-Progress or Explicit Draft is resumed, the wizard MUST restore:
*   The exact `CurrentSetupStep` the user was on (**after** legacy remapping when applicable).
*   All previously entered data, including generated variants, taxes, image ordering, Initial Tracking Details on **EXISTING** `product_setup_initial_tracking` (`initialBatchNumber`, `initialExpiryDate`, `initialSerialNumber`, plus VARIANT `initialTrackingAssignedVariantId` when set), and scan context when present (schema IMPLEMENTED; population **IMPLEMENTED B8**).
*   If Step 3 already cleared incompatible tracking values after explicit confirmation, restore the **normalized** values. Do not resurrect discarded identities.
*   Tenant isolation is enforced strictly on all reads and writes.

CURRENT: Basic Details (Step 2) draft persists on `products` master columns. Provisional Batch/Expiry/Serial live on **EXISTING** `product_setup_initial_tracking` (migration `20260824095742_AddProductSetupInitialTracking`) and are collected on Step 3. `product_setup_scan_context` **schema is IMPLEMENTED by B1** (`20260912085454_AddProductSetupScannerIdentifierContext`; local test DB verified; prod/shared apply not claimed). Actual scanner creation-path persistence is **B8 IMPLEMENTED** (`scanBootstrap` on `POST .../draft`; `ScannerFirstWizardStageMapper`; persist step 2). Setup hydration / legacy **read** remap is **B9 IMPLEMENTED** (`ScannerFirstSetupReadMapper` on `GET .../setup`; **PURE READ** — missing POS/ONLINE channel rows projected in memory only; no historical rewrite; no channel auto-provision on GET). Scanner-first composite Step 5 final identifiers are **B10 IMPLEMENTED**. **Steps 2–4 & 6 draft backends are IMPLEMENTED** (2026-09-13 reality audit); Step 5 VARIANT/SIMPLE+IDs IMPLEMENTED; **BUNDLE component graph remains PARTIAL**. B1 did **not** implement draft-bootstrap write behavior.

EXISTING Initial Tracking: persist via the existing `PUT .../draft` pipeline. Do not write `product_batches` / `serial_numbers` until Step 7 Publish. See [[Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]. Scan context: [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]. **Do not** include `product_setup_initial_tracking` in scanner-first B1.

## 4. Concurrency & Idempotency
*   The system uses `ExpectedRowVersion` for optimistic concurrency. If a draft is updated in two different tabs simultaneously, the older tab will gracefully reject the save to prevent silent data corruption.
*   Clicking "Save Draft" repeatedly does not create duplicate database rows. It idempotently updates the exact same Wizard Identity (`ProductId`).
