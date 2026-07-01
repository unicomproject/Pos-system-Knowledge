<!-- title: Subscription And Billing Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Subscription And Billing Management Flow

## Purpose

Defines how Platform Admin manages tenant plans, invoices, payment status, trials, add-ons, and subscription changes.

## Actor

Platform Admin

## Source

Derived from `Slide 7 - Subscription / Billing Management Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens subscriptions or billing management.

## Preconditions

- Tenant has subscription/billing record.
- Platform Admin has subscription/billing permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open subscriptions/billing | System opens billing management area. |
| 2 | Search or select tenant subscription | Platform Admin finds target tenant plan. |
| 3 | View current plan and billing status | System displays plan, amount due, due date, and current status. |
| 4 | Review invoice and payment history | Platform Admin checks invoices and historical payments. |
| 5 | Take billing action | Platform Admin opens billing action menu. |
| 6 | Adjust plan/add-ons/trial | Platform Admin changes plan, add-ons, trial, or demo state. |
| 7 | Send payment link or record status | Platform Admin resends payment link or updates payment state. |
| 8 | Save changes and update subscription | System persists billing configuration. |

## Data Used Or Captured

- Tenant name
- Current plan
- Billing cycle
- Next due date
- Amount due
- Payment status
- Trial/demo status
- Add-ons

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Changes to plan or billing status must update tenant subscription record immediately.
- Plan changes must honor active catalog/entitlement rules.

## Validation And Error Cases

- Invalid plan transition
- Payment status conflict
- Add-on unavailable
- Trial extension not allowed
- Invoice not found

## Outcome

Tenant billing and subscription details are updated and ready for follow-up actions.

## Related Modules

- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/03_04_Catalog_And_Subscription_Catalog_Plans_Addons_And_Entitlements.md
- 06_DATABASE_KNOWLEDGE/Tables/05_Subscription_Billing_Payments_And_Usage.md
