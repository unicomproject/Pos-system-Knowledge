# OneVerz Super Admin — UI-3B Onboarding Drafts  
# Premium Blue Visual Direction Specification

**Document type:** Official visual direction / implementation design contract  
**Product:** OneVerz Super Admin  
**Scope slice:** UI-3B — Tenant Onboarding Drafts  
**Primary route:** `/admin/tenants/onboarding/drafts`  
**Theme:** BLUE (mandatory)  
**Date:** 2026-08-11  
**Status:** APPROVED for controlled implementation after documentation merge  

**Authority order (implementation must follow):**

1. This Visual Direction Specification  
2. Approved HTML visual prototype (composition / character reference only)  
3. UI-1 shared design-system rules / tokens / primitives  
4. UI-3B Planning Audit business / API / data contracts  
5. Existing backend draft list / discard / resume semantics  

If visual concept conflicts with actual business/data contract → **business/data contract wins**. Adapt the visual pattern; do not invent fields, filters, search, pagination, or lifecycle states.

**Related evidence:**

| Artifact | Reference |
| --- | --- |
| UI-3B Planning Audit | `15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SUPER_ADMIN_UI3B_ONBOARDING_DRAFTS_PLANNING_AUDIT_2026-08-11.md` |
| Planning audit commit | `234bd59827ab1428b22299e2799d551f70ca52eb` |
| Planning verdict | READY WITH NON-BLOCKING GAPS — PREMIUM BLUE VISUAL DIRECTION MAY BEGIN |
| UI-3A Visual Direction | `07_UI_UX_KNOWLEDGE/SUPER_ADMIN_UI3A_CREATE_TENANT_PREMIUM_BLUE_VISUAL_DIRECTION.md` |
| UI-3A closure | CLOSED — Resume must land in Premium Blue wizard unchanged |
| UI-1 tokens | Platform Admin `src/styles.scss` `:root` (`--primary` `#0b5cff`, `--bg-page` `#f8fafc`) |

**Path note:** Placed under `07_UI_UX_KNOWLEDGE/` (established Platform Admin UI specification folder).

**Final visual direction verdict:**

```text
SUPER ADMIN UI-3B PREMIUM BLUE VISUAL DIRECTION APPROVED WITH NON-BLOCKING GAPS — READY FOR CONTROLLED IMPLEMENTATION
```

Non-blocking gaps (do not block implementation after this spec merges):

- No standalone Angular `DataTable` / `FilterBar` components exist today — production must reuse the established Super Admin table shell (`.data-table` / table-card family used by Tenant List) and a Button-based scope control.  
- Draft list returns `ownerPlatformUserId` (GUID) without display name — do not show raw GUID as primary metadata.  
- `expired` status is unused; expiry is a timestamp only — no “expiring soon” threshold inventable.  
- Planning audit branch may still be awaiting Second Brain main merge at time of this specification write; content of `234bd59` remains the authoritative planning input.

---

## 1. Purpose

Freeze the **premium blue visual contract** for UI-3B so implementation produces a polished, scannable **operational drafts workspace** — not a cleaned-up CRUD table — while remaining completely truthful to the current draft list API and soft-discard semantics.

This document converts the already **approved HTML visual prototype** into a production implementation contract.

---

## 2. Scope

### In scope (UI-3B)

| Route | Experience |
| --- | --- |
| `/admin/tenants/onboarding/drafts` | Premium operational onboarding drafts list |

### Out of scope

- UI-3A Create / Resume wizard redesign (`/admin/tenants/create`, `/admin/tenants/onboarding/:draftId`) — Resume only  
- UI-3C operation status (`/admin/tenants/onboarding/operations/:operationId`)  
- Search, server pagination, unsupported filters  
- Separate draft detail / drawer / master-detail  
- Backend/API/DB changes as a requirement for MVP  
- Global shell redesign beyond smallest navigation discoverability fix  

### Non-goals

- Inventing KPI tiles or fake metrics  
- Client-side fake search or fake pagination  
- New permission codes  
- Generic workflow / draft framework  

---

## 3. Planning Audit Inputs

