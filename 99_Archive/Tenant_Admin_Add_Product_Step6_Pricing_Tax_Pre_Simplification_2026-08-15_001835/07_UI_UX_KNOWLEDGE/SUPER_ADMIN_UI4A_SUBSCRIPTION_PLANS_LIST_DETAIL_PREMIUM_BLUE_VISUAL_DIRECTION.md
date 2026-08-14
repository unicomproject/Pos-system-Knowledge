# OneVerz Super Admin — UI-4A Subscription Plans List + Plan Detail
# Premium Blue Visual Direction Specification

**Document type:** Official visual direction / implementation design contract  
**Product:** OneVerz Super Admin  
**Scope slice:** UI-4A — Subscription Plans List + Plan Detail  
**Theme:** PREMIUM BLUE (mandatory)  
**Date:** 2026-08-11  
**Status:** APPROVED for controlled implementation after documentation merge

**Authority order (implementation must follow):**

1. This Visual Direction Specification
2. Approved HTML visual prototype (layout/character reference only)
3. UI-1 shared design-system rules / tokens / primitives
4. Planning Audit — authoritative for backend contract, lifecycle, and permissions
5. Existing plan / API / business contracts

If visual concept conflicts with actual business/data contract → **business/data contract wins**. Adapt the visual pattern; do not invent fields, filters, metrics, statuses, or billing/CRM surfaces.

**Related evidence:**

