<!-- title: Product Setup Scanner-First Write Stage Mapping Decision -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Architecture decision — ACCEPTED; Backend B8 implemented 2026-09-13 against this lock -->

# PRODUCT SETUP SCANNER-FIRST — WRITE STAGE MAPPING DECISION (2026-09-13)

## Status

**ACCEPTED.** Resolves the pre-B8 numbering compatibility blocker between scanner-first public/persisted step semantics and legacy internal `ProductWizardStage` processor identifiers.

**Chosen approach:** `persist_2_plus_write_map` (OPTION 1).

**Implementation:** Backend B8 implemented this decision via `ScannerFirstWizardStageMapper` + `scanBootstrap` on `POST .../products/draft` — see [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B8_DRAFT_BOOTSTRAP_SCAN_CONTEXT_IMPLEMENTATION_2026-09-13]]. Backend B9 implemented GET `/setup` read remap via `ScannerFirstSetupReadMapper` — see [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B9_SETUP_HYDRATION_LEGACY_READ_REMAP_IMPLEMENTATION_2026-09-13]]. Backend B10 implemented scanner-first composite Step 5 final SKU/barcode persistence — see [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B10_STEP5_IDENTIFIER_RECONCILIATION_IMPLEMENTATION_2026-09-13]]. Backend B11 publish revalidation + B12 closure — see [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B11_PUBLISH_REVALIDATION_IMPLEMENTATION_2026-09-13]], [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B12_CLOSURE_2026-09-13]]. **B1–B12 IMPLEMENTED; Flutter Step 1 PARTIAL/PENDING.**

Related: [[PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]], [[PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]].

---

## Problem

Scanner-first public wizard (canonical):

| Persisted / API step | Meaning |
|---:|---|
| 1 | Scan Barcode (pre-draft) |
| 2 | Basic Details |
| 3 | Product Type & Tracking |
| 4 | Unit & Pack Conversion |
| 5 | Product Configuration (incl. former Barcode & SKU section) |
| 6 | Pricing & Tax |
| 7 | Review & Create |

Fresh B8 bootstrap must persist `current_setup_step = 2` (Basic Details).

Existing Backend internal legacy processor constants (unchanged by this decision):

| `ProductWizardStage` | Legacy numeric |
|---|---:|
| BasicDetails | 1 |
| TypeAndTracking | 2 |
| Units/Pack | 3 |
| Product Configuration | 4 |
| legacy Barcode/SKU | 5 |
| Pricing/Tax | 6 |
| Review | 7 |

Forcing public numbering to match legacy processor numbers, or globally renumbering `ProductWizardStage`, would either break Second Brain DoD or massively regress write routing for historical drafts.

---

## WSM-1 — Public vs internal stage authority (LOCKED)

**Scanner-first API/persisted step numbering MUST NOT be forced to match legacy internal processor stage numbers.**

- Public/persisted scanner-first semantics remain **canonical**.
- Fresh scanner-first drafts store **scanner-first** values in `products.current_setup_step`.
- `ProductWizardStage` constants remain **legacy internal processor identifiers**.
- A **centralized write-stage compatibility mapping layer** translates scanner-first API step → legacy internal processor stage for scanner-first writes.
- The translated legacy processor number is **never** written back into `current_setup_step`.

Do **not** globally renumber `ProductWizardStage.BasicDetails` / `TypeAndTracking` / etc.

---

## WSM-2 — Scanner-first detection (LOCKED)

| Situation | Detection |
|---|---|
| Initial B8 create (Product + ScanContext do not exist yet) | Validated nested `scanBootstrap` payload on `POST .../products/draft` |
| Subsequent writes on an already-created draft | Presence of canonical `product_setup_scan_context` row |
| Legacy drafts without scan context | Continue **legacy** write-stage numbering; do **not** reinterpret as scanner-first |

---

## WSM-3 — Persisted step authority for new scanner-first drafts (LOCKED)

| `current_setup_step` | Meaning |
|---:|---|
| 2 | Basic Details |
| 3 | Type & Tracking |
| 4 | Units & Pack |
| 5 | Product Configuration / scanner-first Step 5 |
| 6 | Pricing & Tax |
| 7 | Review & Create |

Do **not** store internal processor stage numbers as public persisted progress for new scanner-first drafts. Fresh bootstrap persists **`2`**, never **`1`**, for Basic Details.

---

## WSM-4 — Write mapping table (LOCKED)

Centralized semantic owner (conceptual name: write-stage mapper consistent with Backend conventions — e.g. `ScannerFirstWizardStageMapper`; concrete class name **not** locked here).

**Forbidden:** scattered `currentStep - 1` / `currentStep + 1` arithmetic in controllers/services/repositories. Step 5 is not a simple numeric shift.

| Scanner-first API / persisted step | Legacy internal processor | Notes |
|---:|---|---|
| 2 | BasicDetails (1) | B8 create + subsequent Basic Details writes |
| 3 | Type & Tracking (2) | Non-ambiguous |
| 4 | Units & Pack (3) | Non-ambiguous |
| 5 | **SPECIAL / COMPOSITE** | Legacy Product Configuration (4) **and** legacy Barcode/SKU (5) converge into scanner-first Step 5. Final composite/identifier routing owned by later work (**especially B10**). Do **not** solve B10 in this decision. Do **not** reduce Step 5 to naive ±1. |
| 6 | Pricing & Tax (6) | Same numeric value; still routed via semantic mapper, not arithmetic |
| 7 | Review (7) | Same numeric value; still routed via semantic mapper, not arithmetic |

B8 create conceptual routing:

```text
API scanner step 2 → internal BasicDetails / legacy stage 1
while persisting Product.current_setup_step = 2
```

