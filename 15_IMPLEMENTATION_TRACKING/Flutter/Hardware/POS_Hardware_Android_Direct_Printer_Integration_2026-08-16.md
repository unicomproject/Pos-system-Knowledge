<!-- title: POS Hardware Android Direct Printer Integration 2026-08-16 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# POS Hardware — Android Direct USB / Bluetooth Receipt Printer Integration (2026-08-16)

## Result

```text
SOFTWARE IMPLEMENTATION: PASS — ANDROID DIRECT RECEIPT PRINTER SOFTWARE INTEGRATION COMPLETE
Physical Android tablet + USB/Bluetooth printer acceptance: NOT VERIFIED
Overall hardware production readiness: STILL BLOCKED
```

## Architecture correction

### Before (incorrect primary implication)

```text
Android POS → LAN → Windows LocalPrintAgent → USB printer
```

### After (canonical)

**Primary Android production path**

```text
Flutter POS
 → ReceiptPrinterAdapter
   ├── UsbReceiptPrinterAdapter → Android USB Host → USB-C hub / USB → ESC/POS
   └── BluetoothReceiptPrinterAdapter → Bluetooth Classic RFCOMM/SPP → ESC/POS
```

**Optional Windows path (preserved)**

```text
Flutter / Windows POS
 → LocalPrintAgentClient
 → E_POS.LocalPrintAgent
 → Windows RAW spooler
 → Receipt printer
```

Canonical rule: Android tablet production does **not** require Windows LocalPrintAgent
to print to a directly attached USB-C or Bluetooth ESC/POS printer.

## HTTPS scope

| Deployment | LocalPrintAgent HTTPS |
|---|---|
| Android direct USB / Bluetooth | **NOT APPLICABLE** |
| Android → LAN → LocalPrintAgent | **REQUIRED** (trusted cert; no trust-all) |

## Implementation summary

| Area | Detail |
|---|---|
| Native bridge | `ReceiptPrinterPlugin.kt` MethodChannel `com.nytroz.pos/receipt_printer` |
| USB | Discovery (bulk OUT), permission, multi-device identity, chunked bulkTransfer, timeouts |
| Bluetooth | Classic SPP UUID `00001101-0000-1000-8000-00805F9B34FB`, bonded selection, connect/write/disconnect |
| ESC/POS | Existing `EscPosReceiptGenerator` reused; transports send bytes only |
| Concurrency | `DirectPrinterWriteGate` serializes writes; no blind retry |
| UI | Hardware Testing Android Direct Printer card (discover / save / test print) |
| LocalPrintAgent | Preserved; optional Windows path |

## Physical evidence

```text
Real Android tablet tested: NO
Real USB-C hub tested: NO
Real USB printer tested: NO
Real Bluetooth printer tested: NO
Emulator: NOT evidence of USB Host / BT printer acceptance
```

## Automated tests

```text
Focused android_direct_receipt_printer_test + hardware suite: 57 passed, 1 skipped
Full flutter test: 1094 passed, 1 skipped
flutter build apk --debug: PASS (app-debug.apk)
```

## Remaining physical acceptance

USB-01..USB-13 and BT-01..BT-13 on a real Android tablet with physical printers.
Do not mark receipt printer production-ready until those pass.
