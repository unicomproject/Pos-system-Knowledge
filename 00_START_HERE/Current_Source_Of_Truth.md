<!-- title: Current Source Of Truth -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->


# Current Source Of Truth

## Purpose

This file defines which project inputs control the OneVerz POS MVP Second Brain.
It prevents developers and AI assistants from mixing old POS-first scope, future
ideas, and current MVP delivery work.
Use this file before writing, implementing, reviewing, or generating any module
documentation.

## Flow 4 Tenant Onboarding Authority

Platform Admin tenant creation is governed by [[../03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]] and its linked API, database, permission, test, decision and readiness documents. Older tenant-wizard flows, state notes and prompts are historical evidence only.

The approved current-release Flow 4 collection model is **manual payment verification**. `invoiceUrl` and secure `paymentStatusUrl` are supported target concepts; manual `checkoutUrl` is null. Prepaid payment approval reaches `PENDING_ACTIVATION`, followed by separate activation and Tenant Admin invitation. Future Stripe/PayHere support uses provider adapters and signed idempotent callbacks. Authority: [[../05_BACKEND_ARCHITECTURE/FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE]]; alignment evidence: [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/FLOW_4_MANUAL_PAYMENT_SECOND_BRAIN_ALIGNMENT_2026-08-04]].

Runtime implementation evidence is recorded in [[../15_IMPLEMENTATION_TRACKING/FLOW_4_MANUAL_PAYMENT_BACKEND_IMPLEMENTATION_EVIDENCE_2026-08-04]], [[../15_IMPLEMENTATION_TRACKING/FLOW_4_MANUAL_PAYMENT_ANGULAR_IMPLEMENTATION_EVIDENCE_2026-08-04]], [[../15_IMPLEMENTATION_TRACKING/FLOW_4_CREATE_TENANT_WIZARD_IMPLEMENTATION_EVIDENCE_2026-08-04]], [[../15_IMPLEMENTATION_TRACKING/FLOW_4_RELEASE_ENVIRONMENT_AND_E2E_VALIDATION_EVIDENCE_2026-08-04]], [[../15_IMPLEMENTATION_TRACKING/FLOW_4_RETAIL_BUSINESS_CODE_MIGRATION_RESOLUTION_EVIDENCE_2026-08-05]], [[../15_IMPLEMENTATION_TRACKING/FLOW_4_LIVE_ACS_CREDENTIALED_EXTERNAL_RERUN_EVIDENCE_2026-08-05]], [[../15_IMPLEMENTATION_TRACKING/FLOW_4_LIVE_ACS_MAILBOX_AND_PLAYWRIGHT_COMPLETION_EVIDENCE_2026-08-05]], [[../15_IMPLEMENTATION_TRACKING/FLOW_4_INTERNAL_21_SCENARIO_E2E_PREFLIGHT_EVIDENCE_2026-08-05]] and [[../15_IMPLEMENTATION_TRACKING/FLOW_4_DOCKER_DEPENDENCY_AND_MERGE_READINESS_AUDIT_2026-08-06]]. Latest regression baselines: backend **1,501/1,501** before Backend `main` integration and **1,647/1,647** after; Angular **454/454**. Chunk 6A closed the **internal** 21-scenario Playwright preflight (20 canonical + E2E 14b security regression) with EmailMode SUPPRESSED — **no live ACS delivery claimed**. Docker is **optional/test-only** for normal development (merge readiness: `MERGE_READY_WITH_EXTERNAL_RELEASE_BLOCK`). Controlled mailbox, recipient allow-list and approved HTTPS payment/setup hosts remain unavailable (**BLOCKED_EXTERNAL**). Production remains **NO-GO** until live ACS/mailbox/HTTPS external closure completes. The Retail business-code migration P0 is resolved. Overall Flow 4 remains NO-GO for production release.

The 2026-08-05 documentation audit is the current traceability layer: [[../15_IMPLEMENTATION_TRACKING/FLOW_4_SECOND_BRAIN_DOCUMENT_READ_MANIFEST_2026-08-05]], [[../15_IMPLEMENTATION_TRACKING/FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]], [[../15_IMPLEMENTATION_TRACKING/FLOW_4_DOCUMENT_CONFLICT_AND_GAP_REGISTER_2026-08-05]] and [[../15_IMPLEMENTATION_TRACKING/FLOW_4_APPROVED_NEXT_IMPLEMENTATION_SCOPE_2026-08-05]]. It does not replace the canonical requirements above. It records 72 atomic requirements, five non-verified P0 requirements and a `CONDITIONAL_GO_FOR_IMPLEMENTATION` limited to the remaining approved gap-closing scope; production remains NO-GO. Migration authority is the approved [[../13_DECISIONS_AND_CHANGES/FLOW_4_RETAIL_BUSINESS_CODE_MIGRATION_DISPOSITION_2026-08-05]].

