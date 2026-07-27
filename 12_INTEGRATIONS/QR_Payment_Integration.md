<!-- title: QR Payment Integration -->
<!-- status: Draft -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->

# QR Payment Integration

## Purpose

Define the provider-authoritative Cashier QR payment boundary.

## Current Implementation Status

The QR route is a UI placeholder. No QR generation, provider confirmation or
payment completion flow is verified.

## Supported Platforms And Transports

No QR provider or transport is approved by current code evidence.

## Configuration

Provider configuration and signing secrets must remain backend-side.

## Flutter Integration

`/pos/new-sale/payment/qr` currently renders `PosPaymentPlaceholderScreen`.

## Backend And API

POS checkout requires provider integration before accepting QR payment.

## Database And Audit

Payment schema may store safe transaction references after provider confirmation.

## Security Rules

Never accept a client-only “paid” flag as payment authority.

## Error Handling

Expired, cancelled, failed and unknown QR states must leave the sale unpaid.

## Testing And Physical Verification

No provider sandbox or physical QR acceptance evidence exists.

## Known Gaps

- QR provider.
- Poll/callback confirmation.
- Idempotent completion tests.

## Related Files

- [[Payment_Gateway_Integration]]
- [[../03_USER_JOURNEYS/Cashier/07_Payment_Flow]]
