<!-- title: Tenant Admin Product Setup Permission NFR API DB Contract Closure Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

# Tenant Admin Product Setup Permission / NFR / API / DB Contract Closure Audit

## 1. Executive Summary

This audit closed remaining Product Setup contract gaps for the complete Tenant
Admin **7-Step Add Product Wizard**, including the approved Step 1 Initial
Tracking Details lifecycle.

The Initial Tracking lifecycle was **not** redesigned. This phase is Second
Brain first. No Flutter, backend, or database production code was modified.

Final verdict:

**PRODUCT SETUP CONTRACT READY FOR PERMISSION-FIRST IMPLEMENTATION**

Namespace ambiguity is resolved in documentation. Remaining work is
implementation (policy, seed, Flutter capability model, DTO, migration), not
unresolved architecture.

## 2. Sources Inspected

### Start Here

- `00_START_HERE/README.md`
- `00_START_HERE/Current_Source_Of_Truth.md`
- `00_START_HERE/Developer_Reading_Guide.md`
- `00_START_HERE/Markdown_Writing_Rules.md`
- `00_START_HERE/Project_Glossary.md`

### Product Setup contracts

- `04_MODULE_KNOWLEDGE/10_Product_Core/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md`
- `Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification.md`
- `Tenant_Admin_Product_Type_Tracking_Specification.md`
- `Tenant_Admin_Product_Units_Pack_Conversion_Specification.md`
- `Tenant_Admin_Product_Barcode_SKU_Specification.md`
- `Tenant_Admin_Add_Product_Draft_Lifecycle_Specification.md`
- `Tenant_Admin_Add_Product_Review_Create_Specification.md`
- Product Media / Channel / Variant / Bundle / Pricing / Inventory / Category / Brand / UOM related contracts where they intersect Product Setup
- `06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
- `06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`

### Access control

- `02_ACCESS_CONTROL/Permission_Code_List.md`
- `02_ACCESS_CONTROL/API_Authorization_Rules.md`
- `02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog.md`
- `02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md`
- `02_ACCESS_CONTROL/Tenant_Effective_Permission_Resolution.md`
- `02_ACCESS_CONTROL/Access_Control_Overview.md`

### Read-only runtime evidence (not modified)

- `ProductWizardAccessPolicy.cs` — CURRENT checks `product_catalog` then `tenant.products.create/update/view`; variants.manage / barcodes.manage / some media; missing channels, combo, pricing, cost, inventory_tracking, publish subgraph recheck
- `TenantAdminProductPermissions.cs` — `tenant.products.*`
- `ProductConstants.cs` — `catalog.products.*`
- `PlatformTenantFeatureCodes.cs` — `product_catalog`, `inventory_tracking`; **no** `product_management` or `inventory_management` runtime keys
- Seed `20260809210000_SeedAllTenantsProductCatalogEntitlement` — `product_management` is **module_code**; `product_catalog` is **feature_code**
- `PricingTaxPermissions.cs` — CURRENT `tax.classes.*` / `tax.rates.*`
- Flutter `products_route_guard` / `tenant_admin_permission_aliases` — still `tenant.products.*` with bidirectional aliases

## 3. Functional Coverage

| ID | Requirement | Contract home | Status |
|---|---|---|---|
| FR-IT-001 | Optional Batch in Step 1 | Initial Tracking spec | TARGET documented |
| FR-IT-002 | Optional Expiry in Step 1 | Initial Tracking spec | TARGET documented |
| FR-IT-003 | Optional Serial in Step 1 | Initial Tracking spec | TARGET documented |
| FR-IT-004 | Draft save/resume | Initial Tracking + draft lifecycle | TARGET documented |
| FR-IT-005 | Step 2 reconciliation | Initial Tracking + Type Tracking | TARGET documented |
| FR-IT-006 | Confirmation before destructive clear | BR-TRACK-008/020 | TARGET documented |
| FR-IT-007 | SIMPLE ownership | Initial Tracking | TARGET documented |
| FR-IT-008 | VARIANT assignment | Option 2 locked | TARGET documented |
| FR-IT-009 | BUNDLE restriction | BR-TRACK-015 | TARGET documented |
| FR-IT-010 | Publish identity | Review/Create + matrix §13 | TARGET documented |
| FR-IT-011 | No quantity creation | BR-TRACK-013/016 | TARGET documented |
| FR-IT-012 | Permission enforcement | Permission matrix | TARGET documented |
| FR-IT-013 | Tenant isolation | NFR-SEC-001 | TARGET documented |
| FR-IT-014 | Optimistic concurrency | NFR-CON-001 | TARGET documented |
| FR-IT-015 | Sensitive-field redaction | BR-TRACK-019; matrix §15 | TARGET documented |

## 4. Business Rule Coverage

BR-TRACK-001 through BR-TRACK-015 preserved (not renumbered).

Added:

| ID | Rule |
|---|---|
| BR-TRACK-016 | Initial Tracking uses Product Setup auth; not stock.adjust |
| BR-TRACK-017 | Unauthorized specialized fields in a generic draft payload never persist |
| BR-TRACK-018 | Publish revalidates subgraph permissions |
| BR-TRACK-019 | Cost not returned without `catalog.product_cost.view` |
| BR-TRACK-020 | Permission denial must not silently destroy/normalize draft |

## 5. Logic Coverage

Locked behaviours (lifecycle unchanged):

- Wizard remains 7 steps
- Step 1 values are INITIAL TRACKING INPUT, not policy
- Draft store `product_setup_initial_tracking`; no Product master identity columns
- Publish may create identity-only `product_batches` / `serial_numbers`
- No Opening Stock / quantity / movements invented
- Incompatible values require confirmation
- VARIANT Option 2 assignment at Step 7
- BUNDLE parent cannot receive identity rows
- No DB CHECK forbidding provisional Batch+Expiry+Serial on the draft table

## 6. NFR Coverage

Documented in Initial Tracking spec and referenced from the 7-step contract:

| ID | Topic |
|---|---|
| NFR-SEC-001 | Tenant isolation |
| NFR-SEC-002 | Server-side authorization |
| NFR-SEC-003 | Least privilege / specialized perms |
| NFR-CON-001 | `expectedRowVersion` → 409 |
| NFR-TXN-001 | Atomic draft save and publish |
| NFR-IDEM-001 | No duplicate tracking / batch / serial rows |
| NFR-PERF-001 | No N+1; Step 2 save P95 &lt; 100ms; setup GET P95 &lt; 150ms |
| NFR-AUD-001 | Existing audit infrastructure |
| NFR-OBS-001 | Canonical error + trace ID |
| NFR-UX-001 | 1024×768 Step 1 card |
| NFR-ACC-001 | Keyboard, semantics, date picker, labeled errors |

## 7. Permission Coverage

Canonical namespace: **`catalog.*` only**.

Compatibility: effective-permission resolver MAY one-way map
`tenant.products.view|create|update|delete` → `catalog.products.*`.
Backend TARGET checks catalog codes only. No dual-OR first-class authority.

`catalog.product_tracking.manage` was **not** invented.

Full wizard matrix:
[[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].

| Wizard Area | Read | Create | Edit | Specialized | Entitlement | Denied |
|---|---|---|---|---|---|---|
| Entry / create-options | create | create | n/a | start eligibility | `product_catalog` | hide / 403 |
| Step 1 master | view/create/update | create | update | — | `product_catalog` | 403 |
| Initial Tracking | same | create | update | — | + `inventory_tracking` if non-empty | 403 entitlement |
| Images | same | create | update | `catalog.product_media.manage` | `product_catalog` | hide upload; stage 403 |
| Channels | same | create | update | `catalog.product_channels.manage` | `product_catalog` | ignore payload; preserve defaults |
| Step 2 structure / qty track | create/update | create | update | — | `product_catalog` | 403 |
| Step 2 advanced toggles | create/update | create | update | — | `inventory_tracking` | disable; 403 if enabled |
| Step 3 UOM | create/update | create | update | — | `product_catalog` | 403; no stock.adjust |
| Step 4 VARIANT | create/update | create + variants.manage | update + variants.manage | media for variant images | `product_catalog` | disable card; 403; never SIMPLE downgrade |
| Step 4 BUNDLE | create/update | create + combo.manage | update + combo.manage | stock.view / cost.view for leaks | `product_catalog` | disable card; 403 |
| Step 5 Barcode | setup | create + barcodes.manage | update + barcodes.manage | barcodes.manage | `product_catalog` | start blocked; 403 |
| Step 6 pricing/tax | redaction | create + pricing.manage | update + pricing.manage | tax lookup TARGET `pricing.tax_classes.view` | `product_catalog` | start blocked; 403 |
| Step 6 cost | redact | + cost.view | + cost.view | `catalog.product_cost.view` | `product_catalog` | hide; 403 if costPrice present |
| Step 7 publish | — | publish + subgraph | same | see matrix §13 | `product_catalog` (+ inventory_tracking if identity) | 403; draft preserved |

## 8. Entitlement Coverage

| Name | Actual runtime code | Docs alias | CURRENT backend constant | TARGET | Migration |
|---|---|---|---|---|---|
| Product Setup | `product_catalog` | Module label `product_management` | `PlatformTenantFeatureCodes.ProductCatalog` | `product_catalog` | None |
| Module grouping | `product_management` (`platform_modules.module_code`) | Historical “entitlement” wording | Not in `PlatformTenantFeatureCodes` | **Not** a runtime auth key | Do not start checking it |
| Advanced tracking | `inventory_tracking` | — | `PlatformTenantFeatureCodes.InventoryTracking` | Same; **enforce** on wizard | Wizard policy GAP |
| Inventory docs group | `inventory_management` | Feature matrix group | **Not** in Unified Commerce feature codes | Docs only | None |

One runtime name per check. Contradiction closed.

## 9. API Coverage

Primary route family unchanged. No extra Step 1 endpoint.

| Route | Permission TARGET |
|---|---|
| `GET .../create-options` | `catalog.products.create` + `product_catalog` |
| `POST .../draft` | `catalog.products.create` |
| `PUT .../{id}/draft` | create (initial draft) or update + step specialized |
| `GET .../{id}/setup` | view OR create OR update; redact cost/stock |
| `POST .../{id}/publish` | publish + subgraph recheck |
| `POST .../images/stage` | `catalog.product_media.manage` |

DTO extensions (TARGET): `initialBatchNumber`, `initialExpiryDate`,
`initialSerialNumber`, `confirmClearIncompatibleInitialTracking`,
`initialTrackingAssignedVariantId`, `expectedRowVersion`.

## 10. Attribute Coverage

Every Initial Tracking field has UI → Flutter → JSON → DTO → domain → table →
column → permission → entitlement → validation → error → audit in the Initial
Tracking Field Traceability Matrix.

Unauthorized specialized fields in a generic draft payload:

| Family | Behaviour |
|---|---|
| Channels | Ignore; preserve POS ON / Online OFF defaults or existing |
| Media IDs | Ignore; product still savable |
| `costPrice` present | 403 |
| Pricing / barcode / variant / bundle mutations | 403 |
| Non-empty Initial Tracking without `inventory_tracking` | 403 |

## 11. Table Coverage

`product_setup_initial_tracking` schema is now precise (PK `id`, tenant FK,
1:1 product FK CASCADE, audit columns, internal `row_version`, no combination
CHECK, API concurrency on `products.row_version` only).

Forbidden: `products.batch_number` / `expiry_date` / `serial_number`.

## 12. Contradictions Found

| Contradiction | Resolution |
|---|---|
| Docs `catalog.products.*` vs policy/Flutter `tenant.products.*` | catalog.* canonical; one-way map; dual-OR forbidden |
| 7-step contract entitlement `product_management` vs policy `product_catalog` | `product_catalog` is runtime; `product_management` is module_code |
| Advanced tracking: `inventory_tracking` vs `inventory_management` vs `product_catalog` | Quantity track = `product_catalog`; advanced = `inventory_tracking`; `inventory_management` docs group only |
| Tax docs `pricing.tax_classes.*` vs runtime `tax.classes.*` | TARGET pricing.*; CURRENT tax.* one-way map; `catalog.tax_classes.view` deprecated |
| Resume GET documented as view-only vs create-without-update draft PUT | Resume = view OR create OR update; initial-draft PUT = create |
| Publish listed as publish-only | Publish + subgraph recheck (BR-TRACK-018) |
| Draft table `row_version / audit — follow conventions` | Exact columns, FKs, indexes, delete, uniqueness |
| Possible new `catalog.product_tracking.manage` | Rejected without ADR |
| Possible `inventory.stock.adjust` for identity | Rejected (BR-TRACK-016) |
| Cost mutation without cost.view left as ignore OR 403 | LOCKED: 403 if `costPrice` present |

## 13. Decisions Made

1. `catalog.*` is the only Product Wizard permission authority.
2. One-way compatibility map from `tenant.products.*` until seed + Flutter switch.
3. Do not invent `catalog.product_tracking.manage`.
4. Initial Tracking = products.create/update + `inventory_tracking` when non-empty. Never stock.adjust.
5. Media requires `catalog.product_media.manage`.
6. Unauthorized channel fields are ignored (not whole-save 403).
7. VARIANT/BUNDLE require specialized manage; never silent structure downgrade.
8. Barcode and Pricing are start-eligibility mandatory.
9. Tax lookup TARGET `pricing.tax_classes.view` / `pricing.tax_rates.view`.
10. Publish rechecks every non-empty subgraph.
11. Cost: redact on read; 403 on write if present without cost.view; never fake `0`.
12. Draft table may hold all three provisional values; combination rules are application-layer until Step 2.
13. Client concurrency token is `products.row_version` only.
14. Reuse `product.permission_denied` / `auth.forbidden`; do not add `product.initial_tracking.permission_denied`.

## 14. Documents Modified

- `00_START_HERE/Current_Source_Of_Truth.md`
- `00_START_HERE/Developer_Reading_Guide.md`
- `02_ACCESS_CONTROL/Permission_Code_List.md`
- `02_ACCESS_CONTROL/API_Authorization_Rules.md`
- `02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md`
- `02_ACCESS_CONTROL/Access_Control_Overview.md`
- `02_ACCESS_CONTROL/Tenant_Effective_Permission_Resolution.md`
- `02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md` (created earlier this phase; cost lock tightened)
- `04_MODULE_KNOWLEDGE/10_Product_Core/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Type_Tracking_Specification.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Units_Pack_Conversion_Specification.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Review_Create_Specification.md`
- `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md`
- `06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
- `06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`
- `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md`
- `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md`
- `10_TESTING_QA/Test_Case/10_Product_Core/Product_Crud_Test_Cases.md`
- `13_DECISIONS_AND_CHANGES/Open_Questions.md`

