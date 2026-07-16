<!-- title: Subscription And Billing Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-16 -->

# Subscription And Billing Management Flow

## Purpose

Separates the currently implemented Platform Admin read-only Billing scope,
including invoice detail and payment history, from the pending mutation journey
and from the future tenant subscription, payment-link, trial, and add-on roadmap.

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
| 2 | View summary | Summary cards render paid revenue, outstanding amount, overdue amount, and invoice count per currency. Monetary values are never combined across currencies. |
| 3 | View invoice list | Read-only invoice table loads real server-paged results from the billing API. |
| 4 | Search invoices | 300ms debounced server-side search by invoice number, tenant name, or tenant code. |
| 5 | Filter invoices | Tenant, status, and issued/due date filters come from the real filter-options and query contract. |
| 6 | Sort invoices | Server-side sorting uses supported billing query fields with accessible `aria-sort` state. |
| 7 | Use server pagination | Page number and page size are server-backed. Active filters and sorting are preserved across pagination. |
| 8 | Select Invoice View | Accessible View action emits the selected invoice ID to the Billing page. |
| 9 | Open invoice details | Billing page opens a responsive accessible drawer and loads invoice detail from the real API. |
| 10 | Review line items | Drawer shows verified invoice lines, including empty and decimal-quantity handling. |
| 11 | Review payment history | Drawer shows recorded payment transactions, or a valid empty-history message when none exist. |
| 12 | Handle detail and payment retry states | Detail and payment-history loading, not-found, error, and retry states run independently. |
| 13 | Close drawer | Close control or Escape dismisses the drawer while preserving summary, search, filters, sorting, and pagination. |

The current Angular UI is read-only. It does not expose `platform.billing.manage`
action controls.

## Pending Mutation Flow

These journeys are not yet available in the Angular UI:

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Check `platform.billing.manage` | Show mutation controls only when the user has manage permission and the API action flag allows the transition. |
| 2 | Issue a draft invoice | Requires `canIssue`; prepare `DRAFT -> PENDING` with the latest `updatedAt` as `expectedUpdatedAt`. |
| 3 | Confirm Issue action | Feature-owned confirmation dialog names the invoice and explains the transition. |
| 4 | Mark a pending invoice paid | Requires `canMarkPaid`; settle the whole invoice and transition `PENDING -> PAID`. |
| 5 | Confirm Mark Paid action | Feature-owned confirmation explains full settlement and does not accept a partial amount. |
| 6 | Handle invalid transition | Show HTTP 409 `platform_billing.invalid_transition` and reload current data. |
| 7 | Handle stale `expectedUpdatedAt` / concurrency conflict | Show HTTP 409 `platform_billing.concurrency_conflict`, reload the invoice, and require intentional retry. |
| 8 | Refresh after mutation | Refresh summary, invoice list, and the open detail using the returned latest `updatedAt`. |

Issue Invoice and Mark Paid are supported by the backend but are not yet
implemented in the Angular UI.

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
- Safe API error messages with retry actions for summary, invoices, detail, and
  payment history.
- Invoice-not-found for missing detail records.

Pending mutation UI:

- Invalid invoice transition
- Stale invoice concurrency conflict

## Outcome

Platform Admin can safely inspect per-currency billing summary, search, filter,
sort, and page through real invoice records, and open a read-only invoice detail
drawer with line items and payment history while preserving list state.

## Related Modules

- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
