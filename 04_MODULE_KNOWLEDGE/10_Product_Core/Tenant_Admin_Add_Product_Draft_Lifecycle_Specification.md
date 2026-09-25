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

## 1. Core Concept & Persistence Lifecycle (Canonicalized 2026-09-19)

The Add Product Wizard separates three distinct persistence states to prevent data loss while maintaining clean Product semantics. **Product ID exists only after explicit user action** (post Step 1 creation-path and explicit Save Draft).

### State A — LOCAL_UNSAVED (Client-Session Owned)

*   **Trigger:** Normal wizard interaction: typing fields, navigating steps, generating variants, selecting images, entering pricing/tax.
*   **Backend Behavior:** ZERO server writes. All state remains in client/session storage.
*   **Database Implication:** **No Product row is created.** No backend mutation occurs.
*   **Visibility:** Product does not appear in Product List. No Product database entry exists.
*   **Duration:** Persists across wizard steps and module navigation (same tenant, same user, same session).
*   **Scope:** Client/session/device-owned state keyed by tenant ID + user ID + wizard identity.
*   **Purpose:** Allow full Product Setup completion without committing to backend until user chooses to Save Draft or Create Product.

Actions within LOCAL_UNSAVED (NO server writes):
- Entering/editing product name, category, brand, descriptions
- Back, Continue, Skip (when eligible)
- Generate variants (remain local with `clientCombinationKey`)
- Entering SKU/barcode values
- Selecting/reordering images (local preview only)
- Entering pricing and tax values
- Selecting channel visibility flags
- Module navigation (Dashboard, Inventory, etc.)
- Returning to wizard from another module

### State B — EXPLICIT_DRAFT (Server-Owned DRAFT Product)

*   **Trigger:** User explicitly clicks `Save Draft` button.
*   **Backend Behavior:** `PUT /api/v1/tenant-admin/products/{id}/draft` with `wizardAction: 'SAVE_DRAFT'` (or direct POST for fresh draft). Does NOT advance `current_setup_step` automatically.
*   **Database Implication:** Creates or updates Product row with `status = 'DRAFT'`. Sets `DraftSavedAt = DateTime.UtcNow`.
*   **Visibility:** Because `DraftSavedAt` has a timestamp, the product becomes **VISIBLE** in the Product List with the `DRAFT` status badge.
*   **Product ID:** Persisted DRAFT has a stable Product ID for subsequent operations.
*   **Purpose:** User's explicit intent to keep a trackable server-side draft for resumption across devices/sessions.
*   **Note:** Do NOT automatically advance step; do NOT auto-mark as published; do NOT create DRAFT merely because user clicked Continue/Skip.

### State C — PUBLISHED (Final Active Product)

*   **Trigger:** User clicks `Create Product` on Review & Create step.
*   **Backend Behavior:** `POST /api/v1/tenant-admin/products/{id}/publish` (or endpoint appropriate for final creation). Atomically validates full wizard graph and publishes product.
*   **Database Implication:** Updates existing DRAFT Product to `status = 'ACTIVE'` (or `'INACTIVE'` per desired publish status), sets `PublishedAt = DateTime.UtcNow`.
*   **Product Lifecycle:** Product is now final and appears in active Product List/catalog.
*   **No Prior Draft Required:** Direct flow from LOCAL_UNSAVED → PUBLISHED is supported (atomic backend validation on all 6 steps — TARGET; current backend validates 7-step pipeline).
*   **Purpose:** Final commitment to product creation/publication.

## 2. Continue, Skip, and Save & Continue Semantics (Canonicalized 2026-09-19)

*   **Continue / Next:** Local wizard step navigation only. Does NOT call `saveAndContinue`. Does NOT persist to backend. Validates current step locally and advances wizard step. Uses existing canonical step-routing logic (e.g., Step 4 bypass for BUNDLE). All state preserved in LOCAL_UNSAVED session.
*   **Skip:** When applicable, local wizard step navigation only. Marks step as intentionally skipped in local state. Does NOT persist to backend. Does NOT call Save Draft. Follows canonical step-routing for skipped steps. All state preserved in LOCAL_UNSAVED session.
*   **Save Draft:** Explicit server persistence. Consumes latest LOCAL_UNSAVED snapshot and persists to EXPLICIT_DRAFT. Does NOT auto-advance wizard step.
*   **Save & Continue (DEPRECATED SEMANTICS):** The old "Save & Continue" endpoint behavior persists in backend for backward compatibility with legacy clients. Current Product Setup must NOT invoke it. Use `Continue` (local) followed by explicit `Save Draft` (server) as separate operations.

## 2.1 `current_setup_step` Semantics

**TARGET (6-step wizard — LOCKED 2026-09-20):**

| Value | Meaning |
|---:|---|
| 1 | Scan Barcode (pre-draft; persisted drafts rarely park here) |
| 2 | Basic Details |
| 3 | Product Type & Configuration |
| 4 | Pricing & Tax |
| 5 | Product Tracking (Optional) |
| 6 | Review & Create |

**CURRENT IMPLEMENTATION SNAPSHOT — TO BE RECONCILED IN CHUNK 3:**

> The backend currently uses the following scanner-first step numbering (7-step). Do not prematurely renumber backend processor constants.

| Value | Meaning |
|---:|---|
| 1 | Scan Barcode (UI may be pre-draft; persisted drafts rarely park here except compatibility) |
| 2 | Basic Details |
| 3 | Product Type & Tracking (Initial Tracking collection) |
| 4 | Unit & Pack Conversion |
| 5 | Product Configuration (matrix/bundle **and** identifier section; former standalone Barcode & SKU absorbed) |
| 6 | Pricing & Tax |
| 7 | Review & Create |