| Area | Planning result | Spec consequence |
| --- | --- | --- |
| Route | ACTIVE | Modernize in place |
| Pattern | PREMIUM OPERATIONAL TABLE | Frozen |
| Separate detail | NOT REQUIRED | No drawer / detail route |
| List API | YES | MVP on current endpoint |
| Resume | SUPPORTED | Primary row action → UI-3A |
| Discard | SUPPORTED (soft) | Secondary + confirmation |
| Search | NOT SUPPORTED | **Not in MVP** |
| Filters | PARTIAL (`mine` only) | Scope control only |
| Sorting | PARTIAL (server fixed) | No sort UI |
| Pagination | NOT SUPPORTED | **Not in MVP** |
| Status / Progress | CLEAR | Distinct columns/cells |
| DB migration | NO | None |
| Backend | Sufficient with gaps | No API blocker for visual MVP |
| UI-1 reuse | FAIL today | Mandatory fix |
| Local UI dialect | HIGH | Must be removed |

---

## 4. Approved Prototype Status

```text
HTML Visual Prototype: APPROVED
```

The prototype governs:

```text
composition
visual hierarchy
OneVerz blue identity
table treatment
action hierarchy
responsive intent
```

It does **not** create new business/data requirements. Prototype-only concepts (search, pagination chrome) are **REJECTED** for production MVP.

---

## 5. Product Identity

### OneVerz Super Admin

- Product visible via existing shell brand + PageHeader  
- No legacy SCS-TIX / consumer branding on this page  
- Copy uses: Onboarding Drafts, Tenant, Create Tenant, Resume Setup, Discard  

### Premium Blue (mandatory)

| Role | Direction | Prefer token |
| --- | --- | --- |
| Shell | Deep navy / midnight | Sidebar `#0f172a` |
| Primary CTA / Resume / active | Strong OneVerz blue | `--primary` `#0b5cff` |
| Hover / pressed | Deeper blue | `--primary-hover` / `--primary-active` |
| Soft info / progress accent | Soft blue tint | `--status-info-bg` / selected surfaces |
| Canvas | Soft cool gray | `--bg-page` `#f8fafc` |
| Surfaces | White / cool secondary | `--bg-surface-primary` |
| Typography | Ink / dark navy | `--text-primary` `#0f172a` |
| Success / Warning / Error | Semantic tokens only | `--status-*` |

**Approved visual character:**

```text
PREMIUM · MODERN · ATTRACTIVE · ENTERPRISE · OPERATIONAL · CLEAR · EFFICIENT
```

---

## 6. Business / Data Constraints

List response fields available for table presentation:

| Field | May show | Rule |
| --- | --- | --- |
| `displayName` | YES | Primary identity (fallback “Untitled tenant”) |
| `tenantCode` | YES | Secondary identity (fallback “No code yet”) |
| `status` | YES | Domain values only |
| `currentStep` | YES | `Step X of 7` |
| `progressPercent` | YES | Optional bar support; setup progress only |
| `updatedAt` | YES | Label **Updated** (not “Last saved”) |
| `expiresAt` | YES | Compact secondary; no invented threshold |
| `ownerPlatformUserId` | CAUTION | Do not show raw GUID as primary column |
| `id` | Actions only | Resume route param |
| `version` | Action only | Discard If-Match |

API: `GET /api/v1/platform-admin/tenant-onboarding/drafts?mine={bool}`  
Discard: `DELETE .../drafts/{id}` + `If-Match`  
Resume: navigate only to `/admin/tenants/onboarding/:draftId`

List server filter (immutable for MVP): `in_progress` \|\| `finalizing`  
Server sort (immutable for MVP): `UpdatedAt DESC`

---

## 7. Approved Page Pattern

```text
PREMIUM OPERATIONAL TABLE
```

**Rejected patterns:**

```text
master-detail
permanent right-side detail panel
drawer-first interface
card grid of drafts (as primary desktop layout)
kanban board
wizard / UI-3A hero reuse
marketing landing
```

---

## 8. High-Level Page Composition

Freeze:

```text
Existing Super Admin Shell
↓
Shared PageHeader
    ├── Onboarding Drafts
    ├── concise operational description
    └── Create Tenant CTA
↓
Compact Premium Blue Context / Operational Band
↓
Supported Scope Control (My Drafts / All Drafts when authorized)
↓
Premium Operational Drafts Table
↓
Simple loaded-count context (array length only — not a pager)
↓
Loading / Empty / Error states as required
```

---

## 9. PageHeader

