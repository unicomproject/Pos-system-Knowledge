# OneVerz Super Admin — UI-4 Subscription Management Planning Audit

**Date:** 2026-08-11  
**Audit type:** Comprehensive Read-Only Planning Audit  
**Slice:** UI-4 — Subscription Management  
**Status:** COMPLETE — Premium Visual Direction may begin with non-blocking gaps  

---

## 1. Executive Summary

UI-4 in current merged Platform Admin is **Subscription Plan Catalog Management**, not a full SaaS “tenant subscription CRM.”

| Active UI-4 surface | Route |
|---------------------|-------|
| Plan List | `/admin/subscriptions` |
| Plan Detail | `/admin/subscriptions/:planId` |
| Create / Edit Plan (shared wizard) | `/admin/subscriptions/create` |

There is **no** dedicated Platform Admin tenant-subscription list/detail route. Tenant subscription **summary + plan change** lives on **Tenant Detail** (UI-2) via entitlements. **Billing / invoices / manual payments** are **UI-5** and must stay out of UI-4 redesign.

Backend plan APIs under `api/v1/platform/subscription-plans` are **sufficient** for Premium Blue modernization of the plan catalog (list/detail/create-edit/publish/archive/reactivate/delete-draft). Tenant subscription cancel/renew/suspend-as-subscription-status are **not** first-class Platform Admin APIs — do not invent UI for them.

**Final Verdict:**

```text
SUPER ADMIN UI-4 READY WITH NON-BLOCKING GAPS — PREMIUM VISUAL DIRECTION MAY BEGIN
```

---

## 2. UI-3 Closure Prerequisite

| Check | Result |
|-------|--------|
| Document on `origin/main` | `15_IMPLEMENTATION_TRACKING/ONEVERZ_SUPER_ADMIN_UI3_FINAL_AGGREGATE_CLOSURE_2026-08-11.md` |
| Closure commit ancestor | `c21bef68b6f5f38e0e0d1b1575dd416034916a62` → YES |
| SB `origin/main` | `4d8918d` Merge PR #76 docs/super-admin-ui3-final-aggregate-closure |

**UI-3 Final Closure Integrated:** YES

---

## 3. Repository Baselines

| Repository | `origin/main` | Latest |
|------------|---------------|--------|
| Platform Admin | `a7bd53ef50953077201a367c28703f0f3cee6fb1` | Merge PR #45 UI-3C |
| Backend (Unified-Commerce) | `560b207171011e5e2ecc313a56a0bdd600bf1512` | Merge PR #84 Feature/opening-stock (unrelated) |
| Second Brain | `4d8918d16cce6517c50cf39e50d04906c56c2f09` | Merge PR #76 UI-3 final closure |

**PA audit runtime:** worktree `super-admin-ui3-final-closure` @ `a7bd53e` (= origin/main)  
**Serve smoke:** `http://127.0.0.1:4340`

---

## 4. UI-4 Scope Definition

**In scope (discovered):**

- Subscription **plan catalog** list, detail, create, edit
- Plan lifecycle: draft → publish (active) → archive (retired) → reactivate; delete draft
- Plan commercial terms, modules/features, limits
- Navigation label “Subscriptions” → plan catalog

**Out of scope / other slices:**

| Concern | Owner |
|---------|-------|
| Invoices, payments, settlement, manual payment | **UI-5 Billing** |
| Tenant list/detail shell, entitlements editor UI modernization | **UI-2** (already closed; consume contracts only) |
| Plan selection during Create Tenant | **UI-3A** (closed; reuses plan catalog) |
| Dedicated tenant-subscription list / cancel / renew / suspend-subscription | **NOT SUPPORTED** as Platform Admin first-class UI today — do not invent |

**UI-4 Scope (planning):** Plan Catalog Management (List + Detail + Create/Edit)

---

## 5. UI-4 / UI-5 Boundary

| Capability | UI-4 | UI-5 | Shared Contract |
|------------|-----:|-----:|-----------------|
| Plan selection / catalog | YES | — | Plan DTOs used by onboarding + tenant entitlements |
| Subscription status (tenant) | SUMMARY only via Tenant Detail / read models | — | `TenantSubscription` statuses |
| Billing cycle on plan | YES (plan commercial) | Display on invoices | Plan `MONTHLY/YEARLY/ONE_TIME` |
| Invoice creation | — | YES | |
| Payment collection | — | YES | |
| Renewal (billing operation) | NOT SUPPORTED as UI-4 action | Future if product adds | `AutoRenew` field exists only |
| Suspension | Tenant suspend (UI-2) | Billing side-effects | Do not equate to subscription CANCELLED |

**UI-4 / UI-5 Boundary:** CLEAR

---

## 6. Route Inventory

