<!-- title: Cash Drawer Integration -->
<!-- status: Draft -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->

# Cash Drawer Integration

## Purpose

Define the Cashier cash-drawer hardware boundary separately from cash-movement forms.

## Current Implementation Status

Cash Drawer, Cash In and Cash Drop UI surfaces exist. No verified drawer-kick
command, printer pulse execution or physical drawer result exists.

## Supported Platforms And Transports

Printer-pulse or supported native drawer transport is the documented target.
No transport is physically verified.

## Configuration

Drawer configuration must be device/till scoped and must not be inferred from a
button label.

## Flutter Integration

Current Flutter provides navigation and form state only. A successful form
validation is neither a drawer-open result nor a persisted cash movement.

## Backend And API

No Cashier cash-movement mutation or drawer-test endpoint was verified.

## Database And Audit

Cash movement and hardware schema exists. Schema presence is not operational
wiring. Live applied state was not verified.

## Security Rules

Require authenticated user, permission, trusted device and open till context.

## Error Handling

Transport failure and persistence failure must be shown separately.

## Testing And Physical Verification

No physical cash-drawer verification or printer-pulse acceptance evidence exists.

## Known Gaps

- Drawer-kick transport.
- Cash-movement API persistence.
- Hardware-test audit.

## Related Files

- [[../03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow]]
- [[POS_Hardware_Integration]]
