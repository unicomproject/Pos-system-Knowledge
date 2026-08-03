<!-- title: Receipt Printer Integration -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->
# Receipt Printer Integration
## Purpose
Define the verified receipt data, Flutter orchestration, Windows Local Print
Agent, ESC/POS, audit, recovery, security, and physical-verification boundary.
## Scope
Cash completed-sale receipts, Receipt History reprints, manual non-sale tests,
58/80 mm formatting, barcode, feed/cut, Local Agent health, and print audit.

## Current Architecture
Physical Android POS → private LAN → Windows Local Print Agent → Windows RAW
spooler → laptop USB `POSPrinter POS80`. `E_POS.Api` remains authoritative for
sale/receipt data and audit; it does not communicate with the USB printer.

## Component Responsibilities
Backend commits the snapshot and audit. Flutter maps, persists, and orchestrates.
The Agent authenticates, validates, de-duplicates, builds ESC/POS, and writes RAW
bytes to the configured Windows printer.

## Runtime Flow
Completed payment → backend receipt → Flutter mapper → durable print controller
→ printer service → Local Agent adapter/client → `POST /api/print/receipt` →
validation/idempotency → ESC/POS builder → RAW spooler → result → backend audit.
Receipt History reprint reuses the immutable snapshot and same transport.

## Configuration
| Owner | Verified settings |
|---|---|
| Flutter device | transport, Agent URL, timeout, printer name; API key secure |
| Local Agent | listen URL, printer, width, auto-cut, feed lines, API key |
| Security/operations | CIDR allow-list, body limit, operation/log paths, retention |

Defaults include `http://0.0.0.0:9101`, 80 mm, auto-cut enabled, five feed lines,
and 30-day operation retention. A physical phone uses the laptop LAN address.
Never store a real API key in this knowledge base.

## API And Contract
| Route | Auth | Purpose |
|---|---|---|
| `GET /health/live` | LAN allow-list | Process liveness |
| `GET /health/ready` | LAN allow-list | Config/store/printer readiness |
| `GET /api/print/health` | Local key | Detailed safe status/capabilities |
| `GET /api/print/operations/{requestId}` | Local key | Resolve prior outcome |
| `POST /api/print/receipt` | Local key | Validate and print one receipt |
| `POST /api/v1/pos/receipts/{saleId}/print` | POS auth/permission | Audit result |

Agent API version is `1`; active receipt contract is `2`. Receipt contract v1
is accepted for backward compatibility. Unsupported explicit versions fail.

## Receipt Data Ownership
Backend `receipt_data_json` owns historical lines, safe tender allocations,
discount lines, tax code/name/rate/taxable/tax amounts, totals, barcode value,
and copy snapshot. Flutter and Agent must not recalculate financial values.
Missing or inconsistent authoritative data blocks printing.

## ESC/POS Ownership
Local Agent transport uses the .NET manual builder only. Direct transports use
Flutter `EscPosReceiptGenerator`; no third-party ESC/POS package is declared.
The two manual generators are a drift risk and must never both transform one
Local Agent request.

## Supported Transports
| Transport | Code state | Physical state |
|---|---|---|
| Local Agent → Windows RAW → USB | Implemented | POS80 output observed; release matrix incomplete |
| Direct TCP | Separate adapter | Physically unverified |
| Direct USB/Bluetooth | Fail-safe adapter boundaries | Unsupported/unverified |

## Security Rules
Use explicit private CIDRs plus constant-time `X-Local-Print-Key` validation.
Do not log the key, access tokens, PAN/CVV, raw card data, or provider secrets.
No CORS/Swagger/public exposure. Release Android clear-text remains disabled;
production requires trusted HTTPS or an explicitly approved security decision.

## Idempotency And Duplicate Prevention
Each physical attempt has stable `printRequestId`. Agent operation files survive
restart. Duplicate completed requests return the stored result and do not print
again. Flutter stores operation state before POST. Unknown outcomes are queried
or require operator decision; they are never silently resent.

## Print Audit
Audit follows confirmed local success. It records request identity, reason,
copy type/index, operator and device context. Audit-only retry never performs
another physical print. Reprint audit never creates another sale/payment.

## Error And Recovery Rules
Distinguish unreachable, unauthorized, incompatible contract, invalid request,
printer missing/offline, confirmed failure, audit failure, and unknown timeout.
Print failure never rolls back a completed sale. Paper-out/cover/jam detection
is limited to status exposed by the Windows driver/spooler.

## Paper Width And Formatting
58 mm uses 32 columns; 80 mm uses 48. Output order is final footer/newline →
`ESC d n` feed → optional full cut. Auto-cut false sends no cut command. No
printable content follows cut. Copy labels and item/order discounts are printed.

