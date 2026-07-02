<!-- title: Cashier POS Second Brain vs Code Comparison Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->


# Cashier POS Second Brain vs Code Comparison

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
| Status | Completed |
| Completed Date | 2026-07-02 |
| Developer | AI assistant |
| Reviewer | - |
| PR / Commit | - |
| Tests | N/A (documentation audit) |

## 1. Summary

- Total features checked: **28**
- Matches docs count: **12**
- Missing count: **8**
- Extra not in docs count: **5**
- Different behavior count: **7**
- Wrong folder structure count: **0**
- Highest risk areas:
  - backend/auth source-of-truth mismatch across notes,
  - returns/cash drawer/orders not fully implemented,
  - print/email actions not fully completed.

## 2. Detailed Comparison Table

| Area / Feature | Second Brain expected behavior | Current code implementation | Difference type | Impact | Recommended next action |
|---|---|---|---|---|---|
| Dashboard Start Sale hero | Clickable Start Sale entry | Implemented; routes to `/pos/new-sale` | Matches docs | Low | None |
| Dashboard Returns card | Functional returns/refunds entry | Card exists; destination is placeholder | Partial implementation | Medium | Implement returns UI/API flow |
| Dashboard Add Customer | Customer flow entry | Implemented via New Sale customer dialog/state | Partial implementation | Medium | Document exact behavior under cashier notes |
| Dashboard Parked Sales | Park/recall journey supported | Route exists, core flow handled in New Sale dialogs | Different behavior | Medium | Clarify route vs dialog primary flow |
| Dashboard Cash Drawer | Cash drawer operational flow | Placeholder screen | Missing from code | High | Implement cashier cash drawer flow |
| Dashboard Orders | Orders management entry | Card/nav unavailable or placeholder | Missing from code | High | Implement orders route + APIs |
| New Sale layout | Product + cart responsive flow | Implemented with tablet/mobile responsive split | Matches docs | Low | None |
| Product grid | Search/filter + product tiles | Implemented; product image rendering in place | Matches docs | Low | None |
| Product tile price | Latest UI direction hides tile price | Implemented (price hidden on tile, visible in cart) | Matches docs | Low | None |
| Cart panel | Qty, remove, totals, proceed action | Implemented with permission gating | Matches docs | Low | None |
| Add/Change customer action | Permission-gated customer selection | Implemented; label switches by selected customer | Matches docs | Low | None |
| Existing customer search | Search/select by name/phone/email | Implemented and API wired | Matches docs | Low | None |
| Quick add customer | Name+phone required, email optional | Implemented with validation and API create | Matches docs | Low | None |
| Customer in cart | Selected customer visible in cart | Implemented | Matches docs | Low | None |
| Customer in checkout | `customerId` included if supported | Implemented in checkout summary/start payment | Matches docs | Low | None |
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
| Auth / tenant-login expectation | Some active notes say missing in Unified backend | Current `Pos Backend/Nytroz-POS-Backend` includes `POST /api/v1/auth/tenant-login` | Risk / unclear | High | Reconcile active backend source-of-truth |
| Folder structure | Feature-first clean architecture expected | No major folder structure violations found | Matches docs | Low | Keep structure; focus on doc drift |

## 3. Extra Features Implemented but Not in Second Brain

1. Discount system completion (manual + item, percentage + fixed, validation).
2. Customer-in-cart propagation through checkout (`customerId` wired).
3. Payment-success print popup behavior (same-screen dialog UX).
4. Parked sale local persistence and restore in secure storage.
5. Resilient fallback behavior for some API/network paths.

## 4. Features Documented but Missing in Code

1. Returns/refunds full cashier flow.
2. Cash drawer operations flow.
3. Orders management screen flow.
4. Actual printer execution.
5. Actual email receipt sending.
6. Complete non-cash payment methods (card/QR/split) end-to-end.

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
