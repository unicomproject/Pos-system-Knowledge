<!-- title: Tenant Activation Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Activation Flow

## Purpose

Defines how Platform Admin validates tenant readiness and activates the tenant account.

## Actor

Platform Admin

## Source

Derived from `Slide 7 - Tenant Activation Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens tenant activation readiness.

## Preconditions

- Tenant exists.
- Tenant is pending activation or ready for activation.
- Platform Admin has activation permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open tenant detail | Platform Admin opens tenant record. |
| 2 | Review setup readiness | System opens readiness/activation checklist. |
| 3 | Check business and admin details | System confirms business info and tenant admin are available. |
| 4 | Check plan and billing status | System verifies paid, trial, or demo status. |
| 5 | Validate module and feature entitlements | System confirms required features are enabled. |
| 6 | Review optional setup completion | Platform Admin checks outlet, till, users, products, and online store setup if applicable. |
| 7 | Click activate tenant | Platform Admin starts activation. |
| 8 | Confirm activation | System requests confirmation before status change. |
| 9 | Send invite and enable access | System sends tenant admin invite/password setup email and marks tenant active. |

## Data Used Or Captured

- Business info
- Tenant admin details
- Plan/billing status
- Feature entitlements
- Optional setup checklist
- Tenant status

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Mandatory checks must pass before activation.
- Optional setup can be completed later when activation mode allows it.

## Validation And Error Cases

- Missing business info
- Missing tenant admin
- Invalid billing mode
- Required entitlement missing
- Tenant already active/suspended

## Outcome

Tenant becomes active/ready and tenant users can access enabled platform features.

## Related Modules

- 02_Tenant_Foundation
- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage
- 05_Tenant_User_Permission_Access
- 06_Auth_Tokens_Security_Audit

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/02_Tenant_Foundation.md
- 06_DATABASE_KNOWLEDGE/Tables/07_Invitations_Authentication_Tokens_And_Security_Audit.md
