<!-- title: Billing Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-15 -->

# Billing Flow

## Purpose

Defines the current implemented Platform Admin Billing flow and preserves
longer-term reminder, payment-link, activation, and suspension ideas as planned
future scope.

## Actor

Platform Admin

## Source

Derived from `Slide 6 - Billing Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens billing management.

## Preconditions

- Tenant billing record exists.
- Platform Admin has billing permission.

## Current Implemented Scope

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Billing | Angular route `/admin/billing` requires `platform.billing.view`; it currently renders `AdminSectionPage` until the Billing UI is implemented. |
| 2 | Load summary and invoices | Backend loads filtered currency-grouped summary and server-paged invoices from `/api/v1/platform-admin/billing`. |
| 3 | Search or filter | Platform Admin filters by tenant, `DRAFT`, `PENDING`, derived `OVERDUE`, `PAID`, or issued/due date. |
| 4 | Review details | Platform Admin views invoice metadata, line items, and recorded payment history. |
| 5 | Issue eligible draft | With `platform.billing.manage`, an invoice with `canIssue` transitions `DRAFT -> PENDING`. |
| 6 | Mark eligible invoice paid | With `platform.billing.manage`, an invoice with `canMarkPaid` transitions `PENDING -> PAID` and is fully settled. |
| 7 | Refresh after mutation | UI reloads summary/list/detail and uses the returned latest `updatedAt`. |

Both mutations require `expectedUpdatedAt`. Invalid transitions and stale writes
return distinct HTTP 409 errors.

## Unsupported In Current Platform Billing API

- Create a new invoice.
- Enter a partial payment or overpayment.
- Cancel or void an invoice.
- Manually set failed or overdue status.
- Generate or resend a payment link.
- Send reminders.
- Activate or suspend a tenant through the Billing endpoint.

The current UI must not expose these actions.

## Planned Future Scope

- Payment-link generation and resend.
- Payment reminders and delivery tracking.
- Failed-payment handling and retry workflows.
- Policy-driven tenant activation, grace period, and suspension integration.
- Partial payment, cancellation, void, and credit-note workflows only after
  separate verified contracts are approved.

## Data Used Or Captured

- Tenant billing record
- Invoice status
- Payment status
- Due date
- Stored status and derived display status
- Invoice `updatedAt` concurrency timestamp

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Read actions require `platform.billing.view`.
- Issue and Mark Paid require `platform.billing.manage`.
- Frontend visibility does not replace backend permission enforcement.
- Different currencies must never be combined into one monetary total.

## Validation And Error Cases

- Invalid billing status transition
- Stale `expectedUpdatedAt`
- Invoice not found
- Permission denied

## Outcome

The current invoice state is visible and eligible draft/pending invoices can be
advanced safely through the implemented lifecycle.

## Related Modules

- 04_Subscription_Billing_Usage
- 02_Tenant_Foundation
- 26_Notification

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
