<!-- title: Billing Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-17 -->

# Billing Flow

## Purpose

Defines the completed Platform Admin Billing journey for read, permission, Issue
Invoice, and Mark Paid flows against the real Platform Admin Billing API, and
keeps unsupported reminder, payment-link, activation, and suspension journeys as
future scope.

## Actor

Platform Admin

## Source

Derived from `Slide 6 - Billing Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens billing management.

## Preconditions

- Tenant billing record exists for invoices under review.
- Platform Admin is authenticated.
- Read actions require `platform.billing.view`.
- Mutation actions require `platform.billing.manage`.

## Final Verdict

```text
BILLING PHASE 6 COMPLETED — RELEASE READY
```

## Billing Viewer Journey

```text
Login
→ Billing menu visible
→ Open Billing
→ View per-currency summary
→ Search/filter/sort/paginate invoices
→ View invoice detail
→ View line items
→ View payment history or empty state
→ No Issue/Mark Paid controls
→ Close detail
```

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Login | Viewer authenticates with `platform.billing.view` and without `platform.billing.manage`. |
| 2 | Open Billing | Menu is visible. Route `/admin/billing` lazy-loads `PlatformBillingPage`. |
| 3 | View summary and list | Summary, filters, sorting, pagination, detail, and payment history work. |
| 4 | Review detail | Drawer shows metadata, lines, and payment history or a valid empty state. |
| 5 | Mutation controls | Issue Invoice and Mark Paid are hidden. No mutation POST through normal UI. |

## Billing Manager Journey

```text
Login
→ Billing menu visible
→ Open Billing
→ Select invoice
→ View detail and eligibility
→ Issue Invoice or Mark Paid
→ Review confirmation
→ Confirm mutation
→ Loading/duplicate protection
→ Backend validates permission, lifecycle and expectedUpdatedAt
→ Success feedback
→ Summary/list/detail refresh
→ Payment history refresh for Mark Paid
```

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Login | Manager authenticates with `platform.billing.view` and `platform.billing.manage`. |
| 2 | Open Billing | Route `/admin/billing` requires view permission and loads real Billing APIs. |
| 3 | Select invoice | Accessible View action opens the detail drawer. |
| 4 | Review eligibility | Issue appears only when `canIssue=true`; Mark Paid only when `canMarkPaid=true`. |
| 5 | Confirm mutation | Feature-owned dialog shows invoice identity and transition explanation. |
| 6 | Submit | UI sends `expectedUpdatedAt`; loading disables duplicate submit. |
| 7 | Success | Success feedback; summary, list, and detail refresh. Mark Paid also refreshes payment history. |

## No-Billing Journey

```text
Login
→ Billing menu hidden
→ Direct /admin/billing route
→ Redirect to permission-denied
→ Billing APIs return 403 access_denied
→ No Billing data exposed
```

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Login | Account authenticates without `platform.billing.view` or `.manage`. |
| 2 | Menu | Billing menu item is hidden. |
| 3 | Direct route | `/admin/billing` redirects to permission-denied. |
| 4 | API | Billing endpoints return HTTP 403 `platform_billing.access_denied` with no data leakage. |

## Current Implemented Read Flow

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

## Issue Invoice Flow

```text
DRAFT
→ Issue confirmation
→ POST issue with expectedUpdatedAt
→ PENDING
→ Display may be OVERDUE when due date has passed
```

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Offer Issue | Requires `platform.billing.manage` and backend `canIssue=true`. |
| 2 | Confirm | Dialog names invoice, tenant, current state, and Draft → Pending meaning. |
| 3 | Submit | `POST .../invoices/{id}/issue` with `{ expectedUpdatedAt }`. |
| 4 | Result | Invoice becomes `PENDING`. Display status may later show `OVERDUE` when due date has passed; `OVERDUE` remains a display/filter concern. |

## Mark Paid Flow

```text
PENDING or eligible OVERDUE
→ Mark Paid confirmation
→ POST mark-paid with expectedUpdatedAt
→ paidAt omitted by default
→ PAID
```

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Offer Mark Paid | Requires `platform.billing.manage` and backend `canMarkPaid=true`. |
| 2 | Confirm | Dialog shows invoice, tenant, outstanding amount, currency, and full-settlement explanation. |
| 3 | Submit | `POST .../invoices/{id}/mark-paid` with `{ expectedUpdatedAt }` only by default. |
| 4 | Result | Invoice becomes `PAID`. Summary, list, detail, and payment history refresh. |

State clearly:

- Mark Paid may leave payment history empty.
- This is valid current product behaviour.
- UI must not fabricate a payment transaction.

## Conflict Flow

```text
Stale expectedUpdatedAt
→ 409 concurrency_conflict
→ No automatic retry
→ Reload latest summary/list/detail
→ User reviews latest data
→ User may retry using refreshed state
```

Invalid transition flow:

```text
Ineligible lifecycle state
→ 409 invalid_transition
→ Distinct message
→ Reload latest data
→ UI eligibility continues to hide invalid actions in the normal path
```

## Unsupported In Current Platform Billing API

- Create a new invoice.
- Enter a partial payment or overpayment.
- Cancel or void an invoice.
- Manually set failed or overdue status.
- Generate or resend a payment link.
- Send reminders.
- Activate or suspend a tenant through the Billing endpoint.
- Refund or payment gateway reconciliation.

The current UI must not expose these actions.

## Planned Future Scope

- Payment-link generation and resend.
- Payment reminders and delivery tracking.
- Failed-payment handling and retry workflows.
- Policy-driven tenant activation, grace period, and suspension integration.
- Partial payment, cancellation, void, and credit-note workflows only after
  separate verified contracts are approved.
- Full Platform Admin invite / accept-invite / set-password product flow.
  Development Platform Admin test accounts used for permission verification are
  testing infrastructure only and do not complete that product flow.

## Data Used Or Captured

- Tenant billing record
- Invoice status
- Payment status
- Due date
- Stored status and derived display status
- Invoice `updatedAt` concurrency timestamp
- Optional server-applied `paidAt` after Mark Paid

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Read actions require `platform.billing.view`.
- Issue and Mark Paid require `platform.billing.manage`.
- Frontend visibility does not replace backend permission enforcement.
- Different currencies must never be combined into one monetary total.

## Validation And Error Cases

| Error | Behaviour |
|---|---|
| Invalid local date range | Blocks summary and invoice requests. |
| `platform_billing.validation_failed` | Keeps context available with a safe validation message. |
| Permission denied / no view | Permission-denied route; Billing APIs return 403 `platform_billing.access_denied`. |
| `platform_billing.invoice_not_found` | Invalidates stale detail and refreshes list. |
| Safe API errors with retry | Summary, invoices, detail, and payment history. |
| `platform_billing.invalid_transition` | Distinct message; reload latest data. |
| `platform_billing.concurrency_conflict` | “Updated elsewhere”; no automatic retry; reload latest data. |
| `platform_billing.access_denied` | Safe permission message for mutation attempts. |

## Accepted Release Verification Limitations

Accepted non-blocking local test-data limitations (not defects):

```text
Only LKR invoices were available locally.
No SubscriptionPaymentTransaction records were available.
The local invoice list fitted one page.
Invalid actions were hidden by eligibility, so invalid-transition UX was verified through API and automated tests.
Concurrency conflict was verified through stale expectedUpdatedAt API/session testing and frontend automated tests.
```

These are not Billing release blockers: per-currency grouping is covered by
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

## Outcome

Platform Admin can review per-currency billing summary, search, filter, sort, and
page through real invoice records, open invoice detail with line items and
payment history, and — when permitted and eligible — Issue Invoice or Mark Paid
with confirmation, concurrency protection, and post-mutation refresh while
preserving list query state for read navigation.

## Related Modules

- 04_Subscription_Billing_Usage
- 02_Tenant_Foundation
- 26_Notification

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
