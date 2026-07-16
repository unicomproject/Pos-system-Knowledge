<!-- title: Billing Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-16 -->

# Billing Flow

## Purpose

Defines the current implemented Platform Admin Billing read-only flow, including
invoice detail and payment history, and preserves mutation, reminder,
payment-link, activation, and suspension journeys as pending or planned future
scope.

## Actor

Platform Admin

## Source

Derived from `Slide 6 - Billing Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens billing management.

## Preconditions

- Tenant billing record exists.
- Platform Admin has `platform.billing.view`.

## Current Implemented Read-only Flow

```text
Platform Admin
→ Open Billing
→ View per-currency summary
→ Search, filter and sort invoices
→ Select View on an invoice
→ Open invoice detail drawer
→ Review invoice metadata
→ Review invoice line items
→ Review payment history
→ Close the drawer
→ Return to the preserved invoice list state
```

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Billing | Angular route `/admin/billing` requires `platform.billing.view` and lazy-loads `PlatformBillingPage`. |
| 2 | View summary | Backend returns filtered currency-grouped summary from `GET /api/v1/platform-admin/billing/summary`. Monetary totals remain separated by currency. |
| 3 | Load invoice list | Backend returns server-paged invoices from `GET /api/v1/platform-admin/billing/invoices`. |
| 4 | Search, filter, and sort | Debounced search, tenant/status/date filters, and server-side sorting update summary and list from the same query snapshot. |
| 5 | Select View | Accessible View action emits the selected invoice ID. The table does not fetch detail itself. |
| 6 | Open invoice detail drawer | Billing page opens a dialog panel and loads `GET /api/v1/platform-admin/billing/invoices/{invoiceId}` and `GET /api/v1/platform-admin/billing/invoices/{invoiceId}/payments` independently. |
| 7 | Review invoice metadata | Drawer shows invoice number, tenant, status, currency, plan/subscription identity, lifecycle dates, and currency-aware monetary totals. |
| 8 | Review invoice line items | Drawer shows verified line-item fields, including decimal quantity support and an empty line-item state. |
| 9 | Review payment history | Payment section shows recorded transactions, or a valid empty-history message when none exist. |
| 10 | Close the drawer | Close button, backdrop click, or Escape closes the drawer, clears selected state, and invalidates pending requests. Summary, filters, sorting, and pagination remain preserved. |

### Implemented detail and payment states

| State | Behaviour |
|---|---|
| Detail loading | Detail skeleton while the invoice-detail request is in flight |
| Detail not found | Distinct invoice-not-found recovery with close action |
| Detail error and retry | Safe error message and retry that reloads only the selected invoice detail |
| Payment loading | Payment-history section loading state |
| Empty payment history | Clear empty message; not treated as an error |
| Payment error and retry | Safe error message and retry that reloads only payment history; loaded invoice detail remains visible |
| Escape and close | Escape and the accessible close control dismiss the drawer and restore focus where practical |

The current page is read-only. It does not expose Issue Invoice or Mark Paid
controls.

## Pending Mutation Journeys

These journeys are not yet available in the Angular UI:

```text
Issue draft invoice
Mark pending invoice paid
```

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Issue eligible draft | With `platform.billing.manage`, an invoice with `canIssue` transitions `DRAFT -> PENDING`. |
| 2 | Mark eligible invoice paid | With `platform.billing.manage`, an invoice with `canMarkPaid` transitions `PENDING -> PAID` and is fully settled. |
| 3 | Refresh after mutation | UI reloads summary, list, and detail and uses the returned latest `updatedAt`. |

Both mutations require `expectedUpdatedAt`. Invalid transitions and stale writes
return distinct HTTP 409 errors. The backend contract supports these actions, but
the Angular UI does not yet expose mutation controls or confirmation dialogs.

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
- Issue and Mark Paid require `platform.billing.manage` when mutation UI is implemented.
- Frontend visibility does not replace backend permission enforcement.
- Different currencies must never be combined into one monetary total.

## Validation And Error Cases

Current implemented UI:

- Invalid local date range blocks summary and invoice requests.
- Permission denied for users without `platform.billing.view`.
- Safe API error messages with retry actions for summary and invoices.
- Invoice-not-found for missing detail records.
- Independent payment-history errors that do not erase loaded invoice detail.

Pending mutation UI:

- Invalid billing status transition
- Stale `expectedUpdatedAt`

## Outcome

Platform Admin can review per-currency billing summary, search, filter, sort, and
page through real invoice records, and open a read-only invoice detail drawer
with line items and payment history while preserving list state.

## Related Modules

- 04_Subscription_Billing_Usage
- 02_Tenant_Foundation
- 26_Notification

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
