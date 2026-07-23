<!-- title: Payment Gateway Integration -->
<!-- status: Draft -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->

# Payment Gateway Integration

## Purpose

Define backend-final payment-provider rules for non-cash Cashier payments.

## Current Implementation Status

Cash payment is implemented without a gateway. Card, QR and Split provider flows
are not implemented end to end.

## Supported Platforms And Transports

No production gateway or terminal transport is confirmed by current code evidence.

## Configuration

Secrets and provider credentials belong in secure backend configuration/Key Vault.

## Flutter Integration

Flutter may initiate provider handoff only after a provider contract exists. It
must not manufacture a successful capture.

## Backend And API

Current POS checkout supports cash and rejects provider-required methods until a
real adapter is configured.

## Database And Audit

Sales payment, transaction and event tables store business outcome and sanitized references.

## Security Rules

No sensitive card or provider secret may be logged or returned.

## Error Handling

Unknown, failed or duplicate callbacks require safe idempotent recovery.

## Testing And Physical Verification

No production provider sandbox or physical-terminal result is recorded.

## Known Gaps

- Provider adapter.
- Callback/webhook verification.
- Card/QR/Split completion tests.

## Related Files

- [[Card_Reader_Integration]]
- [[QR_Payment_Integration]]