Chunk 2 security authority is the approved [[../13_DECISIONS_AND_CHANGES/FLOW_4_SECURE_TEST_HOST_TOKEN_AND_FIXTURE_CONTRACT_2026-08-05]], with threat model [[../09_SECURITY_AND_COMPLIANCE/FLOW_4_TEST_FIXTURE_TOKEN_THREAT_MODEL_2026-08-05]] and implementation contract [[../10_TESTING_QA/FLOW_4_SECURE_LIFECYCLE_FIXTURE_IMPLEMENTATION_CONTRACT_2026-08-05]]. Chunk 3 must use a separate non-HTTP test CLI/hybrid, production token/hash primitives, cumulative environment/database/credential guards, one-time process-local secret handoff and ownership-bound cleanup. No production fixture endpoint, DI registration or Swagger route is authorized. This approval does not increase the 59/64 verified P0 count; fixture runtime and security proof remain pending.

## POS Hardware Production Status (2026-08-16)

```text
POS Hardware Production Status: BLOCKED

Primary Android printer architecture:
  Android Tablet → USB-C Hub / USB ESC/POS  (software implemented; physical NOT VERIFIED)
  Android Tablet → Bluetooth Classic SPP ESC/POS (software implemented; physical NOT VERIFIED)

Optional Windows printer architecture:
  Windows POS / Windows-connected printer → E_POS.LocalPrintAgent → RAW spooler
  (source contract v3 published; installed service this machine still reports receiptContractVersion=2 —
   elevated upgrade required for canonical Windows physical sign-off)

Production blockers:
  Android USB/Bluetooth physical tablet acceptance (at least one certified transport)
  Windows LocalPrintAgent v3 install + POS80 canonical paper acceptance (when Windows path used)
  Remaining physical cash drawer scenarios beyond the accepted automatic Cash Sale path
  Barcode scanner physical acceptance

Payment Terminal: Not implemented / OUT OF CURRENT HARDWARE RELEASE
Scale: Not implemented / deferred
Customer Display: Not implemented / deferred
Kitchen Printer: Not implemented / deferred
```

Financial Cash In / Cash Drop remain **software production-accepted** and are
**not** physical hardware I/O. Do not confuse them with physical drawer pulse.

Receipt Preview and Physical Receipt are two renderers of one
`CanonicalReceiptPresentation` contract. Semantic/business parity is mandatory;
pixel parity is not required due to thermal printer limitations. Checkout print
policy remains **MANUAL** (Payment Success → Print Receipt). LocalPrintAgent
preferred receipt contract version: **3** (Flutter accepts 1/2/3 with fallback).
Chunk 2 closure attempt:
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Chunk_2_Receipt_Printer_Closure_Attempt_2026-08-16]]
(software PASS; physical gates OPEN — Chunk 2 **not** closed).

Authority:

- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Android_Direct_Printer_Integration_2026-08-16]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Receipt_Canonical_Preview_Physical_Parity_2026-08-16]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Chunk_2_Receipt_Printer_Closure_Attempt_2026-08-16]]
- [[../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../12_INTEGRATIONS/Local_Print_Agent]]
- [[../12_INTEGRATIONS/Receipt_Printer_Integration]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]

Next code sequence after this Second Brain canonicalization:

```text
Android Direct USB/Bluetooth receipt printer software
           (IMPLEMENTED 2026-08-16; physical tablet acceptance NOT VERIFIED —
            [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Android_Direct_Printer_Integration_2026-08-16]])
Chunk 1 — Local Print Agent (optional Windows path; SOFTWARE PASS; elevated ops may remain)
Chunk 2 — Receipt Printer physical acceptance (OPEN — closure attempt 2026-08-16 PARTIAL)
Chunk 3 — Physical Cash Drawer (SOFTWARE/runtime path hardened 2026-08-16;
            automatic Cash Sale physical PASS 2026-08-17 on POS80 / Cashbox #1 / drawerPin2;
            other scenarios remain open —
            [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]])
Chunk 4 — Barcode Scanner (SOFTWARE hardened 2026-08-16; PHYSICAL acceptance PENDING —
            [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Chunk_4_Barcode_Scanner_2026-08-16]])
```

