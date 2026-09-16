<!-- title: Product Setup User-Journey-Only Gap Matrix -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: In-scope journey audit — DOCUMENTATION; no unrelated Product Setup gaps -->

# PRODUCT_SETUP_SUPPLIED_USER_JOURNEY_GAP_MATRIX_2026-09-13

**Scope lock:** ONLY the user-supplied scanner-first Product Setup journey (Steps 1–7 with Step 1 internal states).  
**OUT OF SCOPE (document only):** BUNDLE component graph, hardware certification, production deploy, inventing external providers, Inventory/POS/Reports, new Product Structures.

| User Journey Requirement | Second Brain | Backend | Flutter | Status | Action |
|---|---|---|---|---|---|
| Exact 7-step stepper; no global Barcode & SKU | LOCKED | n/a | Stepper 7 labels | **IMPLEMENTED** | Preserve |
| S1-A Scan + HID frame → one resolve | Scan Spec | B4 resolve | ScanReady + POS HID | **IMPLEMENTED** | Preserve |
| S1-B Validating / catalogue check | Scan Spec | B4 | validating panel | **IMPLEMENTED** | Preserve |
| S1-C Existing Found + View Product | Scan Spec | B4 localMatch | panel + view route | **PARTIAL** | Add Create Duplicate CTA; View already |
| Create Duplicate → NEW DRAFT; clear IDs/stock | TD-8 TARGET | `POST .../duplicate` exists; **copies SKUs** | `?duplicateFrom=` client reset; not on S1-C | **PARTIAL** | Harden SKU clear + wire S1-C |
| S1-D No local match; no auto external | Scan Spec | B4 | panel | **PARTIAL** | Back must retain candidate |
| S1-E Search Product Data (explicit) | Scan Spec | B7 | runExternalLookup | **IMPLEMENTED** | Preserve |
| External FOUND data | Spec | B6/B7; **zero providers → NO_MATCH** | S1-F UI | **BLOCKED** (provider) / UI **PARTIAL** | Keep flow; no invent provider; show longDesc/image |
| S1-G four choices | Scan Spec | B8 bootstrap | panel | **IMPLEMENTED** | Preserve |
| S1-R1 Manual → same resolve | Scan Spec | B4 | manual panel | **IMPLEMENTED** | Preserve |
| S1-R2 Invalid only for format | Scan Spec | B4 INVALID | panel | **PARTIAL** | Don’t map Dio→Invalid |
| S1-R3 No barcode OWN_MADE/SERVICE_FEE/UNLABELLED + SKU candidate | Scan Spec | B5+B8 | panel | **PARTIAL** | Category picker + auto-SKU on open |
| Use This / Create Manually / Continue / No barcode → Step 2 | Draft Lifecycle | B8 scanBootstrap | `_bootstrapDraft` | **PARTIAL** | Seed Step 5 candidate; hydrate scanContext |
| Steps 2–7 reuse; scanner numbering | Contract | Steps 2–6/7 BE done | screens exist | **PARTIAL** | Fix `saveAndContinue` remumber only |
| Step 5 identifiers (not global Barcode step) | Identifier Spec | B10 | Step5BarcodeSkuForm | **PARTIAL** | Seed from scan; no BUNDLE graph |
| Step 7 publish | Review Spec | B11 | existing | **IMPLEMENTED** | Preserve |
| Concrete external provider | Architecture | none registered | n/a | **BLOCKED** / **OUT OF SCOPE** invent | Document only |
| BUNDLE component graph | Contract | PARTIAL | n/a | **OUT OF SCOPE** | Document only |

**Pre-code journey blockers to close:** remumber Save&Continue; S1-C Duplicate; Duplicate SKU clear; S1-R3 category; S1-D back; Dio→Invalid; S1-F fields; scanContext/Step5 seed; journey tests.

**Provider:** FLOW supports FOUND/NO_MATCH/TEMPORARY_FAILURE; **REAL EXTERNAL FOUND DATA BLOCKED BY PROVIDER DECISION**.

---

## Post-implementation (same day)

Closed in scope:
- Save&Continue / Skip remumbered to scanner steps 2–7
- Units skip when Track Inventory OFF
- S1-C Create Duplicate → `POST .../duplicate` (SKU cleared) → Step 2
- S1-D Back retains validated candidate
- Dio resolve errors ≠ Invalid barcode panel
- S1-F longDescription + imageCandidate display
- S1-R3 Category picker + auto-SKU on open
- ScanContext hydrate + Step 5 barcode/SKU seed from candidate
- Journey/stepper tests

Still blocked (in-scope but decision-gated):
- Real external FOUND product data — **zero concrete providers**

OUT OF SCOPE unchanged:
- BUNDLE component graph
- Hardware certification
- Production deploy