Mandatory shared `PageHeader`.

| Element | Production copy |
| --- | --- |
| Title (H1) | **Onboarding Drafts** |
| Description | **Resume or manage saved tenant onboarding work.** |

No marketing copy. No duplicate H1 elsewhere on the page.

---

## 10. Create Tenant CTA

| Item | Rule |
| --- | --- |
| Label | **Create Tenant** |
| Route | `/admin/tenants/create` |
| Primitive | Shared `Button` `variant="primary"` |
| Placement | PageHeader actions slot |
| Visibility | Only when authorization allows create (route permission already `platform.tenants.create`) |

Visually connects UI-3B → closed UI-3A. Do not use custom local CTA styles.

---

## 11. Navigation Discoverability

Planning finding **F-SA-UI3B-P-001**: Navigation Entry FAIL.

**Contract:**

```text
Onboarding Drafts must have a clear discoverable entry point within the existing Tenant / Onboarding navigation architecture.
```

Rules:

- Prefer smallest change (e.g. Tenants submenu / secondary link under Tenants)  
- Follow existing `menu.config` / sidebar patterns only  
- Do **not** invent a new top-level global section  
- Do **not** redesign the global sidebar  

---

## 12. Premium Blue Context Band

Compact operational anchor under PageHeader.

**Purpose:**

- Visually anchor OneVerz blue identity  
- Explain these are **saved onboarding drafts**  
- Remain operational, not marketing  

**Allowed content (truthful):**

```text
Saved tenant setups
Resume unfinished onboarding
Editable until submitted, discarded, or expired by retention policy
```

**Forbidden:**

- Invented KPI tiles (`14 active drafts`, `average completion 63%`, etc.)  
- Huge hero / stock art / emoji / heavy glassmorphism  
- UI-3A 7-step wizard hero layout  

**Visual treatment:**

- OneVerz blue tonal surface  
- Controlled gradient allowed  
- Soft decorative depth  
- High-contrast text  
- Compact height + premium radius  

---

## 13. Operational Table

Central product surface.

**Production table approach:**

Because no standalone `app-data-table` component exists today, implementation must:

1. Use a **semantic `<table>`** with established Super Admin table shell language (Tenant List `.data-table` / table-card family, elevated with premium spacing and softer dividers), **or**  
2. Introduce only the minimum page-local wrappers needed for UI-3B composition  

Do **not** create a new global table framework.

**Feel:** structured · premium · scannable · operationally efficient  

**Density:** `COMFORTABLE-COMPACT`  

**Prefer:** subtle row separation, strong primary identity, secondary metadata, selective semantic color  

**Avoid:** heavy boxed cells, dark grid lines, nested borders, oversized card-table hybrid  

**Row click:** row itself is **NOT** primary navigation. Resume is explicit.

**Row expansion:** **NO** for MVP.

**Footer:** may show `N drafts` from loaded array length. **No pager chrome.**

---

## 14. Information Hierarchy

| Tier | Content |
| --- | --- |
| Primary | Display name / Untitled tenant; Resume |
| Secondary | Tenant code; Step X of 7; Updated |
| Contextual | Status badge; optional expiry; optional owner presentation |
| Action-only | Discard (secondary); draft id / version |

---

## 15. Draft Identity

Two-level hierarchy in first cell:

```text
Acme Retail          ← displayName (strong)
ACME01               ← tenantCode (muted secondary)
```

Fallbacks:

- Name missing → `Untitled tenant`  
- Code missing → `No code yet`  

Never use GUID as primary identity.

---

## 16. Draft Status

**Distinct from setup progress.**

Use shared `StatusBadge` + text (not color alone).

| Domain status | Display label | Badge tone | List expected |
| --- | --- | --- | --- |
| `in_progress` | In progress | `info` or `neutral` | YES |
| `finalizing` | Finalizing | `warning` | Rare / transient |
| `completed` | — | — | Not in active list |
| `discarded` | — | — | Not in active list |
| `expired` | — | — | Unused in app writes |

Do **not** invent: Needs Attention, Almost Ready, Healthy, Waiting.

---

## 17. Setup Progress

Canonical display:

```text
Step X of 7
```

Optional restrained progress track using `progressPercent`.

Optional third line: canonical step label mapped from UI-3A seven-step model:

