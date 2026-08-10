# OneVerz Super Admin — UI-3A Create Tenant Wizard  
# Premium Blue Visual Direction Specification

**Document type:** Official visual direction / implementation design contract  
**Product:** OneVerz Super Admin  
**Scope slice:** UI-3A — Create Tenant Wizard  
**Theme:** BLUE (mandatory)  
**Date:** 2026-08-10  
**Status:** APPROVED for controlled implementation after documentation merge  

**Authority order (implementation must follow):**

1. This Visual Direction Specification  
2. Approved HTML visual composition (layout/character reference only)  
3. UI-1 shared design-system rules / tokens / primitives  
4. Existing business / API / onboarding contracts  

If visual concept conflicts with actual business/data contract → **business/data contract wins**. Adapt the visual pattern; do not invent fields, steps, or lifecycle states.

**Related evidence:**

| Artifact | Reference |
| --- | --- |
| UI-3 Planning Audit | `15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SUPER_ADMIN_UI3_CREATE_TENANT_ONBOARDING_PLANNING_AUDIT_2026-08-10.md` |
| Planning commit | `467fddd8870e4e0496b567ea8b416dd5e4d9d340` (merged via PR #64 → `3bd916b`) |
| UI-1 tokens | Platform Admin `src/styles.scss` `:root` |
| Shell identity | Sidebar deep navy `#0f172a` + primary blue `#0b5cff` |

**Path note:** Placed under `07_UI_UX_KNOWLEDGE/` (established Platform Admin UI specification folder: Billing UI, Subscription UI, Platform Admin UI Rules). Filename preserved as requested.

---

## 1. Purpose

Freeze the **premium blue visual contract** for UI-3A so implementation produces a guided, high-hierarchy Super Admin onboarding experience — not a cleaned-up CRUD form — while preserving every existing create/resume/draft/finalize business semantic.

This document converts the already approved HTML visual concept into an implementation-ready design contract.

---

## 2. Scope

### In scope (UI-3A)

| Route | Experience |
| --- | --- |
| `/admin/tenants/create` | New tenant wizard |
| `/admin/tenants/onboarding/:draftId` | Resume draft (same visual language) |

### Out of scope (do not redesign here)

- Onboarding Drafts (`UI-3B`)
- Onboarding Operation / Result (`UI-3C`)
- Tenant List / Tenant Detail / Dashboard (regression boundaries only)
- Backend APIs, validators, provisioning, payment confirmation, activation mutations

### Non-goals

- Reordering / renaming / inventing wizard business steps  
- Creating a global wizard framework  
- Raising Angular style budgets  
- Orange or non-blue Super Admin primary theming  

---

## 3. Approved Visual Concept

Approved composition (must not regress to flat CRUD):

```text
Global Super Admin shell (deep navy sidebar + cool canvas)
↓
PageHeader / breadcrumb context
↓
Premium blue onboarding hero
↓
7-step wizard stepper
↓
Main content workspace
    ├── primary form area (~70–75%)
    └── contextual right-side setup summary (~25–30%)
↓
Sticky wizard footer
    Back | Save Draft | Cancel | Primary CTA
```

Character target:

```text
Premium · Modern · Attractive · Professional · Controlled color · Enterprise SaaS
```

Workflow signal the UI must communicate:

> “This is an important platform onboarding workflow.”

---

## 4. Product Identity

### OneVerz Super Admin

- Product name visible via shell brand + PageHeader context  
- No legacy `SCS-TIX` / consumer Nytroz branding on this page  
- Copy uses: Tenant, Subscription Plan, Draft, Tenant Admin, Create Tenant  

### Blue Theme (mandatory)

| Role | Direction | Prefer token |
| --- | --- | --- |
| Shell | Deep navy / midnight | Sidebar `#0f172a` (existing) |
| Primary CTA / active | Strong OneVerz blue | `--primary` `#0b5cff` |
| Hover / pressed | Deeper blue | `--primary-hover` / `--primary-active` |
| Soft info / selected | Soft blue tint | `--bg-surface-selected` / `--status-info-bg` |
| Canvas | Soft cool gray | `--bg-page` `#f8fafc` |
| Surfaces | White / cool secondary | `--bg-surface-primary` / `--bg-surface-secondary` |
| Typography | Ink / dark navy | `--text-primary` `#0f172a` |
| Success | Green semantic | `--status-success*` |
| Warning | Amber semantic | `--status-warning*` |
| Error | Red semantic | `--status-danger*` |

**Do not use orange as Super Admin primary.**

---

## 5. Design Principles

1. **Guided importance** — hierarchy shows onboarding is a platform-critical workflow.  
2. **Blue with restraint** — strong blue for action/active/focus; soft blue for context; neutrals for structure.  
3. **One job per band** — PageHeader ≠ Hero ≠ Stepper ≠ Form ≠ Footer.  
4. **Truthful states** — never paint Paid / Activated / Invitation delivered unless backend confirms.  
5. **Reuse before invent** — UI-1 primitives first; page-local only for stepper/footer structure.  
6. **Premium, not overdesigned** — production SaaS polish between basic CRUD and Dribbble fantasy.  
7. **Contract over concept** — mock/sample HTML values never ship; unsupported fields never appear.  

---

## 6. Visual Hierarchy

Top → bottom scan path:

1. Breadcrumb / PageHeader (orientation)  
2. Premium blue hero (workflow emphasis + current step cue)  
3. Seven-step stepper (progress + position)  
4. Form workspace + summary (decision work)  
5. Sticky footer (commit actions)

Density: compact, scannable, professional. Avoid massive headings, huge marketing cards, or long prose.

---

## 7. Color Direction

### Intentional strong blue

- Primary CTA (`Continue` / `Create Tenant`)  
- Current stepper item  
- Selected choice cards  
- Focus ring / focus border  
- Progress accents  
- Important workflow links  

### Soft blue

- Selected / current step background  
- Information callouts  
- Summary “live context” chips  
- Subtle selected plan surface  

### Neutrals

- Canvas, unselected cards, secondary buttons, upcoming steps, helper text  

### Forbidden

- Blue flood of entire page  
- Rainbow / multi-hue gradients  
- Orange primary accents  
- Color-only status meaning  

---

## 8. Surface System

| Level | Name | Treatment | Examples |
| ---: | --- | --- | --- |
| 0 | App canvas | `--bg-page` cool neutral | Page behind content |
| 1 | Primary page surface | White `--bg-surface-primary` + subtle border | Form workspace panel |
| 2 | Workflow / selected | Soft blue `--bg-surface-selected` + `--primary` border | Current step, selected plan |
| 3 | Elevated action | White / translucent white + `--shadow-md` | Sticky footer, optional sticky summary |

**Rules**

- Avoid card-inside-card-inside-card.  
- Prefer section dividers / spacing over nested bordered boxes.  
- Shadows only on hero, primary wizard panel, sticky footer, summary panel.  

---

## 9. Typography

| Role | Guidance |
| --- | --- |
| Page H1 | PageHeader title — single H1 |
| Hero title | Distinct from H1; shorter workflow line |
| Section title | Step section headers |
| Field label | FormField labels (≥ ~0.8125rem, weight 600) |
| Body | Readable slate secondary |
| Helper / metadata | Muted; never ultra-light or ≤9px production labels |

Use strong weight contrast. Limit font-size proliferation. HTML concept sizes are visual reference only — implementation must remain accessible.

---

## 10. PageHeader

**Reuse:** `app-page-header`

| Element | Content |
| --- | --- |
| Breadcrumb | Tenants → Create Tenant (or Resume Tenant Onboarding) |
| Title (H1) | Create a new tenant / Resume tenant onboarding |
| Description | Set up the business, subscription and first Tenant Administrator. |
| Actions (optional) | Draft status chip via StatusBadge — **one** draft indicator location preferred |

Hero must **not** repeat the PageHeader title verbatim.

---

## 11. Onboarding Hero

### Mandatory visual anchor

- Spans main content width  
- Premium blue tonal gradient surface (`--primary` family → deeper navy/blue)  
- Rounded large radius (`--radius-lg` or slightly larger page-local hero radius only if needed)  
- High-contrast inverse typography (`--text-inverse`)  
- Concise context only  

### Allowed content (examples — wire to real state)

- “7-step guided onboarding”  
- Short line: “Launch a tenant with confidence”  
- Current step label (from wizard state)  
- Draft saved / progress percent (if real)  
- Provisioning note: provisioning begins **after** Create Tenant — not before  

### Allowed decoration

- Soft radial glow  
- Subtle rings / tonal shapes  
- Restrained gradient  

### Forbidden

- Stock illustrations, emoji, giant decorative icons  
- Marketing paragraphs  
- Overdone glassmorphism  
- Claiming lifecycle outcomes not yet true  

---

## 12. Seven-Step Stepper

### Preserved business order (immutable)

1. Tenant Basic Details  
2. Business & Contact Information  
3. Subscription Plan  
4. Billing / Payment Setup  
5. Feature Entitlements  
6. Tenant Admin User  
7. Review, Create & Activation  

### Stepper State Matrix

| State | Visual Treatment | Semantic Requirement |
| --- | --- | --- |
| Current | Strong blue number disc, soft-blue selected background, emphasized label | `aria-current="step"` (or Angular equivalent); not color-only |
| Completed | Subtle success check + muted success text; quieter than current | Text/icon cue + color |
| Upcoming | Neutral number, muted label | Low emphasis, still readable |
| Error | Danger border/text + error count/badge if available | Not color-only; associate with validation |
| Disabled | N/A unless product locks future steps — current wizard allows revisit via Back | Do not invent hard locks beyond existing validation gates |

### Desktop (1440 / 1280)

- All seven steps visible  
- Single-row compact horizontal stepper  
- Number + title (+ optional very short descriptor)  
- No oversized circles / giant connector lines  

### 1024

- Wrapped **4 + 3** row layout **or** compact horizontal treatment  
- No page-level horizontal overflow  

### 768

- Horizontal locally scrollable compact stepper **or** 2-column compact step grid  
- Prefer readability over forcing seven full titles into one cramped row  

**Implementation note:** Keep as **page-local** component (planning: Shared Wizard Component NOT REQUIRED).

---

## 13. Form Workspace

### Desktop composition

```text
Main column ~70–75%   |   Summary ~25–30%
```

Main column contains:

- Current step title + one-line purpose  
- Logical field groups  
- Context callouts (sparse)  
- Field / step validation  

Use sectioning:

```text
Section title
Short purpose statement
Logical field grouping
Balanced two-column grid where appropriate
```

Full-width for addresses, long text, multi-option selections, plan grids, feature lists.

---

## 14. Right-Side Setup Summary

### Purpose

Persistent cross-step context — **not** a second form.

### Show only useful real wizard state

| Block | Source examples |
| --- | --- |
| Tenant | name, code, slug (when entered) |
| Plan | selected plan name/code |
| Billing | subscription type, billing cycle (honest derived meaning) |
| Tenant Admin | email / name when entered |
| Progress | backend `progressPercent` / current step |

### Behavior

| Breakpoint | Behavior |
| --- | --- |
| 1440 / 1280 | Side panel; sticky within content if practical |
| 1024 | Move below form or become two compact support cards |
| 768 | Stack below |

Do not repeat every field. Do not invent persisted data. Single draft-status treatment (header **or** summary — not both competing).

---

## 15. Form Fields

**Reuse:** `app-form-field`

| Need | Direction |
| --- | --- |
| Surface | Soft neutral input on white/secondary |
| Border | `--border-default`; error → `--status-danger` |
| Label | Clear, associated via `for` / id |
| Required | Label + semantic `*` (FormField already supports) |
| Focus | `--border-focus` + `--shadow-focus` blue halo |
| Helper | Muted helper under control |
| Error | Message directly below field; linked for a11y |

Avoid Material floating labels (not UI-1), thick borders, shadowed inputs, tiny gray labels.

---

## 16. Choice / Selection Controls

Use compact choice cards for decision surfaces (plans, and **only if** current options model supports card UX for discrete enums).

| State | Visual |
| --- | --- |
| Unselected | Neutral surface, subtle border |
| Selected | Soft blue bg, blue border, clear selected control |
| Disabled | Reduced opacity + not-allowed |

**Contract conflict rule (HTML concept):** Business-profile marketing cards in the HTML concept are composition examples. Implement only if the live form/API already supports that choice model (today: `businessType` select from create-options). Prefer select/FormField unless option count and labels clearly benefit from compact cards — **do not invent a new business-profile entity**.

No giant marketing cards.

---

## 17. Subscription Plan Step

Decision-oriented, not Subscription Management clone.

Show:

- Plan name  
- Plan code  
- Price + currency + billing cycle context  
- Few decision-critical limits if already on plan option  
- Clear selected state  

Do not embed full plan configuration UI, feature catalog admin, or unrelated pricing tooling.

---

## 18. Billing / Payment Step

Planning audit: billing/payment is **partial** and server-derived for durable onboarding.

### Visual honesty rules

| May show | Must not claim unless confirmed |
| --- | --- |
| Subscription type (PAID / TRIAL / DEMO) | “Paid” as completed payment |
| Billing cycle, invoice email, payment method | “Activated” |
| Help text: for PAID, draft invoice / payment follows finalize | “Completed” lifecycle |
| Derived invoice implication as **read-only** callout when PAID | Editable `createDraftInvoice` as authoritative if BE ignores it |

Clearly separate:

```text
billing configuration
≠ payment confirmation state
≠ activation state
≠ invitation delivery
```

Prefer removing or demoting non-persisted misleading controls (`billingStatus`, `subscriptionStatus`, `createDraftInvoice`) to read-only/help — without changing finalize payload semantics incorrectly.

---

## 19. Feature Entitlements Step

Compact grouped module/feature rows.

Differentiate only states backed by real logic:

| State | Treatment |
| --- | --- |
| Enabled (selected) | Checked + soft selected surface |
| Available but off | Neutral checkbox |
| Plan-disallowed | Disabled + helper (“Not included in selected plan”) |

Do not invent “Override” chrome unless existing create-flow semantics expose it (post-create entitlement editor is Tenant Detail / outside UI-3A).

---

## 20. Tenant Admin Step

Reinforce **First Tenant Administrator** calmly.

- Identity fields via FormField  
- Information callout: admin is prepared for invitation; email delivery / invitation status is confirmed later on operation result — not by wizard submit alone  
- No temporary-password controls (existing contract)  

---

## 21. Review & Activation Step

Premium structured summary — not a replay of every input control.

Groups:

```text
Tenant · Business · Subscription · Billing · Entitlements · Tenant Admin
```

Each group: clear label, key values, short metadata.

Truthfulness:

```text
information entered
configuration selected
provisioning not started until Create Tenant succeeds
```

Supporting line near CTA:

> Provisioning will begin after submission.

Primary action: **Create Tenant** (one strong blue CTA). No unnecessary confirmation dialog unless product later requires it (current behavior: direct finalize).

Success transition: navigate to existing operation-status route (UI-3C visual redesign out of scope). Reserve calm transition; do not invent a fake success celebration page inside UI-3A.

---

## 22. Wizard Footer

**Page-local** sticky footer (Level 3 surface).

### Layout

```text
LEFT                          RIGHT
Back · Save Draft · save-state     Cancel · Continue / Create Tenant
```

### Rules

- Soft elevated white / translucent white; `--shadow-md`  
- Must not visually overpower hero/workspace  
- Content area needs bottom padding so footer never covers fields or errors  
- Must not trap keyboard focus  
- Exactly one dominant primary action  

---

## 23. Button Hierarchy

**Reuse:** `app-button` variants only — **no page-local `.btn` dialect**.

### Action Matrix

| Context | Primary | Secondary | Tertiary |
| --- | --- | --- | --- |
| Steps 1–6 | Continue | Back, Save Draft | Cancel → tenants list (or equivalent safe exit) |
| Step 7 | Create Tenant | Back, Save Draft | Cancel |
| Saving draft | Primary disabled or non-dominant; show Saving… | Back disabled while saving if current | Cancel disabled while saving if current |
| Submission loading | Create Tenant loading / disabled | Others disabled | Disabled |
| Submission error | Create Tenant remains available after error clears busy | Save Draft available | Cancel available |
| Options load failure | Continue disabled | Retry via reload/error action | Cancel |

Micro-interactions: hover / pressed / focus-visible / loading / disabled — transitions ~120–220ms. No bounce/scale theatrics.

---

## 24. Draft States

| State | Visual Direction |
| --- | --- |
| Unsaved | Quiet “Unsaved changes” or empty save-state (only if trackable without fake autosave) |
| Saving | “Saving…” + button busy |
| Saved | “Saved” + real `lastSavedAt` when available |
| Save failed | Danger text “Couldn’t save draft” + safe error; allow retry |

No fake autosave. Do not invent timestamps. Prefer one draft indicator (footer live region and/or single StatusBadge).

---

## 25. Loading / Error / Empty / Validation

| Concern | Direction |
| --- | --- |
| Initial options load | Section/`LoadingSkeleton` — avoid full-app block when possible |
| Draft resume load | Skeleton over workspace |
| Field validation | FormField error under control |
| Step validation | Stepper error state + focus first invalid |
| Server field errors | Map into FormField |
| Business conflict / submit fail | Compact alert or ErrorState — not giant red for one field |
| Page-load failure | Shared `ErrorState` |
| No plans / empty options | Shared `EmptyState` — never blank dead selects |
| Destructive confirms | `ConfirmationDialog` only if UI-3A introduces discard/cancel-with-unsaved (optional; not required to invent canDeactivate) |

---

## 26. Interaction / Micro-Interaction

**Allowed**

- Subtle hover lift on choice cards  
- Soft surface / selection transitions  
- Focus halo  
- Step content swap (simple, not dramatic slide theater)  
- Button loading  

**Forbidden**

- Parallax, constant pulsing, animation-heavy wizard  
- Sliding every panel dramatically  

---

## 27. Responsive Rules

### Responsive Composition Matrix

| Area | 1440 | 1280 | 1024 | 768 |
| --- | --- | --- | --- | --- |
| Hero | Full-width premium, polished | Full-width, slightly tighter | Full-width, compact padding | Full-width, stacked text, no overflow |
| Stepper | 7-step single row | 7-step single row | Wrap 4+3 or compact row | Scrollable compact **or** 2-col grid |
| Form | 2-col fields in ~70% column | Same, tighter gaps | Readable 2→1 col as needed | Single column |
| Summary | Sticky side ~25–30% | Side-by-side if practical | Below form or 2 compact cards | Stacked below |
| Footer | Sticky; respects shell sidebar offset | Sticky | Sticky; usable wrapping | Sticky; stacked action groups OK; no cover |

### 1440

Balanced shell + content; seven steps visible; form + summary side-by-side; comfortable field widths.

### 1280

Same composition; tighter spacing; no cramped controls.

### 1024

Stepper may wrap; summary may drop below; footer remains usable; no horizontal page overflow.

### 768

Single-column content; compact/scrollable stepper; stacked fields + summary; sticky footer accessible; desktop Super Admin still — not a separate mobile product.

---

## 28. Accessibility

### Contract

- Single H1 (PageHeader)  
- Semantic stepper list with current-step announcement  
- Keyboard-accessible controls and tab order  
- `focus-visible` never removed without replacement  
- Label association + required indicators  
- Error text associated to controls  
- Status not color-only (text/icon + color)  
- Useful contrast on hero (inverse on blue) and form (ink on white)  
- Sticky footer: no covered validation, no focus trap; content bottom spacing  

### Stepper a11y

Prefer `aria-current="step"` on current item; completed/error expose text alternatives (check mark label / “has errors”).

---

## 29. UI-1 Component Reuse

Planning finding: **UI-1 Primitive Reuse: FAIL** — UI-3A must flip this to PASS.

| Primitive | Contract |
| --- | --- |
| PageHeader | **REUSE** |
| Button | **REUSE** |
| FormField | **REUSE** |
| StatusBadge | **REUSE** (draft/status chips) |
| LoadingSkeleton | **REUSE** |
| ErrorState | **REUSE** |
| EmptyState | **REUSE** |
| ConfirmationDialog | **REUSE WHERE REQUIRED** |
| Design tokens | **REUSE** (`src/styles.scss`) |

### Design Token Mapping

| Visual Need | Existing UI-1 Token / Primitive | New Page-Local Need |
| --- | --- | --- |
| Primary blue | `--primary`, `--primary-hover`, `--primary-active` | None |
| Canvas | `--bg-page` | None |
| Surface | `--bg-surface-primary`, `--bg-surface-secondary` | None |
| Selected / soft blue | `--bg-surface-selected`, `--status-info-bg` | Hero gradient stops may be page-local using primary family |
| Border | `--border-default`, `--border-subtle`, `--border-strong` | None |
| Focus | `--border-focus`, `--shadow-focus` | None |
| Success | `--status-success*` | None |
| Warning | `--status-warning*` | None |
| Error | `--status-danger*` | None |
| Radius | `--radius-sm/md/lg/pill` | Optional hero-only slightly larger radius if needed — do not invent global token |
| Shadow | `--shadow-sm/md/lg` | Soft blue-gray tint OK page-locally without new global token |
| Spacing | `--space-1`…`--space-7` (4–48px) | Prefer 4/8/12/16/24/32 rhythm via tokens |
| PageHeader | `app-page-header` | None |
| Button | `app-button` | None |
| FormField | `app-form-field` | None |
| StatusBadge | `app-status-badge` | None |
| Shell navy | Existing sidebar `#0f172a` | Do not recolor shell in UI-3A |

**Do not create redundant global tokens** for UI-3A.

---

## 30. Page-Local Wizard Components

| Component | Classification |
| --- | --- |
| WizardStepper | **PAGE-LOCAL** |
| WizardFooter | **PAGE-LOCAL** |
| OnboardingHero | **PAGE-LOCAL** |
| SetupSummaryPanel | **PAGE-LOCAL** |

Do **not** create a shared global wizard framework unless a second Super Admin multi-step flow later justifies extraction.

---

## 31. Style Budget Strategy

- Current Create Tenant: **no** 6 kB style warning — do not regress.  
- Prefer **≤ 6 kB** component styles.  
- If approaching limit: remove duplication → reuse primitives → tokens → consolidate responsive rules → delete dead selectors.  
- **Never** raise Angular budgets.  
- **Never** dump page CSS into global `styles.scss` to hide a warning.  
- Visual quality must not be destroyed solely for an arbitrary byte chase — but structure CSS for reuse first.

---

## 32. Must-Look-Like Contract

Implementation must feel like:

```text
premium enterprise SaaS onboarding
cohesive blue OneVerz product
guided workflow
professional customer provisioning
visually engaging but operationally serious
layered cool canvas + blue anchors
clear action hierarchy
```

Target quality bar for acceptance:

```text
Visual ≥ 8/10
UX ≥ 8/10
Modern SaaS fit ≥ 8/10
```

---

## 33. Must-Not-Look-Like Contract

Reject if it looks like:

```text
basic Angular Material form
Bootstrap admin template
7 plain white cards
giant flat form with no hierarchy
gray internal CRUD tool
everything boxed identically
gradient-heavy marketing page
colorful consumer app
legacy .btn / hardcoded hex dialect
orange-accent Super Admin
template-generated wizard
```

---

## 34. Business / API Preservation

Visual redesign **must not** alter:

| Area | Preserve |
| --- | --- |
| Routes | `/admin/tenants/create`, `/admin/tenants/onboarding/:draftId` |
| Step order / names (business) | 7 steps listed above |
| Validation semantics | Existing FE/BE rules (fix honesty gaps without inventing API) |
| Save Draft / resume | Durable draft APIs + versioning |
| Submit | Finalize + Idempotency-Key |
| Payload / provisioning | Plan, entitlements, defaults, admin bootstrap |
| Payment / activation / invitation | Semantics & truth boundaries |
| Post-submit navigation | Existing operation-status destination |

```text
Business Logic Change: NONE
API Change: NONE
Route Change: NONE
```

### Documented concept adaptations (non-blockers)

1. HTML “business profile cards” → only if mapped to existing `businessType` (or keep select).  
2. Non-persisted billingStatus / subscriptionStatus / createDraftInvoice → honest UI treatment.  
3. Cancel tertiary control may be added visually; must navigate safely without breaking draft contracts.  
4. Addon hydration / validation alignment remain implementation contract items from planning audit — not visual blockers.

---

## 35. Regression Boundaries

| Boundary | Rule |
| --- | --- |
| UI-2A Dashboard | Unchanged |
| UI-2B Tenant List | Create CTA still valid; list behavior preserved |
| UI-2C Tenant Detail | Deep links preserved |
| UI-1 global shell | Navy sidebar + tokens preserved; no shell redesign in UI-3A |

---

## 36. Implementation Acceptance Criteria

A successful UI-3A implementation should achieve:

- Premium blue identity recognizable as OneVerz Super Admin  
- Hero + stepper + form/summary + sticky footer composition present  
- UI-1 reuse **PASS**  
- Legacy `.btn` / local form dialect **removed**  
- Responsive 1440 / 1280 / 1024 / 768 per matrix  
- Accessibility contract met or only documented non-blocking gaps  
- Style budget not raised; prefer ≤6 kB  
- All business/API/route contracts preserved  
- Visual / UX / Modern SaaS qualitative targets ≥ 8/10  

---

## 37. Independent Verification Criteria

Future read-only verification must compare implementation to this spec for:

```text
blue identity
hero
stepper states
form hierarchy
summary panel
sticky footer
action hierarchy
surface hierarchy
typography
spacing
responsive behavior (4 breakpoints)
validation / loading / empty / error
UI-1 reuse
legacy pattern removal
business truthfulness (billing/payment/activation/invite)
regression boundaries
style budget
```

---

## 38. Final Visual Direction Verdict

```text
SUPER ADMIN UI-3A PREMIUM BLUE VISUAL DIRECTION APPROVED — READY FOR IMPLEMENTATION
```

**Implementation blockers:** NONE  

Documented adaptations (concept → contract) are non-blocking and must be followed during implementation.

---

## Appendix A — Visual Debt Removal Matrix

| Current Problem | Target Replacement |
| --- | --- |
| Legacy local `.btn` | UI-1 `Button` |
| Legacy form styles / raw labels | UI-1 `FormField` |
| Flat wizard / weak stepper | Premium page-local stepper + states |
| Weak hierarchy | PageHeader + blue hero + sections |
| Plain white everywhere | Layered surfaces (canvas → panel → selected → footer) |
| Custom toast / status ad hoc | StatusBadge + ErrorState + FormField errors |
| Weak responsive footer/grids | Four-breakpoint composition matrix |
| Misleading billing affordances | Honest read-only / derived callouts |

---

## Appendix B — Page State Matrix

| State | Visual Direction |
| --- | --- |
| Initial loading | Skeleton for options/workspace |
| Draft loading | Skeleton + muted resume context |
| Editing | Full hierarchy interactive |
| Unsaved | Quiet indicator; no fake autosave |
| Saving | Footer/button busy + “Saving…” |
| Saved | “Saved” + real timestamp if present |
| Validation error | Field errors + stepper error marks; focus first invalid |
| Server error | Safe message; ErrorState/alert by severity |
| Submission loading | Primary Create Tenant loading; disable competing actions |
| Submission success transition | Navigate to existing operation result; no fake “fully live” claim |

---

## Appendix C — Workflow Status Reminder

```text
Planning Audit                 ✅ COMPLETE
UI-3A Visual HTML Concept      ✅ APPROVED (composition reference)
UI-3A Visual Direction Spec    ✅ THIS DOCUMENT
UI-3A Implementation           ⏳ NOT STARTED
UI-3A Independent Verification ⏳ NOT STARTED
```

---

**End of Visual Direction Specification.**
