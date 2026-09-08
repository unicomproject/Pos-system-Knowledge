# PRODUCT SETUP STEP 5 VARIANT SKU & BARCODE — AUDIT MATRIX

<!-- title: Step 5 VARIANT SKU & Barcode Audit Matrix -->
<!-- status: Active -->
<!-- last_updated: 2026-09-03 -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->

## Purpose

Pre-implementation audit for Tenant Admin Product Setup **Step 5 — VARIANT SKU & Barcode** final alignment.
Produced before Second Brain rewrite and before backend/Flutter code changes.

**Override decisions (task):**
- Visual reference may look like SIMPLE; VARIANT Step 5 is **table-first**.
- **No Auto-generate SKU**.
- Row checkbox/selection = **UI-only** (does not change Step 4 `Include Variant` / sellability).
- Step 4 is authoritative for which variants require identifiers.

---

## Audit Matrix

| # | Topic | Current | Target | Gap | Backend | Flutter | DB | Second Brain | Test |
|---|---|---|---|---|---|---|---|---|---|
| 1 | VARIANT UX shape | Form-first: Selected panel + Apply + table of assignments | Table-first: Select \| Variant \| SKU \| Barcode \| Status \| Actions; search + filter; ~5-row internal scroll | Major UX rewrite | None for layout | `step_5_barcode_sku_form.dart`, `step_5_identifier_table.dart` | None | UI/UX + Flutter specs missing Step 5 | VARIANT widget tests |
| 2 | Auto-generate SKU | Spec describes auto-gen; Flutter VARIANT has no button; helper exists unused | Manual SKU only; no auto-gen button; never overwrite manual | Spec stale; remove auto-gen from contract | Remove any wizard auto-gen seed assumptions | Ensure no Generate control; leave helper unused or SIMPLE-only | None | Barcode/SKU spec §3.2/§5 | Assert no auto-gen control |
| 3 | `barcodeType` on assignment | DTO has no type; create hard-codes `"EAN13"` | Assignment carries `barcodeType`; create-options catalogue; no hard-code | Critical | DTO + Apply + Project + Validator + create-options | Assignment DTO + drawer/editor + mapper + codec | Column exists — **no migration** | Spec + Technical Contract + API_ENDPOINTS | Round-trip + no EAN13 hard-code |
| 4 | Save & Continue coverage | Draft Continue validates **submitted** assignments only; create-path validates all included | Authoritative: all Step 4 included/sellable variants must have SKU | Critical for draft | Validator + service must load Step 4 targets | Client already checks included SKUs; align copy | None | Spec § Save & Continue | 2-of-6 omit → fail |
| 5 | Duplicate uniqueness | N+1 `SkuExistsAsync`/`BarcodeExistsAsync`; draft case-sensitive vs create ignore-case | Bulk conflict queries; **one** case rule = DB (case-sensitive / Ordinal) | Performance + consistency | Bulk Find*Conflicts; align HashSet Ordinal | Match server (trim; case-sensitive compare) | Existing unique indexes | Spec § uniqueness | Dup in-request + DB + race 409 |
| 6 | Ownership of `ProductVariantId` | Draft apply `continue`s on unknown ID | Reject foreign/unknown/archived with field error | Security | Apply + Validate ownership | Surface field errors | None | Spec | Cross-product injection |
| 7 | Projection / rehydrate | SKU + barcode + synthetic status; no type; no client key | SKU, barcode, barcodeType, clientCombinationKey, derived status | Gap | `ProjectBarcodeSkuConfigurationAsync` | Codec + hydrate | None | Spec | GET setup restore |
| 8 | Selection semantics | `_selectedClientKey` UI-only (good) | Multi-select checkbox UI-only; never persist; never change sellability | UX only | None | Add Select column; keep UI-only | None | Explicit in UI + Flutter specs | Selection does not drop SKU |
| 9 | Search / filter | Missing | Client-side search + status filter | UX | None | Form toolbar | None | UI/UX | Filter Complete/Incomplete/Error |
| 10 | Scanner | Focus field; HID wedge assumed; no Enter-complete policy documented | Focus → chars → trailing Enter → one logical edit → debounce draft | Soft | None | Explicit onSubmitted / debounce | None | Spec + Flutter | Leading zeros |
| 11 | Barcode requiredness | UI says Barcode *; Complete = SKU only; Continue SKU-only | **SKU mandatory** on Continue for included variants; **barcode optional**; if barcode set → type + format required | Align copy + validation | Format validation when barcode present | Labels + validation | None | Spec must state clearly | Blank barcode OK; bad format fail |
| 12 | Additional Barcode UI | Orphan widgets/DTOs not in main form | Retire from Step 5 surface; do not revive in table | Cleanup | None unless still API-used | Stop shipping orphans after confirm unused | None | Mark obsolete | — |
| 13 | Stale DTO docs | Spec still shows `variantIdentifiers` / `baseSku` | Canonical `barcodeSkuConfiguration.assignments` | Doc only | Already on assignments | Already on assignments | None | Rewrite payload sections | — |
| 14 | Permissions | Matrix already names barcodes.manage + barcodeSkuConfiguration | Keep | Low | Unchanged | Unchanged | None | Minor sync if field paths change | 403 tests |
| 15 | quantityPerScan / UOM | Always `1` / null UOM | Primary selling-unit barcode; qty=1 acceptable for R1 if documented | Document R1 | Keep unless Step 3 mapping required | No UOM column in compact table | None | Spec R1 note | — |
| 16 | EF Migration | `barcode_type`, SKU unique indexes exist | No schema change for this task | **NONE REQUIRED** | — | — | Confirm only | Note in DB docs | — |

---

## Critical Code Hotspots

| Area | Path |
|---|---|
| Hard-coded EAN13 | `TenantAdminProductRepository.Wizard.cs` `ApplyBarcodeSkuConfigurationAsync` |
| Coverage gap | `TenantAdminProductRequestValidator.ValidateBarcodeSkuContinue` |
| N+1 uniqueness | `TenantAdminProductService.ValidateBarcodeSkuConfigurationAsync` |
| Silent skip ownership | `ApplyBarcodeSkuConfigurationAsync` `if (targetVariant == null) continue` |
| Flutter VARIANT UI | `step_5_barcode_sku_form.dart` `_buildVariantForm` |
| Assignment DTO | Flutter `step5_barcode_dtos.dart` + Backend `BarcodeSkuAssignmentDto` |

---

## Second Brain Files To Update (ordered)

1. `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Barcode_SKU_Specification.md` — **canonical rewrite**
2. `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md` — expand Step 5
3. `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md` — add Step 5 VARIANT section
4. `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md` — Step 5 widgets/state
5. `04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract.md` — DTO shape
6. `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md` — request body
7. `04_MODULE_KNOWLEDGE/12_.../Tenant_Admin_Product_Variant_Configuration_Specification.md` — handoff link
8. `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md` — one-liner fix
9. Mark superseded: `15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-14_Tenant_Admin_Barcode_SKU_Step5_Second_Brain_Readiness_Audit.md`
10. New QA: `10_TESTING_QA/Test_Case/10_Product_Core/Tenant_Admin_Product_Barcode_SKU_Step5_Test_Cases.md`

---

## EF MIGRATION

**EF MIGRATION: NONE REQUIRED**

`product_barcodes.barcode_type` and `product_variants.sku` (+ unique indexes) already exist.

---

## Next Step

Update Second Brain canonical Barcode/SKU specification to lock the target contract above, then implement backend + Flutter against that contract.
