<!-- title: Bulk Product Upload Primary Flow -->
<!-- status: Canonical Functional Flow -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- feature: Bulk Product Upload -->
<!-- flow: Primary Flow -->
<!-- module: Tenant Admin / Product Catalogue -->
<!-- implementation_status: Documentation Only -->
<!-- last_updated: 2026-09-25 -->

# Bulk Product Upload Primary Flow

| Item | Value |
|---|---|
| Feature | Bulk Product Upload |
| Flow | Primary Flow |
| Module | Tenant Admin / Product Catalogue |
| Status | Canonical Functional Flow |
| Implementation status | Documentation Only |
| Date | 2026-09-25 |
| Source screens | C41, C42, C43, C44 (conflict boundary: C50) |

## 1. Purpose

This document describes how a Tenant Admin completes the main Bulk Product Upload journey, from selecting a file to seeing the final import results.

It is the canonical functional reference for the primary (happy-path) flow. It must be understandable before any Flutter or Backend implementation begins.

> For Tenant Admin Bulk Product Upload, this document is the current canonical functional reference. Older import documents that conflict with it are listed in §22 as legacy / pending reconciliation.

## 2. Source Authority

| Priority | Source |
|---|---|
| 1 | OneVerz Product Setup Functional UX Specification v1 (4 Sep 2026): screen text for C41–C44 and C50 |
| 2 | OneVerz Product Setup Complete Requirements v1.1 (FR-IMP-001 … FR-IMP-007, NFR-SCALE-001, NFR-REL-001, TC-025, TC-026) |
| 3 | OneVerz Bulk Product Import Discovery & Gap Analysis Report (2026-09-25) |
| 4 | Current proven Product Setup domain rules (Unified-Commerce `TenantAdminProductService` / `TenantAdminProductRequestValidator`) |
| 5 | Existing Second Brain Product Catalogue documentation |

**Authority rule (locked):**

```text
Functional UX Specification text + Requirements = authoritative functional source
Mockups                                         = visual / illustrative reference
Where a mockup conflicts with a written rule    → the written rule wins
```

Mockup details that conflict with this document are listed in §22 and are not adopted.

## 3. Scope

```text
Tenant Admin
→ Product Catalogue
→ Bulk Product Upload
→ Upload (C41)
→ Validate & Map (C42)
→ Review & Commit (C43)
→ Import
→ Results (C44)
```

The Primary Flow includes:

- CSV and XLSX files
- file upload
- template download
- column mapping
- validation
- create/update intent
- row review
- partial success
- commit
- results
- the retry boundary
- the conflict boundary

### 3.1 Out of scope

The following are not part of this document and may be documented separately:

| Out of scope | Where it belongs |
|---|---|
| Flutter implementation | Flutter UI implementation (after UI reference approval) |
| Backend implementation, API implementation, DB schema | Backend/API Contract, DB Contract |
| C50 detailed conflict-resolution semantics | Matching & Conflict Contract |
| C45 Bulk Product Update | Separate capability |
| C46 Bulk Price Update | Separate capability |
| C47 Bulk Identifier Assignment | Separate capability |
| C48 Barcode Label Printing | Separate capability |
| C49 Product Export | Separate capability |
| AI extraction, PDF/image extraction | Excluded (Requirements §2) |
| Automatic OpenFoodFacts / UPCitemdb enrichment | Excluded (see §13) |
| BUNDLE import | Excluded |
| Batch / expiry / serial inventory import | Excluded |

## 4. Canonical Flow

```text
C41 — Upload File
    ↓
C42 — Validate & Map
    ↓
C43 — Review & Commit
    ↓   (explicit "Import N Products")
C44 — Results / Errors
```

Conflict boundary:

```text
C42 / C43
    ↓  (row in CONFLICT)
C50 — Conflict Resolution      (dedicated contract)
    ↓
return to the import flow (C43)
```

Retry boundary (UX spec: "Done or retry → C42/C43"):

```text
C44 → Retry Failed Rows        (only FAILED rows are re-submitted)
C44 → fix data → C42/C43        (ERROR rows need correction and re-validation)
```

## 5. Commit Boundary

```text
C41 — no Product created
C42 — no Product created
C43 review — no Product created
────────────────────────────────────────────
Explicit "Import N Products" on C43
→ real Product creation / update begins
```

