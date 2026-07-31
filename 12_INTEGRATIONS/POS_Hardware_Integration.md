<!-- title: POS Hardware Integration -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->
# POS Hardware Integration
## Purpose
Authoritative production architecture, readiness and implementation order for
cashier-side hardware. Device-specific documents own detailed contracts.

## Scope
Receipt printers, scanners, cash drawer, card terminal, till/cash-control
hardware, test workflow, offline/restart behavior and physical acceptance.

## Production Architecture
UI → provider/controller → hardware service → typed adapter/client → local
device service/native transport → hardware. Backend owns device assignment,
business truth, permissions and audit. Widgets never perform hardware I/O.

## Component Responsibilities
| Component | Responsibility |
|---|---|
| Backend | Tenant/device/till authority, configuration policy, business audit |
| Flutter | Touch UI, secure device config, state and orchestration |
| Local Agent | Private-LAN Windows spooler/ESC-POS for laptop hardware |
| Provider/native adapter | Terminal/direct transport where approved |
| Operator/QA | Confirm physical result and attach evidence |

## Supported Platforms And Transports
Physical Android → Windows Local Agent → RAW spooler → USB POS80 is active.
HID/camera scanner source is active. Direct TCP exists but is unaccepted.
Android USB/Bluetooth printer, drawer and terminal remain incomplete.

## Runtime Flow
Hardware configuration resolves from activated tenant/outlet/device/till.
Irreversible operation identity persists before I/O. Typed result controls audit
and recovery. Payment/business completion remains separate from print/drawer.
## Configuration
Configuration is device-specific, versioned, revocable and audited. Secrets use
secure storage/protected service configuration. Hardware changes during a shift
must follow policy and retain old/new identity. Numeric performance targets are
TBD pending confirmed decision.

## API Contract
Existing APIs include device/till, POS checkout/receipt audit and Local Agent
health/receipt/operation routes. Hardware Chunk 1 adds the following
tenant-authenticated routes under the existing API conventions:

```text
GET /api/v1/pos/hardware/configurations
PUT /api/v1/pos/hardware/configurations
POST /api/v1/pos/hardware/tests
PUT /api/v1/pos/hardware/tests/{testId}/result
GET /api/v1/pos/hardware/tests
```

All use `pos.hardware.settings`, activated/trusted-device and tenant/outlet/till
validation. Drawer commands and real terminal APIs remain missing.

## Database And Audit Contract
Existing hardware devices/profiles/assignments/test-log schema, till records,
receipt JSON/print logs and payment transaction/event tables are reused where
implemented. Required production audit includes hardware/config version,
operator, outlet/till/session/device, request, safe outcome/time and recovery.
Chunk 1 reuses `hardware_devices`, `hardware_device_assignments` and
`hardware_test_logs`, adds configuration versioning and safe typed test fields,
and adds `hardware_configuration_change_audits`. Request IDs are unique per
tenant and payload hashes reject mismatched reuse. General configuration and
audit JSON exclude API keys and provider credentials.
## Permission And Business Rules
Verified codes include `pos.hardware.settings`, `receipts.view`,
`receipts.print`, `receipts.reprint`, `cash_drawer.view`,
`cash_drawer.manage`, `cash_drawer.movement.create`,
`payments.card.accept`, `payments.split.accept`, `pos.till.open` and
`pos.till.close`. No distinct merchant-copy/sensitive-reprint code is approved.
Backend authorization remains final.

## Security Rules
Require authenticated user, activated/revocable device, tenant/outlet/till
isolation and minimum permission. Agent uses private CIDR/firewall, rotated
minimum-strength local key, constant-time comparison, safe service account/logs
and production HTTPS. Never expose API keys or PCI-sensitive data.

## Idempotency
Stable identity prevents duplicate print, pulse, payment or audit. Unknown
outcome is reconciled before explicit retry. UI rebuild/restart is not a new
operation.

