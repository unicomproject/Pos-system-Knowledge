# OneVerz Super Admin UI-3 — Create Tenant + Onboarding Planning Audit

**Date:** 2026-08-10  
**Audit type:** Independent read-only planning audit (pre-implementation)  
**Scope:** Create Tenant Wizard · Onboarding Drafts · Onboarding Operation/Result  
**Roles:** Senior Angular Architect · Enterprise SaaS UI/UX Auditor · Tenant Onboarding Workflow Analyst · Frontend/Backend Integration Reviewer · Design System Architect · Accessibility Reviewer · Responsive Web QA Engineer · Git / Scope Integrity Auditor · Second Brain Planning Auditor

---

## 1. Executive Summary

UI-3 candidate routes are **ACTIVE** on Platform Admin `origin/main` (`61780ed`) with a durable backend onboarding contract on Backend `origin/main` (`10ca840`). Create Tenant is a 7-step reactive-forms wizard that saves durable drafts, finalizes with idempotency, and navigates to an operation-status page that polls lifecycle stages for payment → activation → invitation.

UI-2 aggregate closure is integrated into Second Brain `origin/main` (`df75f93`, ancestor `2951859`), authorizing UI-3 planning.

Modernization gaps are primarily **design-system bypass**, **legacy `.btn`/hardcoded styling**, **draft discard without ConfirmationDialog**, **incomplete draft hydration (addons / some billing UI fields)**, and **misleading billingStatus/subscriptionStatus UI fields that are not persisted in the durable payload**. These are non-blocking for controlled implementation if contracts are preserved.

**Final Verdict:**

```text
SUPER ADMIN UI-3 READY WITH NON-BLOCKING GAPS — CONTROLLED IMPLEMENTATION MAY BEGIN
```

---

## 2. Repository Baselines

| Repo | `origin/main` SHA | Tip message |
| --- | --- | --- |
| Platform Admin | `61780edd64d2e0bfdf54263d922e494bd006962a` | Merge PR #43 — Super Admin UI-2A Dashboard |
| Backend (Unified-Commerce) | `10ca8403004a5c119a9db86b9d82abd93b4a2b23` | Merge PR #80 — Tharmi_Add_Customer |
| Second Brain | `df75f935e04c4820e62dde0d1fafc2f83d799b85` | Merge PR #63 — UI-2 aggregate closure |

Inspection worktrees (read-only / detached):

- Platform Admin: `...\worktrees\super-admin-ui3-pa-planning` @ `61780ed`
- Backend: `...\worktrees\super-admin-ui3-be-planning` @ `10ca840`
- Second Brain audit: `...\worktrees\super-admin-ui3-sb-planning` @ branch `audit/super-admin-ui3-create-tenant-onboarding-planning-2026-08-10`

Developer workspaces were not disturbed.

---

## 3. UI-2 Closure / UI-3 Authorization Evidence

| Check | Result |
| --- | --- |
| Aggregate audit file on `origin/main` | `YES` — `15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SUPER_ADMIN_UI2_AGGREGATE_CLOSURE_AUDIT_2026-08-10.md` |
| Audit commit ancestor of `origin/main` | `YES` — `2951859` is ancestor (`git merge-base --is-ancestor` exit 0) |
| Merge evidence | PR #63 → `df75f93` |
| UI-2 verdict | `SUPER ADMIN UI-2 CLOSED WITH NON-BLOCKING GAPS — UI-3 AUTHORIZED` |

```text
UI-2 Aggregate Audit Integrated: YES
UI-3 PLANNING PRECONDITION: SATISFIED
```

---

## 4. UI-3 Route Inventory

Source: `src/app/features/admin/routes/admin.routes.ts` + `permissionGuard` via `canActivateChild`.

| Route | Component | Guard | Permission | Status |
| --- | --- | --- | --- | --- |
| `/admin/tenants/create` | `PlatformCreateTenantPage` | `permissionGuard` | `platform.tenants.create` | **ACTIVE** |
| `/admin/tenants/onboarding/drafts` | `PlatformTenantOnboardingDraftsPage` | `permissionGuard` | `platform.tenants.create` | **ACTIVE** |
| `/admin/tenants/onboarding/operations/:operationId` | `PlatformTenantOnboardingResultPage` | `permissionGuard` | `platform.tenants.create` | **ACTIVE** |
| `/admin/tenants/onboarding/:draftId` | `PlatformCreateTenantPage` (resume) | `permissionGuard` | `platform.tenants.create` | **ACTIVE** |

Related but **outside primary UI-3 page modernization** (continuity / post-create):

| Route | Role in flow | UI-3 treatment |
| --- | --- | --- |
| `/admin/tenants/:tenantId` | Tenant Detail after create | Continuity CTA only (UI-2C closed) |
| `/admin/tenants` | List + Create CTA | Continuity / entry (UI-2B closed) |
| `/admin/billing/manual-payments/:paymentId` | Manual payment review | Outside UI-3 pages; linked from Result |
| `/admin/billing/manual-payments` | Payment queue | Outside UI-3 |

No placeholder/dead routes found for the three UI-3 candidates.

---

## 5. Create Tenant Current Architecture

- **File:** `platform-create-tenant-page.ts` (inline template + inline styles; ~54 KB source)
- **Standalone Angular component** with Reactive Forms + Signals
- **No UI-1 primitives** currently imported (`PageHeader`, `Button`, `FormField`, etc.)
- **Primary submission path:** durable onboarding finalize (not legacy `POST /tenants` from the wizard UI)
- **Legacy API still present** on `PlatformTenantApiService.createTenant()` but not used by wizard submit

---

