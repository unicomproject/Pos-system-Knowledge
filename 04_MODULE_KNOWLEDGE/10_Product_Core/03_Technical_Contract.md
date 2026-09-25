<!-- title: Product Core Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-24 -->
<!-- supersedes: old_step4_bundle_step5_standalone_barcode_numbering -->
<!-- extended: 2026-09-24 — VARIANT Quantity stock ownership & per-Variant reconciliation added -->

# Product Core Technical Contract

## Purpose

Defines the technical implementation contract for `Product_Core` in the OneVerz POS MVP scope.

**Implementation ownership bridge (Chunk 3):** layer/folder/service/Flutter sequences live in [[Tenant_Admin_Product_Setup_Scanner_First_Implementation_Architecture]] — do not duplicate architecture here. API field contracts remain in this document + [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]. Write-stage numbering: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]].

## TARGET CONTRACT (6-Step Wizard — LOCKED 2026-09-20)

The canonical TARGET Product Setup public wizard:

| Step | Name | Target API Responsibility |
|---:|---|---|
| 1 | Scan Barcode | Pre-draft acquisition; `POST .../barcodes/resolve`; `POST .../barcodes/external-lookup`; `POST .../sku-candidates/generate`; no product row created |
| 2 | Basic Details | Product name, category, brand, description, images, channel visibility |
| 3 | Product Type & Configuration | Product structure selection; SIMPLE: Unit/Packs/SKU; VARIANT: Attribute Matrix + Variant SKU/Barcode |
| 4 | Pricing & Tax | Selling price + tax class |
| 5 | Product Tracking | **OPTIONAL.** Quantity → Opening Stock + Outlet Allocation. Batch → Initial Batch identity. Batch + Expiry → Initial Batch + Expiry identity. Skip → no tracking. |
| 6 | Review & Create | Full review; atomic publish via `POST .../publish` |

**Target Step 5 requirements:**
- Quantity (SIMPLE): Opening Stock (required, >= 0) + Outlet Allocation (sum = Opening Stock if > 0). Creates initial stock.
- Quantity (VARIANT): Per-Variant Opening Stock (each >= 0) + per-Variant Outlet Allocation. Per-Variant exact reconciliation required. Product-total is informational only. Creates initial stock per Variant.
  - Each sellable ProductVariant is an independent stock owner. (IMPLEMENTATION VERIFICATION REQUIRED for actual DTO/service names)
  - Tracking policy is product-level. Mixed tracking per Variant is NOT supported.
  - Opening Stock must reuse existing ProductVariants from Step 3. No new Variants at stock time.
  - Draft stores per-Variant intent only; no inventory mutations until publish.
  - Publish must deliver per-Variant opening stock to existing Inventory domain service. (IMPLEMENTATION VERIFICATION REQUIRED)
  - Tenant isolation enforced on all per-Variant and per-Outlet queries.
  - Actor-specific Outlet authorization required per existing permission architecture. (IMPLEMENTATION VERIFICATION REQUIRED)
- Batch: Initial Batch identity only (no stock creation).
- Batch + Expiry: Initial Batch + Expiry identity only (no stock creation).
- Serial: LEGACY/DEFERRED — not in active 6-step UI.
- Skip: No tracking configured. Not a tracking method.

Authority: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md]], [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]].

Detailed Quantity specification: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] (Part A: SIMPLE; Part B: VARIANT)

---

## CURRENT IMPLEMENTATION SNAPSHOT

