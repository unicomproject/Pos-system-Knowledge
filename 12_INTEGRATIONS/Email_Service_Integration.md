<!-- title: Email Service Integration -->
<!-- status: Draft (Cashier receipts); platform email superseded -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-07-27 -->
<!-- superseded_by: Email_Architecture_And_Provider_Decisions (platform / ACS / onboarding only) -->

# Email Service Integration

## Platform / ACS / Onboarding Email — Superseded

This file is **not** the source of truth for Platform Admin ACS delivery, tenant
onboarding email journeys, or authentication email flows. Those decisions live
in:

1. [[Email_Architecture_And_Provider_Decisions]]
2. [[Email_Event_And_Template_Catalog]]
3. [[ACS_Email_Operations_And_Deployment_Runbook]]
4. [[../03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows]]
5. [[../03_USER_JOURNEYS/Platform_Admin/19_Authentication_Email_Flows]]

Do not add platform/onboarding email product decisions here.

## Purpose (Cashier email receipt)

Define Cashier email-receipt delivery and its notification-service boundary.

## Current Implementation Status

Flutter email-receipt form/UI exists. A verified send API, delivery provider and
end-to-end delivery result were not found.

## Supported Platforms And Transports

No production email provider is confirmed by current Cashier code evidence.
Platform Admin password-reset delivery uses Azure Communication Services (ACS);
see the superseded canonical docs above — do not treat Cashier receipt UI as ACS
evidence.

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
- [[Email_Architecture_And_Provider_Decisions]]