| Route | Component | Active? | Purpose | Slice |
|-------|-----------|--------:|---------|-------|
| `/admin/subscriptions` | `PlatformSubscriptionPlansPage` | YES | Plan list | UI-4 |
| `/admin/subscriptions/:planId` | `PlatformSubscriptionPlanDetailPage` | YES | Plan detail | UI-4 |
| `/admin/subscriptions/create` | `PlatformCreateSubscriptionPlanPage` | YES | Create **and** edit (router state) | UI-4 |
| `/admin/billing` | `PlatformBillingPage` | YES | Invoices | UI-5 |
| `/admin/billing/manual-payments` | `PlatformManualPaymentsPage` | YES | Manual payments | UI-5 |
| `/admin/billing/manual-payments/:paymentId` | `PlatformManualPaymentDetailPage` | YES | Payment review | UI-5 |
| `/admin/tenants/:tenantId` | `PlatformTenantDetailPage` | YES | Tenant sub summary + change plan | UI-2 (contract for UI-4) |

No active “Tenant Subscription List/Detail” route.

---

## 7. Navigation Inventory

| Navigation Item | Route | Permission | Active-State |
|-----------------|-------|------------|--------------|
| Subscriptions | `/admin/subscriptions` | `platform.subscription_plans.view` | Matches `/admin/subscriptions*` |
| Billing | `/admin/billing` | `platform.billing.view` | Billing subtree |

- No separate “Plans” menu item (Subscriptions = plans).
- `hasSubmenu: true` on Subscriptions/Billing is **unused** in sidebar implementation (cosmetic debt).

**Subscription Navigation:** PASS (with minor unused-submenu debt)

---

## 8. Active / Legacy UI Inventory

| Component | Routed? | Active? | Legacy? | Recommendation |
|-----------|--------:|--------:|--------:|----------------|
| `PlatformSubscriptionPlansPage` | YES | YES | Current | MODERNIZE |
| `PlatformSubscriptionPlanDetailPage` | YES | YES | Current | MODERNIZE |
| `PlatformCreateSubscriptionPlanPage` | YES | YES | Current | MODERNIZE (create+edit) |
| Separate edit page | NO | — | — | Keep shared wizard |
| Tenant-subscription dedicated page | NO | — | — | Do not invent in UI-4 |

**Duplicate Active Subscription UI:** NONE

---

## 9. Subscription Domain Model

| Domain Type | Purpose | Key Fields | UI Relevance |
|-------------|---------|------------|--------------|
| `SubscriptionPlan` | Catalog commercial offer | code, name, status, price, currency, billing interval, limits, features | UI-4 primary |
| `SubscriptionPlanFeature` | Plan↔feature inclusion | plan_id, feature_id, status | Create/edit + detail |
| `SubscriptionPlanFeatureLimit` | Structured limits | plan_id, limit definition | Detail/limits |
| `TenantSubscription` | Tenant’s commercial subscription | plan FK, status, price/currency snapshot, trial dates, autoRenew | Tenant Detail summary; not UI-4 list |
| `TenantFeatureEntitlement` | Effective features | source PLAN/MANUAL/OVERRIDE | Tenant Detail entitlements |
| `SubscriptionInvoice` / payments | Financial ops | invoice/payment tables | **UI-5** |

---

## 10. Plan vs Tenant Subscription

```text
Plan = Catalog product definition (draft/active/retired) managed under /admin/subscriptions*
Tenant Subscription = Per-tenant commercial instance (TRIAL/ACTIVE/PAST_DUE/CANCELLED/EXPIRED)
                      created via onboarding/tenant create; plan changes via entitlements PUT
```

**Subscription Plan vs Tenant Subscription:** CLEAR

---

## 11. Plan Data Contract

| Field | Type | Required? | Editable? | Display? |
|-------|------|----------:|----------:|---------:|
| id | Guid | YES | NO | YES |
| planCode | string | YES | Draft only (immutable after publish — UI copy) | YES |
| planName | string | YES | Draft only (API) | YES |
| description | string? | NO | Draft only | YES |
| status | draft/active/retired | YES | via lifecycle actions | YES |
| billingCycle / BillingInterval | monthly/yearly/one_time | YES | Draft | YES |
| baseCurrency | string (default LKR) | YES | Draft pricing | YES |
| basePrice / PriceAmount | decimal | YES | Draft only | YES |
| trialDays | int | NO | Present on detail entity | YES (detail) |
| maxOutlets/Users/Tills | int? | YES for publish | Draft only | YES |
| features/modules | collections | for publish | Draft only | YES |
| activeTenantCount | int | computed | NO | YES |
| canEdit/Duplicate/Archive/Delete/Reactivate | bool | computed | NO | YES (actions) |
| createdAt/updatedAt | datetime | YES | NO | YES |

