<!-- title: Billing Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-16 -->

# Billing Flow

## Purpose

Defines the current implemented Platform Admin Billing read-only flow and
preserves invoice detail, payment history, mutation, reminder, payment-link,
activation, and suspension journeys as pending or planned future scope.

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
→ Load per-currency summary
→ Load invoice list
→ Search/filter/sort invoices
→ Change page or page size
→ Refresh or retry failed requests
```

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Billing | Angular route `/admin/billing` requires `platform.billing.view` and lazy-loads `PlatformBillingPage`. |
| 2 | Load summary | Backend returns filtered currency-grouped summary from `GET /api/v1/platform-admin/billing/summary`. Monetary totals remain separated by currency. |
| 3 | Load invoice list | Backend returns server-paged invoices from `GET /api/v1/platform-admin/billing/invoices`. |
| 4 | Search invoices | 300ms debounced server-side search by invoice number, tenant name, or tenant code. Search input is trimmed before the API request. |
| 5 | Filter invoices | Tenant and status options come from `GET /api/v1/platform-admin/billing/filter-options`. Supported statuses are `DRAFT`, `PENDING`, derived `OVERDUE`, and `PAID`. Date filters support `issuedAt` or `dueAt` with optional `dateFrom` and `dateTo`. |
| 6 | Validate date range | Local validation blocks summary and invoice requests when `dateFrom > dateTo`. |
| 7 | Sort invoices | Server-side sorting uses supported fields from the billing query contract. Sortable headers expose accessible `aria-sort` state. No client-side invoice sorting is performed. |
| 8 | Change page or page size | Server pagination preserves the active filter and sort snapshot. Filter or sort changes reset page number to 1. |
| 9 | Refresh or retry | Refresh reloads summary and invoices with the active query. Failed summary or invoice requests expose independent retry actions. Stale in-flight responses cannot overwrite newer data. |

The current page is read-only. It does not expose Issue Invoice or Mark Paid
controls.

## Pending Next-step Journeys

These journeys are not yet available in the Angular UI:

```text
Select invoice
→ View invoice detail
→ View payment history
```

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Select invoice | Open invoice detail from the list. |
| 2 | View invoice detail | Load invoice metadata, line items, and currency-aware totals from `GET /api/v1/platform-admin/billing/invoices/{invoiceId}`. |
| 3 | View payment history | Load recorded transactions from `GET /api/v1/platform-admin/billing/invoices/{invoiceId}/payments`. Empty payment history is valid. |

## Pending Mutation Journeys

These journeys are not yet available in the Angular UI:

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

Pending mutation UI:

- Invalid billing status transition
- Stale `expectedUpdatedAt`
- Invoice not found

## Outcome

Platform Admin can review per-currency billing summary and search, filter, sort,
and page through real invoice records in the current read-only Billing UI.

## Related Modules

- 04_Subscription_Billing_Usage
- 02_Tenant_Foundation
- 26_Notification

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