1. Tenant Basic Details  
2. Business & Contact Information  
3. Subscription Plan  
4. Billing / Payment Setup  
5. Feature Entitlements  
6. Tenant Admin User  
7. Review, Create & Activation  

**Mandatory:** Setup Progress ≠ Provisioning Progress (UI-3C).  
Any bar/% is **onboarding setup progress** presentation only — not new business state.

Progress cell must remain compact (not tall). Progress requires accessible name + text equivalent.

---

## 18. Updated / Ownership / Expiry Context

### Updated

- Source: `updatedAt`  
- Label: **Updated**  
- Presentation: relative time with accessible full timestamp (tooltip/title), or absolute when relative unavailable  
- Do **not** label as “Last saved”  

### Ownership

- Field supported as GUID only  
- **MVP:** omit dedicated Owner column showing raw GUID  
- Scope control (“My Drafts”) already communicates ownership filter  
- Future display-name join is out of MVP  

### Expiry

- Source: `expiresAt` (30-day sliding retention field)  
- Show compact secondary: `Expires {date}` when useful  
- Do **not** invent “expiring soon” thresholds without product/backend rule  
- No red alert on every row  

---

## 19. Supported Scope / Filters

**Supported now:**

| Control | API | Notes |
| --- | --- | --- |
| My Drafts | `mine=true` (default) | Default selected |
| All Drafts | `mine=false` | Only if user has `platform.tenants.update`; otherwise hide |

**UI control:** compact segmented Button group (or equivalent existing control).  
Do **not** render empty FilterBar.  
Do **not** invent Status / Plan / Owner / Date filters.

When scope changes: lightweight loading; avoid full-page flash. Empty copy may reflect selected scope.

---

## 20. Search Constraint

```text
Search: NOT IN MVP
```

- Do not render search input  
- Do not render disabled fake search  
- Do not client-search the loaded array to simulate backend search  
- Layout may remain extensible for a future backend search — no UI now  

**Prototype mapping:** Search → **REJECT — FUTURE CAPABILITY**

---

## 21. Sorting Constraint

```text
Supported now: server fixed UpdatedAt DESC
UI sort controls: NOT IN MVP
```

---

## 22. Pagination Constraint

```text
Pagination: NOT IN MVP
```

- No Previous / Next / Page N / Rows per page  
- No fake client paging of the loaded array  
- Hard backend cap (~100) is a known gap (F-SA-UI3B-P-004); visual MVP stays lightweight  

**Prototype mapping:** Pagination → **REJECT — FUTURE CAPABILITY**

---

## 23. Resume Action

| Item | Rule |
| --- | --- |
| Canonical label | **Resume Setup** |
| Short alternative in dense layouts | **Resume** (same action) |
| Role | **PRIMARY row action** |
| Primitive | Shared `Button` (primary or compact primary/text-blue stronger than Discard) |
| Behavior | Navigate to `/admin/tenants/onboarding/:draftId` |
| Mutation | None |
| `finalizing` | Disable or hide Resume (draft not safely editable) |

Do not open a drawer. Do not create a second editor.

---

## 24. Discard Action

| Item | Rule |
| --- | --- |
| Canonical label | **Discard** |
| Role | **Destructive secondary** |
| Visual | Low emphasis; must not compete with Resume |
| Preferred placement | Text/ghost destructive control or overflow menu on narrow widths |
| Backend | Existing soft discard unchanged |

Do not use Delete / Remove / Archive unless domain terminology changes.

---

## 25. Discard Confirmation

**REQUIRED** (closes planning gap F-SA-UI3B-P-002 in implementation).

Use shared `ConfirmationDialog` (`variant="destructive"`).

Recommended content:

```text
Title: Discard onboarding draft?
Body: <Business/Tenant identity>
       This saved onboarding draft will no longer appear in the active draft list.
Cancel: Cancel
Confirm: Discard Draft
```

Reflect soft-discard truth (not “permanently deleted” unless domain says so).

Accessibility requirements:

- focus trap  
- Escape / Cancel  
- initial sensible focus  
- clear destructive CTA  
- restore focus to originating control  

---

## 26. Concurrency / Conflict UX

Backend: If-Match + version; conflicts → 409 `concurrency_conflict`.

**Required UX:**

```text
Draft changed since this list was loaded.
Refresh the draft list and try again.
```

