<!-- title: Platform Billing Functional Specification -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-15 -->

# Platform Billing Functional Specification

## Purpose

This specification defines the current Platform Admin Billing Management business
scope. It is intentionally narrower than the long-term subscription billing,
payment-link, credit-note, usage, and automated collection platform.

The exact implemented HTTP contract is documented in
[[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]].

## Current Business Scope

Platform Admin users may:

- View filtered currency-grouped billing summaries.
- Search, filter, sort, and page through subscription invoices.
- View invoice metadata and line items.
- View recorded payment-history transactions.
- Issue an existing draft invoice.
- Mark an existing pending invoice fully paid.

There is no current Platform Billing action to create a new invoice.

## Invoice Lifecycle

Stored statuses:

- `DRAFT`
- `PENDING`
- `PAID`

Derived display/filter status:

- `OVERDUE`: stored status is `PENDING` and `dueAt` is earlier than current UTC.

`OVERDUE` is not persisted as a separate lifecycle state. An overdue invoice
remains `PENDING` and remains eligible for Mark Paid.

Allowed lifecycle:

```text
DRAFT -> PENDING -> PAID
```

## Issue Invoice

- Requires `platform.billing.manage`.
- Available only when the API returns `canIssue: true`.
- Accepts only a `DRAFT` invoice.
- Requires the current `expectedUpdatedAt` concurrency value.
- Sets stored status to `PENDING` and records the issue timestamp.
- A stale invoice or invalid status is not silently overwritten.

## Mark Paid

- Requires `platform.billing.manage`.
- Available only when the API returns `canMarkPaid: true`.
- Accepts only a `PENDING` invoice, including one displayed as `OVERDUE`.
- Requires the current `expectedUpdatedAt` concurrency value.
- Optional `paidAt` defaults to server time.
- Settles the entire invoice: paid amount becomes total amount and balance due
  becomes zero.
- No partial amount or overpayment amount is accepted.

## Read-Only Behaviour

Users with `platform.billing.view` but without `platform.billing.manage` may use
all supported read operations. Issue and Mark Paid controls must be absent or
non-actionable. Hiding controls is not authorization; the backend still enforces
`platform.billing.manage`.

## Payment History

Payment history reads recorded subscription payment transactions for an invoice.
It may legitimately be empty. Mark Paid may settle an invoice without creating a
new payment-history transaction, so the UI must not fabricate a transaction row.

## Multi-Currency Rules

- Currency belongs to each invoice and payment record.
- Summary monetary values are grouped by currency.
- Never combine LKR, USD, or other currency amounts into one monetary total.
- A combined invoice count is allowed because it is non-monetary.
- Amount formatting must retain the associated currency code.

## Permission Rules

| Capability | Required permission |
|---|---|
| Menu, page, summary, list, detail, payments, filters | `platform.billing.view` |
| Issue invoice | `platform.billing.manage` |
| Mark invoice paid | `platform.billing.manage` |

See [[02_ACCESS_CONTROL/Permission_Code_List]] for the page/action
mapping.

## Unsupported Current Actions

The current Platform Admin Billing API does not expose:

- New invoice creation.
- Partial-payment mutation.
- Overpayment.
- Cancellation or voiding.
- Failed-status mutation.
- Manual overdue-status mutation.
- Payment-link generation or resend.
- Reminder delivery.
- Automatic tenant suspension or activation from the Billing endpoint.
- Plan upgrade, downgrade, renewal, or expiry management.

The UI must not offer these actions.

## Current Scope Versus Future Roadmap

| Capability | Classification |
|---|---|
| Summary/list/detail/payment-history reads | Current Implemented Scope |
| Issue existing draft | Current Implemented Scope |
| Mark existing pending invoice fully paid | Current Implemented Scope |
| New invoice creation | Unsupported in Current Platform Billing API |
| Partial payment, overpayment, cancel, void | Unsupported in Current Platform Billing API |
| Payment links, reminders, automated collections | Release 1 mandatory (links) — **not yet implemented**; reminders/collections later |
| Subscription upgrade/downgrade/renewal/expiry | Planned Future Scope |
| Billing-driven tenant suspension/activation workflow | Planned Future Scope |
| Credit-note administration UI | Planned Future Scope |

Future work must receive a verified backend contract before being presented as
implemented behaviour.

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Payment_Links_Implementation_Readiness_Checklist]]
- [[15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-07-20-full-system-status/SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]]