> **⚠ TO BE VERIFIED / RECONCILED IN CHUNK 3 BACKEND AUDIT**
>
> The following describes the CURRENT backend implementation reality. Do NOT treat this as the target business contract. Do NOT prematurely change processor constants, DTOs, physical storage, DB constraints, or route implementation based on this section.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/tenant-admin/products`, **`/api/v1/tenant-admin/products/draft`** (canonical wizard DRAFT create), `/api/v1/tenant-admin/products/{id}/setup`, `/api/v1/tenant-admin/products/{id}/draft`, **IMPLEMENTED** `/api/v1/tenant-admin/products/barcodes/resolve` (B4), **IMPLEMENTED** `/api/v1/tenant-admin/products/barcodes/external-lookup` (B7; no tenant duplicate checking), **IMPLEMENTED** `/api/v1/tenant-admin/products/sku-candidates/generate` (B5), `/api/v1/pos/products`, `/api/v1/storefront/products` |
| Draft API Pipeline | **CURRENT IMPLEMENTATION:** `POST /api/v1/tenant-admin/products/draft` (creation-path from Step 1; lands at `current_setup_step = 2`). **Update:** single `PUT /api/v1/tenant-admin/products/{productId}/draft` supporting polymorphic step graph payloads (`currentSetupStep=2..7` for scanner-first). **CURRENT:** Step 3 carries `initialBatchNumber`, `initialExpiryDate`, `initialSerialNumber` after Product Type is selected. **CURRENT:** Step 5 carries Product Configuration + identifier graph. `POST /api/v1/tenant-admin/products` is direct/legacy graph create — **not** wizard draft bootstrap. **Write routing:** scanner-first drafts use a centralized mapper (API step → legacy `ProductWizardStage` processor); do not globally renumber processor constants; Step 5 is SPECIAL/COMPOSITE (not `±1`). **These currentSetupStep=2..7 values, Step 3 tracking payload, and Step 5 Product Configuration payload describe CURRENT backend implementation — TARGET is 6-step; reconciliation in Chunk 3.** |
| Request format | Typed request DTOs (`SaveProductDraftRequest`); step-specific graphs passed via polymorphic payload structures. |
| Response format | Typed `ProductDraftResponse` and `ProductSetupWizardDto` with full setup projections. |
| Tenant context | Resolved server-side for tenant-owned records. |
| Bundle Candidate Search | `GET /api/v1/tenant-admin/products/{productId}/bundle-component-candidates` with standard pagination (`items[]`, `page`, `pageSize`, `totalCount`). Includes `categoryId`, `categoryName`. |
| Exact Variant Selector | `GET /api/v1/tenant-admin/products/{bundleProductId}/bundle-component-candidates/{candidateProductId}/variants?outletId={outletId}` to return only eligible active Variants. |

### Bundle Configuration DTO
The canonical Step 5 Product Configuration (BUNDLE) payload structure:
```json
{
  "currentSetupStep": 5,
  "wizardAction": "SAVE_DRAFT",
  "expectedRowVersion": 7,
  "bundleConfiguration": {
    "comboDefinitionId": null,
    "components": [
      {
        "comboComponentId": null,
        "componentProductId": "uuid",
        "componentVariantId": null,
        "componentUomId": "uuid",
        "requiredQuantity": 2.0000,
        "sortOrder": 1
      }
    ]
  }
}
```
*Note: Derived fields like `availableStock`, `supportsBundles`, `bundleAvailableQuantity`, `limitingComponent`, `trackingLabel`, `estimatedCost` MUST NOT be sent in the persisted payload.*

### Identifier (SKU / Barcode) DTO — Step 5 section
Canonical Step 5 **identifier section** payload (standalone global Barcode & SKU step superseded). Domain: [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]].
```json
{
  "currentSetupStep": 5,
  "wizardAction": "SAVE_AND_CONTINUE",
  "advanceStep": true,
  "expectedRowVersion": 10,
  "barcodeSkuConfiguration": {
    "assignments": [
      {
        "productVariantId": "guid...",
        "sku": "VAR-SKU-01",
        "barcode": "8901234567891",
        "identifierStandard": "GTIN13",
        "barcodeType": "EAN13"
      }
    ]
  }
}
```

> **CORRECTED 2026-09-12:** the earlier flat shape (`baseSku`, `parentProductBarcode`, top-level `variantIdentifiers[]`) is **obsolete**. Identifier assignments are variant-scoped inside `barcodeSkuConfiguration.assignments[]`; SIMPLE/BUNDLE use their default sellable identity. `identifierStandard` (GTIN standard) and `barcodeType` (symbology) are **separate** fields — `GTIN14` is never a `barcodeType`. See [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] TD-2 / TD-7.

### Step 1 Scan DTOs (side-effect free; status mixed)

| Endpoint | Impl status | Request | Response |
|---|---|---|---|
| `POST .../barcodes/resolve` | **IMPLEMENTED (B4)** | `barcode`, `inputMode` (`SCAN`\|`MANUAL`) | `outcome` (`VALID_LOCAL_MATCH`\|`VALID_NO_LOCAL_MATCH`\|`INVALID`), `normalizedBarcode?`, `identifierStandard?`, `barcodeType?`, `invalidReason?`, `localMatch?` (`matchedAt = PRODUCT\|VARIANT`) |
| `POST .../barcodes/external-lookup` | **IMPLEMENTED B7** | `barcode` (already valid), `identifierStandard?` | `status` (`FOUND`\|`NO_MATCH`\|`TEMPORARY_FAILURE`), `suggestion?` (normalized, provider-neutral), `sourceReference?`, `retryAllowed` — **no tenant duplicate checking**; zero providers → `NO_MATCH` |
| `POST .../sku-candidates/generate` | **IMPLEMENTED B5** | `purpose` (`NO_BARCODE_PRODUCT`), `productName?` | `candidate`, `reserved` (always `false`) |

None of these endpoints creates a product, draft, barcode, or scan-context row. Zero configured external providers → public status **`NO_MATCH`** only. Raw provider DTOs and secrets never cross into the API layer. Full contract: [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]] §17.

### Wizard draft persistence (LOCKED)

| Route | Role |
|---|---|
| `POST /api/v1/tenant-admin/products/draft` | Canonical wizard DRAFT create |
| `PUT /api/v1/tenant-admin/products/{id}/draft` | Steps 2–7 draft mutation |
| `GET /api/v1/tenant-admin/products/{id}/setup` | Resume / hydrate (**B9 IMPLEMENTED** read remap + ScanContext; **PURE READ**) |
| `POST /api/v1/tenant-admin/products/{id}/publish` | Publish |
| `POST /api/v1/tenant-admin/products` | Direct/legacy graph create — not wizard bootstrap |

### B8 create bootstrap — `scanBootstrap` (**IMPLEMENTED**)

Extend `SaveProductDraftRequest` for **CREATE only**:

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
    "externalLookupStatus": "NOT_STARTED | FOUND | NO_MATCH | TEMPORARY_FAILURE",
    "externalSourceReference": "...",
    "normalizedPrefill": { },
    "generatedSkuCandidate": "..."
  }
}
```

