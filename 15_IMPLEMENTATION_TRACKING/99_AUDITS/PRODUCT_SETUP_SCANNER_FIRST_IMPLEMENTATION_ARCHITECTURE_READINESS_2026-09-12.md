<!-- title: Product Setup Scanner-First Implementation Architecture Readiness -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-12 -->
<!-- type: Chunk 3 audit — DOCUMENTATION ONLY; no implementation claimed -->

> **Implementation status note (2026-09-12):** Historical readiness snapshot preserved. Implementation status has advanced (Backend B1–B4); see [[../../00_START_HERE/Current_Source_Of_Truth]] and current implementation checklist.

# PRODUCT_SETUP_SCANNER_FIRST_IMPLEMENTATION_ARCHITECTURE_READINESS_2026-09-12

Authority bridge: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scanner_First_Implementation_Architecture]].

Chunk 1–2 functional/technical contracts remain canonical. This audit records **implementation architecture readiness only**. Scanner-first coding/migrations remain **TARGET — NOT IMPLEMENTED**.

---

## A. Current implementation inventory

| Capability | Owner | Action |
|---|---|---|
| Draft/setup/publish HTTP | `TenantAdminProductsController` | EXTEND |
| Orchestration | `TenantAdminProductService` | EXTEND |
| Draft save | `SaveProductDraftAsync` / Wizard repositories | REUSE/EXTEND |
| Access | `ProductWizardAccessPolicy` | EXTEND (`catalog.*`) |
| Step processors 2–7 | `IProductWizardStepProcessor` | REUSE |
| Identifier apply | `ApplyBarcodeSkuConfigurationAsync` | EXTEND |
| Variant projection | `ProjectVariantConfigurationAsync` | REUSE |
| Media stage | Existing stage API | REUSE |
| Flutter wizard | `AddProductWizardController` | EXTEND |
| Flutter data | `tenant_product_remote_datasource` / repository | EXTEND |
| HID framing | POS Barcode_Scanner_Integration | REUSE framing |
| Resolve / external / SKU candidate | — | NEW (TARGET) |
| Scan context / identifier_standard | — | NEW migration (TARGET) |
| POS by-barcode | POS routes | DO NOT TOUCH |

---

## B. Backend REUSE / EXTEND / NEW

| Item | Action | Status |
|---|---|---|
| Controller / service / repository / policy / validators / publish / pricing / variants | REUSE or EXTEND | EXISTING + EXTEND |
| Resolve / external coordinator / SKU candidate / provider interface+adapters / scan-context EF / legacy remapper / identifier_standard UNKNOWN | NEW or EXTEND TARGET | TARGET — NOT IMPLEMENTED |
| Parallel CatalogProduct subsystem | DO NOT TOUCH | Forbidden |

---

## C. Flutter REUSE / EXTEND / NEW

| Item | Action | Status |
|---|---|---|
| Shell, stepper, footer, dialogs, loading, Steps 2–7 widgets, detail/edit routes, Dio interceptors | REUSE | EXISTING |
| `AddProductWizardController`, repository/datasource, Step 5 `barcode_sku` | EXTEND | EXTEND EXISTING |
| Step 1 panels/state machine, resolve/external/SKU DTOs+methods | NEW under existing feature | TARGET — NOT IMPLEMENTED |
| Second Add Product feature | Forbidden | DO NOT TOUCH |

---

## D. DB migration targets (scanner-first B1 — not applied)

1. Expand allowed `barcode_type` with `UNKNOWN` (never `GTIN14`).
2. Nullable `product_barcodes.identifier_standard` (`GTIN8|12|13|14|OTHER`; existing NULL OK).
3. Create `product_setup_scan_context` 1:1 Product DRAFT (Table 10 field set).
4. Indexes/FKs/CHECKs for scan context.
5. Verification: POS lookup unaffected; no cross-tenant uniqueness regression.

**OUT OF B1:** `product_setup_initial_tracking` is **EXISTING** (`20260824095742_AddProductSetupInitialTracking`; CURRENT Step 3). Do not recreate. Live DB/E2E: [[TENANT_ADMIN_PRODUCT_SETUP_INITIAL_TRACKING_PERMISSION_FIRST_IMPLEMENTATION_CLOSURE_2026-08-24]] — do not infer production acceptance from docs alone.

Rollback: follow existing EF migration governance. Prefer retain scan context after publish (audit) over destructive delete.

