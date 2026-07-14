<!-- title: Platform Billing Flow -->
<!-- status: Active -->
<!-- system: Unified Commerce Release 1 -->
<!-- last_updated: 2026-07-13 -->

# Platform Billing Flow

## Purpose

Defines the implemented Release 1 Platform Admin workflow for subscription invoices. This document supersedes the older payment-link/reminder/suspension flow for R1.

## Preconditions

- The Platform Admin is authenticated.
- Read operations require `platform.billing.view`.
- Invoice transitions require `platform.billing.manage`.
- Invoices are created by the tenant onboarding/subscription workflow. Manual invoice creation is not a Billing R1 capability.

## Main Flow

1. Open `/admin/billing`.
2. Load the summary, tenant/status filter options, and first server-paged invoice result.
3. Search by invoice number or tenant, or filter by tenant, status, issue/due date range.
4. Sort and page using server-side query parameters.
5. Open an invoice at `/admin/billing/invoices/{invoiceId}` to review amounts, billing period, line items, and recorded payment transactions. The route supports direct entry, refresh, browser back, retry, and closing back to `/admin/billing`.
6. If the stored status is `DRAFT`, an authorized user may issue it.
7. If the stored status is `PENDING`, an authorized user may mark it paid.
8. Reload after success or after a concurrency conflict.

## Status Truth

| Stored status | Display status | Allowed R1 transition |
|---|---|---|
| `DRAFT` | Draft | `DRAFT -> PENDING` (Issue) |
| `PENDING`, due date not passed | Pending | `PENDING -> PAID` (Mark paid) |
| `PENDING`, due date passed | Overdue | `PENDING -> PAID` (Mark paid) |
| `PAID` | Paid | None |

`OVERDUE` is derived at read time; it is not stored. `PAST_DUE`, `CANCELLED`, and `VOID` invoice transitions are not invented for R1.

## KPI Definitions

- Paid Revenue: sum of `total_amount` for paid invoices in the selected date/filter scope.
- Outstanding: sum of `balance_due` for stored `PENDING` invoices, including pending invoices displayed as Overdue. `DRAFT` invoices are not issued and therefore do not count as outstanding.
- Overdue: sum of `balance_due` for unpaid stored `PENDING` invoices whose `due_at` is before the server clock. Draft invoices are never treated as overdue.
- Total Invoices: count in the selected filter scope.
- Monetary values are grouped by `currency_code`; currencies are never added together.

## Concurrency And Errors

- Commands send the invoice `updated_at` value read by the UI.
- `updated_at` is an EF concurrency token and protects the final update.
- Stale updates return `platform_billing.concurrency_conflict` with HTTP 409.
- Invalid transitions return `platform_billing.invalid_transition` with HTTP 409.
- Missing invoices return HTTP 404; permission failures return HTTP 403.

## Explicitly Deferred

Gateway integration, automatic charging, live payment-link generation/resend, reminders, refunds, credit-note actions, accounting, suspension automation, advanced usage billing, and manual invoice creation.

## Related Files

- [[../../04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/03_Technical_Contract]]
- [[../../15_IMPLEMENTATION_TRACKING/Backend/Subscription/Platform_Billing_R1_Implementation_Status]]
- [[../../15_IMPLEMENTATION_TRACKING/Angular/Subscription/Platform_Billing_R1_UI_Implementation_Status]]