Rules: persist `current_setup_step = 2`; route create through BasicDetails processor via write mapper; atomic Product DRAFT + `product_setup_scan_context`; **no** final `product_barcodes`; write-boundary duplicate check when candidate exists (not B7); `normalizedPrefill` = B6 typed suggestion subset only; `creationAction` orchestration-only (no new DB column); prefer `CONTINUE_TO_BASIC_DETAILS` over `CONTINUE_NO_BARCODE`. Authority: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]].

### Write-stage vs read-stage mapping (LOCKED)

| Layer | Direction | Owner |
|---|---|---|
| Write mapper | scanner-first API step → legacy processor | B8+ draft write path (**B10** composite Step 5 identifiers via `ApplyCompositeStep5Identifiers`) |
| B9 read mapper | legacy persisted state → scanner-first setup DTO | `GET .../setup` — **IMPLEMENTED** (`ScannerFirstSetupReadMapper`) |
| B10 Step 5 identifiers | composite Product Configuration + final SKU/barcode | `PUT .../draft` public step 5 — **IMPLEMENTED**; DRAFT only; no publish |
| Steps 2–6 draft path (reality 2026-09-13) | Basic Details / Type&Tracking / Units / Config / Pricing | **BACKEND IMPLEMENTED** for Steps 2–4, 6 and Step 5 SIMPLE+VARIANT+IDs; **BUNDLE component graph PARTIAL** — [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_STEP2_TO_STEP6_BACKEND_REALITY_AUDIT_2026-09-13]] |