## 6. Wizard Steps / Fields / Validation

### Step matrix (actual source order)

| # | Key | Label (UI) | Current Purpose | Primary fields | API/Data | Validation |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `business-info` | Tenant Basic Details | Identity + locale defaults | code, slug, subdomain, name, legalName, reg/tax, country, currency, timezone, locale, businessType, operatingMode | create-options lookups | FE required + ISO country/currency; BE basicDetails mask |
| 2 | `plan-selection` | Business & Contact Information | Address + contacts | address, primary/billing/support contacts, website | draft payload `businessContact` | FE required address/contacts; BE step 2 |
| 3 | `limits-addons` | Subscription Plan | Plan card + limits + addons | subscriptionPlanId, maxOutlets/Tills/Users, addon qty | create-options plans/addons | FE plan+limits required; BE plan needs type+cycle too |
| 4 | `billing-subscription` | Billing / Payment Setup | Subscription commercial setup | subscriptionType, billingStatus*, billingCycle, subscriptionStatus*, invoiceEmail, paymentMethod, notes, autoRenew, createDraftInvoice* | payload `plan` + `billing` | FE required type/status/cycle; BE derives billing/invoice for PAID |
| 5 | `feature-entitlements` | Feature Entitlements | Plan-allowed feature toggles | enabled feature IDs | create-options catalog + plan included features | FE ≥1 feature; BE entitlements object non-null |
| 6 | `tenant-admin` | Tenant Admin User | First admin invite target | firstName, lastName, email, phone | payload `tenantAdmin` | FE firstName+email; BE same |
| 7 | `review-create` | Review, Create & Activation | Summary + finalize | reviewConfirmed via finalize body | finalize endpoint | FE all-step issues; BE mask==127 |

\* `billingStatus`, `subscriptionStatus`, and `createDraftInvoice` are collected in UI but **not written** into durable onboarding payload; backend derives billing/invoice from `subscriptionType`.

### Navigation / save / submit behavior

| Behavior | Current |
| --- | --- |
| Next | Validates current step → advances → **auto Save Draft** |
| Back | Previous step; step 0 → `/admin/tenants` |
| Save Draft | Explicit; create or patch with `If-Match` |
| Cancel | **Missing** dedicated Cancel |
| Submit | Ensure draft exists → `finalize` with Idempotency-Key → navigate to operation page |
| Resume | Route `/admin/tenants/onboarding/:draftId` loads draft + hydrates forms |

---

## 7. Wizard State Management

```text
Wizard State Architecture:
Local component ownership using Angular signals (currentStep, draftId/version, options, feature/addon selections, saveState)
+ ReactiveFormsModule FormGroups for field values
+ ActivatedRoute draftId for resume
+ Backend durable draft as source of truth after first save
+ No NgRx/store, no session/localStorage draft cache, no route-based step segments/query params
```

Refresh mid-wizard:

```text
RECOVERS FROM BACKEND DRAFT — only if draftId already exists in URL or user re-opens from Drafts;
LOSES UNSAVED LOCAL PROGRESS on refresh of /create before first successful save
```

---

## 8. Frontend API Flow

Ordered map (wizard path):

1. **Initial load** → `GET /api/v1/platform-admin/tenants/create-options` → options/defaults → enable country controls  
2. **Resume (optional)** → `GET /api/v1/platform-admin/tenant-onboarding/drafts/{id}` → hydrate + set step  
3. **Save Draft (explicit or on Next)** → `POST .../drafts` or `PATCH .../drafts/{id}` + `If-Match` → update version/progress  
4. **Submit** → `POST .../drafts/{id}/finalize` + `If-Match` + `Idempotency-Key` → receipt  
5. **Navigate** → `/admin/tenants/onboarding/operations/{operationId}`  
6. **Result poll** → `GET .../operations/{id}` every 5s while `PROCESSING` or `FAILED_RETRYABLE`  
7. **Projections** → `GET tenants/{id}` (if `tenants.view`); `GET` tenant manual payment status (if `billing.view`)  
8. **Optional actions** → activate / retry / resend payment notification / resend invitation

Drafts page:

- `GET .../drafts?mine=true`
- Discard → `DELETE .../drafts/{id}` + `If-Match`
- Resume → client navigate to onboarding draft route

---

## 9. Backend Tenant Creation Flow

Controller: `PlatformTenantOnboardingController` (`/api/v1/platform-admin/tenant-onboarding`)

| Concern | Behavior |
| --- | --- |
| HTTP finalize | `POST drafts/{id}/finalize` |
| Validation | `TenantOnboardingProgressEvaluator` requires completed mask `127` + `FinalReviewConfirmed` |
| Tenant create | `PlatformTenantService.CreateTenantAsync` with onboarding finalize context |
| Plan/entitlements/limits | Mapped from draft payload |
| Billing invoice | `CreateDraftInvoice = (subscriptionType == PAID)` (server-driven) |
| Admin bootstrap | TenantAdmin with `SendInvite = true` (invite eligibility still lifecycle-gated) |
| Operation | Created with provisioning/payment/invitation statuses |
| Idempotency | Idempotency-Key hash + completed-draft replay |
| Concurrency | Draft version / `If-Match` |
| Defaults | Phase 4 default tenant settings provisioned on finalize (backend tests present) |
| Outbox | Invitation/payment notifications via outbox worker (async) |

Also: create-options available on both `/platform-admin/tenants/create-options` and `/platform-admin/tenant-onboarding/create-options` (same service). FE uses tenants path.

---

## 10. Subscription Plan / Entitlement Provisioning

