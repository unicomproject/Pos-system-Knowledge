<!-- title: Tenant Admin Add Product 7-Step Permission Matrix -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

# Tenant Admin Add Product 7-Step Permission Matrix

## 1. Purpose

Canonical permission-first contract for the Tenant Admin **7-Step Add Product
Wizard**, including Step 1 Initial Tracking Details.

Backend authorization is authoritative. Flutter checks are UX only.

Authority for tracking lifecycle (unchanged):
[[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]].

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

### Canonical permission namespace

**TARGET:** `catalog.*` is the only Product Wizard authority.

**CURRENT GAP:** `ProductWizardAccessPolicy` checks `tenant.products.create` /
`tenant.products.update` / `tenant.products.view` via
`TenantAdminProductPermissions`, while `ProductConstants` and this Second Brain
use `catalog.products.*`. Flutter route guards still request `tenant.products.*`
and alias both ways.

### Compatibility decision (LOCKED)

| Rule | Decision |
|---|---|
| Canonical check | Backend TARGET checks **only** `catalog.products.*` |
| Dual authority | **Forbidden.** Do not `OR` catalog + tenant codes as two first-class authorities |
| Translation boundary | Effective-permission resolver MAY map legacy `tenant.products.create\|update\|view\|delete` → canonical `catalog.products.*` **one way** so old grants still satisfy the canonical check |
| Flutter | TARGET route/capability codes are `catalog.*`. Alias map is UX compatibility only |
| Expiry | Remove `tenant.products.*` Product Wizard usage after grant seed is catalog-only and Flutter guards are switched. Track as implementation GAP |
| Tests | Legacy-only grant passes during compatibility window; catalog grant passes; neither fails; resolver must not treat both as independent required checks |

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
| Step 1 master fields | view **or** create **or** update | create | update | — | `product_catalog` | 403; no silent wipe |
| Step 1 Initial Tracking | same | create | update | none new; `inventory_tracking` if non-empty | `product_catalog` + `inventory_tracking` when values present | Empty allowed; non-empty 403 entitlement; no stock.adjust |
| Step 1 images | view/create/update | create | update | `catalog.product_media.manage` | `product_catalog` | Hide/disable upload; stage API 403; product still savable without images |
| Step 1 channels | view/create/update | create | update | `catalog.product_channels.manage` | `product_catalog` | Ignore payload channel mutations; keep defaults/existing; do not 403 whole Step 1 |
| Step 2 structure + quantity track | create/update | create | update | — | `product_catalog` | 403 |
| Step 2 Batch/Expiry/Serial toggles | create/update | create | update | — | `inventory_tracking` | Disable toggles; force OFF; 403 if payload enables them |
| Step 2 confirm-clear flag | create/update | create | update | — | `product_catalog` | 403; do not silent-clear (BR-TRACK-020) |
| Step 3 UOM | create/update | create | update | UOM lookup via create-options / products.create | `product_catalog` | 403; no stock.adjust |
| Step 4 VARIANT | create/update | create + `catalog.variants.manage` | update + variants.manage | variant image also `catalog.product_media.manage` | `product_catalog` | Disable VARIANT at Step 2; Step 4 API 403; **never** auto-downgrade to SIMPLE |
| Step 4 BUNDLE | create/update | create + `catalog.combo_components.manage` | update + combo_components.manage | stock `inventory.stock.view`; cost `catalog.product_cost.view` | `product_catalog` | Disable BUNDLE at Step 2; API 403; no variants.manage required |
| Step 5 Barcode/SKU | view (setup) | create + `catalog.barcodes.manage` | update + barcodes.manage | `catalog.barcodes.manage` | `product_catalog` | Step 5 403; start blocked if missing |
| Step 6 selling prices / tax assign | setup redaction rules | create + `catalog.product_pricing.manage` | update + product_pricing.manage | tax lookup TARGET `pricing.tax_classes.view` | `product_catalog` | Step 6 403; start blocked if pricing.manage missing |
| Step 6 Cost Price | redact without cost.view | same + `catalog.product_cost.view` to see/set | same | `catalog.product_cost.view` | `product_catalog` | Hide/redact; never fake `0`; if `costPrice` is present without cost.view → 403; omitted cost preserves existing |
| Step 7 Review | view **or** create **or** update | — | — | redact cost/stock | `product_catalog` | 403 |
| Step 7 Publish | — | `catalog.products.publish` + subgraph recheck | same | see §13 | `product_catalog` (+ `inventory_tracking` if identity rows) | 403; draft preserved |

