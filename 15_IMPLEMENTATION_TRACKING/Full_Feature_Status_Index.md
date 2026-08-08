<!-- title: Full Feature Status Index -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-07 -->

> Park / Recall Sale update (2026-08-06): Flutter Chunk 2 data integration is code complete with typed backend create/list/recall/cancel, stable idempotency, canonical permissions, safe cart rules, and 791 passing Flutter tests. Authenticated Flutter-backend verification and final UI/E2E acceptance remain pending; the full feature is not Completed.

> Park / Recall Sale Chunk 3 update (2026-08-06): the approved compact Park Sale modal is code complete, responsive widget evidence passes, and the full Flutter suite has 798 passing tests. Authenticated Park Sale UI verification and Chunk 4 Parked Sales/Recall/Cancel UI remain pending; the full feature is not Completed.

> Park / Recall Sale Chunk 4 update (2026-08-06): final Parked Sales, Recall, active-cart safety and Cancel UI code is complete; 805 Flutter tests pass and analysis is clean. Local API/emulator are available, but no approved authenticated Cashier session was available, so E2E, read-only DB and screenshot acceptance remain blocked. Full feature status is Runtime Verification Pending, not Completed.

> Park / Recall product-contract update (2026-08-06): Second Brain recorded Decisions A–D (Park/Recall visibility, product-name summary, mandatory Cancel Reason target, current-till list scope). Documentation-only; does not mark the feature Completed. Flutter Decision A/B evidence, backend mandatory cancel reason, and till-filter proof remain pending/unverified.

> Park / Recall gap closure (2026-08-06): DB idempotency + events migration, soft stock (no reserve), partial-pay reject, lazy EXPIRED, mandatory cancel reason, home `PosParkedSalesScreen`, cart-clear-before-success, deviceId current-till list, and aligned home count are **Implemented** with automated evidence (Flutter sale/cart/pos/pos_shell **250 passed**; Unit PosHold **24**; API PosHold **14**; Integration PosHold **7**). Authenticated full cashier E2E remains **Runtime Verification Pending** (no usable Cashier password in seed). Not Fully Completed.

> Parked Sales backend/API Chunk 1 update (2026-08-07): existing GET now implements Today/current-shift/all-active, controlled pagination and authoritative pre-pagination count/value/currency metadata. Build passed; affected Unit/API/Integration suites passed 46/19/8. No migration or new endpoint. Flutter Chunk 2/3 and authenticated E2E remain pending.

> Parked Sales Flutter Chunk 2 update (2026-08-07): the existing screen/provider stack now consumes backend scope, pagination and aggregate metadata and renders filters, responsive headings/list, typed View, Recall/Cancel actions, summary and Start New Sale. Focused analysis and automated tests pass. Authenticated Chunk 3 visual/E2E acceptance remains pending; the full feature is not Completed.

# Full Feature Status Index

## Park / Recall Sale

| Area | Status | Evidence |
|---|---|---|
| Approved feature contract | Documented (Decisions A–J) | [[../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]] |
| Backend | Completed for approved Park/Recall API scope; code + PosHold suites + authenticated Flutter flow verified | [[Backend/POSOperations/Pos_Park_Recall_Sale_Implementation_Status]] |
| Flutter | Completed — authenticated mandatory Chunk 3 acceptance verified | [[Flutter/Sales/Park_Recall_Sale_Implementation_Status]] |
| QA | Automated PosHold/Flutter suites and authenticated cashier mandatory E2E verified | [[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Park_Recall_Sale_Test_Cases]] |

Exact Parked Sales list-screen documentation is complete:
[[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]].
Its filter/table/summary/pagination Flutter target is implemented with automated
evidence; authenticated Chunk 3 runtime acceptance remains pending. This does not
mark the full feature complete.

> 2026-08-02 correction: Payment Method target rearrangement is **partially
> implemented**. Source composition and automated verification are present, but
> the earlier runtime screenshot did not match the approved target. A new device
> launch reached the login screen because no authenticated session was available,
> so target-route runtime visual sign-off remains pending.