---

## E. API implementation matrix

| Route | Layer | Auth | Side effect | Status |
|---|---|---|---|---|
| `POST .../barcodes/resolve` | App + Domain validate + Infra lookup | create + product_catalog | NONE | TARGET |
| `POST .../barcodes/external-lookup` | App coordinator + Infra providers | create + product_catalog | NONE | TARGET |
| `POST .../sku-candidates/generate` | App + generator utility | create + product_catalog | NONE (no catalogue persist) | TARGET |
| `POST .../products/draft` | App + Repo TX | create + product_catalog | Product DRAFT + scan context | EXTEND TARGET path |
| `PUT .../{id}/draft` | Existing pipeline | step specialized | Persist draft | EXISTING EXTEND |
| `GET .../{id}/setup` | Hydration + remapper | view/setup | NONE (read) | EXTEND TARGET remap |
| `POST .../{id}/publish` | Publish service | publish + rechecks | Activate | EXTEND revalidation |
| `POST .../products` | Existing | create | Direct graph | EXISTING — not wizard bootstrap |

---

## F. Folder ownership matrix

**Backend:** `E_POS.Api/.../CatalogProduct/` · `E_POS.Application/.../CatalogProduct/` · Domain CatalogProduct · `E_POS.Infrastructure/.../Repositories` + TARGET `Integrations/ProductLookup/`.

**Flutter:** `lib/features/tenant_admin/products/` — extend controller/data; TARGET `presentation/widgets/scan_barcode/`.

Confirm TARGET class names against Unified-Commerce before coding.

---

## G. Permission ownership

| Concern | Owner |
|---|---|
| Canonical `catalog.*` + one-way aliases | Backend effective-permission / `ProductWizardAccessPolicy` |
| Entitlement `product_catalog` / `inventory_tracking` | Backend |
| Flutter hide/disable/route | UX only |

Step 1 discovery: create + product_catalog. Identifiers: barcodes.manage. Dual authority (`tenant.products.*` as runtime peer) remains a known implementation gap until B10.

---

## H. Test implementation matrix (planned — not executed)

**Backend:** GTIN checksum/length/zeros/standard/UNKNOWN; tenant match/isolation; 0/1/N providers; SKU non-reservation; bootstrap atomicity; legacy remap; Step 5 assign; publish race 409; 403 permission/entitlement.

**Flutter:** scanner frame; leading zero; double-scan suppress; all Step 1 states; late async suppress; draft success/error; legacy resume; permission buttons; 1024 overflow.

---

## I. Backend sequence

B1 migrations → B2 identifier validation → B3 resolve → B4 SKU candidate → B5 providers → B6 draft bootstrap → B7 setup remap → B8 Step 5 identifiers → B9 publish → B10 catalog.* switch → B11 tests.

## J. Flutter sequence

F1 DTOs → F2 repository → F3 Step 1 state → F4 HID → F5–F11 Step 1 UI → F12 draft→Step 2 → F13 Step 5 identifiers → F14 resume → F15 permission UX → F16 a11y/responsive → F17 tests.

---

## K. Implementation blockers

1. EF migrations not written/applied (scan_context, identifier_standard, UNKNOWN).
2. No concrete external provider required for public NO_MATCH; optional provider remains open for FOUND path.
3. Runtime policy still needs `catalog.*` seed/guard switch (B10).
4. Confirm existing SKU generator class name in Unified-Commerce before B4.
5. Physical SC-* hardware acceptance incomplete — HID software path still first-class for Product Setup.

---

## L. Implementation dependencies

Functional/technical contracts (Chunks 1–2) → Architecture (this Chunk 3) → coding.  
B6 depends on B1. F12 depends on B6 API. F5–F11 depend on B3–B5. B9 depends on B8. Flutter must not remumber legacy steps (B7).

---

## M. Readiness assessment

| Question | Answered by architecture? |
|---|---|
| Which endpoints / layers / reuse / migrations / scan context / final identifiers / permissions / legacy map / publish revalidate / tests? | **Yes** |
| Which Flutter feature/controller / scanner / SM / repository / widgets / draft→2 / resume / errors / permission UX / tests? | **Yes** |

**Chunk 3 status: COMPLETE — READY FOR CHUNK 4**

Not claimed: Backend/Flutter implementation complete; migrations applied; whole Product Setup release closed.