Fresh-draft `PUT .../draft` may use `catalog.products.create` without update
(CURRENT `IsInitialCreationDraft` semantics, TARGET catalog code).

## 5. Step 1 Permissions

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

Fields: `initialBatchNumber`, `initialExpiryDate`, `initialSerialNumber`.

These create **no quantity** and **no stock movement**.

| Action | Permission | Entitlement |
|---|---|---|
| Persist empty values | products.create / update | `product_catalog` |
| Persist any non-empty value | products.create / update | `product_catalog` **and** `inventory_tracking` |
| Publish identity rows | `catalog.products.publish` + subgraph recheck | `inventory_tracking` |
| Stock adjust | **Not required** | n/a |

`inventory.stock.adjust` is forbidden as a requirement here (BR-TRACK-016).
Do not invent `catalog.product_tracking.manage`.

## 7. Step 2 Permissions

Baseline: products.create / update + `product_catalog`.

Advanced toggles (Batch / Expiry / Serial) and
`confirmClearIncompatibleInitialTracking` that **clears stored identities**
require the same product mutation permission. Enabling advanced toggles also
requires `inventory_tracking`.

Missing `inventory_tracking`: UI disables advanced toggles; backend rejects
`batchTracking/expiryTracking/serialTracking = true` with
`product.entitlement_denied`. Quantity-only Track Inventory remains allowed.

## 8. Step 3 Permissions

Mutation: products.create / update. Entitlement: `product_catalog`.
UOM master lookup does **not** require `inventory.stock.adjust`.

## 9. Step 4 Variant Permissions

Fresh: `catalog.products.create` + `catalog.variants.manage`
Edit: `catalog.products.update` + `catalog.variants.manage`
Variant image mutation: additional `catalog.product_media.manage`

Missing variants.manage: VARIANT card disabled at Step 2 with explanation.
Direct Step 4 variant API → 403. **Do not** silently change structure to SIMPLE.

## 10. Step 4 Bundle Permissions

Fresh: create + `catalog.combo_components.manage`
Edit: update + `catalog.combo_components.manage`

Do **not** require `catalog.variants.manage` for Bundle Step 4.

Candidate search:

| Projection | Permission if exposed | If missing |
|---|---|---|
| Available stock | `inventory.stock.view` | Omit/null; do not leak |
| Estimated cost | `catalog.product_cost.view` | Omit/null; do not leak; never fake 0 |

## 11. Step 5 Barcode Permissions

Fresh: create + `catalog.barcodes.manage`
Edit: update + `catalog.barcodes.manage`
Resume/read of identifiers on `/setup`: view **or** create **or** update (values
are not cost-sensitive)

Direct barcode mutation without `catalog.barcodes.manage` → 403 even with
product update.

## 12. Step 6 Pricing / Tax Permissions

