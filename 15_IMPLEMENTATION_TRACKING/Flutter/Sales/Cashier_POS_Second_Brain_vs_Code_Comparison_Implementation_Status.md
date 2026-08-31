<!-- title: Cashier POS Second Brain vs Code Comparison Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->


# Cashier POS Second Brain vs Code Comparison

## Park / Recall Sale reconciliation

The historical local implementation is not the approved final contract.
Flutter currently persists parked sales under `pos.parked_sales`, creates local
`Parked Sale #N` references, and recalls by deleting local data before cart
restoration. The backend already exposes persistent hold create/list/recall/
cancel routes backed by `pos_order_holds`, but the Flutter feature does not call
them. Park / Recall therefore remains **In progress — contract documented,
implementation not started**. Current evidence and remaining work are tracked
in [[Park_Recall_Sale_Implementation_Status]].

## Purpose

This note compares current Cashier POS implementation against Second Brain
documentation and records:

- matches,
- missing implementation,
- extra implemented behavior not documented,
- behavior differences,
- folder-structure findings,
- risks, and
- recommended fix order.

This is analysis/status only. No frontend/backend code changes are included.

## Status Summary

| Item | Value |
|---|---|
| Platform | Flutter + Backend (comparison audit) |
| Module | Cashier POS (Home, New Sale, Customer, Discount, Parked Sale, Payment, Receipt) |
| Feature | Second Brain vs Code comparison |
| Status | In Progress — Re-audit Required |
| Completed Date | 2026-07-02 |
| Developer | AI assistant |
| Reviewer | - |
| PR / Commit | - |
| Tests | Current automated test inventory re-audited; physical hardware verification remains pending |

The comparison below contains the original 2026-07-02 snapshot and its
2026-07-10 delta. It is retained as audit history, but it is no longer the
current implementation truth. Use **Current Re-audit — 2026-07-23** for current
Cashier POS status.

## Checkout Customer Flow Reconciliation — 2026-08-07

Status: **Step 3 Checkout Customer Persistence Fully Complete**.

The approved Payment Method journey uses a clickable Customer card and a
separate full-screen checkout customer selection/add screen. Existing selection
by name/mobile/email and successful Add Customer creation must auto-associate to
the active cart/checkout, auto-return to Payment Method, and display the selected
name. Customer remains optional; nullable `customerId` must not block walk-in/
guest checkout. `/pos/customers` remains Customer Management, and its explicit
`attach-to-sale` capability is not the approved checkout UX.

The complete handoff contract is
[[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Checkout_Customer_Selection_Implementation_Specification]].
Backend core customer/search/create and nullable checkout APIs are supported.
The approved normal Cashier
requirement for `customers.create` is restored in the canonical seed and a
forward corrective migration. The migration is applied to Local Development;
direct DB checks prove one active permission and one canonical Cashier mapping.
Authenticated Cashier search/create passed (HTTP 200/201), while a legitimate
principal without `customers.create` was denied specifically with HTTP 403 and
`pos_customers.create_permission_denied`. This completes permission Step 1.

Flutter Step 2 now provides a dedicated nested Payment Method route, clickable
Customer card, debounced active-customer search, stale-response protection,
20-row paging with Load More, selected-customer indication, Walk-in reset,
permission-separated search/create actions, backend-authoritative customer
creation, duplicate/authorization/network error mapping, duplicate-submit
protection, and checkout-summary revalidation with safe customer rollback on
failure. It uses the existing New Sale cart `selectedCustomer`; no attach-to-sale
call or parallel customer state was added.

Authenticated Local Development runtime evidence (2026-08-07): the Cashier
session, trusted Web POS device and open till reached the real
`/pos/new-sale/payment/customer` route from Payment Method with Match Shorts
(Small), quantity 1 and LKR 2,800.00 intact. Real backend search passed by name,
phone and email, including selected and empty states. Existing customer
selection revalidated checkout and returned to Payment Method. One controlled
customer was created through `POST /api/v1/customers`; the backend-authoritative
result auto-selected and returned to Payment Method without changing the cart.
PostgreSQL contains exactly one matching ACTIVE/POS row: CustomerId
`a6cac5ca-7c23-44f4-a840-a91d582a5bc9`, CustomerCode `CUS000004`, tenant
`55555555-0000-4000-8000-000000000001`. A duplicate-phone create was rejected
with the canonical message while the form, selected customer and cart remained
intact; the database still contained one row.