## Purpose

This file tracks Release 1 feature implementation status across Backend, Angular,
and Flutter.

Use `04_MODULE_KNOWLEDGE` for what a module should do.

Use this folder for what has been implemented, tested, reviewed, and completed.

## Folder Structure

```text
15_IMPLEMENTATION_TRACKING/
|-- Backend/[Module_Name]/[Feature_Name]_Implementation_Status.md
|-- Angular/[Module_Name]/[Feature_Name]_Implementation_Status.md
|-- Flutter/[Module_Name]/[Feature_Name]_Implementation_Status.md
|-- _TEMPLATES/Implementation_Status_Template.md
`-- Full_Feature_Status_Index.md
```

## Platform Meaning

| Platform | Meaning |
|---|---|
| Backend | .NET API, Application, Domain, Infrastructure, tests |
| Angular | Platform Admin Web |
| Flutter | POS app, Tenant Admin layout, Cashier UI, device/till flows |

## Status Values

| Status | Meaning |
|---|---|
| Not Started | Work has not begun |
| In Progress | Work is being implemented |
| Blocked | Work cannot continue |
| In Review | Pull request/review is active |
| Testing | Implementation done and tests are running |
| Completed | Implementation, tests, review, and docs are complete |
| Deferred | Confirmed not active now |
| Excluded | Not part of Release 1 scope |

## Completion Rule

Do not mark a feature as `Completed` unless implementation is finished, tests are
written/run, failing tests are fixed or recorded, Second Brain is updated, and
PR/commit reference is recorded.

## Feature Status Table

| Platform | Module | Feature | Status | Completed Date | PR / Commit | Notes |
|---|---|---|---|---|---|---|
| Cross-platform | Platform Tenant | Flow 4 Create Tenant Wizard | Testing (production NO-GO) | 2026-08-05 | [[FLOW_4_RELEASE_ENVIRONMENT_AND_E2E_VALIDATION_EVIDENCE_2026-08-04]] | Isolated PostgreSQL/ClamAV/Azurite and real browser executed; 6 distinct scenarios pass, 14 token/lifecycle scenarios plus live ACS/private proof remain blocked |
| Cross-platform | Platform Tenant | Flow 4 Live ACS Credentialed External Rerun (Chunk 5D) | Conditional; production NO-GO | 2026-08-05 | [[FLOW_4_LIVE_ACS_CREDENTIALED_EXTERNAL_RERUN_EVIDENCE_2026-08-05]] | ACS User Secrets + endpoint reachability + sender PASS; mailbox/allow-list/HTTPS/live DB BLOCKED; Playwright 21/21 skipped; backend 1,501 and Angular 454 pass; `CONDITIONAL_GO_TO_CHUNK_6` |
| Cross-platform | Platform Tenant | Flow 4 Live ACS Mailbox/Playwright Completion (Chunk 5E) | Conditional; production NO-GO | 2026-08-05 | [[FLOW_4_LIVE_ACS_MAILBOX_AND_PLAYWRIGHT_COMPLETION_EVIDENCE_2026-08-05]] | Isolated DB + safety marker provisioned then cleaned; mailbox/allow-list/HTTPS still BLOCKED; no live ACS send; Playwright 21 skipped; regressions 1,501/454; `CONDITIONAL_GO_TO_CHUNK_6` |
| Cross-platform | Platform Tenant | Flow 4 Internal 21-Scenario E2E Preflight (Chunk 6A) | Internal PASS; production NO-GO | 2026-08-05 | [[FLOW_4_INTERNAL_21_SCENARIO_E2E_PREFLIGHT_EVIDENCE_2026-08-05]] | Playwright **21/21** internal PASS (20 canonical + 14b); EmailMode SUPPRESSED; no live ACS; F4-GAP-005 internal closed; F4-GAP-004 external still open; backend 1,501 / Angular 454 |
| Cross-platform | Platform Tenant | Flow 4 Docker Dependency and Merge Readiness (2026-08-06) | Merge-ready with external release block; production NO-GO | 2026-08-06 | [[FLOW_4_DOCKER_DEPENDENCY_AND_MERGE_READINESS_AUDIT_2026-08-06]] | Docker optional/test-only; docker-off build/unit green; no Testcontainers; compose kept for E2E owner; ACS safe defaults; `MERGE_READY_WITH_EXTERNAL_RELEASE_BLOCK` |
| Backend | Platform Tenant | Flow 4 Backend main integration | Internal complete; production NO-GO | 2026-08-06 | Backend merge commit on `feat/flow4-create-tenant-runtime` | After `origin/main` merge: backend tests **1,647/1,647**; internal Playwright 21/21 retained; live ACS/mailbox/HTTPS still BLOCKED_EXTERNAL |
| Cross-platform | Platform Tenant | Flow 4 Second Brain Traceability Audit | Conditionally approved next implementation scope; production NO-GO | 2026-08-05 | [[FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]] | 54 relevant documents fully read; 72 atomic requirements; 59/64 P0 verified; Retail migration resolved; fixture/token authority, 20/20 E2E, private proof and live ACS remain P0 |
| Backend | Platform Tenant | Flow 4 Retail Business-Code Migration | Implemented and verified; Chunk 1 GO | 2026-08-05 | [[FLOW_4_RETAIL_BUSINESS_CODE_MIGRATION_RESOLUTION_EVIDENCE_2026-08-05]] | Guarded original + forward history correction; 9/9 PostgreSQL cases, 1,470/1,470 backend tests, no pending model changes; F4-GAP-006 closed |
| Cross-platform | Platform Tenant | Flow 4 Secure Test-Host Token and Fixture Contract | Documented and approved; Chunk 3 GO; production NO-GO | 2026-08-05 | [[FLOW_4_SECURE_TEST_HOST_CONTRACT_EVIDENCE_2026-08-05]] | Separate non-HTTP CLI/hybrid approved; 15-threat model, typed scenarios, pipe/fallback secret transport and ownership cleanup defined; runtime builder/tests pending; P0 remains 59/64 |
| Backend | Platform Billing | Flow 4 Manual Payment + Future IPG | Backend implemented and verified | 2026-08-05 | [[FLOW_4_MANUAL_PAYMENT_BACKEND_IMPLEMENTATION_EVIDENCE_2026-08-04]] | Real execution defects fixed; 1,461 backend tests pass; EF model current; current release manual and `checkoutUrl` null; Stripe/PayHere deferred |
| Angular | Platform Billing | Flow 4 Manual Payment | Testing; partial browser acceptance; production NO-GO | 2026-08-05 | [[FLOW_4_MANUAL_PAYMENT_ANGULAR_IMPLEMENTATION_EVIDENCE_2026-08-04]] | 453 tests and production audit pass; responsive 5-viewport queue passes; 6 distinct Playwright scenarios pass and 14 remain blocked |
| Backend | Auth | Tenant Login | Completed | 2026-07-01 | Tenant auth module | `POST /api/v1/tenant-auth/login` |
| Backend | OutletTillDevice | Device Context | Completed | 2026-07-09 | `5c99b66` | `devices/current`, `devices/activate` |
| Backend | OutletTillDevice | Till Session Open/Close | Completed | 2026-07-09 | `06048db` | current-session, open, close |
| Backend | POSOperations | POS Home Dashboard API | Testing | 2026-07-08 | Current working tree | Branding + explicit current-session sales/refund/discount/net metrics added; focused API/repository tests pass |
| Backend | CatalogProduct | Tenant Admin Product Setup Wizard | In Progress | - | - | Legacy Product CRUD completed (but deprecated); final 8-step wizard setup flow, APIs and validations in progress. |
| Backend | CatalogProduct | Tenant Admin Product List & Filters | In Progress | - | - | Added API, filter options, lifecycle/stock calculations, and pagination details. |
| Backend | CatalogProduct | Tenant Admin Product CSV Import | In Progress | - | - | CSV batch upload, row parsing validations, template, and commit logic details. |
| Backend | CatalogProduct | POS Products List | Completed | 2026-07-23 | Current `main` audit | `GET /api/v1/pos/products`, categories, detail and exact barcode lookup exist |
| Backend | Sales | POS Checkout / Cash Payment APIs | Testing | - | Current working tree | Cash complete; Card safe unavailable-by-default; QR/Split incomplete |
| Backend | POSOperations | Windows Local Print Agent | Testing | - | Current working tree | [[Backend/POSOperations/Receipt_Printer_Local_Agent_Implementation_Status]] |
| Flutter | POS Shell | POS Home Dashboard | Testing | - | Current working tree | Responsive profile + 3x2 actions + session summary; six PNG workspace files and two production destinations remain open |
| Flutter | Till | Open Till Layout | Completed | 2026-07-10 | `Sale_Screen` | Full-screen tablet layout |
| Flutter | Sales | End Shift + Close Till | Completed | 2026-07-09 | `d04ecf0` | Close till API + logout |
| Flutter | Sales | Start Sale UI | In Progress | - | `Sale_Screen` | Catalog API wired; no mock fallback; checkout blocked |
| Backend | CatalogProduct | POS Product Variant Detail / Frequently Bought Together | In Progress | - | Current working tree | Chunk 1 persistence and Chunk 2 backend/API contracts implemented; backend regression 1,491/1,491. Fractional POS quantity, exhaustive integration fixtures, Flutter/E2E and production validation pending. [[Backend/CatalogProduct/Pos_Product_Variant_Detail_Implementation_Status]] |
| Flutter | Sales | Product Variant Selection Popup | Partial | 2026-08-02 | Current working tree | Target-screen adaptive UI aligned with single-image rule; production validation bypass, rounding/category and currency fallbacks removed. Analysis clean; 16/16 focused tests pass; full suite 703 passed/11 unrelated baseline failures. Authenticated real-backend emulator, configurable recommendation, fractional quantity and physical-device validation remain pending. [[Flutter/Sales/Product_Variant_Popup_Implementation_Status]] |
| Flutter | Sales | Cashier POS Second Brain vs Code Comparison | Completed | 2026-07-02 | - | Audit note; see delta in same file |
| Angular | Tenant | Tenant List Page | In Progress | - | - | Wired to platform-admin tenants API |
| Backend | Tenant / Outlet | Outlet Create | Completed | 2026-06-18 | dashboard_tenant | `POST /api/v1/tenant-admin/outlets` |
| Flutter | Tenant Admin / Outlet | Outlet Create UI | Completed | 2026-06-18 | tenant-dashboard | Add/Edit outlet screens |
| Flutter | Tenant Admin / Till | Till Monitoring UI | Partially Implemented | - | - | Implementation tracking added. See [[Flutter/Tenant_Admin/Till_Monitoring_UI_Implementation_Status]] |
| Flutter | Sales | Discount | Testing | - | `scanner_inte` | API-backed list/validate/apply flow; manager approval is permission-dependent |
| Flutter | Sales | Customer Management | Testing | - | `scanner_inte` | List/create/update/select/attach implemented; loyalty is separate and incomplete |
| Flutter | Sales | Loyalty Earn / Redeem | Not Started | - | - | No verified cashier Flutter-to-backend loyalty flow |
| Flutter | Sales | Cash Checkout | Completed | 2026-08-04 | scanner_inte | Full flow completed. Hardware integration deferred. See [[Flutter/Sales/Cashier_UJ7_Payment_Flow_Final_Signoff]] |
| Flutter | Sales | Cash Payment Screen Redesign | Complete | 2026-08-05 | - | Chunks 1–3 complete; target UI, dynamic Quick Amount, Cash payment submission, authoritative success handling and database persistence validated. Physical printer/drawer status recorded separately. |
| Flutter | Sales | Card Payment | Blocked | - | Current working tree | Provider-neutral backend safety exists; real provider/terminal absent |
| Flutter | Sales | QR Payment | Not Started | - | - | Current route renders payment placeholder |
| Flutter | Sales | Split Payment | Not Started | - | - | Current route renders payment placeholder |
| Flutter | Sales | Payment Receipt Contract | Testing | - | Current working tree | [[Flutter/Sales/Payment_Receipt_Contract_Implementation_Status]] |
| Flutter | Sales | Receipt Preview | Testing | - | Current working tree | Authoritative contract v2 preview/mapping exists |
| Flutter | Hardware | Physical Receipt Printing | Testing | - | Current working tree | Chunk 2 code/automation implemented including non-sale history/copies; POS80 physical matrix pending |
| Cross-platform | Hardware | POS Hardware Production Readiness | Testing | - | Current working tree | Chunk 1 receipt-printer config/test-audit foundation implemented; physical/scanner/full regression pending. [[Flutter/Hardware/POS_Hardware_Production_Readiness_Implementation_Status]] |
| Flutter | Sales | Email Receipt | In Progress | - | `scanner_inte` | Form/UI exists; delivery API completion not verified |
| Flutter | Sales | Return / Refund | Testing | - | `scanner_inte` + backend `main` | Full authoritative workflow and broad automated coverage exist |
| Flutter | Sales | Exchange | Testing | - | `scanner_inte` + backend `main` | Implemented as Return resolution branch with preview/completion |
| Flutter | Cash Drawer | Cash In / Cash Out | In Progress | - | `scanner_inte` | Flutter forms exist; backend mutation wiring is absent |
| Flutter | Sales | Park / Recall | Completed | 2026-08-07 | Current working tree | Chunk 3 authenticated E2E accepted on the existing route/provider: filters, authoritative summaries, View, Recall, non-empty-cart safety, Cancel/no-hard-delete, responsive runtime and 44/44 focused tests passed; safe runtime pagination-volume/role-switch/fault-injection limits are documented. |
| Flutter | Hardware | HID / Camera Barcode Scanner | Testing | - | Current working tree | Chunk 3 code and automation implemented; TB-00D/camera/POS80 physical matrix pending |
| Flutter | Hardware | Hardware Testing Workflow | Testing | - | Current working tree | Authoritative versioned printer config and backend test-log lifecycle wired; scanner screen and physical matrix pending |
| Flutter | Sales | Offline Cash Sale / Outbox | Not Started | - | - | Included MVP scope; no verified end-to-end cashier implementation |
| Backend | CatalogProduct | POS Popular Products | Completed | 2026-07-31 | - | Manual Popular product list curation and default segment |
| Backend | CatalogProduct | POS Frequently Sold | Completed | 2026-07-31 | Current working tree | Dynamic sales aggregation lookback calculation |
| Backend | CatalogProduct | POS Offers Product List | Completed | 2026-07-31 | Current working tree | Dynamic targeted discount and special price retrieval |
| Flutter | Sales | POS Popular Products | Completed | 2026-07-31 | - | Popular segment toggle and admin reorder UI |
| Flutter | Sales | POS Frequently Sold | Completed | 2026-07-31 | Current working tree | Frequently Sold segment grid |
| Flutter | Sales | POS Offers Product List | Completed | 2026-07-31 | Current working tree | Offers segment grid and product card badges |


| Backend | ECommerce / CustomerAuth | Storefront Customer Authentication | Testing | - | - | Implementation tracking added; latest regression and commit evidence pending. See [[Backend/ECommerce/Customer_Auth_Implementation_Status]] |
| Backend | ECommerce / Storefront | Public Storefront Browse APIs | Testing | - | - | Implementation tracking added; search/category-by-slug focused evidence pending. See [[Backend/ECommerce/Storefront_Browse_Implementation_Status]] |
| Backend | ECommerce / Storefront | Storefront Fulfillment Store And Collection Options | Testing | - | - | Implementation tracking added; relational repository and entitlement evidence pending. See [[Backend/ECommerce/Storefront_Fulfillment_Implementation_Status]] |
| Backend | CatalogProduct / Shared Media | Catalog Media Image Upload And Projection | Testing | - | - | Implementation tracking added; Azure/manual and legacy-column evidence pending. See [[Backend/ECommerce/Catalog_Media_Image_Implementation_Status]] |
| Backend | ECommerce / CartCheckout | Storefront Cart Management | Testing | - | - | Cart test matrix and backend status added; latest regression pending. See [[Backend/ECommerce/Storefront_Cart_Implementation_Status]] |
| Backend | ECommerce / CustomerWishlist | Customer Wishlist APIs | Testing | - | - | Implementation tracking added; current regression/exception evidence pending. See [[Backend/ECommerce/Customer_Wishlist_Implementation_Status]] |
| Backend | ECommerce / ProductReviews | Product Reviews APIs | Testing | - | - | Implementation tracking added; current regression/commit evidence pending. See [[Backend/ECommerce/Product_Review_Implementation_Status]] |
| Backend | ECommerce / Customer | POS Customer Profile And Attach To Sale | Testing | - | - | Implementation tracking added; latest regression and entitlement review pending. See [[Backend/ECommerce/Customer_Profile_Pos_Customer_Implementation_Status]] |
| Full Stack | E-Commerce | Web Storefront & Tracking | Testing | - | e-commerce | Core flows are tracked across auth, browse, media, cart, checkout, wishlist, reviews, orders, fulfillment, and POS customer docs. See [[Online_Store/01_ECommerce_Implementation_Status]] |
| Backend | POS Operations | Receipt Template Resolution | Testing | - | Current working tree | Resolution service and dynamic snapshot merge fully implemented and verified via tests/API. Template management API remains pending. See [[Backend/POSOperations/Receipt_Template_Resolution_Implementation_Status]] |
| Flutter | Sales | Payment Success Receipt Screen | In Progress | - | - | Backend dependency (snapshot generation) fully implemented. Flutter data layer updated to accept snapshot. UI implementation pending. See [[Flutter/Sales/Payment_Success_Receipt_Screen_Implementation_Status]] |
The `Completed` row for the 2026-07-02 Cashier comparison is historical. The
comparison document itself is now `In Progress â€” Re-audit Required` until its
remaining findings and documentation updates are closed.

## Update Process

1. Update the platform-specific status file.
2. Update this index row.
3. Add test result summary.
4. Add PR/commit reference.
5. Add completed date.
6. Link related Second Brain files.
7. Do not update unrelated features.

## Required Links

Every feature status file should link to module knowledge, user journey, database
table file, architecture file, and PR/commit reference where available.

## Review Checklist

| Check | Required |
|---|---|
| Status accurate | Yes |
| Tests recorded | Yes |
| PR/commit recorded | Yes |
| Completed date recorded | If completed |
| Related docs updated | Yes |
| No unsupported scope marked complete | Yes |

## Related Files

- [[Tenant_Admin_Test_Cases]]
- [[../04_MODULE_KNOWLEDGE]]
- [[../03_USER_JOURNEYS]]
- [[../11_DEVELOPER_ONBOARDING/Code_Review_Checklist]]

| Tenant Roles & Access | Flutter Frontend | Completed | 2026-07-22 | `15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Roles_Access_Frontend_Implementation_Status.md` |

## Payment Success Chunk 3 Runtime Status (2026-08-06)

**BLOCKED — CHUNK 3 REMAINS IN PROGRESS.** One authenticated Cash sale persisted and reset correctly, but runtime found corrected-yet-unrevalidated Payment Success mapping defects plus unresolved printer/drawer configuration. Physical print did not occur. See `15_IMPLEMENTATION_TRACKING/Flutter/Sales/Payment_Success_Receipt_Screen_Implementation_Status.md`.
