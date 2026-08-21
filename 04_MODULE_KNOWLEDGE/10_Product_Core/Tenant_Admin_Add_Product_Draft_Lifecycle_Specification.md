# Tenant Admin Add Product — Draft & Auto-Save Lifecycle Specification

## 1. Core Concept & Separation of States
The Add Product Wizard operates on a persistent backend draft system, specifically separating two distinct states to prevent data loss while keeping the canonical Product List clean.

### State A — IN-PROGRESS / HIDDEN (Auto-Save)
*   **Trigger:** Automatically triggered in the background as the user types or alters fields (debounced).
*   **Backend Behavior:** Calls `SaveOrUpdateDraftAsync` with `wizardAction: null`.
*   **Database Implication:** Persists the entered data and updates the wizard progress, but explicitly leaves `DraftSavedAt = null`.
*   **Visibility:** Because `DraftSavedAt` is null, the product remains **HIDDEN** from the main Product List. 
*   **Purpose:** Ensures the user can navigate away to other screens (e.g., Inventory, Dashboard) and return later to find all their work intact without having explicitly saved it.

### State B — DRAFT / VISIBLE (Explicit Save Draft)
*   **Trigger:** The user explicitly clicks the physical "Save Draft" button.
*   **Backend Behavior:** Calls `SaveOrUpdateDraftAsync` with `wizardAction: 'SAVE_DRAFT'`.
*   **Database Implication:** Explicitly sets `DraftSavedAt = DateTime.UtcNow`.
*   **Visibility:** Because `DraftSavedAt` has a timestamp, the product becomes **VISIBLE** in the Product List with the `DRAFT` status badge.
*   **Purpose:** Acknowledges the user's intent to keep this as an official, trackable draft.

## 2. Save & Continue vs Final Create

*   **Save & Continue:** Validates the current step, persists it, and advances the `CurrentSetupStep`. It does NOT mark the product as an explicit visible Draft unless the user explicitly requested it. It sends `wizardAction: 'SAVE_AND_CONTINUE'`.
*   **Final Review & Create:** Applies full canonical validation rules (variants, SKU tracking, pricing, tax). Only upon passing does it finalize the product, marking `PublishedAt = DateTime.UtcNow` and changing the status to Active/Inactive.

## 3. Resume & Restoration
Whenever an In-Progress or Explicit Draft is resumed, the wizard MUST restore:
*   The exact `CurrentSetupStep` the user was on.
*   All previously entered data, including generated variants, taxes, and image ordering.
*   Tenant isolation is enforced strictly on all reads and writes.

## 4. Concurrency & Idempotency
*   The system uses `ExpectedRowVersion` for optimistic concurrency. If a draft is updated in two different tabs simultaneously, the older tab will gracefully reject the save to prevent silent data corruption.
*   Clicking "Save Draft" repeatedly does not create duplicate database rows. It idempotently updates the exact same Wizard Identity (`ProductId`).
