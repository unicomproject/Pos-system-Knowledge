<!-- title: Idempotency Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

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
- **POS Cash In financial movement** (`cash_movements.request_id`) — **VERIFIED**.
- **POS Cash Drop / OUT financial movement** — **VERIFIED** (automated + PG
  concurrent same-requestId + over-drop); live authenticated E2E still blocked.

## Cash movement idempotency (2026-08-16)

| Area | Mechanism | Status |
|---|---|---|
| Cash In | `POST /api/v1/pos/cash-drawer/movements` + `requestId` + `UNIQUE(tenant_id, request_id)` | VERIFIED (Chunk 3) |
| Cash Drop | Same endpoint + OUT type + same key rules | VERIFIED (automated); live E2E blocked |

| Case | Expected Result | Cash In | Cash Drop |
|---|---|---|---|
| First request with requestId | Succeeds; one `cash_movements` row | Verified | Verified (automated) |
| Same requestId + same payload | Same result / safe replay; no duplicate | Verified | Verified (automated + PG concurrent) |
| Same requestId + different payload | Conflict; no incorrect mutation | Verified | Verified (automated) |
| Concurrent over-drop distinct requestIds | Exactly one OUT succeeds | N/A | Verified (PG) |
| Missing requestId on required path | Per current API contract / validation | Per IN contract | Same contract |
| Key reused across tenant | Tenant-scoped uniqueness | Verified pattern | Verified pattern |
| Failure before commit | Retry can complete safely | Verified pattern | Verified pattern |
| Failure after commit | Retry does not duplicate | Verified | Verified (replay) |
| Concurrent duplicate request | At most one financial row | Covered for IN | Covered for OUT (PG) |

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
- **`cash_movements` for the same `(tenant_id, request_id)`**.

## Related Files

- [[../05_BACKEND_ARCHITECTURE/API_Standards]]
- [[../05_BACKEND_ARCHITECTURE/Offline_Operation_Architecture]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/07_Cash_Drop_Feature]]
- [[Testing_Strategy]]
