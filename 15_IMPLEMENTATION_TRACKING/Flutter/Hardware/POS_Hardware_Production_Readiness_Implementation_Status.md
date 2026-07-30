<!-- title: POS Hardware Production Readiness Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->
# POS Hardware Production Readiness Implementation Status

## Status Summary

| Item | Value |
|---|---|
| Platform | Flutter, Backend, Windows Local Agent |
| Module | Hardware / POS Operations / Payment |
| Feature | Cashier hardware production readiness |
| Status | In Progress |
| Completed Date | - |
| PR / Commit | Current working trees; no commit created |
| Tests | Automated partial; physical matrix open |

## Feature Summary

Tracks the complete production path for device configuration, receipt printer,
scanner, drawer, terminal, till hardware, recovery and sign-off. Overall status
cannot be Completed while required physical/external rows remain open.

## Related Second Brain Files

| Area | File |
|---|---|
| Hardware module | [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview]] |
| Device module | [[../../../04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/01_Module_Overview]] |
| POS integration | [[../../../12_INTEGRATIONS/POS_Hardware_Integration]] |
| QA matrix | [[../../../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]] |
| Hardware journey | [[../../../03_USER_JOURNEYS/Cashier/13_Hardware_Testing_Flow]] |

## Files Changed

Current application work spans Flutter hardware/scanner/payment/receipt features,
backend device/till/checkout/receipt/payment modules, Local Agent and tests.
This documentation task changes Markdown only.

## Access Checks Implemented

| Category | Verified codes/status |
|---|---|
| Hardware settings | `pos.hardware.settings` exists |
| Receipt | `receipts.view`, `receipts.print`, `receipts.reprint` |
| Drawer | view/manage/movement codes exist; execution absent |
| Payment | Card/Split accept codes exist; execution incomplete |
| Till | `pos.till.open`, `pos.till.close` |
| Missing distinct policy | Merchant copy/sensitive reprint not approved |

## Database Tables Used

Hardware profile/device/assignment/test-log schema, POS device/till/session/cash
control, receipts/print logs, and sales payment transaction/event tables exist.
Hardware Chunk 1 reuses the hardware device/assignment/test-log schema, adds
configuration versioning and typed/idempotent test fields, and adds the
configuration-change audit entity/table. Drawer physical execution remains
absent.

## Implemented Scope

- Local Agent client/service, private-LAN hardening, RAW spooler and durable print recovery.
- Receipt v2 authoritative tender/discount/tax/copy mapping and reprint orchestration.
- Exact barcode lookup, FIFO HID/camera pipeline and same-variant increment.
- Provider-neutral Card boundary with unavailable-by-default safe behavior.
- Till open/close core flow.
- Authoritative activated-device receipt-printer configuration, optimistic
  versioning, active-shift reason/audit, secure device-owned Local Agent key,
  and two-stage backend hardware-test persistence.

## Known Gaps

Drawer, real terminal, atomic Split, return/exchange/refund/report receipts,
configured copy policy, scanner configuration/test UI completion, offline
hardware E2E, Unicode/advanced rendering/transports and physical matrix.

## Implementation Roadmap

| Chunk | Scope/dependencies | Frontend / Backend / Agent / DB | Permissions | Automated / physical tests | Definition of Done | Current status |
|---:|---|---|---|---|---|---|
| 1 | Device config + test audit; foundation first | Receipt-printer device UI/service; config/test APIs; assignment/version/audit persistence | Existing `pos.hardware.settings` | Backend/Agent/targeted Flutter passed; physical pending; scanner screen work remains | Authoritative versioned config and audited printer test results | Testing |
| 2 | Receipt production; depends 1 | All receipt types/copies/recovery/routing; Agent completion; receipt/audit snapshots | Print/reprint | Contract/byte/recovery + full POS80 | Original/reprint/returns/reports accepted | Testing |
| 3 | Scanner acceptance; depends 1 | Close HID/camera gaps; backend exact lookup authority | New Sale access | FIFO/lifecycle + TB-00D/camera matrix | Supported formats/devices accepted | Testing |
| 4 | Drawer; depends 1/2 | Agent pulse/transport and config/test foundation exist; payment/refund/manual policy controller and dedicated audit remain | Drawer manage/movement codes exist; purpose-specific enforcement incomplete | Exact byte/validation/transport tests pass; business-rule and RJ11/RJ12 physical matrix open | Cash rules/audit/physical pass | In Progress |
| 5 | Card terminal; provider required | Expanded provider-neutral gateway/status/reversal contract, safe disabled terminal configuration and explicit Flutter unavailable state; real adapter/persistence/reconcile remain | Existing Card accept; configuration uses hardware settings | Focused safety tests pass; provider/physical matrix blocked | Provider/terminal certified | Blocked By External Dependency |
| 6 | Offline/restart; depends active hardware | Recovery/sync/unknown handling across layers | Existing action permissions | Network/restart/duplicate + fault injection | No duplicate/lost operation | In Progress |
| 7 | Unicode/transports; decisions required | Raster/QR/Tamil; USB/BT/TCP; generator strategy | Existing print | Golden/byte + platform matrix | Approved rendering/transports | Not Started |
| 8 | Sign-off; depends 1–7 | Fix regressions; runbooks/support | Full matrix | Full automated/physical/security/stability | All required rows approved | Blocked |

## Tests Written

