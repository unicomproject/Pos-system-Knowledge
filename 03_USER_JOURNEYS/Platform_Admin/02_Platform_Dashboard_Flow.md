<!-- title: Platform Dashboard Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Platform Dashboard Flow

## Purpose

Defines what Platform Admin sees and can do after successful login.

## Actor

Platform Admin

## Source

Derived from `Slide 2 - Platform Dashboard Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Login succeeds and redirects to dashboard.

## Preconditions

- Platform Admin is authenticated.
- Platform permissions are loaded.
- Dashboard API data is available.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Load dashboard | System initializes dashboard layout and fetches platform data. |
| 2 | Display KPI summary | System shows total tenants, active tenants, trial/demo tenants, pending payments, and monthly revenue. |
| 3 | Show subscription and revenue snapshot | System summarizes subscription health, plan distribution, and revenue trend. |
| 4 | Show alerts and notifications | System highlights overdue payments, expiring subscriptions, inactive tenants, and system notifications. |
| 5 | Show recent tenant activity | System lists latest tenant actions. |
| 6 | Show quick actions | System provides shortcuts for create tenant, tenant management, billing, audit logs, and system settings. |
| 7 | Select target module | Platform Admin chooses the module to manage. |
| 8 | Navigate to next screen | System opens the selected module with context and filters. |

## Data Used Or Captured

- Tenant counts
- Subscription status counts
- Billing/revenue metrics
- Alert counts
- Recent activity events
- Quick action permissions

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Dashboard metrics must respect platform-admin permission scope.
- Sensitive billing details must be shown only to permitted platform users.

## Validation And Error Cases

- Dashboard API unavailable
- User lacks permission for a widget/action
- Metrics delayed or partially unavailable

## Outcome

Platform Admin gets platform status and can navigate to detailed management tasks.

## Related Modules

- 01_Platform_Administration
- 04_Subscription_Billing_Usage
- 27_Reporting_Analytics

## Related Files

- 05_BACKEND_ARCHITECTURE/API_Standards.md
- 13_DECISIONS_AND_CHANGES/ADR/ADR_003_Feature_Based_Access.md