| Field | Read | Mutate |
|---|---|---|
| Standard Selling Price / Discount Price | pricing.manage holders; others see selling price as catalog data on setup if they can resume | `catalog.product_pricing.manage` + create/update |
| Cost Price | `catalog.product_cost.view` | `catalog.product_pricing.manage` **and** `catalog.product_cost.view` |
| Tax Name (TaxClassId) | TARGET `pricing.tax_classes.view` (CURRENT `tax.classes.view`) | `catalog.product_pricing.manage` (assignment, not tax-admin create) |
| Tax Rate display | derived; TARGET `pricing.tax_rates.view` if a dedicated rate lookup is used (CURRENT `tax.rates.view`) | read-only |
| Tax Exclusive | display locked true | not client-mutable |

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
| 1 | Product Name | `productName` | `productName` | — | `product_catalog` |
| 1 | Internal Code | `internalCode` | `productCode` / `shortName` | — | `product_catalog` |
| 1 | Category | `categoryId` | `categoryId` | — | `product_catalog` |
| 1 | Brand | `brandId` | `brandId` | — | `product_catalog` |
| 1 | Descriptions | `shortDescription` / `longDescription` | same | — | `product_catalog` |
| 1 | Images | `productImages` | `stagedMediaAssetIds` | `catalog.product_media.manage` | `product_catalog` |
| 1 | In-Store POS | `posSellable` | `posSellable` | `catalog.product_channels.manage` | `product_catalog` |
| 1 | Online Store | `allowOnlineSale` | `allowOnlineSale` | `catalog.product_channels.manage` | `product_catalog` |
| 1 | Batch Number | `initialBatchNumber` | `initialBatchNumber` | — | `inventory_tracking` if non-empty |
| 1 | Expiry Date | `initialExpiryDate` | `initialExpiryDate` | — | same |
| 1 | Serial Number | `initialSerialNumber` | `initialSerialNumber` | — | same |
| 2 | Structure | `productStructure` | `productStructure` | variants/combo as applicable at Step 4 | `product_catalog` |
| 2 | Track Inventory | `trackInventory` | `trackInventory` | — | `product_catalog` |
| 2 | Batch/Expiry/Serial | toggles | `batchTracking` etc. | — | `inventory_tracking` |
| 2 | Confirm clear | — | `confirmClearIncompatibleInitialTracking` | — | `product_catalog` |
| 3 | UOM fields | unit state | unit DTO | — | `product_catalog` |
| 4 | Variant matrix | variant state | `variantConfiguration` | `catalog.variants.manage` | `product_catalog` |
| 4 | Bundle components | bundle state | `bundleConfiguration` | `catalog.combo_components.manage` | `product_catalog` |
| 5 | SKU/Barcode | barcode state | `barcodeSkuConfiguration` | `catalog.barcodes.manage` | `product_catalog` |
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
| `/api/v1/tenant-admin/products/draft` | POST | `catalog.products.create` | `product_catalog` | Step 1 create |
| `/api/v1/tenant-admin/products/{productId}/draft` | PUT | create (initial draft) or update | `product_catalog` | Specialized per `currentSetupStep` |
| `/api/v1/tenant-admin/products/{productId}/setup` | GET | view OR create OR update | `product_catalog` | Redact cost/stock |
| `/api/v1/tenant-admin/products/{productId}/publish` | POST | `catalog.products.publish` + subgraph | `product_catalog` (+ `inventory_tracking` if identity) | |
| `/api/v1/tenant-admin/products/images/stage` | POST | `catalog.product_media.manage` | `product_catalog` | create/update **not** sufficient |
| Bundle candidate search | GET | create/update + `catalog.combo_components.manage` | `product_catalog` | stock/cost optional perms |

No additional public Step 1 endpoint.

### Step-valid properties

| Property | Valid on step | Ignored/rejected otherwise |
|---|---|---|
| `initialBatchNumber` / `initialExpiryDate` / `initialSerialNumber` | 1 (also returned always on GET setup) | Persist from Step 1 payload; later steps must not require resubmit |
| `confirmClearIncompatibleInitialTracking` | 2 | 400 if required and false |
| `productStructure` + tracking booleans | 2 | |
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

| Structure | Extra to select at Step 2 |
|---|---|
| SIMPLE | none |
| VARIANT | `canManageVariants` else disable card |
| BUNDLE | `canManageBundleComponents` else disable card |

Do not let the user select a structure they cannot complete.

## 18. Backend Enforcement

CURRENT: `ProductWizardAccessPolicy` checks `product_catalog`, then
`tenant.products.create/update`, plus variants.manage / barcodes.manage / media
on some steps. **Missing:** channels, combo, pricing, cost, inventory_tracking,
publish subgraph recheck, catalog.* canonical codes.

TARGET: one policy evaluates canonical catalog.* + step specialized perms +
entitlements listed in this file. Repository never decides authorization.

## 19. Revocation Behaviour

If permission or entitlement is lost between Step 1 and Step 7:

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
- Barcode denied without Barcodes Manage
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
| Product perm namespace | Split catalog vs tenant.products in policy/Flutter | catalog.* only + one-way alias | Policy + Flutter guards + grant seed |
| Product Setup entitlement | `product_catalog` | `product_catalog` | Docs said `product_management` |
| Advanced tracking entitlement | Not enforced on wizard toggles | `inventory_tracking` | Wizard policy |
| Channels / combo / pricing on draft | Partial or missing in access policy | Enforced per this matrix | Backend |
| Publish subgraph recheck | Publish permission only (docs) | Recheck subgraphs | Backend |
| Tax lookup | `tax.classes.view` runtime | `pricing.tax_classes.view` | Map + seed |
| Initial Tracking auth | Not implemented | Product Setup + inventory_tracking | All layers |
| Capability model | Incomplete route aliases | Pre-start model | Flutter |

## Related Files

- [[Permission_Code_List]]
- [[API_Authorization_Rules]]
- [[Feature_Entitlement_Matrix]]
- [[Tenant_Effective_Permission_Resolution]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]
- [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-24_Tenant_Admin_Product_Setup_Permission_NFR_API_DB_Contract_Closure_Audit]]
