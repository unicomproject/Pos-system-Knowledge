<!-- title: Tenant Admin Pre-Login Payment Trial Demo Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Pre-Login Payment Trial Demo Flow

## Purpose

Defines how a tenant reaches first access depending on payment now, trial, or demo setup selected by Platform Admin.

## Actor

Tenant Admin

## Source

Derived from `Slide 1 - Tenant Admin Pre-Login Payment / Trial / Demo Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin creates tenant and selects billing mode.

## Preconditions

- Tenant has been created by Platform Admin.
- Billing mode is selected.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Platform Admin creates tenant | System creates tenant record. |
| 2 | Check billing option | System branches by Payment Now, Trial, or Demo. |
| 3 | Payment Now selected | System sends payment link email to Tenant Admin. |
| 4 | Tenant Admin opens payment link | System shows billing summary. |
| 5 | Enter payment details and pay | Payment provider/backend validates payment. |
| 6 | Payment successful | System activates tenant and sends setup email. |
| 7 | Payment failed | System shows failure and allows retry. |
| 8 | Trial or Demo selected | System sends setup email only. |
| 9 | Tenant Admin sets password | System activates login path. |
| 10 | Login to system | Tenant Admin reaches dashboard when allowed. |

## Data Used Or Captured

- Tenant billing mode
- Payment link
- Billing summary
- Payment status
- Setup email
- Tenant activation status

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Payment result must be backend/provider validated.
- Payment link and setup link must not expose raw tokens.

## Validation And Error Cases

- Payment failed
- Payment retry required
- Expired payment link
- Expired setup link
- Tenant not activated

## Outcome

Tenant Admin receives setup/login access according to billing mode.

## Related Modules

- 02_Tenant_Foundation
- 04_Subscription_Billing_Usage
- 06_Auth_Tokens_Security_Audit

## Related Files

- 03_USER_JOURNEYS/Platform_Admin/04_Create_Tenant_Wizard_Flow.md
- 06_DATABASE_KNOWLEDGE/Tables/05_Subscription_Billing_Payments_And_Usage.md