- Do not silently pretend success  
- Do not auto-retry destructive discard  
- Keep list visible; use scoped error feedback  

---

## 27. Empty State

Shared `EmptyState`.

| Scope | Direction |
| --- | --- |
| My Drafts empty | No drafts of yours — Create Tenant CTA |
| All Drafts empty | No active onboarding drafts — Create Tenant CTA |

Character: approved icon system · soft blue accent · clean whitespace · clear CTA  
Avoid: large illustration · emoji · generic DB icon  

---

## 28. Loading State

Shared `LoadingSkeleton` in table/list layout.  
No giant centered spinner.  
Scope change: lightweight skeleton/overlay without unnecessary blanking.

---

## 29. Error State

Shared `ErrorState` for initial list failure with Retry calling existing reload.  
Row action errors (discard failure) must not replace the whole page unless unusable — use scoped feedback consistent with existing app patterns (no new toast framework).

---

## 30. UI-1 Primitive Reuse

Mandatory fix for planning FAIL.

| Need | Primitive / Pattern | Notes |
| --- | --- | --- |
| Header | `PageHeader` | Required |
| CTA / Resume / Discard / Scope | `Button` | Required |
| Status | `StatusBadge` | Required |
| Loading | `LoadingSkeleton` | Required |
| Empty | `EmptyState` | Required |
| Error | `ErrorState` | Required |
| Confirmation | `ConfirmationDialog` | Required |
| Table | Established `.data-table` / table-card Super Admin pattern | No standalone DataTable component today |
| Scope control | Button group | No FilterBar component today — do not invent empty FilterBar |
| Progress cell | Page-local | Allowed |

---

## 31. Removal of Local UI Dialect

Competing local UI system (**HIGH** today) **MUST BE REMOVED**.

Prohibit page-local recreation of:

```text
buttons, table shell language, status badges, confirmation modal,
loading, error, empty states, focus system
```

Convert inline styles to external template + compact page SCSS.

Page-local styling **allowed** only for:

```text
context band
draft identity hierarchy
setup-progress cell
table wrapper composition
row-action arrangement
responsive column / card transformation
```

---

## 32. Surface Hierarchy

| Level | Surface |
| --- | --- |
| 0 | Cool neutral app canvas (`--bg-page`) |
| 1 | PageHeader / normal page content |
| 2 | Premium blue operational context band |
| 3 | Primary drafts table surface |
| 4 | Small contextual state surfaces (empty/error) |

Avoid card-inside-card-inside-card. No unique full-page background.

---

## 33. Blue Visual System

**Strong blue:** Create Tenant, Resume, active scope, focus, context band, progress accent  

**Soft blue:** progress track surface, selected scope, empty-state accent  

Do **not** flood every table row with blue.

---

## 34. Typography

Use UI-1 typography tokens/scale.

Hierarchy:

```text
Page H1
Context-band title
Draft identity (strongest in-row)
Table headers
Primary cell value
Secondary metadata
Status / progress metadata
```

Avoid production text ≤10px.

---

## 35. Spacing / Density

UI-1 spacing rhythm. Target **COMFORTABLE-COMPACT** — scannable multi-row density without spreadsheet crush or card sprawl.

---

## 36. Border / Shadow / Gradient

- Subtle borders / soft row dividers  
- Minimal shadow on context band + primary table surface only  
- Restrained blue gradient only on context band  
- No gradients on status, rows, progress bars, or Discard  

---

## 37. Iconography

Approved icon system only.  
Potential: onboarding context, resume, expiry, discard, empty.  
No emoji / Unicode hacks / random letter icons.

---

## 38. Interaction / Micro-Interaction

Allowed restrained:

```text
row hover (soft surface)
button hover
scope selection
progress transition
dialog transition
focus-visible
```

No animation-heavy list behavior. Respect reduced motion.

---

## 39. Responsive Rules

### 1440

Full composition: context band + scope + full priority columns + visible Resume + accessible Discard. Overflow **NONE**.

### 1280

Same composition; tighter columns; secondary metadata may compress. Overflow **NONE**.

### 1024

Prioritize: identity · progress · status · updated · Resume · Discard.  
Owner/expiry may fold into identity secondary stack. Do not merely shrink fonts. Overflow **NONE**.

### 768