| Item | Status |
| --- | --- |
| Plan list from create-options | SUPPORTED |
| Display price / cycle / code | SUPPORTED (plan cards) |
| Included features drive entitlements UI | SUPPORTED |
| Limits prefilled from plan | SUPPORTED |
| Tenant feature overrides within plan allow-list | SUPPORTED |
| Arbitrary feature outside plan | Blocked in UI (`isFeatureAllowed`) |
| Duplicate full Subscription Plan admin UI | Avoid — show decision info only |

---

## 11. Tenant Defaults

| Default | Source | Wizard visibility recommendation |
| --- | --- | --- |
| country/currency/timezone/locale | create-options.defaults | Editable (already) |
| billingCycle | defaults + plan | Editable |
| operatingMode/businessType | first option fallback | Editable |
| inventory/online-store settings | backend finalize defaults | **Hidden implementation detail** (do not invent wizard steps) |

---

## 12. Manual Payment Flow

```text
Location: AFTER tenant creation — Onboarding Result + Billing Manual Payment pages
Not inside Create Tenant wizard finalize step as a payment capture UI
```

| Question | Answer |
| --- | --- |
| Payment required? | For `subscriptionType=PAID` → awaiting payment; trial/demo → not required |
| Status source | Operation `paymentStatus` + billing projection |
| Manual confirmation | Billing review flows (outside UI-3 page rewrite) |
| Navigation | Result → Open payment review |

Classification for UI-3: **SUPPORTED / PARTIAL in Result continuity; payment mutation pages OUTSIDE UI-3**

---

## 13. Activation Flow

| Aspect | Actual |
| --- | --- |
| Automatic? | No (paid path is payment-gated then explicit activate) |
| Manual Super Admin action | Result page `Activate tenant` when `activationEligible` + `tenants.activate` |
| Status-gated | Yes — payment/tenant projection |

Lifecycle (simplified):

| State | Meaning | Available actions | Next |
| --- | --- | --- | --- |
| Tenant created / provisioning succeeded | Row + operation exist | View tenant, wait/pay | Payment pending or active (non-paid) |
| AWAITING_PAYMENT | Manual payment outstanding | Open payment review, resend notification | PAID |
| PAID / pending activation | Eligible for activate | Activate tenant | Active |
| Active | Invitation stage progresses | Resend invitation | Invite sent/accepted |

---

## 14. First Tenant Admin Invitation

| Item | Current |
| --- | --- |
| Details entered | Wizard step Tenant Admin |
| When invite created | After activation eligibility/path; not email-delivered merely because finalize succeeded |
| API | Finalize seeds admin; `POST .../invitation/resend` on Result |
| Status shown | `invitationStatus` on operation |
| UI honesty | Result titles avoid claiming email delivered; tests assert pending-payment does not claim invite success |
| External dependency | Azure Communication Services / outbox (infra, not UI-3) |

Invitation UI Semantics: **PASS (honest boundaries on Result)** with modernization polish needed.

---

## 15. Draft Architecture

| Capability | Status |
| --- | --- |
| Draft entity + ID + version | Yes |
| Create/save/list/get/discard | Yes |
| Expiration | 30 days (`expiresAt` / `draftRetentionDays`) |
| Ownership | Owner platform user; others need `tenants.update` for list-all |
| Progress percent / current step | Backend evaluator + FE step index |
| Autosave | No (explicit + on Next) |
| Validate endpoint | Backend exists; FE does not call |

```text
Draft Support: COMPLETE (API) / PARTIAL (FE hydration & discard UX)
```

---

## 16. Onboarding Drafts Page

Current: single-file inline template/styles (~3.5 KB), no PageHeader/FilterBar/DataTable/StatusBadge.

| Concern | Present? |
| --- | --- |
| Columns | Tenant, Step, Progress, Status, Updated, Actions |
| Search/filter/sort/pagination | No |
| Resume / Discard | Yes |
| Empty / loading / error | Minimal text |
| Confirmation on discard | **No** |

Scores:

| Metric | Score |
| --- | ---: |
| Visual Quality | 3/10 |
| UX | 5/10 |
| Modern SaaS Fit | 3/10 |

---

## 17. Draft Resume / Delete

### Resume

```text
Drafts → Resume link → /admin/tenants/onboarding/:draftId
→ getOnboardingDraft → applyDraftMetadata + applyDraftPayload → currentStep from draft.currentStep
```

Hydration gaps:

- Addon quantities not restored
- `billingStatus` / `subscriptionStatus` / `createDraftInvoice` not in payload (UI may show defaults after options load)
- Step key naming mismatch vs labels (maintainability risk)

### Delete / Abandon

- Immediate `discardOnboardingDraft` without ConfirmationDialog
- Irreversible soft-discard on backend
- Recommendation: use shared ConfirmationDialog in UI-3B

---

## 18. Onboarding Operation / Result Page

Separate HTML/SCSS/TS; richer than Drafts.

Shows:

- Operation status title with lifecycle-aware copy
- 4-stage visual progress: Tenant created → Manual payment → Activation → Invitation
- Tenant / Payment / Setup cards
- Actions: Refresh, Activate, Resend payment notification, Retry, Resend invitation
- Permission-aware projections

---

## 19. Async Operation Status / Polling

| Item | Value |
| --- | --- |
| Interval | 5000 ms |
| Continues while | `PROCESSING` or `FAILED_RETRYABLE` |
| Termination | `takeWhile(..., true)` then stops |
| Duplicate risk | Timer + projection fetches; acceptable; refresh can overlap briefly |
| Error handling | Safe message via `ApiErrorService` |

---

## 20. Success / Failure Semantics

### Success is **not** a single boolean