---

## 12. Tenant Subscription Data Contract (embedded)

| Field | Source | UI-4? |
|-------|--------|------:|
| planId / planName / planCode | Tenant detail DTO | NO (Tenant Detail) |
| subscriptionStatus | Tenant detail | NO |
| TrialEndsAt / StartsAt / EndsAt | Detail DTO | NO |
| plan_price / currency snapshot | DB | NO |
| AutoRenew | Domain field | NO dedicated UI |

---

## 13. Subscription Lifecycle (Tenant)

| Status | Meaning | Terminal? | Allowed next (domain) |
|--------|---------|----------:|------------------------|
| TRIAL | Trial period | NO | → ACTIVE (activate) |
| ACTIVE | Current | NO | PAST_DUE / CANCELLED / EXPIRED (constants exist) |
| PAST_DUE | Billing overdue signal | NO | ACTIVE / CANCELLED / EXPIRED |
| CANCELLED | Cancelled | YES (practically) | Limited |
| EXPIRED | Expired | YES | Limited |

**Platform Admin first-class actions for these statuses:** largely **NOT exposed** (no cancel/renew endpoints). Change plan via entitlements; tenant activate/suspend are **tenant** lifecycle.

**Subscription Lifecycle:** CLEAR (domain) / PARTIAL (Platform Admin action surface)

---

## 14. Plan Lifecycle

| Plan Status | Meaning | Allowed Actions |
|-------------|---------|-----------------|
| draft | Editable unpublished | Edit, Publish, Duplicate, Delete |
| active (UI: Published) | Assignable | Duplicate, Archive |
| retired (UI: Archived) | Not for new assignment | Duplicate, Reactivate |

**Plan Lifecycle:** CLEAR

---

## 15. Lifecycle Actions

| Action | Supported? | Endpoint | Preconditions | Side Effects |
|--------|----------:|----------|---------------|--------------|
| Create draft | YES | POST `/platform/subscription-plans` | create perm | Draft plan |
| Update basics/pricing/limits/features | YES | PUT/PATCH | **draft only** | |
| Publish | YES | POST `.../publish` | draft + valid limits | → active |
| Duplicate | YES | POST `.../duplicate` | duplicate perm | New draft |
| Archive | YES | POST `.../archive` | active + archive perm | → retired |
| Reactivate | YES | POST `.../reactivate` | retired; uses **archive** perm | → active |
| Delete | YES | DELETE `.../{id}` | **draft only** | Hard delete draft |
| Assign tenant subscription | PARTIAL | Tenant create / onboarding | | Not UI-4 page |
| Change plan | PARTIAL | PUT `.../tenants/{id}/entitlements` | entitlements.update | Tenant Detail |
| Cancel / Renew / Suspend subscription | NOT SUPPORTED | — | — | Do not design |

---

## 16. Onboarding / UI-3 Relationship

- UI-3A selects an **active** plan from catalog during Create Tenant.
- UI-4 manages the **same plan catalog**.
- After onboarding, plan changes go through **Tenant Detail entitlements**, not UI-4.
- UI-4 must not break catalog contracts used by UI-3A / tenant entitlements.

---

## 17–20. Plan Change / Renewal / Cancellation / Suspension

| Capability | Result |
|------------|--------|
| Plan Change (tenant) | PARTIAL — entitlements PUT on Tenant Detail |
| Renewal | NOT SUPPORTED as Platform Admin operation (`AutoRenew` field only) |
| Cancellation | NOT SUPPORTED as dedicated PA API (status constant exists) |
| Suspension / Reactivation | Tenant-level activate/suspend (UI-2), **not** subscription-status suspend |

---

## 21. Tenant vs Subscription Status

| Tenant Status | Subscription Status | Meaning | UI Action |
|---------------|---------------------|---------|-----------|
| ACTIVE | ACTIVE/TRIAL | Normal | Manage via tenant detail |
| SUSPENDED | May remain ACTIVE etc. | Tenant ops disabled; billing copy mentions suspend | Tenant Suspend (UI-2) |
| PENDING_* | Varies | Onboarding | UI-3C / tenant detail |

**Do not infer** tenant suspended ⇒ subscription CANCELLED. Source uses separate models.

**Tenant vs Subscription Status:** CLEAR

---

## 22. Entitlements / Overrides

| Concern | Result |
|---------|--------|
| Plan feature inclusion | UI-4 create/edit |
| Tenant entitlements edit | Tenant Detail (FULL for tenant) |
| Limit overrides | Tenant subscription override columns + entitlements editor |
| UI-4 entitlement management | **SUMMARY ONLY** on plan detail (included features); not per-tenant |

**Entitlement Management In UI-4:** SUMMARY ONLY  
**Subscription Overrides:** SUPPORTED (tenant entitlements path) — **OUT OF SCOPE for UI-4 page redesign**