### Legacy draft migration mapping (D11) — LEGACY REFERENCE

> The following mapping documents how legacy (pre-scanner-first) `current_setup_step` values map to current values. This is LEGACY REFERENCE only — do not use for TARGET 6-step planning.

| Old `current_setup_step` meaning | New mapping |
|---|---|
| 1 Basic Details | 2 Basic Details |
| 2 Type & Tracking | 3 Type & Tracking |
| 3 Units & Pack | 4 Unit & Pack |
| 4 Product Configuration | 5 Product Configuration |
| 5 Barcode & SKU | 5 Product Configuration (identifier section) |
| 6 Pricing & Tax | 6 Pricing & Tax |
| 7 Review & Create | 7 Review & Create (CURRENT) / 6 Review & Create (TARGET 6-step) |

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

## 3. Resume, Recovery & Local Session Architecture (Canonicalized 2026-09-19)

The wizard must support two distinct recovery scenarios:

### 3.1 LOCAL_UNSAVED Session Recovery (Same Session, Same Tenant/User)

When a user:
1. Enters Product Setup data (LOCAL_UNSAVED state)
2. Does NOT click Save Draft
3. Navigates to another Tenant Admin module (Inventory, Dashboard, etc.)
4. Returns to Product Setup

The following restoration must occur WITHOUT creating a server Product row:

*   **Flutter/Client Ownership:** Local wizard state persists via `AddProductWizardState` + product-setup local datasource/cache. Scoped by tenant ID + user ID + wizard identity to prevent leakage.
*   **Restored Data:** All currently-entered fields, generated variants (with `clientCombinationKey`), selected images (local preview only), SKU/barcode values, pricing/tax, current step, skip state.
*   **Storage Location:** Platform-appropriate local storage (`SharedPreferences` on Flutter; device/session scope; cleared on logout/tenant switch).
*   **Duration:** Persists across module navigation within same session. DOES NOT persist across app restart/logout/tenant switch (those are new sessions).
*   **Success Criterion:** User returns to wizard on exact step with exact entered data, without loss.

### 3.2 EXPLICIT_DRAFT Resume (Across Devices/Sessions)

When an EXPLICIT_DRAFT product is opened from Product List:

1. Backend returns authoritative server DRAFT via `GET /api/v1/tenant-admin/products/{id}/setup`.
2. Client checks for newer local unsaved overlay for same tenant/user/Product ID in current session.
3. If newer local state exists: restore that safely on top of server DRAFT without auto-PUT.
4. If no local overlay: restore server DRAFT as-is.
5. Save Draft explicitly persists overlay when user chooses.
6. Create Product may consume latest merged state directly.

### 3.3 Resume & Restoration — EXPLICIT_DRAFT State

Whenever an EXPLICIT_DRAFT is resumed (from server), the wizard MUST restore:
*   The exact `CurrentSetupStep` the DRAFT was on (**after** legacy remapping when applicable).
*   All previously persisted data from steps 1–6.
*   Generated variants with stable `clientCombinationKey` and any `productVariantId` assignments.
*   Initial Tracking Details from **EXISTING** `product_setup_initial_tracking` (`initialBatchNumber`, `initialExpiryDate`, `initialSerialNumber`, plus VARIANT `initialTrackingAssignedVariantId` when set).
*   Scan context metadata when present (schema IMPLEMENTED; hydration IMPLEMENTED).
*   If Step 3 previously cleared incompatible tracking values after user confirmation, restore the **normalized** values. Do not resurrect discarded identities.
*   Tenant isolation is enforced strictly on all reads and writes.

**CURRENT IMPLEMENTATION STATUS:**  
Basic Details persists on `products` master columns. Batch/Expiry/Serial draft values live on **EXISTING** `product_setup_initial_tracking` (migration `20260824095742_AddProductSetupInitialTracking`). `product_setup_scan_context` **schema IMPLEMENTED B1** (migration `20260912085454_AddProductSetupScannerIdentifierContext`); setup hydration **IMPLEMENTED B9**. Steps 2–4 & 6 EXPLICIT_DRAFT backends IMPLEMENTED; Step 5 VARIANT/SIMPLE+identifiers IMPLEMENTED; **BUNDLE component graph PARTIAL**. **LOCAL_UNSAVED session recovery architecture (§3.1) requires Flutter implementation (not backend).**

## 4. Concurrency & Idempotency

### 4.1 LOCAL_UNSAVED State
- Concurrency is not applicable (no server writes occur).
- Local state updates are sequential within a session.
- Multiple Flutter rebuilds or field edits do not trigger server calls.

### 4.2 EXPLICIT_DRAFT State — Save Draft Concurrency
- The system uses `ExpectedRowVersion` for optimistic concurrency.
- If a draft is updated by two different authenticated sessions simultaneously, the older session will gracefully reject the Save Draft request with HTTP 409 Conflict.
- Response returns latest server `rowVersion` and updated draft state for reload.
- Clicking "Save Draft" repeatedly does not create duplicate database rows. It idempotently updates the exact same Wizard Identity (`ProductId`).

### 4.3 PUBLISHED State — Final Create
- Atomic transaction validates full wizard graph and publishes in one operation.
- Concurrency checks on Product row version prevent stale Create commands.
- Failure to publish due to concurrency preserves local state and EXPLICIT_DRAFT (if prior save occurred).