Finalize success means: tenant committed + operation receipt issued. It does **not** mean payment confirmed, tenant activated, or invitation email delivered.

Result page currently encodes this correctly in titles/copy (preserve).

### Failure

- Operation `FAILED*` + `failureCode`
- Retry when `retryable`
- Safe user messages; failure code as reference
- Modernize with ErrorState / StatusBadge; keep technical leakage out

---

## 21. Permission / Guard Matrix

| Action | Permission/Guard | Source |
| --- | --- | --- |
| Open Create Tenant | `platform.tenants.create` route data | `admin.routes.ts` |
| Save / Resume / Delete Draft | FE route create; BE create (+ update for non-owner) | FE + `PlatformTenantOnboardingService` |
| Submit / Finalize | create (+ Idempotency-Key) | FE/BE |
| View Result route | **FE:** `tenants.create` | routes |
| Get Operation API | **BE:** `tenants.view` | service `GetOperationAsync` |
| Activate | `tenants.activate` | Result page |
| Payment notification resend / retry (paid) | `billing.manage` | Result page |
| Resend invitation | `tenants.update` | Result page |
| Billing projection | `billing.view` | Result page |

```text
Permission / Guard Matrix: PARTIAL
```

Finding: route allows create-only users into Result, but operation GET requires `tenants.view`. Typically Super Admin has both; still a contract mismatch to document and preserve carefully during modernization.

---

## 22. UI-1 Design System Reuse

| UI Need | Existing Primitive | Reusable on UI-3? |
| --- | --- | --- |
| Page heading | `PageHeader` | YES — currently bypassed |
| Buttons | `Button` | YES — replaced by `.btn` / `.button` / `.primary` |
| Status | `StatusBadge` (+ ManualPaymentStatusBadge) | YES / keep payment badge |
| Inputs | `FormField` | YES — raw labels/inputs today |
| Filters | Tenant List **page-local** filter-bar pattern (no shared FilterBar component) | Drafts: optional; not required if no server filters |
| Draft table | Tenant List **page-local** data-table pattern (no shared DataTable component) | YES as pattern; do not invent new shared DataTable unless reused ≥2 times after UI-3 |
| Loading | `LoadingSkeleton` | YES |
| Error | `ErrorState` | YES |
| Empty | `EmptyState` | YES |
| Destructive confirmation | `ConfirmationDialog` | YES for discard |

```text
UI-1 Primitive Reuse: FAIL (current) → target PASS in implementation
```

---

## 23. Legacy UI Pattern Inventory

| Pattern | Page | Severity | UI-1 Replacement |
| --- | --- | --- | --- |
| `.btn` / `.btn.primary` / `.btn.outline` | Create | Medium | `app-button` |
| `.button` / `.primary` / `.secondary` / `.warning` | Result | Medium | `app-button` |
| `.primary` anchor CTA | Drafts | Medium | `app-button` + routerLink |
| Hardcoded hex colors / shadows | All three | Medium | design tokens |
| Heavy card nesting / plan cards | Create | Medium | tokenized section layout; keep selection cards as interaction containers |
| Custom stepper | Create | Medium | page-local modern stepper (or small shared later) |
| Custom loading text/spinner | All | Medium | `LoadingSkeleton` / button loading |
| Custom error toast/alert boxes | Create/Result | Medium | `ErrorState` + FormField errors |
| Custom empty | Drafts | Medium | `EmptyState` |
| Inline styles block | Create/Drafts | Medium | external SCSS + tokens; budget ≤6 kB |
| Native `confirm()` | Result | Medium | `ConfirmationDialog` |
| Discard without confirm | Drafts | High (UX) | `ConfirmationDialog` |

```text
Legacy UI Debt: HIGH
```

---

## 24. Wizard Shared Component Decision

| Candidate | Classification | Rationale |
| --- | --- | --- |
| WizardStepper | **KEEP PAGE-LOCAL** (initial) | Only Create uses multi-step; avoid framework sprawl |
| WizardFooter | **KEEP PAGE-LOCAL** (initial) | Only Create needs sticky footer actions |
| WizardSection | **KEEP PAGE-LOCAL** | Step content varies widely |
| WizardSummary | **KEEP PAGE-LOCAL** | Review step specific |

```text
Shared Wizard Component: NOT REQUIRED for UI-3 start
Shared Foundation First: NO
```

If a second multi-step Super Admin flow appears later, extract then.

---

## 25. Style Budget Baseline

Angular budgets: warning 6 kB / error 12 kB component styles.

Build on clean worktree (`npm install` fallback after known `npm ci` failure **F-SA-UI2C-M-001**):

| Page | Observed style warning | Notes |
| --- | --- | --- |
| Create Tenant | **NONE** | Must not grow into warning during modernization |
| Drafts | **NONE** | Tiny inline styles |
| Result | **NONE** | SCSS ~3.1 KB source |

Unrelated existing warnings (not UI-3):

- Create Subscription Plan ~10.53 kB
- Permission Catalog ~11.71 kB
- Login ~7.65 kB

```text
Build: PASS (exit 0)
Create Tenant Style Warning: NONE
Drafts Style Warning: NONE
Result Style Warning: NONE
```

Style-budget planning rule for UI-3: reuse tokens/primitives, extract SCSS carefully, delete dead selectors, **never raise Angular budgets**.

---

## 26. Responsive Audit

Source-level breakpoints only (no authenticated multi-viewport walkthrough in this planning task).

