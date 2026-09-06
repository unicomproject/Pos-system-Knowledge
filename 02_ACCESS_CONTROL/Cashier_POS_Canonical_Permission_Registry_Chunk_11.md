<!-- title: Cashier POS Canonical Permission Registry — Chunk 11 -->
<!-- status: Active — Payment Method / Cash / Card / QR / Split / Completion / Receipt Visibility -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-05 -->

# Cashier POS Canonical Permission Registry — Chunk 11

## Result

| Field | Value |
| --- | --- |
| Result | **PASS** |
| New canonical codes | **0** |
| Backend / DB changes | **NONE** |
| Schema / seed changes | **NO** |

## 1. Payment permission architecture

| Concern | Authority |
| --- | --- |
| Authoritative permission source | Backend Chunk 5 effective permissions → `AuthSession.permissionCodes` |
| Flutter helper/gate | `EffectivePermissionSet` / `effectivePermissionSetProvider` / `PermissionGate` / `PosPaymentPermissionVisibility` |
| Permission denial behavior | Protected UI element **does not render** (no disabled placeholders / blank slots) |
| Business-state ordering | Permission first, then terminal/processing/business state |
| Backend final authority | Chunk 6 payment authorization |
| Sensitive-data authority | Chunk 7 DTO filtering |
| Parent inference in Flutter | **NONE** — exact membership only |

## 2. Payment Method matrix

| Method / Component | Exact Canonical Permission | Denied | Granted |
| --- | --- | --- | --- |
| Methods container | `pos.checkout.methods.container` (+ checkout.execute compat) | section absent | section may render |
| Cash | `pos.payments.cash.accept` | tile absent | tile may render |
| Card | `pos.payments.card.accept` | tile absent | tile may render |
| QR | `pos.payments.qr.accept` | tile absent | tile may render |
| Split | `pos.payments.split.accept` | tile absent | tile may render |
| Summary items | `pos.checkout.summary.items` | absent | render |
| Summary qty | `pos.checkout.summary.quantity` | absent | render |
| Summary price | `pos.checkout.summary.price` | NO_UI_SURFACE dedicated column (line_total used for Amount) | — |
| Summary line total | `pos.checkout.summary.line_total` | absent | Amount column |
| Subtotal / Discount / Tax / Total | `pos.checkout.summary.{subtotal\|discount\|tax\|total}` | absent | render |
| Customer summary | `pos.checkout.customer.summary` | card absent | card may render |
| Tile chrome children | `pos.checkout.methods.{cash\|card\|qr\|split}_tile` | NO_UI_SURFACE separate from accept tile filter (method uses accept) | catalog exists |

## 3. Method independence

| Check | Result |
| --- | --- |
| Cash authorizes Card | **NO** |
| Card authorizes Cash | **NO** |
| QR authorizes Split | **NO** |
| Split authorizes QR | **NO** |
| Cash parent auto-renders Exact Cash | **NO** |
| Cash parent auto-renders all Numpad keys | **NO** |

## 4. Dynamic reflow

| Count | Behavior |
| --- | --- |
| 4 / 3 / 2 / 1 | Equal grid builds only permitted tiles; no empty slots |
| 0 | Safe empty state: “No available payment methods” |
| Static index dependency | **NONE** — stable enum identifiers |
| Selected denied-method | Selection cleared on refresh; continue disabled |

## 5. Cash payment matrix (key mappings)

| Control | Exact Canonical |
| --- | --- |
| Business entry | `pos.payments.cash.accept` |
| Order summary | `pos.cash_payment.summary.order` |
| Line item/qty/price/total | `pos.cash_payment.line.*` |
| Subtotal/discount/tax/total due | `pos.cash_payment.summary.*` |
| Amount received view/entry | `pos.cash_payment.tender.amount_received_{view\|entry}` |
| Due amount | `pos.cash_payment.tender.due_amount` |
| Exact Cash | `pos.cash_payment.tender.exact` |
| Change due | `pos.cash_payment.tender.change_due` |
| Quick container / slots | `pos.cash_payment.quick_amounts.{container\|slot_1\|2\|3}` |
| Numpad container | `pos.cash_payment.numpad.container` |
| Digits 0–9 / 00 / decimal | `pos.cash_payment.numpad.digit_*` / `decimal` |
| Backspace / Clear | `pos.cash_payment.controls.{backspace\|clear}` |
| Complete sale | `pos.cash_payment.completion.execute` (+ cash.accept) |

