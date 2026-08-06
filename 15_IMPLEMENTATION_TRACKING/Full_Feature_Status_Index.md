<!-- title: Full Feature Status Index -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Full Feature Status Index

## Park / Recall Sale

| Area | Status | Evidence |
|---|---|---|
| Approved feature contract | Documented | [[../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]] |
| Backend | Partial; target changes pending | [[Backend/POSOperations/Pos_Park_Recall_Sale_Implementation_Status]] |
| Flutter | Local-only; API migration not started | [[Flutter/Sales/Park_Recall_Sale_Implementation_Status]] |
| QA | Cases documented; not executed | [[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Park_Recall_Sale_Test_Cases]] |

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
| Backend | Auth | Tenant Login | Completed | 2026-07-01 | Tenant auth module | `POST /api/v1/tenant-auth/login` |
| Backend | OutletTillDevice | Device Context | Completed | 2026-07-09 | `5c99b66` | `devices/current`, `devices/activate` |
| Backend | OutletTillDevice | Till Session Open/Close | Completed | 2026-07-09 | `06048db` | current-session, open, close |
| Backend | POSOperations | POS Home Dashboard API | Testing | 2026-07-08 | Current working tree | Branding + explicit current-session sales/refund/discount/net metrics added; focused API/repository tests pass |
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
| Flutter | Sales | Park / Recall | In Progress | - | `scanner_inte` | Device-local secure storage; backend Holds API is disconnected |
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