| Viewport | Create | Drafts | Result |
| --- | --- | --- | --- |
| 1440 | Usable; sticky footer assumes sidebar `left: 16.5rem` | Table OK | 4-col steps / 3-col grid |
| 1280 | Similar | Table OK | Similar |
| 1024 | `@media 960` collapses grids; footer `left:0` | Horizontal table scroll | `@media 900` 2-col |
| 768 | Stepper wraps; footer crowded (Back/Save/Next) | Table cramped | `@media 650` stacks |

Issues to plan:

- Sticky footer action crowding on mobile
- Stepper wrapping without compact mode
- Drafts table overflow
- Result steps already have mobile left-border variant (good baseline)

```text
Responsive Readiness: PARTIAL
```

---

## 27. Accessibility Audit

| Area | Current | Modernization need |
| --- | --- | --- |
| Heading hierarchy | h1 + step h2 mostly OK | Use PageHeader consistently |
| Stepper semantics | `<ol aria-label>` but not interactive / no current announcement beyond class | Add `aria-current="step"`; announce step changes |
| Form labels | Native label wrappers | Prefer FormField + required indicators |
| Validation association | Often summary/toast; limited `aria-describedby` | Field-level association |
| Keyboard | Buttons OK; plan Select buttons OK | Focus first invalid on Next fail; focus step content on change |
| Dialogs | native `confirm` / no discard dialog | ConfirmationDialog |
| Progress | Result steps color-heavy | Keep text statuses (already present) |
| Live regions | Some `aria-live` / `role=alert` | Preserve and extend for save state |

```text
Accessibility Readiness: PARTIAL
```

---

## 28. Duplicate Request / Idempotency Review

| Concern | Assessment |
| --- | --- |
| Double-click finalize | `isSaving` gate + reused `finalizationKey` | **PARTIAL/PASS** |
| Backend idempotency | Required header; replay supported | **PASS** |
| Draft overlapping saves | Blocked while `isSaving` | **PASS** |
| Result polling | 5s interval; projections each tick | **LOW–MEDIUM** duplicate GET risk |
| Legacy createTenant POST | Unused by wizard | Do not reintroduce in UI-3 |

```text
Duplicate Submission Protection: PARTIAL
Idempotency Readiness: PASS (finalize/resend paths)
Duplicate API Request Risk: MEDIUM (polling/projections)
```

---

## 29. Loading / Error / Empty Architecture

| Scenario | Current | Target |
| --- | --- | --- |
| Options load | Text muted line | Section LoadingSkeleton |
| Draft list load | Text | LoadingSkeleton table |
| Operation load | Spinner text | LoadingSkeleton + status |
| Save draft | Footer save-state | Button loading + aria-live |
| Submit | Button label Creating… | Button loading; disable primary |
| Field/server errors | Toast + some field mapping | FormField + section/page ErrorState |
| No drafts | Text empty | EmptyState + CTA Start new tenant |
| No plans | Empty plan grid (implicit) | EmptyState “No active plans” |

---

## 30. Frontend Test Inventory

| Page / Area | Coverage | Quality |
| --- | --- | --- |
| Create Tenant | Strong durable-onboarding suite (steps, save, finalize idempotency, payload) | **STRONG** |
| Create validators/mapper/API | Specs present | **ADEQUATE–STRONG** |
| Result page | Lifecycle honesty + permission gating tests | **ADEQUATE** |
| Drafts page | **No dedicated spec** | **NONE** |

Overall:

```text
Frontend Test Coverage: ADEQUATE
```

---

## 31. Backend Test / Contract Coverage

Ran filtered unit tests on backend worktree:

```text
dotnet test --filter "FullyQualifiedName~TenantOnboarding|FullyQualifiedName~PlatformTenantWizard"
Passed: 34, Failed: 0
```

Also present (not all executed in this audit): integration outbox worker tests, finalize default settings tests, API tenant controller tests.

```text
Backend Contract/Test Coverage: ADEQUATE
Backend Build: Not full-solution build; relevant unit tests PASS
```

---

## 32. UI-3 Risk Register

| Priority | Risk | Evidence |
| --- | --- | --- |
| P0 | Duplicate tenant creation | Mitigated by finalize idempotency + versioning; preserve |
| P0 | False invitation/payment success messaging | Result currently honest; must preserve |
| P1 | Draft resume incomplete (addons) | `applyDraftPayload` omits addons |
| P1 | Misleading billingStatus/subscriptionStatus UI fields not in durable payload | FE form vs BE MapCreateRequest |
| P1 | Discard without confirmation | Drafts page |
| P1 | FE route permission vs BE operation view permission mismatch | create vs view |
| P2 | Style budget regression during modernization | Create currently under warning — easy to break |
| P2 | Sticky footer / responsive complexity | hardcoded sidebar offset |
| P2 | Polling projection churn | 5s + billing/tenant fetches |
| P3 | Step key vs label mismatch | maintainability |
| P3 | Copy/polish | Drafts sparse UI |

---

## 33. Findings

### F-SA-UI3-P-001 — Create Tenant bypasses UI-1 primitives

1. **ID:** F-SA-UI3-P-001  
2. **Severity:** Medium  
3. **Page:** Create Tenant  
4. **Layer:** Frontend UI  
5. **Current Behavior:** Custom heading, `.btn`, raw inputs, custom toast  
6. **Expected Modernization Target:** PageHeader + Button + FormField + tokens  
7. **Evidence:** `platform-create-tenant-page.ts` imports only Forms modules  
8. **Backend/Data Support:** SUPPORTED WITH FRONTEND REFACTOR ONLY  
9. **UX Impact:** Inconsistent Super Admin experience vs UI-2  
10. **Business Impact:** Low (no contract change)  
11. **Implementation Risk:** Medium (large template)  
12. **Blocking UI-3 Implementation:** NO  
13. **Recommendation:** Primary UI-3A scope  
14. **Confidence:** High  