The current architecture does not create `sales_orders` before payment starts;
Step 3 verified its existing atomic cash `start-payment` behaviour without a
new attach endpoint or customer state. Flutter passes the canonical
`posNewSaleCartProvider.selectedCustomer.customerId` through
`PosCheckoutRemoteDatasource.startPayment`; walk-in omits `customerId`. The
backend tenant-scopes and status-validates the customer before its serializable
payment transaction and passes the validated request CustomerId to
`SalesOrder.CreateCompletedPosSale`. Unknown and cross-tenant IDs return
`pos_checkout.customer_not_found`; inactive customers return
`pos_checkout.customer_inactive`; none create an order.

Authenticated Local Development Step 3 runtime (2026-08-07) completed exactly
one mandatory atomic cash payment-start with correlation `f4398d573a74`:
Match Shorts (Small), quantity 1, LKR 2,800.00; selected CustomerId
`a6cac5ca-7c23-44f4-a840-a91d582a5bc9`; LKR 3,000.00 tendered and LKR 200.00
change. PostgreSQL changed from zero to exactly one relevant order:
`SO-000106` / `aa9790d0-9b93-48fc-b292-96ba682cc34b`, tenant
`55555555-0000-4000-8000-000000000001`, with the exact selected CustomerId,
one line, one payment and one receipt (`RCP-000095`). Total/paid amounts were
LKR 2,800.00 and no duplicate order was created. Because `start-payment` is
atomic in the existing architecture, the sale completed; no second submission,
receipt printing or hardware action was performed.

Post-runtime automated evidence: **8/8 Step 2 tests passed**, **41/41 targeted
checkout/Payment Method/customer regression tests passed** (current count), and
focused Flutter analysis completed with no issues. No runtime defect required a
production-code change. Step 3 added focused tests only: **4/4 Flutter customer
handoff tests**, combined focused Flutter regressions **37/37**, backend checkout
repository integration **15/15**, checkout controller **8/8**, focused Flutter
analysis clean, and backend Release build succeeded with zero warnings/errors.

### Checkout Customer target UI closure — 2026-08-07

Status: **Target UI implemented and authenticated visual verification passed**.

The dedicated checkout Customer route now matches the approved cashier target:
one shared black POS header using live business, till-session, outlet and till
context; one unified white rounded workspace; compact two-column Find Existing
Customer / Add New Customer panels; target outlined search and form fields;
orange primary action and information treatment; and the existing black cashier
navigation with New Sale active. The old customer-route Payment banner and
duplicate shell header are absent. The final authenticated Pixel Tablet capture
is `C:\tmp\checkout-customer-target-final.png`; Back to Payment returned safely,
and the runtime log contained no RenderFlex overflow or Flutter exception.

Step 2 integration remains authoritative and unchanged: real active-customer
search, pagination, create, selectedCustomer, checkout revalidation/rollback,
duplicate-submit prevention and error mapping still use the existing provider,
remote datasource and cart state. Customer rows show only supported real data:
initials, name, phone, status and backend `totalOrderCount`; no fake images,
membership or visit counts were added. Filter is visibly disabled because the
checkout provider has no approved interactive filter contract. Recent Customers
is hidden because there is no canonical recent-customer source. Customer Type
and Notes are absent because `POST /api/v1/customers` supports only `fullName`,
`phone` and optional `email`.

Automated evidence: checkout Customer + Payment handoff focused suites **17/17
passed**; target layouts passed at 1280x800, 1680x1050 and 2560x1600 plus
1280x800 at 1.3 text scale with no overflow; focused analysis reported no
issues. No backend, database, migration or customer API contract changed.

## Current Re-audit — 2026-07-23

### Repository Evidence

| Repository | Branch | Commit | Working tree at audit |
|---|---|---|---|
| Second Brain | `return_search_sale` | `146ce48` | Existing documentation changes present and preserved |
| Flutter POS | `scanner_inte` | `24b4271` | Clean |
| Unified Commerce backend | `main` | `09ccbeb` | Local checkout service/repository/test changes present |

### Current Journey Summary