| Area | Automated result | Physical |
|---|---|---|
| Local Agent | 30 focused passed at last run | Partial development output |
| Payment/receipt | Backend/Flutter targeted passed | Current v2/reprint open |
| Scanner | Widget/provider coverage exists | TB-00D/camera open |
| Drawer | Agent exact pulse + Flutter transport focused tests pass; business lifecycle incomplete | Pending |
| Terminal | No production execution | Blocked |

## Test Commands Run

```text
dotnet build E_POS.sln --configuration Release
dotnet test
flutter analyze
flutter test
flutter build apk --debug
```

## Test Result Summary

On 2026-07-29 the backend Release build passed with zero warnings/errors:
627 unit, 375 integration, 339 API and 30 Local Agent tests passed (1,371
total). Flutter analysis and 20 targeted hardware tests passed, and the Android
debug APK built. The full Flutter suite recorded 653 passes and 7 unrelated New
Sale/widget failures, so the complete Flutter regression remains red.

## Physical Verification

Limited POS80 development paper output is recorded. Health/spooler are not paper
proof. Contract-v2/reprint/barcode/cutter/58 mm/faults, scanners, drawer and
terminal remain physically unverified or blocked.

## Second Brain Updates

Modules, journeys, Flutter rules, integrations, QA matrix, Open Questions and
feature index define the normative target and current gaps.

## Final Completion Checklist

| Check | Status |
|---|---|
| Production architecture/security | Documented |
| Error/recovery/roadmap | Documented |
| Required application implementation | Incomplete |
| Automated suites green | Incomplete |
| Physical acceptance | Incomplete |
| External provider decisions | Incomplete |
| Review/commit/sign-off | Incomplete |
| May mark Completed | No |

Chunk 1 status is `Testing`: its core authoritative receipt-printer
configuration/test-audit foundation is implemented, but scanner screen
completion, full Flutter regression closure and physical acceptance remain
open. It must not be marked `Completed`.

## Hardware Chunk 2C result (2026-07-29)

Chunk 2 receipt code is implemented: historical Refund/Return and Exchange
reprint, device-policy customer/merchant copies, deterministic copy identities,
separate audit, partial/unknown handling and audit-only retry. Backend Release
passed with 627 unit, 379 integration, 339 API and 41 Agent tests. Flutter
targeted tests/analyze and debug APK passed; full Flutter is 660 passed/7
existing unrelated failures.

No current POS80 paper evidence was produced. Chunk status:
`HARDWARE CHUNK 2 IMPLEMENTED — PHYSICAL ACCEPTANCE PENDING`. Overall hardware
production readiness remains `Testing`, not `Completed`.

## Related Files

- [[../../../12_INTEGRATIONS/Receipt_Printer_Integration]]
- [[../../../12_INTEGRATIONS/Barcode_Scanner_Integration]]
- [[../../../12_INTEGRATIONS/Cash_Drawer_Integration]]
- [[../../../12_INTEGRATIONS/Card_Reader_Integration]]

## Hardware Chunk 3 result (2026-07-29)

Implemented: authoritative scanner configuration/versioning, HID buffering,
suffix and length/timeout validation, camera duplicate/lifecycle handling,
New Sale exact lookup/cart integration, isolated Hardware Testing registration,
confirmation, finalization/history, privacy-safe evidence and typed failures.

Status:

`HARDWARE CHUNK 3 IMPLEMENTED — PHYSICAL ACCEPTANCE PENDING`.

No physical Android phone, TB-00D or POS80 scanner evidence was available.
Overall hardware remains Testing and is not production-ready.

## Hardware Chunk 4 partial result (2026-07-29)

Implemented foundation: dedicated authenticated Local Agent drawer endpoint,
typed allowed purposes, validated POS80 printer/pin/timing, exact
`ESC p m t1 t2` bytes through the existing Windows RAW spooler, durable
request-ID duplicate/conflict protection, typed Flutter client transport,
backend drawer configuration validation, and Hardware Testing operations that
remain pending until explicit physical confirmation instead of returning the
obsolete `DRAWER_NOT_IMPLEMENTED` result.

Validation: backend Release build passed with zero warnings/errors, Local Agent
tests passed 48/48, and focused Flutter Local Agent tests passed 20/20.

Still missing: authoritative cash-sale/split/refund triggers, manual no-sale
permission/reason/manager approval, dedicated immutable drawer-operation audit,
complete Flutter drawer configuration/test UI, full regression validation and
physical RJ11/RJ12 evidence.

Status:

`HARDWARE CHUNK 4 PARTIALLY IMPLEMENTED`.

## Hardware Chunk 5 result (2026-07-29)

No real provider SDK/API, local terminal protocol or physical terminal is
available. The gateway now models terminal status, payment status, capture/
cancel and explicitly unsupported void/refund boundaries. Disabled device-
scoped terminal configuration is validated and contains no credentials.
Enabling or marking a terminal paired is rejected until a real adapter exists.
Flutter shows provider/terminal unavailable and confirms no charge was
initiated; Hardware Testing remains safely blocked.

Backend Release build passed with zero warnings/errors and 17 focused gateway/
hardware tests passed. No provider or physical evidence exists.

Status:

`HARDWARE CHUNK 5 PARTIALLY IMPLEMENTED — REAL PROVIDER/TERMINAL BLOCKED`.
