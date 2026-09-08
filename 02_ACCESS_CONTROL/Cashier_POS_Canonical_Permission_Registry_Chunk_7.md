<!-- title: Cashier POS Canonical Permission Registry — Chunk 7 -->
<!-- status: Active — Sensitive DTO / Field-Level Response Filtering -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Cashier POS Canonical Permission Registry — Chunk 7

## 1. Sensitive response filtering architecture

```
Repository/domain data (unfiltered)
        ↓
Application service (Chunk 6 endpoint auth already passed)
        ↓
PosSensitiveResponseFilter (explicit typed shapers)
        ↓
Filtered DTO (nullable sensitive fields → null when denied)
        ↓
JSON serializer → client
```

- Filter location: application/response shaping (`PosSensitiveResponseFilter`)
- Does **not** mutate persisted/domain entities
- Does **not** recalculate role hierarchy / entitlement (uses Chunk 5 effective set on `TenantRequestContext`)
- Fail-closed: missing permission / missing context → null (never invent 0 / REDACTED)

## 2. Effective-permission source

`TenantRequestContext.HasPermission(code)` — JWT effective permissions from Chunk 5 resolver (+ alias Expand only).

DTO filtering checks **exact child** sensitive field codes. No parent→child inference.

## 3. Sensitive catalog count

| Metric | Count |
| --- | --- |
| Role-assignable `IsSensitive == true` | **60** |
| Of which `SemanticType == SensitiveField` | **50** |
| Of which sensitive `Input` (write-entry / PIN) | **10** |

Source: `CashierPosCanonicalPermissionCatalog`. Codes mirrored for filtering in `CashierPosSensitiveFieldCodes` (no new codes).

## 4. Unauthorized representation rule

**Option B — NULL** (property present with JSON `null`).

Rationale: existing clients often expect property keys; null avoids fake numeric/string business values.

## 5. Complete sensitive permission → DTO field mapping

### Classification legend

| Class | Meaning |
| --- | --- |
| NEWLY_FILTERED | Chunk 7 shapes response |
| WRITE_INPUT_ONLY | Request/input capability; not a response field |
| NO_ENDPOINT | No POS API currently returns this metric |
| NOT_RETURNED_BY_API | Catalog field; DTO lacks property |
| INTERNAL_ONLY | Never serialized (e.g. manager PIN never returned) |

### A. Customer PII

| Canonical Permission | Parent | Endpoint / DTO | Field(s) | Class | Unauthorized |
| --- | --- | --- | --- | --- | --- |
| `pos.customers.list.phone` | management.view | List/Get/Create/Update/Attach → `PosCustomerListItemResponseDto` / Attach DTO | `Phone` | NEWLY_FILTERED | NULL |
| `pos.customers.list.email` | management.view | same | `Email` | NEWLY_FILTERED | NULL |
| `pos.customers.list.total_spend` | management.view | List/Get → list item | `TotalSpentAmount`, `CurrencyCode`, `IsMixedCurrencySpend` | NEWLY_FILTERED | NULL / false |
| `pos.customers.history.purchase_history` | management.view | GetOrders → `PosCustomerOrdersResponseDto` | `Items` (empty if denied) | NEWLY_FILTERED | empty list |
| `pos.customers.history.recent_purchases` | management.view | GetOrders (OR with purchase_history) | same | NEWLY_FILTERED | empty list |
| `pos.customers.history.purchase_amounts` | management.view | order rows | `TotalAmount` | NEWLY_FILTERED | NULL |
| `pos.customers.details.average_order_value` | management.view | — | — | NOT_RETURNED_BY_API | — |

### B. POS Home / session summary

| Canonical Permission | Class | Notes |
| --- | --- | --- |
| `pos.home.session_summary.total_sales` | NO_ENDPOINT | Not on POS home API DTOs |
| `pos.home.session_summary.discounts` | NO_ENDPOINT | Same |
| `pos.home.session_summary.net_sales` | NO_ENDPOINT | Same |

### C–E. Cart / Checkout / Payment / Sale complete / Receipt

| Canonical Permission | DTO | Field(s) | Class | Unauthorized |
| --- | --- | --- | --- | --- |
| `pos.cart.summary.discount` | `PosCheckoutBillingSummaryDto` (cart calc) | `Discount`, `AutomaticDiscount`, `ManualDiscount` | NEWLY_FILTERED | NULL |
| `pos.cart.summary.total` | same | `TotalPayable` | NEWLY_FILTERED | NULL |
| `pos.checkout.summary.discount` | billing (checkout summary / recall) | discount fields | NEWLY_FILTERED | NULL |
| `pos.checkout.summary.total` | billing | `TotalPayable` | NEWLY_FILTERED | NULL |
| `pos.cash_payment.summary.discount` | `PosCheckoutStartPaymentResponseDto` | `DiscountTotal`, `DiscountLines` | NEWLY_FILTERED | NULL |
| `pos.cash_payment.summary.total_due` / `tender.due_amount` | payment | `GrandTotal` | NEWLY_FILTERED | NULL |
| `pos.cash_payment.tender.amount_received_view` | payment | `CashReceived`, tender `AmountTendered` | NEWLY_FILTERED | NULL |
| `pos.cash_payment.tender.change_due` | payment | `ChangeDue`, tender `ChangeAmount` | NEWLY_FILTERED | NULL |
| `pos.cash_payment.tender.amount_received_entry` | — | — | WRITE_INPUT_ONLY | — |
| `pos.sale_complete.details.customer` | payment | `CustomerId`, `CustomerName` (+ phone gated by list.phone) | NEWLY_FILTERED | NULL |
| `pos.sale_complete.details.cash_received` | payment | `CashReceived` | NEWLY_FILTERED | NULL |
| `pos.sale_complete.details.change_due` | payment | `ChangeDue` | NEWLY_FILTERED | NULL |
| `pos.sale_complete.details.total_paid` | payment | `GrandTotal` | NEWLY_FILTERED | NULL |
| `pos.receipts.details.customer` | receipt detail | — | NOT_RETURNED_BY_API | Gap: no customer props on `PosReceiptDetailDto` |
| `pos.receipts.details.payment_method` | detail + search | `PaymentMethod`, tender method fields | NEWLY_FILTERED | NULL |
| `pos.receipts.details.discount` | detail | `DiscountAmount`, `DiscountLines` | NEWLY_FILTERED | NULL |
| `pos.receipts.details.total` | detail + search | `TotalAmount` | NEWLY_FILTERED | NULL |
| `pos.receipts.details.paid_amount` | detail | `PaidAmount` | NEWLY_FILTERED | NULL |
| `pos.receipts.details.change_due` | detail | `ChangeAmount` | NEWLY_FILTERED | NULL |