---

## 23. Pricing / Currency / Billing Cycle

| Topic | Actual |
|-------|--------|
| Default currency | **LKR** (`SubscriptionPlanConstants.DefaultBaseCurrency`) |
| Plan billing intervals | `MONTHLY` \| `YEARLY` \| `ONE_TIME` (API: monthly/yearly/one_time) |
| Tenant billing cycle | monthly \| yearly (note casing differences) |
| Tax/discount on plan UI | Limited; list mapper hardcodes addOns/discount gaps |

**Subscription Currency Model:** LKR-default platform currency on plans; multi-currency fields exist on billing invoices (UI-5)  
**Billing Cycle Model:** CLEAR

---

## 24. Trial

| Layer | Support |
|-------|---------|
| Plan `trial_days` | Present on plan entity/detail |
| Create plan API exposure | Limited / not primary create DTO focus |
| Tenant TRIAL status + trial dates | SUPPORTED in domain / onboarding types PAID\|TRIAL\|DEMO |

**Trial:** PARTIAL (domain yes; UI-4 plan wizard not trial-centric)

---

## 25–28. Page Audits (Summary)

### Plan List — KEEP / MODERNIZE

Tabs (All/Draft/Published/Archived), search, filters, pagination, status counts, row actions, active tenant count. Local buttons/table; native `confirm()`.

### Plan Detail — MODERNIZE

Identity, pricing, limits, modules/features, lifecycle actions, active tenant count. Local UI system; `confirm()`.

### Create/Edit Plan — MODERNIZE (HIGH visual debt)

6-step wizard: Basics → Modules → Features → Pricing → Limits → Review & Create. Shared create/edit via `history.state`. Style budget **10.53 kB** warning. Local wizard chrome; publish modal (not shared ConfirmationDialog).

### Tenant Subscription List — N/A

---

## 29. Referential / Historical Safety

| Rule | Evidence |
|------|----------|
| Plan code unique | `uq_subscription_plans_plan_code` |
| Edit after publish | Backend rejects non-draft updates |
| Archive in-use plans | Allowed; copy warns not available for **new** assignments |
| Delete | Draft only |
| Tenant commercial snapshot | `plan_price` + `currency_code` snapshotted on create/ChangePlan |
| Live plan FK | Remains; features/limits largely live unless overridden |

**Plan Snapshot / Historical Integrity:** PARTIAL (price/currency snapshotted; features/limits mostly live)  
**Plan Subscriber Count:** SUPPORTED (`ActiveTenantCount` — counts **ACTIVE** only, not TRIAL/PAST_DUE)

---

## 30–31. API Inventories

### Plans — SUPPORTED

| Purpose | Method | Route | Permission |
|---------|--------|-------|------------|
| List | GET | `/api/v1/platform/subscription-plans` | view |
| Catalog | GET | `.../catalog` | view |
| Detail | GET | `.../{planId}` | view |
| Create draft | POST | `.../` | create |
| Update | PUT | `.../{planId}` | edit |
| Pricing/Limits/Features | PATCH | `.../{planId}/pricing|limits|features` | edit |
| Publish | POST | `.../publish` | edit |
| Duplicate | POST | `.../duplicate` | duplicate |
| Archive | POST | `.../archive` | archive |
| Reactivate | POST | `.../reactivate` | archive |
| Delete draft | DELETE | `.../{planId}` | delete |

### Tenant Subscriptions — PARTIAL / MISSING as CRUD

| Purpose | Support |
|---------|---------|
| List subscriptions | MISSING as dedicated PA list API |
| Detail | Embedded in tenant detail |
| Assign/Create | Tenant create / onboarding |
| Change plan | PUT entitlements |
| Cancel / Suspend-as-sub / Renew | MISSING |

**Plan API:** SUPPORTED  
**Tenant Subscription API:** PARTIAL  
**UI/API Contract Alignment:** PASS for plan pages; N/A for non-existent tenant-sub list

---

## 32. Search / Filter / Sort / Pagination

| Page | Search API | Filters | Sort | Pagination |
|------|------------|---------|------|------------|
| Plan List | YES (name/code ILIKE) | status, billingCycle (+ FE filters planType/currency may be weak) | Fixed UpdatedAt DESC | Server pageSize default 10 max 100 |
| Plan Detail | N/A | N/A | N/A | N/A |
| Create/Edit | N/A | N/A | N/A | N/A |

FE list query type includes `sortBy` but backend list does **not** honor client sort — ignore unsupported sort UI if present.

---

## 33–34. Request / N+1 / Projection