Fully usable. **Production rule:** transform to **structured compact draft rows** (stacked identity/progress/status/actions) when table columns no longer fit — not full-page horizontal scroll.

Must retain: identity · setup progress · status · updated · Resume · Discard.  
Discard may move to secondary/overflow placement. Overflow **NONE**.

When transforming to stacked rows, preserve labels programmatically or visibly (do not hide desktop headers without replacement).

---

## 40. Accessibility

Require:

```text
single H1
semantic table (desktop) or labeled stacked rows (narrow)
accessible headers / relationships
keyboard: Create Tenant → scope → rows → Resume → Discard
focus-visible (UI-1)
status not color-only
progress text equivalent + accessible name
clear Resume / Discard labels (not icon-only)
ConfirmationDialog a11y (trap, Escape, restore)
empty/error announcements
```

---

## 41. Permissions / Action Visibility

| Action | Gate |
| --- | --- |
| View page | `platform.tenants.create` (route) |
| Create Tenant CTA | Same create authorization |
| Resume | Same route family + backend GET access |
| All Drafts scope | Show only if `platform.tenants.update` known true |
| Discard | Hide/disable only when frontend can know disallowance; else rely on backend + error UX |

Do not invent permission codes. Do not invent disabled states from assumptions. Backend remains authoritative.

---

## 42. UI-3A Resume Continuity

Resume **must** land in closed Premium Blue UI-3A wizard unchanged.

Do not modify/regress:

```text
/admin/tenants/create
/admin/tenants/onboarding/:draftId
```

---

## 43. UI-3B / UI-3C Boundary

```text
UI-3B: Saved onboarding drafts (active list)
UI-3C: Submitted onboarding / provisioning operations
```

Do not list completed drafts as operations. Do not modernize operations route in UI-3B.

---

## 44. Style-Budget Strategy

| Item | Rule |
| --- | --- |
| Warning | **6 kB** unchanged |
| Error | **12 kB** unchanged |
| Angular budget change | **NONE** |
| Prefer | UI-1 reuse + compact page SCSS ≤ warning where feasible |
| Do not | Raise budgets; move page CSS into `styles.scss` / shell to evade warning |
| Legacy | Replace ~582 B inline styles with maintainable external SCSS |

Premium quality may increase CSS vs today’s tiny page; stay under warning when feasible without destroying the approved design.

---

## 45. Prototype → Production Mapping

| Approved Prototype Element | Production Data Support | Final Rule |
| --- | --- | --- |
| PageHeader | YES | **APPROVED FOR PRODUCTION** |
| Blue context band | Composition only | **APPROVED FOR PRODUCTION** (no fake KPIs) |
| Create Tenant CTA | YES | **APPROVED FOR PRODUCTION** |
| Scope / filter control | `mine` only | **ADAPT TO REAL DATA** (My/All only) |
| Search | NONE | **REJECT — UNSUPPORTED** |
| Draft identity | displayName + tenantCode | **APPROVED FOR PRODUCTION** |
| Status | domain status | **APPROVED FOR PRODUCTION** |
| Progress | currentStep + progressPercent | **APPROVED FOR PRODUCTION** |
| Owner | GUID only | **ADAPT** — omit GUID column MVP |
| Updated | updatedAt | **APPROVED FOR PRODUCTION** |
| Expiry | expiresAt | **ADAPT** — compact date, no threshold |
| Resume | navigate | **APPROVED FOR PRODUCTION** |
| Discard | DELETE soft | **APPROVED FOR PRODUCTION** + confirmation |
| Pagination | NONE | **REJECT — UNSUPPORTED** |
| Empty state | YES | **APPROVED FOR PRODUCTION** |

---

## 46. Data Truthfulness Matrix

| UI Element | Backend/Data Source | Can Be Shown? | Rule |
| --- | --- | --- | --- |
| Draft identity | displayName, tenantCode | YES | Hierarchy + fallbacks |
| Status | status | YES | Domain labels only |
| Step X of 7 | currentStep | YES | Canonical |
| Progress bar/% | progressPercent | YES | Setup progress only |
| Owner name | — | NO | GUID only — omit column |
| Updated | updatedAt | YES | Label Updated |
| Expiry | expiresAt | YES | Neutral date |
| Search | none | NO | Not in MVP |
| Pagination | none | NO | Not in MVP |
| Fake KPIs | none | NO | Forbidden |