| Artifact | Reference |
| --- | --- |
| Planning Audit | `15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SUPER_ADMIN_UI4_SUBSCRIPTION_MANAGEMENT_PLANNING_AUDIT_2026-08-11.md` |
| Planning commit | `4a03e3249582c17d6cef9804bc103f673c07997f` (merged via PR #77 → `9c6acdd`) |
| Approved HTML prototype | `07_UI_UX_KNOWLEDGE/prototypes/oneverz_ui4a_subscription_plans_list_detail_premium_blue_prototype.html` |
| Approved prototype commit | `7f4923ae300f23fed5e61d7ff1807c673063fe14` |
| Prototype branch | `docs/super-admin-ui4a-subscription-plans-prototype` |
| UI-1 tokens | Platform Admin `src/styles.scss` `:root` |
| Shell identity | Sidebar deep navy `#0f172a` + primary blue `#0b5cff` |

---

## 1. Purpose

Freeze the **Premium Blue production design contract** for UI-4A so implementation delivers a premium enterprise **Subscription Plan Catalog** — Plans List + Plan Detail — that is operationally clear, truthful to plan APIs, continuous with UI-1/UI-2/UI-3, and firmly bounded away from UI-4B Create/Edit and UI-5 Billing.

This document converts:

```text
UI-4 Planning Audit
+ Approved UI-4A HTML Prototype (7f4923a)
+ Explicit User Visual Approval
```

into an implementation-ready design contract.

---

## 2. Scope

### In scope (UI-4A)

| Route | Experience | Pattern |
| --- | --- | --- |
| `/admin/subscriptions` | Subscription Plans List | PREMIUM OPERATIONAL TABLE |
| `/admin/subscriptions/:planId` | Subscription Plan Detail | PREMIUM DETAIL WORKSPACE |

Conceptual components:

```text
PlatformSubscriptionPlansPage
PlatformSubscriptionPlanDetailPage
```

### Out of scope

| Area | Owner |
| --- | --- |
| Create / Edit Plan Wizard form internals | UI-4B (`/admin/subscriptions/create`) |
| Invoice / payment / settlement / recovery | UI-5 Billing |
| Tenant subscription CRM (list/cancel/renew/suspend) | Not UI-4 |
| Tenant entitlement override editor | Tenant Detail path |
| Dashboard / Tenant List / Tenant Detail / UI-3 redesign | Regression boundaries only |
| Backend APIs, DB migrations, new plan lifecycle | Forbidden for UI-4A |

### Non-goals

- Plan Type / Currency filters
- Interactive sorting UI
- MRR / ARR / revenue analytics
- Master-detail split panel
- Pricing comparison marketing page
- Shipping prototype review toolbars or sample data

---

## 3. Planning Audit Inputs

| Input | Value |
| --- | --- |
| Planning Audit | `ONEVERZ_SUPER_ADMIN_UI4_SUBSCRIPTION_MANAGEMENT_PLANNING_AUDIT_2026-08-11.md` |
| Planning verdict | `SUPER ADMIN UI-4 READY WITH NON-BLOCKING GAPS — PREMIUM VISUAL DIRECTION MAY BEGIN` |
| UI-4 definition | SUBSCRIPTION PLAN CATALOG |
| Backend readiness | CURRENT BACKEND SUFFICIENT WITH NON-BLOCKING GAPS |
| API change required | NO |
| DB change required | NO |
| Plan statuses | `draft` / `active` / `retired` |
| Search | name + code (ILIKE) |
| Filters | `status`, `billingCycle` only |
| Sort | Fixed `UpdatedAt DESC` |
| Pagination | Server; default 10; max 100 |
| Active tenant count | ACTIVE subscriptions only |
| Entitlements in UI-4 | SUMMARY ONLY |
| Trial | PARTIAL / conditional |
| Historical integrity | PARTIAL |
| UI-1 primitive reuse (baseline) | FAIL — must be corrected |
| Competing local UI system (baseline) | HIGH — must be removed |
| Findings | F-SA-UI4-P-001 … P-008 (non-blocking) |

---

## 4. Approved Prototype

| Property | Value |
| --- | --- |
| File | `07_UI_UX_KNOWLEDGE/prototypes/oneverz_ui4a_subscription_plans_list_detail_premium_blue_prototype.html` |
| Commit | `7f4923ae300f23fed5e61d7ff1807c673063fe14` (`7f4923a`) |
| Branch | `docs/super-admin-ui4a-subscription-plans-prototype` |
| Verified accessible for this VD | **YES** (`git show 7f4923a:…`) |
| Plan List Visual Quality | 9.0/10 |
| Plan List UX | 9.0/10 |
| Plan Detail Visual Quality | 9.1/10 |
| Plan Detail UX | 9.0/10 |
| Modern SaaS Fit | 9.0/10 |
| Operational Clarity | 9.2/10 |
| 1440 / 1280 / 1024 / 768 | ALL PASS |
| Horizontal page overflow | NONE |
| Accessibility direction | PASS |

---

## 5. User Visual Approval

```text
User Prototype Approval: YES
Prototype reviewed and explicitly approved by user.
Visual Direction may proceed.
Do not reopen prototype design unless a verified source/backend contract conflict appears.
```

---

## 6. UI-4 / UI-4A / UI-4B / UI-5 Boundaries

| Slice | Responsibility |
| --- | --- |
| **UI-4** | Subscription Plan Catalog |
| **UI-4A** | Plans List + Plan Detail only |
| **UI-4B** | Create/Edit Plan Wizard |
| **UI-5** | Billing (invoices, payments, settlement, recovery) |

UI-4A may expose **navigation CTAs** to Create/Edit where permissions allow.  
UI-4A must **not** specify Create/Edit form layout.

Allowed commercial metadata in UI-4A:

```text
plan price · currency · billing cycle · conditional trial days
```

Prohibited operational billing surfaces:

```text
invoices · payments · manual payment · settlements · outstanding balances · payment recovery
```

---

## 7. Product Identity

```text
Product: OneVerz Super Admin
Theme: PREMIUM BLUE
Character: Premium · Modern · Attractive · Enterprise · Operational · Calm · Confident · Clean · High-clarity
```

Must visually belong to the modernized Super Admin family (UI-1/UI-2/UI-3).  
Do not introduce a subscription-only competing visual language.

Page identity must communicate **Subscription Plans** (plan catalog), not tenant-subscription CRM (F-SA-UI4-P-001).

---

## 8. Approved Page Patterns

| Page | Pattern | Forbidden conversions |
| --- | --- | --- |
| Plans List | **PREMIUM OPERATIONAL TABLE** | dashboard, card catalog, pricing comparison, master-detail split |
| Plan Detail | **PREMIUM DETAIL WORKSPACE** | billing workspace, marketing hero, nested card overload |

---

## 9. Global Shell Continuity

Reuse existing modernized Super Admin shell:

```text
dark sidebar · top header · neutral application canvas · OneVerz blue identity
```

Do **not** redesign sidebar, header, or global navigation architecture.  
Keep existing Subscription nav entry.  
Do **not** add Billing navigation under UI-4 scope.

---

## 10. Plans List Composition

```text
Existing Super Admin Shell
↓ Shared PageHeader
↓ Compact Premium Blue Catalog Context
↓ Supported Search + Filters (+ Reset when active)
↓ Premium Operational Table
↓ Server Pagination
```

Avoid KPI dashboard cards. No invented MRR/ARR/churn/conversion metrics.

---

## 11. Plans List PageHeader

| Element | Contract |
| --- | --- |
| Title (H1) | `Subscription Plans` |
| Supporting copy | Concise operator task (e.g. manage plans available across the OneVerz platform) |
| Primary CTA | `Create Plan` → `/admin/subscriptions/create` when `platform.subscription_plans.create` permits |
| Primitive | Shared `PageHeader` |

---

## 12. Catalog Context Surface

Compact Premium Blue catalog context band.

**Purpose:** visual hierarchy + catalog purpose / active filter context / short operational guidance.

**Must not become:** fake analytics dashboard.

**Prohibited invented metrics:** ARR, MRR, revenue growth, churn, conversion, average revenue.

When filters/search are active, band copy may reflect “showing matching plans” without fabricating totals beyond API-supported pagination totals.

---

## 13. Search

| Rule | Value |
| --- | --- |
| Supported | YES |
| Scope | Plan **name** + Plan **code** only |
| Placeholder | `Search by plan name or code` |
| Accessible name | Required (placeholder alone insufficient) |
| Not implied | tenants, invoices, payments, features, entitlements |

Debounce/request timing: follow audited architecture; avoid request storms; do not invent arbitrary timing in this VD.

---

## 14. Supported Filters

Production filter bar **must** include only:

| Filter | API param | Values |
| --- | --- | --- |
| Status | `status` | `draft` / `active` / `retired` (display Draft / Active / Retired) |
| Billing Cycle | `billingCycle` | `monthly` / `yearly` / `one_time` (and existing FE alias normalization if already present) |

Include compact **Reset** when search/filters are active. Do not overemphasize Reset.

---

## 15. Unsupported Filters

| Filter | Rule |
| --- | --- |
| Plan Type | **PROHIBITED** |
| Currency | **PROHIBITED** |

Do not ship overclaim filters found in planning (F-SA-UI4 planning note). Backend contract change required before either may appear.

---

## 16. Fixed Sorting Contract

```text
Server order: UpdatedAt DESC
Interactive sorting: PROHIBITED
```

No column sort arrows, Sort By control, Newest/Oldest picker, price sort, or name sort.

---

## 17. Pagination

| Rule | Value |
| --- | --- |
| Mode | Server-side |
| Default page size | 10 |
| Maximum page size | 100 |
| UI | Compact enterprise pagination |
| Forbidden | Infinite scroll; client-only pagination over partial server data |

Show previous/next, current page, and total/page context from API (`pageNumber`, `pageSize`, `totalCount`, `totalPages`).

---

## 18. Table Structure

Comfortable-compact operational table using verified list DTO fields.

**Approved production columns (conceptual):**

| Column | Source fields | Notes |
| --- | --- | --- |
| Plan | `name` / `planName`, secondary `planCode` | Strongest identity cell |
| Commercial term | `basePrice` + `baseCurrency` | Catalog pricing only |
| Billing cycle | `billingCycle` | |
| Active tenants | `activeTenantCount` | ACTIVE-only semantics |
| Status | `status` | Draft / Active / Retired |
| Updated | `updatedAt` | |
| Action | View | Primary navigation |

Optional supporting metadata (e.g. feature count) only if already present and useful without clutter. Do not invent columns.

Use shared `.data-table` / table-card patterns.

---

## 19. Plan Identity

Hierarchy:

```text
Plan Name (primary)
↓
Plan Code (secondary)
```

Plan GUID must **not** be primary visual identity.

---

## 20. Commercial Terms

Display actual:

```text
price · currency · billing cycle
```

Format elegantly as catalog commercial terms.  
Do **not** imply payment status, invoice balance, or collection state.

---

## 21. Currency

```text
Render actual API currency per plan record.
Do NOT hardcode LKR for every plan.
Prototype currencies are demonstration-only.
```

Platform default currency may be LKR in domain constants; UI still renders the record’s `baseCurrency`.

---

## 22. Active Tenant Count

| Rule | Value |
| --- | --- |
| Supported | YES (`activeTenantCount`) |
| Semantics | Counts **ACTIVE** tenant subscriptions only |
| Preferred label | `Active tenants` |
| Forbidden labels | Total subscribers / Total customers / All tenants (if implying all statuses) |
| Clarifying copy (detail) | Trial and past-due are not included |

(F-SA-UI4-P-005)

---

## 23. Plan Lifecycle

Canonical API / domain statuses:

```text
draft → active → retired
```

| API value | Approved display label |
| --- | --- |
| `draft` | Draft |
| `active` | Active |
| `retired` | Retired |

**Modernization note:** Legacy UI labels `Published` / `Archived` map to Active / Retired. Production UI-4A should adopt approved prototype labels **Draft / Active / Retired** while preserving API values and filter mappings (`published`→`active`, `archived`→`retired` where legacy aliases remain).

Do not invent INACTIVE / PAUSED / CANCELLED plan statuses.

---

## 24. Draft State

| Aspect | Contract |
| --- | --- |
| Meaning | Editable unpublished catalog plan; not available for normal new assignment until published |
| Visual | Neutral / subdued StatusBadge |
| List | Show Draft badge; View navigates to detail |
| Detail | Identity surface draft tone; safe draft actions only |

Do not invent unverified claims beyond domain semantics.

---

## 25. Active State

| Aspect | Contract |
| --- | --- |
| Meaning | Published / assignable for new tenant assignments |
| Visual | Clear positive operational StatusBadge — not full-row green |
| Detail | Show commercial terms + active tenant usage context |

Do not imply invoice/payment health.

---

## 26. Retired State

| Aspect | Contract |
| --- | --- |
| Meaning | Soft-terminal: not offered for **new** assignments; not deleted |
| Visual | Muted terminal StatusBadge |
| Safety | Do not imply existing tenant relationships were removed |

Archive/retire of in-use plans is allowed by backend; copy must warn about new assignments only.

---

## 27. Row Actions

| Rule | Value |
| --- | --- |
| Primary list action | `View` (accessible text) → `/admin/subscriptions/:planId` |
| Crowded icon columns | Avoid |
| False chevrons / expandable rows | Prohibited |
| Lifecycle mutations on list | Prefer detail workspace; if retained, must be permission-gated and ConfirmationDialog-backed — not native `confirm()` |

Approved prototype direction: **View** as the strong list affordance; lifecycle concentrated on detail.

---

## 28. List Navigation

```text
Plan List → /admin/subscriptions/:planId
NO permanent right-side master/detail panel
```

---

## 29. List Loading

Shared `LoadingSkeleton` with table-oriented composition.  
No giant centered spinner as primary loading language.

---

## 30. List Empty

```text
No subscription plans yet
```

Primary recovery: `Create Plan` when authorized.

---

## 31. Filtered Empty

Distinct copy:

```text
No plans match your current search or filters.
```

Primary recovery: Reset/Clear filters.  
Do **not** make Create Plan the primary recovery for filtered empty.

---

## 32. List Error

Shared `ErrorState` (or established equivalent):

```text
Unable to load subscription plans
```

with supported Try Again / retry. No raw exception text.

---

## 33. Plan Detail Composition

```text
Existing Super Admin Shell
↓ Breadcrumb
↓ Shared PageHeader
↓ Premium Plan Identity / Status Surface
↓ Commercial Terms + Usage Context
↓ Feature / Entitlement Summary (read-only)
↓ Lifecycle / Metadata
↓ Contextual Actions
```

Prefer a single coherent workspace. Tabs only if content volume truly requires a clear responsibility split — default: **no tabs for sophistication**.

---

## 34. Breadcrumb

```text
Subscription Plans / <Plan Name>
```

Use existing Super Admin breadcrumb conventions. No unnecessary nested hierarchy.

---

## 35. Plan Detail PageHeader

Prioritize:

```text
Plan Name · Plan Code · Status · context actions
```

Never use GUID as H1.

---

## 36. Premium Plan Identity Surface

Strong but controlled Premium Blue identity surface (page-local composition allowed).

Show supported context such as:

```text
plan name · plan code · lifecycle status · commercial term · last updated
```

Must feel premium without becoming a public marketing pricing hero.

Tone variants: draft / active / retired (aligned with StatusBadge semantics).

---

## 37. Commercial Summary

Read-only summary of:

```text
price · currency · billing cycle · conditional trial
```

No invoice/payment operations.

---

## 38. Trial

| Rule | Value |
| --- | --- |
| Support | PARTIAL (`trialDays` on detail) |
| Layout | Secondary / conditional |
| Show when | Meaningful value available (e.g. `trialDays > 0`) |
| Mandatory block | NO |

Do not elevate Trial to a major plan property if incomplete/zero.

---

## 39. Entitlement Summary

```text
READ-ONLY feature / module / limits summary from plan detail DTO
```

May show feature groups, included capabilities, and limits summary.  
**No entitlement editor** in UI-4A.

---

## 40. Tenant Override Boundary

```text
Tenant-specific override UI: PROHIBITED in UI-4A
```

Overrides remain on tenant entitlements path. No “Override for tenant” CTA.

---

## 41. Usage Context

Where provided, show:

```text
Active tenants using this plan
```

as operational context with ACTIVE-only clarification.  
No charts, graphs, or analytics dashboards.

---

## 42. Detail Actions

Use only backend-supported lifecycle actions, gated by DTO flags **and** permissions.

| User-facing action | Backend | Permission | Notes |
| --- | --- | --- | --- |
| Edit Plan | Navigates UI-4B edit mode | `platform.subscription_plans.edit` + `canEdit` | Draft only in practice |
| Publish | POST `.../publish` | `.edit` + draft | Confirmed |
| Duplicate | POST `.../duplicate` | `.duplicate` + `canDuplicate` | Creates new draft |
| Retire | POST `.../archive` | `.archive` + `canArchive` | Approved prototype label for Archive |
| Reactivate | POST `.../reactivate` | `.archive` + `canReactivate` | Reuses archive permission (F-SA-UI4-P-007) |
| Delete | DELETE `.../{id}` | `.delete` + draft + `canDelete` | Hard delete draft only |

**Prohibited invented actions:** Pause, Cancel Plan, Renew, Billing actions, tenant subscription CRM actions.

Action hierarchy:

```text
Primary — most common safe action for current status
Secondary — less frequent safe action
Destructive / terminal — clearly separated (Delete draft; Retire)
```

---

## 43. Draft Detail

| Element | Direction |
| --- | --- |
| Status | Draft |
| Guidance | Not yet available for normal tenant onboarding/assignment until published |
| Primary | Publish (when permitted) |
| Secondary | Edit Plan |
| Other | Duplicate; Delete (destructive, confirmed) |

---

## 44. Active Detail

| Element | Direction |
| --- | --- |
| Status | Active |
| Context | Available / in operational use; show Active tenants |
| Primary | safe secondary ops (e.g. Duplicate) |
| Lifecycle | Retire (confirmed) |
| Absent | Edit in-place (non-draft updates rejected by backend) |

---

## 45. Retired Detail

| Element | Direction |
| --- | --- |
| Status | Retired |
| Tone | Calm terminal |
| Primary lifecycle | Reactivate (when permitted) |
| Secondary | Duplicate |
| Copy | Not available for new assignments; existing relationships not deleted by retirement |

---

## 46. Historical / Referential Safety

Planning: **PARTIAL** snapshot integrity.

| Concern | Truth |
| --- | --- |
| Price / currency | Stronger snapshot semantics on tenant subscription |
| Features / limits | May remain more live via plan FK unless overridden |
| Forbidden copy | “Changes to this plan never affect existing tenants” |
| Retire copy | Safe: removes from **new** assignments; does not claim hard-delete of relationships |

---

## 47. Lifecycle Confirmation

Replace native `confirm()` with shared `ConfirmationDialog` (F-SA-UI4-P-002).

Required confirmations (production intent):

| Action | Confirmed consequence (source-aligned) |
| --- | --- |
| Publish | Plan becomes Active / available for assignment |
| Retire (Archive) | No longer available for **new** assignments; existing relationships not deleted by this action |
| Reactivate | Plan becomes Active again |
| Duplicate | Creates a new draft |
| Delete draft | Permanent deletion of draft; cannot be undone |

No UI-4A-only custom modal design system.

---

## 48. Detail Loading

Structured `LoadingSkeleton` matching detail composition (identity → commercial → features → metadata).

---

## 49. Not Found

```text
Subscription plan not found
```

Recovery: `Back to Plans` → `/admin/subscriptions`.  
Do not disclose internal lookup/security details.

---

## 50. Detail Error

```text
Unable to load this subscription plan
```

Safe retry / back navigation. No raw backend exceptions.

---

## 51. UI-1 Primitive Reuse

Planning baseline: **FAIL**. UI-4A **must materially correct** this.

Required reuse where applicable:

```text
PageHeader · Button · StatusBadge · LoadingSkeleton · EmptyState · ErrorState
ConfirmationDialog · FilterBar / shared form controls · shared table patterns
design tokens · typography · spacing · focus treatment
```

---

## 52. Competing Local UI System Removal

Planning baseline: **HIGH**.

```text
Competing Local UI System: MUST BE REMOVED
```

Do not locally recreate buttons, badges, table system, filter fields, loading, error, focus, or typography.

Page-local CSS may own only genuine composition:

```text
catalog context surface
plan identity surface
commercial summary layout
entitlement summary layout
```

---

## 53. Premium Blue System

Use OneVerz Blue selectively for:

```text
primary CTA · catalog context band · detail identity surface
focus · active filter state · links · important operational emphasis
```

Do not paint every surface blue.

---

## 54. Semantic Colors

| Status / state | Semantic |
| --- | --- |
| Draft | Neutral / subdued |
| Active | Positive operational |
| Retired | Muted / terminal |
| Error | Error semantic |

OneVerz Blue remains product identity. Color alone never communicates status.

---

## 55. Surface Hierarchy

### List

```text
L0 Application canvas
L1 PageHeader
L2 Premium Blue catalog context
L3 Search / filter controls
L4 Operational table
L5 Pagination / states
```

### Detail

```text
L0 Application canvas
L1 Breadcrumb / PageHeader
L2 Premium plan identity / status
L3 Commercial + usage context
L4 Entitlement / features summary
L5 Metadata / secondary detail
```

Avoid card-inside-card-inside-card.

---

## 56. Typography

Hierarchy (UI-1 tokens):

```text
H1 page title
Plan name
Plan code
Price / commercial value
Status
Section heading
Primary data
Labels
Secondary metadata
```

Do not bold every text node.

---

## 57. Density

| Surface | Target |
| --- | --- |
| Plan List | COMFORTABLE-COMPACT |
| Plan Detail | COMFORTABLE |

---

## 58. Iconography

Professional icon set only (no emoji / Unicode hacks) for:

```text
plan · billing cycle · features · active tenants · status · edit · publish · retire · reactivate · duplicate · delete
```

---

## 59. Micro-Interactions

Allowed:

```text
row hover · button hover · focus-visible · filter active state · subtle surface transition
```

No decorative / excessive animation.

---

## 60. Responsive 1440

| Area | Expectation |
| --- | --- |
| List | Full table; comfortable search/filter row; balanced PageHeader |
| Detail | Premium identity; multi-column summary where useful; clear actions |

---

## 61. Responsive 1280

Preserve hierarchy with tighter spacing. No redesign solely for width drop.

---

## 62. Responsive 1024

| Area | Expectation |
| --- | --- |
| List | Filters may wrap; table readable; actions accessible |
| Detail | Summary columns may reduce; metadata not cramped |

---

## 63. Responsive 768

| Area | Expectation |
| --- | --- |
| List | Controlled local table horizontal scroll if needed; do not auto-convert every row into oversized cards |
| Detail | Stack identity / commercial / entitlements / actions cleanly |
| Page overflow | NONE |

---

## 64. Horizontal Overflow

Production target:

```text
1440: NONE
1280: NONE
1024: NONE
768: NONE (page-level)
```

Local table overflow at 768 allowed only if contained and accessibly labeled.

---

## 65. List Accessibility

Require:

```text
single H1 · semantic table · column headers · search label · filter labels
status text · keyboard-operable actions · focus-visible · pagination labels
```

---

## 66. Detail Accessibility

Require:

```text
semantic section headings · readable key/value structures · status text
action labels · feature list semantics · focus-visible · confirmation semantics
```

---

## 67. Status Accessibility

Visible text required:

```text
Draft · Active · Retired
```

Color is secondary.

---

## 68. Search / Filter Accessibility

| Control | Requirement |
| --- | --- |
| Search | Real accessible name (not placeholder-only) |
| Status | Label + current selection + keyboard |
| Billing Cycle | Label + current selection + keyboard |

---

## 69. Table / Pagination Accessibility

| Concern | Requirement |
| --- | --- |
| View action | Textured text (avoid ambiguous icon-only) |
| Pagination | Previous / Next / page context / disabled semantics |

---

## 70. Prototype → Production Mapping

| Prototype Element | Production Decision |
| --- | --- |
| Plans List | APPROVED |
| Plan Detail | APPROVED |
| Review toolbar | PROTOTYPE ONLY |
| Width switcher | PROTOTYPE ONLY |
| State switcher | PROTOTYPE ONLY |
| Premium Blue context band | APPROVED |
| Search | APPROVED — NAME/CODE |
| Status filter | APPROVED |
| Billing Cycle filter | APPROVED |
| Plan Type filter | REJECTED |
| Currency filter | REJECTED |
| Sort UI | REJECTED |
| Server pagination | APPROVED |
| Active tenant count | APPROVED WITH ACTIVE-ONLY SEMANTICS |
| Plan status Draft/Active/Retired | APPROVED |
| Entitlement summary | APPROVED READ-ONLY |
| Tenant override UI | REJECTED |
| Billing operations | REJECTED / UI-5 |
| Create/Edit form | UI-4B |
| Prototype sample data | PROTOTYPE ONLY |
| Retire label for Archive | APPROVED (API remains archive) |
| Publish / Duplicate / Delete | APPROVED where backend supports |

---

## 71. Data Truthfulness Matrix

| UI Element | Backend Source | Required? | Render Rule |
| --- | --- | ---: | --- |
| Plan name | List/Detail `name` → `planName` | YES | Primary identity |
| Plan code | `planCode` | YES | Secondary identity |
| Status | `status` (`draft`/`active`/`retired`) | YES | Draft/Active/Retired + StatusBadge |
| Price | `basePrice` | YES (list/detail) | Format with currency |
| Currency | `baseCurrency` | YES | Actual API value |
| Billing cycle | `billingCycle` | YES | monthly/yearly/one_time display |
| Active tenant count | `activeTenantCount` | YES | Label Active tenants; ACTIVE-only |
| Trial | Detail `trialDays` | CONDITIONAL | Show only when meaningful |
| Features / modules | Detail `modules`/`features` | YES (detail) | Read-only summary |
| Limits | Detail limits / maxOutlets/Users/Tills | YES (detail) | Read-only summary |
| Updated at | `updatedAt` | YES | Locale-aware datetime |
| Created at | Detail `createdAt` | OPTIONAL | Metadata |
| Permission flags | `canEdit`/`canDuplicate`/`canArchive`/`canDelete`/`canReactivate` | YES (actions) | Gate UI with flags + permissions |
| Description | `description` | OPTIONAL | Detail supporting copy |

---

## 72. List Capability Matrix

| Capability | Supported | Production UI |
| --- | ---: | --- |
| Search name | YES | SHOWN |
| Search code | YES | SHOWN (same control) |
| Status filter | YES | SHOWN |
| Billing cycle filter | YES | SHOWN |
| Plan Type filter | NO | HIDDEN |
| Currency filter | NO | HIDDEN |
| Interactive sort | NO | HIDDEN |
| Pagination | YES | SHOWN (server) |
| Active tenant count | YES | SHOWN (ACTIVE-only label) |
| Create Plan CTA | YES | Permission-aware |
| View → Detail | YES | Primary row action |

---

## 73. Plan Lifecycle Matrix

| Status | Meaning | Visual Semantic | Allowed Actions |
| --- | --- | --- | --- |
| DRAFT (`draft`) | Editable unpublished | Neutral / subdued | Edit, Publish, Duplicate, Delete |
| ACTIVE (`active`) | Assignable / published | Positive operational | Duplicate, Retire (Archive) |
| RETIRED (`retired`) | Not for new assignment | Muted terminal | Duplicate, Reactivate |

---

## 74. Plan Detail Action Matrix

| Plan Status | Primary | Secondary | Lifecycle / Destructive | Prohibited |
| --- | --- | --- | --- | --- |
| Draft | Publish | Edit Plan · Duplicate | Delete draft (confirmed) | Billing ops · tenant CRM · Pause |
| Active | Duplicate (or View context) | — | Retire (confirmed) | Edit non-draft · Delete · billing |
| Retired | Reactivate | Duplicate | — | Edit · Delete · billing · claim hard-delete |

All actions require matching DTO capability flags + permission codes.

---

## 75. UI-4 / UI-4B / UI-5 Boundary Matrix

| Capability | UI-4A | UI-4B | UI-5 |
| --- | ---: | ---: | ---: |
| Plan list | YES | — | — |
| Plan detail | YES | — | — |
| Create plan form | — | YES | — |
| Edit plan form | — | YES | — |
| Plan price | YES | YES | — |
| Billing cycle | YES | YES | — |
| Invoice | — | — | YES |
| Payment | — | — | YES |
| Settlement | — | — | YES |
| Billing recovery | — | — | YES |
| Tenant subscription CRM | NO | NO | NO (not this program slice) |

---

## 76. Responsive Matrix

| Area | 1440 | 1280 | 1024 | 768 |
| --- | --- | --- | --- | --- |
| PageHeader | Full balanced | Tighter | Wrap actions OK | Stack title/actions |
| Context band | Full | Full | Compact | Stacked |
| Search/filter | Single row preferred | Single/tight | Wrap OK | Stacked controls |
| Table | Full columns | Full | Readable | Local scroll OK |
| Pagination | Compact footer | Compact | Compact | Compact stacked |
| Detail identity | Multi-meta | Multi-meta | Reduce columns | Stack |
| Commercial summary | Multi-column | Multi-column | 2-col/stack | Stack |
| Entitlements | Grouped grid | Grouped | Stack groups | Stack |
| Actions | Horizontal hierarchy | Horizontal | Wrap | Stack |

---

## 77. Accessibility Matrix

| Concern | Requirement |
| --- | --- |
| H1 | Single page H1: Subscription Plans / Plan Name |
| Search | Accessible name + keyboard |
| Filters | Labels + selection + keyboard |
| Table | Semantic table + headers |
| Status | Text + semantic badge (not color-only) |
| Pagination | Named controls + disabled state |
| Breadcrumb | Navigable / semantic |
| Plan detail sections | Landmark/heading structure |
| Lifecycle actions | Clear labels + confirm dialog semantics |
| Confirmation | Shared ConfirmationDialog a11y |
| Focus | Visible focus-visible throughout |

---

## 78. UI-1 Mapping Matrix

| Need | Shared Primitive | Rule |
| --- | --- | --- |
| Page title | PageHeader | REUSE |
| CTA/actions | Button | REUSE |
| Status | StatusBadge | REUSE |
| Search/filter shell | FilterBar / shared form control | REUSE |
| Table | shared table pattern | REUSE |
| Loading | LoadingSkeleton | REUSE |
| Empty | EmptyState | REUSE |
| Error | ErrorState | REUSE |
| Confirmation | ConfirmationDialog | REUSE |
| Detail identity surface | page-local | ALLOWED |
| Catalog context band | page-local | ALLOWED |
| Commercial summary | page-local composition | ALLOWED |
| Entitlement summary layout | page-local composition | ALLOWED |

---

## 79. Permission Matrix

Exact codes (do not rename/invent):

| Action | Permission code | Notes |
| --- | --- | --- |
| View plan list / detail | `platform.subscription_plans.view` | |
| Create plan | `platform.subscription_plans.create` | Create CTA → UI-4B |
| Edit plan | `platform.subscription_plans.edit` | Draft update + Publish |
| Duplicate | `platform.subscription_plans.duplicate` | |
| Retire / Reactivate | `platform.subscription_plans.archive` | Reactivate reuses archive (F-SA-UI4-P-007) |
| Delete draft | `platform.subscription_plans.delete` | Draft only |

Backend remains authoritative. Hide/disable actions per Super Admin conventions + DTO flags.

Cross-tenant authorization: PASS (preserve).  
Sensitive data exposure: NONE (do not add internals).

---

## 80. Style-Budget Strategy

| Item | Value |
| --- | --- |
| Warning threshold | 6 kB |
| Error threshold | 12 kB |
| Angular budget change | **NONE** — do not raise |
| Plan List historical warning | ~6.59 kB (planning baseline) |
| Plan Detail historical | ~4.67 kB (no warning) |
| Create Plan warning | ~10.53 kB — **UI-4B only; do not touch in UI-4A** |

UI-4A targets:

```text
Plan List warning: NONE (if reasonably achievable)
Plan Detail warning: NONE
```

via UI-1 reuse, tokens, removal of local duplication, legitimate page-local composition.

**No budget evasion:** do not move Plan List-specific CSS into `styles.scss`, global shell, or unrelated shared components solely to escape budget.

---

## 81. Frontend Test Requirements

Planning coverage: ADEQUATE baseline — UI-4A must strengthen modernization-specific tests.

### Plan List tests

```text
route render · initial load
search name/code
status filter · billing cycle filter
no Plan Type filter · no Currency filter · no sort controls
pagination
loading · empty · filtered empty · error
Draft / Active / Retired badges
active-only tenant count label
View navigation
Create Plan permission visibility
```

### Plan Detail tests

```text
route/detail load
Draft · Active · Retired
commercial term rendering
active tenant count semantics
entitlement summary read-only
Not Found · Error
Edit action (draft + permission)
supported lifecycle actions present
unsupported lifecycle / billing / override UI absent
ConfirmationDialog where required
Back to Plans
```

---

## 82. Request Safety

Implementation must not introduce:

```text
duplicate initial list request
duplicate search request
duplicate filter request
N+1 plan detail calls
duplicate lifecycle mutation
```

Use interaction guards (disable pending actions) because backend plan idempotency is MISSING.

Do not invent debounce timing beyond existing architecture needs.

---

## 83. Concurrency / Idempotency Constraints

| Concern | Planning | UI-4A rule |
| --- | --- | --- |
| Concurrency model for plans | NONE | Do not invent ETag/version UI |
| Mutation idempotency | MISSING | Frontend double-submit guards only; do not claim backend idempotency |
| Audit logging | PARTIAL | Do not add audit UI features; carry gap |

---

## 84. Backend / API / DB Preservation

| Layer | Rule |
| --- | --- |
| Backend changes required | **NO** |
| API changes required | **NO** |
| DB changes required | **NO** |
| Frontend changes required | **YES** |
| Search/filter/pagination | Preserve real server behavior |
| Fixed sort | Preserve UpdatedAt DESC honesty |

---

## 85. Planning Findings Carry-Forward

| Finding | Visual Direction Impact | Implementation Impact | Backend Future Debt | UI-5 Relevance | Carry Forward |
| --- | --- | --- | --- | ---: | --- |
| F-SA-UI4-P-001 Menu means Plan Catalog | Title/copy as Subscription Plans | Catalog-only UX | — | NO | YES — addressed by VD naming |
| F-SA-UI4-P-002 Local UI + native confirm | Must remove / use ConfirmationDialog | REQUIRED fix | — | NO | YES — close on verified impl |
| F-SA-UI4-P-003 Style budgets | List cleanup in UI-4A; Create in UI-4B | UI-4A list; UI-4B wizard | — | NO | YES |
| F-SA-UI4-P-004 No concurrency/audit | Document only | Guards only | YES optional later | NO | YES |
| F-SA-UI4-P-005 ActiveTenantCount ACTIVE-only | Label semantics | Truthful copy | Optional richer counts later | NO | YES — closed by truthful label when shipped |
| F-SA-UI4-P-006 No tenant-sub CRM APIs | Keep out of UI-4A | Do not invent | If product later wants CRM | Adjacent | YES |
| F-SA-UI4-P-007 Reactivate uses archive perm | Document auth | Preserve | Optional dedicated perm later | NO | YES |
| F-SA-UI4-P-008 npm ci lockfile family | None | CI hygiene | — | NO | YES |

Only close a finding when new verified evidence resolves it.

---

## 86. Controlled Implementation Scope

Future UI-4A implementation includes:

```text
Plans List modernization
Plan Detail modernization
UI-1 primitive reuse
Premium Blue hierarchy
supported search + filters
fixed-sort honesty
server pagination
status semantics (Draft/Active/Retired)
active tenant-count semantics
list + detail states
real lifecycle actions + ConfirmationDialog
responsive 1440/1280/1024/768
accessibility
UI-4A-focused tests
style budget cleanup for UI-4A components
```

---

## 87. Explicit Out-of-Scope

```text
Create Plan form redesign
Edit Plan form redesign
UI-4B wizard
tenant subscription CRM
tenant plan-change workflow
renewal / cancellation / subscription suspension
tenant entitlement overrides
invoice / payment / settlement / manual payment
UI-5
new search fields
Plan Type filter
Currency filter
interactive sorting
analytics charts
MRR/ARR
DB migration
new API
new plan lifecycle states
prototype review controls
prototype sample data
```

---

## 88. Must-Look-Like Contract

Production UI-4A must feel like:

```text
premium enterprise subscription catalog
modern OneVerz SaaS administration
clear operational plan management
high-confidence plan detail workspace
```

---

## 89. Must-Not-Look-Like Contract

Reject implementation if it looks like:

```text
plain CRUD table
Bootstrap admin
consumer pricing page
billing dashboard
card grid catalog
generic Angular demo
box-inside-box layout
```

---

## 90. Quality Acceptance Criteria

Production targets:

```text
Plan List Visual Quality >= 8.5/10
Plan List UX >= 8.5/10
Plan Detail Visual Quality >= 8.5/10
Plan Detail UX >= 8.5/10
Modern SaaS Fit >= 8.5/10
Operational Clarity >= 9/10
```

Preserve approved prototype quality (~9/10).

---

## 91. Regression Boundaries

Do **not** regress:

```text
Dashboard
Tenant List
Tenant Detail
UI-3A / UI-3B / UI-3C
Global Super Admin shell
existing Subscription routes (including create route existence)
```

---

## 92. UI-4B Boundary

After UI-4A is fully verified/merged:

```text
UI-4B Create/Edit Plan
```

receives its **own** prototype → visual direction → implementation cycle.

Do not absorb UI-4B into UI-4A to finish faster.  
Do not modify Create Plan style debt during UI-4A.

---

## 93. UI-4 Closure Strategy

After both:

```text
UI-4A CLOSED
UI-4B CLOSED
```

perform **one consolidated UI-4 closure**.  
Do not create multiple unnecessary closure cycles.

---

## 94. Implementation Acceptance Criteria

Future UI-4A implementation must satisfy at minimum:

```text
Premium Blue visual direction preserved
Plans List = Premium Operational Table
Plan Detail = Premium Detail Workspace
Shared PageHeader used
Create Plan CTA permission-aware
Search restricted to name/code
Status + Billing Cycle filters supported
Plan Type / Currency filters absent
Interactive sort absent
Fixed UpdatedAt DESC semantics preserved
Server pagination preserved
Active tenant-count semantics truthful
DRAFT / ACTIVE / RETIRED only (display Draft/Active/Retired)
StatusBadge/shared semantics used
No false row expansion
List → Detail route works
Commercial terms truthful
Trial conditional only
Entitlements summary read-only
Tenant override UI absent
Billing operations absent
Tenant subscription CRM absent
Draft/Active/Retired detail truthful
Historical-integrity copy safe
Only supported lifecycle actions shown
Shared ConfirmationDialog used where needed
Loading / Empty / Filtered Empty / Error implemented
Detail Not Found / Error implemented
Prototype review controls absent
Prototype sample data absent
UI-1 reuse materially improved
Competing local UI system removed
Responsive 1440/1280/1024/768
No page-level horizontal overflow
Accessibility improved
Plan List style warning cleared if reasonably achievable
Plan Detail warning none
Angular budget unchanged
No budget evasion
Dedicated UI-4A tests improved
No duplicate requests / new N+1 pattern
No backend/API/DB change
UI-4B source untouched
UI-5 untouched
UI-3/UI-2/global-shell regressions absent
```

---

## 95. Independent Verification Criteria

Future verifier must independently prove:

```text
exact implementation commit
UI-4A scope only
Premium Blue visual compliance
Plans List + Plan Detail patterns
search name/code only
supported filters only; no fake filters/sorting
server pagination
active tenant-count truthfulness
DRAFT/ACTIVE/RETIRED semantics
list states + detail states
commercial terms + entitlement summary only
no tenant override UI
no billing operations
supported lifecycle actions only
confirmation semantics
UI-1 reuse + local UI-system removal
responsive 1440/1280/1024/768
horizontal overflow
accessibility
style budget
request duplication / N+1 risk
tests
UI-4B unchanged
UI-3/UI-2/global-shell regressions
backend/API/DB unchanged
```

---

## 96. Final Visual Direction Verdict

```text
SUPER ADMIN UI-4A PREMIUM BLUE VISUAL DIRECTION APPROVED —
READY FOR CONTROLLED IMPLEMENTATION
```

**Visual Direction blockers:** NONE

Non-blocking carried gaps (do not block implementation):

```text
Concurrency NONE (plans)
Idempotency MISSING (plans)
Audit logging PARTIAL
ActiveTenantCount ACTIVE-only (truthfully labeled)
Reactivate reuses archive permission
Create Plan style budget (UI-4B)
npm ci lockfile family
```

---

## 97. Required Next Action

```text
Merge the approved UI-4A Premium Blue Visual Direction Specification through the controlled Second Brain documentation PR process.

After the specification is integrated, implement only UI-4A Subscription Plans List + Plan Detail on a dedicated Platform Admin feature branch.

The implementation must preserve the existing plan APIs, DRAFT / ACTIVE / RETIRED lifecycle, name/code search, status and billing-cycle filters, fixed UpdatedAt DESC sorting semantics, server pagination, ACTIVE-only subscriber-count meaning, UI-4/UI-5 boundary, and UI-4A/UI-4B boundary.

It must reuse UI-1 primitives, remove the competing local UI system, implement Premium Operational Table + Premium Detail Workspace, improve loading/empty/error/accessibility/responsive behavior, clear UI-4A style-budget warnings without budget evasion, strengthen tests, and require independent verification before source merge.

Do not implement UI-4B or UI-5.
```

---

## Document Control

| Field | Value |
| --- | --- |
| Authoring branch | `docs/super-admin-ui4a-subscription-plans-visual-direction` |
| Persistent change allowed | This specification only |
| Platform Admin source changed | NO |
| Backend / API / DB changed | NO |
| Formal Visual Direction created | YES |
| UI-4A implementation authorized by this doc alone | NO — until VD PR merged/accepted |
| UI-4B / UI-5 / UI-4 aggregate closure | NOT AUTHORIZED |
