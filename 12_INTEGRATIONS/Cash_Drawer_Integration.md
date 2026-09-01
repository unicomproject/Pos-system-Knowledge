<!-- title: Cash Drawer Integration -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-17 -->

# Cash Drawer Integration

## Canonical status (2026-08-17)

```text
PHYSICAL CASH DRAWER: CASH-SALE PATH PHYSICALLY ACCEPTED 2026-08-17
  (POSPrinter POS80, Cashbox #1 / drawerPin2, 100/200 ms pulse)
Overall hardware module: BLOCKED — HARDWARE NOT PRODUCTION READY
```

Software pulse path exists via:

- Android USB / Bluetooth (capability-gated) through typed `CashDrawerTransport`
- Optional Windows `E_POS.LocalPrintAgent` (`POST /api/drawer/open`)

Automatic Cash Sale physical RJ11/RJ12 acceptance is complete for the recorded
POS80 / Cashbox #1 / `drawerPin2` environment. Other drawer scenarios remain
open; Agent acceptance alone still does not mean physically opened. Evidence:
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]].

### A. Financial Cash Management (separate)

Examples: Cash In, Cash Drop, till movement, expected cash, reconciliation.

These are **software/financial** features. Cash In and Cash Drop are
**software production-accepted**. They are **not** physical drawer I/O.

### Policy field `never` (clarified 2026-08-16)

`policy=never` means **no manager-approval gate** for manual/no-sale open.
Automatic cash/split/refund pulse is controlled by `openOnCashSale` /
`openOnCashSplit` / `openOnCashRefund`. Hardware Test uses purpose
`hardwareTest` and is not blocked by `never`.

### B. Physical Drawer Control (this document)

Examples: Manual Open Drawer, cash-sale automatic drawer open, test drawer
pulse, ESC/POS drawer kick.

Authority for financial screen:

- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]]

Overall hardware authority:

