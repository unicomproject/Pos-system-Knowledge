<!-- title: Tenant Admin Add Product 7-Step Permission Matrix -->
<!-- status: SUPERSEDED (2026-09-20) -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-11 -->
<!-- superseded_by: Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md -->

# ⚠️ SUPERSEDED — DO NOT USE

**SUPERSEDED 2026-09-20**

This document describes the previous 7-step Product Setup permission model.

**CURRENT AUTHORITY:** `Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md`

Do not use this document for new Backend or Flutter implementation. This is retained for historical traceability only.

---

# Tenant Admin Add Product 7-Step Permission Matrix (HISTORICAL)

## 1. Purpose

Canonical permission-first contract for the Tenant Admin **7-Step Add Product
Wizard** (scanner-first), including Step 3 Initial Tracking Details (after Product Type is selected)
and Step 1 Scan Barcode resolve/external-lookup under create.

Backend authorization is authoritative. Flutter checks are UX only.

Authority for tracking lifecycle:
[[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]].

Scanner-first decision:
[[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]].
Scan: [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]].
Identifiers: [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]].

## 2. Authorization Principles

Every protected Product Setup mutation must independently validate:

1. Authenticated user
2. Valid tenant context from token (never client `tenantId`)
3. Active tenant and allowed user lifecycle
4. Tenant feature entitlement
5. Active permission definition (`is_active = true`)
6. Active role assignment
7. Non-revoked permission grant
8. Tenant ownership
9. Resource ownership (Product belongs to tenant)
10. Operation-specific specialized permission

Hidden buttons, disabled controls, route guards, client state, and stepper
navigation are **not** security boundaries.

### Canonical permission namespace — authority **CLOSED** (2026-09-12)

Three permission vocabularies exist in active documentation. This is a **naming/rollout**
question, **not** an unresolved platform decision, and it is now closed.

| Vocabulary | Example | Role |
|---|---|---|
| Legacy tenant-scoped | `tenant.products.create` | Seeded legacy grant. **Not** the Product Setup decision code |
| **Canonical R1 enforced** | **`catalog.products.create`**, `catalog.barcodes.manage` | **Authoritative decision code for Product Setup** |
| 4-tier taxonomy form | `catalog.products.master.create`, `catalog.barcodes.sku.manage` | Taxonomy/alias reference only |

**Resolution basis:** [[CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1]] is the declared
authoritative, CLOSED capability registry and lists the 3-tier `catalog.products.*` /
`catalog.barcodes.manage` rows as **R1_ACTIVE**. [[Permission_Code_List]] explicitly
defers to that catalog on conflict ("the Canonical Scope and Catalog win") and designates
its own legacy/alias tiers as migration reference only.
[[Tenant_Effective_Permission_Resolution]] already locks one-way aliasing with no dual
first-class authority.

### ONE implementation rule (LOCKED — no further decision required)

| Rule | Decision |
|---|---|
| Decision code | Every Product Setup gate evaluates exactly **one** canonical `catalog.*` R1_ACTIVE code |
| Dual authority | **Forbidden.** Never `OR` two vocabularies as two independent first-class authorities on one decision |
| Translation boundary | The effective-permission resolver MAY map **one way only**: legacy `tenant.products.view\|create\|update\|delete` **and** 4-tier `catalog.*.master.*` / `catalog.barcodes.sku.manage` → the canonical code, so historical grants still satisfy it |
| Reverse mapping | **Forbidden.** A `catalog.*` grant is never translated back into a `tenant.products.*` authority |
| Entitlement | `product_catalog` (plus `inventory_tracking` for advanced tracking/identity) |
| Flutter | Codes are `catalog.*`; alias maps are UX compatibility only and are never a security boundary |
| Step 1 Scan | Adds **no new permission**: `catalog.products.create` + `product_catalog` |
| Expiry | Remove `tenant.products.*` Product Wizard usage after grant seed is catalog-only and Flutter guards are switched |
| Tests | Legacy-only grant passes during the compatibility window; catalog grant passes; a user with neither is denied; the resolver must not treat both as independent required checks |

