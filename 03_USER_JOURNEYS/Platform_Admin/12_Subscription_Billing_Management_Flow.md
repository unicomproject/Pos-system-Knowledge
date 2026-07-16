<!-- title: Subscription And Billing Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-16 -->

# Subscription And Billing Management Flow

## Purpose

Separates the currently implemented Platform Admin read-only Billing scope from
the pending invoice-detail, payment-history, and mutation journeys, and from the
future tenant subscription, payment-link, trial, and add-on roadmap.

## Actor

Platform Admin

## Source

Derived from `Slide 7 - Subscription / Billing Management Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens subscriptions or billing management.

## Preconditions

- Tenant has subscription/billing record.
- Platform Admin has `platform.billing.view`.

## Current Implemented Read-only Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Billing page | Route `/admin/billing` requires `platform.billing.view` and lazy-loads `PlatformBillingPage`. |
| 2 | View separate currency summaries | Summary cards render paid revenue, outstanding amount, overdue amount, and invoice count per currency. Monetary values are never combined across currencies. |
| 3 | View invoices | Read-only invoice table loads real server-paged results from the billing API. |
| 4 | Search invoices | 300ms debounced server-side search by invoice number, tenant name, or tenant code. |
| 5 | Filter by tenant | Tenant options come from `/filter-options`; no tenant values are hardcoded in the UI. |
| 6 | Filter by status | Status options come from `/filter-options`. Supported values are `DRAFT`, `PENDING`, derived `OVERDUE`, and `PAID`. |
| 7 | Filter by issued or due date | Date field supports `issuedAt` or `dueAt` with optional `dateFrom` and `dateTo`. Local validation blocks requests when `dateFrom > dateTo`. |
| 8 | Sort supported columns | Server-side sorting uses supported billing query fields. Sortable headers expose accessible `aria-sort` state. |
| 9 | Use server pagination | Page number and page size are server-backed. Active filters and sorting are preserved across pagination. |
| 10 | Refresh and retry | Refresh reloads summary and invoices with the active query. Failed requests expose independent retry actions. |

The current Angular UI is read-only. It does not expose `platform.billing.manage`
action controls.

## Pending Management Flow

These journeys are not yet available in the Angular UI:

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open invoice detail | Load invoice metadata, plan/subscription context, amounts, stored/display status, dates, and line items from the invoice-detail endpoint. |
| 2 | Review invoice line items | Display real invoice lines with quantity, unit price, discounts, tax, and line total. |
| 3 | Review payment history | View recorded transactions from the payment-history endpoint. Empty payment history is valid. |
| 4 | Issue a draft invoice | Requires `platform.billing.manage` plus `canIssue`; send latest `updatedAt` as `expectedUpdatedAt` and transition `DRAFT -> PENDING`. |
| 5 | Mark a pending invoice paid | Requires `platform.billing.manage` plus `canMarkPaid`; settle the whole invoice and transition `PENDING -> PAID`. |
| 6 | Handle invalid transition | Show HTTP 409 `platform_billing.invalid_transition` and reload current data. |
| 7 | Handle optimistic concurrency conflict | Show HTTP 409 `platform_billing.concurrency_conflict`, reload the invoice, and require intentional retry. |

The backend contract supports detail reads and mutations, but the Angular UI has
not yet implemented invoice detail, payment history, mutation controls,
confirmation dialogs, or conflict handling.

## Unsupported In Current Platform Billing API

- Creating an invoice from the Billing page.
- Adjusting plan, add-ons, trial, demo, renewal, or expiry from Billing.
- Upgrade or downgrade.
- Partial payment, overpayment, cancellation, or voiding.
- Payment-link generation/resend and reminders.
- Manual failed or overdue status mutation.

## Planned Future Scope

- Subscription upgrade, downgrade, renewal, expiry, and history workflows.
- Add-on and trial/demo lifecycle actions.
- Payment links, reminders, automatic collection, and retry handling.
- Cancellation, voiding, credit notes, and partial-payment workflows after their
  backend contracts and audit requirements are approved.

## Data Used Or Captured

- Tenant name
- Current plan
- Billing cycle
- Next due date
- Amount due
- Payment status
- Stored status and derived `OVERDUE` display state
- `updatedAt` concurrency token

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Read actions require `platform.billing.view`.
- Issue and Mark Paid will require `platform.billing.manage` when mutation UI is implemented.
- The frontend must send the latest `expectedUpdatedAt` and reload on a stale
  concurrency conflict once mutation UI is implemented.
- Monetary summaries must remain separated by currency.

## Validation And Error Cases

Current implemented UI:

- Invalid local date range blocks summary and invoice requests.
- Permission denied for users without `platform.billing.view`.
- Safe API error messages with retry actions for summary and invoices.

Pending management UI:

- Invalid invoice transition
- Stale invoice concurrency conflict
- Invoice not found

## Outcome

Platform Admin can safely inspect per-currency billing summary and search, filter,
sort, and page through real invoice records in the current read-only Billing UI.

## Related Modules

- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
