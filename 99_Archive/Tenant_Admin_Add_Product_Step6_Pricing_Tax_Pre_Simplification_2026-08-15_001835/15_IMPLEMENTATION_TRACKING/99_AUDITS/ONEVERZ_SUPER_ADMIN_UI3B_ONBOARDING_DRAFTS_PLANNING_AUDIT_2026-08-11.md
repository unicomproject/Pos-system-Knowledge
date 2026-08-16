# OneVerz Super Admin UI-3B — Onboarding Drafts Planning Audit

**Date:** 2026-08-11  
**Audit type:** Independent read-only planning audit (pre–Visual Direction)  
**Slice:** UI-3B — Tenant Onboarding Drafts (`/admin/tenants/onboarding/drafts`)  
**Roles:** SaaS Product Architect · Angular Frontend Auditor · .NET Contract Auditor · Persistence Auditor · UI/UX · Design-System · Accessibility · Responsive · API/Integration · Test Coverage · Git/Scope · Second Brain Architecture  

**Verdict:**

```text
SUPER ADMIN UI-3B READY WITH NON-BLOCKING GAPS — PREMIUM BLUE VISUAL DIRECTION MAY BEGIN
```

---

## 1. Executive Summary

UI-3B has a **live, durable backend draft-list contract** and a **minimal legacy Angular list page** on Platform Admin `main`. Resume navigates into the closed **UI-3A** Premium Blue wizard. Soft discard exists as backend `DELETE` → status `discarded` with `If-Match` concurrency.

The current UI is a plain admin table (inline template/styles, no UI-1 primitives, no sidebar entry, no confirmation on Discard, no search/filter/pagination UX). Backend list supports only `mine` (default true), hard-caps at **100** rows, fixed sort `UpdatedAt DESC`, and returns summaries without full payload. That is **enough** to design and later implement a premium operational drafts workspace without inventing APIs first.

Non-blocking gaps (navigation discoverability, ConfirmationDialog, UI-1 reuse, optional pagination/search enhancements, expiry enforcement, thin tests) should inform Visual Direction and implementation scope — they do **not** block starting the Premium Blue Visual Direction Specification (prefer HTML prototype first).

**UI-3B Implementation Authorized:** NO  
**UI-3C Authorized:** NO  

---

## 2. Prerequisite Check — UI-3A Final Closure

| Check | Result |
| --- | --- |
| Second Brain `origin/main` | `b0c4deff018dff27942e72fcae213bc0c6414569` |
| Merge evidence | PR #66 `docs/super-admin-ui3a-final-closure` |
| File on main | `15_IMPLEMENTATION_TRACKING/ONEVERZ_SUPER_ADMIN_UI3A_FINAL_CLOSURE_2026-08-10.md` |
| Closure commit ancestor | `7c4f21ab9ecb7321e45889d97395e3b4db10f15b` → YES |
| Platform Admin contains UI-3A source | `d7d06ae…` on `origin/main` |

**UI-3A Final Closure Integrated:** YES  

---

## 3. Repository Baselines

| Repo | `origin/main` |
| --- | --- |
| Platform Admin | `d7d06ae94cf7dbd73ed6f6c24ed1973f64b0fac1` |
| Backend | `6bf3d3c887bda18fedeeb7344e08ecf41637cdd0` |
| Second Brain | `b0c4deff018dff27942e72fcae213bc0c6414569` |

Audit branch (this report): `audit/super-admin-ui3b-onboarding-drafts-planning-2026-08-11` from SB `origin/main`.

No Platform Admin or Backend source was modified.

---

## 4. UI-3B Scope

**In scope (planning):** operational management of **saved onboarding drafts** at `/admin/tenants/onboarding/drafts`.

**Out of scope:**

- UI-3A Create/Resume wizard surfaces (`/admin/tenants/create`, `/admin/tenants/onboarding/:draftId` modernization)
- UI-3C operation status (`/admin/tenants/onboarding/operations/:operationId`)
- Dashboard / Tenant List / Detail / Subscriptions / Billing / Users / Permissions / Settings redesign
- New generic draft framework
- DB migrations / API redesign in this audit

---

## 5. Route / Navigation

| Item | Actual |
| --- | --- |
| Route | `/admin/tenants/onboarding/drafts` (`tenants/onboarding/drafts` under `/admin`) |
| Component | `PlatformTenantOnboardingDraftsPage` (lazy `loadComponent`) |
| Guard | `authGuard` + `permissionGuard`; `requiredPermission: platform.tenants.create` |
| Parent Layout | `MainLayout` (sidebar + header + outlet) |
| Navigation Entry | **NONE** in `menu.config.ts` (Tenants → `/admin/tenants` only; `hasSubmenu: true` with no children) |

Route is registered **before** `:draftId` so `drafts` is not captured as an id.