### F-SA-UI3-P-002 — Drafts page is legacy minimal UI

1. **ID:** F-SA-UI3-P-002  
2. **Severity:** Medium  
3. **Page:** Drafts  
4. **Layer:** Frontend UI  
5. **Current Behavior:** Inline header/table/text empty states  
6. **Expected:** PageHeader, DataTable pattern, EmptyState, LoadingSkeleton, StatusBadge  
7. **Evidence:** `platform-tenant-onboarding-drafts-page.ts`  
8. **Support:** SUPPORTED NOW  
9. **UX Impact:** High visual debt  
10. **Business Impact:** Low  
11. **Risk:** Low  
12. **Blocking:** NO  
13. **Recommendation:** UI-3B  
14. **Confidence:** High  

### F-SA-UI3-P-003 — Discard draft has no confirmation

1. **ID:** F-SA-UI3-P-003  
2. **Severity:** High  
3. **Page:** Drafts  
4. **Layer:** UX / Frontend  
5. **Current:** Immediate DELETE  
6. **Expected:** ConfirmationDialog destructive confirm  
7. **Evidence:** `discard()` without dialog  
8. **Support:** SUPPORTED NOW  
9. **UX Impact:** Accidental irreversible abandon  
10. **Business Impact:** Medium (lost sales-assisted draft work)  
11. **Risk:** Low to implement  
12. **Blocking:** NO  
13. **Recommendation:** Must include in UI-3B  
14. **Confidence:** High  

### F-SA-UI3-P-004 — Draft hydration omits addons

1. **ID:** F-SA-UI3-P-004  
2. **Severity:** High  
3. **Page:** Create resume  
4. **Layer:** Frontend state  
5. **Current:** `applyDraftPayload` does not restore addon quantities  
6. **Expected:** Full payload round-trip including addons  
7. **Evidence:** save writes addons; resume ignores  
8. **Support:** SUPPORTED WITH FRONTEND REFACTOR ONLY  
9. **UX Impact:** Silent data loss on resume  
10. **Business Impact:** Medium (wrong limits/pricing intent)  
11. **Risk:** Medium  
12. **Blocking:** NO (must fix in UI-3A; do not ship modernization without it)  
13. **Recommendation:** Treat as UI-3A contract preservation item  
14. **Confidence:** High  

### F-SA-UI3-P-005 — Billing Status / Subscription Status UI fields not durable

1. **ID:** F-SA-UI3-P-005  
2. **Severity:** High  
3. **Page:** Create Billing step + Review  
4. **Layer:** FE/BE contract alignment  
5. **Current:** Required in FE forms; omitted from onboarding payload; BE derives from subscriptionType  
6. **Expected:** Either remove/disable misleading fields or show read-only derived values  
7. **Evidence:** `buildOnboardingPayload` vs `MapCreateRequest`  
8. **Support:** BUSINESS DECISION REQUIRED (presentation) / backend already authoritative  
9. **UX Impact:** Operators believe they set billingStatus  
10. **Business Impact:** Medium (operator confusion; not silent wrong API write of those fields)  
11. **Risk:** Medium if changed incorrectly  
12. **Blocking:** NO  
13. **Recommendation:** In UI-3A, present derived semantics honestly; do not invent new backend fields  
14. **Confidence:** High  

### F-SA-UI3-P-006 — createDraftInvoice checkbox not authoritative

1. **ID:** F-SA-UI3-P-006  
2. **Severity:** Medium  
3. **Page:** Create Billing  
4. **Layer:** FE/BE  
5. **Current:** Checkbox saved only in local form; BE sets invoice from PAID  
6. **Expected:** Remove or make informational for PAID  
7. **Evidence:** MapCreateRequest `CreateDraftInvoice = plan.SubscriptionType == "PAID"`  
8. **Support:** SUPPORTED NOW (backend)  
9. **UX Impact:** False control affordance  
10. **Business Impact:** Low–Medium  
11. **Risk:** Low  
12. **Blocking:** NO  
13. **Recommendation:** Honest UI in UI-3A  
14. **Confidence:** High  

### F-SA-UI3-P-007 — Result page legacy controls + native confirm

1. **ID:** F-SA-UI3-P-007  
2. **Severity:** Medium  
3. **Page:** Result  
4. **Layer:** Frontend UI / a11y  
5. **Current:** `.button` classes, `confirm()`  
6. **Expected:** Button + ConfirmationDialog; keep lifecycle honesty  
7. **Evidence:** result TS/HTML/SCSS  
8. **Support:** SUPPORTED NOW  
9. **UX Impact:** Medium  
10. **Business Impact:** Low  
11. **Risk:** Medium (must not alter stage semantics)  
12. **Blocking:** NO  
13. **Recommendation:** UI-3C  
14. **Confidence:** High  

### F-SA-UI3-P-008 — Operation GET permission vs route permission mismatch

1. **ID:** F-SA-UI3-P-008  
2. **Severity:** Medium  
3. **Page:** Result  
4. **Layer:** AuthZ  
5. **Current:** Route `tenants.create`; API `tenants.view`  
6. **Expected:** Document; optionally align route `alternatePermissions` later without weakening BE  
7. **Evidence:** routes + `GetOperationAsync`  
8. **Support:** BACKEND DATA/CONTRACT as-is  
9. **UX Impact:** Possible empty/error result for create-only actor  
10. **Business Impact:** Low for typical Super Admin  
11. **Risk:** High if “fixed” by loosening BE  
12. **Blocking:** NO  
13. **Recommendation:** Preserve BE; FE may show clearer permission error  
14. **Confidence:** High  

