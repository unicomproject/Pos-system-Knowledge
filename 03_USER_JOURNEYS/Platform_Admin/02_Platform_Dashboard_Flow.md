<!-- title: Platform Dashboard Journey -->
<!-- status: Active -->
<!-- system: OneVerz POS System -->
<!-- last_updated: 2026-07-30 -->
<!-- journey_id: SA-J02 -->
<!-- journey_name: Platform Dashboard -->
<!-- implementation_status: Completed -->
<!-- release_scope: Release 1 -->
<!-- implementation_note: 2026-07-30 completion gate passed — controlled GAP-07 partial failures + Continue Setup exact tenant-detail destination verified (DASH-QA-02 pending_payment billing fix). Evidence: 15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-07-29-platform-dashboard/Platform_Dashboard_Implementation_Evidence_2026-07-29.md -->

# Platform Dashboard Journey

## 1. Document Status

Defines what Platform Admin sees and can do after successful login.

## Actor

Platform Admin

## Source

Derived from `Slide 2 - Platform Dashboard Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to OneVerz POS MVP Second Brain scope.

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
| 7 | Show tenant status snapshot | Lifecycle counts derived from canonical tenant lifecycle values. |
| 8 | Select target module | Quick link to tenant list and other permitted modules. |

## Attention metric definitions (authoritative)

| Type | Included | Excluded / notes |
|---|---|---|
| `suspended_tenants` | Tenant status `suspended` | Case-insensitive match |
| `pending_activation` | Tenant lifecycle status `PENDING_ACTIVATION` | Other lifecycle states excluded |
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
| `pending_activation` | `/admin/tenants?status=PENDING_ACTIVATION` |
| `past_due_subscriptions` | `/admin/tenants?billingStatus=PAST_DUE` (list BillingStatus = subscription status) |
| `pending_billing` | `/admin/billing` |

### Source-of-truth declaration

This document is the **approved** Platform Dashboard product contract for OneVerz Platform Admin.

- Verified requirements from earlier attention-metric work (SA-P0-02) are preserved where they still apply.
- Worktree drafts under `second-brain-docs-worktree` are **not** automatically approved.
- Where worktree research conflicted with this contract (especially permanent MRR placeholders vs Release 1 MRR), **this document wins**.
- Implementation may lag the approved target. Gaps are listed in �24 and must not be marked Completed until verified end-to-end.

### Worktree conflict note

`second-brain-docs-worktree/03_USER_JOURNEYS/Platform_Admin/02_Platform_Dashboard_Flow.md` (status: Under Review, 2026-07-28) proposed mandatory multi-currency MRR and alternate setup-pending statuses (`PENDING_ACTIVATION`). Useful research is retained as draft input only. All previously open product decisions for Dashboard (including missing currency metadata) are closed; remaining work is implementation of SA-DASH-GAP-01�14. Do not treat the worktree file as live SoT.

Do **not** mark Platform Dashboard as Completed until all approved documentation and implementation gaps are completed and verified.

---

## 2. Purpose

The Platform Dashboard gives authorised Platform Users a platform-wide operational, commercial, subscription, footprint, and technical-health overview after login.

It supports:

- Platform monitoring
- Tenant lifecycle monitoring
- Subscription monitoring
- Revenue monitoring (MRR � Release 1 required)
- Setup and billing attention
- Platform footprint monitoring
- Technical System Health monitoring
- Safe navigation into operational detail screens when destination permissions allow

---

## 3. User Category, Actor and Roles

| Concept | Value |
|---|---|
| Broad user category | **Platform User** |
| Journey actor | **Platform Admin** |

Roles that may use this journey (examples; **not** separate user categories):

- Super Administrator
- Billing Admin
- Support Admin
- Other platform roles that grant approved `platform.*` permissions

Clarifications:

- Roles are **not** separate user categories.
- Dashboard **page** access requires `platform.dashboard.view` (permission-driven).
- Widget **data** visibility and **navigation** may require additional verified permissions (�14).
- Role name alone must not grant dashboard or widget access.
- Category/actor model aligns with [[01_Login_Flow]].

---

## 4. Use Case

| Element | Definition |
|---|---|
| Business objective | Give Platform Admins an accurate, permission-aware summary of platform health, tenant lifecycle, subscriptions, revenue, attention items, and footprint so they can prioritise operational and commercial actions. |
| Trigger | Successful Platform Admin authentication routes to `/admin/dashboard`, or the user opens Dashboard from navigation, refreshes, or retries a failed load. |
| Preconditions | See �5. |
| Main outcome | Authorised sections render with real API data; sensitive values remain hidden without financial permissions; authorised cards navigate to consistent filtered destinations. |
| Postconditions | No durable platform state is changed by viewing the dashboard (read-only). Session remains active unless authentication refresh fails. |
| Expected frequency | Multiple times per session for operational users; typically the default landing screen after login. |
| Decisions supported | Which tenants need lifecycle/setup attention; which subscriptions/billing items need commercial follow-up; whether platform technical health is acceptable; whether MRR and growth are moving as expected. |
| Summary vs detail | Dashboard shows aggregates and attention counts. Detail work happens on Tenant Management, Billing, Subscription Plans, Settings, and related modules. |

---

## 5. Preconditions

- Platform User is authenticated with an active platform session.
- Login response (or equivalent session) has loaded active platform permission codes.
- Caller has `platform.dashboard.view`.
- Canonical dashboard API is reachable.
- Dependent services required by specific widgets are available for those widgets (target partial-failure model � �17).
- Currency and timezone context for display follows approved platform defaults where configured (default plan currency **LKR**; tenant timezones may be `Asia/Colombo` or other stored values; backend timestamps use **UTC**).

---

## 6. Trigger

### Primary

Successful Platform Admin authentication routes the user to:

`/admin/dashboard`

Evidence: Platform Admin Angular login navigates to `/admin/dashboard` after success.

### Other

- User selects **Dashboard** in the platform menu (`requiredPermission: platform.dashboard.view`).
- User triggers **manual refresh** (approved target; see SA-DASH-GAP-11).
- User retries a failed whole-page or section load.

---

## 7. Main Success Journey

### Approved target sequence

| Step | Action | System behavior |
|---:|---|---|
| 1 | Authenticate | Platform User completes [[01_Login_Flow]]. |
| 2 | Load permissions | Frontend stores active `platform.*` permission codes. |
| 3 | Guard route | Route requires `platform.dashboard.view`; otherwise permission-denied. |
| 4 | Open page | Dashboard page mounts. |
| 5 | Request API | Frontend calls `GET /api/v1/platform-admin/dashboard`. |
| 6 | Authorise | Backend validates `PlatformOnly` identity and `platform.dashboard.view`. |
| 7 | Calculate sections | Backend builds authorised section payloads (target: section-aware). |
| 8 | Respond | Returns section data, section statuses, and `generatedAt` (UTC). |
| 9 | Render available sections | Frontend shows successful sections only. |
| 10 | Apply widget permissions | Hide sensitive commercial widgets without data permission; disable operational navigation without destination permission. |
| 11 | Show freshness | Display `Last updated: <localized datetime>` from `generatedAt`. |
| 12 | Review | User reviews KPIs, lifecycle, subscriptions, revenue, attention, footprint, System Health. |
| 13 | Navigate | User opens an authorised card to a filtered detail screen. |
| 14 | Refresh | User may manually refresh; success updates data and `generatedAt` display. |

### Current implementation (as of 2026-07-29)

| Capability | Current behaviour |
|---|---|
| Route / guards | `/admin/dashboard` with `authGuard` + `permissionGuard` (`platform.dashboard.view`) |
| API | Sectioned `GET /api/v1/platform-admin/dashboard` with per-section status + legacy flat nullable fields |
| Core counts | Real lifecycle buckets (Active / Setup Pending including draft+pending_activation / Suspended / Inactive explicit) |
| MRR | Real per-currency MRR (ACTIVE only); metadata failure ? Revenue UNAVAILABLE; empty eligible ? success empty |
| % change / trends | Tenant growth + subscription trend via Platform Default Timezone; MRR trend R1 simplified (current points / no fabricated history) |
| System Health | Real dependency probes (core API, DB, jobs, email, payment, blob) � not attention-derived |
| Lifecycle snapshot | Explicit buckets; Trial moved to subscription snapshot |
| Widget permissions | BE omit/PERMISSION_DENIED (not fake zeros); FE hide/disable nav by permission |
| `platform.tenant_subscriptions.view` | Seeded + BE/FE gating |
| Failure model | Section-level UNAVAILABLE with HTTP 200 when other sections succeed |
| `generatedAt` | Returned and displayed as Last Updated |
| Manual refresh | Success-state Refresh with retain-on-failure |
| Footprint | Outlets, Tills, Tenant Users, Platform Users (platform users gated by `users.view`) |
| Setup Pending filter | Attention + tenant list `statusGroup=setup_pending` (draft/setup_pending/pending_activation/pending_payment) |
| Remaining | Tenant detail checklist progress % / completed-missing steps UI; richer historical MRR series; live stack E2E matrix |

---

## 8. Alternate and Exception Journeys

### 8.1 Dashboard Permission Denied

- Missing `platform.dashboard.view`: route guard blocks page **or** API returns **403** `platform_dashboard.access_denied`.
- No dashboard commercial or operational data is shown.

### 8.2 Destination Permission Missing

- User may still open the dashboard with only `platform.dashboard.view`.
- **Financial / revenue widgets** (MRR, Pending Billing, Past Due commercial values): **hide** without required data permission (�14).
- **Operational widgets** (Suspended, Setup Pending): may show non-sensitive counts when allowed; **navigation disabled**; no predictable dead-end 403 via card click.
- Neutral unavailable / permission indication when UI supports it.

### 8.3 Empty Platform Data

- Counts display authentic `0`.
- Lists show meaningful empty states.
- Do **not** invent trends or percentage changes when history is absent (show explicit no-history state).

### 8.4 Individual Widget / Section Failure (approved target)

- Successful sections remain visible.
- Failed section shows contained unavailable state + section error code.
- Section retry where supported.
- Partial-data indicator visible.
- **Current:** atomic whole-page failure only (SA-DASH-GAP-07).

### 8.5 Whole Dashboard Failure

- Only when no usable section can be provided (or current atomic API fails).
- Safe error message + retry.
- Where practical, do not clear previously displayed valid data on refresh failure (target).

### 8.6 Session Expired

- Existing platform authentication refresh applies ([[01_Login_Flow]]).
- If refresh fails, user returns to login.

### 8.7 Manual Refresh Failure

- Keep last valid displayed data where practical.
- Show error.
- Do **not** advance `Last updated` / `generatedAt` display on failure.

### 8.8 Rate Limit or Dependency Failure

- Safe user message.
- Do not expose internal secrets, connection strings, or stack traces.

---

## 9. Widget Catalogue

| ID | Section | Widget | Purpose | Data Source | Required Permission | Destination Permission | Navigation | Release 1 | Current Status |
|---|---|---|---|---|---|---|---|---|---|
| W01 | Primary KPI | Total Tenants | Platform tenant count | `tenants` | `platform.dashboard.view` | � | � | Required | Partially Implemented (count real; % change placeholder) |
| W02 | Primary KPI | Active Paid Subscriptions | Count of `ACTIVE` subscriptions | `tenant_subscriptions` | `platform.dashboard.view` + financial visibility rule for commercial context | � | � | Required | Partially Implemented (count exists; label may still say �Active Subscriptions�) |
| W03 | Primary KPI | Monthly Recurring Revenue | Real MRR by currency | Subscription + plan/addon pricing | `platform.dashboard.view` + `platform.billing.view` | � | � | **Required** | Placeholder |
| W04 | Primary KPI | Items Requiring Attention | Sum of attention issue counts | Attention section | `platform.dashboard.view` | � | � | Required | Implemented (sum derived on FE today) |
| W05 | Primary KPI | System Health | Technical dependency health | Health checks (target) | `platform.dashboard.view` (R1 basic summary; no separate health permission) | � | � | Required | Placeholder (FE heuristic � not approved) |
| W06 | Trends | Tenant Growth | Count series + % change | Historical tenant creates / totals | `platform.dashboard.view` | � | � | Required | Placeholder |
| W07 | Trends | Subscription Trend | Subscription count series + % change | Historical subscriptions | `platform.dashboard.view` (+ billing for commercial series if shown) | � | � | Required | Placeholder |
| W08 | Trends | MRR Trend | MRR series + % change | Historical MRR snapshots or recalculation | `platform.billing.view` | � | � | Required | Placeholder |
| W09 | Tenant Lifecycle | Active | Lifecycle `active` | `tenants.status` | `platform.dashboard.view` | `platform.tenants.view` | Optional filtered list | Required | Partially Implemented |
| W10 | Tenant Lifecycle | Setup Pending | Incomplete mandatory onboarding | Checklist / approved status set | `platform.dashboard.view` | `platform.tenants.view` | Filtered tenants | Required | Partially Implemented (status OR today; checklist target) |
| W11 | Tenant Lifecycle | Suspended | Lifecycle `suspended` | `tenants.status` | `platform.dashboard.view` | `platform.tenants.view` | `?status=suspended` | Required | Implemented (attention + count) |
| W12 | Tenant Lifecycle | Inactive | Lifecycle `inactive` | Explicit `tenants.status = inactive` | `platform.dashboard.view` | `platform.tenants.view` | Filtered tenants | Required | Not Implemented correctly (FE residual) |
| W13 | Subscription Snapshot | Trial | `TRIAL` | `tenant_subscriptions` | `platform.dashboard.view` | Decision: tenants list billing filter vs dedicated UI | Optional | Required | Backend Only / mis-placed in lifecycle today |
| W14 | Subscription Snapshot | Active Paid | `ACTIVE` | `tenant_subscriptions` | `platform.dashboard.view` | � | � | Required | Partially Implemented |
| W15 | Subscription Snapshot | Past Due | `PAST_DUE` | `tenant_subscriptions` | `platform.billing.view` (data) | `platform.tenants.view` (nav to filtered list) | `?billingStatus=PAST_DUE` | Required | Partially Implemented |
| W16 | Subscription Snapshot | Cancelled | `CANCELLED` | `tenant_subscriptions` | `platform.dashboard.view` | � | � | Required | Not Implemented on dashboard UI |
| W17 | Subscription Snapshot | Expired | `EXPIRED` | `tenant_subscriptions` | `platform.dashboard.view` | � | � | Required | Not Implemented on dashboard UI |
| W18 | Attention | Suspended Tenants | Operational attention | Tenant status | `platform.dashboard.view` | `platform.tenants.view` | `/admin/tenants?status=suspended` | Required | Implemented (nav not permission-aware) |
| W19 | Attention | Setup Pending Tenants | Onboarding attention | Setup contract �13 | `platform.dashboard.view` | `platform.tenants.view` | Filter matching same population | Required | Partially Implemented (count/filter mismatch) |
| W20 | Attention | Past Due Subscriptions | Commercial attention | Sub status `PAST_DUE` | `platform.billing.view` | `platform.tenants.view` | `?billingStatus=PAST_DUE` | Required | Partially Implemented |
| W21 | Attention | Pending Billing | Invoice attention | Invoices `PENDING` + `balance_due > 0` | `platform.billing.view` | `platform.billing.view` | `/admin/billing` | Required | Partially Implemented |
| W22 | Platform Footprint | Total Outlets | Platform-wide outlets | `outlets` exclude `DELETED` | `platform.dashboard.view` | � | � | Required | Backend Only |
| W23 | Platform Footprint | Total Tills | Platform-wide tills | `tills` exclude `DELETED` | `platform.dashboard.view` | � | � | Required | Backend Only |
| W24 | Platform Footprint | Tenant Users | Platform-wide tenant users | `tenant_users` exclude `DELETED` (current `totalUsers`) | `platform.dashboard.view` | � | � | Required | Backend Only (mislabelled if shown as �Users�) |
| W25 | Platform Footprint | Platform Users | Platform-wide platform users | `platform_users` (exclude deleted if applicable) | `platform.dashboard.view` (+ optionally `platform.users.view` for nav) | `platform.users.view` | Optional `/admin/platform-users` | Required | Not Implemented |
| W26 | Recent Tenants | Recent Tenants | Latest five tenants by `createdAt` | `recentTenants` | `platform.dashboard.view` | `platform.tenants.view` | Optional tenant detail | Required | Implemented (do **not** call �Recent Platform Activity�) |
| W27 | Freshness | Last Updated | Show `generatedAt` | API `generatedAt` | `platform.dashboard.view` | � | � | Required | Not Implemented (field returned, not rendered) |
| W28 | Freshness | Manual Refresh | Reload dashboard | Same GET | `platform.dashboard.view` | � | � | Required | Partially Implemented (error retry only) |

---

## 10. Metric Definitions

Verified backend subscription statuses (`TenantSubscriptionStatusConstants` / DB check):

`TRIAL`, `ACTIVE`, `PAST_DUE`, `CANCELLED`, `EXPIRED`

Verified tenant lifecycle status constants (`TenantStatusConstants`):

`draft`, `setup_pending`, `pending_activation`, `pending_payment`, `inactive`, `active`, `suspended`

### 10.1 Total Tenants

| Item | Definition |
|---|---|
| Business meaning | Count of all tenant rows included in platform dashboard aggregation |
| Included | All tenants returned by current repository query |
| Excluded | **Decision / gap:** tenants table currently has **no soft-delete filter** on dashboard (SA-P0-02). Soft-delete policy must stay explicit |
| Formula | `COUNT(tenants)` under approved inclusion rules |
| Permission | `platform.dashboard.view` |
| Current status | Implemented (count) |

### 10.2 Active Tenants

| Item | Definition |
|---|---|
| Business meaning | Tenants in lifecycle status `active` |
| Included | `tenants.status` equals `active` (case-insensitive) |
| Excluded | All other lifecycle statuses |
| Overlap | Independent of subscription `TRIAL` / `ACTIVE` |
| Permission | `platform.dashboard.view` |
| Current status | Implemented as count field |

### 10.3 Setup Pending Tenants

| Item | Definition |
|---|---|
| Business meaning | Tenants whose **mandatory onboarding checklist** is incomplete (�13) |
| Current implementation | Count of `setup_pending` **OR** `pending_payment` (attention type `setup_pending`) |
| Approved target | Checklist-driven (or single stored status that means the same population as the checklist) |
| Navigation | Destination filter **must match the same population as the count** (SA-DASH-GAP-05) |
| Permission | Data: `platform.dashboard.view`; Nav: `platform.tenants.view` |
| Current status | Partially Implemented |

### 10.4 Suspended Tenants

| Item | Definition |
|---|---|
| Included | `tenants.status = suspended` |
| Excluded | Other statuses |
| Navigation | `/admin/tenants?status=suspended` |
| Permission | Nav: `platform.tenants.view` |
| Current status | Implemented |

### 10.5 Inactive Tenants

| Item | Definition |
|---|---|
| Business meaning | Explicit lifecycle status `inactive` |
| **Forbidden** | `Total - Active - Suspended - Trial` residual arithmetic |
| Included | `tenants.status = inactive` only |
| Permission | `platform.dashboard.view` |
| Current status | Not Implemented correctly (FE residual) � SA-DASH-GAP-04 |

### 10.6 Trial Subscriptions

| Item | Definition |
|---|---|
| Business meaning | Subscription state only � **not** a tenant lifecycle bucket |
| Included | `tenant_subscriptions.subscription_status = TRIAL` |
| Rule | A tenant may be lifecycle `active` while subscription is `TRIAL` |
| Current status | Backend counts trial tenants by subscription; FE incorrectly places Trial in lifecycle donut |

### 10.7 Active Paid Subscriptions

| Item | Definition |
|---|---|
| Included | `subscription_status = ACTIVE` |
| Excluded | `TRIAL`, `PAST_DUE`, `CANCELLED`, `EXPIRED` |
| Note | �Paid� here means commercially active paid subscription status `ACTIVE`, not invoice paid |
| Current status | Implemented as `activeSubscriptions` |

### 10.8 Past Due Subscriptions

| Item | Definition |
|---|---|
| Included | `subscription_status = PAST_DUE` |
| Excluded | Invoice overdue alone without PAST_DUE status |
| Navigation | `/admin/tenants?billingStatus=PAST_DUE` (list BillingStatus = subscription status) |
| Data permission | `platform.billing.view` |
| Current status | Implemented count; visibility/nav not fully permission-aware |

### 10.9 Pending Billing

| Item | Definition |
|---|---|
| Included | `subscription_invoices` with `invoice_status = PENDING` and `balance_due > 0` |
| Excluded | Draft / paid / void / cancelled invoices |
| Equals | Root `pendingBillingCount` must equal attention `pending_billing` count |
| Navigation | `/admin/billing` |
| Data + destination permission | `platform.billing.view` |
| Current status | Implemented count; hide without billing permission (target) |

### 10.10 Items Requiring Attention

| Item | Definition |
|---|---|
| Formula | Sum of the four attention issue counts (issue sum, **not** distinct tenants) |
| Overlap | One tenant may contribute to multiple categories |
| Current status | Implemented (FE sum today) |

### 10.11 MRR

See �11. Release 1 **required**. Current: Placeholder.

### 10.12�10.14 Tenant Growth / Subscription Trend / MRR Trend

See �11 and SA-DASH-GAP-02. Release 1 **required**. Current: Placeholder.

Each trend metric must define (when implemented):

| Contract item | Approved direction |
|---|---|
| Current period | Calendar month in Platform Default Timezone (backend converts local period boundaries to UTC for queries) |
| Comparison period | Previous calendar month |
| Formula | `((current - previous) / previous) � 100` when previous > 0 |
| Zero-baseline | If previous = 0 and current > 0 ? explicit �new / no baseline� state (not fake 0% �No change yet�) |
| No-history | Explicit empty state; **no** hard-coded 0% as fake stability |
| Chart interval (R1) | **Daily points within the current calendar month** in Platform Default Timezone. Longer multi-month windows are out of R1 scope unless a later release adds them. |
| Result type | Count series for tenants/subscriptions; money series per currency for MRR; percentage for change badges |

### 10.15 System Health

See �12. Must not use attention heuristics.

### 10.16 Total Outlets

| Item | Definition |
|---|---|
| Included | Platform-wide outlets where status is not `DELETED` |
| Source | Current `totalOutlets` |
| Current status | Backend Only |

### 10.17 Total Tills

| Item | Definition |
|---|---|
| Included | Platform-wide tills where status is not `DELETED` |
| Source | Current `totalTills` |
| Current status | Backend Only |

### 10.18 Tenant Users

| Item | Definition |
|---|---|
| Included | Platform-wide `tenant_users` where account status is not `DELETED` |
| Source | Current backend field `totalUsers` � **means Tenant Users, not Platform Users** |
| Label | Must display as **Tenant Users** |
| Current status | Backend Only � SA-DASH-GAP-09 |

### 10.19 Platform Users

| Item | Definition |
|---|---|
| Included | Rows in `platform_users` under approved inclusion (exclude `DELETED` if present) |
| Source | **Not** in current dashboard DTO |
| Current status | Not Implemented � SA-DASH-GAP-08 / SA-DASH-GAP-09 |

---

## 11. MRR Contract

### Approved decision

**Monthly Recurring Revenue is required in Release 1.**

MRR must not remain a permanent placeholder. Hard-coded `0` / �Not tracked�� is acceptable **only** as a temporary gap indicator until SA-DASH-GAP-01 is closed � never as the final product behaviour.

### Approved business meaning (Release 1 direction)

MRR is the monthly-normalised recurring commercial value of **active paid** tenant subscriptions, expressed **per currency** (never summed across currencies).

### Required data sources (verified entities)

| Source | Evidence |
|---|---|
| `tenant_subscriptions` | `SubscriptionStatus`, `PlanPrice`, `CurrencyCode`, `BillingCycle`, `DiscountType`, `DiscountValue` |
| `tenant_subscription_addons` | Recurring add-on amounts / currency |
| `subscription_plans` | `BillingInterval` (`MONTHLY`, `YEARLY`, `ONE_TIME`), `BaseCurrency` |
| Invoices / credit notes | Used for billing ops; **not** a substitute MRR ledger unless a later decision says otherwise |

Default catalogue currency: **LKR** (`SubscriptionPlanConstants.DefaultBaseCurrency`).

### Include (approved direction)

- Subscriptions with status **`ACTIVE`**
- Recurring plan charge (`PlanPrice` / plan recurring price)
- Recurring add-ons on those subscriptions
- Approved recurring discounts applied to the subscription (`fixed` / `percent` per `TenantSubscriptionBillingConstants`)

### Exclude (approved final)

- `TRIAL`
- `CANCELLED`
- `EXPIRED`
- `PAST_DUE` (excluded from MRR until returned to `ACTIVE` � **approved final**, not optional)
- One-time plan interval `ONE_TIME`
- Tax, setup fees, payment-link fees, penalties, refunds, credit notes, non-recurring usage charges
- �Demo� as a separate status: **not** present in `TenantSubscriptionStatusConstants` � do not invent; treat as N/A unless a demo status is added later

### Billing-cycle normalisation (supported by current model)

Verified cycles:

| Stored cycle | Normalisation |
|---|---|
| `monthly` / plan `MONTHLY` | amount � 1 |
| `yearly` / plan `YEARLY` | amount � 12 |
| Quarterly (when supported by billing model) | amount � 3 |

**Quarterly rule (approved):** apply � 3 only when a quarterly billing interval exists in the subscription/plan model. Current verified constants do **not** include quarterly ? treat as N/A until the model adds it. Do not invent a quarterly cycle.

### Currency / multi-currency

- Keep **separate series** per `CurrencyCode` (e.g. LKR, USD, GBP if present).
- **Never** add different currencies into one total.
- Aligns with Platform Billing rule: monetary summaries are currency-grouped ([[04_Platform_Billing_Functional_Specification]]).
- **No FX conversion** (approved final). Do not roll up into a single reporting currency.

### Calculation timestamp

- Each MRR payload must expose calculation time (may equal section `generatedAt` / dashboard `generatedAt`).
- Display with Last Updated rules (�18).

### Rounding

- Minor-unit precision from central `currencies.decimal_places` for each ISO `CurrencyCode`.

### MRR permission requirement

MRR data requires BOTH `platform.tenant_subscriptions.view` and `platform.billing.view` (�14). Hide without either permission.

### Comparison / trend

- Period-over-period % and chart series required (�10.12�10.14).
- No hard-coded `0%` / empty polyline pretending to be data.

### Current implementation

| Layer | Behaviour |
|---|---|
| Backend | No MRR fields on `PlatformDashboardResponse` |
| Frontend | `monthlyRecurringRevenue: 0`, label �Not tracked in OneVerz POS MVP� |
| Gap | SA-DASH-GAP-01 |

### Approved formula

`MRR (per currency) = monthly-normalised recurring plan + recurring add-ons - recurring discounts`

Closed decisions that apply to this formula:

- `PAST_DUE` excluded
- No FX rollup
- Final per-currency aggregate rounding uses `MidpointRounding.ToEven` at `currencies.decimal_places`

Do not invent additional SaaS assumptions beyond verified fields above.

### Missing or invalid currency metadata (approved final � closed SA-DASH-DECISION-PENDING-01)

When **any** eligible ACTIVE paid subscription currency cannot be resolved against central currency metadata, the **entire Revenue / MRR section** is **UNAVAILABLE**.

Forbidden behaviours:

- Do not calculate or expose a partial MRR result as though it were complete.
- Do not omit the affected currency group silently.
- Do not substitute a default precision (including assuming 2 decimal places).
- Do not infer precision from the frontend locale.
- Do not use tenant default currency as a substitute.
- Do not apply FX conversion.
- Do not return zero for the affected group.

Required behaviours:

- Mark the entire Revenue / MRR section as unavailable.
- Preserve all other successfully calculated Dashboard sections.
- Return overall Dashboard HTTP **200** when at least one other useful section succeeds.
- Return a safe Revenue-section error code (conceptual): `platform_dashboard.currency_metadata_unavailable` (exact runtime wire value follows project error-code conventions; not claimed implemented).
- Do not expose internal database, entity, SQL, stack-trace, or provider details.
- Record the missing or invalid `CurrencyCode` in secure backend logs.
- Frontend displays a safe unavailable message.
- Normal Dashboard Refresh allows retry.
- A failed Revenue section must not falsely update displayed Revenue data.
- Existing last-known valid Revenue data may remain visible only if the approved stale-data indicator behaviour is implemented.
- The Dashboard must not present incomplete MRR as complete platform revenue.

Invalid metadata conditions (any eligible MRR currency):

- No matching central currency metadata row
- Missing `currency_code`
- Null `decimal_places`
- Invalid `decimal_places`
- Unsupported precision value according to the central currency contract
- Duplicate or conflicting active currency metadata records
- Currency metadata that cannot be resolved reliably

**Not** a metadata failure:

- No eligible ACTIVE paid subscriptions ? successful Revenue section with empty per-currency collection or approved zero-state (documented empty-state behaviour). Do **not** return `currency_metadata_unavailable`.

Conceptual partial-response example when other sections succeed:

```json
{
  "generatedAt": "2026-07-29T10:30:00Z",
  "tenantSummary": {
    "status": "SUCCESS",
    "data": {}
  },
  "revenueSummary": {
    "status": "UNAVAILABLE",
    "errorCode": "platform_dashboard.currency_metadata_unavailable"
  }
}
```

Do not claim this exact wire shape is currently implemented.

## Currency Precision and ISO 4217 Contract

Final decision: Dashboard monetary precision must come from a central backend currency metadata source aligned with ISO 4217.

Authoritative source
- Central backend currency metadata (DB): `currencies` table.

Required metadata (minimum)
- `currency_code` (ISO currency code)
- `decimal_places` (minor-unit fraction digits; integer)

Cross-module responsibility rule
- Backend owns the authoritative precision.
- Dashboard/Frontend must not hard-code per-currency decimal maps or assume a fixed scale for all currencies.

MRR rounding boundary rule
- Calculate normalized MRR using sufficient internal precision.
- Aggregate values within the same currency only (no FX).
- Apply the approved currency minor-unit precision at the final currency-group output boundary for each `CurrencyCode`.

Approved monetary rounding mode (target contract)
- When rounding to the currency's `decimalPlaces`, use `MidpointRounding.ToEven`.
- Apply this rounding only at the final currency-group output boundary (not for every intermediate component), unless an existing billing contract explicitly requires otherwise.

Existing metadata source verification
- Verified DB knowledge exists for `currencies.currency_code` and `currencies.decimal_places`.

Current implementation status
- Approved architecture recorded, but dashboard integration for precision is not yet verified end-to-end.
- Gap: `SA-DASH-GAP-14 � Central ISO 4217 currency precision source not implemented or not verified`.

Currency metadata attribute contract
| Currency Metadata Attribute | Required | Source | Current Status |
|---|---|---|---|
| Currency code | Yes | Central backend metadata (`currencies.currency_code`) | Verified as central metadata; dashboard precision integration not verified |
| Minor-unit precision | Yes | Central backend metadata (`currencies.decimal_places`) | Verified as central metadata; dashboard precision integration not verified |
| Display name | As required | Central metadata (from `currencies`) | Not specified for dashboard rounding in Release 1 |
| Symbol | As required | Central metadata (from `currencies`) | Not specified for dashboard rounding in Release 1 |
| Supported/active state | If used | Central metadata (from `currencies`) | Not specified for dashboard rounding in Release 1 |

Approved target API / DTO contract (conceptual � not implemented)
Each per-currency MRR group returned by `GET /api/v1/platform-admin/dashboard` must include:
- `currencyCode`
- `decimalPlaces`
- `amount`

```json
{
  "currencyCode": "LKR",
  "decimalPlaces": 2,
  "amount": 1250000.00
}
```

---

## 12. System Health Contract

### Approved decision

**System Health is a real technical / operational dependency summary.**

It must **not** be derived from:

- Attention item counts
- Suspended tenants
- Billing issues
- Setup-pending tenants

### Approved statuses

| Status | Meaning |
|---|---|
| `HEALTHY` | Critical dependencies passing |
| `DEGRADED` | Non-critical failure or elevated errors; core path usable |
| `CRITICAL` | Core platform path impaired |
| `UNKNOWN` | Health signals unavailable or not yet collected |

### Release 1 health dependencies (approved)

| Dependency | Criticality (R1) |
|---|---|
| Core API | Critical |
| Database | Critical |
| Background-job processing | Non-critical unless ops marks otherwise |
| Email service | Non-critical |
| Payment provider | Critical where payment capability is operationally required for platform billing |
| Blob / file storage | Non-critical |

Also expose (when available): last successful health-check / last-checked time. Do not lock the contract to a specific vendor/library.

### Aggregation (approved)

- Any **critical** dependency failure ? `CRITICAL`
- Only **non-critical** failures (or elevated but usable path) ? `DEGRADED`
- All required checks pass ? `HEALTHY`
- No usable signals / checks not collected ? `UNKNOWN`

### Timeouts (approved principle)

Each dependency probe must use a **bounded timeout** so a slow provider cannot block the entire Dashboard response. Exact millisecond values are implementation-defined unless a platform ops standard is later published.

### Permissions

- R1 basic System Health summary: `platform.dashboard.view` only.
- Do **not** invent a separate health permission for Release 1.
- Sensitive diagnostics (connection strings, stack traces, credentials) must never be exposed.

### Current implementation (rejected heuristic)

Frontend sets `systemHealth` to `Needs Attention` vs `Healthy` from attention sum. **Not approved.** Must be removed when real health ships (SA-DASH-GAP-03).

---

## 13. Setup Completion Contract

### Approved business meaning

A tenant is **Setup Pending** when it has been created but one or more **mandatory** onboarding requirements remain incomplete.

### Mandatory checklist (from Create Tenant Wizard + Activation evidence)

Built from [[04_Create_Tenant_Wizard_Flow]] and [[11_Tenant_Activation_Flow]]:

| # | Mandatory requirement | Evidence |
|---:|---|---|
| 1 | Business / tenant profile information present | Wizard step 1; activation �business and admin details� |
| 2 | Required subscription / plan assigned | Wizard step 2; activation plan check |
| 3 | Required feature entitlements assigned | Wizard step 4; activation entitlements |
| 4 | Required billing condition satisfied | Wizard step 6; activation billing status |
| 5 | At least one Tenant Admin user available (`INVITED` or `ACTIVE`) | Wizard step 5; activation admin check |

### Optional (not mandatory for leaving Setup Pending / for activation when mode allows)

Per activation flow: outlet, till, products, online store setup may complete **later**.

Do **not** treat optional outlet/till as mandatory for the Setup Pending dashboard definition unless a later product decision elevates them.

### Evaluation model

| Topic | Approved direction |
|---|---|
| Calculation source | Target: evaluated checklist (and/or a stored lifecycle status that is kept consistent with the checklist) |
| Current source | Stored status `setup_pending` **OR** `pending_payment` (legacy attention definition) � incomplete vs approved mapping that also includes `draft` and `pending_activation` |
| Main dashboard card | **Count only** � do **not** show average setup percentage on the main Dashboard |
| Detail destination | Tenant detail / activation readiness for that tenant (existing Platform Admin tenant detail / activation surfaces). Show completed steps, missing steps, individual progress %, and **Continue Setup** action |
| Progress % (detail only) | `(completed mandatory steps � total mandatory steps) � 100` for that tenant |
| Missing / completed steps | Target API / detail view returns incomplete and completed mandatory step codes |
| Leaves Setup Pending | When mandatory checklist is complete **and** tenant lifecycle moves per activation rules (typically to `active` via `platform.tenants.activate`) |
| Billing-pending | **Pending Billing** remains a **separate attention type** (invoices). Approved contract: `pending_payment` tenants contribute to Pending Billing attention where payment action is required; avoid accidental double-counting by keeping the mapping explicit |
| Count / filter consistency | Dashboard count population **must equal** tenant-list filter population (SA-DASH-GAP-05) |

### Current mismatch (must be fixed in implementation)

| Layer | Behaviour |
|---|---|
| Count | `setup_pending` OR `pending_payment` |
| Navigation | `/admin/tenants?status=setup_pending` only |

Approved rule: **same tenant set** for count and destination.

### Other lifecycle statuses

Approved final mapping (final contract):

| Backend Status | Dashboard Bucket |
|---|---|
| `draft` | Setup Pending |
| `setup_pending` | Setup Pending |
| `pending_activation` | Setup Pending |
| `pending_payment` | Setup Pending |
| `active` | Active |
| `suspended` | Suspended |
| `inactive` | Inactive |

Trial is subscription status only (not a tenant lifecycle bucket), and Inactive is explicit (not residual arithmetic).

---

## Tenant Subscription Widget Access

Approved code: `platform.tenant_subscriptions.view`

Purpose
- Allows a Platform User to view tenant-level subscription lifecycle and commercial subscription summary information.

This permission is distinct from:
- `platform.subscription_plans.view` � subscription plan catalogue/definitions (not tenant subscription visibility).
- `platform.billing.view` � invoices, payments and revenue data (not tenant subscription lifecycle/status).

Approved dashboard usage (widgets protected by this permission)
- Subscription Status Snapshot
- Active Paid Subscriptions
- Trial Subscriptions
- Past Due Subscriptions
- Subscription Trend
- Tenant subscription detail navigation

Navigation protected
- Subscription widgets may navigate only when destination permission is present: `platform.tenant_subscriptions.view`.

MRR combined permission requirement
- Full MRR values (and related commercial drill-down) require BOTH:
  - `platform.tenant_subscriptions.view`
  - `platform.billing.view`

No-permission behaviour
- Without `platform.tenant_subscriptions.view`, hide tenant subscription status/lifecycle data and do not expose subscription widget navigation links.
- Without `platform.billing.view`, hide MRR and revenue/financial values.
- Do not fall back permanently to `platform.billing.view` for subscription lifecycle widgets.

Current implementation-status rule
- Catalogue / seed / Super Administrator default grant: **Partially Implemented** (verified code evidence; migration `20260729153000_SeedTenantSubscriptionsViewPermission`).
- Backend Dashboard filtering for subscription-derived fields: **Partially Implemented** (`PlatformDashboardService`).
- Frontend widget hide / navigation gating / full E2E matrix: **Not Implemented**.
- Overall gap status: **Partially Implemented** � see SA-DASH-GAP-13.
- Do **not** mark Completed and Verified until FE gating, omit/hide (not fake-zero) behaviour, role-catalogue verification, and integration tests all pass.

FE/BE/seed/test impacts (remaining)
- Backend must enforce `platform.tenant_subscriptions.view` on subscription widgets using omit/hide (not authentic-looking zeros).
- Frontend must hide subscription widgets when permission is missing (no tooltips / no HTML / no navigation links).
- Default role assignment expectation: `super_administrator` receives `platform.tenant_subscriptions.view` by default once seeded; Billing Admin, Support Admin, and custom roles receive it only through explicit assignment.

---
## 14. Permission and Visibility Matrix

Verified codes only ([[Permission_Code_List]] / `PlatformPermissionCodes`).

| Widget / Section | Page Permission | Data Permission | Financial Permission | Destination Permission | No-Permission Behaviour |
|---|---|---|---|---|---|
| Open dashboard / refresh page | `platform.dashboard.view` | � | � | � | Block route / API 403; no data |
| Manual Refresh | `platform.dashboard.view` | � | � | � | Same as page |
| Tenant metrics (Total / Active / Setup Pending / Suspended counts) | `platform.dashboard.view` | `platform.tenants.view` | � | `platform.tenants.view` | Without data/dest: non-sensitive summary only if product allows; disable nav; no dead-end 403 |
| Tenant attention (Suspended, Setup Pending) | `platform.dashboard.view` | `platform.tenants.view` | � | `platform.tenants.view` | Same as tenant metrics |
| Recent Tenants | `platform.dashboard.view` | `platform.tenants.view` | � | `platform.tenants.view` | Show limited summary; disable deep links without `platform.tenants.view` |
| Platform Footprint outlets/tills/tenant users | `platform.dashboard.view` | `platform.dashboard.view` | � | � | � |
| Platform Users count | `platform.dashboard.view` | `platform.users.view` | � | `platform.users.view` | Hide count/nav without `platform.users.view` |
| Billing cards / Pending Billing | `platform.dashboard.view` | `platform.billing.view` | `platform.billing.view` | `platform.billing.view` | Hide widget/values/links |
| MRR (and MRR trend) | `platform.dashboard.view` | `platform.tenant_subscriptions.view` | `platform.billing.view` | � | Hide MRR and financial values without both required permissions |
| Subscription Status Snapshot | `platform.dashboard.view` | `platform.tenant_subscriptions.view` | � | `platform.tenant_subscriptions.view` | Hide subscription status/lifecycle data without `platform.tenant_subscriptions.view` |
| Active Paid Subscriptions | `platform.dashboard.view` | `platform.tenant_subscriptions.view` | � | `platform.tenant_subscriptions.view` | Hide without `platform.tenant_subscriptions.view` |
| Trial Subscriptions | `platform.dashboard.view` | `platform.tenant_subscriptions.view` | � | `platform.tenant_subscriptions.view` | Hide without `platform.tenant_subscriptions.view` |
| Past Due Subscriptions | `platform.dashboard.view` | `platform.tenant_subscriptions.view` | � | `platform.tenant_subscriptions.view` | Hide without `platform.tenant_subscriptions.view` |
| Subscription Trend | `platform.dashboard.view` | `platform.tenant_subscriptions.view` | � | � | Hide trend inputs/series without `platform.tenant_subscriptions.view` |
| Tenant subscription navigation | `platform.dashboard.view` | `platform.tenant_subscriptions.view` | � | `platform.tenant_subscriptions.view` | Disable navigation without `platform.tenant_subscriptions.view` |
| System Health (R1 basic summary) | `platform.dashboard.view` | `platform.dashboard.view` | � | � | Available with page permission; future detailed screen may need new code |

Sensitive financial/commercial widgets: hide. Operational tenant widgets: summary OK; disable navigation when destination permission missing.

---

## 15. API Contract

Canonical endpoint:

`GET /api/v1/platform-admin/dashboard`

Controller: `PlatformAdminDashboardController`  
Service: `PlatformDashboardService`  
Repository: `PlatformDashboardRepository`

### 15.1 Current Contract

| Item | Value |
|---|---|
| Authentication | `PlatformOnly` JWT |
| Permission | `platform.dashboard.view` (checked in service) |
| Query parameters | None |
| Envelope | Legacy `{ success, message, data }` (`LegacyApiResponse<PlatformDashboardResponse>`) |
| Errors | 401 `platform_auth.invalid_session`; 403 `platform_dashboard.access_denied` |
| Failure model | **Atomic** � one response succeeds or fails as a unit |
| `generatedAt` | `DateTimeOffset` UTC from `IDateTimeProvider.UtcNow` |

#### Current `data` fields (`PlatformDashboardResponse`)

| Field | Notes |
|---|---|
| `totalTenants` | Count |
| `activeTenants` | Lifecycle `active` |
| `suspendedTenants` | Lifecycle `suspended` |
| `trialTenants` | Tenants with subscription `TRIAL` (not lifecycle) |
| `totalSubscriptions` | All subscription rows |
| `activeSubscriptions` | Status `ACTIVE` |
| `pendingBillingCount` | PENDING invoices with balance due |
| `totalOutlets` | Non-`DELETED` outlets |
| `totalTills` | Non-`DELETED` tills |
| `totalUsers` | Non-`DELETED` **tenant** users |
| `recentTenants[]` | Top 5 by `createdAt` (`id`, `code`, `name`, `status`, `createdAt`) |
| `attentionItems[]` | `type`, `title`, `description`, `count`, `severity` |
| `generatedAt` | UTC |

#### Current attention types (authoritative until setup contract rewrite ships)

| `type` | Current count definition |
|---|---|
| `suspended_tenants` | `suspended` |
| `setup_pending` | `setup_pending` OR `pending_payment` |
| `past_due_subscriptions` | `PAST_DUE` |
| `pending_billing` | PENDING + `balance_due > 0` |

SA-P0-02 fixed crossed past-due / pending-billing assignment (2026-07-20).

### 15.2 Approved Target Contract (conceptual � not implemented)

Target response organises **sections** with per-section status:

| Section | Purpose |
|---|---|
| `tenantSummary` | Totals + lifecycle snapshot |
| `subscriptionSummary` | Trial / Active / Past Due / Cancelled / Expired |
| `revenueSummary` | Per-currency MRR + change |
| `trends` | Tenant, subscription, MRR series |
| `attentionSummary` | Permission-filtered attention items |
| `platformFootprint` | Outlets, tills, tenant users, platform users |
| `systemHealth` | Real health statuses |
| `recentTenants` | Latest tenants (not generic �activity�) |
| `generatedAt` | UTC generation time |
| `sections[].status` / `errorCode` | Partial failure support |

Clearly label:

- **Current implemented fields** � �15.1
- **New required fields** � MRR, trends, health, platform user count, section status, setup checklist fields
- **Deprecated / misleading FE-derived fields** � fake `%` change, empty trend as data, attention-based System Health, residual Inactive
- **Backend-only today** � `totalOutlets`, `totalTills`, `totalUsers`, `generatedAt` (not rendered)
- **Permission-filtered sections** � revenue / billing attention omitted when caller lacks `platform.billing.view`

Do **not** claim the target DTO is implemented.

---

## 16. Current Field-Level Contract

| Field | Meaning | Type | Nullable | Source | UI Usage | Current Status | Target Decision |
|---|---|---|---|---|---|---|---|
| `totalTenants` | All tenants counted | int | no | Tenants | KPI | Implemented | Keep |
| `activeTenants` | Lifecycle active | int | no | Tenants | Snapshot | Implemented | Keep in lifecycle |
| `suspendedTenants` | Lifecycle suspended | int | no | Tenants | Snapshot + attention | Implemented | Keep |
| `trialTenants` | Tenants with TRIAL sub | int | no | Subscriptions | Misused in lifecycle | Implemented (misplaced) | Move to subscription snapshot only |
| `totalSubscriptions` | All subs | int | no | Subscriptions | FE health % | Implemented | Keep / refine |
| `activeSubscriptions` | ACTIVE subs | int | no | Subscriptions | KPI | Implemented | Label Active Paid |
| `pendingBillingCount` | Pending invoices due | int | no | Invoices | Unused on UI (attention used) | Backend | Keep; gate by billing.view |
| `totalOutlets` | Non-deleted outlets | int | no | Outlets | Not rendered | Backend Only | Footprint UI |
| `totalTills` | Non-deleted tills | int | no | Tills | Not rendered | Backend Only | Footprint UI |
| `totalUsers` | Non-deleted **tenant** users | int | no | TenantUsers | Not rendered | Backend Only | Rename display Tenant Users |
| `recentTenants` | Latest 5 tenants | array | no | Tenants | Shown as activity | Implemented | Label Recent Tenants |
| `attentionItems` | Attention rows | array | no | Mixed | Attention panel | Implemented | Permission-filter |
| `generatedAt` | UTC generated time | datetime | no | Clock | Not displayed | Backend Only | Last Updated |
| FE `monthlyRecurringRevenue` | Placeholder | number | � | Hardcoded 0 | KPI | Placeholder | Replace with real MRR |
| FE `*ChangePercent` | Fake stability | number | � | Hardcoded 0 | KPI badges | Placeholder | Real periods |
| FE `trend[]` | Empty chart | array | � | Hardcoded [] | Chart | Placeholder | Real series |
| FE `systemHealth` | Attention heuristic | string | � | Derived | KPI | Rejected heuristic | Real health |
| FE `inactive` residual | Fake inactive | number | � | Arithmetic | Donut | Incorrect | Explicit `inactive` |

---

## 17. Failure and Partial-Response Contract

### Current (accepted only as present behaviour)

- Single aggregate response.
- Permission failure ? 403 for whole endpoint.
- Unhandled failure ? whole-page error + retry.
- No section-level status.

### Approved target

| Concept | Rule |
|---|---|
| Section success | Render section data |
| Section unavailable | Contained error; other sections remain |
| Section error code | Stable code per section (to be defined with DTO) |
| Whole response failure | Only when no usable section can be produced / transport failure |
| Retry | Page retry and/or per-section retry |
| Last known data | Prefer retain on refresh failure |
| Sensitive errors | No internal details |
| Permission filtering | Omit or null sensitive sections rather than 403 entire dashboard when page permission exists. **Do not** return permission-hidden commercial/user metrics as authentic-looking `0` counts. |
| HTTP | **HTTP 200** when at least one useful section succeeds; each section carries success/unavailable status + safe `errorCode` when failed. Full **5xx** only when no usable section can be produced or a critical request-level failure occurs. Exact property names remain implementation-defined; product behaviour is fixed. |

Gap: SA-DASH-GAP-07.

---

## 18. Date, Time and Currency

| Topic | Rule |
|---|---|
| Backend timestamps | UTC |
| `generatedAt` | UTC |
| UI Last Updated | Localise to approved application/user timezone |
| Default money currency | LKR unless row currency says otherwise |
| MRR | Per-currency; no cross-currency sum |
| Trend boundaries | Platform Default Timezone defines calendar boundaries; backend converts local period edges to UTC for queries (DST-safe); trends unavailable if timezone cannot be resolved |
| Refresh success | Updates displayed timestamp from new `generatedAt` |
| Refresh failure | Timestamp unchanged |

## Trend Period Timezone Contract

Final decision: all Platform Dashboard trend-period boundaries use the Platform Default Timezone.

Authoritative source
- Platform Settings ? Default Timezone (backend setting key `general.default_timezone`, DTO field `DefaultTimezone`).

Storage vs boundary calculation
- Persisted instants remain UTC.
- Backend determines local calendar period boundaries using the configured Platform Default Timezone (DST-safe rules from the timezone identifier).
- Backend converts those local boundaries into UTC instants before querying persisted records.
- Results are grouped according to the Platform Default Timezone context.

Period principles (when used)
- Daily: a dashboard day starts/ends according to Platform Default Timezone.
- Monthly: month begins at local day 1, `00:00:00` in Platform Default Timezone and ends immediately before the next local month begins.
- Weekly/monthly comparison periods use the immediately preceding calendar periods within the same timezone context.

DST-safe rule
- Do not calculate boundaries using fixed numeric offsets when a timezone identifier is available.

Critical rule (must not silently degrade)
- Trend calculations must never silently use UTC calendar boundaries when the Platform Default Timezone is different from UTC.

Missing/invalid timezone behaviour
- If the Platform Default Timezone is missing/invalid/unresolvable, classify trend sections as unavailable.
- Return a safe unavailable state consistent with the approved partial-response contract; do not return misleading trend values.

Relation to `generatedAt`
- `generatedAt` remains a UTC instant; the UI localizes `generatedAt` for display.
- Trend boundary behaviour and `generatedAt` display are related but not identical: trend boundaries follow Platform Default Timezone.

Frontend label behaviour
- Frontend period labels (daily/weekly/monthly) must align to the same Platform Default Timezone context used by the backend.

Current implementation status
- Approved decision recorded; trends are not yet implemented/verified end-to-end.
- Gap updated: `SA-DASH-GAP-02`.

---

## 19. UI States

Documented states (behavioural; not visual styling):

- Initial
- Loading
- Loaded
- Empty (authentic zeros)
- Partially loaded (target)
- Individual widget unavailable (target)
- Full-page error
- Permission denied
- Refreshing (target)
- Refresh failed (target)
- Session expired
- Sensitive widget hidden
- Destination unavailable / nav disabled
- Stale data indicator (optional UX enhancement; not required to close R1 gaps)
- Placeholder metric explicitly labelled until SA-DASH gaps close

---

## 20. Navigation Contract

| Attention / item | Destination | Query | Destination permission | Count/filter consistency | Missing permission |
|---|---|---|---|---|---|
| `suspended_tenants` | `/admin/tenants` | `status=suspended` | `platform.tenants.view` | Same suspended set | Disable nav |
| `setup_pending` | `/admin/tenants` | Filter representing **full** Setup Pending population (�13) | `platform.tenants.view` | **Must match count** | Disable nav |
| `past_due_subscriptions` | `/admin/tenants` | `billingStatus=PAST_DUE` | `platform.tenants.view` (+ data requires `platform.billing.view`) | Same PAST_DUE set | Hide card/values |
| `pending_billing` | `/admin/billing` | none | `platform.billing.view` | Billing list pending invoices | Hide card |
| View all tenants | `/admin/tenants` | none | `platform.tenants.view` | � | Disable link |
| Recent tenant row (target) | Tenant detail | `tenantId` | `platform.tenants.view` | � | Disable link |

Correct SA-DASH-GAP-05 so Setup Pending count and filter are identical sets.

---

## 21. Business Rules

1. Tenant lifecycle categories in the snapshot are **mutually exclusive**.
2. Subscription states are **independent** from tenant lifecycle.
3. **Trial is not a tenant lifecycle status.**
4. **Inactive is not residual arithmetic.**
5. Sensitive commercial data requires `platform.billing.view` (or a future approved commercial permission).
6. Attention total is an **issue-count sum** unless a distinct-tenant rule is separately approved.
7. MRR must come from real subscription/billing data (Release 1).
8. Trend and % change require historical comparison � never hard-coded fake stability.
9. System Health requires real health checks � never attention heuristics.
10. Placeholder metrics must be explicitly labelled until implemented; they must not look like live calculated stability.
11. Deleted outlets/tills/tenant users are excluded from footprint counts; tenant soft-delete policy on totals remains explicit.
12. Refresh failure must not advance Last Updated.
13. Partial widget failure must not block successful widgets (target).
14. Role names never authorise dashboard access by themselves.
15. Count and destination filters for attention cards must represent the same population.

---

## 22. Acceptance Criteria

1. An authorised Platform User with `platform.dashboard.view` can open the dashboard.
2. A user without `platform.dashboard.view` cannot access it.
3. Dashboard data comes from real APIs, not mock business values.
4. MRR displays a real approved calculation (per currency).
4a. Missing/invalid currency metadata for any eligible MRR currency marks the entire Revenue section unavailable (not partial/silent/defaulted); empty eligible subscriptions use empty/zero success state.
5. Percentage changes use real comparison periods.
6. Trends use real historical data.
7. System Health uses real dependency health (`HEALTHY` / `DEGRADED` / `CRITICAL` / `UNKNOWN`).
8. Tenant lifecycle categories are mutually exclusive.
9. Trial appears only in subscription status, not lifecycle donut.
10. Inactive is based on explicit `inactive` status.
11. Setup Pending represents incomplete mandatory onboarding (�13).
12. Setup Pending count and filtered destination match.
13. Financial widgets require `platform.billing.view` (MRR additionally requires `platform.tenant_subscriptions.view`).
14. No attention card creates a predictable permission-denied dead end.
15. One failed widget does not block successful widgets.
16. Platform Footprint distinguishes Tenant Users and Platform Users.
17. Last Updated displays `generatedAt`.
18. Manual refresh updates data and timestamp on success.
19. Refresh failure preserves last valid data where practical.
20. Placeholder metrics are clearly marked until implemented.
21. Current status remains **Mostly Implemented** until all criteria pass and are verified end-to-end.

---

## 23. Current Implementation Status

### Implemented

- Dashboard route `/admin/dashboard`
- Authentication guard + `platform.dashboard.view` route guard
- Aggregate API with platform permission check
- Core tenant counts (`total`, `active`, `suspended`)
- Active subscription count
- Attention items (four types) with SA-P0-02 count wiring
- Recent Tenants (latest five by `createdAt`)
- Whole-page error + retry
- Authentic zero handling for empty DB
- Basic attention navigation (not permission-aware)

### Partially Implemented

- KPI row (real counts + placeholder MRR/% )
- Lifecycle snapshot (wrong Trial/Inactive model)
- Setup Pending (status OR + mismatched filter)
- Manual refresh (error retry only)
- Footprint fields returned but not shown as Footprint section
- Subscription health % derived in FE from totals
- `platform.tenant_subscriptions.view` catalogue + Super Administrator seed/migration + Backend Dashboard subscription/billing/user field filtering (FE gating incomplete; omit/hide vs zero mismatch remains)
- Widget permission Backend filtering (partial; FE destination/nav gating incomplete)

### Placeholder

- MRR
- Percentage changes (�No change yet� / `0`)
- Trend series / chart
- System Health heuristic

### Not Implemented

- Real System Health module
- Separate subscription status snapshot UI
- Explicit inactive lifecycle count
- Setup completion checklist evaluation
- Full widget destination/data permission UX (Frontend)
- Partial section failure
- Platform Users count
- Footprint UI section
- Display of `generatedAt`
- Success-state manual refresh control

### Current Rating

**Mostly Implemented**

---

## 24. Known Gaps

Gap documentation standard: each gap below is the implementation-ready contract for that work item. Cross-references: �9��22. Full audit: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-07-29-platform-dashboard/Platform_Dashboard_Second_Brain_Gap_Completion_Audit]].

### SA-DASH-GAP-01 � Real MRR missing

#### Problem
Release 1 requires real per-currency MRR; current product shows a permanent-looking placeholder.

#### Current documented behaviour
Backend `PlatformDashboardResponse` has no MRR fields. Frontend hardcodes `monthlyRecurringRevenue: 0` and labels �Not tracked in OneVerz POS MVP�.

#### Current verified implementation
Not Implemented (placeholder only).

#### Approved target behaviour
Per-currency MRR for `ACTIVE` paid subscriptions only (�11). Separate currency groups; no FX; formula `plan + recurring add-ons - recurring discounts` after monthly normalisation.

#### Business rules
Include: `ACTIVE`, recurring plan, recurring add-ons, approved recurring discounts. Exclude: `TRIAL`, `PAST_DUE`, `CANCELLED`, `EXPIRED`, `ONE_TIME`, tax/fees/refunds/credits. Normalise: monthly �1, yearly �12, quarterly �3 when model supports quarterly. Round final per-currency aggregate with `MidpointRounding.ToEven` using `currencies.decimal_places`.

#### User-visible behaviour
Show one MRR card/group per currency. Hide without both `platform.tenant_subscriptions.view` and `platform.billing.view`. Never show fake 0 as live revenue.

#### Backend requirements
Query subscriptions/plans/addons/discounts + currency metadata; decimal-compatible maths; final rounding at output boundary.

#### Frontend requirements
Format using response `decimalPlaces`; no hard-coded precision map; hide without permissions.

#### Database/data requirements
Reuse existing subscription/currency tables; prefer subscription stored `PlanPrice` when present; no speculative MRR ledger unless reconstruction proves impossible.

#### Permission and security requirements
Requires `platform.dashboard.view` + `platform.tenant_subscriptions.view` + `platform.billing.view`. Backend is security boundary.

#### API/DTO requirements
Conceptual per-currency group: `currencyCode`, `decimalPlaces`, `amount`. Exact wire names follow project conventions.

#### Error and empty-state behaviour
- No eligible ACTIVE paid subscriptions ? successful Revenue section with empty per-currency collection or approved zero-state (not a metadata failure).
- Any eligible currency with missing/invalid central metadata ? entire Revenue / MRR section UNAVAILABLE with safe error code concept `platform_dashboard.currency_metadata_unavailable`; other Dashboard sections may still succeed (HTTP 200); see �11 closed decision SA-DASH-DECISION-PENDING-01.
- Frontend shows safe unavailable message; Refresh retries; do not falsely update Revenue data on failure.

#### Test requirements
Inclusion/exclusion; monthly/annual/quarterly; add-on/discount; multi-currency; ToEven; permission combinations; no FE precision table; missing-metadata ? whole Revenue UNAVAILABLE; empty eligible set ? success empty/zero (not metadata error).

#### Dependencies
SA-DASH-GAP-13, SA-DASH-GAP-14; billing/subscription entities; SA-DASH-GAP-07 partial section failure.

#### Risks
Using catalogue price without snapshot if price changes after assignment.

#### Acceptance criteria
Real per-currency MRR matches �11; permissions enforced; no FE hard-coded precision; placeholder removed; missing metadata marks whole Revenue unavailable (not partial/silent/defaulted).

#### Implementation evidence currently available
Live Super Admin: `revenueSummary` SUCCESS with per-currency `mrrByCurrency`; Unit/Integration/Api tests. See evidence doc 2026-07-29.

#### Remaining implementation work
Interactive UI confirmation only for overall Completed gate.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (API/live); overall Dashboard still Mostly Implemented pending full E2E gate

### SA-DASH-GAP-02 � Real percentage and trend data missing

#### Problem
% change and charts are fake (`0%` / empty `trend[]`).

#### Current documented behaviour
FE hardcodes zeros and empty trend; BE returns no trend series.

#### Current verified implementation
Not Implemented.

#### Approved target behaviour
Tenant Growth, Subscription Trend, MRR Trend with current vs previous calendar month in Platform Default Timezone; daily points within current month; DST-safe UTC conversion; unavailable when timezone invalid (�10.12�10.14, �18).

#### Business rules
Formula `((current - previous) / previous) � 100` when previous > 0; zero-baseline ? �new / no baseline�; no-history ? explicit empty; never silent UTC boundaries when platform TZ ? UTC.

#### User-visible behaviour
Show real series or safe unavailable state; period labels follow Platform Default Timezone.

#### Backend requirements
Timezone boundary service using `general.default_timezone` / `DefaultTimezone`; convert local edges to UTC for queries; group in platform TZ.

#### Frontend requirements
Render series/unavailable; no hardcoded 0% as stability.

#### Database/data requirements
UTC persisted timestamps; reconstruct from transactional history where accurate; do not fabricate.

#### Permission and security requirements
Tenant trends: `platform.dashboard.view`. Subscription trend also needs `platform.tenant_subscriptions.view`. MRR trend needs subscription + billing permissions.

#### API/DTO requirements
Trend series + % change fields under trends section (exact names implementation-defined).

#### Error and empty-state behaviour
Invalid/missing TZ ? trend section unavailable (partial-response compatible).

#### Test requirements
DST boundaries; conversion; missing TZ; zero baseline; permission filtering.

#### Dependencies
SA-DASH-GAP-01 for MRR trend; Platform Settings timezone.

#### Risks
Cannot fabricate historical MRR if history insufficient � show unavailable.

#### Acceptance criteria
Real trends/%; Platform Default Timezone; no hardcoded 0% as stability.

#### Implementation evidence currently available
`PlatformDashboardHistoricalTrendBuilder` + live Asia/Colombo daily series (tenant/sub/MRR); changeStatus including `new_no_baseline`; unit tests.

#### Remaining implementation work
Interactive chart UI click-through; optional richer DST fixture in live DB.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (API/live); interactive UI pending for overall Completed gate

### SA-DASH-GAP-03 � System Health is not a real health metric

#### Problem
FE derives health from attention counts.

#### Current documented behaviour
`systemHealth: itemsRequiringAttention > 0 ? 'Needs Attention' : 'Healthy'`.

#### Current verified implementation
Not Implemented correctly (rejected heuristic). Static `/api/v1/health` is not the Dashboard contract.

#### Approved target behaviour
Real dependency health (�12): Core API, Database, Background jobs, Email, Payment provider, Blob storage. Statuses HEALTHY / DEGRADED / CRITICAL / UNKNOWN. Critical vs non-critical aggregation. Bounded probe timeouts. Last-checked time when available. Never attention/billing/suspended derived.

#### Business rules
Critical failure ? CRITICAL; only non-critical ? DEGRADED; all pass ? HEALTHY; no signals ? UNKNOWN.

#### User-visible behaviour
Show status + safe summary; no internal diagnostics.

#### Backend requirements
Reuse ASP.NET health infrastructure where suitable; bounded timeouts; safe aggregation.

#### Frontend requirements
Remove attention heuristic; render HEALTHY/DEGRADED/CRITICAL/UNKNOWN.

#### Database/data requirements
No special schema required unless job/health records already exist and are useful.

#### Permission and security requirements
R1 basic summary: `platform.dashboard.view` only. Never expose secrets/stack traces.

#### API/DTO requirements
System Health section with status, dependency summaries, optional lastCheckedAt.

#### Error and empty-state behaviour
Probe failure ? dependency CRITICAL/DEGRADED/UNKNOWN per rules; slow probe must not block whole Dashboard.

#### Test requirements
Aggregation matrix; attention-heuristic removed; degraded/critical/unknown cases.

#### Dependencies
SA-DASH-GAP-07 for section isolation.

#### Risks
Over-coupling health probes to Dashboard latency.

#### Acceptance criteria
Real health; attention heuristic removed.

#### Implementation evidence currently available
`PlatformDashboardHealthProbe` live: critical payment DEGRADED ? overall CRITICAL; email UNKNOWN (no false HEALTHY); `checkedAt` present; FE maps HEALTHY/DEGRADED/CRITICAL/UNKNOWN.

#### Remaining implementation work
Provider-specific live probes when adapters exist; interactive health UI confirmation.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (API/live aggregation); provider live probes limited by local config

### SA-DASH-GAP-04 � Tenant lifecycle / subscription status overlap

#### Problem
Trial mixed into lifecycle; Inactive computed residually.

#### Current documented behaviour
BE: `active`/`suspended` counts; trial from subscription; FE residual Inactive and Trial in donut.

#### Current verified implementation
Not Implemented correctly.

#### Approved target behaviour
Mutually exclusive lifecycle buckets: draft/setup_pending/pending_activation/pending_payment ? Setup Pending; active ? Active; suspended ? Suspended; inactive ? Inactive. Trial subscription-only. Inactive explicit only (�13 mapping).

#### Business rules
Buckets mutually exclusive; Trial not a lifecycle bucket; no residual arithmetic.

#### User-visible behaviour
Lifecycle snapshot without Trial; subscription snapshot includes Trial/Active/Past Due/Cancelled/Expired.

#### Backend / Frontend / Database / Permission requirements
Return explicit lifecycle counts; FE stop residual math; existing tenant status strings; page permission for summary; tenant nav needs `platform.tenants.view`.

#### API/DTO requirements
Lifecycle counts distinct from subscription status counts.

#### Error and empty-state behaviour
Authentic zeros when no tenants in a bucket.

#### Test requirements
Each mapping row; trial exclusion; inactive explicit.

#### Dependencies
SA-DASH-GAP-05 for Setup Pending population.

#### Risks
Legacy status OR definitions drifting from checklist.

#### Acceptance criteria
Mapping matches �13; Trial not in lifecycle donut; Inactive explicit.

#### Implementation evidence currently available
Partial counts only (active/suspended/setup OR).

#### Implementation status
Completed and Verified (API/live lifecycle buckets)

### SA-DASH-GAP-05 � Setup Pending definition / filter mismatch

#### Problem
Count uses `setup_pending` OR `pending_payment`; nav filters only `setup_pending`; checklist not evaluated.

#### Current documented behaviour
Attention type `setup_pending` counts OR statuses; query param `status=setup_pending` only.

#### Current verified implementation
Partially incorrect / incomplete.

#### Approved target behaviour
Mandatory checklist (�13): business profile, plan, entitlements, billing condition, Tenant Admin. Outlets/tills optional. Main Dashboard: count only. Detail: completed/missing steps, progress %, Continue Setup to existing tenant detail/activation surface. Count filter population must match. Lifecycle mapping includes draft/pending_activation. pending_payment may also contribute to Pending Billing attention without confusing double-count.

#### Business rules
Optional steps do not block; mandatory incomplete ? Setup Pending; count == filter set.

#### User-visible behaviour
Count-only on main card; detail progress on destination.

#### Backend / Frontend / Database / Permission requirements
Evaluate checklist or keep stored status consistent with it; nav filter matches population; tenant tables/admin/subscription/billing evidence; data `platform.dashboard.view`; nav `platform.tenants.view`.

#### API/DTO requirements
Setup Pending count; detail may expose step codes / progress when requested by destination screens.

#### Error and empty-state behaviour
Authentic 0 when none pending.

#### Test requirements
Count/filter identity; dual pending_payment classification; optional outlets/tills.

#### Dependencies
Create Tenant Wizard + Tenant Activation journeys.

#### Risks
Status-only shortcut diverging from checklist.

#### Acceptance criteria
Checklist contract + identical count/filter population.

#### Implementation evidence currently available
Shared `PlatformTenantSetupChecklistEvaluator`; list+detail progress/completed/missing/`continueSetupPath`; live count=list (9=9).

#### Remaining implementation work
Browser Continue Setup click-through for overall Completed gate.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (API/live); interactive Continue Setup UI pending for overall Completed gate

### SA-DASH-GAP-06 � Widget destination permissions not enforced in UI

#### Problem
Attention links always clickable; FE lacks full matrix; sensitive data may leak via UI paths.

#### Current documented behaviour
Page permission only on route; attention rows always navigate.

#### Current verified implementation
**Partially Implemented.** Backend `PlatformDashboardService` filters subscription-derived fields without `platform.tenant_subscriptions.view`, billing attention without `platform.billing.view`, and zeros `TotalUsers` without `platform.users.view`. **Mismatch:** approved omit/hide/null � not authentic-looking zeros. Frontend widget/nav gating missing.

#### Approved target behaviour
Full �14 matrix: page / data / financial / destination permissions; hide commercial; disable operational nav; no predictable 403; Backend security boundary + Frontend UX gating.

#### Business rules / User-visible behaviour
Sensitive commercial widgets hidden; operational summaries may be non-clickable; no dead-end 403.

#### Backend / Frontend / Permission / API requirements
Enforce on API; omit forbidden sections; FE AccessControl gating; direct API protected same as UI.

#### Error and empty-state behaviour
Permission-restricted sections omitted/inaccessible � never fake zero as real metric.

#### Test requirements
Widget visibility/nav matrix for all �14 combinations.

#### Dependencies
SA-DASH-GAP-13.

#### Risks
Zeroing mistaken for empty platform.

#### Acceptance criteria
�14 enforced BE+FE; no dead-end nav; no fake zeros for hidden metrics.

#### Implementation evidence currently available
BE filter + permission catalogues (partial).

#### Remaining implementation work
FE gating; omit/hide correction; E2E matrix.

#### Documentation decision status
Decision Complete

#### Implementation status
Implemented; partial live permission profiles verified

### SA-DASH-GAP-07 � Atomic failure instead of partial widget failure

#### Problem
Whole-page failure when any aggregate path fails.

#### Current documented behaviour
Atomic aggregate; FE full-page error + retry.

#### Current verified implementation
Not Implemented (atomic only).

#### Approved target behaviour
HTTP 200 when =1 useful section succeeds; per-section status + safe errorCode; 5xx only when no usable section / critical request failure; retain data on refresh failure; do not advance generatedAt on failed refresh. Exact DTO property names implementation-defined; behaviour fixed (�17).

#### Business rules / User-visible / BE / FE / Permissions / API
Successful sections remain; failed show unavailable; permission-restricted omit; preserve envelope conventions; backward compatible where practical.

#### Error and empty-state behaviour
Section unavailable with safe code; no internal details.

#### Test requirements
One failed section; all fail ? 5xx/full failure; refresh failure retains data.

#### Dependencies
Sectioned response design.

#### Risks
Breaking consumers of flat DTO � migrate carefully.

#### Acceptance criteria
Partial success preserves successful widgets.

#### Implementation evidence currently available
None.

#### Remaining implementation work
Section wrappers BE+FE+tests.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (sectioned response; live partial SUCCESS with health CRITICAL)

### SA-DASH-GAP-08 � Platform Footprint incomplete in UI

#### Problem
Outlets/tills/tenant-users returned but not rendered as Footprint; Platform Users missing.

#### Current documented behaviour
`totalOutlets` / `totalTills` / `totalUsers` backend-only; no Platform Users field.

#### Current verified implementation
Backend Only for three fields; Platform Users Not Implemented.

#### Approved target behaviour
Dedicated Footprint section: Total Outlets, Total Tills, Total Tenant Users, Total Platform Users. Exclude DELETED. Distinct labels. Permissions: dashboard for outlets/tills/tenant users; `platform.users.view` for Platform Users count/nav.

#### Business rules / User-visible / BE / FE / DB / Permissions / API
No ambiguous Total Users; separate fields; empty authentic zeros; hide Platform Users without permission (omit, not fake zero).

#### Test requirements
DELETED exclusion; separate counts; permission hide.

#### Dependencies
SA-DASH-GAP-09.

#### Risks
N+1 queries � use platform-wide aggregates.

#### Acceptance criteria
Footprint UI complete and labelled correctly.

#### Implementation evidence currently available
Three BE fields only.

#### Remaining implementation work
Platform Users query + Footprint UI + tests.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (live footprint)

### SA-DASH-GAP-09 � User count meaning incomplete / ambiguous

#### Problem
`totalUsers` means tenant users only; no platform user count; risk of ambiguous �Total Users�.

#### Current documented behaviour
`totalUsers` = non-DELETED tenant users.

#### Current verified implementation
BE returns tenant-user `totalUsers`. Partial permission filter zeros `TotalUsers` without `platform.users.view` � incorrect for Platform Users (field is tenant users) and incorrect omit semantics.

#### Approved target behaviour
Separate Tenant Users and Platform Users concepts/labels. Permission-hidden metrics omitted/null/section-forbidden � never presented as real zero. Platform Users requires `platform.users.view`.

#### Business rules / FE / BE / Permissions / API
Exclude DELETED; no tenant/platform overlap; rename display Tenant Users; add Platform Users field/section.

#### Test requirements
Meaning separation; permission omit vs zero.

#### Dependencies
SA-DASH-GAP-08.

#### Risks
Current zeroing teaches wrong empty state.

#### Acceptance criteria
No ambiguous Total Users; separate metrics; omit-not-zero for hidden Platform Users.

#### Implementation evidence currently available
Tenant-user field only; incorrect zeroing partial.

#### Remaining implementation work
Rename/split + Platform Users + omit semantics + tests.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (live omit without users.view)

### SA-DASH-GAP-10 � generatedAt not displayed

#### Problem
API returns UTC `generatedAt`; UI does not show Last Updated.

#### Current documented behaviour / verified implementation
Field returned; unused in UI. Not Implemented.

#### Approved target behaviour
Display `Last updated: <localized datetime>` from UTC `generatedAt`. Update only on successful load/refresh.

#### Business rules / FE / BE / Permissions / API
`generatedAt` remains UTC instant; UI localizes; same on success refresh; unchanged on failure.

#### Test requirements
Display present; failure does not advance timestamp.

#### Dependencies
SA-DASH-GAP-11.

#### Acceptance criteria
Last Updated visible and correct.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (generatedAt / Last Updated)

### SA-DASH-GAP-11 � No success-state manual refresh

#### Problem
Retry exists only on error; no success-state Refresh.

#### Current documented behaviour / verified implementation
Error-state Try again only. Not Implemented for success-state refresh.

#### Approved target behaviour
Refresh control; refreshing state; duplicate-request prevention; retain existing data on failure; error message; timestamp integrity; accessible labels.

#### Test requirements
Success refresh; failed refresh retains data; duplicate click prevention.

#### Dependencies
SA-DASH-GAP-07, SA-DASH-GAP-10.

#### Acceptance criteria
Manual refresh works per �19/�18.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (API refresh; generatedAt advances)

### SA-DASH-GAP-12 � �Recent Platform Activity� label overstates data

#### Problem
UI title says Recent Platform Activity; data is latest five tenant creates.

#### Current documented behaviour / verified implementation
Data source correct (`recentTenants`); label incorrect. Not Implemented (label).

#### Approved target behaviour
Label **Recent Tenants**. Permission-aware nav with `platform.tenants.view`. Empty state when none.

#### Test requirements
Label text; permission nav; empty state.

#### Acceptance criteria
No generic Platform Activity claim without multi-event feed.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (Recent Tenants label/data)

### SA-DASH-GAP-13 � Dedicated tenant-subscription view permission not implemented

#### Problem
Dedicated `platform.tenant_subscriptions.view` required for subscription widgets; previously missing.

#### Current documented behaviour
Previously absent from catalogue; interim billing fallback not approved.

#### Current verified implementation
**Partially Implemented.**

| Area | Evidence | Status |
|---|---|---|
| Backend constant | `PlatformPermissionCodes.TenantSubscriptionsView` | Present |
| FE key | `platformPermissions.tenantSubscriptionsView` | Present |
| Seed definitions | `PlatformAdminPermissionsSeedData` | Present |
| Migration | `20260729153000_SeedTenantSubscriptionsViewPermission` | Present |
| Catalogue mapper | `tenant_subscriptions` module | Present |
| Backend Dashboard filter | `PlatformDashboardService` | Present (zeroing mismatch remains) |
| Frontend widget/nav gating | Dashboard page | Missing |
| Full E2E matrix | Integration journeys | Missing |
| Unit tests (catalogue 37) | Backend UnitTests 470 passed | Catalogue verified |

#### Approved target behaviour
Purpose: tenant subscription lifecycle + dashboard subscription widgets. Distinct from plan and billing permissions. MRR needs this + `platform.billing.view`. Default grant: Super Administrator only; Billing/Support/custom = explicit assignment. Runtime permission-based only.

#### Business rules / User-visible / BE / FE / DB / Permissions / API / Errors / Tests
Hide subscription widgets/nav without permission; enforce on API; omit not fake-zero; seed Super Administrator; tests for role defaults and widget matrix.

#### Dependencies
SA-DASH-GAP-06; MRR gaps.

#### Risks
Leaving zeroing in place misleads operators.

#### Acceptance criteria
Catalogue + seed + BE + FE + tests all verified; only then Completed and Verified.

#### Implementation evidence currently available
See table above.

#### Remaining implementation work
Omit/hide correction; FE gating; E2E; role-catalogue verification.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (migration applied; Super Admin grant; live gating)

### SA-DASH-GAP-14 � Central ISO 4217 currency precision source not implemented or not verified

#### Problem
MRR/formatting must use central `currencies.decimal_places` + ToEven; not verified on Dashboard.

#### Current documented behaviour / verified implementation
Metadata table exists; Dashboard MRR/precision integration Not Implemented.

#### Approved target behaviour
ISO-aligned `currencies.currency_code` + `decimal_places`; DTO group includes `currencyCode`, `decimalPlaces`, `amount`; ToEven at final aggregate; FE no hard-coded precision map; tests for 0/2/3 decimal currencies. Missing/invalid metadata for any eligible MRR currency ? entire Revenue section UNAVAILABLE (`platform_dashboard.currency_metadata_unavailable` concept); empty eligible subscriptions are a success empty/zero state, not a metadata failure (�11).

#### Business rules / FE / BE / DB / Permissions / API / Errors / Tests
Backend owns precision; no FE currency precision table; no default/inferred precision; log invalid CurrencyCode securely; FE shows safe unavailable for Revenue section; Refresh retries; do not falsely update Revenue data.

#### Dependencies
SA-DASH-GAP-01; SA-DASH-GAP-07.

#### Acceptance criteria
Precision from central metadata; ToEven verified; FE uses response precision; metadata failure marks whole Revenue unavailable without presenting incomplete MRR as complete.

#### Implementation evidence currently available
`currencies.decimal_places` exists in DB model; Dashboard unused.

#### Remaining implementation work
Wire into Dashboard MRR + FE formatting + metadata-unavailable section tests.

#### Documentation decision status
Decision Complete

#### Implementation status
Completed and Verified (ToEven + decimal_places; live MRR group)

## 24A. Closed product decisions

### SA-DASH-DECISION-PENDING-01 � Missing currency metadata behaviour � **CLOSED**

| Field | Value |
|---|---|
| Status | **Closed � Approved final** (2026-07-29) |
| Question | When an eligible ACTIVE subscription has a CurrencyCode with no valid central currency metadata / decimal precision, what must Dashboard MRR do? |
| Final decision | Mark the **entire Revenue / MRR section** UNAVAILABLE; do not calculate/expose partial MRR as complete; do not omit silently; do not default/infer/substitute precision; do not FX; do not return zero for the affected group; preserve other successful sections; HTTP 200 when another useful section succeeds; safe error-code concept `platform_dashboard.currency_metadata_unavailable`; secure backend log of CurrencyCode; FE safe unavailable + Refresh retry; no false Revenue update on failure |
| Empty eligible subscriptions | Successful Revenue section with empty/zero state � **not** metadata failure |
| Affected gaps | SA-DASH-GAP-01, SA-DASH-GAP-14 |
| Implementation status | Approved � Not Implemented |

No open product decisions remain for Platform Dashboard Release 1 gap contracts. Remaining work is implementation of SA-DASH-GAP-01�14.

---

## Related Files

- [[01_Login_Flow]]
- [[03_Tenant_Management_Flow]]
- [[04_Create_Tenant_Wizard_Flow]]
- [[10_Billing_Flow]]
- [[11_Tenant_Activation_Flow]]
- [[12_Subscription_Billing_Management_Flow]]
- [[../../02_ACCESS_CONTROL/Permission_Code_List]]
- [[../../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../../04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract]]
- [[../../04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-07-20-full-system-status/SA-P0-02_Dashboard_Attention_Count_Fix]]
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-07-29-platform-dashboard/Platform_Dashboard_Second_Brain_Gap_Completion_Audit]]
