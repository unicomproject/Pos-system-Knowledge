<!-- title: Email Service Integration -->
<!-- status: Draft -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->

# Email Service Integration

## Purpose

Define Cashier email-receipt delivery and its notification-service boundary.

## Current Implementation Status

Flutter email-receipt form/UI exists. A verified send API, delivery provider and
end-to-end delivery result were not found.

## Supported Platforms And Transports

No production email provider is confirmed by current Cashier code evidence.

## Configuration

Sender identity and provider credentials must remain backend-side.

## Flutter Integration

Flutter must validate recipient input and show delivery failure honestly. UI
navigation alone is not successful delivery.

## Backend And API

No verified Cashier email-receipt send endpoint exists.

## Database And Audit

Notification schema may record requests/outcomes after service implementation;
schema presence is not delivery evidence.

## Security Rules

Do not expose provider credentials or unrelated customer data.

## Error Handling

Queue, provider and permanent-delivery failures require distinct user-safe states.

## Testing And Physical Verification

No send/delivery integration test or provider runtime evidence exists.

## Known Gaps

- Send endpoint and notification service.
- Provider configuration.
- Retry/idempotency and delivery tests.

## Related Files

- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Hardware_Payment_Receipt]]
- [[../03_USER_JOURNEYS/Cashier/07_Payment_Flow]]