### F-SA-UI3-P-009 — No unsaved-change guard on Create

1. **ID:** F-SA-UI3-P-009  
2. **Severity:** Medium  
3. **Page:** Create  
4. **Layer:** UX  
5. **Current:** Navigate away can lose unsaved local state  
6. **Expected:** Optional canDeactivate after business decision; prefer Save Draft education first  
7. **Evidence:** No CanDeactivate  
8. **Support:** FRONTEND ONLY  
9. **UX Impact:** Medium  
10. **Business Impact:** Low–Medium  
11. **Risk:** Medium (annoying false positives)  
12. **Blocking:** NO  
13. **Recommendation:** Defer unless product insists; keep Save Draft prominent  
14. **Confidence:** High  

### F-SA-UI3-P-010 — Step key naming vs labels mismatch

1. **ID:** F-SA-UI3-P-010  
2. **Severity:** Low  
3. **Page:** Create  
4. **Layer:** Maintainability  
5. **Current:** `plan-selection` is contact step; `limits-addons` is plan step  
6. **Expected:** Rename keys carefully with test updates OR keep keys and fix labels only  
7. **Evidence:** steps array vs `@case` content  
8. **Support:** FE only  
9. **UX Impact:** Low for users; high for developers  
10. **Business Impact:** None  
11. **Risk:** Medium if renamed carelessly (step index mapping)  
12. **Blocking:** NO  
13. **Recommendation:** Prefer keep backend step numbers; rename keys only with exhaustive tests  
14. **Confidence:** High  

### F-SA-UI3-P-011 — Drafts page has no unit tests

1. **ID:** F-SA-UI3-P-011  
2. **Severity:** Medium  
3. **Page:** Drafts  
4. **Layer:** Test  
5. **Current:** No spec file  
6. **Expected:** List/load/error/empty/discard/resume tests  
7. **Evidence:** glob shows only `.ts` page file  
8. **Support:** N/A  
9. **UX Impact:** Indirect  
10. **Business Impact:** Regression risk on discard  
11. **Risk:** Low  
12. **Blocking:** NO  
13. **Recommendation:** Add in UI-3B  
14. **Confidence:** High  

### F-SA-UI3-P-012 — Known npm ci tooling gap remains

1. **ID:** F-SA-UI3-P-012  
2. **Severity:** Low (tooling)  
3. **Page:** N/A  
4. **Layer:** Tooling  
5. **Current:** `npm ci` fails lock sync (`@emnapi/*`) — same class as F-SA-UI2C-M-001  
6. **Expected:** Tracked known issue; temporary `npm install` for validation  
7. **Evidence:** ui3-npm-ci.log  
8. **Support:** N/A  
9. **UX Impact:** None  
10. **Business Impact:** None  
11. **Risk:** CI friction  
12. **Blocking:** NO  
13. **Recommendation:** Do not “fix” in UI-3; continue documented fallback  
14. **Confidence:** High  

### F-SA-UI3-P-013 — FE businessType required vs step-issue collector gap

1. **ID:** F-SA-UI3-P-013  
2. **Severity:** Medium  
3. **Page:** Create step 1  
4. **Layer:** Validation  
5. **Current:** `businessType` has `Validators.required` but `collectStepIssues('business-info')` does not list it; backend requires it  
6. **Expected:** Align step gating with BE required basic details  
7. **Evidence:** form validators vs `collectStepIssues` vs evaluator  
8. **Support:** SUPPORTED NOW  
9. **UX Impact:** User may advance inconsistently depending on path  
10. **Business Impact:** Medium (finalize failure later)  
11. **Risk:** Low  
12. **Blocking:** NO  
13. **Recommendation:** Fix during UI-3A validation pass  
14. **Confidence:** High  

---

## 34. Modern Target — Create Tenant

```text
PageHeader (Create Tenant / Resume context + draft status chip)
↓
Wizard Stepper (desktop full / compact ≤1024 / stacked ≤768)
↓
Current Step Content (FormField + plan/feature interaction cards only where selection needs cards)
↓
Inline field validation + optional step summary
↓
Wizard Footer
  Secondary: Back
  Secondary: Save Draft (+ aria-live saved/failed)
  Primary: Continue OR Create Tenant
  Tertiary: optional Cancel → tenants list (if product wants; currently Back-at-step0)
```

Preserve: 7-step order, durable draft APIs, finalize idempotency, navigation to operations page.

Honest billing step: show subscription type as primary commercial control; derived invoice/payment implications as read-only help text.

---

## 35. Modern Target — Drafts

```text
PageHeader (title + Start new tenant Button)
↓
(No FilterBar unless product adds server filters — not supported usefully today)
↓
DataTable pattern
  columns: Tenant, Code, Step, Progress, Status, Updated, Expires, Actions
↓
Row actions: Resume (primary), Discard (destructive → ConfirmationDialog)
↓
EmptyState / LoadingSkeleton / ErrorState
```

No pagination unless/until backend adds it (list returns full mine set).

---

## 36. Modern Target — Result / Operation

```text
PageHeader (breadcrumb Tenants / Onboarding status + Refresh)
↓
Operation status summary (StatusBadge + honest title)
↓
Lifecycle progress (4 stages backend actually exposes via statuses — not invented sub-stages)
↓
Summary cards: Tenant / Payment / Invitation
↓
Next actions (permission + eligibility gated)
  Primary: Activate OR Open Tenant OR Open Payment Review (context-dependent)
  Secondary: Resend notification / Resend invitation / Retry / Back to Tenants
```

Do not claim email delivery success from HTTP 200 alone.

---

