# OneVerz Super Admin — UI-4B Create/Edit Subscription Plan
# Premium Blue Visual Direction Specification

**Document type:** Official visual direction / implementation design contract  
**Product:** OneVerz Super Admin  
**Scope slice:** UI-4B — Create/Edit Subscription Plan  
**Theme:** PREMIUM BLUE (mandatory)  
**Date:** 2026-08-12  
**Status:** APPROVED WITH NON-BLOCKING GAPS — ready for controlled implementation after documentation merge

**Authority order (implementation must follow):**

1. This Visual Direction Specification
2. Approved corrected HTML visual prototype (layout/character reference only) — HEAD `978c5873aaa0d78bea073b7d20e317de3217fb75`
3. UI-1 shared design-system rules / tokens / primitives
4. Planning Audit — authoritative for backend contract, lifecycle, and permissions
5. Existing plan / API / business contracts

If visual concept conflicts with actual business/data contract → **business/data contract wins**. Adapt the visual pattern; do not invent fields, steps, routes, billing cycles, metrics, statuses, or CRM/billing surfaces.

**Related evidence:**

| Artifact | Reference |
| --- | --- |
| Planning Audit | `15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SUPER_ADMIN_UI4_SUBSCRIPTION_MANAGEMENT_PLANNING_AUDIT_2026-08-11.md` |
| UI-4A Status | **CLOSED FOR UI-4 PROGRESSION** |
| Approved corrected HTML prototype | `07_UI_UX_KNOWLEDGE/prototypes/oneverz_ui4b_create_edit_subscription_plan_premium_blue_prototype.html` |
| Approved Prototype Branch | `docs/super-admin-ui4b-create-edit-plan-prototype` |
| Approved Prototype Branch HEAD | `978c5873aaa0d78bea073b7d20e317de3217fb75` |
| Correction commit message | `docs: correct UI-4B create/edit plan prototype stepper alignment` |
| User Prototype Approval | **YES** |
| UI-1 tokens | Platform Admin `src/styles.scss` `:root` |
| Shell identity | Sidebar deep navy `#0f172a` + primary blue `#0b5cff` |
| Shared component | `PlatformCreateSubscriptionPlanPage` (Create + Edit) |
| Create route | `/admin/subscriptions/create` |

---

## 1. Purpose

Freeze the **Premium Blue production design contract** for UI-4B so implementation delivers a premium enterprise **Create/Edit Subscription Plan** stepped workspace that is operationally clear, truthful to plan APIs, continuous with UI-1/UI-2/UI-3/UI-4A, and firmly bounded away from UI-5 Billing and tenant-subscription CRM.

This document converts:

```text
UI-4 Planning Audit
+ UI-4A CLOSED FOR UI-4 PROGRESSION
+ Approved corrected UI-4B HTML Prototype (978c587)
+ Explicit User Visual Approval
```

into an implementation-ready design contract.

---

## 2. Scope

### In scope (UI-4B)

| Route | Experience | Pattern |
| --- | --- | --- |
| `/admin/subscriptions/create` | Create Subscription Plan | PREMIUM STEPPED FORM WORKSPACE |
| Same route + `history.state` | Edit Draft plan (shared component) | PREMIUM STEPPED FORM WORKSPACE |

Conceptual component:

```text
PlatformCreateSubscriptionPlanPage
```

Shared Create + Edit: **YES**.

### Out of scope

| Area | Owner |
| --- | --- |
| Plans List + Plan Detail chrome | UI-4A (closed) |
| Activate / Retire / Reactivate / Duplicate / Delete | UI-4A Plan Detail only |
| Invoice / payment / settlement / recovery | UI-5 Billing |
| Tenant subscription CRM | Not UI-4 |
| Dedicated `/edit` route | Forbidden (do not invent) |
| Active / Retired plan edit UX | Forbidden in UI-4B (BE draft-only) |
| Backend APIs, DB migrations, new plan lifecycle | Forbidden for UI-4B |
| `one_time` Create/Edit option | Prohibited in UI-4B |
| `trialDays` field | Not invented |

### Non-goals

- Feature search UI
- Unsaved-changes guard (not currently supported — do not invent unless product later requires)
- Fake MRR / analytics / subscriber metrics in side summary
- Shipping prototype review toolbar or sample catalog data
- Raising Angular style budgets

---

## 3. Planning Audit Inputs

| Input | Value |
| --- | --- |
| Planning Audit | `ONEVERZ_SUPER_ADMIN_UI4_SUBSCRIPTION_MANAGEMENT_PLANNING_AUDIT_2026-08-11.md` |
| Planning verdict | `SUPER ADMIN UI-4 READY WITH NON-BLOCKING GAPS — PREMIUM VISUAL DIRECTION MAY BEGIN` |
| UI-4 definition | SUBSCRIPTION PLAN CATALOG |
| UI-4B definition | Create / Edit Plan Wizard |
| Backend readiness | CURRENT BACKEND SUFFICIENT WITH NON-BLOCKING GAPS |
| API change required | **NO** |
| DB change required | **NO** |
| Plan statuses | `draft` / `active` / `retired` |
| Create/Edit style baseline | ~10.53 kB warning |
| Angular warn / error | 6 kB / 12 kB — **UNCHANGED** |
| Trial | PARTIAL (billing cycle only; no `trialDays`) |
| Historical integrity | PARTIAL |
| Concurrency / idempotency (plans) | NONE / MISSING |
| Audit logging (plan mutations) | PARTIAL / largely absent |
| UI-1 primitive reuse (baseline Create/Edit) | FAIL — must correct |
| Competing local UI system (baseline) | HIGH — must remove |
| Findings | F-SA-UI4-P-001 … P-008 (non-blocking) |

---

## 4. UI-4A Closure Context

| Item | Value |
| --- | --- |
| UI-4A Status | **CLOSED FOR UI-4 PROGRESSION** |
| UI-4A surfaces | Plans List + Plan Detail only |
| Implication | UI-4B may proceed on its own prototype → VD → implementation cycle |
| UI-4A lifecycle ownership | Activate / Retire / Reactivate remain on Plan Detail |
| Non-blocking UI-4A verification gap affecting UI-4B | Mapper `one_time` list/filter alias exists for List (F-SA-UI4A-V-001 thin test) — **does not authorize adding `one_time` to Create/Edit UI** |