## 6. Exact Cash

| Field | Value |
| --- | --- |
| Canonical | `pos.cash_payment.tender.exact` |
| Denied | Exact quick-amount card absent; no alternate shortcut |
| Granted | Exact card may render |
| Parent-only | Cash accept alone → Exact absent |

## 7. Numpad security

| Bypass | Count |
| --- | --- |
| Hidden key still tappable | **0** |
| Physical keyboard digit/decimal/backspace/clear/enter when denied | **0** (Focus handler swallows unauthorized tender-mutating keys) |

Layout: denied keys omitted; remaining digits reflow in rows of 3; side column backspace/clear only when permitted.

## 8. Card / QR / Split UI

| Surface | Status |
| --- | --- |
| Card screen | Placeholder gated by `pos.payments.card.accept` |
| QR screen | Placeholder gated by `pos.payments.qr.accept` |
| Split screen | Placeholder gated by `pos.payments.split.accept` |
| Fine-grained child codes | **NO_CANONICAL_MAPPING** / **NO_UI_SURFACE** (catalog has accept + method tiles only) |
| Split↔submethod | N/A until Split UI implements portions; backend Chunk 6 remains authoritative |

## 9. Sale complete matrix

| Element | Canonical |
| --- | --- |
| Success message | `pos.sale_complete.message.success` |
| Receipt number / method / datetime / cashier / customer | `pos.sale_complete.details.*` |
| Cash received / change due / total paid | `pos.sale_complete.details.*` |
| Print | `pos.receipts.physical.print` (+ legacy `receipts.print`) |
| Print Again / Reprint | `pos.receipts.history.reprint` (+ legacy `receipts.reprint`) |
| Start New Sale | New Sale access codes (`pos.sales.new_sale.view` family) |
| Email / SMS actions | **NO_CANONICAL_MAPPING** (email route uses digital.view / receipt view compat only) |

## 10. Receipt preview matrix

Thermal preview gates `pos.receipts.details.*` (store, receipt number, datetime, cashier, customer, terminal, payment method, items, qty, value, rate, subtotal, discount, total, paid, change).

Tax line on preview: **NO_CANONICAL_MAPPING** (left as operational display when totals section otherwise visible).

Legal ESC/POS print payload **not** altered by Chunk 11.

## 11. Print vs Reprint

| Check | Result |
| --- | --- |
| Print authorizes Reprint | **NO** |
| Auto-print after checkout | Unchanged business config path; UI Print button still permission-gated |
| Legal receipt behavior changed | **NO** |

## 12. Permission refresh

Runtime `effectivePermissionSetProvider` updates hide/show payment tiles, Exact Cash, numpad keys, receipt fields, Print/Reprint without app restart.

Full route-guard overhaul: **NOT implemented** (deferred).

## 13. Multi-device

Phone / Tablet / Desktop share the same logical gates; only layout breakpoints differ. **No device-specific permissions.**

## 14. Full-access regression

Fully authorized cashier retains New Sale → Cart → Payment Method → Cash/Card/QR/Split → Success → Receipt → New Sale flow (Card/QR/Split remain placeholders where previously placeholders).

## 15. Deferred / out of scope

- Chunk 12 Customers / Orders / Returns — **NOT implemented**
- Chunk 13 Cash Drawer / Till — **NOT implemented**
- Full route-guard overhaul — **NOT implemented**
- Tenant Admin UI — **NOT modified**

## 16. Canonical freeze

| Added | Removed | Renamed | Invented |
| --- | --- | --- | --- |
| 0 | 0 | 0 | NO |

## 17. NO_CANONICAL_MAPPING / NO_UI_SURFACE

- Card/QR/Split fine-grained screen children (retry, regenerate, portion edit, etc.)
- Email / SMS receipt delivery action codes on sale-complete
- Receipt preview tax field independent code
- Checkout summary dedicated unit-price column UI (price code mapped conceptually; Amount uses line_total)
- Method tile chrome codes not used as independent filter (business accept drives tiles)

## 18. Tests

`test/features/pos_shell/chunk11_payment_permission_matrix_test.dart` — method independence, Exact Cash, quick amounts, numpad, completion, print/reprint, receipt fields.
