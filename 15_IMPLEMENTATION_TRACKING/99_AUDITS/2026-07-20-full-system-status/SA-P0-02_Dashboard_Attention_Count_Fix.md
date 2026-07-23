<!-- title: SA-P0-02 Dashboard Attention Count Fix -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# SA-P0-02 — Platform Admin dashboard attention count accuracy (COMPLETE)

## Status

**COMPLETE** (source + automated tests + local API/DB agreement verified).

Browser click-through UI rendering is **UNVERIFIED** in this session (no interactive browser automation available). Dashboard JSON, PostgreSQL counts, and tenant-list filter APIs were verified against local Development servers.

## Branches

| Repo | Branch | Base commit (SA-P0-01 tip) |
|---|---|---|
| Unified-Commerce | `fix/platform-admin-dashboard-attention-counts` | `dfdf9c2` |
| nytroz-pos-platform-admin | `fix/platform-admin-dashboard-attention-counts` | `616f32c` |
| Pos-system-Knowledge | `docs/platform-admin-dashboard-attention-counts` | `875abc8` |

## Root cause (confirmed)

| Claim | Verdict |
|---|---|
| Attention counts swapped / wrong labels | **Correct** — backend swapped counts between `past_due_subscriptions` and `pending_billing` |
| Dashboard billing status hardcoded `"UNKNOWN"` | **Incorrect as a runtime defect** — unused `TenantSnapshot.BillingStatus = "UNKNOWN"` was never returned on the dashboard DTO; recent tenants use tenant `Status` |

### Exact defect

In `PlatformDashboardRepository.GetDashboardAsync`:

- `past_due_subscriptions` attention item was assigned `pendingBilling` (PENDING invoices with balance due)
- `pending_billing` attention item was assigned `pastDueSubscriptions` (subscription status `PAST_DUE`)

Titles/types were correct; **counts and descriptions were crossed**.

Frontend mapper already preserved backend titles/counts without remapping types. Integration tests previously asserted both counts as `1`, so the swap was invisible.

## Correct mapping

| UI Label | FE property | BE `attentionItems[].type` | Backend definition |
|---|---|---|---|
| Suspended Tenants | `attention[].count` where type `suspended_tenants` | `suspended_tenants` | Tenants with status `suspended` |
| Setup Pending | `setup_pending` | `setup_pending` | Tenant status `setup_pending` **or** `pending_payment` |
| Past Due Subscriptions | `past_due_subscriptions` | `past_due_subscriptions` | `tenant_subscriptions.subscription_status = PAST_DUE` |
| Pending Billing | `pending_billing` | `pending_billing` | `subscription_invoices` with `invoice_status = PENDING` and `balance_due > 0` |
| Items Requiring Attention | `kpis.itemsRequiringAttention` | *(derived FE)* | **Sum of attention counts** (issue sum, not unique tenants) |
| Pending billing KPI / top-level | `pendingBillingCount` | `pendingBillingCount` | Same as pending billing attention |

`PendingBillingCount` on the response root always matched invoice pending logic; only the attention-item assignment was swapped.

## Card navigation

| Attention type | Route | Query |
|---|---|---|
| `suspended_tenants` | `/admin/tenants` | `status=suspended` |
| `setup_pending` | `/admin/tenants` | `status=setup_pending` |
| `past_due_subscriptions` | `/admin/tenants` | `billingStatus=PAST_DUE` |
| `pending_billing` | `/admin/billing` | *(none)* |

Note: tenant-list `billingStatus` filter matches **current subscription status** (list DTO field named BillingStatus), so `PAST_DUE` is correct for past-due subscriptions.

## Metric rules

| Rule | Definition |
|---|---|
| Soft-deleted tenants | Tenants table has no soft-delete filter in dashboard query; outlets/tills/users exclude status `DELETED` |
| Overlap | A tenant may appear in multiple attention categories |
| Total attention | Sum of category counts (issues), not distinct tenants |
| Date / timezone | Counts are status-based; `generatedAt` is UTC from `IDateTimeProvider` |
| Expiring subscriptions | **Not** in current API contract — do not invent |
| Overdue unpaid | Represented as `past_due_subscriptions` (subscription) and/or `pending_billing` (invoice), not a separate “overdue” attention type |

## Files changed

### Backend

- `PlatformDashboardRepository.cs` — correct count wiring; remove unused `"UNKNOWN"` snapshot field
- `PlatformDashboardRepositoryTests.cs` — asymmetric swap regression test (2 past due vs 1 pending invoice)

### Frontend

- `platform-dashboard-page.ts` — RouterLink attention rows + query params
- `platform-tenant-list-page.ts` — apply `status` / `billingStatus` query params
- `platform-dashboard.mapper.spec.ts` — no-swap + zero rendering
- `platform-dashboard-page.spec.ts` — navigation/filter coverage

## Runtime evidence (2026-07-20 local)

| Item | Value |
|---|---|
| Backend | `http://localhost:5150` |
| Frontend | `http://127.0.0.1:4200` (HTTP 200; proxy → `:5150`) |
| Database | `UnifiedCommerceDb` @ `localhost:5432` |
| Login | Development platform admin seed |
| GET `/api/v1/platform-admin/dashboard` | suspended=2, setup_pending=0, past_due_subscriptions=0, pending_billing=2, pendingBillingCount=2 |
| DB | suspended=2, past_due_subs=0, pending invoices=2, setup_pending=0 |
| Filter `tenants?status=suspended` | totalCount=2 |
| Filter `tenants?billingStatus=PAST_DUE` | totalCount=0 |
| Browser UI pixel verify | **UNVERIFIED** |

## Tests (2026-07-20)

| Suite | Result |
|---|---|
| `dotnet build` Release | Pass |
| Unit `FullyQualifiedName~Platform` | **191** pass |
| ApiTests `FullyQualifiedName~Platform` | **100** pass |
| Integration `Platform\|SubscriptionBilling` | **173** pass (+1) |
| Angular `ng build` production | Pass (pre-existing style budget warnings) |
| Angular `ng test --watch=false` | **360/360** pass (+4) |

## Related

- [[Super_Admin_Current_Status_Audit]]
- [[Super_Admin_Current_Status_Audit_Detail]]
- [[02_Platform_Dashboard_Flow]]
- [[API_ENDPOINTS]]