**Navigation Entry:** FAIL (route exists; undiscoverable from shell)  
**Guard / Authorization:** PASS (route-level create permission)

---

## 6. Frontend File Inventory

| File | Purpose | Active? |
| --- | --- | --- |
| `platform-tenant-onboarding-drafts-page.ts` | Page (inline template + styles) | YES |
| `platform-tenant-onboarding.model.ts` | `TenantOnboardingDraftSummary` + full draft types | YES |
| `platform-tenant-api.service.ts` | `listOnboardingDrafts`, `discardOnboardingDraft`, get/save/finalize | YES |
| `admin.routes.ts` | Route registration | YES |
| `permission-keys.ts` / `permission.guard.ts` | Authz | YES |
| `menu.config.ts` | Shell nav (missing drafts link) | YES |
| `confirmation-dialog/*` | Shared primitive (unused by drafts) | Available |
| `platform-create-tenant-page.*` | UI-3A resume target | YES (out of UI-3B impl scope) |
| `platform-tenant-onboarding-drafts-page.spec.ts` | — | **MISSING** |
| Separate `.html` / `.scss` | — | **NONE** |

---

## 7. Current UI / UX Assessment

| Score | Rating |
| --- | --- |
| Visual Quality | **4/10** |
| UX Quality | **5/10** |
| Modern SaaS Fit | **4/10** |

Character: **legacy CRUD / plain admin table**, not premium enterprise SaaS. Functional for resume/discard; weak hierarchy, raw status strings, Discard competing with Resume, no premium surfaces.

Composition that exists today:

- Custom header (H1 + subtitle) — not `PageHeader`
- Primary CTA link “Start new tenant”
- Plain loading text / empty div / alert error
- Native HTML table + `<progress>`
- Row actions: Resume link + Discard button
- No search, filters, sort controls, pagination, refresh control, StatusBadge, ConfirmationDialog

---

## 8. UI-1 Primitive Reuse

| Primitive | Expected Reuse | Current |
| --- | --- | --- |
| PageHeader | Yes | No |
| Button | Yes | No (raw `<a>` / `<button>`) |
| StatusBadge | Yes | No (raw `status` string) |
| DataTable | Preferred if exists / consistent table pattern | Native `<table>` |
| FilterBar | If filters supported | No |
| EmptyState | Yes | Plain div |
| ErrorState | Yes | Plain alert paragraph |
| LoadingSkeleton | Yes | Text line |
| ConfirmationDialog | Yes for Discard | **Not used** |
| FormField | N/A for list | N/A |

**UI-1 Primitive Reuse:** FAIL  
**Competing Local UI System:** HIGH (inline styles, hard-coded `#0b5cff`, local table card)

---

## 9. Style-Budget Assessment

| Item | Value |
| --- | --- |
| Angular `anyComponentStyle` warning | **6 kB** (unchanged) |
| Angular `anyComponentStyle` error | **12 kB** (unchanged) |
| Drafts inline styles | **~582 B (~0.57 kB)** |
| Drafts Style Warning | **NONE** |
| Angular Style Budget | **UNCHANGED** |

Pre-existing unrelated build warnings: Login ~7.65 kB; Create Subscription Plan ~10.53 kB; Permission Catalog ~11.71 kB.

---

## 10. Draft List Data Contract (Frontend)

`TenantOnboardingDraftSummary`:

| Frontend Field | Type | Source | Displayed? |
| --- | --- | --- | --- |
| `id` | string | API | Actions only (route) |
| `displayName` | string \| null | Summary (from payload basic details) | YES (primary) |
| `tenantCode` | string \| null | Summary | YES (secondary) |
| `status` | string | Entity | YES (raw) |
| `currentStep` | number | Entity | YES (`X of 7`) |
| `progressPercent` | number | Entity | YES (`<progress>` + %) |
| `ownerPlatformUserId` | string | Entity | NO |
| `updatedAt` | string \| null | Entity | YES (“Last updated”) |
| `expiresAt` | string | Entity | NO |
| `version` | number | Entity | Discard If-Match only |

Backend also returns `totalCount` on list wrapper; frontend maps **`items` only** and discards `totalCount`.

---

## 11. Backend Endpoint Inventory

Base: `api/v1/platform-admin/tenant-onboarding`  
Controller auth: `[Authorize(Policy = "PlatformOnly")]` — fine-grained checks in service.