Do not merge. Do not use arithmetic `currentStep±1`. Legacy drafts without `product_setup_scan_context` keep legacy write numbering.

## Database Contract

| Table | Role |
|---|---|
| `products` | Stores parent product records, setup steps (`current_setup_step`), status, and row version. Fresh scanner-first drafts store **public** step semantics (`2` = Basic Details). |
| `product_variants` | Stores sellable variant details, SKU, `variant_name` (`displayLabel`), `is_sellable` (`included`), `option_combination_hash` (`char(64)`), and UOM links for VARIANT products. |
| `product_options` | Stores product option headers owned by tenant. |
| `product_option_values` | Stores product option values owned by tenant (`image_media_asset_id`). |
| `product_variant_option_values` | Maps `product_variants` to `product_option_values`. |
| `product_setup_initial_tracking` | **EXISTING** 1:1 draft store for Step 3 `initialBatchNumber` / `initialExpiryDate` / `initialSerialNumber`. Migration: `20260824095742_AddProductSetupInitialTracking`. Not Product master identity. **Not** scanner-first B1. |
| `product_setup_scan_context` | **IMPLEMENTED IN SOURCE** — 1:1 Step 1 Scan Barcode acquisition/bootstrap store. Migration `20260912085454_AddProductSetupScannerIdentifierContext`. `generated_sku_candidate` carries the stable no-barcode AUTO Product base. B8 persists it; B9 returns it without mutation; Step 5 finalizes SIMPLE/VARIANT SKUs on `product_variants.sku`. |

### Product-type-aware AUTO SKU (2026-09-14)

`POST .../sku-candidates/generate` requires selected `categoryId`; backend
resolves `categories.category_code` and atomically allocates one tenant-wide
six-digit Product sequence. SIMPLE final SKU equals the base. VARIANT final SKU
appends `product_option_values.value_code` ordered by
`product_options.sort_order`, then `product_options.option_code`. GET `/setup`
and publish never allocate. Authority:
[[../../13_DECISIONS_AND_CHANGES/PRODUCT_SKU_AUTO_GENERATION_CANONICAL_DECISION_2026-09-14]].

> [!NOTE]
> CURRENT wizard tables/columns for Steps 2–7, including **EXISTING** `product_setup_initial_tracking` (`20260824095742_AddProductSetupInitialTracking`), exist in EF Core. **Scanner-first B1 IMPLEMENTED** (source + local test DB): `product_setup_scan_context` + `product_barcodes.identifier_standard` + `barcode_type` UNKNOWN — do **not** recreate initial tracking. **Production/shared apply not claimed.** Do not add `products.batch_number`, `products.expiry_date`, or `products.serial_number`. Identity collection is Step 3 after Product Type is selected. Live DB/E2E for Initial Tracking: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/TENANT_ADMIN_PRODUCT_SETUP_INITIAL_TRACKING_PERMISSION_FIRST_IMPLEMENTATION_CLOSURE_2026-08-24]] — do not infer production acceptance from docs alone. Decision: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]]. Evidence: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_PHASE1_B1_B2_B3_IMPLEMENTATION_2026-09-12]].

## Related Specifications

**Current TARGET authorities (6-step):**
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md]] — PRIMARY contract
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Step3_Product_Type_Configuration_Specification.md]] — Step 3 TARGET
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] — Step 5 TARGET
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]] — Permission TARGET
- [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[Tenant_Admin_Product_Units_Pack_Conversion_Specification]]
- [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]
- [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]]
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]]
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]]
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]]

