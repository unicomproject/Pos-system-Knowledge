<!-- title: POS Hardware Checkout Receipt Print Manual Policy Fix 2026-08-16 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# POS Hardware — Checkout Receipt Print (Manual Policy) Fix 2026-08-16

## Verdict

```text
FIXED — CHECKOUT RECEIPT AUTO-PRINT + PRINT-AGAIN ENABLED
```

## Canonical intended behaviour

```text
AUTO PRINT + MANUAL PRINT-AGAIN
```

Product decision 2026-08-16 (operator request): sale completion must auto-print;
Payment Success button must also print (retry original or print-again).

## Actual checkout flow

```text
pos_cash_payment_screen.startPayment
→ recordCheckoutPayment
→ unawaited(triggerCheckoutReceiptAutoPrint)  // original, exactly-once
→ navigate Payment Success
→ Print Receipt / Print Again
   → idle: startCompletedSaleOriginalPrint (no duplicate if auto already ran)
   → failed: retryPrint
   → printed: printAgainFromPaymentSuccess (new reprint identity)
→ PosReceiptPrinterService → selectAdapter → USB / BT / LocalPrintAgent
```

## Root cause (manual path broken)

```text
File: print_receipt_actions.dart
Method: executeReceiptPrint
Current behaviour (before fix): only retryPrint when canRetryPrint
Why print did not happen: post-checkout print state is idle; first original never started
```

## Fix

| File | Change |
|---|---|
| `pos_cash_payment_success_provider.dart` | Retain `authoritativePayment` on success data |
| `print_receipt_actions.dart` | Idle → map + `printAutomatically`; printed → no duplicate; failed → `retryPrint` |
| `completed_sale_print_provider.dart` | Document `printAutomatically` as manual exactly-once original entry |
| `payment_success_print_action_test.dart` | Focused contract tests |
| `payment_success_receipt_preview_test.dart` | Expect new unavailable snackbar (no dialog) |

## Tests / builds

| Check | Result |
|---|---|
| Focused print action tests | PASS |
| Full `flutter test` | PASS (1098 passed, 1 skipped after fix) |
| `flutter analyze` (changed files) | No issues |
| `flutter build apk --debug` | PASS |
| Physical checkout print | NOT VERIFIED PHYSICALLY |

## Backend

```text
Backend modified: NO
```

## Remaining gaps

- Physical checkout → Print Receipt → POS80 / Android USB/BT paper evidence still open.
- Overall hardware module remains **BLOCKED — HARDWARE NOT PRODUCTION READY**.