**Residual item is IMPLEMENTATION, not decision.** `ProductWizardAccessPolicy` (backend),
Flutter route guards, and the grant seed still use `tenant.products.*` via
`TenantAdminProductPermissions`. Closing that is code + seed work against the rule above,
and requires **no** further platform permission-authority decision.

Decision: [[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] TD-9.

### Authorization response rules

| Case | Status | Body rule |
|---|---|---|
| Missing/invalid JWT | **401** | No resource hint |
| Authenticated, missing canonical permission | **403** | Generic denial; never reveal whether a barcode/product exists |
| Missing `product_catalog` entitlement | **403** | Entitlement-specific code; do not disguise as 404 |
| Resource outside caller's tenant | **404** | Cross-tenant existence must never be disclosed as 403 |
| Identifier/SKU/barcode conflict | **409** | Safe conflict projection, tenant-scoped only |
| Unparseable / structurally invalid payload | **422** | Field-level messages, no internals |

Business outcomes (`INVALID` identifier, external `NO_MATCH`, `TEMPORARY_FAILURE`) are
**200** responses, never HTTP errors.

No new `catalog.product_tracking.manage` permission. Initial Tracking is Product
Setup identity, not Stock Adjustment.

## 3. Entitlements

| Name | Runtime `feature_code` | Role | CURRENT | TARGET |
|---|---|---|---|---|
| Product Setup | `product_catalog` | Required to start/save/publish the wizard | `ProductWizardAccessPolicy` evaluates `PlatformTenantFeatureCodes.ProductCatalog` | Same |
| Module label | `product_management` | Documentation / historical seed alias | Seed migration mapped `product_management` → `product_catalog` | **Not** a runtime authorization key |
| Advanced inventory tracking | `inventory_tracking` | Required to enable Batch/Expiry/Serial **policy** and to persist non-empty Initial Tracking / publish identity rows | Feature exists in commercial catalog; wizard does **not** currently gate toggles | Gate advanced tracking + identity |
| Inventory module (docs) | `inventory_management` | Feature_Entitlement_Matrix group name for stock ops | Docs alias | **Not** the Product Setup runtime check |

Quantity Track Inventory ON/OFF remains `product_catalog`.
`inventory.stock.adjust` is **never** required for Initial Tracking.

Denied entitlement → `403` `product.entitlement_denied`. Draft is not destroyed.

## 4. Full Wizard Permission Matrix

| Wizard Area | Read | Create (fresh draft) | Edit (published / list edit) | Specialized Permission | Entitlement | Denied Behaviour |
|---|---|---|---|---|---|---|
| Add Product entry / create-options | `catalog.products.create` | `catalog.products.create` | n/a | See start eligibility | `product_catalog` | Hide Add Product; API 403 |
| Step 1 Scan — resolve / external-lookup | create (safe duplicate projection) | `catalog.products.create` | n/a for fresh | none new for resolve/external | `product_catalog` | 403; do not call POS by-barcode |
| Step 1 Scan — view/edit existing product path | view / update | — | update | — | `product_catalog` | 403 |
| Step 2 master fields | view **or** create **or** update | create | update | — | `product_catalog` | 403; no silent wipe |
| Step 2 images | view/create/update | create | update | `catalog.product_media.manage` | `product_catalog` | Hide/disable upload; stage API 403; product still savable without images |
| Step 2 channels | view/create/update | create | update | `catalog.product_channels.manage` | `product_catalog` | Ignore payload channel mutations; keep defaults/existing; do not 403 whole Step 2 |
| Step 3 structure + quantity track | create/update | create | update | — | `product_catalog` | 403 |
| Step 3 Initial Tracking | same | create | update | none new; `inventory_tracking` if non-empty | `product_catalog` + `inventory_tracking` when values present | Empty allowed; non-empty 403 entitlement; no stock.adjust |
| Step 3 Batch/Expiry/Serial toggles | create/update | create | update | — | `inventory_tracking` | Disable toggles; force OFF; 403 if payload enables them |
| Step 3 confirm-clear flag | create/update | create | update | — | `product_catalog` | 403; do not silent-clear (BR-TRACK-020) |
| Step 4 UOM | create/update | create | update | UOM lookup via create-options / products.create | `product_catalog` | 403; no stock.adjust |
| Step 5 VARIANT matrix | create/update | create + `catalog.variants.manage` | update + variants.manage | variant image also `catalog.product_media.manage` | `product_catalog` | Disable VARIANT at Step 3; Step 5 API 403; **never** auto-downgrade to SIMPLE |
| Step 5 BUNDLE | create/update | create + `catalog.combo_components.manage` | update + combo_components.manage | stock `inventory.stock.view`; cost `catalog.product_cost.view` | `product_catalog` | Disable BUNDLE at Step 3; API 403; no variants.manage required |
| Step 5 identifiers (SKU/Barcode) | view (setup) | create + `catalog.barcodes.manage` | update + barcodes.manage | `catalog.barcodes.manage` | `product_catalog` | Identifier mutation 403; start blocked if missing |
| Step 6 selling prices / tax assign | setup redaction rules | create + `catalog.product_pricing.manage` | update + product_pricing.manage | tax lookup TARGET `pricing.tax_classes.view` | `product_catalog` | Step 6 403; start blocked if pricing.manage missing |
| Step 6 Cost Price | redact without cost.view | same + `catalog.product_cost.view` to see/set | same | `catalog.product_cost.view` | `product_catalog` | Hide/redact; never fake `0`; if `costPrice` is present without cost.view → 403; omitted cost preserves existing |
| Step 7 Review | view **or** create **or** update | — | — | redact cost/stock | `product_catalog` | 403 |
| Step 7 Publish | — | `catalog.products.publish` + subgraph recheck | same | see §13 | `product_catalog` (+ `inventory_tracking` if identity rows) | 403; draft preserved |

Fresh-draft `PUT .../draft` may use `catalog.products.create` without update
(CURRENT `IsInitialCreationDraft` semantics, TARGET catalog code).

## 5. Step 1 Scan Barcode Permissions

Resolve + external-lookup ride under **`catalog.products.create`** + `product_catalog`.
No new product permission for external lookup. Safe duplicate projection under create.
View/Edit existing require view/update. Do **not** use POS `by-barcode`.

Final sellable identifier mutation remains **`catalog.barcodes.manage`** on Step 5 identifiers.

## 5A. Step 2 Basic Details Permissions

Master fields: Product Name, Internal Code, Category, Brand, Short/Long
Description.

| Mode | Permission |
|---|---|
| Fresh Add Product | `catalog.products.create` |
| Existing draft owned as initial wizard draft | `catalog.products.create` |
| List Edit / published product | `catalog.products.update` |
| Resume GET `/setup` | `catalog.products.view` **OR** create **OR** update |

Lookups in create-options ride on `catalog.products.create`. Category/Brand
**management** (`catalog.categories.*` / `catalog.brands.*`) is not required to
select an existing active Category/Brand.

## 6. Initial Tracking Permissions

Fields: `initialBatchNumber`, `initialExpiryDate`, `initialSerialNumber`
(collected on Step 3 after Product Type is selected; not on Step 1 Scan or Step 2 Basic Details).

These create **no quantity** and **no stock movement**.

| Action | Permission | Entitlement |
|---|---|---|
| Persist empty values | products.create / update | `product_catalog` |
| Persist any non-empty value | products.create / update | `product_catalog` **and** `inventory_tracking` |
| Publish identity rows | `catalog.products.publish` + subgraph recheck | `inventory_tracking` |
| Stock adjust | **Not required** | n/a |

`inventory.stock.adjust` is forbidden as a requirement here (BR-TRACK-016).
Do not invent `catalog.product_tracking.manage`.

## 7. Step 3 Permissions (Product Type & Tracking)

Baseline: products.create / update + `product_catalog`.

Advanced toggles (Batch / Expiry / Serial) and
`confirmClearIncompatibleInitialTracking` that **clears stored identities**
require the same product mutation permission. Enabling advanced toggles also
requires `inventory_tracking`.

Missing `inventory_tracking`: UI disables advanced toggles; backend rejects
`batchTracking/expiryTracking/serialTracking = true` with
`product.entitlement_denied`. Quantity-only Track Inventory remains allowed.

## 8. Step 4 Permissions (Unit & Pack)

Mutation: products.create / update. Entitlement: `product_catalog`.
UOM master lookup does **not** require `inventory.stock.adjust`.

## 9. Step 5 Variant Permissions

Fresh: `catalog.products.create` + `catalog.variants.manage`
Edit: `catalog.products.update` + `catalog.variants.manage`
Variant image mutation: additional `catalog.product_media.manage`

Missing variants.manage: VARIANT card disabled at Step 3 with explanation.
Direct Step 5 variant API → 403. **Do not** silently change structure to SIMPLE.

## 10. Step 5 Bundle Permissions

Fresh: create + `catalog.combo_components.manage`
Edit: update + `catalog.combo_components.manage`

Do **not** require `catalog.variants.manage` for Bundle Step 5.

Candidate search:

| Projection | Permission if exposed | If missing |
|---|---|---|
| Available stock | `inventory.stock.view` | Omit/null; do not leak |
| Estimated cost | `catalog.product_cost.view` | Omit/null; do not leak; never fake 0 |

## 11. Step 5 Identifier (SKU/Barcode) Permissions

Fresh: create + `catalog.barcodes.manage`
Edit: update + `catalog.barcodes.manage`
Resume/read of identifiers on `/setup`: view **or** create **or** update (values
are not cost-sensitive)

Direct barcode mutation without `catalog.barcodes.manage` → 403 even with
product update. Step 1 resolve does **not** replace this for final assignment.

## 12. Step 6 Pricing / Tax Permissions

| Field | Read | Mutate |
|---|---|---|
| Standard Selling Price / Discount Price (SIMPLE path) | pricing.manage holders; others see selling price as catalog data on setup if they can resume | `catalog.product_pricing.manage` + create/update |
| Per-variant Selling Price (VARIANT path) | same | `catalog.product_pricing.manage` + create/update; each `productVariantId` must belong to the product + tenant |
| Set Same Price for All Variants / Apply to All | UI helper only | Same as selling-price manage; does **not** create a parent authoritative sale price |
| Cost Price | `catalog.product_cost.view` | `catalog.product_pricing.manage` **and** `catalog.product_cost.view` |
| Tax Name (TaxSetupId / TaxClassId) | TARGET `pricing.tax_classes.view` (CURRENT `tax.classes.view`) | `catalog.product_pricing.manage` (assignment, not tax-admin create) |
| Tax Rate display | derived from Tax Setup current effective rate; TARGET `pricing.tax_rates.view` if dedicated rate lookup used (CURRENT `tax.rates.view`) | read-only |
| TaxPriceMode Inclusive/Exclusive | product-owned | `catalog.product_pricing.manage` |

Tax Management admin surfaces (list/create/schedule/status) use `pricing.tax_classes.*` / `pricing.tax_rates.schedule.manage` per [[../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]. Do **not** invent `catalog.tax.*`.

Backend must reject pricing of another tenant’s product/variant/tax class, stale/deleted variant IDs, and variants belonging to another product. Frontend filtering is UX only.

**Tax namespace (LOCKED):**

| Code | Status |
|---|---|
| `pricing.tax_classes.view` / `pricing.tax_rates.view` | TARGET canonical Product Setup lookup |
| `tax.classes.*` / `tax.rates.*` | CURRENT runtime (`PricingTaxPermissions`) — compatibility map → pricing.* |
| `catalog.tax_classes.view` | Deprecated; not Product Setup authority |

Product Create/Update is required in addition to `catalog.product_pricing.manage`.

Without cost.view: Cost field hidden/redacted; JSON omits or nulls `costPrice`;
Flutter must not render `0` as authentic cost (BR-TRACK-019).

**LOCKED cost mutation:** if the request body includes `costPrice` (non-null)
without `catalog.product_cost.view`, return **403** `product.permission_denied`.
If `costPrice` is omitted, preserve the existing stored cost. Never persist an
unauthorized cost value.

## 13. Step 7 Publish Permissions

Required: `catalog.products.publish` + `product_catalog`.

**Publish rechecks specialized permissions for every non-empty subgraph it will
materialize** (BR-TRACK-018). Prevents User A writing a privileged draft and
User B activating it with only Publish.

| Draft subgraph present | Recheck |
|---|---|
| Linked media | `catalog.product_media.manage` |
| Channel flags differ from tenant-safe defaults **and** are being published | `catalog.product_channels.manage` (if missing, publish defaults: POS ON, Online OFF) |
| VARIANT matrix | `catalog.variants.manage` |
| Bundle components | `catalog.combo_components.manage` |
| Barcode/SKU assignments | `catalog.barcodes.manage` |
| Selling price / tax assignment | `catalog.product_pricing.manage` |
| Cost persisted | `catalog.product_cost.view` (if cost is non-null) |
| Initial Batch/Serial identity to persist | `inventory_tracking` entitlement; **not** `inventory.stock.adjust` |

Failure → `403`; draft unchanged (BR-TRACK-020).

## 14. Field-Level Permissions

See compact traceability in the Initial Tracking spec for IT fields. Wizard-wide
rule: unauthorized specialized properties in a generic `PUT /draft` body must
be **ignored or rejected per field**, never persisted (BR-TRACK-017).

| Step | UI Field | Flutter State | API JSON | Specialized | Entitlement |
|---|---|---|---|---|---|
| 1 | Scan resolve / external | scan candidate | resolve/external DTOs | create (+ view/update existing) | `product_catalog` |
| 2 | Product Name | `productName` | `productName` | — | `product_catalog` |
| 2 | Internal Code | `internalCode` | `productCode` / `shortName` | — | `product_catalog` |
| 2 | Category | `categoryId` | `categoryId` | — | `product_catalog` |
| 2 | Brand | `brandId` | `brandId` | — | `product_catalog` |
| 2 | Descriptions | `shortDescription` / `longDescription` | same | — | `product_catalog` |
| 2 | Images | `productImages` | `stagedMediaAssetIds` | `catalog.product_media.manage` | `product_catalog` |
| 2 | In-Store POS | `posSellable` | `posSellable` | `catalog.product_channels.manage` | `product_catalog` |
| 2 | Online Store | `allowOnlineSale` | `allowOnlineSale` | `catalog.product_channels.manage` | `product_catalog` |
| 3 | Batch Number | `initialBatchNumber` | `initialBatchNumber` | — | `inventory_tracking` if non-empty |
| 3 | Expiry Date | `initialExpiryDate` | `initialExpiryDate` | — | same |
| 3 | Serial Number | `initialSerialNumber` | `initialSerialNumber` | — | same |
| 3 | Structure | `productStructure` | `productStructure` | variants/combo as applicable at Step 5 | `product_catalog` |
| 3 | Track Inventory | `trackInventory` | `trackInventory` | — | `product_catalog` |
| 3 | Batch/Expiry/Serial | toggles | `batchTracking` etc. | — | `inventory_tracking` |
| 3 | Confirm clear | — | `confirmClearIncompatibleInitialTracking` | — | `product_catalog` |
| 4 | UOM fields | unit state | unit DTO | — | `product_catalog` |
| 5 | Variant matrix | variant state | `variantConfiguration` | `catalog.variants.manage` | `product_catalog` |
| 5 | Bundle components | bundle state | `bundleConfiguration` | `catalog.combo_components.manage` | `product_catalog` |
| 5 | SKU/Barcode identifiers | barcode state | identifier configuration | `catalog.barcodes.manage` | `product_catalog` |
| 6 | Prices | pricing state | `pricingTax` | `catalog.product_pricing.manage` | `product_catalog` |
| 6 | Cost | `costPrice` | `pricingTax.costPrice` | `catalog.product_cost.view` | `product_catalog` |
| 7 | Assign variant | `initialTrackingAssignedVariantId` | same | variants.manage (VARIANT) | `inventory_tracking` if identity remains |
| * | Concurrency | `rowVersion` | `expectedRowVersion` | — | — |
| * | Step | `currentStep` | `currentSetupStep` | — | — |

## 15. Read Redaction Rules

| Data | Without permission | Flutter |
|---|---|---|
| Cost | omit/null; never `0` as sentinel | hidden / “restricted” |
| Bundle candidate stock | omit | no quantity |
| Bundle candidate cost | omit | no cost |
| Initial tracking values | visible to users who can resume the draft (not cost-class) | show |
| Tax class list | empty lookup | Tax dropdown disabled |

## 16. API Permission Matrix

| Endpoint | Method | Permission | Entitlement | Notes |
|---|---|---|---|---|
| `/api/v1/tenant-admin/products/create-options` | GET | `catalog.products.create` | `product_catalog` | Capability flags TARGET |
| `/api/v1/tenant-admin/products/barcodes/resolve` | POST | `catalog.products.create` | `product_catalog` | **IMPLEMENTED B4** — Step 1 tenant catalogue resolve |
| `/api/v1/tenant-admin/products/barcodes/external-lookup` | POST | `catalog.products.create` | `product_catalog` | **IMPLEMENTED B7** Step 1 external lookup (no tenant duplicate checking) |
| `/api/v1/tenant-admin/products/sku-candidates/generate` | POST | `catalog.products.create` | `product_catalog` | **IMPLEMENTED B5** Step 1 pre-draft SKU candidate (`reserved: false`) |
| `/api/v1/tenant-admin/products/draft` | POST | `catalog.products.create` | `product_catalog` | **Canonical** wizard DRAFT create (after Step 1 creation-path; lands at step 2) |
| `/api/v1/tenant-admin/products` | POST | `catalog.products.create` | `product_catalog` | Direct/legacy graph create — **not** wizard draft bootstrap |
| `/api/v1/tenant-admin/products/{productId}/draft` | PUT | create (initial draft) or update | `product_catalog` | Specialized per `currentSetupStep` |
| `/api/v1/tenant-admin/products/{productId}/setup` | GET | view OR create OR update | `product_catalog` | Redact cost/stock |
| `/api/v1/tenant-admin/products/{productId}/publish` | POST | `catalog.products.publish` + subgraph | `product_catalog` (+ `inventory_tracking` if identity) | |
| `/api/v1/tenant-admin/products/images/stage` | POST | `catalog.product_media.manage` | `product_catalog` | create/update **not** sufficient |
| Bundle candidate search | GET | create/update + `catalog.combo_components.manage` | `product_catalog` | stock/cost optional perms |

No additional public Step 2 Basic Details-only endpoint (resolve = B4 **IMPLEMENTED**; external-lookup = B7 **IMPLEMENTED**; sku-candidates = B5 **IMPLEMENTED**).

### Step-valid properties

| Property | Valid on step | Ignored/rejected otherwise |
|---|---|---|
| `initialBatchNumber` / `initialExpiryDate` / `initialSerialNumber` | 3 (also returned always on GET setup) | Persist from Step 3 payload; later steps must not require resubmit |
| `confirmClearIncompatibleInitialTracking` | 3 | 400 if required and false |
| `productStructure` + tracking booleans | 3 | |
| `initialTrackingAssignedVariantId` | 7 / publish | VARIANT only |
| `expectedRowVersion` | all writes | 409 if stale |
| `currentSetupStep` | all writes | must match processor |

## 17. Flutter Capability Matrix

UX-only model derived from the authenticated permission catalog **before** Add
Product starts:

```text
canCreateProduct
canUpdateProduct
canPublishProduct
canManageProductMedia
canManageProductChannels
canManageVariants
canManageBundleComponents
canManageBarcodes
canManagePricing
canViewProductCost
canLookupTaxClasses
canViewStock
canUseAdvancedInventoryTracking
```

### Start eligibility (LOCKED)

Add Product may start only if:

- `canCreateProduct`
- `canManageBarcodes` (Step 5 mandatory)
- `canManagePricing` (Step 6 mandatory)
- `canLookupTaxClasses` (Step 6 Tax Name required)

Missing any of the above: do not open the wizard; show missing-capability list.

Optional at start: media, channels, variants, bundle, cost.view, advanced tracking.

| Structure | Extra to select at Step 3 |
|---|---|
| SIMPLE | none |
| VARIANT | `canManageVariants` else disable card |
| BUNDLE | `canManageBundleComponents` else disable card |

Do not let the user select a structure they cannot complete.

## 18. Backend Enforcement

**B2 foundation IMPLEMENTED (2026-09-12):** `ProductWizardAccessPolicy` evaluates
canonical `catalog.*` (e.g. `catalog.products.create` / update / view) plus runtime
entitlement `product_catalog`, with **one-way** legacy alias acceptance of
`tenant.products.*` / 4-tier forms. Helpers: `ValidateProductSetupCreateAccessAsync`,
`ValidateBarcodeManageAccessAsync`. Repository never decides authorization.

**Still tracked separately (not a B2 reopen):** specialized later-step gates and
publish subgraph recheck completeness where pending (channels/combo/pricing/cost/
inventory_tracking on some paths — see CURRENT/TARGET gap table below).

TARGET end-state: one policy evaluates canonical catalog.* + all step specialized
perms + entitlements listed in this file for every wizard mutation.

## 19. Revocation Behaviour

If permission or entitlement is lost between Step 1 Scan and Step 7:

- Next mutation/publish returns 403
- Draft is **not** deleted or silently normalized (BR-TRACK-020)
- Flutter capability model refreshes from session/catalog
- User may Save Draft of still-allowed fields or leave

Inactive permission definition or revoked grant → denied immediately.

## 20. Tests

Backend and Flutter must cover:

- Create denied without Product Create
- Resume denied without view/create/update
- Edit denied without Product Update (except initial-draft create path)
- Publish denied without Product Publish
- Initial Tracking non-empty denied without `inventory_tracking`
- Initial Tracking never requires `inventory.stock.adjust`
- Image mutation denied without Media Manage
- Channel mutation ignored without Channel Manage (defaults preserved)
- VARIANT denied without Variants Manage; no silent SIMPLE downgrade
- BUNDLE denied without Combo Components Manage
- Identifier mutation denied without Barcodes Manage; Step 1 resolve under create
- Pricing mutation denied without Pricing Manage
- Cost redacted without Cost View; no fake zero
- Tax lookup denied without canonical tax view (compatibility window: `tax.classes.view`)
- Crafted payload cannot persist specialized fields
- Publish cannot bypass specialized subgraph permissions
- Revoked / inactive definition denied
- Tenant isolation; cross-tenant variant assignment 404/403
- Permissions lost mid-wizard: 403, draft intact
- Legacy `tenant.products.*` grant maps during compatibility window only

## 21. CURRENT / TARGET / GAP

| Item | CURRENT | TARGET | GAP |
|---|---|---|---|
| Product perm namespace (Backend B2) | **IMPLEMENTED** — `catalog.*` + `product_catalog` + one-way aliases in `ProductWizardAccessPolicy` | Same | Flutter guards / grant seed may still show legacy codes for UX compatibility |
| Product Setup entitlement | `product_catalog` | `product_catalog` | None for B2 foundation |
| Advanced tracking entitlement | Not enforced on wizard toggles | `inventory_tracking` | Wizard policy (later-step; not B2 reopen) |
| Channels / combo / pricing on draft | Partial or missing in access policy | Enforced per this matrix | Backend specialized gates (later-step) |
| Publish subgraph recheck | Publish permission only (docs) | Recheck subgraphs | Backend |
| Tax lookup | `tax.classes.view` runtime | `pricing.tax_classes.view` | Map + seed |
| Initial Tracking auth | Not implemented | Product Setup + inventory_tracking | All layers |
| Capability model | Incomplete route aliases | Pre-start model | Flutter |
| Step 1 resolve API | **IMPLEMENTED B4** | — | — |
| Step 1 external-lookup / sku-candidates | **IMPLEMENTED** (B7 / B5) | Implemented APIs | B5–B7 |

## Related Files

- [[Permission_Code_List]]
- [[API_Authorization_Rules]]
- [[Feature_Entitlement_Matrix]]
- [[Tenant_Effective_Permission_Resolution]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]
- [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-24_Tenant_Admin_Product_Setup_Permission_NFR_API_DB_Contract_Closure_Audit]]