| Purpose | Method | Route | Permission (service) | Handler |
| --- | --- | --- | --- | --- |
| Create options | GET | `create-options` | via tenant service | Controller → tenant service |
| Create draft | POST | `drafts` | `tenants.create` | `CreateDraftAsync` |
| **List drafts** | GET | `drafts?mine=` | `tenants.create`; `mine=false` needs `tenants.update` | `ListDraftsAsync` |
| Get draft | GET | `drafts/{id}` | owner+create **or** update | `GetDraftAsync` (+ ETag) |
| Save draft | PATCH | `drafts/{id}` | access + If-Match | `UpdateDraftAsync` |
| **Discard** | DELETE | `drafts/{id}` | access + If-Match | `DiscardDraftAsync` |
| Validate | POST | `drafts/{id}/validate` | access | `ValidateDraftAsync` |
| Finalize | POST | `drafts/{id}/finalize` | access + If-Match + Idempotency-Key | `FinalizeAsync` |
| Get operation | GET | `operations/{id}` | `tenants.view` | `GetOperationAsync` |
| Retry operation | POST | `operations/{id}/retry` | update/billing | `RetryOperationAsync` |
| Resend invitation | POST | `tenants/{id}/invitation/resend` | update + Idempotency-Key | `ResendInvitationAsync` |

**Dedicated Draft List Endpoint:** YES  

**Draft List API:** `GET /api/v1/platform-admin/tenant-onboarding/drafts?mine={bool}`  

---

## 12. Search / Filter / Sort / Pagination

| Capability | Frontend | Backend |
| --- | --- | --- |
| Search | NONE | **NOT SUPPORTED** |
| Filters (status/step/owner/date) | NONE | Hard-coded list filter: `in_progress` \|\| `finalizing` only |
| Sorting | NONE (server order only) | Fixed `UpdatedAt DESC`, `Id DESC` |
| Pagination | NONE | **NOT SUPPORTED** — `Take(100)`; `TotalCount = items.Length` (not true total) |
| `mine` | Always default `true` (no UI) | Supported |

**Search:** NOT SUPPORTED  
**Filters:** PARTIAL (implicit active-only server filter; no UI)  
**Sorting:** PARTIAL (server fixed; no client control)  
**Pagination:** NOT SUPPORTED (hard cap 100)

---

## 13. Draft Status Model

| Status | Source | Meaning | Terminal? |
| --- | --- | --- | --- |
| `in_progress` | Domain/DB | Editable active draft | No |
| `finalizing` | Domain | Transient during finalize TX | Transient |
| `completed` | Domain | Successfully finalized; kept; linked to operation | Yes |
| `discarded` | Domain | Soft abandon via DELETE | Yes |
| `expired` | DB constraint only | Intended expiry | **Never written in application code** |

**Draft Status Model:** CLEAR (with unused `expired`)

List visibility: only `in_progress` + `finalizing`.

---

## 14. Draft Progress / Current Step

| Field | Source | Meaning |
| --- | --- | --- |
| `currentStep` | Entity (`short` 1–7) | Wizard step pointer (client-supplied on save) |
| `completedSteps` / mask | Entity bitmask → API int[] on full draft | Which of 7 steps complete |
| `progressPercent` | Entity | `floor(100 * completedSteps / 7)` from evaluator |

**Constraint for Visual Direction:** wizard setup progress ≠ provisioning operation progress (UI-3C).

**Draft Progress Model:** CLEAR  

---

## 15. Resume Draft Journey

```text
Drafts page → Resume link → /admin/tenants/onboarding/:draftId
→ PlatformCreateTenantPage.loadDraft(id) → GET draft → hydrate UI-3A wizard
```

- Resume = **navigation only** (no lock/status mutation API).
- Continuity into closed Premium Blue UI-3A: **PASS**.

| Draft State | Resume Allowed? | Evidence |
| --- | --- | --- |
| `in_progress` | YES | Listed; GET allowed; wizard editable |
| `finalizing` | PARTIAL | Listed; GET may succeed; Discard/Update blocked (`EnsureEditable`); UX confusing |
| `completed` / `discarded` | NO (not listed) | Status filter; Get may 404 for unauthorized/not found patterns |

**Resume Draft Supported:** YES  
**Resume Route:** PASS  
**UI-3B → UI-3A Resume Continuity:** PASS  

---

## 16. Delete / Abandon Draft Journey

Canonical backend term: **Discard** (soft status → `discarded`), not hard delete.

| Item | Actual |
| --- | --- |
| Method | DELETE |
| Route | `/drafts/{draftId}` |
| Headers | `If-Match: "{version}"` |
| Soft/hard | Soft (`discarded`) |
| Idempotency | Concurrency via version; discarded re-entry returns early on entity |
| UI confirmation | **NONE** — immediate click |
| Post-success | Frontend reloads list |

**Delete/Abandon Draft:** SUPPORTED  
**Canonical Destructive Action:** Discard  
**Confirmation:** NOT SUPPORTED (required for premium UX)

---

## 17. Draft Expiry

- `expiresAt` set to UtcNow+**30 days** on create and **sliding** on each update.
- No worker marks `expired`; list does not filter by `ExpiresAt`.
- Field exists on summary but UI does not show it.

