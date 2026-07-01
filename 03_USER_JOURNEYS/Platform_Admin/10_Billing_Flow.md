<!-- title: Billing Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Billing Flow

## Purpose

Defines how Platform Admin follows up tenant billing, payment links, reminders, activation, and suspension outcomes.

## Actor

Platform Admin

## Source

Derived from `Slide 6 - Billing Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens billing management.

## Preconditions

- Tenant billing record exists.
- Platform Admin has billing permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open billing management | System opens billing module. |
| 2 | View billing list | System loads tenant billing records. |
| 3 | Search or select tenant | Platform Admin selects target tenant. |
| 4 | Review billing details | System shows invoice/payment details. |
| 5 | Choose billing action | Platform Admin chooses action based on payment status. |
| 6 | If payment completed | System activates or continues tenant and updates invoice as paid. |
| 7 | If payment pending | Platform Admin may send reminder, monitor due date, keep tenant active, and update billing record. |
| 8 | If failed or overdue | Platform Admin may resend payment link, mark failed/overdue, suspend tenant if policy applies, and update billing record. |

## Data Used Or Captured

- Tenant billing record
- Invoice status
- Payment status
- Due date
- Reminder state
- Suspension state
- Audit log

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Paid status activates or continues tenant service.
- Suspension happens only if billing policy or grace period requires it.

## Validation And Error Cases

- Payment link generation failed
- Invalid billing status transition
- Tenant suspension blocked by policy
- Concurrent payment update

## Outcome

Tenant billing state is updated and platform action is auditable.

## Related Modules

- 04_Subscription_Billing_Usage
- 02_Tenant_Foundation
- 26_Notification

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/05_Subscription_Billing_Payments_And_Usage.md