| Risk | Assessment |
|------|------------|
| Duplicate initial list load | LOW–MEDIUM (constructor `loadPage` + search stream) |
| N+1 on list | LOW — ActiveTenantCount computed in list query (correlated counts; watch scale) |
| List projection | PASS — name, code, price, status, feature count, active tenants, permission flags |

**Duplicate Request Risk:** LOW  
**N+1 Risk:** LOW (for UI; DB count-per-plan may need index vigilance at scale)  
**List Projection Efficiency:** PASS

---

## 35–36. Concurrency / Idempotency

| Surface | Result |
|---------|--------|
| Plan mutations | **NONE** (no ETag/version) |
| Tenant entitlements / billing | Concurrency tokens exist |
| Plan create/publish | No Idempotency-Key observed |

**Concurrency Model:** NONE (plans) / PARTIAL (platform overall)  
**Subscription Mutation Idempotency:** MISSING for plans (NOT REQUIRED for catalog MVP if UX prevents double-submit; still a gap)

---

## 37–39. Permissions / Feature Gates / Cross-Tenant

| Action | Frontend Gate | Backend Gate | Aligned? |
|--------|---------------|--------------|----------|
| View plans | subscription_plans.view | same | YES |
| Create | .create | .create | YES |
| Edit | .edit | .edit + draft-only | YES |
| Duplicate | .duplicate | .duplicate | YES |
| Archive / Reactivate | .archive | .archive | YES |
| Delete | .delete | .delete + draft | YES |
| Tenant plan change | tenants.entitlements.update | same | YES (Tenant Detail) |
| Dashboard MRR | tenant_subscriptions.view | — | Separate |

**Frontend Permission Enforcement:** PASS  
**Backend Permission Enforcement:** PASS (service-level codes; PlatformOnly policy)  
**Feature Gate:** NOT REQUIRED beyond permissions  
**Cross-Tenant Authorization:** PASS (PlatformOnly + permission checks; plan IDs opaque)

---

## 40–41. Sensitive Data / Audit Logging

**Sensitive Data Exposure:** NONE on plan DTOs (no payment secrets)

| Action | Audit Logged? |
|--------|--------------:|
| Plan CRUD/lifecycle | NO platform audit found |
| Tenant subscription_changed (entitlements) | YES |
| tenant_subscription_history | YES for plan/status changes |

**Audit Logging:** PARTIAL

---

## 42–43. Database

| Table | UI-4 Relevance |
|-------|----------------|
| `subscription_plans` | Primary |
| `subscription_plan_features` / `_limits` / `_addons` | Create/edit/detail |
| `tenant_subscriptions` | Count + historical integrity |
| `tenant_feature_entitlements` | Tenant path |
| `subscription_invoices` / payment_* | UI-5 |

**Indexes / FKs:** Plan code unique; subscription→plan Restrict; app-level “current” subscription by status set.  
**DB Index Readiness:** PARTIAL (adequate for catalog; correlated ActiveTenantCount at scale)  
**DB Change:** **NO DB CHANGE** for UI-4 Premium Blue modernization

---

## 44. Current Visual / UX Assessment

| Page | Visual | UX | SaaS Fit | Notes |
|------|-------:|---:|---------:|-------|
| Plan List | 5.5/10 | 6.0/10 | 5.5/10 | Functional; pre-UI-1 local dialect |
| Plan Detail | 5.5/10 | 6.0/10 | 5.5/10 | Same |
| Create/Edit Plan | 5.0/10 | 6.5/10 | 5.5/10 | Capable wizard; heavy local styles |
| Tenant Subscription List | N/A | N/A | N/A | Does not exist |

---

## 45–46. UI-1 / Competing Local System

| Page | PageHeader | Button | StatusBadge | Skeleton/Empty/Error |
|------|-----------:|-------:|------------:|----------------------|
| Plan List | NO | NO (local `.btn`) | Local badge classes | Local skeleton/empty/error |
| Plan Detail | NO | NO | Local | Local |
| Create/Edit | NO | NO | Local | Local empty states |

**UI-1 Primitive Reuse:** FAIL  
**Competing Local UI System:** HIGH  
Native `confirm()` on list + detail lifecycle actions — modernization debt.

---

## 47–49. Status / Loading / Empty / Error / Confirmation

| Concern | Result |
|---------|--------|
| Status presentation | PARTIAL — local badges; draft/published/archived mapping OK |
| Loading | PARTIAL — local skeletons |
| Empty | PARTIAL — CTAs present when creatable |
| Error | PARTIAL — retry on list |
| Destructive confirm | PARTIAL — `window.confirm` / native dialog; create uses `<dialog>` |

**Density:** Plan list COMFORTABLE–DENSE; Create wizard COMFORTABLE (multi-step)

---

## 50–54. Responsive & Accessibility

Playwright smoke (dev-intercept) plan list + create @ 1440/1280/1024/768: **no document overflow**.