Overall hardware production readiness remains **BLOCKED** until mandatory physical gates close.

Overall POS Hardware remains **BLOCKED** until physical PR/DR/SC gates pass.

## Highest Priority Decision

Cashier **Open Till** requirements are governed by
[[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/04_Open_Till_Feature]] and
[[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Open_Till_Screen_Implementation_Specification]].
Backend Open/Current-session APIs are **EXISTING / REUSE**. New API, table, DB
attribute, permission and migration are **NOT REQUIRED**. Open Till is
**online backend-authoritative** (no fake offline OPEN). Approved UI: reuse
Dashboard Top Bar, OneVerz **orange** theme (not blue/purple), white parent
surface, bold/dark important text, Phone + Tablet + Desktop. Flutter alignment
to that contract remains **PENDING**; documentation readiness does not mark
implementation Complete.

Cashier **Close Till / End Shift** requirements are governed by
[[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]] and
[[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Close_Till_Screen_Implementation_Specification]].
The existing screen, `POST /api/v1/tills/close`, `pos.till.close`, tables and
CLOSED event are reused. The financial synchronization blockers are resolved:
the backend ignores caller `ExpectedCash`, calculates Expected Cash from the
canonical persisted session activity, and atomically commits the closed session,
one `cash_reconciliations` row and one CLOSED event. Flutter no longer sends
`expectedCash`. No new table, attribute, migration or permission was required.
The combined End Shift feature remains release-blocked only on its outstanding
authenticated runtime matrix, not on financial authority or persistence.

Cashier **Cash Drawer** requirements are governed by
[[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]] and
[[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]].
Physical Open Drawer reuses `/api/v1/pos/hardware/drawer/*` and
[[../12_INTEGRATIONS/Cash_Drawer_Integration]] (`cash_drawer_operations`) — this
is **not** a financial Cash Drop.
Financial summary/movements APIs (`GET/POST /api/v1/pos/cash-drawer/...`) and
`GET /api/v1/pos/cash-movement-types` are the only approved financial routes.
No Cash Drop-specific table or `POST /cash-drop` is approved.
Canonical manual ledger is `cash_movements` + `cash_movement_types`;
`till_cash_movements` is legacy/compatibility only with **no dual-write** for
POS Cash In/Drop. Cash In (`Direction=IN`) is **production-acceptance verified**.
Cash Drop (`Direction=OUT`) is **software production-acceptance verified**
(live Flutter↔API↔PostgreSQL on Pixel Tablet; Chunk 1 concurrency closed).
Optional cash-movement slip print remains **not implemented** and is not a
finance blocker. Authority:
[[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/07_Cash_Drop_Feature]],
journey [[../03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow]], tables
[[../06_DATABASE_KNOWLEDGE/Tables/09_Hardware_Operations_Till_Session_And_Cash_Control_UPDATED]],
APIs [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]], permissions
[[../02_ACCESS_CONTROL/Permission_Code_List]], evidence
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_In_Chunk_3_Final_Production_Acceptance]],
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drop_Chunk_1_Core_Implementation_Status]]
and
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]].
Permissions reuse `cash_drawer.view`, `cash_drawer.manage`,
`cash_drawer.movement.create`, and `pos.till.close`.
Do not mark Cash Drop Complete from documentation alone.

Tenant-configurable pre-authentication POS Login Branding is governed by
[[../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/04_POS_Login_Branding_Functional_Rules]]
and [[../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/05_POS_Login_Branding_Technical_Contract]].
It reuses tenant profile, typed settings and media assets; requires no dedicated
table or physical branding columns; keeps the OneVerz primary action orange; and
does not change tenant authentication. Login branding infrastructure and the
reusable Flutter renderer are implemented. The existing Device Activation screen
must reuse that renderer with packaged OneVerz fallback before provisioning; it
must not create separate branding storage/API/UI. Activation authority is
[[../03_USER_JOURNEYS/Cashier/02_Device_Activation_Flow]]. Backend
Backend `tenant.till.manage` enforcement and USED-code rejection, including the
changed-fingerprint case, were completed and runtime-verified on 2026-08-11.
Flutter Device Activation remains pending Chunk 2 and the overall feature must
not be reported complete until that UI/runtime scope passes.

