<!-- title: Platform Admin Billing UI -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-16 -->

# Platform Admin Billing UI

## Current Frontend Baseline

| Item | Current state |
|---|---|
| Route | `/admin/billing` |
| Route component | Lazy-loaded `PlatformBillingPage` |
| Route permission | `platform.billing.view` |
| Sidebar permission | `platform.billing.view` |
| Billing models, mapper, API service, page, components, and tests | Present |
| Frontend implementation status | In Progress — summary, invoice list, pagination, filters, and sorting completed |

`/admin/billing` no longer uses `AdminSectionPage`. Runtime Billing data comes only
from the real Platform Admin Billing API documented in
[[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]. The UI must not introduce
mock billing rows.

See [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
for phase-level progress and verification evidence.

## Implementation Status

### Completed

- Billing route integration
- Billing page
- Per-currency summary cards
- Invoice list
- Server pagination
- Search
- Tenant filter
- Status filter
- Date filters
- Date validation
- Server sorting
- Loading, error, empty, and retry states

### Pending

- Invoice detail
- Invoice line items
- Payment history
- Issue Invoice
- Mark Paid
- Mutation permissions
- Confirmation dialogs
- Invalid-transition handling
- Concurrency-conflict handling

## Page Structure

The implemented page uses focused components:

1. Page header with read-only indicator and refresh action.
2. Per-currency summary cards.
3. Search/filter toolbar.
4. Server-backed invoice table and pagination.

Target-state additions not yet implemented:

5. Invoice detail drawer or side panel.
6. Feature-owned confirmation dialog for mutations.
7. Page-level success/error notification region for mutation outcomes.

## Permission Behaviour

- Page, menu, summary, list, detail, and payment history require
  `platform.billing.view`.
- Issue and Mark Paid require `platform.billing.manage` and the corresponding
  API action flag.
- A view-only user receives the full read experience without mutation controls.
- Route/menu/action visibility is UX enforcement only; backend authorization is
  authoritative.

The current page shows a read-only label and does not expose Issue or Mark Paid
controls.

## Billing Summary

Implemented behaviour:

- Render a separate monetary summary for every returned currency.
- Show paid revenue, outstanding amount, overdue amount, and currency invoice
  count.
- Never add LKR, USD, or other currencies into one monetary value.
- A combined total invoice count may be shown separately.
- Empty filtered summaries must not fall back to hardcoded zero-currency cards.

## Invoice Filters

Implemented filter toolbar behaviour:

- 300ms debounced search by invoice number, tenant name, or tenant code.
- Search input values are trimmed before API requests.
- Tenant selector populated from `/filter-options`.
- Status selector populated from `/filter-options`.
- Supported status values: `DRAFT`, `PENDING`, `OVERDUE`, and `PAID`.
- Date field: `issuedAt` or `dueAt`.
- Optional inclusive `dateFrom` and `dateTo` values.
- Local invalid-date-range validation blocks summary and invoice API calls when
  `dateFrom > dateTo`.
- Clear/reset action restores documented default filters and sorting while
  preserving the current page size.

Filters update summary and list from the same filter snapshot. A filter or sort
change resets the list to page 1. Pagination and refresh preserve the active
filter and sort state.

## Invoice Table

Implemented columns:

- Invoice number and created date.
- Tenant name and code.
- Currency.
- Total, paid, and balance due with currency formatting.
- Display status.
- Issued and due dates.

Implemented behaviour:

- Sorting is server-side and limited to `createdAt`, `invoiceNumber`, `tenant`,
  `amount`, `status`, `issuedAt`, and `dueAt`, with `asc` or `desc` direction.
- Sortable headers expose accessible `aria-sort` state.
- No client-side invoice filtering or sorting is performed.
- Pagination is server-side using `pageNumber`, `pageSize`, `totalCount`, and
  `totalPages`.
- Previous/next actions are disabled when unavailable.
- Filters are retained while changing pages.
- Loading skeleton, empty state, and independent invoice error/retry states are
  implemented.

Target-state columns and actions not yet implemented:

- Plan/subscription context in the list row.
- Paid date column.
- Available mutation actions.

## Invoice Detail Drawer Or Panel

Target-state requirement. Not yet implemented.

The detail view must show:

- Invoice, tenant, subscription, and plan identity.
- Stored and display status.
- Currency-aware totals.
- Billing period and lifecycle timestamps.
- Invoice line items with quantity, unit price, discounts, tax, and line total.
- Recorded payment history including provider, reference, status, amount, fees,
  net amount, and timestamps.

Detail loading and error states are independent from the list. Empty payment
history is valid and must not be presented as an error.

## Confirmed Actions

Target-state mutation behaviour. Not yet implemented in the Angular UI.

### Issue Invoice

Show only when the user has `platform.billing.manage` and `canIssue` is true.
The confirmation names the invoice and explains the `DRAFT -> PENDING`
transition. Submit the latest invoice `updatedAt` as `expectedUpdatedAt`.

### Mark Paid

Show only when the user has `platform.billing.manage` and `canMarkPaid` is true.
The confirmation explains that the whole balance will be settled. It must not
request a partial or overpayment amount. Submit the latest `updatedAt` and an
optional `paidAt`.

Only one mutation may be in flight for an invoice. Disable repeat submission.

## Required UI States

| State | Current behaviour |
|---|---|
| Initial loading | Page-level loading/skeleton without fake monetary values |
| Filter loading | Filter options show loading/error/retry; filters disable while options load |
| Empty result | Explain that no invoices match |
| API error | Safe message and retry action for summary and invoices independently |
| Permission denied | Existing Platform Admin permission-denied route/state |
| Read-only mode | Full reads, no mutation controls, explanatory read-only label |

| State | Target behaviour (not yet implemented) |
|---|---|
| Detail loading | Drawer/panel loading state |
| Detail not found | Close/recover safely and offer list refresh |
| Issue confirmation | Explicit transition and invoice identity |
| Mark-paid confirmation | Explicit full-settlement warning |
| Invalid transition | Handle HTTP 409 `platform_billing.invalid_transition`; reload data |
| Concurrency conflict | Handle HTTP 409 `platform_billing.concurrency_conflict`; reload before retry |
| Success | Announce success and refresh summary, list, and open detail |
| Mutation failure | Keep context, show safe error, allow intentional retry |
| No available action | Show no mutation menu; do not invent an action |

## Responsive Behaviour

- Summary cards wrap by currency without hiding currency codes.
- Filters reflow to a vertical layout on narrow screens.
- Tables may use horizontal scrolling or a compact row layout; monetary/status
  context must remain visible.
- The detail panel becomes a full-width sheet on small screens.
- Confirmation actions remain reachable without horizontal scrolling.

## Accessibility

Implemented:

- Semantic headings, form labels, table headers, and buttons.
- Sortable headers expose accessible current-direction state through `aria-sort`
  and screen-reader labels.

Target-state additions:

- Move focus into opened dialogs/panels and restore it on close.
- Trap focus in modal confirmation dialogs and support Escape/cancel.
- Announce loading, errors, conflicts, and success through appropriate live
  regions without relying only on color.
- Status badges and disabled actions require text explanations.

## Unsupported UI

Do not expose invoice creation, partial payment, overpayment, cancellation,
voiding, payment-link generation/resend, reminders, manual failed/overdue
mutation, or Billing-driven tenant suspension/activation.

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[02_ACCESS_CONTROL/Permission_Code_List]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