| Viewport | Result |
|----------|--------|
| 1440 | PASS |
| 1280 | PASS |
| 1024 | PASS |
| 768 | PASS (usable; table uses overflow-x) |
| Horizontal Overflow | NONE (smoked pages) |

**Responsive Readiness:** PARTIAL (works; not Premium-compact yet)  
**Accessibility Readiness:** PARTIAL (some aria on wizard/pagination; color badges; confirm() a11y weak)

---

## 55–56. Tests

### Frontend (~71 `it` across subscription specs)

| File | Approx `it` count | Quality |
|------|------------------:|---------|
| create-subscription-plan-page.spec.ts | 36 | ADEQUATE–STRONG |
| subscription-plans-page.spec.ts | 12 | ADEQUATE |
| plan-detail-page.spec.ts | 8 | ADEQUATE |
| api.service.spec.ts | 10 | ADEQUATE |
| status.util.spec.ts | 5 | ADEQUATE |

**Frontend Test Coverage:** ADEQUATE

### Backend

| Suite | Result |
|-------|--------|
| Unit `*SubscriptionPlan*` | 18 passed |
| ApiTests `PlatformSubscriptionPlans*` | 6 passed |
| Integration/repository/limit alignment | Present |

Lifecycle invalid transitions covered in service tests (draft-only edits). Tenant cancel/renew N/A.

**Backend Test Coverage:** ADEQUATE  
**Lifecycle Transition Test Coverage:** ADEQUATE (plans)

---

## 57. Build / Test Baseline

| Check | Result |
|-------|--------|
| `npm ci` | KNOWN F-SA-UI2C-M-001 ISSUE (lockfile sync) |
| `npm run build` | PASS |
| Frontend tests | **545 passed / 0 failed / 0 skipped** |
| Angular budgets | UNCHANGED (6 kB / 12 kB) |

**Build Warnings:**

- Login ~7.65 kB  
- **Create Subscription Plan ~10.53 kB**  
- Permission Catalog ~11.71 kB  
- Plan List chunk styles ~6.59 kB (**also over warning**)

---

## 58. Style-Budget Matrix

| Component | Style Warning | Approx compiled styles |
|-----------|---------------|------------------------|
| Create Subscription Plan | WARNING | 10.53 kB |
| Subscription Plans List | WARNING | ~6.59 kB |
| Plan Detail | NONE | ~4.67 kB |

**Angular Style Budget:** UNCHANGED

---

## 59. Operator Questions

| Question | API? | UI Answers? | Gap |
|----------|-----:|------------:|-----|
| Which plans exist? | YES | YES | Visual debt |
| Available for onboarding? | YES (active) | PARTIAL | Clarity of Published |
| Cost / cycle? | YES | YES | |
| Features included? | YES | YES (detail/wizard) | |
| Safe to edit/deactivate? | YES (flags + draft-only) | PARTIAL | confirm() UX |
| How many tenants use it? | YES (ACTIVE only) | YES | TRIAL not counted |
| Which tenant is on what plan? | Via tenant APIs | Tenant Detail / list fields | No UI-4 subscription list |
| Cancel/renew subscription? | NO | NO | Correctly absent |

---

## 60. UI-4 / UI-5 Boundary Matrix

| Capability | UI-4 | UI-5 | Notes |
|------------|-----:|-----:|-------|
| Plan catalog | YES | — | |
| Tenant plan assignment | — | — | Tenant Detail / UI-3 |
| Subscription status | SUMMARY elsewhere | — | |
| Billing period terms | Plan commercial | Invoice periods | |
| Invoice / Payment / Settlement / Manual payment / Failure | — | YES | |
| Subscription suspension | — | — | Tenant suspend UI-2 |

---

## 61. API Capability Matrix

| Capability | Endpoint | FE Uses? | Ready? |
|------------|----------|---------:|-------:|
| List/Detail/Create/Update/Publish/Archive/Reactivate/Delete plans | Yes | YES | YES |
| List tenant subscriptions | — | NO | NO (not required for UI-4 catalog) |
| Change plan | entitlements PUT | Tenant Detail | YES |
| Cancel/Suspend-sub/Renew | — | NO | NO |

---

## 62. Lifecycle Matrix (Plans)

| Status | Meaning | Actions | Terminal? | UI Semantic |
|--------|---------|---------|----------:|-------------|
| draft | Editable | Edit, Publish, Delete, Duplicate | NO | Neutral/info |
| active | Published | Archive, Duplicate | NO | Success |
| retired | Archived | Reactivate, Duplicate | Soft | Neutral |

---

## 63. Mutation Safety Matrix

