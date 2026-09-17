<!-- title: Online Order Collection QR Payment Handover Chunk 2 -->
<!-- status: COMPLETE — Chunk 2 software acceptance closed; physical hardware exclusions remain -->
<!-- last_updated: 2026-09-14 -->

# Online Order Collection — QR / Payment / Handover — Chunk 2

## Status

**Software implementation COMPLETE** against Chunk 1 freeze.  
**Development authenticated HTTP → API → DB live acceptance:** **PASS** (2026-09-12).  
**Flutter device UI drive:** PASS at 1280×800; see final closure below.  
**Physical HID / card terminal / printer:** NOT TESTED (card terminal remains OUT OF RELEASE).

Chunk 2 software acceptance is complete. Do **not** create Chunk 3. Earlier dated evidence below is historical; the 2026-09-14 closure supersedes its outstanding gates.

## Implemented journeys

### PAID
OO-01 Collection QR → Scan/Validate → Verification → Confirm Handover → `collection/complete` → Collection Complete → Print/Reprint

### UNPAID CASH
… → Verification → Payment Required → shared Payment Method → Cash (`existingSalesOrderId`) → Payment Success → Handover → Complete → Print

### UNPAID CARD
… → Payment Method → Card software route (existing placeholder maturity) → then Handover path

## API contracts (implemented)

| Method | Route | Notes |
|---|---|---|
| POST | `/api/v1/tenant/ecommerce/click-collect/collection/qr/validate?outletId=` | READ-ONLY |
| POST | `/api/v1/tenant/ecommerce/click-collect/orders/{orderId}/collection/complete?outletId=` | Lifecycle; body `{ expectedVersion }` |
| POST | `/api/v1/pos/checkout/start-payment` | EXTEND optional `existingSalesOrderId` + empty `lines` + `idempotencyKey` |

## QR

- Issued on Mark Ready: SHA-256 hash + version + 7-day expiry on `pickup_orders`
- One-time `collectionQrToken` returned in Mark Ready response
- Validate compares hash; no lifecycle mutation
- Unique filtered index migration: `20260912140000_AddPickupQrTokenHashUniqueIndex` — **APPLIED** on Development `UnifiedCommerceDb`

## Historical READY QR policy (frozen)

| Class | Policy |
|---|---|
| Future READY transition | Mark Ready issues QR hash/version/expiry; one-time raw token in response only |
| Historical READY missing/expired QR needing collection | Safe Development reissue: canonical Mark Ready path when lifecycle allows; otherwise Development-only crypto hash repair matching IssueCollectionQr (never predictable tokens; never raw-token DB column) |
| COLLECTED / CANCELLED | Do **not** issue active QR |
| Operator process | Prefer Mark Ready / packing Ready API over ad-hoc SQL; SQL hash repair is Dev-only evidence path |

## Permissions

`commerce.online_order.collection.scan_qr`, `validate_qr`, `manual_lookup`, `verify_items`, `handover`, `collect`  
Reconciliation migration: `20260912140100_ReconcileClickCollectCollectionPermissions` — **APPLIED**  
Development cashier `cashier001@gmail.com`: all collection.* grants present (1 row each, no duplicates).  
Catalog freeze counts updated: All 359 / RoleAssignable 352.

## Flutter routes

`/pos/online-orders/collection/{scan|verification|rejected|handover|complete|payment}`

## Lifecycle proof (live Development API↔DB)

| Invariant | Evidence |
|---|---|
| Validate ≠ Collected | PAID `ECOMM-SEED-ACCEPTED-001`: after validate still READY / CollectedAt NULL |
| Payment Success ≠ Collected | UNPAID `ECOMM-SEED-ACCEPTED-002` then `003`: after cash settle still READY / CollectedAt NULL / PAID balance 0 |
| Handover = Collected | complete → Pickup COLLECTED + FO FULFILLED + sales COMPLETED/COLLECTED; one `PICKUP_COLLECTED` event |
| Duplicate handover | Idempotent success; event count remains 1 |
| Concurrent complete | Two parallel completes on `003` after pay: both 200 idempotent COLLECTED; **one** collected event |
| Receipt software | start-payment returns receiptNumber; PAID order created **no** new `sales_payments` row; UNPAID created 1 payment row |

## Live fixtures used (Development)

