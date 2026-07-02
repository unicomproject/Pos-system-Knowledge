<!-- title: Tenant Admin Billing Subscription Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Billing Subscription Management Flow

## Purpose

Defines tenant admin view of billing, invoices, plan, payment state, and upgrade request/payment flow.

## Actor

Tenant Admin

## Source

Derived from `Slide 18 - Billing / Subscription Management Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens billing/subscription.

## Preconditions

- Tenant has subscription/billing record.
- Tenant Admin has billing view/manage permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open billing/subscription | System opens billing page. |
| 2 | View current plan | System shows current plan. |
| 3 | View billing status | System shows active/pending/failed status. |
| 4 | View next due date | System shows next due date. |
| 5 | View invoice history | System lists invoices. |
| 6 | Generate available plans | System shows permitted plan options. |
| 7 | Choose or upgrade plan | Tenant Admin selects upgrade/change where allowed. |
| 8 | Review charges and benefits | System shows billing impact. |
| 9 | Confirm and proceed to payment | Tenant Admin confirms payment flow if required. |
| 10 | Payment successful | System updates subscription status. |
| 11 | Payment failed | System shows retry/support path. |

## Data Used Or Captured

- Current plan
- Billing status
- Next due date
- Invoice history
- Available plans
- Payment status

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Payment result must be backend/provider validated.
- Plan upgrades must follow platform catalog and entitlement rules.

## Validation And Error Cases

- Payment failed
- Plan unavailable
- Permission denied
- Invoice unavailable

## Outcome

Tenant billing/subscription state is visible and update path is handled safely.

## Related Modules

- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/05_Subscription_Billing_Payments_And_Usage.md
