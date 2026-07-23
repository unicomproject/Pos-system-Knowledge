<!-- title: Subscription And Billing Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# Subscription And Billing Management Flow

## Purpose

Separates the completed Platform Admin Billing management scope (overview,
invoice inspection, Issue Invoice, and Mark Paid) from unsupported future
tenant subscription, payment-link, trial, and add-on roadmap work.

## Actor

Platform Admin

## Source

Derived from `Slide 7 - Subscription / Billing Management Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens subscriptions or billing management.

## Preconditions

- Tenant has subscription/billing record for invoices under review.
- Platform Admin is authenticated.
- Read actions require `platform.billing.view`.
- Mutation actions require `platform.billing.manage`.

## Final Verdict

```text
BILLING PHASE 6 COMPLETED — RELEASE READY
```

## Supported Current Management Scope

Supported today:

- Billing overview
- Per-currency summary
- Invoice search/filter/sort/page
- Invoice detail
- Invoice lines
- Payment history
- Issue Invoice
- Mark Paid
- View/manage permission separation
- Eligibility flags (`canIssue`, `canMarkPaid`)
- Confirmation
- Validation
- Conflict handling
- Access denial
- Data refresh
- Responsive/accessibility behaviour

## Current Implemented Management Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Billing page | Route `/admin/billing` requires `platform.billing.view` and lazy-loads `PlatformBillingPage`. |
| 2 | View summary | Summary cards render paid revenue, outstanding amount, overdue amount, and invoice count per currency. Monetary values are never combined across currencies. |
| 3 | View invoice list | Invoice table loads real server-paged results from the billing API. |
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

## Mutation Management Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Check `platform.billing.manage` | Show mutation controls only when the user has manage permission and the API action flag allows the transition. |
| 2 | Issue a draft invoice | Requires `canIssue`; prepare `DRAFT -> PENDING` with the latest `updatedAt` as `expectedUpdatedAt`. |
| 3 | Confirm Issue action | Feature-owned confirmation dialog names the invoice and explains the transition. |
| 4 | Mark a pending invoice paid | Requires `canMarkPaid`; settle the whole invoice and transition `PENDING -> PAID` (eligible OVERDUE display included). |
| 5 | Confirm Mark Paid action | Feature-owned confirmation explains full settlement, omits `paidAt` by default, and does not accept a partial amount. |
| 6 | Handle invalid transition | Show HTTP 409 `platform_billing.invalid_transition` and reload current data. |
| 7 | Handle stale `expectedUpdatedAt` / concurrency conflict | Show HTTP 409 `platform_billing.concurrency_conflict`, reload the invoice, and require intentional retry. |
| 8 | Refresh after mutation | Refresh summary, invoice list, and the open detail using the returned latest `updatedAt`. Mark Paid also refreshes payment history. |

Mark Paid may leave payment history empty. That is valid current product
behaviour. The UI must not fabricate a payment transaction.

## Permission Journeys

### Billing Viewer

- Has `platform.billing.view`
- Does not have `platform.billing.manage`
- Full read experience
- No Issue Invoice or Mark Paid controls
- No mutation POST through normal UI

### Billing Manager

- Has view and manage
- Issue/Mark Paid appear only when backend eligibility flags allow them
- Confirmation, loading, duplicate prevention, and refresh apply

### No Billing Access

- Billing menu hidden
- Direct `/admin/billing` redirects to permission-denied
- Billing APIs return HTTP 403 `platform_billing.access_denied`
- No Billing data exposed

### Super Admin

- View and manage remain available for Billing
- Development test-account seeding must not regress Super Admin Billing access

## Unsupported Future Scope

Keep clearly separate from current Billing completion:

- Invoice creation
- Partial payment
- Cancel invoice
- Void invoice
- Overpayment
- Refund
- Payment gateway reconciliation (beyond PayHere Payment Links MVP)
- Automated reminders
- Auto-suspension
- Adjusting plan, add-ons, trial, demo, renewal, or expiry from Billing
- Upgrade or downgrade from Billing

Do not describe unsupported future capabilities as implemented.

## Platform Admin Invite Flow

The Development Platform Admin test accounts (backend PR #49 / verified main
`f8cf0b3`) are testing infrastructure only.

They do **not** complete:

- Invite token generation
- Invite delivery
- Accept invitation
- Initial password setup
- Password reset product flow

The full Platform Admin invite/auth flow remains future product work and is not
part of Billing completion.

## Planned Future Scope

- Subscription upgrade, downgrade, renewal, expiry, and history workflows.
- Add-on and trial/demo lifecycle actions.
- **Payment links (PayHere), public checkout, webhook settlement, revoke, history** — Release 1 mandatory; not yet implemented; final major Super Admin feature. [[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]]
- Reminders, automatic collection, and retry handling.
- Cancellation, voiding, credit notes, and partial-payment workflows after their
  backend contracts and audit requirements are approved.
- Full Platform Admin invite / accept-invite / set-password product flow.

## Data Used Or Captured

- Tenant name
- Current plan
- Billing cycle
- Next due date
- Amount due
- Payment status
- Stored status and derived `OVERDUE` display state
- `updatedAt` concurrency token
- Optional server-applied `paidAt` after Mark Paid

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Read actions require `platform.billing.view`.
- Issue and Mark Paid require `platform.billing.manage`.
- The frontend must send the latest `expectedUpdatedAt` and reload on a stale
  concurrency conflict without automatic retry.
- Monetary summaries must remain separated by currency.

## Validation And Error Cases

| Error | Behaviour |
|---|---|
| Invalid local date range | Blocks summary and invoice requests. |
| `platform_billing.validation_failed` | Keeps context available. |
| Permission denied / no view | Permission-denied route; APIs return 403 `platform_billing.access_denied`. |
| `platform_billing.invoice_not_found` | Invalidates stale detail and refreshes list. |
| Safe API errors with retry | Summary, invoices, detail, and payment history. |
| `platform_billing.invalid_transition` | Distinct message; reload latest data. |
| `platform_billing.concurrency_conflict` | “Updated elsewhere”; no automatic retry; reload latest data. |
| `platform_billing.access_denied` | Safe permission message for unauthorized mutation attempts. |

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

Platform Admin can safely inspect per-currency billing summary, search, filter,
sort, and page through real invoice records, open invoice detail with line items
and payment history, and perform Issue Invoice or Mark Paid when permitted and
eligible, with confirmation, conflict handling, and post-mutation refresh.

## Related Modules

- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
