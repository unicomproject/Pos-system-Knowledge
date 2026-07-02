<!-- title: Idempotency Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Idempotency Test Cases

## Purpose

This file defines idempotency test cases for retryable and duplicate-sensitive backend workflows.

## Idempotency Rule

Any retryable command that can create money, inventory, order, refund, payment, sync, or irreversible records must define idempotency behavior.

## Idempotency Required Areas

- Checkout completion.
- POS sale completion.
- Payment transaction recording.
- Refund creation and allocation.
- Return/exchange posting.
- Offline sync batch upload.
- External webhook processing.
- Subscription payment link/payment callback handling.

## Standard Cases

| Case | Expected Result |
|---|---|
| First request with idempotency key | command succeeds and records key |
| Same key and same payload repeated | same successful result or safe no-op |
| Same key with different payload | conflict/error response |
| Missing key on required endpoint | validation error |
| Key reused across tenant | isolated by tenant or rejected according to workflow rule |
| Failure before commit | retry can complete safely |
| Failure after commit | retry does not duplicate records |

## Database Assertions

Tests must assert no duplicate rows are created for:

- Sales orders.
- Sales payments.
- Refunds.
- Sync batches/items.
- Webhook events.
- External payment references.

## Related Files

- [[../05_BACKEND_ARCHITECTURE/API_Standards]]
- [[../05_BACKEND_ARCHITECTURE/Offline_Operation_Architecture]]
- [[Testing_Strategy]]