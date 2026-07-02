<!-- title: Flutter Hardware Payment Receipt -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


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

## Receipt Rule

Receipt templates may be cached locally.

Receipt print can work offline for offline-safe cash sale receipts, but final
backend receipt/order state is confirmed after sync.

## Payment Rule

Card and QR payments require backend/provider validation.

Do not finalize card/QR payment offline.

## Cash Drawer Rule

Cash drawer actions require permission, till context, and audit where supported.

## Hardware Config Cache

Hardware configuration may be stored in memory and local cache for fast POS
startup.

It must be refreshed when backend configuration changes.

## Error Handling

Show practical messages:

- Printer not connected.
- Drawer not available.
- Scanner unavailable.
- Payment requires online connection.
- Receipt template missing.
- Device not trusted.

## Related Files

- [[Flutter_Local_Storage_Cache]]
- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_Error_Handling]]
