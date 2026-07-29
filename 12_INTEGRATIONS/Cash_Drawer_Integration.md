<!-- title: Cash Drawer Integration -->
<!-- status: Draft -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Cash Drawer Integration

## Purpose

Define the printer-driven cash-drawer architecture and record the current
foundation without claiming unfinished business triggers or physical movement.

## Scope

RJ11/RJ12 drawer connected to the assigned receipt printer, `ESC p` pulse,
automatic Cash rules, manual/no-sale open, return/refund, audit and testing.

## Production Architecture

Authorized business action → drawer policy/controller → configured printer
transport → ESC/POS `ESC p m t1 t2` → printer drawer port → physical drawer →
typed result/audit. Pulse ownership must be single and explicit.

## Component Responsibilities

Backend owns policy, permission and audit. Flutter owns orchestration and
operator UI. The final hardware transport owns the pulse bytes. Printer/Agent
must not pulse implicitly merely because a receipt prints.

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

Existing hardware/cash-control schema is foundation only. Required audit:
automatic/manual, sale/payment/refund reference, till session, operator,
approver where required, reason, configured hardware, pulse result and time.
Missing end-to-end persistence is a production gap.

## Permission And Business Rules

Existing codes are `cash_drawer.view`, `cash_drawer.manage` and
`cash_drawer.movement.create`. Backend remains authority. Open till and assigned
activated device are required. No merchant-copy or receipt permission implies
drawer-open permission.

## Security Rules

Tenant/outlet/till/device isolation applies. Do not expose arbitrary raw pulse
commands to the UI. Rate/duplicate protection and safe logs are required.

## Idempotency

Automatic pulse uses stable payment/action identity. UI rebuild, receipt retry
or audit retry must not repeat it. Unknown pulse outcome requires operator
verification, not automatic replay.

## Failure And Recovery Rules

Printer unavailable, unsupported pulse, disconnected drawer and unknown result
show separate safe messages. Completed payment is not rolled back. Cashier uses
controlled manual procedure and records the failure/recovery.

## Offline Behavior

Offline drawer pulse is disallowed until an approved offline Cash operation,
durable identity, later audit sync and duplicate-prevention contract exist.

## Automated Testing

Required tests cover Cash/Split Cash trigger, Card/QR/reprint suppression,
permission/till/policy, exact bytes, duplicate/rebuild, failure and unknown.

## Physical Verification

Not Run. No physical drawer movement evidence exists.

## Production Definition Of Done

Configured pulse, all business suppression rules, backend audit, recovery,
automated tests and physical RJ11/RJ12 acceptance must pass.

## Current Implementation Status

Partially Implemented. Local Agent pulse generation, validation, dedicated
endpoint, RAW spooler routing, durable transport idempotency, typed Flutter
request/response transport, backend cash-drawer configuration validation and
pending Hardware Testing lifecycle exist. Exact Agent tests passed (48 total)
and Flutter focused Local Agent tests passed (20 total).

Automatic cash-sale/split/refund hooks, manual no-sale authorization/approval,
dedicated immutable drawer-operation audit, production Flutter drawer UI and
physical acceptance are not implemented. Therefore Chunk 4 is not code-complete
and must not be described as production-ready.

## Known Gaps

Automatic business trigger ownership, dedicated backend drawer-operation/audit
persistence, manual reason/manager approval policy, Flutter test/manual UI and
physical drawer model/acceptance.

## Implementation Sequence

Hardware Chunk 4 follows device configuration/test-audit foundation and printer
acceptance.

## Related Files

- [[POS_Hardware_Integration]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/02_Functional_Rules]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
- [[../13_DECISIONS_AND_CHANGES/Open_Questions]]
