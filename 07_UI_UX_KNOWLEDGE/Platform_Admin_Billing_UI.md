<!-- title: Platform Admin Billing UI -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-17 -->

# Platform Admin Billing UI

## Current Frontend Baseline

| Item | Current state |
|---|---|
| Route | `/admin/billing` |
| Route component | Lazy-loaded `PlatformBillingPage` |
| Route permission | `platform.billing.view` |
| Sidebar permission | `platform.billing.view` |
| Billing models, mapper, API service, page, components, and tests | Present |
| Mutation confirmation dialog | Present |
| Frontend implementation status | Completed — Release Ready |
| Merged frontend commit | `7eec3ad` (feature commit `c8a8992`) |
| Final verdict | `BILLING PHASE 6 COMPLETED — RELEASE READY` |

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
- Issue Invoice action
- Mark Paid action
- `platform.billing.manage` gating
- Backend `canIssue` / `canMarkPaid` eligibility gating
- Mutation confirmation dialogs
- Duplicate-submit prevention
- Invalid-transition handling
- Concurrency-conflict handling
- Access-denied handling
- Mutation success refresh
- Permission, responsive, accessibility, and release verification

## Page Structure

The implemented page uses focused components:

1. Page header with permission-aware status indicator and refresh action.
2. Per-currency summary cards.
3. Search/filter toolbar.
4. Server-backed invoice table and pagination.
5. Invoice detail drawer or side panel with payment history and action area.
6. Feature-owned confirmation dialog for Issue Invoice and Mark Paid.
7. Page-level success/error notification region for mutation outcomes.

## Permission Behaviour

### Read-only user

When the user has `platform.billing.view` but does not have
`platform.billing.manage`:

- Full summary, list, filter, detail, and payment-history access.
- Read-only status/badge or equivalent indicator.
- No Issue Invoice button.
- No Mark Paid button.
- No mutation POST through normal UI.

### Manage user

When the user has `platform.billing.manage`:

- Issue shown only when backend `canIssue=true`.
- Mark Paid shown only when backend `canMarkPaid=true`.
- Eligibility must not be derived only from display status.
- Backend remains authoritative for transition eligibility and permission
  enforcement.

### No Billing access

Users without `platform.billing.view` do not see the Billing menu. Direct
navigation to `/admin/billing` redirects to the permission-denied experience.
Billing APIs return HTTP 403 `platform_billing.access_denied` with no data
leakage.

Route/menu/action visibility is UX enforcement only; backend authorization is
authoritative.

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
- View action with an accessible invoice-specific label.

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

## Invoice Detail Drawer Or Panel

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
- Action area for Issue Invoice and Mark Paid when permitted and eligible.

Behaviour:

- The Billing page owns detail, payment-history, and mutation API orchestration.
- Detail and payment-history requests run independently and may complete out of
  order.
- Detail loading, invoice-not-found, general detail error, and detail retry are
  implemented.
- Payment loading, empty payment history, payment error, and payment retry are
  implemented.
- Payment-history failure does not hide successfully loaded invoice detail.
- Empty payment history is valid and is not presented as an error.
- Closing the drawer clears selected state and invalidates pending requests.
- Opening or closing detail does not reload summary or the invoice list until a
  successful mutation refreshes them.
- Search, filters, sorting, page number, and page size remain preserved.
- Stale detail and payment responses cannot overwrite a newer selected invoice.
- Escape closes the drawer. Focus moves into the drawer on open and is restored
  to the View trigger where practical.

### Final invoice-detail action area

- Issue Invoice appears only for manage users when `canIssue=true`.
- Mark Paid appears only for manage users when `canMarkPaid=true`.
- Actions are disabled while a mutation is busy.
- No unsupported actions (create, partial pay, cancel, void, refund, payment
  link, reminder, suspend) are shown.

## Confirmed Actions

### View invoice

View invoice opens the detail drawer. It requires only `platform.billing.view`.

### Issue Invoice

Show only when the user has `platform.billing.manage` and `canIssue` is true.

#### Issue Invoice dialog

- Invoice number
- Tenant
- Current state
- Draft → Pending explanation
- Confirm and Cancel
- Loading state while the request is in flight
- Duplicate-submit prevention
- Body includes `expectedUpdatedAt` from the latest invoice `updatedAt`
- Success message naming the issued invoice
- Refresh of summary, list, and open detail after success

### Mark Paid

Show only when the user has `platform.billing.manage` and `canMarkPaid` is true.

#### Mark Paid dialog

- Invoice number
- Tenant
- Outstanding amount
- Currency
- Mark Paid explanation (full settlement of the outstanding balance)
- Payment history may remain empty after success
- `paidAt` omitted by default
- Confirm and Cancel
- Loading state while the request is in flight
- Duplicate-submit prevention
- Accurate success message
- Summary, list, detail, and payment-history refresh after success

