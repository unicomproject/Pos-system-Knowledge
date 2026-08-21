<!-- title: POS Receipt Canonical Preview Physical Parity 2026-08-16 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# POS Receipt Canonical Preview ↔ Physical Parity (2026-08-16)

## Verdict

```text
PARTIAL — RECEIPT SOFTWARE ALIGNMENT COMPLETE, PHYSICAL VISUAL ACCEPTANCE PENDING
```

Chunk 2 closure attempt (2026-08-16): physical paper / Android tablet gates remain
open — see [[POS_Hardware_Chunk_2_Receipt_Printer_Closure_Attempt_2026-08-16]].

## Canonical rule

```text
Receipt Preview and Physical Receipt are two renderers
of one canonical receipt presentation contract.

Semantic/business parity is mandatory.
Pixel parity is not required due to thermal printer limitations.
```

## Architecture

```text
Authoritative completed sale/payment
        ↓
CanonicalReceiptPresentationMapper
        ↓
CanonicalReceiptPresentation
   ┌────┼────┐
   ↓    ↓    ↓
Flutter  Dart  Windows
Preview  ESC/POS LocalPrintAgent
         (USB/BT) EscPosReceiptBuilder (contract v3)
```

## Checkout print policy

```text
MANUAL — Payment Success → Print Receipt
```

Auto-print is not part of this task and was removed from checkout completion.

## Field contract (order)

```text
Merchant / Brand subtitle / Outlet / Location
Receipt No
Date & Time (outlet timezone when configured)
Cashier
Customer (Walk-in Customer fallback)
Terminal
Payment (authoritative tender/method — not hardcoded Cash)

ITEM | QTY | VALUE | RATE
SKU under item

No. of Items
Subtotal
Discount (if > 0)
Tax (if > 0)
TOTAL
Paid by <Payment Method>
Change Due

Thank you for your purchase
Exchange/return policy
Barcode (receipt number payload)
```

VALUE = list/original unit price. RATE = effective unit price (lineTotal/qty).
Item-level promo lines are not printed separately when VALUE/RATE already show the difference.

## Evidence

- Flutter parity tests: `canonical_receipt_presentation_parity_test.dart`
- Customer mapping tests: `receipt_customer_mapping_test.dart`
- LocalPrintAgent tests: 50 passed (contract v3)
- Physical POS80 paper after this change: **NOT VERIFIED**

## Receipt customer authority (2026-08-16 fix)

```text
Receipt customer is derived from the completed-sale customer snapshot.

Walk-in Customer is used only for genuinely anonymous sales.

Preview, original print, and reprint must use the same customer value.
```

Root cause: `PosCheckoutStartPaymentResponseDto` omitted `CustomerName` while
`CanonicalReceiptPresentationMapper.fromPaymentSuccess` preferred
`authoritativePayment.customerName` over `success.customerName`.

Fix: backend returns `CustomerId` / `CustomerName` / `CustomerPhone` from sale
snapshot; Flutter enriches `authoritativePayment` at checkout record time and
coalesces customer name before Walk-in fallback.
