<!-- title: Flutter Hardware Payment Receipt -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->
# Flutter Hardware Payment Receipt

## Purpose

This file defines Flutter hardware, payment, and receipt rules.

OneVerz POS supports low-cost POS devices and peripherals where supported by the app
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

One shared backend; each activated POS device has its own local printer
configuration keyed by `deviceId` in secure storage
(`pos.device.{deviceId}.printerConfig`).

Facade: `PosReceiptPrinterService`

Adapters (exactly one selected per print):

- `UsbReceiptPrinterAdapter`
- `BluetoothReceiptPrinterAdapter`
- `NetworkReceiptPrinterAdapter`
- `LocalPrintAgentAdapter`

For Local Print Agent, Flutter sends typed authoritative receipt data and the
.NET `EscPosReceiptBuilder` owns final ESC/POS bytes and RAW spooler delivery.
`EscPosReceiptGenerator` remains the manual generator for direct adapters. Both
support 58/80 mm but duplicate generator drift is an active maintenance risk.

Print order:

1. `receipts.print` permission
2. Authoritative Completion GET data
3. Load current device printer config
4. Select one adapter
5. Connect / status
6. Persist durable print operation and stable request identity
7. Local Agent adapter/client sends receipt contract over authenticated LAN HTTP
8. On local success → `POST /api/v1/pos/receipts/{saleId}/print` audit
9. Show Receipt printed

Physical print success + audit failure → audit-only retry (no automatic reprint).

Direct USB/Bluetooth are fail-safe unsupported paths. Direct TCP remains
separate and must never be a Local Agent fallback.

## Receipt Rule

Receipt templates may be cached locally for preview only.

Final Return/Exchange success values always come from Completion GET.

Receipt print can work offline for offline-safe cash sale receipts, but final
backend receipt/order state is confirmed after sync.

## Payment Rule

Card and QR payments require backend/provider validation.

Do not finalize card/QR payment offline.

Never display full PAN, CVV, or provider tokens on receipts or Step 10 UI.

### Chunk 1B state (2026-07-29)

Flutter consumes backend receipt contract v2 and does not infer tender, tax or
discount allocations. Automatic receipt printing resolves intended copies from
the completed receipt policy, creates one stable request identity per
`receiptId + copyType + copyIndex + purpose`, and audits each copy independently.
The safe default is one customer copy and no merchant copy.

Card selection must not be treated as cash. The backend production gateway is
currently unavailable-by-default, so the cashier receives a not-configured
failure and the sale is not completed. A real card-terminal adapter and the
split-payment UI/controller remain pending.

## Device Security And LAN

- Local Agent base URL and timeout are device configuration.
- API key is stored through secure storage and is never written to recovery state.
- Blank key edits preserve the existing saved secret.
- Private LAN CIDR allow-list and `X-Local-Print-Key` are both required.
- No silent POST retry is allowed after timeout; use operation lookup.
- Android debug may use explicitly scoped clear-text LAN HTTP. Release keeps
  clear-text disabled and requires trusted HTTPS for production.

## Receipt Contract And Copies

- Flutter sends Agent API version `1` and receipt contract version `2`.
- Agent accepts receipt contract v1 for backward compatibility.
- Backend owns receipt number, lines, tenders, safe card display, discounts,
  tax lines, totals, copy policy and historical reprint snapshot.
- Automatic copies use stable identity per receipt/copy type/index/purpose.
- Device receipt-printer configuration persists supported purposes and
  customer/merchant copy counts. One customer and zero merchant remains the
  fail-safe default when no usable policy is configured.

### Hardware Chunk 2 state (2026-07-29)

- Sale original/reprint and return/exchange/refund completion requests use the
  structured Local Print Agent HTTP adapter; Local Agent never falls back to
  direct TCP or Flutter-generated RAW bytes.
- Requests carry purpose, receipt/configuration identity, references, item
  groups, settlement lines and stable copy/request identity.
- `receipt_print_logs` stores the selected route/configuration snapshot and
  typed result/failure/unknown recovery context.
- Timeout/partial output requires operation lookup or operator decision.
  Confirmation is an audit-only linked record and does not print again.
- Historical controlled reprint acceptance for non-sale receipt purposes and
  the complete physical copy/error matrix remain pending.
- Status: `PARTIALLY IMPLEMENTED / RUNTIME VERIFICATION REQUIRED`.

### Hardware Chunk 2C state (2026-07-29)

Receipt History now branches by persisted receipt type. Sale continues through
the completed-sale reprint controller; issued Refund/Return and Exchange
snapshots map to `ReturnReceipt` and the structured non-sale Agent contract.
The mapper is case-insensitive for legacy snapshot property casing and does not
perform current-price/tax lookups.

`NonSaleReceiptPrintOrchestrator` resolves device policy, builds deterministic
copy identities, prints each intended copy once, submits independent audits and
aggregates all/partial/unknown/audit-pending states. Audit-only retry resubmits
only stored audit payloads. Agent output uses `RETURN REPRINT`, `REFUND
REPRINT`, or `EXCHANGE REPRINT` labels.

Code and automated acceptance are implemented. Physical POS80 acceptance is
pending, so the status is `IMPLEMENTED — PHYSICAL ACCEPTANCE PENDING`.

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

### Hardware Chunk 3 scanner boundary (2026-07-29)

Scanner configuration/tests reuse Hardware Chunk 1 APIs. Hardware Testing never
calls cart state. Receipt barcode acceptance must compare the exact POS80
printed value with TB-00D and camera where available; generated-byte tests are
not physical acceptance for scanner or printer.
