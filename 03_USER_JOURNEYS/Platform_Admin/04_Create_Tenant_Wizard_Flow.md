<!-- title: Create Tenant Wizard Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Create Tenant Wizard Flow

## Purpose

Defines end-to-end tenant onboarding through the platform create tenant wizard.

## Actor

Platform Admin

## Source

Derived from `Slide 3 - Create Tenant Wizard Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin starts new tenant onboarding.

## Preconditions

- Platform Admin has create-tenant permission.
- Subscription catalog and entitlement catalog are available.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Start new tenant | System opens create tenant wizard. |
| 2 | Enter business info | Platform Admin provides business name, contact email, phone, currency, and time zone. |
| 3 | Enter tenant admin info | Platform Admin provides primary tenant admin name, email, and phone. |
| 4 | Assign package or subscription | Platform Admin selects base plan or subscription package. |
| 5 | Select add-ons | Platform Admin enables additional add-ons based on business needs. |
| 6 | Choose module and feature entitlements | Platform Admin selects modules/features the tenant can access. |
| 7 | Review billing summary | System shows selected plan, add-ons, entitlements, and estimated charges. |
| 8 | Choose billing mode | Platform Admin chooses pay now, send payment link, start trial, or demo access. |
| 9 | Optional setup checklist | Platform Admin may set outlet, till, roles, users, product onboarding, and online store setup. |
| 10 | Review and create tenant | System validates info, confirms selections, and creates tenant. |

## Data Used Or Captured

- Business profile
- Tenant admin profile
- Plan/package
- Add-ons
- Feature entitlements
- Billing mode
- Optional setup checklist

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Tenant admin email must be unique where required.
- Feature entitlement must come from platform catalog, not frontend hardcoding.

## Validation And Error Cases

- Duplicate tenant/contact
- Invalid plan or inactive package
- Missing required business/admin info
- Invalid billing mode
- Entitlement not available for selected plan

## Outcome

Tenant is created as pending activation or ready for activation based on billing mode and setup completion.

## Related Modules

- 01_Platform_Administration
- 02_Tenant_Foundation
- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage
- 05_Tenant_User_Permission_Access

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/02_Tenant_Foundation.md
- 06_DATABASE_KNOWLEDGE/Tables/03_04_Catalog_And_Subscription_Catalog_Plans_Addons_And_Entitlements.md

## Implementation Notes

- Optional setup steps are skippable; tenant can be created first and completed later.