**Draft Expiry:** PARTIAL / effectively **NOT SUPPORTED** as enforced lifecycle (**UNKNOWN** product policy beyond TTL field). Planning classification: **SUPPORTED** field / **NOT SUPPORTED** enforcement → report as **PARTIAL** in narrative; final response uses **SUPPORTED** for field presence with finding for enforcement gap → use **NOT SUPPORTED** for enforcement UX: **SUPPORTED** (field+TTL) with finding. Spec options: SUPPORTED / NOT SUPPORTED / UNKNOWN. Closest: **SUPPORTED** (TTL metadata exists) + finding that enforcement is missing.

Chosen final field: **SUPPORTED** (30-day sliding `expiresAt` persisted) with F-SA-UI3B-P-007 for non-enforcement.

---

## 18. Concurrency

- EF `version` concurrency token; ETag / If-Match on mutate.
- Conflicts → `concurrency_conflict` → HTTP **409**.
- Missing If-Match → **428**.

**Concurrency Protection:** PASS (backend); PARTIAL (frontend shows safe message, no specialized conflict UX)

Overall: **PASS** for platform integrity.

---

## 19. Ownership / Audit

| Concern | Actual |
| --- | --- |
| Owner | `ownerPlatformUserId` set at create |
| Updated by | `UpdatedByPlatformUserId` on mutate (not in summary DTO beyond owner) |
| List scope | Default mine; include-all needs `tenants.update` |
| Draft op audit events | **None** for create/list/get/patch/discard |
| Finalize audit | Wizard skips usual `tenant.created` platform audit when onboarding context present; history event carries draftId/operationId |

**Draft Ownership:** SUPPORTED (GUID; no display name join)  
**Audit Logging:** PARTIAL / FAIL for draft CRUD (final response: **PARTIAL**)

---

## 20. Permissions / Guards

| Action | Permission / Guard | Backend | Frontend |
| --- | --- | --- | --- |
| View list | `platform.tenants.create` | Service `TenantsCreate` | Route guard only |
| Resume | same create (route on `:draftId`) + access on GET | Owner+create or update | Route guard; no action-level |
| Discard | access + version | Owner+create or update | No confirm; no extra gate |
| Create new | create route | create | Header CTA link |

**Feature Gate:** None separate from Platform Admin permissions (no tenant feature entitlement for this page).

**Frontend Permission Enforcement:** PARTIAL (route only)  
**Backend Permission Enforcement:** PASS (service-layer)

---

## 21. Security / Sensitive Data

- List DTO: identity + progress + owner GUID + timestamps + version — **no** password/token/full payload/admin email.
- Full GET (UI-3A) includes PII — appropriate for resume, not for list.
- Draft ID enumeration: GET returns not_found when inaccessible (ownership/permission).
- Platform-only policy on controller.

**Sensitive Data Exposure:** NONE (list)

---

## 22. Billing / Non-Persisted State

| Field | Frontend State (UI-3A) | Persisted? | Safe in List? |
| --- | --- | --- | --- |
| Billing status / subscription status nuances | UI-3A forms | Partial / carry-forward UI-3A findings | **Do Not Show** until truthful |
| Payment secrets | N/A | No | Do Not Show |
| Plan id / type | In payload | Yes in full draft | Optional only if summary API exposes later |
| Progress % / step | Entity | Yes | Recommended |

Do not invent list billing columns from UI-3A non-persisted semantics.

---

## 23. Post-Submit Draft Lifecycle

On successful finalize:

- Draft row **retained**
- Status → `completed`
- `created_tenant_id` / `finalized_at` set
- Unique onboarding **operation** created (UI-3C)
- Draft **excluded** from active list filter

**Post-Submit Draft Lifecycle:** retained as `completed` + linked operation (not deleted)

---

## 24. UI-3B / UI-3C Boundary

| Slice | Owns |
| --- | --- |
| **UI-3B** | Active/saved drafts (`in_progress` / possibly `finalizing`) — resume / discard |
| **UI-3C** | Provisioning **operations** after submit |

**UI-3B / UI-3C Boundary:** CLEAR  

---

## 25. Empty / Loading / Error

| State | Current | Assessment |
| --- | --- | --- |
| Empty | “No active drafts.” + header CTA still visible | PARTIAL (no EmptyState primitive / illustration) |
| Loading | “Loading drafts...” | PARTIAL |
| Error | `role="alert"` via `ApiErrorService` | PARTIAL (can coexist with loading/table; success does not clear prior error) |
| Refresh | Implicit after discard; no manual refresh | PARTIAL |

---

## 26. Request Lifecycle / Duplicate Requests

| Trigger | Expected | Actual | Duplicate Risk |
| --- | --- | --- | --- |
| Initial load | 1× GET drafts | 1× GET (`mine=true`) | LOW |
| Search/Filter/Page | N/A | N/A | N/A |
| Resume | 0 on drafts page | Navigation only | LOW |
| Discard | 1× DELETE + 1× GET reload | Same | LOW |

