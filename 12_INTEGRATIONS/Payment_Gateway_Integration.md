<!-- title: Payment Gateway Integration -->
<!-- status: Draft -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Payment Gateway Integration

## Purpose

Define backend-final provider rules for Card/QR and payment reconciliation.

## Scope

Provider adapter, capture outcomes, callbacks/status lookup, idempotency,
reconciliation, safe persistence, terminal association and recovery.

## Production Architecture

POS command → backend payment orchestration → provider adapter → provider →
verified outcome/reconciliation → atomic payment/sale persistence. Flutter
cannot call provider with server credentials or manufacture success.

## Component Responsibilities

Backend protects credentials, verifies responses/callbacks, reconciles and
persists. Flutter displays typed safe state. Provider/terminal supplies the
external financial outcome.

## Supported Platforms And Transports

No production provider, SDK, callback endpoint or terminal transport is approved.
Cash needs no gateway. Card is Blocked; QR/Split are not end-to-end complete.

## Runtime Flow

Completed provider outcome may persist. Declined/Cancelled/Failed/Unavailable
do not create paid business data. Pending/Timeout/Unknown stays unresolved until
provider lookup/reconciliation. Card never falls back to Cash.

## Configuration

Credentials, merchant account, environment, webhook verification and terminal
assignment are protected backend configuration. Rotation and configuration
changes are audited.

## API Contract

`ICardPaymentGateway` is the verified provider-neutral Card boundary. It defines
capture, terminal status, operation status, cancel, void and refund operations
with typed safe results. Current production registration returns
`card_provider_unavailable`. QR/provider and atomic Split APIs are not
implemented; no route or approval is fabricated.

## Database And Audit Contract

Use existing sales payment, transaction and event records for provider, safe
reference, status, amount/currency and reconciliation. Store sanitized brand/
last4 only. Provider/card secrets and raw responses are prohibited.

## Permission And Business Rules

Verified permissions include `payments.card.accept` and
`payments.split.accept`. Authentication, activated device, tenant/outlet/till,
enabled method and backend authorization are required.

## Security Rules

No PAN, CVV, PIN, track/EMV, reusable token or credentials in database, Flutter,
logs, receipts or recovery. Verify provider authenticity and use masked output.

## Idempotency

Stable operation identity covers provider request, callback/status lookup and
database transaction. Duplicate callback/request cannot duplicate payment.

## Failure And Recovery Rules

Outcome-specific messages preserve sale state. Unknown/reconciliation mismatch
requires provider/operations review and cannot be blindly retried or marked paid.

## Offline Behavior

Provider-backed payment and final reconciliation are online-only.

## Automated Testing

Current safety tests cover unavailable and test-only outcomes, terminal status,
unsupported reversal and safe disabled configuration. Production adapter/
callback/reconciliation/security tests remain required.

## Physical Verification

Not Run; no provider sandbox/terminal certification is recorded.

## Production Definition Of Done

Approved provider and terminal, secure config, all outcomes, callback/status
verification, reconciliation, idempotency, audit, receipts, automated tests and
physical certification pass.

## Current Implementation Status

Partially Implemented — Blocked By External Dependency.

## Known Gaps

Provider/terminal decision, production adapter, callback/status/reconciliation,
operational support, terminal slips and certification.

## Implementation Sequence

Hardware Chunk 5 follows authoritative device configuration and provider approval.

## Related Files

- [[Card_Reader_Integration]]
- [[../04_MODULE_KNOWLEDGE/24_Payment_Refund/03_Technical_Contract]]
- [[../03_USER_JOURNEYS/Cashier/07_Payment_Flow]]
- [[../13_DECISIONS_AND_CHANGES/Open_Questions]]