| Action | Idempotent? | Concurrency? | Confirmation? | Audit? |
|--------|-------------|--------------|---------------|--------|
| Create plan | NO key | NONE | Soft | NO |
| Publish | NO | NONE | confirm/dialog | NO |
| Archive/Reactivate/Delete | NO | NONE | confirm() | NO |
| Change plan (tenant) | Partial | YES version | Confirm on tenant UI | YES |

---

## 64. Permission Matrix

See §37. Codes: `platform.subscription_plans.{view,create,edit,duplicate,archive,delete}` + tenant entitlements/billing for adjacent surfaces.

---

## 65. Data Truthfulness Matrix

| UI Data | Source | Safe | Slice |
|---------|--------|-----:|-------|
| Plan name/code/status/price/cycle | Plan API | YES | UI-4 |
| Active tenant count | Count ACTIVE only | YES with caveat | UI-4 |
| Tenant subscription status | Tenant detail | YES | UI-2 |
| Invoice balance / payment status | Billing API | YES | UI-5 |
| MRR | Dashboard projection | REAL if gated | UI-2 (not UI-4) |

**Current Metrics on subscription pages:** No MRR/ARR on plan pages. Dashboard MRR uses `platform.tenant_subscriptions.view` — **BILLING-SCOPE / dashboard**, not UI-4 KPI invention.

---

## 66–69. Visual / Responsive / A11y / Test Matrices

Covered in §§44, 50–56. Overall: modernization required; contracts ready.

---

## 70. Recommended UI-4 Slice Structure

```text
UI-4A — Subscription Plans List + Detail
UI-4B — Create / Edit Plan Wizard
```

**Rationale:** Distinct page patterns (operational table/detail vs multi-step form); create page carries the largest style-budget and visual debt; list/detail share catalog lifecycle actions.

Do **not** force UI-4C tenant-subscription CRM without backend list APIs.

**Recommended UI-4 Slice Structure:** UI-4A + UI-4B

---

## 71. Recommended Page Patterns

| Page | Pattern | Why |
|------|---------|-----|
| Plan List | Premium Operational Table | Tabs, search, filters, pagination, actions |
| Plan Detail | Premium Detail Workspace | Lifecycle + commercial + feature summary |
| Create/Edit Plan | Premium Form Workspace (stepped) | Existing 6-step contract; modernize chrome, not invent stages |

---

## 72. Prototype Decisions

| Slice | Prototype? | Reason |
|-------|------------|--------|
| UI-4A List+Detail | **RECOMMENDED** | High visual debt; establishes Premium Blue catalog language |
| UI-4B Create/Edit | **RECOMMENDED** | Complex wizard; style budget risk; feature catalog density |

**HTML Visual Prototype:** RECOMMENDED FOR SELECTED SLICE (start with **UI-4A**, then UI-4B)

---

## 73. Backend / API / DB / Frontend Change Assessment

| Layer | Assessment |
|-------|------------|
| Backend | **CURRENT BACKEND SUFFICIENT WITH NON-BLOCKING GAPS** |
| API Changes | **NO** for catalog MVP (optional later: plan audit, concurrency, richer counts) |
| DB | **NO DB CHANGE** |
| Frontend | **YES** — visual modernization, UI-1 reuse, confirm→dialog, responsive/a11y, style budget, tests |

Gaps that remain non-blocking for Visual Direction:

- No plan concurrency / idempotency / platform audit logs  
- ActiveTenantCount = ACTIVE only  
- FE/BE billing-cycle alias casing nuances  
- List FE filters (planType/currency) may overclaim vs API  
- Tenant subscription CRM absent (intentional)

---

## 74. Shared Foundation Decision

**Shared Foundation First:** NO — reuse existing UI-1; do not create another design system.

---

## 75. Implementation Complexity

| Area | Complexity |
|------|------------|
| Plan List | MEDIUM |
| Plan Detail | MEDIUM |
| Create/Edit | HIGH |
| Lifecycle actions | LOW–MEDIUM |
| Responsive / A11y / Tests | MEDIUM |

**UI-4 Implementation Complexity:** MEDIUM–HIGH (overall **HIGH** driven by wizard + style budget)

---

## 76. Planning Findings

### F-SA-UI4-P-001 — Menu “Subscriptions” means Plan Catalog

| Field | Value |
|-------|-------|
| Severity | Medium (clarity) |
| Blocks VD / Impl | NO / NO |
| Recommendation | Visual Direction must title pages as Subscription Plans; avoid promising tenant-subscription CRM |
| Confidence | High |

### F-SA-UI4-P-002 — Competing local UI system + native confirm()

| Severity | Medium |
| Blocks VD | NO |
| Blocks Impl | NO (must fix during impl) |
| Confidence | High |

### F-SA-UI4-P-003 — Create Plan style budget 10.53 kB (+ list ~6.59 kB)