| Journey | Current code status | Current documentation finding |
|---|---|---|
| Cashier login | End-to-end implemented | Login endpoint and auth-table wording require correction |
| Device activation | End-to-end implemented | Current/activate endpoints and device context require correction |
| Till opening | End-to-end implemented | Exact current-session/open contract requires correction |
| Start New Sale | Partially implemented | Product/SKU/barcode, HID/camera scanning, cart and cash-checkout entry are implemented; offline sale is not |
| Discount | Partially implemented | Real APIs include approve/POLICY/LINE-Fixed capability outside current cashier target; MANUAL-only direct-reject/offline/responsive alignment remains pending |
| Customer Management | Partially implemented | Release 1 customer management/state/nullable checkout propagation exist; loyalty earn/redeem is deferred and not Release 1 scope |
| Payment and checkout | Partially implemented | Cash is transactional; Card, QR and Split routes are placeholders |
| Return and refund | End-to-end implemented | Current ten-step journey is substantially aligned |
| Exchange | End-to-end implemented | Implemented as a Return resolution branch, not a standalone Exchange API |
| Cash In / Cash Out | Frontend only | Forms exist; no cashier cash-movement mutation API is wired |
| Till close / End Shift | Partially implemented | Real close API exists; denomination and full close-to-logout E2E evidence remain incomplete |
| Park / Recall | Partially implemented/disconnected | Flutter uses local secure storage; backend Holds API exists but is not called by Flutter |
| Hardware testing | Runtime verification required | Scanner/printer source exists; physical and hardware-test-log workflow verification is incomplete |

### Current Payment Method Status

| Method | Status | Evidence |
|---|---|---|
| Cash | Implemented | Flutter checkout summary/start-payment flow and backend `POST /api/v1/pos/checkout/summary` plus `start-payment` |
| Card | UI placeholder | `/pos/new-sale/payment/card` resolves to `PosPaymentPlaceholderScreen` |
| QR | UI placeholder | `/pos/new-sale/payment/qr` resolves to `PosPaymentPlaceholderScreen` |
| Split | UI placeholder | `/pos/new-sale/payment/split` resolves to `PosPaymentPlaceholderScreen` |

### Corrections To The Original Snapshot

| Old snapshot claim | Current verified truth |
|---|---|
| Checkout APIs are absent | Checkout summary and start-payment controller/service/repository chains exist |
| Returns/refunds are a placeholder | Full Return/Refund workflow, persistence, completion and automated tests exist |
| Exchange is missing | Exchange is implemented inside the persisted Return resolution workflow |
| Actual printing is only an audit snackbar | A local receipt-printer facade, ESC/POS generator and network transport exist; physical hardware remains unverified |
| Scanner camera support is pending | Android/iOS camera source and automated coverage exist; physical Android verification remains pending |
| Parked sale is backend-aware | Current Flutter park/recall is device-local secure storage; backend Holds is disconnected |
| Cash drawer operations are a placeholder only | UI and a legacy backend mutation exist; canonical `cash_movements` + catalog-backed Cash In remains pending |

### Remaining High-Risk Gaps

- Card, QR and Split payment completion.
- Backend persistence for cashier Cash In / Cash Out.
- Flutter integration with backend POS Holds.
- Loyalty earn/redeem is future/deferred and not Release 1 scope.
- Email receipt delivery.
- Offline cash-sale outbox and sync.
- Physical scanner, printer, drawer and card-terminal acceptance evidence.
- Hardware-test screen/API/service/logging workflow.

## 1. Summary

- Total features checked: **28**
- Matches docs count: **12**
- Missing count: **8**
- Extra not in docs count: **5**
- Different behavior count: **7**
- Wrong folder structure count: **0**
- Highest risk areas:
  - checkout APIs missing in Unified-Commerce while Flutter still calls them,
  - returns/cash drawer detail/orders not fully implemented,
  - print/email actions not fully completed.

## Delta Since 2026-07-02 (Verified 2026-07-10)

| Area | Change | Status |
|---|---|---|
| Tenant login | Flutter uses `POST /api/v1/tenant-auth/login` | Integrated |
| POS home / till / device | Unified-Commerce controllers merged on `POS_UI` | Integrated |
| Close till + End Shift | Sidebar End Shift → close till → logout | Integrated |
| Open Till layout | Historical tablet layout fix (2026-07-10); approved UI contract PENDING | See [[../Till/Open_Till_Screen_Layout_Implementation_Status]] |
| `GET /api/v1/pos/products` | Backend + Flutter list wiring | In Review (branch) |
| Catalog mock fallback | `pos_catalog_fallback_data.dart` removed | Real data only |
| Checkout / receipt APIs | Still absent in `E_POS.Api` | Blocked |

See [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cashier_POS_Implementation_Map]] for
the current active map.

## 2. Detailed Comparison Table