---

## WSM-5 — B9 boundary (LOCKED)

| Layer | Direction | Owner |
|---|---|---|
| **WRITE mapper** | scanner-first API step → internal legacy processor | This decision / B8+ write path |
| **B9 READ mapper** | legacy persisted/setup state → scanner-first public setup representation | `GET .../products/{id}/setup` hydration |

Do **not** merge write and read responsibilities. B8 numbering blocker is **resolved by this architecture decision**, not by coupling B8+B9 into one implementation package. B9 remains required for legacy resume hydration; it is **not** a prerequisite to start B8 implementation.

---

## WSM-6 — B8 `scanBootstrap` request contract (LOCKED — semantic)

Extend existing `SaveProductDraftRequest` for **CREATE bootstrap only** with nested `scanBootstrap`:

```json
{
  "currentSetupStep": 2,
  "scanBootstrap": {
    "acquisitionMode": "SCAN | MANUAL | NO_BARCODE",
    "creationAction": "USE_THIS_PRODUCT | CREATE_MANUALLY | CONTINUE_WITH_BARCODE | CONTINUE_TO_BASIC_DETAILS",
    "candidateIdentifier": "...",
    "identifierStandard": "...",
    "symbologyHint": "...",
    "noBarcodeReason": "...",
    "externalLookupStatus": "...",
    "externalSourceReference": "...",
    "normalizedPrefill": { },
    "generatedSkuCandidate": "..."
  }
}
```

Use Backend naming conventions at implementation time. `creationAction` is **orchestration input only** — do **not** add a new DB column for it unless schema already owns an equivalent. Persist the resulting normalized scan-context fields.

Prefer `CONTINUE_TO_BASIC_DETAILS` over `CONTINUE_NO_BARCODE` (navigation/intent, not a duplicate of acquisition mode).

Fresh B8 modes: `SCAN` | `MANUAL` | `NO_BARCODE`. `LEGACY` remains reserved for historical compatibility — clients must not use `LEGACY` as a normal fresh creation choice.

---

## WSM-7 — Identifier / symbology / external status (LOCKED)

Preserve TD-2 split:

| Concept | Values |
|---|---|
| `identifierStandard` | `GTIN8`, `GTIN12`, `GTIN13`, `GTIN14`, `OTHER` |
| Symbology / `symbologyHint` / barcode type | `EAN13`, `EAN8`, `UPCA`, `CODE128`, `CODE39`, `UNKNOWN` |

GTIN14 is **not** a symbology. Leading zeros remain significant. Identifier remains a string.

**External lookup status (verified from B1 schema + Scan Spec + domain tests):**

| Value | Meaning |
|---|---|
| `NOT_STARTED` | Canonical no-lookup / not-yet-performed value |
| `FOUND` | Provider suggestion available |
| `NO_MATCH` | No usable external match |
| `TEMPORARY_FAILURE` | Transient provider failure |

Column `external_lookup_status` is nullable in B1 EF; documented canonical enum set above. Do **not** invent `NOT_ATTEMPTED` or other synonyms.

---

## WSM-8 — `normalizedPrefill` (LOCKED)

Must reuse the B6 provider-neutral `ExternalProductSuggestion` contract (or a strict typed subset). Allowed suggestion fields include:

`productName`, `shortName`, `brandText`, `categoryText`, `unitText`, `countryCode`, `shortDescription`, `longDescription`, `imageCandidate`, `primaryGtin`, `identifierStandard`, plus `sourceReference` where carried separately.

**Forbidden** as persisted/client bootstrap content: raw provider payload, arbitrary `JsonElement` / dictionary bags, API credentials, HTTP headers, provider secrets, raw exception data.

---

## WSM-9 — Creation-action field retention (LOCKED)

| `creationAction` | Retain | Discard / ignore |
|---|---|---|
| `USE_THIS_PRODUCT` (after FOUND) | Candidate identifier + metadata; external status; provider-neutral source reference; normalized editable prefill | Treating suggestions as authoritative tenant Brand/Category/UOM IDs |
| `CREATE_MANUALLY` (after FOUND) | Candidate identifier + identifier standard + acquisition history | External normalized prefill for Step 2 |
| `CONTINUE_WITH_BARCODE` | Validated candidate + standard + symbology context + lookup status where applicable | External product suggestions (not required) |
| `CONTINUE_TO_BASIC_DETAILS` + `NO_BARCODE` | `acquisitionMode = NO_BARCODE` + canonical `noBarcodeReason` | Fake barcode generation |

`generatedSkuCandidate` remains preview / `reserved = false` / non-final. Not `ProductVariant.sku` ownership, reservation, or sequence allocation. Final SKU = Step 5 / DB (**B10 IMPLEMENTED**).

---

## WSM-10 — Duplicate safety + final identifier ownership (LOCKED)

| Phase | Responsibility |
|---|---|
| B4 | Tenant duplicate resolution (read-only resolve) |
| B7 | **No** tenant duplicate checking |
| B8 | Write-boundary duplicate safety when a candidate identifier exists (before commit) |
| B8 | Candidate identifier in **scan context only** — **no** final `product_barcodes` ownership |
| B10 / Step 5 | Final identifier ownership |

---

## Implementation status after this decision

| Item | Status |
|---|---|
| B1–B12 | **IMPLEMENTED** |
| Write-stage numbering blocker | **RESOLVED BY ARCHITECTURE DECISION** (and implemented in B8) |
| Flutter Step 1 | **PARTIAL / PENDING** |

**Final status line:**

`SCANNER-FIRST WRITE-STAGE MAPPING DECISION LOCKED — B1–B12 BACKEND IMPLEMENTED — READY FOR FRONTEND`