**Duplicate API Request Risk:** LOW  
**List Performance Risk:** LOW–MEDIUM (≤100 rows; per-row JSON deserialize for name/code)  
**List Projection Efficiency:** PARTIAL (summary DTO good; still loads full entities + payload parse)

N+1 from UI: **NONE** (single list call).

---

## 27. Responsive Audit

Runtime (mocked list) on `d7d06ae` via Playwright:

| Width | Overflow | Notes |
| --- | --- | --- |
| 1440 | NONE | Usable table + header CTA |
| 1280 | NONE | Same |
| 1024 | NONE | Narrower; actions remain inline |
| 768 | NONE (page); local `.table-wrap{overflow:auto}` | Dense; Resume+Discard both visible; risk of cramped actions |

**Responsive Readiness:** PARTIAL  
**Horizontal Overflow:** NONE (page-level); intentional local table scroll possible  

Future Visual Direction should define compact column priority and secondary action menu at 768.

---

## 28. Accessibility Audit

| Check | Current |
| --- | --- |
| Single H1 | PASS |
| Table semantics | Basic `<table>` — PARTIAL (no caption) |
| Status not color-only | Raw text — PASS-ish |
| Discard without confirm | FAIL for destructive safety |
| Focus / keyboard | Links/buttons focusable — PARTIAL |
| Loading live region | `aria-live="polite"` — PASS |
| Error alert | `role="alert"` — PASS |
| Icon-only actions | N/A (text labels) |

**Accessibility Readiness:** PARTIAL  

---

## 29. Database / Index / Migration Assessment

- Table: `platform_tenant_onboarding_drafts`
- Indexes include `ix_onboarding_drafts_owner_status_updated` matching list pattern
- Normalized code/slug/domain columns exist but list uses payload JSON for display fields

**List Query Index Readiness:** PASS (for current mine/status/updated query)  
**DB Migration Required for UI-3B:** **NO** (core operational UI)  
Search-by-display-name at scale may later need projection/index — **not required** to start Visual Direction / FE modernization on current API.

---

## 30. Backend Change Assessment

**Backend Changes Required:** PARTIAL (enhancements), not a hard blocker

| Area | Need |
| --- | --- |
| List endpoint | Exists — sufficient |
| Search/filter | Optional enhancement |
| Pagination | Optional (true total + page) before large-volume ops |
| Resume | No API change (navigate) |
| Discard | Exists — add confirm UX only on FE |
| Permissions | Adequate |
| Concurrency | Adequate |
| Expiry worker | Optional product follow-up |
| `finalizing` list UX | Optional hide or disable Resume/Discard |

**Backend dependency decision:**  
`CURRENT BACKEND SUFFICIENT WITH NON-BLOCKING GAPS`

---

## 31. Frontend Change Assessment

**Frontend Changes Required:** YES

| Area | Need |
| --- | --- |
| Visual modernization | YES — Premium Blue operational workspace |
| State handling | YES — clear errors, action loading, optional mine toggle |
| API integration | Align with existing list/discard; optionally use `totalCount` if API improved |
| Responsive | YES |
| Accessibility | YES — ConfirmationDialog, table labeling |
| Tests | YES — currently NONE for page |
| Navigation | YES — discoverable entry under Tenants |

Complexity: **MEDIUM** (visual + behavior + tests; backend optional).

---

## 32. Shared Component / Design-System Assessment

Reuse: PageHeader, Button, StatusBadge, EmptyState, ErrorState, LoadingSkeleton, ConfirmationDialog; table pattern consistent with modernized lists.

Page-local only if needed: compact progress cell / row actions menu.

**Shared Foundation First:** NO  
**Do not build** GenericDraftManager / UniversalWorkflowTable.

Shared primitive change risk: prefer composition; avoid FormField/budget-sensitive shared changes for this list page.

---

## 33. Test Coverage

### Frontend

| Test File | Coverage |
| --- | --- |
| Drafts page spec | **NONE** |
| API list/discard specs | **NONE** |
| Route drafts assertion | **NONE** |
| Create-tenant specs | Resume/save/finalize only (UI-3A) |

**Frontend Test Coverage:** NONE (for UI-3B page) / THIN overall for drafts list surface  

### Backend

| Area | Coverage |
| --- | --- |
| Progress evaluator | 4 unit tests PASS (this audit) |
| List/discard/auth HTTP | **NONE found** |
| Outbox/fixtures | Use draft entities incidentally |

**Backend Contract/Test Coverage:** THIN  

Test integrity (`fit`/`fdescribe`/`xit`/`xdescribe`): none observed for drafts (no suite).

---

## 34. Current Build / Test Baseline