| Severity | Medium |
| Blocks VD | NO |
| Blocks Impl | NO (must remediate in UI-4B/A) |
| Confidence | High |

### F-SA-UI4-P-004 — Plan mutations lack concurrency + platform audit logs

| Severity | Medium |
| Blocks VD | NO |
| Blocks Impl | NO |
| Recommendation | Document; optional backend hardening later |
| Confidence | High |

### F-SA-UI4-P-005 — ActiveTenantCount excludes TRIAL/PAST_DUE

| Severity | Low |
| Blocks | NO |
| Recommendation | Truthful copy: “Active subscribers” |
| Confidence | High |

### F-SA-UI4-P-006 — No dedicated tenant subscription list/cancel/renew APIs

| Severity | Info / Boundary |
| Blocks | NO if UI-4 stays catalog-scoped |
| Recommendation | Keep out of UI-4; do not invent |
| Confidence | High |

### F-SA-UI4-P-007 — Reactivate reuses archive permission

| Severity | Low |
| Blocks | NO |
| Recommendation | Preserve existing auth; document in VD |
| Confidence | High |

### F-SA-UI4-P-008 — npm ci lockfile (F-SA-UI2C-M-001 family)

| Severity | Low |
| Blocks | NO |
| Confidence | High |

**Blocking Findings:** NONE  
**Non-Blocking Findings:** F-SA-UI4-P-001 … P-008

---

## 77. Planning Readiness Matrix

| Area | FE | BE | DB | Tests | Readiness |
|------|----|----|----|-------|-----------|
| Navigation | PARTIAL | READY | — | ADEQUATE | READY |
| Plan List | PARTIAL | READY | READY | ADEQUATE | READY |
| Plan Detail | PARTIAL | READY | READY | ADEQUATE | READY |
| Plan Create/Edit | PARTIAL | READY | READY | ADEQUATE | READY |
| Lifecycle | PARTIAL | READY | READY | ADEQUATE | READY |
| Upgrade/Downgrade | N/A UI-4 | PARTIAL (tenant) | READY | ADEQUATE | NOT REQUIRED in UI-4 |
| Cancellation/Renewal | MISSING | MISSING | PARTIAL | N/A | NOT REQUIRED |
| Entitlements | SUMMARY | READY | READY | ADEQUATE | READY (summary) |
| Permissions | READY | READY | — | ADEQUATE | READY |
| Concurrency | — | MISSING plans | — | THIN | PARTIAL |
| Audit | — | PARTIAL | — | THIN | PARTIAL |
| Responsive/A11y/UI-1 | PARTIAL | — | — | — | PARTIAL |
| Tests | ADEQUATE | ADEQUATE | — | — | READY |

---

## 78. Recommended Modernization Order

```text
UI-4A — Subscription Plans List + Detail
  (Premium Operational Table + Detail Workspace)
↓
UI-4B — Create / Edit Plan Wizard
  (Premium Form Workspace; style-budget remediation)
```

**Why:** Establish shared Premium Blue catalog patterns and lifecycle action UX first; then tackle the denser wizard without blocking list/detail delivery.

Streamlined process per slice:

```text
Visual Direction (after prototype approval)
→ Implementation
→ Independent Verification
→ Source Merge
```

Then **one consolidated UI-4 final closure** after A+B complete. Avoid micro-closure PRs per page.

---

## 79. Streamlined Closure Strategy

Per meaningful source slice: Implementation → Independent Verification → Controlled Merge.  
Single final UI-4 aggregate closure documentation cycle at end.  
UI-5 remains **NOT AUTHORIZED**.

---

## 80–81. Readiness

| Gate | Status |
|------|--------|
| Visual Direction Readiness | **READY WITH NON-BLOCKING GAPS** |
| Implementation Readiness | **READY WITH NON-BLOCKING GAPS** |
| UI-4 Implementation Authorized | **NO** (await VD approval) |
| UI-5 | **NOT AUTHORIZED** |

---

## 82. UI-5 Boundary / Authorization

UI-5 (Billing) must own invoices, payments, settlement, manual payment review. UI-4 may deep-link to billing where product needs it, but must not rebuild billing ops. **UI-5 NOT AUTHORIZED** until UI-4 closes.

---

## 83. Final Verdict

```text
SUPER ADMIN UI-4 READY WITH NON-BLOCKING GAPS — PREMIUM VISUAL DIRECTION MAY BEGIN
```

---

## 84. Required Next Action

Merge this UI-4 Planning Audit through the controlled Second Brain documentation PR process.

Then create only the **UI-4A** Premium Blue HTML visual prototype (Plan List + Plan Detail) using the verified plan lifecycle, permissions, APIs, and UI-4/UI-5 boundary.

Obtain user visual approval before creating the formal Visual Direction Specification.

Do not modify Platform Admin subscription source yet.
