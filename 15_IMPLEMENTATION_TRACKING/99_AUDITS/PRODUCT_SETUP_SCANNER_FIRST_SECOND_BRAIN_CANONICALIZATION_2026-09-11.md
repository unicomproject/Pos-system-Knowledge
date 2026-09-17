<!-- title: Product Setup Scanner-First Second Brain Canonicalization Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-11 -->

> **Implementation status note (2026-09-12):** Historical canonicalization snapshot preserved. Implementation status has advanced (Backend B1–B4); see [[../../00_START_HERE/Current_Source_Of_Truth]] and current implementation checklist.

# PRODUCT SETUP SCANNER-FIRST — SECOND BRAIN CANONICALIZATION AUDIT (2026-09-11)

## Final readiness

**DOCUMENTATION CANONICALIZED — IMPLEMENTATION READY**

Locked contracts: 7-step order, Step 1 state machine, GTIN-14 representation, `product_setup_scan_context`, resolve/external-lookup APIs, permissions, legacy draft mapping, provider-agnostic external lookup (no specific commercial provider required to implement core Product Setup).

> [!IMPORTANT]
> **Chunk 2 verification (2026-09-12) corrected part of this audit.** The GTIN-14
> representation recorded here (`barcode_type = GTIN14`) is **superseded**: `barcode_type`
> stays symbology-only and the identifier standard moves to a new nullable
> `product_barcodes.identifier_standard`. The scan-context field set was also reconciled and
> the permission authority question was closed. Current technical authority:
> [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]].

**Not claimed:** Backend or Flutter implementation of this remumber.

---

## A. Final canonical 7-step lifecycle

1. Scan Barcode  
2. Basic Details  
3. Product Type & Tracking  
4. Unit & Pack Conversion  
5. Product Configuration (matrix/bundle **+** identifier section)  
6. Pricing & Tax  
7. Review & Create  

Standalone **Barcode & SKU** = **SUPERSEDED**.

## B. Step 1 state-machine diagram

See [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]] §4.2 (mermaid).

States: S1-A…S1-G + S1-R1…S1-R3.

## C. State transition matrix

See Scan Barcode spec §4.3.

## D. UI screen/action matrix

| State | Primary actions |
|---|---|
| S1-A | Manual entry, No barcode, Cancel; Waiting for scan |
| S1-B | Auto validate + local lookup |
| S1-C | View / Edit Existing / Back |
| S1-D | Search Product Data / Enter details manually / Back |
| S1-E | Searching… cancel/retry |
| S1-F | Use This Product / Create Manually / Back |
| S1-G | Continue / Scan another / Manual / Without barcode |
| S1-R1 | Validate / Back to Scan / No barcode |
| S1-R2 | Try Again / Rescan / Without barcode |
| S1-R3 | Continue to Basic Details |

Shell/tokens: EXISTING Design System + Tenant Admin layout. Screenshots = interaction reference only.

## E. Functional requirements

FR-S1-001 Scanner-first default entry  
FR-S1-002 Pre-draft until creation path  
FR-S1-003 Format vs catalogue separation  
FR-S1-004 Explicit external lookup only  
FR-S1-005 Safe duplicate projection under create  
FR-S1-006 No-barcode bootstrap reasons OWN_MADE/SERVICE_FEE/UNLABELLED  
FR-S1-007 Identifier finalization in Step 5  
FR-S1-008 Step 7 publish revalidation  

## F. Business rules

- Tenant-unique barcode/GTIN  
- Never silent duplicate GTIN publish  
- Clone clears identifiers  
- External data suggestion-only; no auto Brand/Category/UOM create  
- No-barcode reason ≠ `product_structure`  
- VARIANT: no silent GTIN fan-out; unique SKUs per included variant  
- Controlled auto-SKU for no-barcode only  

## G. Validation rules

Supported manual lengths 8/12/13/14 + checksum where GTIN. Invalid → no catalogue/external. Server authoritative.

## H. Permission/entitlement matrix

| Capability | EXISTING / REUSE | EXTEND | NEW TARGET |
|---|---|---|---|
| `catalog.products.create` + `product_catalog` for resolve/external | REUSE | EXTEND (apply to new routes) | — |
| Safe duplicate projection under create | — | EXTEND | — |
| `catalog.products.view` / `.update` for View/Edit existing | REUSE | — | — |
| `catalog.barcodes.manage` on Step 5 identifiers | REUSE | — | — |
| `catalog.variants.manage` / pricing / cost / publish | REUSE | — | — |
| New product permission for external lookup | — | — | **Not required** |

## I. API matrix

| API | Classification |
|---|---|
| `PUT/GET/POST` draft/setup/publish products | EXISTING / EXTEND (scan context) |
| `POST .../barcodes/resolve` | **NEW TARGET** |
| `POST .../barcodes/external-lookup` | **NEW TARGET** |
| POS `GET .../by-barcode` | EXISTING — **do not use** from Tenant Admin Product Setup |
| Unified `SaveProductDraftAsync` | EXISTING / REUSE |

## J. DTO/state ownership

| State | Owner |
|---|---|
| Transient Step 1 UI states | Flutter wizard controller (extend) |
| Scan bootstrap | `product_setup_scan_context` (TARGET) |
| Master product fields | `products` from Step 2 |
| Initial tracking draft | `product_setup_initial_tracking` (Step 3) |
| Final barcodes | `product_barcodes` |
| Final SKUs | `product_variants.sku` |