| Check | Result |
| --- | --- |
| npm ci | Known F-SA-UI2C-M-001 (program tooling); worktree deps reused |
| Build | **PASS** |
| Build warnings | Login 7.65; Create Subscription Plan 10.53; Permission Catalog 11.71 (PRE-EXISTING); **no drafts warning** |
| FE Tests | **512 passed / 0 failed / 0 skipped** |
| BE narrow | TenantOnboardingProgressEvaluator **4 passed** |

---

## 35. UX Journey / Operator Decisions

Current journey:

```text
Direct URL → list loads → identify by name/code → see step/progress/status/updated
→ Resume (navigate) or Discard (immediate mutate + reload)
```

Friction:

1. No shell navigation  
2. Destructive Discard without confirm  
3. Raw status / weak premium hierarchy  
4. Owner/expiry hidden  
5. `finalizing` may appear resumable  
6. Cap 100 without paging UX  

Operator questions support:

| Question | Supported by data? |
| --- | --- |
| What draft? | YES (name/code) |
| Last changed? | YES (`updatedAt`) |
| How far? | YES (step + %) |
| Resume? | YES (if in_progress) |
| Who created? | PARTIAL (GUID only, not shown) |
| Problem? | PARTIAL (status only; no warnings in summary) |
| Abandon? | YES (Discard) |

---

## 36. Information Hierarchy

| Tier | Data |
| --- | --- |
| Primary | Display name (fallback Untitled), Resume |
| Secondary | Tenant code, Step X of 7, setup progress %, updatedAt |
| Contextual | Status badge, expiresAt (if shown honestly), owner display name (if API enriched later) |
| Action-only | Discard (secondary/destructive), draft id |

### Recommended list content (actual data only)

| Data | Availability | Operator Value | Recommendation |
| --- | --- | --- | --- |
| displayName | Yes | High | Recommended |
| tenantCode | Yes | High | Recommended |
| currentStep | Yes | High | Recommended |
| progressPercent | Yes | Medium-High | Recommended (label as setup progress) |
| status | Yes | Medium | Recommended (badge; map labels) |
| updatedAt | Yes | High | Recommended |
| expiresAt | Yes | Medium | Optional |
| ownerPlatformUserId | Yes | Low without name | Optional / Do Not Show as raw GUID |
| version | Yes | Action-only | Do Not Show |
| billing fields | No in summary | Misleading | Do Not Show |
| admin email | Not in summary | Privacy | Do Not Show |

---

## 37. Recommended Page Pattern

**A. Premium Operational Table** (provisional)

Reasoning: draft decisions are resume/discard with moderate column density; Resume already opens full UI-3A wizard — a drawer adds little unique decision power.

**Separate Draft Detail Experience:** NOT REQUIRED  

**Master-detail / drawer:** not recommended unless Visual Direction proves a unique non-resume decision.

Density: **comfortable** operational.

---

## 38. Visual Direction Inputs

Must define (without cloning UI-3A hero/wizard/summary):

- Premium Blue operational identity continuity  
- Compact contextual header / PageHeader (not marketing hero)  
- Progress vs status differentiation  
- Row-action hierarchy (Resume primary; Discard secondary + confirm)  
- Empty state with Create Tenant CTA  
- Responsive column/action strategy (esp. 768)  
- StatusBadge semantics for `in_progress` / `finalizing`  
- Avoid generic “white table + blue button” trap via surface hierarchy, typography, purposeful density  

Copy recommendations for next phase:

- Primary CTA: **Create Tenant** (align with product language; route `/admin/tenants/create`)  
- Row action: **Resume** or **Resume Setup** (avoid inventing “Continue Setup” unless branding dictates)  
- Destructive: **Discard** (domain truth)

---

## 39. HTML Prototype Recommendation

```text
HTML VISUAL PROTOTYPE RECOMMENDED
```

Layout direction is meaningfully ambiguous (header band density, progress treatment, responsive action collapse). Prototype → user visual approval → formal Visual Direction Spec → implementation.

---

## 40. Implementation Scope Recommendation (planning only)

UI-3B implementation should include (after Visual Direction acceptance):

- Page modernization with UI-1 primitives  
- Discoverable navigation entry  
- Operational draft table/list per approved direction  
- Progress + status differentiation  
- Resume → UI-3A  
- Discard + ConfirmationDialog + concurrency error UX  
- Empty / loading / error states  
- Responsive + accessibility  
- Focused unit tests (load/empty/error/discard/resume link)  
- Stay within current list API unless a separate backend task ships pagination/search  

---

## 41. Explicit Out-of-Scope

- UI-3A wizard redesign  
- UI-3C operation status UI  
- New billing/subscription/invite systems  
- Global design-system rewrite  
- Generic workflow frameworks  
- Mandatory DB migration  
- Hard delete semantics  
- Aggressive polling  