Do not reopen UI-4A design. Do not absorb UI-4B into UI-4A.

---

## 5. Approved Corrected Prototype

| Property | Value |
| --- | --- |
| File | `07_UI_UX_KNOWLEDGE/prototypes/oneverz_ui4b_create_edit_subscription_plan_premium_blue_prototype.html` |
| Branch | `docs/super-admin-ui4b-create-edit-plan-prototype` |
| HEAD | `978c5873aaa0d78bea073b7d20e317de3217fb75` (`978c587`) |
| Correction message | `docs: correct UI-4B create/edit plan prototype stepper alignment` |
| Verified accessible for this VD | **YES** (`git show 978c587:…`) |
| User Prototype Approval | **YES** |
| Theme | PREMIUM BLUE (`#0b5cff` primary, sidebar `#0f172a`) |
| Pattern | PREMIUM STEPPED FORM WORKSPACE |
| Stepper contract | Equal-width 6-column rail; common indicator baseline; connector through centers; centered labels; no active/completed geometry shift; Modules alignment frozen |
| Side summary | APPROVED CONDITIONAL — concise live form reflection |
| Docs sync note | Corrected SHA `978c587` may still need docs PR to update `main`’s prototype file (`main` currently has pre-correction via PR #81). **This VD binds to `978c587` as the approved artifact.** |

---

## 6. User Visual Approval

```text
User Prototype Approval: YES
Corrected prototype (978c587) reviewed and explicitly approved by user.
Visual Direction may proceed.
Do not reopen prototype design unless a verified source/backend contract conflict appears.
```

---

## 7. UI-4B / UI-5 Boundaries

| Slice | Responsibility |
| --- | --- |
| **UI-4** | Subscription Plan Catalog |
| **UI-4A** | Plans List + Plan Detail (CLOSED) |
| **UI-4B** | Create/Edit Plan stepped workspace only |
| **UI-5** | Billing (invoices, payments, settlement, recovery) |

Allowed commercial fields in UI-4B:

```text
planName · planCode · description · billingCycle · baseCurrency · basePrice
modules (included | not_available) · features (included | not_available)
maxOutlets · maxTills · maxUsers · Draft status display · Publish
```

Prohibited operational billing / CRM surfaces:

```text
invoices · payments · manual payment · settlements · outstanding balances
payment recovery · tenant cancel/renew/suspend · MRR/ARR analytics
```

---

## 8. Current Create/Edit Architecture

| Concern | Current truth |
| --- | --- |
| Component | `PlatformCreateSubscriptionPlanPage` |
| Create route | `/admin/subscriptions/create` |
| Edit | Same route; `history.state { planId, mode?: 'view' \| 'edit' }` |
| State usage today | **Only `planId` used** (`mode` present in type; not driving UX) |
| Steps | Basics → Modules → Features → Pricing → Limits → Review & Create |
| Catalog | GET modules/features catalog |
| Persist features | PATCH `featureIds` (**included only**) |
| Persist pricing | PATCH `basePrice` |
| Persist limits | PATCH `maxOutlets` / `maxTills` / `maxUsers` |
| Create draft | POST create |
| Update draft basics | PUT |
| Publish | POST publish → `active`; navigate list with success message |
| Heading today | Always **Create Subscription Plan** — **REQUIRED FIX** for Edit |
| Edit hydration today | Basics/pricing/limits patched; **modules/features not hydrated** — **REQUIRED FIX** (no new API) |
| Publish confirm today | Local `<dialog>` — **must migrate to ConfirmationDialog** |
| Unsaved changes | **NOT CURRENTLY SUPPORTED** |
| Style baseline | ~10.53 kB warning |

---

## 9. Approved Page Pattern

| Page | Pattern | Forbidden conversions |
| --- | --- | --- |
| Create/Edit Plan | **PREMIUM STEPPED FORM WORKSPACE** | marketing pricing page, dashboard, card catalog, multi-wizard invention, billing workspace |

Composition order:

```text
Breadcrumb → PageHeader → Premium configuration context (optional band)
→ Six-step rail → Main form + Side summary → Sticky actions
```

---

## 10. Six-Step Workflow

Exact order (do not rename, reorder, add, or remove):

| # | Step key | Label |
| --- | --- | --- |
| 1 | `basics` | Basics |
| 2 | `modules` | Modules |
| 3 | `features` | Features |
| 4 | `pricing` | Pricing |
| 5 | `limits` | Limits |
| 6 | `review` | Review & Create |

---

## 11. Approved Stepper Geometry

**HARD CONTRACT** from corrected prototype `978c587`:

| Rule | Requirement |
| --- | --- |
| Column model | Equal-width **6-column** rail (`repeat(6, minmax(0, 1fr))`) |
| Indicator baseline | Common shared indicator size/baseline across all six steps |
| Connectors | Through indicator centers (rail-before / rail-after pattern) |
| Labels | Centered under indicators |
| Active geometry | **No size/position shift** vs idle |
| Completed geometry | **No size/position shift** vs idle (check replaces number in-place) |
| Modules alignment | **Frozen** — Modules indicator must align with other five |
| Review & Create label | May wrap **in-column**; must not break equal-width rail |
| First/last connectors | Outer stubs hidden (no dangling connector beyond rail) |

Quality target for stepper: **≥ 9.5/10** geometry fidelity to approved corrected prototype.

---

## 12. Stepper Responsive Behavior

| Viewport | Behavior |
| --- | --- |
| 1440 | Horizontal equal-width rail; full labels |
| 1280 | Horizontal equal-width rail; full labels |
| 1024 | Tighten padding/label size; keep 6-column horizontal rail; stack side summary below |
| 768 | Contained **horizontal scroll** of the step rail only; **no page-level overflow** |

Do not convert the stepper into a vertical list at 768 unless a later approved correction supersedes this VD (current approval = contained horizontal scroll).

---

## 13. Create Mode

| Concern | Contract |
| --- | --- |
| Entry | Create CTA from Plans List (permission-aware) → `/admin/subscriptions/create` |
| Heading | **Create Subscription Plan** |
| Status display | Draft (readonly) |
| Initial forms | Empty defaults; `baseCurrency` default **LKR** |
| Save Draft | Always available in footer; stays on page; toast |
| Publish | Only on Review step after confirmation |
| Outcome after publish | Navigate `/admin/subscriptions` with success message |

---

## 14. Edit Mode

| Concern | Contract |
| --- | --- |
| Entry | List/Detail Edit → same create route with `history.state.planId` |
| Backend posture | **Draft-oriented** (BE rejects non-draft updates) |
| Heading | Production **MUST** show **Edit** heading + plan identity (name/code) — current source always says Create (**REQUIRED FIX**) |
| Hydration | Basics, pricing, limits, **and modules/features** from existing detail/catalog data (**REQUIRED FIX**; no new API) |
| Route | Do **not** invent `/admin/subscriptions/:id/edit` |
| Active/Retired edit | Do **not** design in UI-4B |

`history.state.mode` may exist as `'view' | 'edit'` but is **not authoritative today**; do not invent view-only wizard mode without product approval.

---

## 15. Route / State Contract

| Item | Value |
| --- | --- |
| Create URL | `/admin/subscriptions/create` |
| Edit URL | **Same** |
| State | `{ planId?: string; mode?: 'view' \| 'edit' }` |
| Used today | `planId` only |
| Route permission (create path) | `platform.subscription_plans.create` |
| Edit entry permissions | From list/detail using existing edit gates — **do not invent** new route guards |
| Fake edit route | **PROHIBITED** |

---

## 16. Plan Lifecycle

| Status | UI-4B role |
| --- | --- |
| `draft` | Create + Edit + Save Draft + Publish |
| `active` | Not edited in UI-4B; Activate lives on UI-4A Detail |
| `retired` | Not edited in UI-4B; Retire/Reactivate live on UI-4A Detail |

Form Status field: **Draft** readonly until publish succeeds.

---

## 17. Basics

Freeze exact field names:

| Field | Required | Rules |
| --- | --- | --- |
| `planName` | YES | Required |
| `planCode` | YES | Required; UPPERCASE helper; helper copy: **Cannot be changed after publish** |
| `description` | NO | Optional; `maxLength` **500** |
| `billingCycle` | YES | Required; see Billing Cycles |
| `baseCurrency` | YES | Required; default **LKR**; hardcoded select LKR/USD/GBP/EUR |
| Status | Display | Draft readonly |

Do not invent additional Basics fields.

---

## 18. Plan Name

| Rule | Value |
| --- | --- |
| Control name | `planName` |
| Required | YES |
| Placeholder direction | Clear operational name entry |
| Validation | Required; surface inline error when touched/invalid |

---

## 19. Plan Code

| Rule | Value |
| --- | --- |
| Control name | `planCode` |
| Required | YES |
| Casing helper | UPPERCASE input normalization (preserve current behavior) |
| Helper | Unique internal reference; **Cannot be changed after publish** |
| After publish | Immutable (BE + truthful UI copy) |

---

## 20. Modules

| Concern | Contract |
| --- | --- |
| Catalog | GET platform module catalog |
| Selection values | `included` \| `not_available` only |
| Locked modules | Forced `included` (not user-toggleable) |
| Persist | Via features PATCH (`featureIds` included only) — modules are selection UX over catalog |
| Empty/error | Catalog loading / error / empty must be truthful |

---

## 21. Modules UX

| Rule | Requirement |
| --- | --- |
| Layout | Page-local module choice rows/cards allowed |
| Density | Comfortable operational list — not marketing tiles |
| Locked affordance | Clear locked/included state |
| Selection | Keyboard-accessible controls (prefer shared radio/select patterns over bespoke unmarked divs) |
| Side summary | Reflect included module count/names concisely |

---

## 22. Features

| Concern | Contract |
| --- | --- |
| Values | `included` \| `not_available` |
| Grouping | By module |
| Disable when | Parent module not `included` **or** feature locked |
| Persist | PATCH `featureIds` for **included** features only |
| Empty | If no modules included → empty guidance (“Select modules first”) |

---

## 23. Feature Grouping

Group features under their module name. Only features for included modules are interactive. Do not invent cross-module flattening that hides module ownership.

---

## 24. Feature Search Decision

| Decision | Value |
| --- | --- |
| Feature Search | **NOT REQUIRED** |
| Rationale | Catalog size manageable |
| Rule | Do **not** invent search |

---

## 25. Pricing

| Field | Required | Rules |
| --- | --- | --- |
| `basePrice` | YES | `Validators.required` + `Validators.min(0)` |
| Billing cycle echo | Readonly | From Basics |
| Currency echo | Readonly | From Basics |
| Persist | PATCH | `{ basePrice }` |

---

## 26. Billing Cycles

Create/Edit UI options **ONLY**:

| Value | Label |
| --- | --- |
| `monthly` | Monthly |
| `yearly` | Yearly |
| `custom` | Custom |
| `trial` | Trial |
| `demo` | Demo |

Do not add Plan Type. Do not invent interval editors for `custom` beyond current source.

---

## 27. One-Time Gap

| Item | Contract |
| --- | --- |
| BE / List awareness | `one_time` exists in backend/list filter mapping |
| Create/Edit UI | **PROHIBITED in UI-4B** |
| Rule | Do **not** add `one_time` option to Create/Edit |
| UI-4A note | Mapper gap/test thinness (F-SA-UI4A-V-001) is non-blocking and **does not** authorize Create UI expansion |

---

## 28. Trial

| Item | Contract |
| --- | --- |
| Trial support | **PARTIAL** |
| UI representation | `billingCycle = trial` only |
| `trialDays` | **NOT INVENTED** |
| Copy | Do not imply day-count configuration that APIs do not expose in this form |

---

## 29. Demo / Custom Semantics

| Cycle | Semantics |
| --- | --- |
| `demo` | Supported billing-cycle option; no invented demo-duration field |
| `custom` | Supported billing-cycle option; no invented custom-period builder in UI-4B |

Preserve current options; do not expand semantics without API truth.

---

## 30. Currency

| Item | Contract |
| --- | --- |
| Control | `baseCurrency` |
| Default | `LKR` |
| Options | Hardcoded select: **LKR / USD / GBP / EUR** |
| API invent | **NO** — preserve current options; do not invent currency API |
| Pricing echo | Readonly on Pricing step |

---

## 31. Pricing Validation

| Rule | Value |
| --- | --- |
| Required | `basePrice` required before publish / pricing advance rules per existing gating |
| Min | `Validators.min(0)` |
| Invalid | Inline field error + step gating |
| Echo integrity | Cycle/currency readonly must match Basics |

---

## 32. Limits

Exact fields:

| Field | Required | Validation |
| --- | --- | --- |
| `maxOutlets` | YES | `Validators.required`, `Validators.min(1)` |
| `maxTills` | YES | `Validators.required`, `Validators.min(1)` |
| `maxUsers` | YES | `Validators.required`, `Validators.min(1)` |

Do not invent additional limit keys in UI-4B.

---

## 33. Limit Validation

| Rule | Requirement |
| --- | --- |
| Min value | ≥ 1 for all three |
| Empty | Invalid |
| Publish gate | All three required before publish |
| Persist | PATCH limits payload with exact field names |

---

## 34. Review & Create

Review step shows a truthful summary of:

```text
planName · planCode · billingCycle · baseCurrency · basePrice
included modules · included features · maxOutlets · maxTills · maxUsers
status Draft (pre-publish)
```

Primary action on this step: **Publish** (after confirmation).  
Save Draft remains available in footer.

---

## 35. Publish Semantics

| Item | Contract |
| --- | --- |
| Confirm title | `Publish subscription plan?` |
| Confirm body | Plan becomes assignable; some fields cannot be edited directly after publishing |
| Sequence | Ensure pricing + limits persisted → POST publish → status `active` |
| Navigate | `/admin/subscriptions` with success message (`Subscription plan published successfully.` or equivalent existing message) |
| Dialog primitive | Migrate local dialog → **ConfirmationDialog** |
| Integrity copy | Truthful immutability / assignability — **do not** claim “never affect existing tenants” |

---

## 36. Save Draft

| Item | Contract |
| --- | --- |
| Availability | **SUPPORTED always** in sticky footer |
| Behavior | Stay on page; success toast |
| Persistence | POST create (if needed) or PUT + PATCH features/pricing/limits as applicable |
| Publish | Save Draft **does not** publish |
| Disabled while | `isSaving` / in-flight mutation |

---

## 37. Step Navigation

| Control | Behavior |
| --- | --- |
| Back | Previous step; on Basics → leave form to Plans List |
| Next | Advance when current-step gates pass; may persist draft as current source does |
| Step rail | Clickable for allowed completed/accessible steps without inventing free navigation that bypasses required validation unsafely |
| Cancel meaning | Leave form — **not** cancel subscription |

---

## 38. Validation Gating

Gate Next/Publish on real validators:

```text
Basics: planName, planCode, billingCycle, baseCurrency (+ description max 500)
Pricing: basePrice >= 0
Limits: maxOutlets/maxTills/maxUsers >= 1
Features: only included featureIds submitted
```

Do not invent soft-skip that posts invalid publish payloads.

---

## 39. Error Summary

| Surface | Requirement |
| --- | --- |
| Field errors | Inline under controls |
| Step/catalog errors | Visible error region / toast using shared patterns where applicable |
| Publish precheck | Existing explicit messages for missing basics/price/limits preserved in spirit |

---

## 40. Submission Error

| Rule | Requirement |
| --- | --- |
| API failure | Safe user-facing message via existing `ApiErrorService` pattern |
| State | Clear saving; keep form data |
| Retry | User can retry Save Draft / Publish |

---

## 41. Saving State

| Rule | Requirement |
| --- | --- |
| Flag | `isSaving` (or equivalent) disables destructive/duplicate actions |
| Labels | Saving… on in-flight primary actions |
| Toast | Success for Save Draft; navigation message for Publish |

---

## 42. Duplicate Submission Safety

| Concern | Contract |
| --- | --- |
| Backend idempotency | **MISSING** — do **not** claim BE idempotency |
| UI requirement | **REQUIRED** duplicate-submit guard (disable buttons while saving; ignore double clicks) |
| Concurrency tokens | Do not invent ETag/version UI |

---

## 43. Historical Integrity

| Item | Contract |
| --- | --- |
| Planning posture | **PARTIAL** |
| Snapshot truth | Price/currency snapshotted on tenant assign/change; features/limits largely live unless overridden |
| UI copy | Truthful publish/immutability language |
| Forbidden claim | **Do not** say published plan changes “never affect existing tenants” |

---

## 44. Draft Editability

Draft plans are editable in UI-4B via shared create route + `planId`. All six steps remain available. Hydrate modules/features correctly on load.

---

## 45. Active / Retired Restrictions

| Status | UI-4B |
| --- | --- |
| Active | No edit workspace design |
| Retired | No edit workspace design |

Lifecycle mutations remain UI-4A Detail only.

---

## 46. UI-4A Lifecycle Boundary

Preserve strictly:

```text
Activate / Retire / Reactivate / Duplicate / Delete → UI-4A Plan Detail
Publish (draft → active) → UI-4B Review step
```

UI-4B must not re-implement Detail lifecycle chrome.

---

## 47. Page Composition

```text
1. Breadcrumb
2. PageHeader (Create vs Edit heading + short description + Draft badge)
3. Premium configuration context band (optional; no fake metrics)
4. Six-step rail (HARD geometry)
5. Workspace: main step form + side summary
6. Sticky action bar: Back | Save Draft | Next/Publish
```

---

## 48. Breadcrumb

| Item | Value |
| --- | --- |
| Trail | Subscription Plans → Create / Edit Plan |
| Nav | Plans link returns to `/admin/subscriptions` |
| Primitive | Semantic nav; match UI-4A breadcrumb character |

---

## 49. PageHeader

| Mode | H1 | Supporting |
| --- | --- | --- |
| Create | Create Subscription Plan | Build a subscription package for tenant assignment |
| Edit | Edit Subscription Plan (or Edit + plan name) | Show plan identity (`planName` / `planCode`) |

Use shared **PageHeader**. Status badge: Draft via **StatusBadge**.

---

## 50. Premium Configuration Context

Optional Premium Blue band explaining configuration purpose.

| Allowed | Prohibited |
| --- | --- |
| Short operational explanation | MRR / ARR / revenue charts |
| Route chip / Draft chip | Fake KPIs / subscriber forecasts |
| Assignability note | Billing operations CTAs |

---

## 51. Main Form Workspace

| Rule | Requirement |
| --- | --- |
| Width | Dominant main column; readable form measure |
| Surface | Neutral canvas + white step surface |
| Step header | H2 step title + one short supporting sentence |
| Controls | Shared UI-1 inputs/selects/textareas/buttons |

---

## 52. Side Summary

| Item | Contract |
| --- | --- |
| Approval | **APPROVED CONDITIONAL** |
| Content | Concise **live form reflection** (name, code, cycle, currency, price, module/feature counts, limits, step progress) |
| Responsive | Stack below main at **1024/768** |
| Prohibited | Fake metrics, MRR, invented analytics |

Duplication rule: side summary may echo Review fields lightly; Review remains the publish-authority summary.

---

## 53. Persistent Actions

Sticky footer always shows:

```text
Back | Save Draft | Next
```

On Review:

```text
Back | Save Draft | Publish
```

Disable appropriately while saving.

---

## 54. Button Hierarchy

| Action | Hierarchy |
| --- | --- |
| Next / Publish | Primary |
| Save Draft | Secondary |
| Back | Ghost/secondary outline |
| Confirm Publish | Primary in ConfirmationDialog |
| Dialog Cancel | Secondary |

Reuse shared **Button** primitive — remove local `.btn` system.

---

## 55. Cancel / Unsaved Changes

| Item | Contract |
| --- | --- |
| Cancel meaning | Leave form (Back on Basics → Plans List) |
| Not | Cancel tenant subscription |
| Unsaved changes | **NOT CURRENTLY SUPPORTED** — do not invent discard modal unless product later requires |

---

## 56. UI-1 Reuse

Mandatory reuse:

| Need | Primitive |
| --- | --- |
| Page title | PageHeader |
| Actions | Button |
| Status | StatusBadge |
| Confirm publish | ConfirmationDialog |
| Form controls | Shared input/select/textarea patterns |
| Loading | LoadingSkeleton (catalog/plan load) |
| Empty | EmptyState (modules/features empty) |
| Error | ErrorState / shared error patterns |
| Toast/status | Shared feedback patterns where available |

---

## 57. Competing Local UI System Removal

Remove Create/Edit local competing UI:

```text
local .btn / field-shell dialect where shared exists
local publish <dialog>
ad-hoc focus/outline systems competing with UI-1
native confirm() if introduced
```

Must migrate publish confirm to **ConfirmationDialog**.

---

## 58. Page-Local Styling

Allowed page-local only:

```text
step rail geometry
module/feature choice layout
review summary layout
side summary panel
sticky actions composition
premium configuration band composition
```

Not allowed: parallel design system tokens that bypass UI-1.

---

## 59. Style Budget

| Item | Value |
| --- | --- |
| Current baseline | ~**10.53 kB** warning (Create Plan) |
| Warning threshold | **6 kB** |
| Error threshold | **12 kB** |
| Target | Warning **NONE** (materially reduce/clear) |
| Angular budget change | **NONE** |

Strategy: UI-1 reuse + delete duplicated local CSS + keep only justified page-local stepper/module/feature/review/summary rules.

---

## 60. No Budget Evasion

Forbidden:

```text
raise warn/error thresholds
move page CSS into styles.scss / shell solely to escape budget
park UI-4B CSS in unrelated shared components
```

---

## 61. Premium Blue System

| Token | Value |
| --- | --- |
| Primary | `#0b5cff` |
| Primary hover/active | darker blue family (UI-1 / prototype) |
| Sidebar | `#0f172a` |
| Canvas | neutral cool gray/white |
| Focus | primary soft ring |

Must belong to modernized Super Admin family (UI-1…UI-4A continuity).

---

## 62. Semantic Colors

| Meaning | Use |
| --- | --- |
| Draft | Neutral StatusBadge |
| Success / completed step | Success green for check state only |
| Danger | Validation / submission errors |
| Primary | Active step + primary CTAs |

Do not encode status by color alone.

---

## 63. Typography

| Level | Use |
| --- | --- |
| H1 | PageHeader title |
| H2 | Step title |
| Body | Supporting sentences |
| Meta | Hints, char count, summary dt |
| Code | `planCode` emphasis where useful |

Match UI-4A density/character — operational, not marketing hero typography.

---

## 64. Density

| Region | Density |
| --- | --- |
| Basics / Pricing / Limits | Comfortable form |
| Modules / Features | Comfortable list |
| Review | Comfortable summary grid |
| Side summary | Compact reflection |
| Stepper | Compact horizontal rail |

---

## 65. Responsive 1440

Full shell + horizontal 6-col stepper + main/summary two-column workspace. No overflow.

---

## 66. Responsive 1280

Same composition; tighten gaps if needed. Stepper remains equal-width horizontal. No overflow.

---

## 67. Responsive 1024

| Element | Behavior |
| --- | --- |
| Stepper | Tighten labels/padding; keep 6-col rail |
| Side summary | Stack below main |
| Forms | Single column where needed |
| Page overflow | NONE |

---

## 68. Responsive 768

| Element | Behavior |
| --- | --- |
| Stepper | Contained horizontal scroll; min column widths per corrected prototype |
| Side summary | Stacked |
| Sticky actions | Wrap cleanly; remain usable |
| Page overflow | **NONE** (scroll confined to step rail container) |

---

## 69. Accessibility — Page

| Requirement | Value |
| --- | --- |
| Single H1 | Create or Edit title |
| Landmarks | Main form region + complementary summary |
| Focus visible | UI-1 focus-visible |
| Status messages | `role="status"` / `role="alert"` as appropriate |

---

## 70. Accessibility — Stepper

| Requirement | Value |
| --- | --- |
| Semantics | `nav` with accessible name (e.g. Plan wizard steps) |
| Current step | Expose current via text/state, not color alone |
| Completed | Check icon + accessible name |
| Keyboard | Focusable step controls where interactive |

---

## 71. Accessibility — Forms

| Requirement | Value |
| --- | --- |
| Labels | Every control labeled |
| Required | Visible indicator + announced |
| Errors | Associated with fields |
| Readonly echoes | Clearly readonly |

---

## 72. Accessibility — Modules/Features

| Requirement | Value |
| --- | --- |
| Grouping | Named groups / legends |
| Disabled features | Disabled state announced |
| Locked | Not presented as freely toggleable |
| Keyboard | Operable included/not_available controls |

---

## 73. Accessibility — Errors/Saving

| Requirement | Value |
| --- | --- |
| Saving | Disabled controls + status text |
| Errors | Alert/status regions |
| ConfirmationDialog | Shared a11y semantics (title, body, actions, focus) |

---

## 74. Prototype → Production Mapping

| Prototype element | Production |
| --- | --- |
| Shell / sidebar / topbar | Existing Super Admin shell |
| PageHeader | Shared PageHeader |
| Draft badge | StatusBadge |
| Config band | Page-local Premium Blue band (optional) |
| Step rail | Page-local; HARD geometry from `978c587` |
| Form fields | Shared form controls + exact field names |
| Modules/Features lists | Page-local layout + real catalog API |
| Side summary | Page-local live reflection |
| Sticky footer | Page-local composition + shared Button |
| Publish modal | ConfirmationDialog |
| Proto toolbar / viewport frames | **MUST NOT SHIP** |
| Sample modules/features | **MUST NOT SHIP** |

---

## 75. Step Contract Matrix

| Step | Primary inputs | Persist | Gate |
| --- | --- | --- | --- |
| Basics | `planName`, `planCode`, `description`, `billingCycle`, `baseCurrency` | POST/PUT draft | Required basics valid |
| Modules | module `included`/`not_available` | Via features | Catalog loaded; locked forced included |
| Features | feature `included`/`not_available` | PATCH `featureIds` included only | Respect module inclusion/locks |
| Pricing | `basePrice` (+ echoes) | PATCH pricing | `basePrice` ≥ 0 |
| Limits | `maxOutlets`, `maxTills`, `maxUsers` | PATCH limits | Each ≥ 1 |
| Review & Create | Summary + confirm | pricing/limits then POST publish | All publish prerequisites |

---

## 76. Create/Edit Mode Matrix

| Concern | Create | Edit Draft |
| --- | --- | --- |
| Route | `/admin/subscriptions/create` | Same + `history.state.planId` |
| Heading | Create Subscription Plan | Edit + plan identity (**REQUIRED FIX**) |
| Load | Empty + catalog | Detail hydrate including modules/features (**REQUIRED FIX**) |
| Save Draft | YES | YES |
| Publish | YES | YES |
| Active/Retired | N/A | Out of scope |

---

## 77. Billing-Cycle Matrix

| Cycle | Create/Edit UI | Notes |
| --- | --- | --- |
| `monthly` | YES | |
| `yearly` | YES | |
| `custom` | YES | No invented period builder |
| `trial` | YES | PARTIAL — no `trialDays` |
| `demo` | YES | No invented demo duration |
| `one_time` | **NO** | Prohibited in UI-4B |

---

## 78. Entitlement Matrix

| Layer | UX | Persist |
| --- | --- | --- |
| Modules | `included` / `not_available`; locked → included | Selection drives feature set |
| Features | `included` / `not_available`; disabled if module not included or locked | PATCH included `featureIds` only |
| Search | Not required | — |
| Overrides | Absent (tenant path) | — |

---

## 79. Limits Matrix

| Field | Required | Min | Persist |
| --- | --- | --- | --- |
| `maxOutlets` | YES | 1 | PATCH limits |
| `maxTills` | YES | 1 | PATCH limits |
| `maxUsers` | YES | 1 | PATCH limits |

---

## 80. Lifecycle Matrix

| Action | UI-4B | UI-4A |
| --- | --- | --- |
| Create draft | YES | CTA only |
| Edit draft | YES | CTA only |
| Save Draft | YES | NO |
| Publish | YES (Review) | NO |
| Activate/Retire/Reactivate | NO | YES (Detail) |
| Duplicate/Delete | NO | YES (as supported) |

---

## 81. Validation Matrix

| Field | Validators |
| --- | --- |
| `planName` | required |
| `planCode` | required (+ UPPERCASE helper) |
| `description` | maxLength 500 |
| `billingCycle` | required |
| `baseCurrency` | required (default LKR) |
| `basePrice` | required, min 0 |
| `maxOutlets` | required, min 1 |
| `maxTills` | required, min 1 |
| `maxUsers` | required, min 1 |

---

## 82. Action Matrix

| Action | Availability | Result |
| --- | --- | --- |
| Back | Always | Prev step / leave form on Basics |
| Save Draft | Always (footer) | Persist; stay; toast; not publish |
| Next | Non-review | Advance when gated |
| Publish | Review only | Confirm → persist pricing/limits → POST publish → list |
| Dialog Cancel | Confirm only | Close dialog; remain on Review |

---

## 83. Responsive Matrix

| Viewport | Stepper | Workspace | Overflow |
| --- | --- | --- | --- |
| 1440 | Equal-width horizontal | Main + summary | NONE |
| 1280 | Equal-width horizontal | Main + summary | NONE |
| 1024 | Tightened horizontal | Stack summary | NONE |
| 768 | Contained horizontal scroll | Stack summary | NONE (page) |

---

## 84. Accessibility Matrix

| Concern | Requirement |
| --- | --- |
| H1 | Single Create/Edit H1 |
| Stepper | Named nav + current/completed semantics |
| Forms | Labels, required, errors |
| Modules/Features | Groups, disabled/locked clarity |
| Saving/Errors | status/alert |
| Publish | ConfirmationDialog a11y |
| Focus | Visible focus-visible |

---

## 85. UI-1 Mapping Matrix

| Need | Shared Primitive | Rule |
| --- | --- | --- |
| Page title | PageHeader | REUSE |
| CTA/actions | Button | REUSE |
| Status | StatusBadge | REUSE |
| Publish confirm | ConfirmationDialog | REUSE (replace local dialog) |
| Inputs/selects/textarea | shared form controls | REUSE |
| Loading | LoadingSkeleton | REUSE |
| Empty | EmptyState | REUSE |
| Error | ErrorState | REUSE |
| Step rail | page-local | ALLOWED |
| Module/feature layout | page-local | ALLOWED |
| Review layout | page-local | ALLOWED |
| Side summary | page-local | ALLOWED |
| Sticky actions shell | page-local | ALLOWED |

---

## 86. Request Safety

Implementation must not introduce:

```text
duplicate create POSTs from double Save/Next
duplicate publish POSTs
duplicate unnecessary catalog fetches on every step change
N+1 feature persistence patterns
```

Use in-flight guards. Do not claim backend idempotency.

---

## 87. Backend / API / DB Preservation

| Layer | Rule |
| --- | --- |
| Backend changes required | **NO** |
| API changes required | **NO** |
| DB changes required | **NO** |
| Frontend changes required | **YES** |
| Field names | Exact source names only |
| Routes | Preserve create route; no invented edit URL |

---

## 88. One-Time / Trial Gaps

| Gap | Status | UI-4B rule |
| --- | --- | --- |
| `one_time` Create/Edit absent while BE/list aware | Non-blocking | Do **not** add in UI-4B |
| Trial PARTIAL (cycle only; no `trialDays`) | Non-blocking | Do **not** invent `trialDays` |
| UI-4A `one_time` mapper test thinness | Non-blocking | Out of UI-4B scope except awareness |

---

## 89. Concurrency / Idempotency / Audit Gaps

| Gap | Planning | UI-4B rule |
| --- | --- | --- |
| Plan mutation concurrency | NONE | No invented ETag UI |
| Publish/create idempotency | MISSING | UI duplicate-submit guard **required**; no BE idempotency claims |
| Platform audit logs for plan CRUD | PARTIAL / absent | Document only; no fake audit UI |

---

## 90. Future Test Requirements

Strengthen dedicated UI-4B tests for:

### Stepper

```text
equal-width 6 columns
common indicator baseline
no active/completed geometry shift
Modules alignment
1440/1280 horizontal
1024 tightened horizontal
768 contained horizontal scroll without page overflow
Review & Create in-column wrap
```

### Create Mode

```text
route render
defaults (baseCurrency LKR)
Save Draft stay + toast
Publish confirm + navigate success
billing cycles exclude one_time
```

### Edit Mode

```text
history.state planId load
Edit heading + identity
modules/features hydration
draft save/publish
no /edit route
```

### Billing Cycle

```text
monthly yearly custom trial demo present
one_time absent
trialDays absent
```

### Modules/Features

```text
locked forced included
feature disable when module not included
PATCH featureIds included only
```

### Limits

```text
maxOutlets maxTills maxUsers required min 1
```

### Request Safety

```text
double-click Save/Publish guarded
no duplicate publish
```

### Accessibility

```text
H1 · stepper name · labels · ConfirmationDialog · focus-visible
```

---

## 91. Quality Targets

| Surface | Target |
| --- | --- |
| Overall visual quality | ≥ **8.5/10** |
| Stepper geometry fidelity | ≥ **9.5/10** |
| UX / operational clarity | ≥ **8.5/10** |
| Modern SaaS fit | ≥ **8.5/10** |
| Style warning | **NONE** |
| Page overflow | **NONE** |

---

## 92. Must-Look-Like Contract

Production UI-4B must feel like:

```text
premium enterprise subscription plan configuration
modern OneVerz Super Admin stepped workspace
precise equal-width stepper geometry (approved correction)
truthful draft → publish catalog workflow
calm high-clarity operational form
```

---

## 93. Must-Not-Look-Like Contract

Must not look like:

```text
marketing pricing page
billing/invoice workspace
tenant subscription CRM
legacy local-button CRUD wizard dialect
prototype review toolbar product UI
analytics/MRR side panel
shifted/misaligned step indicators
active/completed geometry jumpiness
```

---

## 94. Controlled Implementation Scope

```text
Modernize PlatformCreateSubscriptionPlanPage only
Premium Stepped Form Workspace
Exact six steps
Corrected stepper geometry from 978c587
Create + Draft Edit truthfulness (heading + hydration fixes)
Real Basics/Modules/Features/Pricing/Limits/Review contracts
Save Draft + Publish via ConfirmationDialog
UI-1 reuse + local UI removal
Responsive 1440/1280/1024/768
Accessibility improvements
Style-budget cleanup toward NONE warning
Focused UI-4B tests
Duplicate-submit guards
```

---

## 95. Explicit Out-of-Scope

```text
UI-4A redesign
UI-5 billing
tenant subscription CRM
one_time Create/Edit option
trialDays field
new /edit route
Active/Retired edit UX
Activate/Retire/Reactivate in wizard
feature search
unsaved-changes system (not currently supported)
fake MRR/metrics
backend/API/DB changes
raising Angular budgets
prototype toolbar/sample data in production
new plan lifecycle states
```

---

## 96. Regression Boundaries

Must not regress:

```text
UI-4A Plans List + Plan Detail
UI-3 Create Tenant / Drafts / Operation Status
UI-2 Dashboard / Tenant List / Tenant Detail
Global shell / UI-1 primitives unrelated consumers
Plan APIs / permissions / lifecycle semantics
```

---

## 97. UI-4 Consolidated Closure Strategy

After UI-4B is independently verified and merged:

```text
Perform ONE consolidated UI-4 closure covering UI-4A + UI-4B.
Do not start UI-5.
Do not create multiple unnecessary closure cycles.
```

---

## 98. Planning Findings Carry-Forward

| Finding | UI-4B Impact | Carry |
| --- | --- | --- |
| F-SA-UI4-P-001 Menu “Subscriptions” = Plan Catalog | Title/copy as Subscription Plan create/edit — not tenant CRM | YES |
| F-SA-UI4-P-002 Competing local UI + native confirm | Remove local system; ConfirmationDialog for publish | YES — close on verified impl |
| F-SA-UI4-P-003 Create Plan ~10.53 kB | Primary UI-4B style-budget remediation | YES |
| F-SA-UI4-P-004 No concurrency/audit on plan mutations | UI guards only; document gaps | YES |
| F-SA-UI4-P-005 ActiveTenantCount ACTIVE-only | Mostly UI-4A; do not invent subscriber metrics in UI-4B summary | YES |
| F-SA-UI4-P-006 No tenant-sub CRM APIs | Keep CRM out of UI-4B | YES |
| F-SA-UI4-P-007 Reactivate uses archive perm | UI-4A Detail auth; out of wizard | YES |
| F-SA-UI4-P-008 npm ci lockfile family | CI hygiene; no VD blocker | YES |

UI-4A verification non-blocking gap: `one_time` mapper test thinness — **does not** authorize Create/Edit `one_time`.

---

## 99. Implementation Acceptance Criteria

Future UI-4B implementation must satisfy at minimum:

```text
Premium Stepped Form Workspace preserved
Exact six steps: Basics → Modules → Features → Pricing → Limits → Review & Create
Corrected stepper alignment preserved (978c587)
Modules indicator alignment exact
No active-state geometry shift
No completed-state geometry shift
1440/1280 horizontal rail
1024 usable tightened rail
768 contained horizontal stepper scroll
No page-level horizontal overflow
Create mode truthful
Edit Draft mode truthful (Edit heading + plan identity)
Modules/features hydrated on edit without new API
No fake edit route
Plan lifecycle preserved (Draft in form; Activate/Retire on UI-4A)
Save Draft always in footer; stays on page; does not publish
Publish on Review via ConfirmationDialog
Publish copy truthful (no false historical-integrity claims)
Basics fields exact: planName planCode description billingCycle baseCurrency
Modules included|not_available; locked forced included
Features included|not_available; group by module; PATCH featureIds included only
Pricing basePrice min 0; cycle/currency readonly echo
Billing cycles: monthly yearly custom trial demo only
one_time NOT added
trialDays NOT invented
Limits maxOutlets maxTills maxUsers required min 1
Currency hardcoded LKR/USD/GBP/EUR default LKR
Feature search absent
Unsaved-changes not invented
UI-4A lifecycle boundary preserved
UI-5 billing boundary preserved
Tenant subscription CRM absent
UI-1 primitives reused
Local competing UI removed
Prototype review controls absent
Prototype sample data absent
Saving state implemented
Submission error implemented
Duplicate submission guarded
Accessibility improved
Style warning materially reduced/cleared (target NONE)
Angular budgets unchanged
No budget evasion
Focused tests strengthened
UI-4A unchanged
Backend/API/DB unchanged
UI-5 untouched
```

---

## 100. Independent Verification Criteria

Future independent verifier must prove:

```text
exact implementation commit
UI-4B scope only
Premium Blue visual compliance
correct six-step flow
stepper geometry vs 978c587 contract
Modules alignment
responsive stepper 1440/1280/1024/768
Create mode
Edit Draft mode (heading + hydration)
route/history.state truthfulness (planId; no /edit route)
real form field names
real billing cycles; one_time absent; trialDays absent
modules/features behavior + PATCH included-only
limit validation
Save Draft + Publish + ConfirmationDialog
review summary truthfulness
historical-integrity copy safety
UI-4A boundary + UI-5 boundary
UI-1 reuse + local UI removal
loading/saving/error behavior
request duplication guards
accessibility
horizontal overflow none
style budget
test quality
UI-4A regression absent
UI-3/UI-2/global-shell regression absent
backend/API/DB unchanged
```

---

## 101. Final Visual Direction Verdict

```text
SUPER ADMIN UI-4B PREMIUM BLUE VISUAL DIRECTION APPROVED WITH NON-BLOCKING GAPS — READY FOR CONTROLLED IMPLEMENTATION
```

### Non-blocking gaps (recorded)

| Gap | Notes |
| --- | --- |
| `one_time` Create/Edit UI absent (BE/list aware) | Do **not** add in UI-4B |
| Trial PARTIAL | Cycle only; no `trialDays` |
| Historical integrity PARTIAL | Truthful publish/immutability copy only |
| Concurrency / idempotency / audit gaps | UI duplicate-submit guard required; no BE idempotency claims |
| Edit module/feature hydration gap | **Must fix in implementation** (no new API) |
| Currency hardcoded | Preserve LKR/USD/GBP/EUR; do not invent currency API |
| Corrected prototype SHA `978c587` vs `main` prototype file | `main` may still hold pre-correction (PR #81); **VD binds to `978c587`** |

Visual Direction blockers: **NONE**.

UI-4B implementation authorized only after this specification is merged/accepted via Second Brain docs PR.  
UI-4 aggregate closure: **NOT AUTHORIZED** until UI-4B verified + merged.  
UI-5: **NOT AUTHORIZED**.

---

## 102. Required Next Action

```text
Merge the approved UI-4B Premium Blue Visual Direction Specification through the controlled Second Brain documentation PR process.

After the specification is integrated, implement only the existing UI-4B Create/Edit Subscription Plan workflow on a dedicated Platform Admin feature branch.

Preserve the exact six-step flow, corrected stepper alignment (978c587), Create + Draft Edit semantics (including Edit heading/identity and module/feature hydration), current billing-cycle options (no one_time), Save Draft / Review & Create behavior, real modules/features/limits, UI-4A lifecycle boundary, and UI-5 Billing boundary.

Do not add one_time, trialDays, a new edit route, tenant subscription CRM, billing operations, new lifecycle states, backend changes, API changes, or DB changes.

Require independent verification before source merge.

After UI-4B source merge, perform one consolidated UI-4 final closure covering UI-4A + UI-4B.

Do not start UI-5.
```

---

## Document Control

| Field | Value |
| --- | --- |
| Document | `SUPER_ADMIN_UI4B_CREATE_EDIT_SUBSCRIPTION_PLAN_PREMIUM_BLUE_VISUAL_DIRECTION.md` |
| Location | `07_UI_UX_KNOWLEDGE/` |
| Date | 2026-08-12 |
| Approved prototype HEAD | `978c5873aaa0d78bea073b7d20e317de3217fb75` |
| Theme | PREMIUM BLUE |
| Pattern | PREMIUM STEPPED FORM WORKSPACE |
| Verdict | APPROVED WITH NON-BLOCKING GAPS — READY FOR CONTROLLED IMPLEMENTATION |
