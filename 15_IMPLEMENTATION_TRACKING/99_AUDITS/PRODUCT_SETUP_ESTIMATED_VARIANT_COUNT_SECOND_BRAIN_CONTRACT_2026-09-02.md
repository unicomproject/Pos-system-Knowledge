<!-- title: Product Setup Estimated Variant Count Second Brain Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-02 -->

# Product Setup — Estimated Variant Count Second Brain Contract (2026-09-02)

## Scope

Documentation-only canonicalization for:

```text
Product Setup → VARIANT Product → Product Configuration → Estimated Variant Count
```

No backend, Flutter, database, migration, or runtime behaviour changes were made in this phase.

## Documents Audited

- `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification.md`
- `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules.md` (referenced; unchanged)
- `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md`
- `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md`
- `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
- `10_TESTING_QA/Test_Case/10_Product_Core/Product_Crud_Test_Cases.md`
- `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`
- `15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-11_Tenant_Admin_Add_Product_Step4_Variant_Configuration_Final_Canonicalization_Audit.md`

## Documents Updated

- `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification.md` — added **Section 3.4** (canonical owner)
- `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md`
- `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md`
- `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md`
- `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
- `10_TESTING_QA/Test_Case/10_Product_Core/Product_Crud_Test_Cases.md`
- `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`

## Preserved Locked Decisions

- SIMPLE Step 4 remains `NOT_APPLICABLE` — no Estimated Variant Count card.
- Existing Step 4 validation codes preserved (`product.variant_options_required`, `product.option_values_required`, `product.included_variant_required`).
- `MaxVariantCombinationsPerProduct = 100` preserved and referenced (not invented).
- Section 8 downstream invalidation / destructive matrix change rules preserved.
- SKU / Barcode remain Step 5 responsibilities.
- No duplicate canonical specification document created.

## Documentation Consistency Audit

| Check | Result |
|---|---|
| Product Setup wizard contract not contradicted | PASS |
| SIMPLE flow untouched | PASS |
| VARIANT flow owns Estimated Variant Count | PASS |
| No dedicated estimate API required | PASS |
| Flutter owns live display calculation | PASS |
| Backend owns authoritative recalculation + combination generation | PASS |
| Estimated count is derived, not authoritative | PASS |
| Draft reopen recalculates from persisted configuration | PASS |
| Attribute/value changes dynamically update estimate | PASS |
| SKU / Barcode behaviour unchanged | PASS |
| No arbitrary maximum variant limit invented | PASS (`100` already canonical) |
| Runtime code changed | **NO** |

## Open Decisions

**None introduced.**

- **Maximum variants per product**: Already defined as `MaxVariantCombinationsPerProduct = 100`.
- **Variant configuration change after variant data generated**: Already defined in Variant Configuration Specification Section 8.

## Implementation Boundary

| Phase | Status |
|---|---|
| Second Brain contract | READY |
| Backend implementation | PENDING (separate phase) |
| Backend tests | PENDING |
| Flutter implementation | PENDING (separate phase) |
| Flutter tests | PENDING |
| Live E2E validation | PENDING |

## Database Migration Required From This Decision

**NO** — derived UX count only; authoritative data remains selected attributes + values + generated variants.

## Final Verdict

**SECOND BRAIN PRODUCT VARIANT ESTIMATED COUNT CONTRACT READY FOR BACKEND AND FRONTEND IMPLEMENTATION**

This phase is documentation/specification only. Implementation is not complete.
