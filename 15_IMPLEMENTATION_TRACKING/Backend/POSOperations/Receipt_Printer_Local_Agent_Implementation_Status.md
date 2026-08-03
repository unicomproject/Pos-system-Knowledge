<!-- title: Receipt Printer Local Agent Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Receipt Printer Local Agent Implementation Status

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend / Windows Local Service |
| Module | POS Operations / Hardware |
| Feature | Windows Local Print Agent |
| Status | Testing |
| Completed Date | - |
| PR / Commit | Current working tree; no commit created |
| Tests | Automated pass; physical acceptance incomplete |

## Feature Summary

A separate Windows service exposes a laptop USB receipt printer to an activated
Flutter POS over a restricted private LAN. It validates source network, local
API key, contract, receipt data, and request identity before generating ESC/POS
and sending RAW bytes to the Windows spooler.

## Related Second Brain Files

| Area | File |
|---|---|
| Module | [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview]] |
| POS contract | [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/03_Technical_Contract]] |
| Journey | [[../../../03_USER_JOURNEYS/Cashier/13_Hardware_Testing_Flow]] |
| Database | [[../../../06_DATABASE_KNOWLEDGE/Tables/21_POS_Operations_UPDATED]] |
| Integration | [[../../../12_INTEGRATIONS/Receipt_Printer_Integration]] |

## Files Changed

`tools/E_POS.LocalPrintAgent/` contains Program, options, validation, security,
idempotency, observability, ESC/POS builder, and Windows RAW printer service.
`tests/E_POS.LocalPrintAgent.Tests/` contains the focused test project.

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Explicit private CIDR | Done | Request rejected outside allow-list |
| Local API key | Done | Fixed-time header comparison |
| Request validation | Done | Tender/tax/discount/copy checks |
| Contract compatibility | Done | Agent v1; receipt v1/v2 |
| Tenant POS permission | N/A | Enforced by Flutter/backend audit boundary |

## Database Tables Used

| Table/store | Usage |
|---|---|
| Local operation JSON files | Durable idempotency/restart recovery |
| `receipts` | Backend authoritative snapshot; not written by Agent |
| `receipt_print_logs` | Backend audit; not written by Agent |

## Implemented Scope

- Console/Windows Service hosting and configurable listen URL.
- Live, ready, authenticated detail, diagnostics, operation, and receipt routes.
- Windows printer existence/readiness and RAW spooler submission.
- 58/80 mm text, alignment, wrapping, bold/size, CODE128, feed and full cut.
- Auto-cut false omits cut; copy/tender/discount/tax formatting exists.
- Durable duplicate prevention and structured failure/unknown outcome.
- Request limits, allow-list, API-key authentication, safe logging, retention.

## Known Gaps

- QR, raster/image, partial cut, drawer pulse, and Tamil/Unicode rendering.
- Driver/spooler cannot reliably prove paper completion or every hardware fault.
- Direct USB/Bluetooth support is not provided by this service.
- Production HTTPS certificate deployment and full physical failure matrix.

## Tests Written

| Test type | Evidence | Result |
|---|---|---|
| Unit | ESC/POS byte order/width/barcode/cut/discount | Passed |
| Unit | Request validation and compatibility | Passed |
| Unit | File idempotency and hardening | Passed |
| Physical | POS80 development receipt output | Observed; incomplete acceptance |

## Test Commands Run

```text
dotnet test tests/E_POS.LocalPrintAgent.Tests/E_POS.LocalPrintAgent.Tests.csproj
dotnet build E_POS.sln --configuration Release
```

## Test Result Summary

Local Agent focused tests passed 30/30. Full backend solution tests passed 1,363
across Unit, Integration, API, and Local Agent projects. This proves automated
behavior only.

## Physical Verification

Health reported configured POS80 present/ready and real paper output was observed.
Current barcode scan, corrected cutter edge, reprint, 58 mm, paper-out,
cover/jam, timeout-unknown and service-restart acceptance remain unverified.

## Second Brain Updates

Owning Hardware/POS modules, hardware journey, Flutter knowledge, integrations,
feature index, and payment-receipt status were aligned on 2026-07-29.

## Final Completion Checklist

| Check | Status |
|---|---|
| Active Local Agent path | Yes |
| Automated tests | Yes |
| Security/idempotency documented | Yes |
| Full physical matrix | No |
| Production deployment acceptance | No |
| Status may be Completed | No |

## Hardware Chunk 2 update (2026-07-29)

- Structured receipt contract extended for sale original/reprint,
  return/exchange/refund, references, item grouping and settlements.
- Windows RAW status returns typed paper/door/jam/offline/spooler categories
  where the driver exposes them.
- Receipt validation caps safe collection sizes and validates purpose/config
  identity.
- Device config owns purpose routing and customer/merchant copy policy.
- Backend audit persists receipt purpose/copy/configuration/route/device/session,
  typed outcome and linked unknown-outcome recovery identity.
- Purpose-aware receipt selection prevents sale-original audit association with
  a newer refund/exchange receipt.
- Focused Local Agent suite: 35 passed.
- Physical purpose/copy/failure acceptance remains pending; status is
  `PARTIALLY IMPLEMENTED / RUNTIME VERIFICATION REQUIRED`.

## Hardware Chunk 2C update (2026-07-29)

- Refund/Return and Exchange historical snapshots are exposed by receipt detail
  and used for controlled reprint.
- One authorization may now own multiple immutable customer/merchant copy logs.
- Reprint-operation index is non-unique; print-request identity remains unique
  per tenant/receipt.
- Duplicate reprint copy types are explicit and migration rollback safely
  normalizes them before restoring the legacy constraint.
- Agent produces clear non-sale reprint labels and validates required original
  references/copy limits.
- Migration applied; backend Release and 1,386 tests passed.

Code status: `IMPLEMENTED`. Physical status: `PENDING`.

## Related Files

- [[../../../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Hardware_Payment_Receipt]]
- [[../../../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Payment_Receipt_Contract_Implementation_Status]]
