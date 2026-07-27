<!-- title: Receipt Printer Integration -->
<!-- status: Draft -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->

# Receipt Printer Integration

## Purpose

Define verified Cashier receipt generation, local transport and backend print-audit behavior.

## Current Implementation Status

Source code exists for a device-configured printer facade, ESC/POS receipt
generation and USB/Bluetooth/Network adapter boundaries. Physical printer
verification is not complete.

## Supported Platforms And Transports

| Transport | Source status | Physical status |
|---|---|---|
| Network | TCP socket transport where `dart:io` is available | Not verified on a physical printer |
| USB | Adapter boundary exists and fails safely when unsupported | Not verified |
| Bluetooth | Adapter boundary exists and fails safely when unsupported | Not verified |

## Configuration

Printer configuration is stored locally per activated `deviceId`. Paper width,
connection type and transport-specific values must come from that configuration.
The sale print-options provider still contains static printer choices and must
not be treated as authoritative hardware discovery.

## Flutter Integration

`PosReceiptPrinterService` selects one adapter and uses
`EscPosReceiptGenerator`. Backend receipt values are formatted locally; unsupported
glyphs are replaced unless a verified code-page/raster path is configured.

## Backend And API

`POST /api/v1/pos/receipts/{saleId}/print` records a successful print audit. It
does not send bytes to the physical printer.

## Database And Audit

`receipts` and `receipt_print_logs` store receipt and print-audit data.

## Security Rules

Never print or log PAN, CVV, payment tokens or unsanitized provider payloads.

## Error Handling

Audit must be called only after local transport success. If printing succeeds
and audit fails, allow audit-only retry without a second physical print.

## Testing And Physical Verification

Automated facade/adapter/error tests exist. USB, Bluetooth and Network physical
acceptance and repeated-print stability are not verified.

## Known Gaps

- Physical printer matrix.
- Verified USB and Bluetooth transport.
- Removal of static sale printer options in favour of device configuration.

## Related Files

- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Hardware_Payment_Receipt]]
- [[POS_Hardware_Integration]]