[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
[[Local_Print_Agent]]

## Purpose

Define the printer-driven **physical** cash-drawer architecture and its boundary
from the implemented financial Cash Drawer management workflow.

This integration document covers **hardware pulse only**. Physical Open Drawer
must not create financial cash movements.

## Scope

RJ11/RJ12 drawer connected to the assigned receipt printer, `ESC p` pulse,
automatic Cash rules, manual/no-sale open, return/refund, audit and testing.

## Production Architecture

Authorized business action → drawer policy/controller → configured printer
transport → ESC/POS `ESC p m t1 t2` → printer drawer port → physical drawer →
typed result/audit. Pulse ownership must be single and explicit.

Production transports (printer-driven only):

| Transport | Status |
|---|---|
| Android USB Host | SUPPORTED (software); physical pending |
| Android Bluetooth Classic SPP | CAPABILITY-GATED (software); physical N/A unless drawer port present |
| Windows LocalPrintAgent | OPTIONAL |
| Direct standalone drawer USB | NOT SUPPORTED |

Shared pulse builders: Flutter `EscPosDrawerPulseBuilder` and Agent
`EscPosDrawerPulseBuilder` (exact-byte parity tests).

## Component Responsibilities

Backend owns policy, permission and audit (stable request IDs from
sale/return + purpose). Flutter owns orchestration and operator UI via
`CashDrawerController` → `CashDrawerTransport`. Transports own pulse bytes.
Printer/Agent must not pulse implicitly merely because a receipt prints.

## Supported Platforms And Transports

Target is printer-driven RJ11/RJ12. Direct native drawer transport is unapproved.
Supported pins are `drawerPin2` (`m=0`) and `drawerPin5` (`m=1`). Configuration
stores millisecond timing in the safe range 2–510 ms; the Local Agent converts
it to ESC/POS 2 ms units.

## Runtime Flow

- Cash-only or Split containing Cash: pulse only after successful payment and policy.
- Card-only/QR-only: never pulse.
- Receipt reprint/test/report: never pulse.
- Cash refund: follow approved refund policy; non-cash refund is suppressed.
- Manual/no-sale open: require explicit action, permission, reason and any
  manager approval required by confirmed policy.

## Configuration

Device/till configuration must identify assigned printer/drawer, enabled policy,
pin and timing. Printer/drawer change during a shift is audited and cannot occur
silently.

## API Contract

The Windows Local Print Agent exposes authenticated `POST /api/drawer/open`.
Its typed request includes API version, stable request/operation IDs, allowed
purpose, configured printer, typed pin, bounded timings and configuration
identity. The endpoint accepts no arbitrary bytes. It reuses the durable
request store: identical replay is rejected without another pulse and payload
conflict is rejected. Spooler acceptance explicitly requires physical
confirmation and is not physical-open proof.

## Database And Audit Contract

Existing hardware/cash-control schema is foundation. Required audit:
automatic/manual, sale/payment/refund reference, till session, operator,
approver where required, reason, configured hardware, pulse result and time.

## Permission And Business Rules

Existing codes are `cash_drawer.view`, `cash_drawer.manage` and
`cash_drawer.movement.create`. Physical Open Drawer uses `cash_drawer.manage`.
Manual Cash In/Out/Drop uses the seeded and API-enforced
`cash_drawer.movement.create`. Backend remains authority. Open till and assigned activated
device are required. No merchant-copy or receipt permission implies
drawer-open permission.

## Security Rules

Tenant/outlet/till/device isolation applies. Do not expose arbitrary raw pulse
commands to the UI. Rate/duplicate protection and safe logs are required.

## Idempotency

Automatic pulse uses stable payment/action identity. UI rebuild, receipt retry
or audit retry must not repeat it. Unknown pulse outcome requires operator
verification, not automatic replay.

**Do not blindly queue/replay drawer-open commands after reconnect.**

## Failure And Recovery Rules

Printer unavailable, unsupported pulse, disconnected drawer and unknown result
show separate safe messages. Completed payment is not rolled back. Cashier uses
controlled manual procedure and records the failure/recovery.

## Offline Behavior

Offline/restart recovery must reconcile unresolved operations without duplicate
pulses. Durable client-side operation identity + Agent request-ID reuse are the
software controls. **Physical acceptance of recovery behaviour remains incomplete.**

## Automated Testing

Required tests cover Cash/Split Cash trigger, Card/QR/reprint suppression,
permission/till/policy, exact bytes, duplicate/rebuild, failure and unknown.

## Physical Verification / Production Acceptance

```text
Physical RJ11/RJ12 Cash Sale verification completed on 2026-08-17.

Printer: POSPrinter POS80
Drawer: printer-driven drawer via Cashbox #1 / drawerPin2
Direct Local Agent pulse: PASS
Cash checkout automatic pulse: PASS
Receipt auto-print: PASS
Physical drawer movement: PASS
```

The accepted path is Cash Sale only. Split Cash, refund, manual/no-sale,
`drawerPin5`, and other printer/drawer models remain unverified.

Drawer requests contain `requestedAt`; the Local Print Agent rejects requests
older than its 120-second safe window. POS device system time must remain
synchronized. Never disable stale-request validation to compensate for clock
drift.

Production acceptance must include:

- Actual RJ11/RJ12 drawer test where applicable
- Configured printer/drawer path
- Permission validation
- Manual open
- Sale-triggered open
- Audit evidence
- Failure behaviour
- No dangerous delayed open/replay

## Production Definition Of Done

Configured pulse, all business suppression rules, backend audit, recovery,
automated tests and physical RJ11/RJ12 acceptance must pass.

## Current Implementation Status

```text
SOFTWARE PATH: Implemented (Agent pulse + Flutter transport + backend audit path)
AUTOMATIC CASH-SALE PHYSICAL ACCEPTANCE: Passed 2026-08-17
OTHER PHYSICAL DRAWER SCENARIOS: Incomplete
CANONICAL STATUS: CASH-SALE PATH ACCEPTED; OVERALL HARDWARE PARTIAL
```

Do not mark physical drawer production-ready from software tests alone.

## Known Gaps

- Split Cash, refund, manual/no-sale, `drawerPin5`, and alternate hardware
  physical verification remain pending.
- Local Print Agent production Windows-service deployment acceptance incomplete.
- The accepted POS80 / Cashbox #1 / `drawerPin2` result does not prove other
  printer/drawer models or configurations.

## Implementation Sequence

Financial Cash Drawer management (In/Drop) is software-accepted. Remaining
**physical** release work follows Hardware Code Chunks:

```text
Chunk 1 — Local Print Agent production packaging/autostart
Chunk 3 — Physical Cash Drawer production acceptance (after Chunk 2 printer)
```

## Related Files

- [[POS_Hardware_Integration]]
- [[Local_Print_Agent]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Management_Screen_Second_Brain_Alignment_2026-08-14]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