This stops validation from creating products part-way. Validation results can be discarded, remapped or re-run at no cost.

## 6. Import Modes

The user picks one import mode on C41. The mode alone determines create/update behaviour; there are no separate overlapping toggles (for example "Create new" + "Update existing" + "Skip duplicates").

### 6.1 CREATE_ONLY

```text
SKU not found in the tenant catalogue → CREATE
SKU already exists                    → SKIP (reason recorded: existing SKU)
```

A duplicate product is never created.

### 6.2 CREATE_OR_UPDATE

```text
No matching SKU                            → CREATE
Exactly one matching SKU                   → UPDATE
Ambiguous / mismatched identifiers         → CONFLICT (see §8, §17)
```

### 6.3 Not included

- `UPDATE_ONLY` is not a Primary Flow mode.
- Updating many existing products from the UI is the separate C45 Bulk Product Update capability.

## 7. Product Matching Rule

```text
SKU = authoritative update matching key
```

- The sellable variant is the SKU identity (UX Spec core rule), so a SKU match identifies exactly one existing sellable item.
- Barcode / GTIN is **not** an automatic update key. It is used only for validation, uniqueness and conflict detection.
- Name similarity must never trigger an automatic UPDATE.

Example:

```text
Uploaded SKU     → Product A
Uploaded Barcode → Product B

→ CONFLICT
→ neither product is updated automatically
→ hand off to C50
```

## 8. Barcode / GTIN Rule

- Barcode / GTIN is optional.
- When supplied, it must pass the supported Product Setup barcode validation (the same rules as Add Product, Barcode & SKU step). It must also be tenant-unique.
- A barcode already assigned to a different product/variant is never silently replaced. The row becomes:
  - **CONFLICT**, when the barcode points to a different existing product than the row's SKU match, or when the row would create a product that duplicates an existing barcode (identifier ownership decision → C50);
  - **ERROR**, when the barcode is invalid, or is duplicated within the same file.

## 9. Product Structure Scope

| Structure | Primary Flow position |
|---|---|
| SIMPLE | In scope. **First implementation priority**: SIMPLE must work end-to-end first. |
| VARIANT | Conceptually in scope. The file representation needs a dedicated **Variant Import Contract** before implementation (§20). |
| BUNDLE | **Out of current Primary Flow.** No Bundle behaviour is defined. |

Until the Variant Import Contract is approved, a row declaring an unsupported structure is an ERROR. It is never partially imported.

## 10. Master Data Resolution Rules

Import resolves spreadsheet values only against existing tenant master data. **Import never creates Categories, Brands, Tax Classes or Units.**

| Field | Rule | Unresolved result |
|---|---|---|
| Category | **Required.** Resolved against existing tenant Categories. | **ERROR**: the user must correct or remap the value before the row is importable. |
| Brand | **Optional.** Resolved against existing tenant Brands. Normalized comparison (case, whitespace, punctuation) may be used. | **WARNING**: the user may map to an existing Brand or leave it blank where allowed. |
| Tax | Follows the current Product Setup tenant tax contract; a tax class is required. Resolved against existing tenant tax configuration. | **ERROR**. No tax class is ever defaulted silently. |
| Unit (SIMPLE) | **SIMPLE Product requires Unit configuration regardless of Track Inventory** (proven current domain rule). | **ERROR** |

Brand resolution is file-driven. It must not reuse external-provider brand-mapping semantics (the OpenFoodFacts/UPCitemdb provider-key mappings used by External Product Lookup).

The following are prohibited for Unit:

```text
hardcoded EA
silent default unit
automatic fake unit
unit omission for SIMPLE
```

## 11. Pricing Rule

- **Standard Selling Price must be > 0** (current Product Setup backend rule). Zero is not a valid selling price in this flow.
- Cost price is optional where current Product rules permit; when supplied it must be a valid non-negative number.
- Price lists, outlet price overrides and rule-based price changes are not part of this flow; rule-based bulk price changes are C46.

## 12. Inventory Rule

```text
Track Inventory = the product's tracking choice (yes / no)
```