Current Release cashier Discount authority is
[[../13_DECISIONS_AND_CHANGES/POS_CASHIER_DISCOUNT_CURRENT_RELEASE_DECISION_2026-08-09]].
It requires MANUAL-only cashier UI, one active discount, Order Percentage/Fixed,
Item Percentage only, direct rejection above user authority, no manager approval,
and provisional offline capture with backend revalidation and visible conflicts.
Older generic POLICY/approval/LINE-Fixed statements are existing/deferred
capability only and do not control the current cashier flow.

Release 1 includes Cashier Customer Management at `/pos/customers`. Loyalty,
membership tiers, loyalty points, earn/redeem, rewards, and store-credit loyalty
UI are deferred and are not active Release 1 functionality. The canonical
screen contract is [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_POS_Customer_Management]].

The current scope is OneVerz POS MVP.

The MVP includes mobile and desktop EPOS, online store, click and collect,
offline operation, product and variant management, inventory management, order
management, reporting, users and permissions, and device/peripheral integration.

Older Second Brain files that say online store, click and collect, or offline
sync are excluded must be updated or treated as superseded.

## Source Priority Order

| Priority | Source | How To Use |
|---:|---|---|
| 1 | Confirmed project decisions in chat | Controls final MVP interpretation |
| 2 | Updated OneVerz POS scope images | Controls market, scope, platform, offline direction |
| 3 | Unified Commerce Database Design | Controls updated data model and table constraints |
| 4 | Existing Second Brain | Reuse only where it does not conflict |
| 5 | Backend architecture | Use for layering/security unless contradicted by new scope |
| 6 | Flutter and Angular architecture | Use after scope correction |
| 7 | UI references and journeys | Use only when aligned to MVP scope |

## Active Uploaded Scope Sources

| Source | Use |
|---|---|
| POS MARKET image | Target customers, value promise, selling strategy |
| pos scope image | MVP modules, supported platforms, hardware scope |
| offline and cach image | Cache, offline operation, backend-final validation boundary |
| Unified_Commerce_Databse_Design.docx | Updated database modules, ERDs, constraints |
| Pos-system-Knowledge.zip | Existing Second Brain to update carefully |

## Product Name Rule

Use OneVerz POS as the current MVP product/scope name.

Existing SCS-TIX EPOS references are historical or old-folder wording until the
file is updated. Do not silently mix both names in new content.

When referencing an old file, preserve the old title only if it is the actual
file name.

## Database Source Rule

The uploaded Unified Commerce database design defines 28 modules, including:

- Platform Administration.
- Tenant Foundation.
- Subscription catalog, billing, payments, and usage.
- Tenant users, roles, permissions, and outlet access.
- Outlet, till, POS device, hardware, till session, and cash control.
- Catalog, product, variant, combo, pricing, tax, discount, inventory.
- Unified Order & Sales.
- POS Operations.
- Cart & Checkout.
- Fulfilment & Pickup.
- Payment & Refund.
- Return, Inspection & Exchange.
- Notification.
- Platform-Level Integration Core.
- Offline Operation & Sync.

## Offline Source Rule

Offline operation is part of MVP, but backend remains the final source of truth
for protected business decisions.

Allowed offline/cached areas include product lookup, barcode lookup, product
grid/search, price/tax calculation, active cart save/restore, cash sale, receipt
print, park/hold sale, current till session (restore of an already
backend-confirmed OPEN session only), recent customer basic lookup,
pending inventory movement, and sync outbox.

Backend-final areas include final inventory quantity, synchronized Discount and
final sale total, card/QR payment, refund,
exchange, future/deferred loyalty or store credit, **till open**, and till final
close. Do not invent a local-only successful Open Till.

## Platform Source Rule

Business user applications now target mobile and desktop devices.

Supported business-device direction includes Android phones, iPhones, Android
tablets, iPads, Windows laptops, and Windows desktops.

Customer online store must work through major browsers.

## Scope Conflict Rule

When a file says a feature is excluded but the updated scope images include it,
the updated scope wins.

When the database contains a table for a feature but the feature is not in the
updated scope images or confirmed decisions, treat the table as reserved until
confirmed.

## No-Invention Rule

Do not invent unsupported modules, APIs, roles, permissions, integrations,
tables, screens, or flows.
## Active Backend Setup (read first)

