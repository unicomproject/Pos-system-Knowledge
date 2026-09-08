# PRODUCT SETUP STEP 5 VARIANT SKU & BARCODE — PRE-IMPLEMENTATION AUDIT
<!-- status: Active -->
<!-- last_updated: 2026-09-03 -->

## Scope
VARIANT-only Step 5 table-first alignment. SIMPLE remains separate. No Auto-generate SKU.

## Audit Matrix

| Current | Target | Gap | Backend | Flutter | DB | Second Brain | Test |
|---|---|---|---|---|---|---|---|
| Second Brain still describes Auto Generate SKU + Base SKU seed for VARIANT | Manual SKU only; no auto-generate | Spec stale | — | — | — | Barcode/SKU spec + 7-step contract + UI/UX + Flutter | Spec QA |
| Flutter VARIANT Step 5 recently skewed toward Selected-Variant card UX (from a SIMPLE screenshot mistake) | Table-first: Select, Variant, SKU, Barcode, Status, Actions + search/filter | UI mismatch | — | step_5_barcode_sku_form / identifier_table | — | UI/UX + Flutter specs | Widget + responsive |
| Backend `BarcodeSkuAssignmentDto` has no `BarcodeType` | Carry barcodeType end-to-end | DTO gap | Wizard DTOs + apply/project | step5 DTOs/state/mapper | none (column exists) | Barcode/SKU API section | JSON round-trip |
| `ApplyBarcodeSkuConfigurationAsync` hard-codes `"EAN13"` | Persist assignment.BarcodeType | Hard-code | Wizard.cs + WizardCreate.cs | — | none | Barcode type catalogue | Unit/integration |
| Projection omits barcodeType + clientCombinationKey | Rehydrate type + stable key | Projection gap | ProjectBarcodeSkuConfigurationAsync | hydrate mapping | none | Draft reopen | Draft reopen tests |
| `ValidateBarcodeSkuConfigurationAsync` per-assignment Exists calls | Bulk in-request + bulk DB conflict | N+1 | Service + repository bulk helpers | — | unique indexes already | NFR/perf | Uniqueness tests |
| Save & Continue validates submitted assignments only | Authoritative Step 4 included/sellable coverage | Coverage hole | Validator/service | continue validation | — | Save & Continue rules | Coverage tests |
| Ownership: missing variant `continue`s silently | Structured field error | Silent skip | Apply + validate | surface errors | — | Ownership rules | Ownership tests |
| Additional barcode widgets still in tree (legacy) | Retire from Step 5 surface if unused | Legacy UX | — | additional_* / delete_barcode_dialog | — | UI/UX | Compile/use grep |
| SKU case-sensitivity mixed in places | One canonical rule: trim + case-sensitive uniqueness matching DB | Consistency | validate/conflict | mirror | `UNIQUE(tenant_id, sku)` | SKU rules | Case tests |
| `product_barcodes.barcode_type` already exists | No new column | None | DTO only | DTO only | **EF MIGRATION: NONE REQUIRED** | DB docs wording | — |

## Findings Summary
1. DB already supports barcode_type and tenant barcode/SKU uniqueness.
2. Biggest functional gaps: barcodeType not in Step 5 DTO, EAN13 hard-code, N+1 uniqueness, incomplete Save & Continue coverage, silent ownership skip.
3. Flutter needs VARIANT table-first rebuild; SIMPLE form must stay untouched.
4. Second Brain still documents Auto Generate SKU — must be removed for VARIANT.

## Non-goals
- Bundle Step 5 redesign
- New Step 5 APIs
- New barcode tables
- Camera scanner dependency
- Auto-generate SKU button