## Failure And Recovery Rules
The single authoritative matrix is
[[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]. Hardware failures
show operator-readable categories, preserve business truth and require physical
retest where relevant.

## Offline Behavior
Card/refund/exchange/final till close remain backend-final. Offline Cash receipt
requires an approved authoritative snapshot, durable identity, later sync/audit
and no duplicate I/O. Current end-to-end offline hardware flow is incomplete.

## Automated Testing
Use unit byte/state tests, Flutter provider/widget tests, backend integration/API
tests, Local Agent security/idempotency tests and full regression. Automated
success is not physical evidence.

## Physical Verification
Development POS80 paper output was observed. Current v2/reprint/barcode/cutter,
58 mm, failure injection, TB-00D/camera, drawer and terminal acceptance remain
open.

## Production Readiness Matrix
| Area | Required behavior | Code | Automated | Physical | Dependency | Status | Gap |
|---|---|---|---|---|---|---|---|
| Local Agent / contract | Secure v2/idempotent RAW path | Implemented | Passed | Partial | HTTPS deployment | Testing | Full acceptance |
| Cash original/reprint | Exact snapshot; no duplicate | Implemented | Passed | Original limited | None | Testing | v2/reprint |
| Card/Split receipt | Real allocation/outcome | Partial/absent | Safety | None | Provider/Split | Blocked | Execution |
| Return/exchange/refund | Authoritative document + controlled history reprint/copies | Implemented | Passed | None | POS80 | Testing | Physical acceptance |
| 58/80/barcode/cutter | Correct complete paper | Byte support | Passed | 80 limited | Printer | Testing | Matrix |
| Tamil/large/long names | Legible/wrapped | Partial | Limited | None | Rendering decision | Blocked | Unicode/raster |
| Direct TCP/USB/BT | Approved per platform | TCP only | Partial | None | Platform decision | In Progress | Acceptance/adapters |
| HID/camera scanner | FIFO exact lookup | Implemented | Passed | None | Devices | Testing | Physical matrix |
| Cash drawer | Policy pulse/audit | Implemented | Passed | None | Pin/timing | Implemented | Physical acceptance pending |
| Card terminal | Reconciled provider | Boundary only | Safety | None | Provider/model | Blocked | Full adapter |
| Hardware-test audit | Persist result/evidence | Printer chain implemented | Passed targeted | None | Physical tests | Testing | Scanner UI/physical matrix |
| Till reports/change | Audit/report policy | Config version/reason audit implemented; reports partial | Targeted | None | Policy/physical | In Progress | Report printing and physical change test |
| Offline/restart | No duplicate/known state | Implemented | Passed | None | None | Implemented | Physical failure acceptance pending |
| Security/HTTPS | Private trusted release | Hardening partial | Passed | None | Certificate | Blocked | Deployment |

## Production Definition Of Done
All required matrix rows pass automated and physical acceptance, security review,
configuration/audit/recovery are operational, no required suite fails, evidence
and runbooks are approved, and implementation tracking has review/commit data.

## Current Implementation Status
Hardware Chunk 1 foundation implemented with physical acceptance pending;
overall hardware is not production-ready.

Hardware Chunk 2 receipt production code and automated acceptance are
implemented, including non-sale historical reprints and device-policy copies.
Required POS80 physical rows remain open; overall hardware remains not
production-ready.

Hardware Chunk 4 cash drawer business lifecycle is implemented, including cash-sale auto-trigger, cash-refund auto-trigger, manual no-sale authorization flow with manager credentials approval, dedicated audit logging, and physical verification UI. Required physical acceptance is pending.


## Known Gaps
See readiness matrix, acceptance matrix and Open Questions. Health/spooler
acceptance never substitutes for physical completion.

## Implementation Sequence
1. Device configuration/test-audit foundation.
2. Receipt production completion.
3. Scanner physical acceptance.
4. Cash drawer.
5. Card terminal.
6. Offline/restart/failure recovery.
7. Unicode/advanced rendering/platform transports.
8. Full production acceptance/sign-off.

## Related Files
- [[Receipt_Printer_Integration]]
- [[Barcode_Scanner_Integration]]
- [[Cash_Drawer_Integration]]
- [[Card_Reader_Integration]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Implementation_Status]]

## Hardware Chunk 3 implementation update (2026-07-29)

Device-scoped HID/camera configuration, test registration, isolated execution,
physical confirmation, typed finalization and history reuse the existing
hardware API family. Trusted device, tenant/outlet/till assignment,
configuration version, request idempotency and `pos.hardware.settings`
enforcement remain authoritative.

Status: `HARDWARE CHUNK 3 IMPLEMENTED — PHYSICAL ACCEPTANCE PENDING`.

## Hardware Chunk 6 implementation update (2026-07-30)

Authoritative cash sale completion, cash drawer operation client-side secure store log/persistence, and local Print Agent idempotency check with direct request ID reuse are implemented. Scanner disconnect/reconnect simulation and recovery test suite verify exact single-pulse and offline outcomes.

Status: `HARDWARE CHUNK 6 IMPLEMENTED — PHYSICAL FAILURE ACCEPTANCE PENDING`.