Mark Paid settles the invoice. It does **not** claim to create a
`SubscriptionPaymentTransaction`. Empty payment history after Mark Paid is valid
current product behaviour. The UI must not fabricate a payment transaction.

Only one mutation may be in flight for an invoice. Disable repeat submission.

## Required UI States

| State | Behaviour |
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
| Issue confirmation | Explicit transition and invoice identity |
| Mark-paid confirmation | Explicit full-settlement warning |
| Invalid transition | Handle HTTP 409 `platform_billing.invalid_transition`; reload data |
| Concurrency conflict | Handle HTTP 409 `platform_billing.concurrency_conflict`; reload before retry |
| Success | Announce success and refresh summary, list, and open detail |
| Mutation failure | Keep context, show safe error, allow intentional retry |
| No available action | Show no mutation controls; do not invent an action |
| Access denied | Safe permission message; hide mutation controls |

## Error UX

Documented Billing error codes and expected UI behaviour:

| Error code | Expected UX |
|---|---|
| `platform_billing.validation_failed` | Validation keeps context available; show a safe validation message. |
| `platform_billing.invoice_not_found` | Invalidate stale detail and refresh the invoice list. |
| `platform_billing.invalid_transition` | Distinct message; reload latest summary/list/detail; no automatic retry of the failed mutation. |
| `platform_billing.concurrency_conflict` | “Updated elsewhere” style message; do not automatically retry; reload latest data; user may retry with refreshed `expectedUpdatedAt`. |
| `platform_billing.access_denied` | Safe permission message; mutation controls remain unavailable. |

Unknown errors preserve already-loaded data where safe.

## Responsive Behaviour

Verified viewports:

- Desktop: `1440 × 900`
- Tablet: `768 × 1024`
- Mobile: `430 × 932`

Behaviour:

- Summary cards wrap by currency without hiding currency codes.
- Filters reflow to a vertical layout on narrow screens.
- Tables may use horizontal scrolling or a compact row layout; monetary/status
  context must remain visible.
- The detail panel is a right-side drawer on desktop and a full-width sheet on
  small screens.
- Detail drawer remains usable at all verified viewports.
- Confirmation dialog remains usable at all verified viewports.
- Confirmation actions remain reachable without horizontal scrolling.

## Accessibility

Verified:

- Semantic headings, form labels, table headers, and buttons.
- Sortable headers expose accessible current-direction state through `aria-sort`
  and screen-reader labels.
- Detail drawer uses dialog semantics with an accessible name.
- Confirmation dialog uses an accessible name.
- Close action has an accessible label.
- Escape closes the detail drawer and confirmation dialog.
- Focus moves into the drawer when opened and is restored on close where
  practical.
- Keyboard navigation of Billing controls and mutation confirmation.
- Status badges remain visible as text and do not rely only on colour.
- View action is keyboard accessible and labelled with the invoice number.
- Loading prevents duplicate confirmation submission.

## Unsupported UI

Do not expose invoice creation, partial payment, overpayment, cancellation,
voiding, payment-link generation/resend, reminders, manual failed/overdue
mutation, refund, payment gateway reconciliation, or Billing-driven tenant
suspension/activation.

## Accepted Release Verification Limitations

Accepted non-blocking local test-data limitations (not defects):

```text
Only LKR invoices were available locally.
No SubscriptionPaymentTransaction records were available.
The local invoice list fitted one page.
Invalid actions were hidden by eligibility, so invalid-transition UX was verified through API and automated tests.
Concurrency conflict was verified through stale expectedUpdatedAt API/session testing and frontend automated tests.
```

These do not block Billing release because per-currency grouping is covered by
automated tests, empty payment history is supported, pagination API/tests are
complete, invalid actions are correctly prevented, and backend concurrency
authority is verified.

## Release Evidence

### Frontend

```text
Repository: Nytroz-POS-Platform_Admin
Merged commit: 7eec3ad
Feature commit: c8a8992
Build: Passed
Test files: 42
Tests: 353 passed
```

### Backend

```text
Repository: Unified-Commerce
Current verified main: f8cf0b3
Build: Passed
Tests: 1035 passed
```

### Permission Browser Verification

```text
Manager: Verified
Billing Viewer: Verified
No Billing Access: Verified
Super Admin regression: Verified
```

### Final verdict

```text
BILLING PHASE 6 COMPLETED — RELEASE READY
```

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[02_ACCESS_CONTROL/Permission_Code_List]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
- [[03_USER_JOURNEYS/Platform_Admin/10_Billing_Flow]]
- [[03_USER_JOURNEYS/Platform_Admin/12_Subscription_Billing_Management_Flow]]