- Inventory remains optional. A product can be created and sold with inventory off.
- This document does not cover batch tracking, expiry tracking, serial tracking, stock adjustments, stock transfers or advanced opening stock.
- A quantity column (for example "Inventory: 78") must not be interpreted as Track Inventory.
- **Outlet selector (C41):** its meaning is not locked. It is an **implementation detail / separate decision**. No stock semantics are assigned to it here.

## 13. External Enrichment Rule

```text
Bulk Product Upload Primary Flow is file-driven.
```

Uploaded rows never automatically call OpenFoodFacts, UPCitemdb or any external barcode enrichment. External Product Lookup remains a separate Product Setup capability (scanner-first single-product creation).

## 14. State Model

Three separate concepts. No single status field carries all three.

### 14.1 Validation state (C42 / C43)

| State | Meaning |
|---|---|
| **READY** | No blocking validation issue. Eligible for import. |
| **WARNING** | Non-blocking issue. Requires review. May remain eligible for import. |
| **ERROR** | Blocking issue. Cannot be imported until fixed and revalidated. |
| **CONFLICT** | Identifiers or product matching are ambiguous. Must not be auto-resolved. Requires the conflict-resolution path (C50). |

### 14.2 Import intent

| Intent | Meaning |
|---|---|
| **CREATE** | The row would create a new product. |
| **UPDATE** | The row would update the single product matched by SKU (CREATE_OR_UPDATE only). |
| **SKIP** | The row will not be written (for example, existing SKU in CREATE_ONLY). A reason is recorded. |

Intent is independent of validation state:

```text
READY    + CREATE
READY    + UPDATE
WARNING  + CREATE
ERROR    + CREATE        (would create once fixed; not importable now)
CONFLICT + unresolved intent (decided only through C50)
```

### 14.3 Final outcome (C44)

| Outcome | Meaning |
|---|---|
| **CREATED** | A product was created. |
| **UPDATED** | An existing product was updated. |
| **SKIPPED** | The row was not written, and the reason is recorded. |
| **FAILED** | The row was submitted for import but failed during commit. |

Working definition for review: rows excluded at C43 (ERROR, unresolved CONFLICT, SKIP intent, or not selected) are reported as **SKIPPED** with their reason. **FAILED** is reserved for rows that were submitted and failed during commit.

Outcomes exist only after a real commit. They are never derived from validation alone.

## 15. Screen Responsibilities

These are functional responsibilities only. See §21 for the UI boundary.

### 15.1 C41 — Upload File

**Purpose:** The Tenant Admin selects a CSV/XLSX file and starts an import batch.

| Functional actions | Source-backed requirements |
|---|---|
| Browse / Drop File | CSV and XLSX accepted |
| Download Template | File type validation |
| Choose Import Mode (CREATE_ONLY / CREATE_OR_UPDATE) | File size validation |
| Continue | Raw upload is preserved |
| Cancel / Back | The import batch is created before row processing |

Helpful guidance shown to the user:

- SKU is required and unique.
- Barcode is optional but unique when supplied.
- Selling Price > 0.
- Category must resolve.
- SIMPLE products require a Unit.

**File size / row limits: OPEN IMPLEMENTATION LIMIT.** No approved canonical value exists. The candidate values in the sources conflict:

| Source | Value |
|---|---|
| Mockup | 50 MB |
| Requirements | 50,000 rows by background job |
| Platform bootstrap import (a separate contract) | 5 MB / 2,000 rows |

### 15.2 C42 — Validate & Map

**Purpose:** Map uploaded file columns to OneVerz fields and validate row data before commit.

Functional actions:

- **Auto Map**
- **Manual Map / Unmap**
- **Required field mapping**: every required field must be mapped before validation can proceed; unmapped columns are ignored
- **View errors**
- **Continue to Review**

Validation covers:

- required values
- data types
- SKU duplicates (within the file and against the tenant catalogue)
- barcode/GTIN duplicates (within the file and against the tenant catalogue)
- identifier conflicts
- Category
- Brand
- Unit
- Tax
- Selling Price
- Product structure

**No Product is created at C42.** Changing the mapping invalidates earlier validation results, and validation must be re-run.

### 15.3 C43 — Review & Commit

**Purpose:** Review every row before any real Product is created or updated.

| Summary | Row detail (at minimum) |
|---|---|
| Total Rows | Product |
| Ready | SKU |
| Warnings | Barcode |
| Errors | Category |
| Conflicts | Selling Price |
| New Products | Intent |
| Updates | Validation Status |
| | Issues |