| Role | Order | Result |
|---|---|---|
| PAID | `ECOMM-SEED-ACCEPTED-001` | Collected |
| UNPAID cash | `ECOMM-SEED-ACCEPTED-002` (1800), later concurrency on `003` (2000) | Collected |
| Not ready | `ECOMM-SEED-PENDING-001` | complete → 409 `not_ready`; no mutation |
| Expired QR | `003` (pre-pay expiry repair) | validate → 409 `qr_expired` |
| Invalid / wrong outlet / already collected | live HTTP | PASS |

## Automated evidence (closure session)

| Suite | Result |
|---|---|
| Flutter `test/features/online_orders` | **161 passed** |
| Flutter collection + cash focused (earlier) | 45 passed |
| Flutter analyze (collection owners) | **No issues found** |
| Backend build `E_POS.Api` | **0 warnings / 0 errors** |
| Backend Unit Collection/Pickup/FO concurrency filter | 45 passed |
| Backend Unit Collection+Checkout filter | 36 passed |
| Backend Integration `PosOnlineOrderCollection*` | 5 passed |
| ApiTests ClickCollect | 24 passed |
| Catalog freeze counts | 2 passed (updated for +6 collection codes) |

## Live / hardware gates

| Gate | Status |
|---|---|
| Migrations on Development | APPLIED |
| Fresh cashier auth + collection perms | PASS |
| Live PAID API↔DB | PASS |
| Live UNPAID cash API↔DB | PASS |
| Live Flutter UI device drive | **NOT RUN** (blocker for COMPLETE) |
| Responsive widget (OO-01 1280/1180/1100 + orange/pink) | PASS (automated) |
| Negative live cases | PASS (incl. expired, not ready) |
| Concurrent complete HTTP | PASS (idempotent dual 200, one event) |
| Physical HID | NOT TESTED |
| Card terminal | OUT OF RELEASE |
| Receipt printer | NOT TESTED (software receipt path PASS) |

## Related

