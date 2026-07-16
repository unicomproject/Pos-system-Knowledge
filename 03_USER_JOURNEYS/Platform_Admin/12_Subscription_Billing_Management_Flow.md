<!-- title: Subscription And Billing Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-15 -->

# Subscription And Billing Management Flow

## Purpose

Separates the currently implemented Platform Admin invoice-management scope from
the future tenant subscription, payment-link, trial, and add-on roadmap.

## Actor

Platform Admin

## Source

Derived from `Slide 7 - Subscription / Billing Management Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens subscriptions or billing management.

## Preconditions

- Tenant has subscription/billing record.
- Platform Admin has subscription/billing permission.

## Current Implemented Scope

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Billing | Route requires `platform.billing.view`; current Angular component is the `AdminSectionPage` placeholder. |
| 2 | Find invoices | Search and tenant/status/date filters load real server results. |
| 3 | Review invoice | View plan/subscription context, amounts, stored/display status, dates, and line items. |
| 4 | Review payment history | View recorded transactions; an empty history is valid. |
| 5 | Issue invoice | `platform.billing.manage` plus `canIssue`; send latest `updatedAt` as `expectedUpdatedAt`. |
| 6 | Mark invoice paid | `platform.billing.manage` plus `canMarkPaid`; settle the whole invoice. |

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
- Read actions require `platform.billing.view`; mutations require
  `platform.billing.manage`.
- The frontend must send the latest `expectedUpdatedAt` and reload on a stale
  concurrency conflict.
- Monetary summaries must remain separated by currency.

## Validation And Error Cases

- Invalid invoice transition
- Stale invoice concurrency conflict
- Invoice not found

## Outcome

Platform Admin can safely inspect invoices and advance only the implemented
`DRAFT -> PENDING -> PAID` lifecycle.

## Related Modules

- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