- **Filters:** All / Ready / Warnings / Errors / Conflicts.
- **Primary commit action:** **Import N Products**.
- **N** counts only eligible reviewed rows: READY rows, plus WARNING rows the user has reviewed and kept, with intent CREATE or UPDATE.
- ERROR, CONFLICT and SKIP rows are never counted in N.
- Error rows can be downloaded for correction.

### 15.4 C44 — Results / Errors

**Purpose:** Show the final result of the committed import.

| Summary | Actions |
|---|---|
| Created | View Imported Products |
| Updated | Download Report |
| Skipped | Retry Failed Rows |
| Errors (FAILED outcomes) | Start New Import |
| | Done |

C44 is shown only from a real commit result.

## 16. Partial Success

```text
Partial success is allowed.
```

Example:

```text
1000 rows
 900 READY
  60 WARNING
  30 ERROR
  10 CONFLICT
```

- The 900 READY rows and any reviewed WARNING rows may proceed.
- The 30 ERROR and 10 CONFLICT rows stay excluded and downloadable for correction.
- A few invalid rows never automatically reject the whole upload (Requirements FR-IMP-005, TC-025).

## 17. C50 Conflict Boundary

This document defines only the Primary Flow handoff.

**Typical trigger:**

```text
SKU     → Product A
Barcode → Product B
→ CONFLICT
```

Other ambiguous product-match conditions also produce CONFLICT, for example:

- a SIMPLE row whose SKU belongs to a variant of a VARIANT product;
- a new row whose barcode is already owned by another product.

**Primary Flow rule:**

```text
never auto-merge ambiguous records
```

- A CONFLICT row is excluded from **Import N Products** until it is resolved.
- After resolution the user returns to the import flow (C43).
- C50 actions (Merge, Keep Existing, Create as New, Replace Existing, Add Notes, Apply Resolutions) and their field-level semantics, permissions and audit belong to the dedicated **Matching & Conflict Contract**. They are not defined here.

## 18. Retry / Idempotency Principle

```text
Retry must be idempotent.
```

- Rows already created or updated successfully are never duplicated on retry.
- **Retry Failed Rows** re-submits only rows with outcome FAILED.
- ERROR rows are not retried as-is. They need correction and re-validation (C42/C43).
- An interrupted commit can be resumed safely (Requirements FR-IMP-006, TC-026).

The exact idempotency design (key source, batch vs row scope, resume behaviour) is a **BACKEND TECHNICAL CONTRACT — FUTURE IMPLEMENTATION**.

## 19. Batch Model Concept

The source-backed entities are `product_import_batches` and `product_import_rows`. Their responsibilities are conceptual only; final DB columns are not defined here.

**Batch** (`product_import_batches`):
- one import session / file
- tenant scope
- raw upload reference
- selected import mode
- aggregate result counts
- overall lifecycle

**Row** (`product_import_rows`):
- original row data (raw payload)
- validation state
- issues
- import intent
- final outcome
- created/updated Product / Variant reference

**Background processing (functional principle):** large imports may process asynchronously while progress is shown to the user without a page refresh (FR-IMP-007, NFR-SCALE-001). Job infrastructure, queues, SSE and worker architecture belong to the Backend implementation contract.

## 20. Follow-up Contract Boundaries

### 20.1 Template

The Primary Flow depends on a downloadable template. The detailed columns, headers, aliases, examples and versioning belong to the **Bulk Product Upload Template Contract**.

Conceptually the template must carry:

- product identity (name)
- SKU
- Category
- pricing (selling price; optional cost)
- Tax
- Unit for SIMPLE
- optional Barcode
- optional Brand
- product structure where required
- optional Track Inventory

### 20.2 Variant

Variant file representation needs a dedicated **Variant Import Contract**. Open questions:

- product group key
- one-row-per-variant format
- attribute columns
- variant SKU
- variant barcode
- variant pricing
- group-level partial success

None of these are locked here.

## 21. UI Implementation Boundary

- This document describes functional screen responsibilities. **It does not approve a final Flutter visual design.**
- The final Tenant Admin Flutter screens will follow separately approved UI reference screens, which the user will provide.
- The current C41–C50 mockups are **not** the final Flutter UI.
- The entry-point placement inside Product Catalogue is part of the UI reference approval (see §22, item 5).