---

## 47. Column Priority Matrix

| Data | Priority | Desktop (1440/1280) | Tablet/Narrow (1024/768) |
| --- | --- | --- | --- |
| Draft identity | Critical | Column | Always |
| Progress | Critical | Column | Always |
| Status | Critical | Column | Always |
| Updated | High | Column | Always (may stack) |
| Expiry | Contextual | Optional column / secondary | Fold into identity stack |
| Owner | Medium | Omit MVP | Omit MVP |
| Actions | Critical | Resume + Discard | Resume visible; Discard secondary |

---

## 48. Responsive Matrix

| Area | 1440 | 1280 | 1024 | 768 |
| --- | --- | --- | --- | --- |
| Context band | Full compact | Full compact | Compact | Compact stacked |
| Scope control | Inline | Inline | Inline wrap | Full-width segment |
| Draft identity | 2-line cell | 2-line | 2-line | Stack header |
| Progress | Step + bar + label | Step + bar | Step + bar | Step + short bar |
| Status | Badge | Badge | Badge | Badge |
| Metadata | Updated (+ expiry) | Updated | Updated | Updated under identity |
| Resume | Primary button | Primary | Primary | Primary full-width or prominent |
| Discard | Secondary | Secondary | Secondary | Overflow / low emphasis |

Horizontal overflow target: **NONE** at all widths.

---

## 49. Action Matrix

| Context | Primary | Secondary | Destructive |
| --- | --- | --- | --- |
| Page | Create Tenant | My/All scope | — |
| Draft row | Resume Setup | — | Discard |
| Confirmation | — | Cancel | Discard Draft |

---

## 50. State Matrix

| State | Visual Direction |
| --- | --- |
| Initial loading | Table/list LoadingSkeleton |
| Loaded | Table + optional `N drafts` count |
| Empty | EmptyState + Create Tenant |
| List error | ErrorState + Retry |
| Scope change loading | Lightweight skeleton / busy scope control |
| Resume available | Primary Resume Setup (`in_progress`) |
| Resume unavailable | Hidden/disabled for `finalizing` |
| Discard confirmation | ConfirmationDialog open |
| Discard loading | Dialog confirm loading / row busy |
| Discard failure | Scoped error; list retained |
| Concurrency conflict | Explicit refresh message |
| Expiry state | Neutral date metadata only |

---

## 51. UI-1 Mapping Matrix

| Visual Need | UI-1 Primitive / Pattern | Page-Local Styling Needed? |
| --- | --- | --- |
| Header | PageHeader | No |
| CTA | Button | No |
| Table | Established data-table / table-card pattern | Light composition yes |
| Scope control | Button group | Light yes |
| Status | StatusBadge | No |
| Loading | LoadingSkeleton | Layout wiring |
| Empty | EmptyState | Accent only if needed |
| Error | ErrorState | No |
| Confirmation | ConfirmationDialog | No |
| Progress | page-local progress cell | Yes |
| Context band | page-local | Yes |

**Shared Foundation First:** NO  

---

## 52. Must-Look-Like Contract

```text
premium enterprise workflow management
clear operational SaaS
OneVerz blue product
easy-to-scan saved onboarding workspace
```

Qualitative acceptance bar after implementation:

```text
Visual Quality >= 8/10
UX >= 8/10
Modern SaaS Fit >= 8/10
```

---

## 53. Must-Not-Look-Like Contract

```text
generic white data table
Bootstrap CRUD list
flat legacy admin screen
oversized dashboard with fake KPIs
card grid of drafts as desktop primary
master-detail workspace
marketing landing page
UI-3A wizard / hero reused as drafts page
fake search box
fake pagination footer
```

---

## 54. Business / API Preservation

Later implementation must **NOT** change:

```text
draft list semantics
mine scope semantics
draft lifecycle
resume semantics (navigate only)
discard soft semantics
expiry field meaning
ownership rules
concurrency / If-Match
permissions
post-submit completed retention + operation link
```

**API Change:** NONE required for MVP  
**DB Change:** NONE  
**Business Logic Change:** NONE  

If a true contract blocker appears during implementation: **STOP and report** — do not invent frontend workarounds.

---

## 55. Regression Boundaries