**Legacy / Historical (do NOT use as current target authority):**
- [[Tenant_Admin_Product_Type_Tracking_Specification.md]] — SUPERSEDED
- [[05_Tenant_Admin_Add_Product_7_Step_Contract.md]] — SUPERSEDED
- [[Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification.md]] — SUPERSEDED as active tracking authority; retained for migration reference
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md]] — SUPERSEDED; retained for migration reference
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP2_COLLECTION_DECISION_2026-09-01]] — historical decision

## Bundle Technical Contract

### Structure-Aware Navigation
The navigation logic must NOT use a generic `nextStep = currentStep + 1` for Bundles.
Use a semantic resolver such as `ResolveNextApplicableSetupStep(...)`.
```text
If productStructure = BUNDLE:
    completedSetupStep = 3
    Step 4 applicability = NOT_APPLICABLE
    targetSetupStep = 5
```
Flutter must obey `targetSetupStep = 5`. 

### Legacy Draft Normalization
For stale historical drafts containing `productStructure = BUNDLE` and old `currentSetupStep = 3` (Units) or new `currentSetupStep = 4` (Unit & Pack):
`GET setup` → detect BUNDLE + Unit & Pack step → normalize navigation target to Step 5 → never render Unit & Pack Conversion. Also apply scanner-first legacy remapping (old 1→2 … old 5→5 identifiers).

### Draft Resume
`GET /api/v1/tenant-admin/products/{productId}/setup` restores persisted fields (`comboDefinitionId`, `comboComponentId`, `componentProductId`, `componentVariantId`, `componentUomId`, `requiredQuantity`, `sortOrder`).
Display projection is derived from selected Outlet. Derived projections must not be stored as Bundle configuration truth.

### Error Contract
Canonical Bundle error codes mapping to `errorCode`, `field`, `message`, and `HTTP status`:
- `product.bundle.minimum_components_required`
- `product.bundle.component_quantity_invalid`
- `product.bundle.component_quantity_precision_invalid`
- `product.bundle.exact_variant_required`
- `product.bundle.variant_product_mismatch`
- `product.bundle.duplicate_component`
- `product.bundle.component_inactive`
- `product.bundle.component_archived`
- `product.bundle.component_not_inventory_tracked`
- `product.bundle.nested_bundle_not_allowed`
- `product.bundle.self_reference_not_allowed`
- `product.bundle.component_uom_invalid`
- `product.bundle.outlet_not_accessible`
- `product.bundle.component_no_longer_eligible`
- `product.bundle.permission_denied`
- `product.bundle.entitlement_required`
- `product.bundle.row_version_conflict` (HTTP 409)

### Audit Contract
Persisted mutations must trigger exact audit event names:
- `PRODUCT_BUNDLE_CONFIGURATION_SAVED`
- `PRODUCT_BUNDLE_COMPONENT_ADDED`
- `PRODUCT_BUNDLE_COMPONENT_UPDATED`
- `PRODUCT_BUNDLE_COMPONENT_REMOVED`
Metadata: `tenantId`, `ProductId`, `ComboDefinitionId`, `ComponentProductId`, `ComponentVariantId`, old quantity, new quantity, actor, timestamp, `rowVersion`. Unsaved drawer changes are not audited.

### NFR (Non-Functional Requirements)
- **Security**: Strict tenant isolation, server-side permissions/entitlement, Outlet authorization, no stock/cost leakage. Never trust client available stock or tracking type; server re-resolves them. Product Setup permission authority (TARGET): [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]]. Legacy/historical: [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md]] (SUPERSEDED; retained for migration reference).
- **Performance**: Server-side paginated search, debounce, request cancellation. Avoid N+1 queries; batched inventory lookups only.
- **Reliability**: Failed API does not clear local components. Failed Save does not advance.
- **Consistency**: Final POS sale must revalidate actual inventory transactionally.
- **Concurrency & Atomicity**: Product rowVersion validation (409). Bundle save atomic. POS component deduction atomic.