## 37. Recommended UI-3 Split / Implementation Order

```text
UI-3A — Create Tenant Wizard
UI-3B — Onboarding Drafts
UI-3C — Onboarding Result / Operation Status
```

**Order:** `3A → 3B → 3C`

Why:

1. Create is the contract core (fields, draft save, finalize, idempotency, hydration fixes).  
2. Drafts is a thin list over the same draft APIs; benefits after wizard UX stabilizes.  
3. Result already has stronger semantics/tests; modernize last to avoid lifecycle regressions while create is in flux.

---

## 38. Shared Foundation Requirement

```text
Shared Foundation First: NO
```

Reuse existing UI-1 primitives. Keep stepper/footer page-local in UI-3A.

---

## 39. Regression Boundaries

UI-3 must not regress closed UI-2 / shell:

| Boundary | Requirement |
| --- | --- |
| Dashboard | Visual/API behavior unchanged |
| Tenant List | Create CTA still routes to `/admin/tenants/create`; list refresh after create still works |
| Tenant Detail | Deep link `/admin/tenants/:tenantId` remains valid once tenantId exists |
| Global shell | Sidebar/header/tokens unchanged except consumption |
| Angular budgets | Do not raise |
| Backend contracts | No API/schema/business semantic changes in UI-3 |

---

## 40. UI-3 Implementation Readiness

Checklist:

| Criterion | Status |
| --- | --- |
| Routes identified | YES |
| Wizard steps understood | YES |
| Field/API mapping understood | YES |
| Draft flow understood | YES |
| Operation/result understood | YES |
| Backend contracts traced | YES |
| Permissions traced | YES (partial mismatch documented) |
| Lifecycle understood | YES |
| Major data gaps identified | YES (hydration/honest fields) |
| Modern targets defined | YES |
| Split/order defined | YES |
| Test plan defined | YES |
| Unresolved architecture blocker | **NONE** |

```text
UI-3 Implementation Readiness: READY WITH GAPS
```

---

## 41. Final Verdict

```text
SUPER ADMIN UI-3 READY WITH NON-BLOCKING GAPS — CONTROLLED IMPLEMENTATION MAY BEGIN
```

---

## 42. Required Next Action

Begin only the first approved UI-3 implementation slice (**UI-3A — Create Tenant Wizard**) from this planning audit. Use latest Platform Admin `origin/main`, create dedicated feature branch `feature/super-admin-ui3-create-tenant`, preserve all existing backend/business contracts (including finalize idempotency and honest lifecycle messaging), fix draft addon hydration and misleading non-persisted billing controls as contract-preservation items, keep component styles ≤6 kB, run build/tests (with known npm ci fallback), and require independent read-only verification before merge. Do not start UI-3B/UI-3C until UI-3A is verified.

---

## Appendix A — Sales-Assisted Onboarding Alignment

| Phase | Classification |
| --- | --- |
| Client discussion | OUTSIDE UI-3 |
| Module demo | OUTSIDE UI-3 |
| Subscription plan selection | SUPPORTED |
| Optional tenant overrides (limits/features/addons) | PARTIAL (settings overrides not in create) |
| Super Admin creates tenant | SUPPORTED |
| Plan/config provisioned | SUPPORTED |
| Manual payment confirmation | PARTIAL / largely OUTSIDE wizard (Result + Billing) |
| Activation | PARTIAL (Result action) |
| First Tenant Admin invitation | PARTIAL (collect in wizard; send/resend post-activation) |
| Tenant Admin configures business | OUTSIDE UI-3 |

---

## Appendix B — Build / Test Baseline Evidence

### Platform Admin

```text
npm ci → FAIL (F-SA-UI2C-M-001 / lock sync @emnapi/*)
npm install --no-fund --no-audit → PASS
npm run build → PASS (exit 0)
  UI-3 pages: no component style warnings
  Unrelated warnings: subscription-plan-create, permission-catalog, login
npm run test -- --watch=false → PASS (69 files, 499 tests)
```

### Backend

```text
Filtered unit tests TenantOnboarding|PlatformTenantWizard → 34 passed
```

---

## Appendix C — Future Branch Names (do not create now)

```text
feature/super-admin-ui3-create-tenant
feature/super-admin-ui3-onboarding-drafts
feature/super-admin-ui3-onboarding-result
```

---

## Appendix D — Future Test Plan (implementation)

- Step navigation + validation gating (incl. businessType)
- Save Draft create/patch/version/If-Match
- Resume hydration including addons
- Finalize idempotency key reuse
- Duplicate submit disabled while saving
- Payload mapping vs BE evaluator requirements
- Loading/error/empty states with shared primitives
- Permission gating on Result actions
- Discard confirmation + API
- Operation polling stop conditions
- Success/failure copy honesty regressions
- Style budget ≤6 kB per modernized component

---

## Appendix E — Business Contract Preservation Matrix

| Behavior | Existing Contract | UI-3 Must Preserve |
| --- | --- | --- |
| Tenant creation | Finalize → CreateTenantAsync | Yes |
| Plan assignment | payload.plan.subscriptionPlanId | Yes |
| Entitlement provisioning | featureIds subset of plan | Yes |
| Tenant defaults | BE finalize defaults | Yes (hidden) |
| Payment state | Operation + billing projection | Yes; no false paid |
| Activation | Explicit activate API | Yes |
| Tenant Admin bootstrap | Admin on create + SendInvite flag | Yes |
| Invitation | Status + resend; ACS async | Yes; no delivery claim |
| Draft resume | GET draft + versioning | Yes; fix FE hydration |
| Operation status | GET + poll statuses | Yes |

---

**End of planning audit.**