| Area / Feature | Second Brain expected behavior | Current code implementation | Difference type | Impact | Recommended next action |
|---|---|---|---|---|---|
| Dashboard Start Sale hero | Clickable Start Sale entry | Implemented; routes to `/pos/new-sale` | Matches docs | Low | None |
| Dashboard Returns card | Functional returns/refunds entry | Card exists; destination is placeholder | Partial implementation | Medium | Implement returns UI/API flow |
| Dashboard Add Customer | Checkout entry is the Payment Method Customer card | Existing customer management/dialog/state does not prove the approved entry or full-screen route | Missing approved checkout UX | High | Implement dedicated checkout route and clickable card |
| Dashboard Parked Sales | Park/recall journey supported | Route exists, core flow handled in New Sale dialogs | Different behavior | Medium | Clarify route vs dialog primary flow |
| Dashboard Cash Drawer | Cash drawer operational flow | Placeholder screen | Missing from code | High | Implement cashier cash drawer flow |
| Dashboard Orders | Orders management entry | Card/nav unavailable or placeholder | Missing from code | High | Implement orders route + APIs |
| New Sale layout | Product + cart responsive flow | Implemented with tablet/mobile responsive split | Matches docs | Low | None |
| Product grid | Search/filter + product tiles | Implemented; product image rendering in place | Matches docs | Low | None |
| Product tile price | Latest UI direction hides tile price | Implemented (price hidden on tile, visible in cart) | Matches docs | Low | None |
| Cart panel | Qty, remove, totals, proceed action | Implemented with permission gating | Matches docs | Low | None |
| Add/Change customer action | Clickable Payment Method Customer card opens dedicated full-screen checkout selector | Payment Method card is display-only; management route/dialog is not the approved checkout route | Missing implementation | High | Implement exact full-screen journey |
| Existing customer search | Search name/mobile/email; select auto-associates and auto-returns | Search exists in Customer Management, but approved checkout auto-association/return is not proved | Partial/different implementation | High | Reuse data layer in dedicated checkout route |
| Quick add customer | Create, auto-select, auto-associate and auto-return without re-search | Create exists, but approved automatic checkout continuation is not proved | Partial/different implementation | High | Complete create-success orchestration |
| Customer in cart | Selected customer visible in cart | Implemented | Matches docs | Low | None |
| Customer in checkout | Nullable `customerId`; selected value persists, null never blocks walk-in/guest | Request propagation exists; exact UI journey remains pending | Backend/data capability only | Medium | Retain nullable propagation while implementing UX |
| Discount flow | Discount policy-driven behavior | Manual + item discount dialog with %/fixed + validation implemented | Extra in code but not in docs | Medium | Update implementation docs/status |
| Parked save/recall | Save and recall parked sales | Implemented with local secure-storage persistence | Different behavior | Medium | Decide/document local vs backend authority |
| Parked sale persistence | Expected backend-aware lifecycle | Local secure storage + restore/delete | Different behavior | Medium | Add explicit offline parked-sale contract note |
| Cash payment | Enter tender, compute change, confirm | Implemented with API start-payment | Matches docs | Low | None |
| Payment success | Summary + action bar | Implemented | Matches docs | Low | None |
| Print Receipt UX | Older docs mention print route page | Current flow opens popup/modal on success screen | Different behavior | Low | Update routing/receipt docs |
| Receipt content | Full sale receipt detail visible | Implemented via `ThermalReceiptPreview` | Matches docs | Low | None |
| Actual print execution | Printer action should complete print | Only print-audit API + snackbar; no hardware print | Missing from code | Medium | Implement printer integration |
| Email receipt send | Email receipt action expected | UI present, send behavior incomplete | Missing from code | Medium | Implement send flow |
| Returns/refunds | Full cashier flow documented | Placeholder | Missing from code | High | Prioritize implementation |
| Cash drawer operations | Full cashier flow documented | Placeholder | Missing from code | High | Prioritize implementation |
| Auth / tenant-login expectation | Some active notes say missing in Unified backend | Unified-Commerce implements `POST /api/v1/tenant-auth/login`; Flutter wired | Resolved 2026-07-10 | Low | Keep API_ENDPOINTS + limitations in sync |
| Folder structure | Feature-first clean architecture expected | No major folder structure violations found | Matches docs | Low | Keep structure; focus on doc drift |

## 3. Extra Features Implemented but Not in Second Brain

1. Discount system completion (manual + item, percentage + fixed, validation).
2. Customer-in-cart nullable propagation through checkout (`customerId` wired);
   this is data capability, not completion of the approved selection UX.
3. Payment-success print popup behavior (same-screen dialog UX).
4. Parked sale local persistence and restore in secure storage.
5. Resilient checkout network fallback on payment screens (catalog mock removed).

## 4. Features Documented but Missing in Code

