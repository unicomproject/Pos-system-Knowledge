<!-- title: Card Reader Integration -->
<!-- status: Draft -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->

# Card Reader Integration

## Purpose

Define the secure provider/terminal boundary for Cashier card payments.

## Current Implementation Status

The Card payment route is a UI placeholder. No verified provider capture or
physical terminal flow is implemented.

## Supported Platforms And Transports

No card-reader brand, SDK, transport or platform is approved by current code evidence.

## Configuration

Provider secrets must remain in secure backend/provider configuration, never Flutter source.

## Flutter Integration

`/pos/new-sale/payment/card` currently renders `PosPaymentPlaceholderScreen`.

## Backend And API

Checkout blocks non-cash completion until a real provider adapter is available.

## Database And Audit

Payment/transaction schema can store safe provider references and sanitized
brand/last4 only; it does not prove terminal capture.

## Security Rules

Never store PAN, CVV, raw track data or reusable payment tokens.

## Error Handling

Failed/unknown provider state must not mark a sale paid.

## Testing And Physical Verification

No card-terminal physical verification exists.

## Known Gaps

- Provider selection and SDK.
- Terminal handoff/callback.
- Idempotent capture/recovery tests.

## Related Files

- [[Payment_Gateway_Integration]]
- [[../03_USER_JOURNEYS/Cashier/07_Payment_Flow]]