- Chunk 1: [[Online_Order_Collection_QR_Payment_Handover_Chunk1_2026-09-12]]
- Journey: [[../../../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]]
- Technical: [[../../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]

## Flutter device acceptance update — 2026-09-13

The Android emulator (`emulator-5554`, 2560×1600 physical / 1280×800 logical landscape) drove the real Flutter application against Development API `http://localhost:5150` and PostgreSQL `UnifiedCommerceDb`.

`ECOMM-SEED-PENDING-003` was prepared through the canonical UI: Start Fulfilment → barcode-confirmed pick → Review & Pack → Mark Ready. The one-time opaque collection code was copied in-app and supplied through the runtime manual scanner input. No raw token was logged or persisted.

| Stage | Database proof |
|---|---|
| Before cash payment | 0 payment rows; SO `UNPAID`; FO/Pickup `READY`; `collected_at` NULL; 0 collected events |
| After cash payment | 1 payment row; SO `PAID`; FO/Pickup still `READY`; `collected_at` NULL; 0 collected events |
| After handover | payment rows still 1; SO `COMPLETED`; FO `FULFILLED`; Pickup `COLLECTED`; `collected_at` set; one `PICKUP_COLLECTED` and one `FULFILLMENT_FULFILLED` event |

Receipt `RCP-000190` was issued for LKR 1,500 with LKR 2,000 cash received and LKR 500 change. The Collection Complete print action was invoked. A physical print/reprint result was unavailable because no receipt printer was configured.

Cash UI evidence passed for insufficient (LKR 1,000 blocks submit), exact (LKR 1,500), and over-tender (LKR 2,000; LKR 500 change). Invalid QR and rescan-after-collection both reached safe rejection UI, with final payment/event counts unchanged.

Runtime defects found and fixed with regressions:

- Preserve the one-time Mark Ready `collectionQrToken` only in transient Riverpod state and expose a one-time clipboard action.
- Move the manual-entry `TextEditingController` into the sheet widget lifecycle to prevent the Flutter `_dependents.isEmpty` assertion during route transition.
- Pass the collection balance to shared checkout in whole currency units, removing a 100× displayed/payment amount error.
- Update cached validation to PAID immediately after settlement so Back navigation cannot offer a duplicate Take Payment action.

Runtime screenshots (safe; no raw collection code):

- `.codex-tmp/01-oo01-collection-entry.png`
- `.codex-tmp/02-scan-customer-qr.png`
- `.codex-tmp/03-paid-verification-final.png`
- `.codex-tmp/04-confirm-handover.png`
- `.codex-tmp/05-paid-complete.png`
- `.codex-tmp/06-unpaid-verification.png`
- `.codex-tmp/06-unpaid-payment-required.png`
- `.codex-tmp/07-payment-method.png`
- `.codex-tmp/08-cash-payment.png`
- `.codex-tmp/09-payment-success.png`
- `.codex-tmp/already-collected.png`
- `.codex-tmp/invalid-qr.png`

Historical outstanding gates as of 2026-09-13 (superseded by the closure below):

- A fresh login/JWT for `cashier001@gmail.com` was not proven; the existing authenticated cashier session had the effective collection permissions.
- The one canonical fixture exercised both UNPAID settlement and subsequent PAID revalidation/handover; a separate pre-paid, uncollected fixture with a recoverable one-time code was unavailable.
- NOT READY, wrong-outlet, and expired-code cases were not live-driven in this Flutter session because issuing a valid token requires the canonical READY transition.
- Controlled reprint and physical receipt output were not observable without configured printer hardware/history access.
- 1180×820 and 1100×700 live resize were not run; existing responsive widget coverage remains the evidence for those sizes.

## Final software closure — 2026-09-14

**COMPLETE.** This section supersedes earlier PARTIAL/NOT RUN entries. No Chunk 3, commit, push, backend source change, new API, table, attribute, payment engine, scanner, role check, or direct widget Dio was introduced for this closure.

### Fresh authentication and canonical fixtures

The real Android app signed out through Account Settings and signed in again as `cashier001@gmail.com`. Fresh authenticated collection actions and payment succeeded. No password or raw QR token is included in this evidence. QR values existed only in process memory and the transient scanner input.

Effective collection permissions confirmed: `commerce.online_order.collection.scan_qr`, `.validate_qr`, `.manual_lookup`, `.verify_items`, `.handover`, `.collect`, `.view_ready`, `.notify_customer`, and `.mark_ready` (each suffix uses the same full collection prefix). Existing checkout/cash authorization was exercised successfully.

Two distinct Development fixtures were prepared from the canonical seed graphs, then advanced using existing checkout, Start, barcode Pick, Pack, and Ready APIs. Lifecycle/payment flags were not manually flipped.

| Fixture | Initial collection state | Preparation |
|---|---|---|
| `ECOMM-CLOSURE-PAID-001` / `e0930101-0001-4000-8000-000000000001` | PAID, READY, CollectedAt NULL, valid QR | Paid before the collection journey; receipt `RCP-000191` |
| `ECOMM-CLOSURE-CASH-001` / `e0940101-0001-4000-8000-000000000001` | UNPAID, READY, CollectedAt NULL, valid QR | Separate outstanding fixture; collection cash receipt `RCP-000192` |

### Live journeys and database invariants

Prepaid: OO-01 → Collection QR → manual token validation → PAID verification → Handover → Collection Complete → receipt history/detail. Take Payment was absent. Payment count stayed one: **zero new payments** during collection.

Cash: validation → UNPAID verification → shared Payment Method → Cash. Back to Sale returned to verification; Cash Back returned to Payment Method. Before submission the DB still had zero payments/receipts, READY pickup, NULL collection timestamp, and zero collection events. Then cash due LKR 2,500, received LKR 3,000, change LKR 500 → dedicated Payment Success → explicit Continue to Handover → checklist/confirm → COLLECTED.

At the exact dedicated Payment Success screen, the database showed one payment/receipt, PAID/zero balance, pickup and fulfillment **READY**, `CollectedAt NULL`, and zero fulfilled events. Payment Success did not collect the order. System Back did not replay payment; returning from Handover to Verification showed PAID with no Take Payment action.

The emulator disconnected after cash handover. Its old XML was excluded from evidence. After restoring the existing AVD, fresh receipt history/detail for the cash fixture was read and controlled reprint was driven. Cash final collection is proven by DB; the shared Collection Complete UI was observed live for prepaid and is covered by the collection matrix.

| Final DB proof, repeated after reprint | Payments | Receipts | FULFILLMENT_FULFILLED | PICKUP_COLLECTED | Pickup / CollectedAt |
|---|---:|---:|---:|---:|---|
| PAID-001 | 1 | 1 | 1 | 1 | COLLECTED / `2026-09-14 13:00:37.343202+05:30` |
| CASH-001 | 1 | 1 | 1 | 1 | COLLECTED / `2026-09-14 13:04:39.23572+05:30` |

Receipt detail for `RCP-000192` showed total/paid 2,500 and change 500. Reprint reason authorization completed through the existing receipt UI. `receipt_print_logs` records the duplicate copy as `PRINTED`, transport `LOCALPRINTAGENT`, agent result `printed`. The original print attempt remains PENDING; no physical paper output was observed. Software receipt/reprint **PASS**; physical printer **NOT TESTED**. Payment and collection counts did not increase.

### Screen/button audit

All rows use existing ThemeData/ColorScheme, OnlineOrderUi, TenantAdminColors, and reusable component owners. Theme primary is for business actions; success, error, warning and information remain semantic. Neutral layout colors are not tenant branding. Existing centralized legacy color constants remain for compatibility; the audited payment widgets no longer reference `PaymentMethodStyle.orange` or raw numeric color literals.

| Screen / owner | Primary action and component | Secondary/navigation | Color and state result |
|---|---|---|---|
| OO-01 / `oo01_online_orders_widgets.dart` | Collection QR, existing IconButton | Existing navigation | Theme-controlled entry; permission gated |
| Scan / `collection_qr_scan_screen.dart`, `collection_scan_widgets.dart` | Manual validation, PosPrimaryActionButton | Manual-entry outline, Back | Primary/theme chip; info semantic; validation loading blocks repeats |
| Verification / `collection_verification_screen.dart`, `collection_verification_widgets.dart` | Take Payment / Confirm Handover, PosPrimaryActionButton | Back | Primary CTA; outstanding balance warning; READY chip theme |
| Rejected / `collection_qr_rejected_screen.dart` | Rescan, PosPrimaryActionButton | Existing route navigation | Danger icon/message; retry retains primary |
| Payment Required / collection payment bridge | Existing shared method route | Return to Verification | No additional payment UI owner |
| Payment Method / `pos_payment_method_screen.dart` and `payment_method/widgets/` | ContinuePaymentButton; existing FilledButton | Back, selectable methods | Theme primary; shared neutral disabled tokens; customer-action hint now theme primary |
| Cash / `pos_cash_payment_screen.dart` and `cash_payment/` | CashPaymentActionButton; existing FilledButton | Back outline, quick amounts/selectable, Clear | Theme primary; neutral disabled/loading; success/info/error use semantic tokens |
| Payment Success / `collection_payment_success_screen.dart` | Continue to Handover, PosPrimaryActionButton | Guarded back behavior | Semantic success icon; CTA theme primary; zero collection calls |
| Handover / `collection_handover_screen.dart` | Confirm, PosPrimaryActionButton | Back to Verification | Checklist disables confirm; submitting blocks duplicate calls; error semantic |
| Collection Complete / `collection_complete_screen.dart` | Print Receipt, PosPrimaryActionButton | View Details, Back to Orders | Semantic success; print loading guard; prepaid routes to matching history |
| Receipt/reprint / `pos_receipt_history_screen.dart` | Existing controlled reprint FilledButton | Cancel reason / dismiss | Existing theme and authorization; no payment/collection mutation |

Default orange-like and alternate pink-like themes pass automated collection screen checks at 1280×800, 1180×820 and 1100×700. Payment Success tests additionally assert rendered primary color, semantic green and no collection call. Shared Payment Method/Cash action tests assert both themes for enabled, disabled and loading modes. Smaller sizes are **AUTOMATED PASS / LIVE NOT RUN**. Live 1280×800 exercised the collection/payment/receipt surfaces; no clipping or hidden primary action was observed. No RenderFlex exception occurred in the matrix.

### Source changes for final closure

Paths below are relative to the Flutter repository; earlier Chunk 2 implementation and unrelated dirty work were preserved.

- `lib/shared/widgets/pos_action_buttons.dart`: default primary follows active tenant primary instead of a fixed gradient; existing explicit overrides remain supported.
- `lib/features/fulfilment_pickup/presentation/providers/pos_online_order_collection_provider.dart`: dedicated paymentSuccess phase and authoritative settled validation.
- `lib/features/fulfilment_pickup/presentation/screens/collection_payment_success_screen.dart`: payment receipt amounts/reference, semantic success, explicit handover continuation; no completion mutation.
- `lib/features/fulfilment_pickup/presentation/screens/collection_complete_screen.dart`: actual print dispatch with loading protection, or prefiltered existing receipt history for prepaid.
- `lib/features/fulfilment_pickup/presentation/screens/collection_qr_scan_screen.dart`, `collection_verification_screen.dart`, `collection_handover_screen.dart`, `collection_qr_rejected_screen.dart`, `ready_for_collection_screen.dart`: theme step/status styling and semantic state colors.
- `lib/features/fulfilment_pickup/presentation/widgets/collection/collection_scan_widgets.dart`, `collection_verification_widgets.dart`: scanner/theme accents and semantic warning/error/info.
- `lib/features/pos_shell/pos_shell_router.dart`: guarded payment-success route and receipt history query propagation.
- `lib/features/receipts/presentation/screens/pos_receipt_history_screen.dart`: optional initial order search.
- `lib/features/sale/presentation/screens/pos_cash_payment_screen.dart`: success and recovered collection payments use the dedicated success route without fake-cart completion.
- `lib/features/sale/presentation/screens/pos_payment_method_screen.dart`: clear collection payment context when cancelling back to verification.
- `lib/features/sale/presentation/widgets/cash_payment/cash_payment_header.dart`; `actions/cash_payment_action_button.dart`; `tender/cash_payment_amount_received_section.dart`, `cash_payment_due_change_section.dart`, `cash_payment_info_card.dart`, `cash_payment_numeric_keypad.dart`, `cash_payment_quick_amounts_section.dart`: replace local status/neutral colors with existing tokens; canonical disabled cash action.
- `lib/features/sale/presentation/widgets/payment_method/widgets/payment_top_bar_content.dart`; `payment_selection/payment_info_card.dart`, `payment_method_header.dart`, `payment_methods_section.dart`, `payment_total_due_card.dart`; `sale_summary/customer_card.dart`, `payment_change_customer_button.dart`, `payment_financial_summary.dart`, `sale_summary_card.dart`; `totals/continue_payment_button.dart`, `payment_totals_card.dart`: existing semantic/neutral tokens, theme primary hints/header/total, neutral disabled continue action.
- Tests: `test/features/online_orders/collection/collection_customer_flow_test.dart`, `test/features/sale/collection_payment_theme_test.dart`, `test/features/sale/pos_primary_action_button_test.dart`, `test/shared/widgets/pos_action_buttons_test.dart`.

### Final verification

| Check | Final result |
|---|---|
| Full Flutter analyze | PASS — no issues |
| Collection focused | 27 passed / 0 failed / 0 skipped |
| Shared payment theme states | 6 passed / 0 failed / 0 skipped |
| Receipt/software print and shared buttons | 35 passed / 0 failed / 0 skipped |
| Online Order regression | 176 passed / 0 failed / 0 skipped |
| Payment regression, after final token fixes | 235 passed / 0 failed / 0 skipped |
| Flutter runtime error filter after emulator recovery | No matching Flutter/Android fatal errors |
| Development API failure/HTTP 500 log filter | No matching failure or HTTP 500 entries |
| git diff --check | PASS for frontend and this tracker; unrelated existing Second Brain whitespace issue noted below |

Logs: Flutter `.codex-tmp/closure-analyze.log`, `closure-focused.log`, `closure-payment-theme.log`, `closure-receipt-buttons.log`, `closure-online-orders.log`, `closure-payment-final.log`. Safe live Payment Success screenshot: workspace `.tmp/closure-payment-success.png`. Read-only DB verifier: workspace `.tmp/collection-db-proof.ps1`. No QR values are contained in this tracker.

NOT READY valid-QR acceptance is **NOT APPLICABLE**: canonical QR issuance happens at READY. Manual entry accepts the opaque token, not an order reference that bypasses issuance. Earlier API rejection evidence remains valid. Physical HID and printer are NOT TESTED; physical card terminal is OUT OF RELEASE. These exclusions do not block software closure. Other Second Brain files were not changed by this final closure.

The repository-wide Second Brain diff check reports an existing extra EOF blank line in `07_UI_UX_KNOWLEDGE/Cashier/Prototypes/06.oo05_review_pack_production_prototype_v1/README_COMPONENT_MAP.md:91`. That unrelated file was preserved. The scoped tracker diff check passes.

Remaining software blockers: **NONE**. Commit/push: **NOT PERFORMED**.