## 15. Documents Created

- `02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md`
- `15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-24_Tenant_Admin_Product_Setup_Permission_NFR_API_DB_Contract_Closure_Audit.md` (this file)

(Phase 1 already created the Initial Tracking spec, decision record, and
lifecycle alignment audit. Those remain authoritative for lifecycle.)

## 16. CURRENT / TARGET / GAP

| Item | CURRENT | TARGET | GAP |
|---|---|---|---|
| Product perm namespace | Split catalog vs tenant.products | catalog.* + one-way map | Policy, Flutter guards, grant seed |
| Product Setup entitlement | `product_catalog` in policy; docs said `product_management` | `product_catalog` runtime | Docs closed |
| Advanced tracking entitlement | Not enforced on wizard toggles | `inventory_tracking` | Wizard access policy |
| Tax lookup | `tax.classes.view` / `tax.rates.view` | `pricing.tax_classes.view` / `pricing.tax_rates.view` | Map + seed |
| Channels / combo / pricing / cost on draft | Partial or missing | Enforced per matrix | Backend |
| Publish subgraph recheck | Publish permission only | Recheck subgraphs | Backend |
| Initial Tracking fields / table | Not implemented | DTO + `product_setup_initial_tracking` | All layers |
| Capability model | Incomplete aliases | Pre-start model | Flutter |
| Audit events for Initial Tracking | Generic `audit_logs`; Step 2 event exists | Named Initial Tracking events | Backend |
| PRODUCT-TRACK-002 status token | Open mapping | Existing inventory constants | Inventory implementation; not a permission blocker |

## 17. Implementation Work Remaining

1. Switch `ProductWizardAccessPolicy` / constants to `catalog.products.*` with one-way legacy map.
2. Enforce specialized permissions: channels, combo, pricing, cost, inventory_tracking, media (already partial).
3. Publish subgraph recheck.
4. Seed/map `pricing.tax_classes.view` if runtime still uses `tax.classes.view`.
5. Flutter capability model + start eligibility + VARIANT/BUNDLE disable.
6. Extend draft/setup/publish DTOs with Initial Tracking fields.
7. EF migration for `product_setup_initial_tracking`.
8. Publish identity rows without quantity.
9. Tests in `Product_Crud_Test_Cases.md` section 4.
10. Map PRODUCT-TRACK-002 inventory status tokens.

Do not implement those in this documentation phase.

## 18. Verdict

**PRODUCT SETUP CONTRACT READY FOR PERMISSION-FIRST IMPLEMENTATION**

The Second Brain can now answer, for every Product Setup field including Initial
Tracking: meaning, who can read, who can change, which entitlement, which API,
which DTO, which domain rule, which table/column, which error, which audit
event, and which NFR.

Implementation gaps remain. Contract blockers do not.
