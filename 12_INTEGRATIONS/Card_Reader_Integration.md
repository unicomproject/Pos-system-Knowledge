<!-- title: Card Reader Integration -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# Card Reader Integration

## Canonical status (2026-08-16)

```text
PAYMENT TERMINAL / CARD READER: NOT IMPLEMENTED
Release scope: OUT OF CURRENT HARDWARE RELEASE (unless product reopens)
Overall hardware module: BLOCKED — HARDWARE NOT PRODUCTION READY
```

Do **not** confuse hardware registry type, card-terminal setting slot, mock, or
provider-neutral unavailable safety with a real payment-terminal integration.

Authority:
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
[[POS_Hardware_Integration]]

## Purpose

Define the provider-neutral terminal boundary and safe production requirements.

## Scope

Terminal assignment/pairing, capture outcomes, reconciliation, safe display,
terminal slips, POS receipts, recovery and physical certification.

## Production Architecture

Flutter checkout → backend payment command → `ICardPaymentGateway` → approved
provider adapter/terminal → provider result → backend atomic sale/payment →
authoritative POS receipt. Flutter never manufactures provider success.

## Component Responsibilities

Backend owns credentials, capture/reconciliation, persistence and safe response.
Flutter owns cashier state and typed handoff. Terminal owns its customer/merchant
slip; POS receipt is a separate backend-owned document.

## Supported Platforms And Transports

No provider, terminal model, SDK or transport is approved. Production support is
Blocked By External Dependency.

## Runtime Flow

Approved completes provider capture before sale commit. Declined, Cancelled,
Failed and Unavailable create no paid sale. Pending/Timeout/Unknown require
provider lookup/reconciliation before retry or completion.

## Configuration

Terminal is assigned to tenant/outlet/activated POS device/till. Pairing state,
provider configuration version, active status and shift changes are auditable.

## API Contract

`ICardPaymentGateway` accepts operation/sale context and exposes provider-neutral
capture, terminal-status, payment-status, cancel, void and refund boundaries.
Results use typed terminal/payment states and safe references where valid.
Current production implementation returns `card_provider_unavailable` and never
fabricates approval or references.

## Database And Audit Contract

Existing `sales_payments` and transaction/event tables store safe provider
reference/status/amount/currency/reconciliation. Never persist PAN, CVV, PIN,
track/EMV data, reusable token, credentials or raw response.

## Permission And Business Rules

Existing permission is `payments.card.accept`. Backend authorization, activated
device, assigned/open till and enabled method are required. Card must never be
stored as Cash and no fake fallback is allowed.

## Security Rules

Provider credentials are protected server-side. Use idempotency, verified
callbacks/status lookup, masked display and sanitized structured logs.

## Idempotency

Stable card operation identity crosses request, provider and persistence.
Unknown state is reconciled; blind capture retry is prohibited.

## Failure And Recovery Rules

Cashier receives outcome-specific safe guidance. Reconciliation mismatch blocks
completion and requires operational review. No sensitive provider payload is shown.

## Offline Behavior

Card capture/finalization is online-only.

## Automated Testing

Current tests prove provider-unavailable capture/status, unsupported refund/void,
safe disabled terminal configuration and test-only checkout outcomes. They do
not prove a production provider.

## Physical Verification

Not Run. No terminal/provider sandbox or physical certification evidence exists.

## Production Definition Of Done

Provider approval, terminal assignment, all outcomes, reconciliation, security,
receipts/slips, automated tests and physical certification must pass.

## Current Implementation Status

```text
NOT IMPLEMENTED — production provider / terminal adapter absent
```

Provider-neutral safety boundary and unavailable-by-default UI exist. That is
**not** implementation of a payment terminal.

If reopened for release, Hardware Code Chunk 5 applies only after Chunks 1–4
physical gates for required peripherals.

## Known Gaps

Provider/terminal decision, real adapter, provider-backed pairing/status,
persisted operation lifecycle, callback/status reconciliation, slips,
operational support and physical certification.

## Implementation Sequence

Hardware Chunk 5 follows device/test-audit foundation and approved provider.

## Hardware Chunk 5 Result — 2026-07-29

The provider-neutral contract now distinguishes initiated, awaiting-card,
processing, pending, authorized, completed, declined, cancelled, failed,
unknown, provider-unavailable, terminal-unavailable and expired outcomes.
Terminal status distinguishes not-configured, provider-unavailable,
pairing-required, offline, busy, ready and unknown.

Device-scoped terminal configuration contains only non-secret references,
connection mode, optional local-service URL, pairing status, bounded timeout/
poll interval, currency and slip ownership. With no installed provider, only a
disabled unpaired configuration can be persisted; enabling or claiming pairing
is blocked.

Flutter Card Payment shows an explicit unavailable state and states that no
charge was initiated. Hardware Testing remains blocked and never charges.

Status:

`HARDWARE CHUNK 5 PARTIALLY IMPLEMENTED — REAL PROVIDER/TERMINAL BLOCKED`.

## Related Files

- [[Payment_Gateway_Integration]]
- [[../03_USER_JOURNEYS/Cashier/07_Payment_Flow]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
- [[../13_DECISIONS_AND_CHANGES/Open_Questions]]


## Tenant Admin Monitoring Boundary (2026-08-01)

Card-reader status on Till monitoring is provider-derived (PAIRED/ONLINE/OFFLINE/UNPAIRED/UNKNOWN/NEEDS_ATTENTION). Never store PAN/CVV. Tenant Admin only displays Backend-safe status.

Status: **NOT IMPLEMENTED** / **PHYSICAL VERIFICATION PENDING**.

See [[POS_Hardware_Integration]].