---

## 42. Findings

### F-SA-UI3B-P-001 (Medium) — No shell navigation entry

1. ID: F-SA-UI3B-P-001  
2. Severity: Medium  
3. Area: Navigation / discoverability  
4. Current: Route exists; `menu.config` has no Drafts link  
5. Needed: Discoverable Tenants submenu / entry  
6. Evidence: `menu.config.ts`; Playwright `sidebarDrafts: 0`  
7. FE Impact: High  
8. BE Impact: None  
9. DB Impact: None  
10. UX Impact: Operators must know URL  
11. Blocks Visual Direction: NO  
12. Blocks Implementation: NO (must fix in impl)  
13. Recommendation: Add nav in UI-3B impl per Visual Direction  
14. Confidence: High  

### F-SA-UI3B-P-002 (Medium) — Discard without confirmation

1. ID: F-SA-UI3B-P-002  
2. Severity: Medium  
3. Area: Destructive safety  
4. Current: Immediate DELETE on click  
5. Needed: Shared ConfirmationDialog with draft context  
6. Evidence: drafts page `discard()`  
7. FE Impact: High  
8. BE Impact: None  
9. DB Impact: None  
10. UX Impact: Accidental abandon risk  
11. Blocks VD: NO  
12. Blocks Impl: NO  
13. Recommendation: Mandatory in UI-3B impl  
14. Confidence: High  

### F-SA-UI3B-P-003 (Medium) — UI-1 reuse failure / local dialect

1. ID: F-SA-UI3B-P-003  
2. Severity: Medium  
3. Area: Design system  
4. Current: Inline-only page; no PageHeader/Button/EmptyState/etc.  
5. Needed: UI-1 composition  
6. Evidence: imports `[RouterLink]` only  
7. Blocks VD: NO  
8. Blocks Impl: NO  
9. Recommendation: Core of Visual Direction + impl  
10. Confidence: High  

### F-SA-UI3B-P-004 (Medium) — No search / true pagination

1. ID: F-SA-UI3B-P-004  
2. Severity: Medium  
3. Area: List contract  
4. Current: `Take(100)`; `TotalCount=items.Length`; no search  
5. Needed: For large volume — real page/total/search (backend task)  
6. Evidence: repository `ListDraftsAsync`  
7. Blocks VD: NO (design within mine+cap)  
8. Blocks Impl: NO for MVP; YES for scale-sensitive claims  
9. Recommendation: Document cap; optional backend follow-up  
10. Confidence: High  

### F-SA-UI3B-P-005 (Medium) — No frontend drafts page tests

1. ID: F-SA-UI3B-P-005  
2. Severity: Medium  
3. Area: Tests  
4. Current: No page/API list-discard specs  
5. Needed: Load/empty/error/discard/resume coverage  
6. Blocks VD: NO  
7. Blocks Impl: NO (required during impl)  
8. Confidence: High  

### F-SA-UI3B-P-006 (Medium) — Thin backend list/discard/auth tests

1. ID: F-SA-UI3B-P-006  
2. Severity: Medium  
3. Area: Backend tests  
4. Current: Progress evaluator only; no HTTP list/discard ownership tests found  
5. Needed: Contract tests for mine/all, discard If-Match, access  
6. Blocks VD: NO  
7. Blocks Impl: NO  
8. Confidence: High  

### F-SA-UI3B-P-007 (Low) — Expiry not enforced

1. ID: F-SA-UI3B-P-007  
2. Severity: Low  
3. Area: Lifecycle  
4. Current: `expiresAt` sliding 30d; `expired` never written  
5. Needed: Product decision + optional worker  
6. Blocks VD: NO (avoid promising expiry UX)  
7. Blocks Impl: NO  
8. Confidence: High  

### F-SA-UI3B-P-008 (Low) — `finalizing` listed with Resume/Discard affordances

1. ID: F-SA-UI3B-P-008  
2. Severity: Low  
3. Area: Lifecycle UX  
4. Current: List includes `finalizing`; Discard throws if not `in_progress`  
5. Needed: Disable/hide actions or filter  
6. Blocks VD: NO  
7. Blocks Impl: NO  
8. Confidence: High  

### F-SA-UI3B-P-009 (Low) — Owner GUID not humanized; not shown

1. ID: F-SA-UI3B-P-009  
2. Severity: Low  
3. Area: Ownership UX  
4. Current: Summary has owner id only  
5. Needed: Optional join later; do not show raw GUID as primary  
6. Blocks VD/Impl: NO  
7. Confidence: High  

### F-SA-UI3B-P-010 (Low) — No draft operation audit trail

1. ID: F-SA-UI3B-P-010  
2. Severity: Low  
3. Area: Audit  
4. Current: No draft CRUD platform audit events  
5. Needed: Optional platform audit later — not UI-3B core  
6. Blocks VD/Impl: NO  
7. Confidence: High  