**Receipt preview vs print:** Preview/search/detail API responses are filtered. Authorized print/reprint workflows remain Chunk 6 action-gated; print agent payloads are not stripped by UI field permissions when executing an authorized print. `ReceiptDataJson` / `HistoricalSnapshot` are nulled on preview when any sensitive receipt field is denied (prevents nested JSON leak).

### F–G. Cash drawer / movements

| Canonical Permission | DTO | Field | Class | Unauthorized |
| --- | --- | --- | --- | --- |
| `pos.cash_drawer.summary.opening_cash` | `PosCashDrawerSummaryDto` | `OpeningCash` | NEWLY_FILTERED | NULL |
| `pos.cash_drawer.summary.cash_sales` | summary | `CashSales` | NEWLY_FILTERED | NULL |
| `pos.cash_drawer.summary.expected_cash` | summary | `CurrentExpectedCash` | NEWLY_FILTERED | NULL |
| `pos.cash_drawer.movements.amount_view` | `PosCashDrawerMovementDto` | `Amount` | NEWLY_FILTERED | NULL |
| `pos.cash_movements.*.expected_cash` / `available_cash` / `resulting_balance` | summary + movement `CurrentExpectedCash` | shared aliases | NEWLY_FILTERED | NULL |
| `pos.cash_movements.*.amount_entry` | — | — | WRITE_INPUT_ONLY | — |
| `pos.cash_movements.*.manager_pin` | — | — | INTERNAL_ONLY / WRITE_INPUT_ONLY | Never returned |

### H–I. Till

| Canonical Permission | DTO | Field | Class | Unauthorized |
| --- | --- | --- | --- | --- |
| `pos.till.opening.starting_cash_view` | current/closed session | `OpeningFloat` | NEWLY_FILTERED | NULL |
| `pos.till.opening.starting_cash_entry` | — | — | WRITE_INPUT_ONLY | — |
| `pos.till.closing.expected_cash` / `expected_cash_summary` | closed (+ current expected) | `ExpectedCash` | NEWLY_FILTERED | NULL |
| `pos.till.closing.counted_cash_entry` | — | — | WRITE_INPUT_ONLY | — |
| `pos.till.closing.counted_cash_summary` | closed | `CountedCash` | NEWLY_FILTERED | NULL |
| `pos.till.closing.difference` / `difference_summary` | closed | `CashDifference` | NEWLY_FILTERED | NULL |

### Held sales

| Canonical Permission | DTO | Field | Class | Unauthorized |
| --- | --- | --- | --- | --- |
| `pos.held_sales.list.value` | `PosHoldListItemDto` + lines | totals / unit prices | NEWLY_FILTERED | NULL |
| `pos.held_sales.list.summary` | `PosHoldListResponseDto` | `TotalValue` | NEWLY_FILTERED | NULL |

### Other sensitive Input

| Canonical Permission | Class |
| --- | --- |
| `pos.discount.panel.amount_entry` | WRITE_INPUT_ONLY |

## 6–15. Behaviour rules (summary)

| Topic | Rule |
| --- | --- |
| Nested DTOs | Filtered (tenders, discount lines, hold lines, order items) |
| Collections | Every row shaped the same |
| Derived leaks | Total spend aliases cleared together; AOV not returned by API (gap noted) |
| Fail-closed | Deny → null / empty |
| Cache | No new response cache; per-request shaping |
| Logging | Filter does not log field values |
| Multi-device | Same effective permissions → same filtered payload |
| Flutter UI visibility | **NOT** implemented |
| Flutter route guards | **NOT** implemented |
| Tenant Admin UI | **NOT** implemented |

## 16. Flutter nullable / parser compatibility

Minimal model/parser nullability only (no PermissionGate / no widget hide):

- `pos_customer.dart` — `totalSpentAmount`, order `totalAmount` nullable
- Cash drawer summary/movement amounts nullable + format helper accepts null → `—`
- Till session / closed session cash fields nullable parsers

## 17. Permission-code freeze

Added / removed / renamed canonical codes: **0**.

## 18. Chunk 8 deferred

- Flutter centralized PermissionGate / permission visibility
- Route guards / navigation chrome
- Home session summary API (if product adds metrics endpoint)
- Receipt customer field on detail DTO (if product adds it)
- Customer AOV response field

## 19. Residual Chunk 6 gaps (unchanged)

- Cart calculate still uses `update_item`
- Drawer finalize agent-callback auth-only
- No POS deactivate endpoint
- `pos.refund.approve` unused