## K. Database/table impact

| Item | Classification |
|---|---|
| `products.current_setup_step` 1–7 | EXISTING semantics **EXTEND** (new meaning) |
| `product_barcodes` + UNIQUE(tenant, barcode) | EXISTING / REUSE |
| ~~`barcode_type` allow `GTIN14`~~ | **CORRECTED 2026-09-12 — REJECTED.** `barcode_type` is symbology-only (gains `UNKNOWN`); identifier standard moves to TARGET nullable `product_barcodes.identifier_standard` |
| `product_setup_scan_context` | **NEW TARGET** table (field set reconciled 2026-09-12) |
| Misuse product_structure / initial_tracking for scan | **Forbidden** |

## L. External integration architecture

`ExternalProductLookupService` + `IExternalProductLookupProvider` — **NEW TARGET** abstraction. Provider credentials backend-only. No Flutter scrape. No claimed GS1/supplier implementation without separate approval.

## M. Frontend reuse/folder ownership

| Item | Classification |
|---|---|
| Tenant Admin shell / stepper / footer | REUSE |
| `AddProductWizardController` | EXTEND (Step 1 state machine) |
| HID framing | REUSE / EXTEND from scanner integration |
| Identifier table widgets | REUSE under Step 5 section |
| Competing wizard controller | **Forbidden** |
| Step 1 widgets folder | **NEW TARGET** under existing products feature |

## N. Backend reuse/layer ownership

| Item | Classification |
|---|---|
| Clean Architecture layers / module folders | REUSE |
| Unified draft save pipeline | REUSE |
| Barcode validation application service | EXTEND / share with POS where safe |
| Resolve + ExternalLookup endpoints | **NEW TARGET** |
| Step processors for scan context | EXTEND |

## O. NFR matrix

Security, reliability, performance, concurrency, idempotency, observability, a11y, responsive — documented in Scan Barcode spec §19. **NEW TARGET** coverage for external-lookup NFRs; local resolve **EXTEND**.

## P. Error/recovery matrix

INVALID → S1-R2; VALID_LOCAL_MATCH → S1-C; VALID_NO_LOCAL_MATCH → S1-D (outcome names finalized 2026-09-12); FOUND/NO_MATCH/TEMPORARY_FAILURE external; 409 duplicate; 403 permission; never expose raw provider/DB exceptions.

## Q. Draft migration compatibility

D11 mapping documented in Draft Lifecycle + Decision. Old step 5 identifiers → new step 5 identifier section without data loss. Drafts without scan context resolve as `acquisition_mode = LEGACY` (updated 2026-09-12; the separate `LEGACY_MANUAL` bootstrap field was removed as duplication), remapped in a read-time compatibility layer in `GET .../setup`.

## R. Test matrix

[[../../10_TESTING_QA/Test_Case/10_Product_Core/Product_Setup_Step1_Scan_Barcode_Test_Cases]] (PS1-001…050).

## S. Stale-document replacement list

| Document | Action |
|---|---|
| `Tenant_Admin_Product_Barcode_SKU_Specification.md` | Redirect stub (**SUPERSEDED** as standalone step) |
| Active 7-step / journey / UI / Flutter / ACL / API / DB Product Setup docs | Updated to scanner-first |
| Historical audits (Aug–Sep Step5 Barcode closures, Step6 closures citing old order) | Evidence only; **not** current stepper authority |
| `99_Archive/**` old wizard snapshots | Untouched history |
| Initial Tracking “Step1/Step2” filenames | Historical names; collection = **Step 3** |

## T. Remaining implementation gaps (do not block documentation readiness)

> **UPDATED 2026-09-12 (Chunk 2 verification).** Technical authority for items below is now
> [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]].

1. EF migration for `product_setup_scan_context` + **nullable `product_barcodes.identifier_standard`** + `UNKNOWN` symbology allowed value (**not** a `GTIN14` barcode_type value — that was corrected)  
2. Implement resolve + external-lookup APIs + Flutter Step 1 UI  
3. Legacy draft remapping as a read-time compatibility layer in `GET .../setup`  
4. Choose/configure concrete external provider later (abstraction is enough to implement manual-fallback Product Setup)  
5. Permission authority is **CLOSED** as a documentation rule (one canonical `catalog.*` code per gate + one-way alias). Residual work is implementation only: `ProductWizardAccessPolicy`, Flutter route guards, and grant seed still use `tenant.products.*`  

## Capability classification summary

| Capability | Mark |
|---|---|
| 7-step shell / draft pipeline / identifier domain rules | EXISTING / EXTEND |
| Scanner-first Step 1 state machine docs | NEW TARGET (docs) |
| Standalone Barcode & SKU global step | SUPERSEDED |
| External lookup provider abstraction | NEW TARGET |
| POS by-barcode for TA Product Setup | SUPERSEDED misuse |

## Grep evidence (post-edit intent)

Active canonical step lists must lead with **Scan Barcode**. Remaining “Barcode & SKU” hits in active Product Setup docs must be supersession/redirect/historical-mapping language only. Archives and dated evidence audits may still describe the old order.