- [[../11_DEVELOPER_ONBOARDING/Backend_Local_Development_Setup]] â€” Unified Commerce (`E_POS.Api`, port **5187**)
- [[../11_DEVELOPER_ONBOARDING/Unified_Commerce_Backend_Known_Limitations]] â€” tenant-login gap
- Latest Cashier POS documentation-vs-code comparison: [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Cashier_POS_Second_Brain_vs_Code_Comparison_Implementation_Status]]
- Parked Sales exact screen target: [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]]; documentation complete, implementation pending.

## Related Files

- [[README]]
- [[Developer_Reading_Guide]]
- [[Project_Glossary]]
- [[../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Review_Create_Specification.md]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]
- [[../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP1_DECISION_2026-08-24]]
- [[../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_PRODUCT_TAX_INCLUSIVE_EXCLUSIVE_DECISION_2026-08-27]]

## Wizard Step Rule
The Tenant Admin Add Product workflow is strictly a 7-step wizard. Step 7 is Review & Create. Legacy 8-step documentation and standalone Channel Visibility steps are obsolete.

Step 1 Basic Details may collect optional **Initial Tracking Details** (Batch Number, Expiry Date, Serial Number). Those values are provisional wizard input. Step 2 remains tracking-policy authority (`product_inventory_settings`). Actual identity persists at Step 7 Publish into `product_batches` / `serial_numbers`, not into Product master columns. Opening Stock remains responsible for quantity. Authority: [[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP1_DECISION_2026-08-24]] and [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]].

Product Setup authorization authority: [[../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]. Canonical permission namespace is `catalog.*`. Runtime Product Setup entitlement is `product_catalog`. Advanced tracking entitlement is `inventory_tracking`. Closure audit: [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-24_Tenant_Admin_Product_Setup_Permission_NFR_API_DB_Contract_Closure_Audit]].

Implementation status (2026-08-24): permission-first + Initial Tracking code is in Unified Commerce and Nytroz POS App, including `product_setup_initial_tracking` migration `20260824095742_AddProductSetupInitialTracking`. Live 7-scenario E2E, persona permission E2E, PostgreSQL integration, and 1024x768 tablet verification are not complete. Authority for remaining gaps: [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/TENANT_ADMIN_PRODUCT_SETUP_INITIAL_TRACKING_PERMISSION_FIRST_IMPLEMENTATION_CLOSURE_2026-08-24]].

## Category Management Rule

**Tenant Admin Category Management**

| Aspect | Status |
|---|---|
| Canonical contract | READY |
| Backend | **IMPLEMENTED / VERIFIED** |
| Flutter | **PENDING** |
| E2E | **PENDING** |

Category Management is a tenant-owned recursive hierarchy (max depth 5). There is no separate SubCategory entity. “Subcategory” is a UI label for a child Category.

**Department:** decoupled from Category (ADR 010, migration `20260827140000_DecoupleCategoryFromDepartment` applied). No `department_id` on Category.

**Hierarchy:** recursive Category, depth 5.

**Permissions:** `catalog.categories.view|create|update|delete|manage`

**Entitlement:** `product_catalog`

**API:**

```http
GET    /api/v1/categories
GET    /api/v1/categories/tree
GET    /api/v1/categories/{id}
POST   /api/v1/categories
PUT    /api/v1/categories/{id}
DELETE /api/v1/categories/{id}
POST   /api/v1/tenant-admin/categories/{categoryId}/image
DELETE /api/v1/tenant-admin/categories/{categoryId}/image
```

**Media:** upload/replace/remove via tenant-admin category image endpoints (not write `imageUrl` on Create/Update).

**Product Setup:** recursive effectively-ACTIVE category hierarchy via `GET /api/v1/tenant-admin/products/create-options` (backend enforces **BR-CAT-PRODUCT-SELECT-001**); persist `CategoryId` only.

**Management tree:** `GET /api/v1/categories/tree` — ACTIVE+INACTIVE, DELETED excluded, no `status` query parameter.

Journeys **TA-UJ-035 … TA-UJ-039 remain NOT COMPLETE** (Flutter pending). Do not mark full journey COMPLETE.

Authority: [[../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]], [[../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_PERMISSION_FIRST_BACKEND_IMPLEMENTATION_CLOSURE_2026-08-27]], [[../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_BACKEND_GAP_FIX_CLOSURE_2026-08-27]].
