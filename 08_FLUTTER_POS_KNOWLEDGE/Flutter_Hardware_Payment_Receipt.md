<!-- title: Flutter Hardware Payment Receipt -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-18 -->


# Flutter Hardware Payment Receipt

## Purpose

This file defines Flutter hardware, payment, and receipt rules.

TM-EPOS supports low-cost POS devices and peripherals where supported by the app
platform and hardware integration.

## Hardware Scope

| Hardware | Flutter Responsibility |
|---|---|
| Receipt printer | Connect, print, reprint, status |
| Barcode scanner | Scan product barcodes |
| Cash drawer | Open where supported and permitted |
| Card reader/payment machine | Trigger/record provider-supported flow |
| Device profile | Load tenant/outlet/till hardware config |

## Receipt Printer Architecture (Step 10)

One shared backend; each trusted POS device has its own local printer
configuration keyed by `deviceId` in secure storage
(`pos.device.{deviceId}.printerConfig`).

Facade: `PosReceiptPrinterService`

Adapters (exactly one selected per print):

- `UsbReceiptPrinterAdapter`
- `BluetoothReceiptPrinterAdapter`
- `NetworkReceiptPrinterAdapter`

Generator: `EscPosReceiptGenerator` — formats Completion GET values only
(58mm / 80mm). Does not recalculate totals.

Print order:

1. `receipts.print` permission
2. Authoritative Completion GET data
3. Load current device printer config
4. Select one adapter
5. Connect / status
6. Generate ESC/POS bytes
7. Send bytes
8. On local success → `POST /api/v1/pos/receipts/{saleId}/print` audit
9. Show Receipt printed

Physical print success + audit failure → audit-only retry (no automatic reprint).

**PHYSICAL_PRINTER_VERIFICATION: NOT_VERIFIED** for USB, Bluetooth, and Network.

## Receipt Rule

Receipt templates may be cached locally for preview only.

Final Return/Exchange success values always come from Completion GET.

Receipt print can work offline for offline-safe cash sale receipts, but final
backend receipt/order state is confirmed after sync.

## Payment Rule

Card and QR payments require backend/provider validation.

Do not finalize card/QR payment offline.

Never display full PAN, CVV, or provider tokens on receipts or Step 10 UI.

## Cash Drawer Rule

Cash drawer actions require permission, till context, and audit where supported.

## Hardware Config Cache

Hardware configuration may be stored in memory and local cache for fast POS
startup.

It must be refreshed when backend configuration changes.

Per-device printer identifiers (USB IDs, Bluetooth address, network host) must
not be shared across devices.

## Error Handling

Show practical messages:

- Printer not connected / not configured.
- Unsupported transport on this platform.
- USB permission denied / device disconnected.
- Bluetooth disabled / unpaired / connection failure.
- Invalid network host / unreachable / timeout.
- Drawer not available.
- Scanner unavailable.
- Payment requires online connection.
- Receipt template missing.
- Device not trusted.
- Print audit could not be recorded (after physical success).
