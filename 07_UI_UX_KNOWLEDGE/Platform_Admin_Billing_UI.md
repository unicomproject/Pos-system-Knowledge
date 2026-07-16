<!-- title: Platform Admin Billing UI -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-15 -->

# Platform Admin Billing UI

## Current Frontend Baseline

| Item | Current state |
|---|---|
| Route | `/admin/billing` |
| Route component | `AdminSectionPage` placeholder |
| Route permission | `platform.billing.view` |
| Sidebar permission | `platform.billing.view` |
| Dedicated Billing models/mapper/service/page/components/tests | Not present |
| Frontend implementation status | Not Started |

The implementation must replace `AdminSectionPage` at `/admin/billing`. It must
use the real contract in [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
and must not introduce mock billing rows.

## Page Structure

Use separate focused components rather than one monolithic page:

1. Page header and read-only indicator when applicable.
2. Per-currency summary cards.
3. Search/filter toolbar.
4. Server-backed invoice table and pagination.
5. Invoice detail drawer or side panel.
6. Feature-owned confirmation dialog for mutations.
7. Page-level success/error notification region.

## Permission Behaviour

- Page, menu, summary, list, detail, and payment history require
  `platform.billing.view`.
- Issue and Mark Paid require `platform.billing.manage` and the corresponding
  API action flag.
- A view-only user receives the full read experience without mutation controls.
- Route/menu/action visibility is UX enforcement only; backend authorization is
  authoritative.

## Billing Summary

- Render a separate monetary summary for every returned currency.
- Show paid revenue, outstanding amount, overdue amount, and currency invoice
  count.
- Never add LKR, USD, or other currencies into one monetary value.
- A combined total invoice count may be shown separately.
- Empty filtered summaries must not fall back to hardcoded zero-currency cards.

## Invoice Filters

The filter toolbar supports:

- Debounced search by invoice number, tenant name, or tenant code.
- Tenant selector populated from `/filter-options`.
- Status selector populated from `/filter-options`.
- Date field: `issuedAt` or `dueAt`.
- Inclusive `dateFrom` and `dateTo` values.
- Clear/reset action.

Filters must update summary and list from the same filter snapshot. A filter
change resets the list to page 1.

## Invoice Table

Recommended columns:

- Invoice number.
- Tenant.
- Plan/subscription.
- Stored/display status.
- Total, paid, and balance with currency.
- Issued, due, and paid dates.
- Available actions.

Sorting is server-side and limited to `createdAt`, `invoiceNumber`, `tenant`,
`amount`, `status`, `issuedAt`, and `dueAt`, with `asc` or `desc` direction.

Pagination is server-side using `pageNumber`, `pageSize`, `totalCount`, and
`totalPages`. Disable unavailable previous/next actions and retain filters while
changing pages.

## Invoice Detail Drawer Or Panel

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

| State | Required behaviour |
|---|---|
| Initial loading | Page-level loading/skeleton without fake monetary values |
| Filter loading | Preserve existing layout, indicate refresh, prevent duplicate requests |
| Empty result | Explain that no invoices match; allow filters to be cleared |
| API error | Safe message and retry action |
| Permission denied | Existing Platform Admin permission-denied route/state |
| Detail loading | Drawer/panel loading state |
| Detail not found | Close/recover safely and offer list refresh |
| Issue confirmation | Explicit transition and invoice identity |
| Mark-paid confirmation | Explicit full-settlement warning |
| Invalid transition | Handle HTTP 409 `platform_billing.invalid_transition`; reload data |
| Concurrency conflict | Handle HTTP 409 `platform_billing.concurrency_conflict`; reload before retry |
| Success | Announce success and refresh summary, list, and open detail |
| Mutation failure | Keep context, show safe error, allow intentional retry |
| No available action | Show no mutation menu; do not invent an action |
| Read-only mode | Full reads, no mutation controls, optional explanatory label |

## Responsive Behaviour

- Summary cards wrap by currency without hiding currency codes.
- Filters reflow to a vertical layout on narrow screens.
- Tables may use horizontal scrolling or a compact row layout; monetary/status
  context must remain visible.
- The detail panel becomes a full-width sheet on small screens.
- Confirmation actions remain reachable without horizontal scrolling.

## Accessibility

- Use semantic headings, form labels, table headers, and buttons.
- Give sortable headers an accessible current-direction state.
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