**Blocking Findings:** NONE  

---

## 43. Planning Audit Matrix

| Area | Frontend | Backend | DB | Tests | Readiness |
| --- | --- | --- | --- | --- | --- |
| Route | READY | READY | NOT REQUIRED | PARTIAL | READY |
| List | PARTIAL | READY | READY | MISSING | PARTIAL |
| Search | MISSING | MISSING | NOT REQUIRED | MISSING | PARTIAL |
| Filters | MISSING | PARTIAL | READY | MISSING | PARTIAL |
| Sort | MISSING | PARTIAL | READY | MISSING | PARTIAL |
| Pagination | MISSING | MISSING | NOT REQUIRED | MISSING | PARTIAL |
| Status | PARTIAL | READY | READY | THIN | READY |
| Progress | READY | READY | READY | THIN | READY |
| Resume | READY | READY | READY | PARTIAL | READY |
| Delete/Abandon | PARTIAL | READY | READY | MISSING | PARTIAL |
| Permissions | PARTIAL | READY | NOT REQUIRED | MISSING | READY |
| Concurrency | PARTIAL | READY | READY | MISSING | READY |
| Audit | MISSING | PARTIAL | NOT REQUIRED | MISSING | PARTIAL |
| Empty | PARTIAL | READY | NOT REQUIRED | MISSING | PARTIAL |
| Loading | PARTIAL | READY | NOT REQUIRED | MISSING | PARTIAL |
| Error | PARTIAL | READY | NOT REQUIRED | MISSING | PARTIAL |
| Responsive | PARTIAL | NOT REQUIRED | NOT REQUIRED | MISSING | PARTIAL |
| Accessibility | PARTIAL | NOT REQUIRED | NOT REQUIRED | MISSING | PARTIAL |
| UI-1 reuse | MISSING | NOT REQUIRED | NOT REQUIRED | MISSING | PARTIAL |
| Style budget | READY | NOT REQUIRED | NOT REQUIRED | NOT REQUIRED | READY |

---

## 44. API Capability Matrix

| Capability | Endpoint Exists | Current UI Uses | Future UI Needs |
| --- | --- | --- | --- |
| List | YES | YES | YES |
| Search | NO | NO | Nice-to-have |
| Filter | PARTIAL (implicit) | NO | Optional status clarity |
| Sort | PARTIAL (fixed) | Implicit | Optional controls |
| Pagination | NO | NO | Nice-to-have |
| Get Draft | YES | Via UI-3A resume | Via resume only |
| Resume | N/A (navigate) | YES | YES primary |
| Abandon/Delete | YES (Discard) | YES | YES + confirm |
| Submit | Finalize on UI-3A | NO on drafts | Keep on UI-3A |

---

## 45. Draft Lifecycle Matrix

| State | List Visible | Resumable | Abandonable | Submitted Operation? |
| --- | --- | --- | --- | --- |
| `in_progress` | YES | YES | YES | NO |
| `finalizing` | YES | PARTIAL | NO (EnsureEditable) | Pending |
| `completed` | NO | NO | NO | YES |
| `discarded` | NO | NO | N/A | NO |
| `expired` | NO (unused) | N/A | N/A | NO |

---

## 46. Permission Matrix

| Action | Frontend Gate | Backend Gate | Ready? |
| --- | --- | --- | --- |
| View drafts | Route `tenants.create` | `TenantsCreate` | YES |
| Create tenant | CTA → create route | create | YES |
| Resume draft | Resume route create | Get access rules | YES |
| Abandon/delete | None beyond route | Access + If-Match | YES (UX gap) |

---

## 47. Visual Direction Readiness

```text
READY WITH NON-BLOCKING GAPS
```

Enough contract + UX evidence exists to specify Premium Blue operational drafts without cloning UI-3A wizard.

---

## 48. Implementation Readiness

```text
READY WITH NON-BLOCKING GAPS
```

After Visual Direction (+ recommended HTML prototype approval). Not blocked by backend absence. Optional backend pagination/search is non-blocking for MVP.

---

## 49. Final Verdict

```text
SUPER ADMIN UI-3B READY WITH NON-BLOCKING GAPS — PREMIUM BLUE VISUAL DIRECTION MAY BEGIN
```

---

## 50. Required Next Action

Merge the UI-3B Planning Audit through the controlled Second Brain documentation PR process. Then create an approved UI-3B Premium Blue visual prototype/direction before implementation. Do not modify UI-3B source until the Visual Direction Specification is complete and accepted.

Recommended sequence given prototype recommendation:

```text
Planning Audit
→ HTML Visual Prototype
→ User Visual Approval
→ Premium Blue Visual Direction Specification
→ Implementation
→ Independent Verification
```
