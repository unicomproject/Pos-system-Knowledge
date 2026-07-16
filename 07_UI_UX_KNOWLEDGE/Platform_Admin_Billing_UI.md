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
| Frontend implementation status | In Progress — Read-only Billing experience completed; mutation workflow pending |

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
- Invoice View action
- Invoice detail drawer
- Invoice metadata
- Invoice lifecycle dates
- Monetary summary
- Invoice line items
- Payment history
- Detail loading/error/not-found/retry states
- Payment loading/error/empty/retry states
- Drawer responsiveness
- Drawer keyboard accessibility
- Stale detail-response protection

### Pending

- Issue Invoice
- Mark Paid
- `platform.billing.manage` controls
- Mutation confirmation dialogs
- Invalid-transition handling
- Concurrency-conflict handling
- Mutation success refresh
- E2E and release verification

## Page Structure

### Implemented read-only behaviour

The implemented page uses focused components:

1. Page header with read-only indicator and refresh action.
2. Per-currency summary cards.
3. Search/filter toolbar.
4. Server-backed invoice table and pagination.
5. Invoice detail drawer or side panel with payment history.

### Pending mutation behaviour

Target-state additions not yet implemented:

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
controls. `platform.billing.manage` action visibility remains pending.

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
- Read-only View action with an accessible invoice-specific label.

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
- View emits the selected invoice ID to the parent Billing page. The table does
  not fetch invoice detail directly.

Target-state columns and actions not yet implemented:

- Plan/subscription context in the list row.
- Paid date column.
- Available mutation actions.

## Invoice Detail Drawer Or Panel

### Implemented read-only behaviour

The detail drawer is implemented as a right-side dialog on desktop and a
full-width sheet on small screens.

It shows:

- Invoice number, tenant name/code, display status, and currency.
- Plan and subscription identity when returned by the API.
- Invoice type, billing cycle, and billing-period dates.
- Lifecycle timestamps: created, issued, due, paid, and updated.
- Currency-aware monetary summary: subtotal, discount, tax, total, paid amount,
  and balance due.
- Invoice line items with quantity, unit price, discount, tax, and line total.
- Recorded payment history from the separate payments endpoint.

Behaviour:

- The Billing page owns detail and payment-history API orchestration.
- Detail and payment-history requests run independently and may complete out of
  order.
- Detail loading, invoice-not-found, general detail error, and detail retry are
  implemented.
- Payment loading, empty payment history, payment error, and payment retry are
  implemented.
- Payment-history failure does not hide successfully loaded invoice detail.
- Empty payment history is valid and is not presented as an error.
- Closing the drawer clears selected state and invalidates pending requests.
- Opening or closing detail does not reload summary or the invoice list.
- Search, filters, sorting, page number, and page size remain preserved.
- Stale detail and payment responses cannot overwrite a newer selected invoice.
- Escape closes the drawer. Focus moves into the drawer on open and is restored
  to the View trigger where practical.

### Pending mutation behaviour

Issue Invoice and Mark Paid remain pending in the Angular UI.

## Confirmed Actions

### Implemented read-only behaviour

- View invoice opens the detail drawer. It requires only `platform.billing.view`.

### Pending mutation behaviour

Target-state mutation behaviour. Not yet implemented in the Angular UI.

#### Issue Invoice

Show only when the user has `platform.billing.manage` and `canIssue` is true.
The confirmation names the invoice and explains the `DRAFT -> PENDING`
transition. Submit the latest invoice `updatedAt` as `expectedUpdatedAt`.

#### Mark Paid

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
| Detail loading | Drawer/panel loading state |
| Detail not found | Distinct invoice-not-found state with close recovery |
| Detail error | Safe message and detail retry for the selected invoice |
| Payment loading | Payment-history section loading state |
| Empty payment history | Clear empty message; not treated as an error |
| Payment error | Safe message and payment retry without closing the drawer |

| State | Target behaviour (not yet implemented) |
|---|---|
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
- The detail panel is a right-side drawer on desktop and a full-width sheet on
  small screens.
- Confirmation actions remain reachable without horizontal scrolling once
  mutation UI is added.

## Accessibility

Implemented:

- Semantic headings, form labels, table headers, and buttons.
- Sortable headers expose accessible current-direction state through `aria-sort`
  and screen-reader labels.
- Detail drawer uses dialog semantics with an accessible name.
- Close action has an accessible label.
- Escape closes the detail drawer.
- Focus moves into the drawer when opened and is restored on close where
  practical.
- Status badges remain visible as text and do not rely only on colour.
- View action is keyboard accessible and labelled with the invoice number.

Target-state additions:

- Trap focus in modal confirmation dialogs and support Escape/cancel.
- Announce conflicts and mutation success through appropriate live regions.

## Unsupported UI

Do not expose invoice creation, partial payment, overpayment, cancellation,
voiding, payment-link generation/resend, reminders, manual failed/overdue
mutation, or Billing-driven tenant suspension/activation.

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[02_ACCESS_CONTROL/Permission_Code_List]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