1. Returns/refunds full cashier flow.
2. Cash drawer operations flow.
3. Orders management screen flow.
4. Actual printer execution.
5. Actual email receipt sending.
6. Complete non-cash payment methods (card/QR/split) end-to-end.
7. Dedicated full-screen checkout customer selection/add with automatic
   association and return to Payment Method.

## 5. Different from Second Brain

1. Auth/backend tenant-login mismatch between documentation tracks.
2. Print receipt popup vs old route-based flow.
3. Parked sale local storage strategy vs backend-oriented expectation.
4. Discount implementation ahead of some docs that still imply stub/partial.
5. Orders/returns/cash drawer documented as richer flows while current code is placeholder.
6. Route/API contract drift between notes and current implementations.

## 6. Folder Structure Issues

- No major folder structure violations found.
- Main issue is **documentation drift**, not physical folder misplacement.

## 7. Cashier POS Risk List

### High risk

- Conflicting active backend/auth source-of-truth notes.
- Core cashier modules still missing (returns, cash drawer, orders).
- API contract drift can mislead implementation and QA.

### Medium risk

- Print and email actions visible but partially implemented.
- Parked sale local persistence contract not fully aligned/documented.
- Permission behavior not consistently reflected across notes.

### Low risk

- Home/New Sale/cart/customer/cash-payment base flow stability.
- Frontend feature-based structure and responsive layout consistency.

## 8. Recommended Fix Order

1. Unify active backend source-of-truth for Cashier POS.
2. Implement returns/refunds, cash drawer, orders.
3. Complete print/email receipt functionality.
4. Standardize parked sale storage strategy and authority model.
5. Sync Second Brain docs with current implementation status.
6. Add regression coverage for cashier critical flows.

## 9. Files/Areas Inspected

### Second Brain

- [[../../00_START_HERE/Current_Source_Of_Truth]]
- [[../../02_ACCESS_CONTROL/Permission_Code_List]]
- [[../../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../03_USER_JOURNEYS/Cashier/04_Start_Sale_Flow]]
- [[../../03_USER_JOURNEYS/Cashier/05_Discount_Flow]]
- [[../../03_USER_JOURNEYS/Cashier/06_Customer_Loyalty_Flow]]
- [[../../03_USER_JOURNEYS/Cashier/07_Payment_Flow]]
- [[../../03_USER_JOURNEYS/Cashier/08_Return_Refund_Flow]]
- [[../../03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow]]
- [[../../03_USER_JOURNEYS/Cashier/11_Till_Close_Flow]]
- [[../../03_USER_JOURNEYS/Cashier/12_Park_Recall_Sale_Flow]]
- [[../../11_DEVELOPER_ONBOARDING/Unified_Commerce_Backend_Known_Limitations]]

### Frontend (`Nytroz-POS-App`)

```text
lib/features/pos_shell/...
lib/features/sale/presentation/screens/pos_new_sale_screen.dart
lib/features/sale/presentation/widgets/new_sale/pos_new_sale_action_bar.dart
lib/features/sale/presentation/widgets/new_sale/pos_discount_dialog.dart
lib/features/cart/presentation/widgets/pos_empty_cart_panel.dart
lib/features/cart/presentation/providers/pos_new_sale_cart_provider.dart
lib/features/cart/presentation/providers/pos_parked_sale_provider.dart
lib/features/sale/presentation/widgets/new_sale/pos_new_sale_customer_dialog.dart
lib/features/sale/presentation/screens/pos_payment_method_screen.dart
lib/features/sale/presentation/screens/pos_cash_payment_screen.dart
lib/features/sale/presentation/screens/pos_cash_payment_success_screen.dart
lib/features/sale/presentation/widgets/print_receipt/print_receipt_dialog.dart
lib/features/sale/presentation/widgets/receipt/thermal_receipt_preview.dart
lib/features/sale/data/datasources/pos_checkout_remote_datasource.dart
lib/features/auth/data/datasources/auth_remote_datasource.dart
```

### Backend (`Pos Backend`)

```text
Pos Backend/Nytroz-POS-Backend (cashier-related controllers/services/routes)
```

## Related Second Brain Files

| Area | File |
|---|---|
| Feature status index | [[../Full_Feature_Status_Index]] |
| Existing Start Sale status | [[Start_Sale_UI_Implementation_Status]] |
| Source of truth | [[../../00_START_HERE/Current_Source_Of_Truth]] |
| Backend/API baseline | [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]] |

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| This file | Added full Cashier POS documentation-vs-code comparison status report |
| [[../../00_START_HERE/Current_Source_Of_Truth]] | Added reference link to this comparison note |

## Related Files

- [[../Full_Feature_Status_Index]]