| Boundary | Rule |
| --- | --- |
| UI-3A | No wizard regression; Resume continuity PASS |
| UI-3C | Do not modernize operations route |
| UI-2 | No Dashboard / Tenant List / Detail / shell regression |
| Shell | No global redesign beyond smallest nav discoverability entry |

---

## 56. Explicit Out-of-Scope

```text
Search
Server pagination
Client fake pagination
Unsupported filters (status/plan/owner/date)
Separate draft detail / drawer / modal viewer
Master-detail
UI-3A redesign
UI-3C operation-status redesign
New backend lifecycle / DB fields
Generic workflow framework
Audit-history drawer
Auto polling
KPI tiles / invented metrics
```

---

## 57. Implementation Acceptance Criteria

```text
Premium blue visual quality >= 8/10
UI-1 primitive reuse PASS (or documented pattern-equivalent for table shell)
Competing local UI dialect removed
Create Tenant CTA present and correct
Navigation discoverability corrected (smallest change)
Operational table premium and scannable
Actual draft status displayed truthfully
Actual Step X of 7 progress
Resume continuity to UI-3A
Discard confirmation via ConfirmationDialog
No fake search
No fake pagination
No production mock data
Loading / Empty / Error complete
Responsive 1440 / 1280 / 1024 / 768; overflow NONE
Accessibility PASS or only documented non-blocking gaps
Style budget: no raise; prefer warning-free
API / business semantics unchanged
Frontend tests added (load/empty/error/scope/resume/discard confirm)
UI-3A / UI-2 regressions absent
```

---

## 58. Independent Verification Criteria

Future verification must inspect:

```text
actual rendered browser UI on latest feature commit
real backend draft list
real Resume into UI-3A
real Discard confirmation + soft discard
If-Match / concurrency preservation
permissions / All Drafts visibility
no N+1 requests
no duplicate list requests on init
no client search
no fake pagination
UI-1 reuse
style budget
responsive + accessibility
tests
UI-3A resume continuity
UI-2 / shell regression
```

---

## 59. Planning Findings Carry-Forward

| Finding | Visual Direction Impact | Implementation Impact | Backend Future |
| --- | --- | --- | --- |
| F-SA-UI3B-P-001 Nav missing | Discoverability contract | Add smallest nav entry | None |
| F-SA-UI3B-P-002 No confirm | Confirmation required | ConfirmationDialog | None |
| F-SA-UI3B-P-003 UI-1 fail | Reuse mandatory | Replace local dialect | None |
| F-SA-UI3B-P-004 No search/paging | Excluded from MVP | Do not fake | Optional later |
| F-SA-UI3B-P-005 No FE tests | Acceptance criteria | Add tests | None |
| F-SA-UI3B-P-006 Thin BE tests | Carry gap | None in UI-3B | Optional later |
| F-SA-UI3B-P-007 Expiry unused | Neutral date only | No threshold UX | Optional worker |
| F-SA-UI3B-P-008 finalizing actions | Disable Resume/Discard rules | Enforce in UI | Optional filter |
| F-SA-UI3B-P-009 Owner GUID | Omit GUID column | Scope control only | Optional name join |
| F-SA-UI3B-P-010 No audit UI | No audit drawer | None | Optional audit events |

Do **not** silently close these findings in this specification.

---

## 60. Final Visual Direction Verdict

```text
SUPER ADMIN UI-3B PREMIUM BLUE VISUAL DIRECTION APPROVED WITH NON-BLOCKING GAPS — READY FOR CONTROLLED IMPLEMENTATION
```

**Visual Direction Blockers:** NONE  

**Ready for UI-3B Implementation:** YES (after this specification is merged/accepted)  
**UI-3B Implementation Authorized now:** NO — until Visual Direction PR is merged/accepted  
**UI-3C Authorized:** NO  

---

## 61. Required Next Action

Merge the approved UI-3B Premium Blue Visual Direction Specification through the controlled Second Brain documentation PR process. After that specification is integrated, implement only UI-3B Onboarding Drafts on a dedicated Platform Admin feature branch using the Planning Audit, approved HTML prototype, and this Visual Direction Specification as mandatory contracts. Preserve existing draft APIs/business semantics, do not add fake search or pagination, add Discard confirmation and frontend test coverage, and require independent read-only verification before merge.