## 22. Legacy / Pending Reconciliation

These existing sources conflict with this document. They are **not** edited here; this document takes precedence for the Tenant Admin Bulk Product Upload Primary Flow.

| # | Source | Conflict | Status |
|---|---|---|---|
| 1 | [[../../06_DATABASE_KNOWLEDGE/Tables/15_Product_Import_Batches_And_Rows]] | CSV-only wording; row statuses (`PENDING/VALID/INVALID/IMPORTED/FAILED`) do not model WARNING, CONFLICT, intent or outcome separately | Legacy, pending DB Contract |
| 2 | [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]] (tenant-admin `/products/imports` rows) | Listed as PARTIAL and "Upload CSV"; no Tenant Admin import API exists in code | Legacy, pending Backend/API Contract |
| 3 | [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Product_Import_Contract]] | Platform bootstrap import is CSV-only, create-only, SIMPLE-only, with a hard-coded default unit on create | Separate Platform Admin contract, **not** the Tenant Admin rule set |
| 4 | Mockups C41/C42 | Three overlapping import toggles; Barcode shown as a required column; "Duplicate SKUs will be skipped" in every mode; "Inventory: 78" mapped to Track Inventory | Not adopted (written rules win) |
| 5 | [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Product_List_UI_UX_Specification]] | Prohibits import buttons on the Product List, while Requirements FR-CAT-010 requires starting bulk import from the catalogue | Pending UI reference approval |
| 6 | Permission keys | `tenant.product.import` (Flutter), `catalog.products.import` (API_ENDPOINTS), `catalog.products.import.execute` (Permission_Code_List); absent from the canonical R1 permission catalog | Pending Backend/API Contract |
| 7 | Functional UX Specification core rule "Selling and cost prices must be non-negative" | Allows selling price = 0; this flow adopts the current Product Setup backend rule (selling price > 0). Cost price ≥ 0 is unchanged. | Explicitly adopted override for selling price; pending UX spec wording update |

## 23. Implementation Sequence

```text
Phase 1  Second Brain canonical documentation   ← this document
Phase 2  UI reference approval
Phase 3  Tenant Admin Flutter implementation
Phase 4  Backend / API / DB implementation
Phase 5  Integration + E2E validation
```

## 24. Implementation Status

| Area | Status |
|---|---|
| Canonical functional documentation | COMPLETE (this document, pending review) |
| Final UI reference | PENDING USER APPROVAL |
| Flutter implementation | NOT STARTED (as an approved phase) |
| Backend / API implementation | NOT STARTED |
| DB implementation | NOT STARTED |

## 25. Acceptance Criteria

- [ ] One canonical document exists for the Bulk Product Upload Primary Flow.
- [ ] C41–C44 responsibilities are clear.
- [ ] The C50 boundary is clear.
- [ ] CREATE_ONLY / CREATE_OR_UPDATE behaviour is documented.
- [ ] The SKU update matching rule is documented.
- [ ] The barcode conflict role is documented.
- [ ] Category / Brand / Unit / Tax rules are documented.
- [ ] READY / WARNING / ERROR / CONFLICT are defined.
- [ ] CREATE / UPDATE / SKIP intents are separated from validation state.
- [ ] CREATED / UPDATED / SKIPPED / FAILED outcomes are separated.
- [ ] Partial success is documented.
- [ ] The retry idempotency principle is documented.
- [ ] No Flutter or Backend implementation is claimed.
- [ ] Future UI implementation requires separately approved UI references.

## 26. Future Follow-up Contracts

- Bulk Product Upload Template Contract
- Variant Import Contract
- Matching & Conflict Contract (C50)
- Backend / API Contract (including idempotency, lifecycle, background processing, permissions)
- DB Contract (`product_import_batches`, `product_import_rows`)
- Flutter UI Implementation (after UI reference approval)

## Related Files

- [[01_Module_Overview]]
- [[Tenant_Admin_Product_Barcode_SKU_Specification]]
- [[Tenant_Admin_Product_Units_Pack_Conversion_Specification]]
- [[05_Tenant_Admin_Add_Product_7_Step_Contract]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/15_Product_Import_Batches_And_Rows]]
- [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Product_Import_Contract]]