## Barcode And Cutter Support
CODE128 receipt barcode bytes and full cut are implemented in both generators.
Agent feed-before-cut is configurable. QR, raster/image, partial cut, and drawer
pulse are not implemented in the active receipt builders.

## Unicode And Tamil Status
Builders use printer-safe single-byte text. Unsupported Tamil/Unicode may become
`?`; no verified code-page or raster fallback exists. Status is Partially
Implemented and physically unverified.

## Physical Verification Status
Observed development evidence confirms Local Agent health readiness, Windows
spooler availability, and real POS80 receipt output. It does not confirm current
release acceptance for barcode scanning, corrected cutter margin, 58 mm,
paper-out/cover/jam, timeout unknown outcome, reprint, or multi-copy behavior.

## Known Limitations
Real card provider, split tender execution, tax registration/invoice label,
controlled historical return/exchange/refund reprint acceptance,
offline printing, shift reports, drawer pulse, Tamil, and printer-change rules
remain incomplete or unverified.

## Hardware Chunk 2 production-path update (2026-07-29)

Device-scoped receipt-printer configuration now owns supported receipt purposes
and customer/merchant copy counts. Checkout snapshots that policy into the
authoritative receipt; Flutter uses one stable identity per copy and the Agent
prints only the selected structured contract. Return, exchange and refund
completion printing now use the same Local Agent HTTP transport instead of the
obsolete raw-byte/unsupported branch.

The Agent contract carries receipt purpose, receipt/configuration identity,
original receipt references, returned/replacement item groups and settlement
lines. The Windows builder labels each purpose and copy, while preserving the
existing 58/80 mm financial layout and footer → feed → cut byte order.

`receipt_print_logs` now records purpose, copy index, selected configuration
identity/version, route, POS device/till/session, typed Agent result/failure and
unknown/recovery identity. Backend lookup is purpose-aware, preventing a later
refund/exchange receipt from being selected for a sale-original audit.

Timeout or partial/unknown output is not automatically resent. Operator
confirmation creates a separate audit-only request linked to the original
physical request. Audit retry cannot resend paper.

Automated evidence covers structured sale and exchange routing, one physical
attempt/one audit, rebuild duplicate prevention, linked unknown-outcome
resolution, purpose formatting, validation, a 500-line receipt and typed
spooler status. Full physical POS80 acceptance is still pending; therefore this
chunk remains `PARTIALLY IMPLEMENTED / RUNTIME VERIFICATION REQUIRED`.

## Hardware Chunk 2C completion update (2026-07-29)

The remaining code gaps are closed:

- Receipt History uses persisted Refund/Return and Exchange snapshots.
- Reprint permission/reason authorization is backend-enforced.
- Authorization remains immutable and supports multiple child copy audits.
- Original and reprint non-sale documents resolve device customer/merchant
  policy and deterministic per-copy IDs.
- Agent labels non-sale originals and reprints explicitly, validates original
  references and copy index limits, and preserves v1/v2 behavior.
- Partial failure and unknown outcome never replay successful copies.
- Audit-only retry performs no hardware call.

Migration `20260729111244_HardwareChunk2CReprintCopies` was applied to the
development database. Backend 1,386 tests and Local Agent 41 tests passed;
Flutter targeted/analyze/APK passed, while the full suite retains seven
unrelated New Sale failures. No physical test was performed. Status:
`IMPLEMENTED — PHYSICAL ACCEPTANCE PENDING`.

## Production Readiness
| Area | Implementation | Tests | Physical | Production status | Exact gap |
|---|---|---|---|---|---|
| Cash original | Implemented | Passed targeted | POS80 observed | Testing | Release acceptance incomplete |
| Cash reprint | Implemented | Automated | Unverified | Testing | Physical reprint |
| Card / Split | Partial / absent | Safety tests | Unverified | Blocked | Provider / atomic tenders |
| Discount / Tax | Implemented snapshot | Automated | Unverified | Testing | Physical receipt checks |
| Customer / merchant copy | Device policy + orchestrator implemented | Automated | Unverified | Testing | Physical multi-copy acceptance |
| Duplicate / unavailable / unknown | Implemented recovery | Automated | Partial | Testing | Failure injection |
| 58 / 80 / barcode / cut | Byte support | Automated | 80 output only | Testing | Full physical matrix |
| Tamil / drawer / offline / reports | Not complete | Limited/none | Unverified | Not ready | Missing execution |

## Related Files
- [[POS_Hardware_Integration]]
- [[../03_USER_JOURNEYS/Cashier/07_Payment_Flow]]
- [[../03_USER_JOURNEYS/Cashier/13_Hardware_Testing_Flow]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Hardware_Payment_Receipt]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/POSOperations/Receipt_Printer_Local_Agent_Implementation_Status]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Payment_Receipt_Contract_Implementation_Status]]
