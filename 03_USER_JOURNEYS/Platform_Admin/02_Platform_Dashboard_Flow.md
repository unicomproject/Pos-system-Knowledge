<!-- title: Platform Dashboard Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

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
- Dashboard API data is available (`platform.dashboard.view`).

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Load dashboard | System fetches `GET /api/v1/platform-admin/dashboard`. |
| 2 | Display KPI summary | Total tenants, active subscriptions, MRR placeholder, items requiring attention (sum of attention counts), system health. |
| 3 | Show subscription health snapshot | Active vs at-risk subscription counts derived from totals. |
| 4 | Show attention items | Four attention rows from API `attentionItems` (not invented metrics). |
| 5 | Open attention card | Navigates with the correct filter (see metric definitions). |
| 6 | Show recent tenant activity | Latest five tenants by `createdAt` (name + tenant status). |
| 7 | Show tenant status snapshot | Active / Trial / Suspended / Inactive derived counts. |
| 8 | Select target module | Quick link to tenant list and other permitted modules. |

## Attention metric definitions (authoritative)

| Type | Included | Excluded / notes |
|---|---|---|
| `suspended_tenants` | Tenant status `suspended` | Case-insensitive match |
| `setup_pending` | Tenant status `setup_pending` **or** `pending_payment` | Other statuses excluded |
| `past_due_subscriptions` | Subscription status `PAST_DUE` | Not invoice overdue; not tenant billing enum |
| `pending_billing` | Invoices with status `PENDING` and `balance_due > 0` | Draft/paid invoices excluded |
| Soft-deleted tenants | Tenants table has no soft-delete filter on dashboard | Outlets/tills/users exclude `DELETED` |
| Overlap | Allowed — one tenant may contribute to multiple categories | |
| Items requiring attention | Sum of the four attention counts | Issue sum, not distinct tenants |
| Timezone | Status counts; `generatedAt` is UTC | No expiry-window metric in current contract |

Metrics **not** in the current API contract (do not invent): expiring subscriptions, inactive-tenant attention row, monthly revenue series, unique-tenant attention total.

## Card navigation

| Attention type | Destination |
|---|---|
| `suspended_tenants` | `/admin/tenants?status=suspended` |
| `setup_pending` | `/admin/tenants?status=setup_pending` |
| `past_due_subscriptions` | `/admin/tenants?billingStatus=PAST_DUE` (list BillingStatus = subscription status) |
| `pending_billing` | `/admin/billing` |

## Access And Security Rules

- Platform Admin must be authenticated.
- Dashboard requires `platform.dashboard.view`.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Sensitive billing details must be shown only to permitted platform users.

## Validation And Error Cases

- Dashboard API unavailable → error state with retry
- Zero counts must render as `0`
- Loading state until first successful response

## Outcome

Platform Admin gets accurate platform status and can navigate to filtered tenant or billing views.

## SA-P0-02 note

Prior defect: backend assigned pending-invoice count to `past_due_subscriptions` and PAST_DUE subscription count to `pending_billing`. Fixed 2026-07-20. See [[SA-P0-02_Dashboard_Attention_Count_Fix]].

## Related Modules

- 01_Platform_Administration
- 04_Subscription_Billing_Usage
- 27_Reporting_Analytics

## Related Files

- 05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md
- 13_DECISIONS_AND_CHANGES/ADR/ADR_003_Feature_Based_Access.md
- 15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-07-20-full-system-status/SA-P0-02_Dashboard_Attention_Count_Fix.md
