# OneVerz Super Admin — UI-3C Tenant Onboarding Operation Status
# Premium Blue Visual Direction Specification

**Document type:** Official visual direction / implementation design contract
**Product:** OneVerz Super Admin
**Scope slice:** UI-3C — Tenant Onboarding Operation Status
**Theme:** BLUE (mandatory)
**Date:** 2026-08-11
**Status:** APPROVED for controlled implementation after documentation merge

**Authority order (implementation must follow):**

1. This Visual Direction Specification
2. Approved HTML visual prototype (layout/character reference only)
3. UI-1 shared design-system rules / tokens / primitives
4. Planning Audit — authoritative for backend contract, lifecycle, and permissions
5. Existing business / API / onboarding contracts

If visual concept conflicts with actual business/data contract → **business/data contract wins**. Adapt the visual pattern; do not invent fields, steps, or lifecycle states.

**Related evidence:**

| Artifact | Reference |
| --- | --- |
| Planning Audit | `15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SUPER_ADMIN_UI3C_TENANT_ONBOARDING_OPERATION_STATUS_PLANNING_AUDIT_2026-08-11.md` |
| Planning commit | `241da9e8e4019bd4d6dde7a7ca9f3433b9a3d933` (merged via PR #72 → `b058939`) |
| Approved HTML prototype | `07_UI_UX_KNOWLEDGE/prototypes/oneverz_ui3c_operation_status_premium_blue_prototype.html` |
| UI-3A Visual Direction | `07_UI_UX_KNOWLEDGE/SUPER_ADMIN_UI3A_CREATE_TENANT_PREMIUM_BLUE_VISUAL_DIRECTION.md` |
| UI-3B Visual Direction | `07_UI_UX_KNOWLEDGE/SUPER_ADMIN_UI3B_ONBOARDING_DRAFTS_PREMIUM_BLUE_VISUAL_DIRECTION.md` |
| UI-1 tokens | Platform Admin `src/styles.scss` `:root` |
| Shell identity | Sidebar deep navy `#0f172a` + primary blue `#0b5cff` |

---

## 1. Purpose

Freeze the **premium blue visual contract** for UI-3C so implementation produces a trustworthy, high-hierarchy async operation status experience — not a generic spinner page or wizard clone — while preserving every existing operation lifecycle, polling, retry, and permission semantic.

This document converts the Planning Audit + user-approved HTML prototype into an implementation-ready design contract.

---

## 2. Scope

### In scope (UI-3C)

| Route | Experience |
| --- | --- |
| `/admin/tenants/onboarding/operations/:operationId` | Post-submit operation status + lifecycle |

### Out of scope (do not redesign here)

- Create Tenant Wizard (`UI-3A`) — CLOSED
- Onboarding Drafts (`UI-3B`) — CLOSED
- Tenant List / Tenant Detail / Dashboard (regression boundaries only)
- Backend APIs, validators, provisioning, payment flow, activation mutations
- Operation history list
- UI-4

### Non-goals

- Numeric provisioning progress
- Fake ETA / countdown
- Global async-operation framework
- Reordering backend lifecycle stages
- Persistent Operations sidebar menu
- New backend APIs or DB migrations

---

## 3. Planning Audit Inputs

| Input | Value |
| --- | --- |
| Planning Audit | `ONEVERZ_SUPER_ADMIN_UI3C_…PLANNING_AUDIT_2026-08-11.md` |
| Planning verdict | `SUPER ADMIN UI-3C READY WITH NON-BLOCKING GAPS — PREMIUM VISUAL DIRECTION MAY BEGIN` |
| Backend readiness | `CURRENT BACKEND SUFFICIENT WITH NON-BLOCKING GAPS` |
| DB migration required | NO |
| Progress model | STATUS-ONLY |
| Lifecycle dimensions | 4-step post-submit (not UI-3A wizard) |
| Polling interval | 5 000 ms |
| Terminal states | `SUCCEEDED`, `FAILED_FINAL` |
| Retry | PARTIAL — outbox retry; rarely visible |
| Cancel | NOT SUPPORTED |
| Deep-link refresh | PASS |
| Persistent nav | NOT REQUIRED |

---

## 4. Approved Prototype

| Property | Value |
| --- | --- |
| File | `07_UI_UX_KNOWLEDGE/prototypes/oneverz_ui3c_operation_status_premium_blue_prototype.html` |
| User approval | **YES — explicitly approved** |
| Visual Quality | 9/10 |
| UX Direction | 9/10 |
| Modern SaaS Fit | 9/10 |
| Operational Clarity | 9/10 |
| 1440 / 1280 / 1024 / 768 | ALL PASS |
| Horizontal overflow | NONE |
| Accessibility direction | PASS |

---

## 5. User Visual Approval

```text
Prototype reviewed and approved by user.
Visual direction may proceed.
```

---

## 6. Product Identity

### OneVerz Super Admin

- Product name visible via shell brand + PageHeader context
- No legacy `SCS-TIX` / consumer Nytroz branding on this page
- Copy uses: Tenant, Payment, Activation, Invitation, Operation, Lifecycle

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

### Required character

```text
Premium · Modern · Attractive · Enterprise · Operational · Trustworthy · Calm · Clear · High-confidence
```

---

## 7. Approved Page Pattern

```text
PREMIUM STATUS + PROVISIONING LIFECYCLE
```

This is the frozen production pattern. Do NOT convert to: wizard, dashboard, master-detail, CRUD page, generic spinner, marketing success screen, or operation history page.

---

## 8. UI-3A / UI-3B / UI-3C Boundaries

| Slice | Pattern | Status |
| --- | --- | --- |
| UI-3A | 7-step create tenant wizard | CLOSED |
| UI-3B | Saved onboarding drafts table | CLOSED |
| UI-3C | Post-submit operation status + lifecycle | THIS SPEC |

UI-3C must NOT reuse `Step 1 of 7 … Step 7 of 7` from UI-3A. The lifecycle timeline is an operational status view, not a user workflow stepper.

---

## 9. Business / Backend Constraints

### Progress model

```text
Numeric Progress Bar: NOT ALLOWED
Fake progress percentage: PROHIBITED
Fake ETA: PROHIBITED
Timer-based progress: PROHIBITED
Animated percentage growth: PROHIBITED
```

Backend does not expose `progressPercent` or numbered provisioning stages on operations.

### Lifecycle ordering

The 4-step post-submit lifecycle is arranged in logical business order for comprehension. The visual must NOT imply strict sequential backend execution. Use "Lifecycle status" framing rather than "Step X of Y".

### Polling contract (do not change)

```text
Initial request: immediate (timer(0, 5000))
Interval: 5 000 ms
Stop: status not in PROCESSING / FAILED_RETRYABLE
Error: sets error, stops subscription
Cleanup: takeUntilDestroyed — PASS
```

### Critical polling nuance

Finalize creates `status=SUCCEEDED` synchronously → polling stops after first response while payment/activation/invitation dimensions may still evolve. Manual Refresh is required to see updated lifecycle dimensions after operation success. Implementation must NOT assume `operation SUCCEEDED` = all dimensions complete.

### Cancel: NOT SUPPORTED

### Retry: CONDITIONAL

Retry appears only when `retryable === true` AND user has required permission (`platform.billing.manage`). Retry re-queues failed outbox messages — it does NOT recreate the tenant.

---

## 10. High-Level Page Composition

```text
Existing Super Admin Shell (sidebar + topbar)
↓
Shared PageHeader
↓
[Poll Error Banner — conditional]
↓
Premium Operation Status Surface
↓
Post-Submit Lifecycle Timeline
↓
Tenant / Operation Context + Guidance
↓
Primary + Secondary Actions
```

Avoid excessive cards. Target 2–3 meaningful main surfaces.

---

## 11. PageHeader

Use shared UI-1 `PageHeader` component.

| Element | Value |
| --- | --- |
| Eyebrow | `Platform Admin` |
| H1 (active/pending) | `Creating Tenant` or `Tenant Setup Status` |
| H1 (terminal/result) | `Tenant Setup Status` |
| Description | Track tenant creation and post-setup lifecycle. |
| Header actions | `Back to Tenants` (ghost), `Refresh Status` (secondary) |

Do NOT use raw operation ID as H1.

---

## 12. Tenant Identity Hierarchy

Where tenant identity is available from operation response:

```text
Primary:   Tenant / business name (from tenant projection when available)
Secondary: Tenant code
Tertiary:  Operation ID (monospace, compact, support metadata only)
```

Never make a long GUID the dominant page identity.

Render tenant identity only when `tenantId` is present and tenant projection is available.

---

## 13. Premium Operation Status Surface

The top status surface answers: **"What is the overall situation right now?"**

### Structure

```text
[Status Icon] [Status Copy + Tenant Identity + Updated] [Status Badge]
```

Grid: `auto 1fr auto`, center-aligned.

### Visual variants

| State family | Surface style | Icon treatment |
| --- | --- | --- |
| Running / Payment Pending / Activation Pending / Long-Running | Premium blue gradient (`#0a3d91 → #0b5cff → #003cbd`), white text | Frosted white circle, spinner or pulse |
| Success | White surface, success border | Success-bg circle, check icon |
| Failure | White surface, danger border | Danger-bg circle, X icon |
| Poll Error | White surface, neutral border | Warning-bg circle, warning icon |
| Not Found | White surface, neutral border | Neutral circle, question icon |

### Content

- **h2** headline — state-specific (see state definitions below)
- **p** supporting copy — concise, truthful
- **Tenant identity** — name + code when available
- **Updated** timestamp — `updatedAt` from operation response
- **Status badge** — pill with dot, state-specific color

---

## 14. Running State

| Element | Value |
| --- | --- |
| Surface | Premium blue gradient |
| Headline | `Tenant setup is in progress` |
| Subcopy | The tenant has been submitted and provisioning is continuing. |
| Badge | `Processing` (white-on-blue pill) |
| Icon | Spinner (CSS animation) |
| Activity | Small spinner + optional pulse on active timeline node |

**Prohibited:** fake percentage, fake ETA, countdown, animated stage completion.

---

## 15. Payment Pending State

| Element | Value |
| --- | --- |
| Surface | Premium blue gradient |
| Headline | `Tenant created — payment setup pending` |
| Subcopy | Core tenant provisioning completed. Manual payment setup is pending. |
| Badge | `Payment pending` (warning semantic) |
| Lifecycle | Provisioning ✓, Payment ●, Activation ○, Invitation ○ |
| Guidance tone | Warning — "Payment is separate from failure" |

Payment pending is a lifecycle state, NOT an operation failure. Do not visually treat it as failure. Show only when backend `paymentStatus` is `AWAITING_PAYMENT` (or equivalent non-terminal payment state) while operation `status` is `SUCCEEDED`.

---

## 16. Activation Pending State

| Element | Value |
| --- | --- |
| Surface | Premium blue gradient |
| Headline | `Payment approved — activation pending` |
| Subcopy | Tenant creation succeeded. Activation lifecycle is still in progress. |
| Badge | `Activation pending` (info semantic) |
| Lifecycle | Provisioning ✓, Payment ✓, Activation ●, Invitation ○ or Queued |

Do not claim tenant is active unless activation state guarantees it.

---

## 17. Invitation Pending State

Invitation is typically shown alongside activation rather than as a standalone state. The lifecycle timeline communicates invitation status independently.

**Critical truthfulness:**

```text
Queued ≠ Sent ≠ Delivered
```

Never display "Invitation email sent" when backend only guarantees "Invitation queued" (`invitationStatus: PENDING`). Use exact backend enum mapping:

| Backend value | UI label |
| --- | --- |
| `NOT_ELIGIBLE` | Not eligible |
| `PENDING` | Queued |
| `SENT` | Sent |
| `FAILED` | Failed |
| `ACCEPTED` | Accepted |
| `EXPIRED` | Expired |

---

## 18. Long-Running State

| Element | Value |
| --- | --- |
| Surface | Premium blue gradient |
| Headline | `Tenant setup is taking longer than usual` |
| Subcopy | You can safely leave this page and return using this operation link. |
| Badge | `Still processing` |
| Icon | Spinner |
| Guidance | Deep-link refresh is reliable; no fake ETA |

Trigger: implementation-defined heuristic (e.g., elapsed time > threshold while `status === 'PROCESSING'`).

`Long running ≠ failed`. The operator must understand they can safely leave and return.

---

## 19. Success State

| Element | Value |
| --- | --- |
| Surface | White, success border |
| Headline | `Tenant setup complete` — ONLY if all lifecycle dimensions are terminal/complete |
| Alternative | `Tenant created successfully` + separate lifecycle states if dimensions remain pending |
| Badge | `Complete` (success semantic) |
| Icon | Check (green) |
| Character | Calm, premium, confident. No confetti, no giant checkmark, no marketing illustration. |

OneVerz Blue remains the visual environment. Green is semantic support only — do not turn the entire page green.

### Success tenant context

When returned by backend:

```text
Tenant Name
Tenant Code
Tenant Status (e.g., Active)
Completion timestamp (updatedAt)
```

Do not show fields unsupported by operation response.

---

## 20. Failure State

Failure must clearly answer:

1. What failed?
2. What has already succeeded?
3. Is a tenant already created?
4. Can I safely retry?
5. What should I do next?

| Element | Value |
| --- | --- |
| Surface | White, danger border |
| Headline | `Tenant setup needs attention` (retryable) or `Tenant provisioning could not fully complete` (final) |
| Badge | `Retry eligible` (retryable) or `Failed` (final) |
| Icon | X (red) |
| Guidance tone | Danger — partial provisioning possible |
| Color | Red/error semantic selectively. Do NOT flood the whole page red. |

Do not reduce partial provisioning to "Something went wrong."

---

## 21. Partial Provisioning

Planning Audit: **Partial Provisioning Possible: YES**

Failure states must support the scenario where some setup work already completed (e.g., tenant exists, payment processed) while a subsequent dimension (e.g., invitation delivery) failed.

**Rules:**
- Do not instruct operators to blindly recreate the tenant
- Show which lifecycle dimensions succeeded/failed via the timeline
- `failureCode` displayed as support reference when available and safe
- Safe failure message via `ApiErrorService.toSafeMessage` — never raw exceptions

---

## 22. Retry Eligibility / Safety

| Rule | Value |
| --- | --- |
| Retry availability | CONDITIONAL — only when `retryable === true` |
| Frontend gate | `platform.billing.manage` permission |
| Backend gate | `tenants.update` OR `billing.manage` |
| Retry meaning | Re-queues failed outbox/delivery messages |
| Retry ≠ | Create tenant again |
| Retry label | `Retry Processing` or backend-accurate equivalent |
| Retry absent | Do NOT show disabled retry. Omit the button entirely. |

**Hard rule:** Never expose a Retry CTA if the frontend cannot establish safe retry eligibility from actual backend state (`retryable` field + permission check).

---

## 23. Poll Error State

**This state MUST remain distinct from backend operation failure.**

| Element | Value |
| --- | --- |
| Surface | White, neutral border |
| Banner | Danger alert: "We couldn't refresh the latest status." |
| Headline | `Unable to refresh status` |
| Subcopy | This is a transport error — not proof that tenant provisioning failed. |
| Badge | `Refresh needed` (warning) |
| Last known state | Preserve and display when safe |
| Primary action | `Refresh Status` |
| Secondary action | `Back to Tenants` |

**Hard acceptance rule:** poll/network error must NEVER be presented as operation failure.

---

## 24. Not Found / Permission States

### Not Found (404)

| Element | Value |
| --- | --- |
| Headline | `Operation not found` |
| Subcopy | This operation reference could not be loaded. |
| Primary action | `Back to Tenants` |
| Tenant identity | Hidden |
| Security | Do not expose internal lookup details |

### Permission Denied (403)

| Element | Value |
| --- | --- |
| Headline | `You don't have permission to view this operation` |
| Primary action | `Back to Tenants` |
| Security | Do not reveal operation existence beyond backend behavior |

---

## 25. Manual Refresh

```text
Manual Refresh: SUPPORTED
```

Compact secondary `Refresh Status` button in PageHeader actions and in the actions bar.

Manual refresh must not visually compete with the primary outcome action (e.g., View Tenant on success).

---

## 26. Lifecycle Timeline

The lifecycle timeline is central to UI-3C. It answers: **"Where are the post-submit lifecycle dimensions?"**

### Dimensions (4 — derived from real backend data, NOT UI-3A wizard steps)

| # | Label | Backend source | Render rule |
| --- | --- | --- | --- |
| 1 | Tenant created | `provisioningStatus`, `tenantId` | Always render |
| 2 | Payment setup | `paymentStatus` | Always render |
| 3 | Tenant activation | Tenant projection / payment eligibility | Always render |
| 4 | Tenant Admin invitation | `invitationStatus` | Always render |

Do not add a fifth dimension. Do not convert to UI-3A wizard steps.

### Timeline node states

| Visual state | Marker | Border/BG | Use when |
| --- | --- | --- | --- |
| Completed | ✓ | Success border, success-bg | Dimension is terminal-complete |
| Current / Active | ● | Primary border, primary-bg, focus ring | Dimension is the current active lifecycle stage |
| Waiting | Number | Neutral border, neutral-bg | Dimension not yet reached |
| Failed | ! | Danger border, danger-bg | Dimension failed |

### Connector lines

- Completed → Completed: success color
- Current → next: gradient (primary → neutral)
- Failed: danger-border color
- Default: neutral border

### Responsive timeline

| Width | Layout |
| --- | --- |
| ≥1025 | Horizontal 4-column grid with connector lines |
| 768–1024 | 2-column grid, connectors hidden |
| <768 | Vertical single-column, vertical connectors |

### Heading

```text
Post-submit lifecycle
```

Uppercase, muted, small — section label only.

### Accessibility

Each timeline item must include a text label AND a text state. Color/icon alone is insufficient.

```text
Example: "Tenant created — Completed"
         "Payment setup — Awaiting payment"
```

---

## 27. Overall Status vs Lifecycle

```text
Top status surface:  Overall operation situation (one answer)
Lifecycle timeline:  Where are the 4 post-submit dimensions?
Context section:     What tenant/result do I have, what do I do next?
```

Do not show several equal-weight status badges with no hierarchy. The status surface provides the single dominant signal; the timeline provides dimensional detail.

---

## 28. Operation Metadata

Compact secondary metadata in the context panel:

| Field | Source | Render rule |
| --- | --- | --- |
| Tenant status | Tenant projection | When available |
| Payment status | `paymentStatus` | Always |
| Invitation status | `invitationStatus` | Always |
| Subscription plan | Tenant/subscription projection | When available |
| Operation ID | `id` | Always (monospace, compact) |
| Reference / failure code | `failureCode` | Only in failure states |

Do not create a technical debug panel.

---

## 29. Support / Failure Reference

Planning Audit: **Support / Correlation Reference: PARTIAL**

- Display `failureCode` as `Reference: <code>` only in failure context
- Do not invent correlation/support ticket IDs
- Do not expose stack traces, exception text, or internal infrastructure data

---

## 30. Success Actions

| Priority | Label | Target | Condition |
| --- | --- | --- | --- |
| Primary | `View Tenant` | `/admin/tenants/:tenantId` | `tenantId` exists |
| Secondary | `Back to Tenants` | `/admin/tenants` | Always |
| Tertiary | `Create Another Tenant` | `/admin/tenants/create` | Optional, low-emphasis ghost |

---

## 31. Failure Actions

### Retryable failure

| Priority | Label | Condition |
| --- | --- | --- |
| Primary | `Retry Processing` | `retryable === true` AND `platform.billing.manage` |
| Secondary | `View Tenant` | `tenantId` exists |
| Tertiary | `Back to Tenants` | Always |

### Non-retryable failure

| Priority | Label | Condition |
| --- | --- | --- |
| Primary | `View Tenant` | `tenantId` exists |
| Secondary | `Back to Tenants` | Always |
| Prohibited | `Retry Processing` | Must NOT appear |

Do not leave a disabled Retry button. Omit it entirely when retry is unavailable.

---

## 32. Poll Error Actions

| Priority | Label |
| --- | --- |
| Primary | `Refresh Status` |
| Secondary | `Back to Tenants` |

---

## 33. UI-1 Primitive Reuse

Planning Audit found: **UI-1 Primitive Reuse: FAIL**

Implementation MUST correct this.

| Need | Existing Primitive | Rule |
| --- | --- | --- |
| Page header | `PageHeader` | REUSE |
| Primary/secondary actions | `Button` | REUSE |
| Semantic status | `StatusBadge` | REUSE where appropriate |
| Loading | `LoadingSkeleton` | REUSE |
| Error | `ErrorState` | REUSE / adapt |
| Empty / not found | `EmptyState` or equivalent | REUSE where semantically appropriate |
| Focus system | Design system focus tokens | REUSE |
| Typography | Design system tokens | REUSE |
| Spacing | Design system tokens | REUSE |
| Lifecycle visualization | Page-local composition | ALLOWED — genuine UI-3C responsibility |
| Status surface | Page-local composition | ALLOWED — genuine UI-3C responsibility |

---

## 34. Removal of Competing Local UI System

Planning Audit: **Competing Local UI System: HIGH**

Current bespoke components that must be replaced:

- `.page-heading` → `PageHeader`
- `.spinner` (local) → `LoadingSkeleton` or shared activity indicator
- `.alert` (local) → shared error/info pattern
- `.button` (local, `#175cd3`) → `Button` with design tokens
- `.card` (local) → design-token surfaces

Do NOT recreate buttons, badges, loading, error panels, or typography primitives locally.

---

## 35. Surface Hierarchy

```text
Level 0:  Neutral application canvas (#f8fafc)
Level 1:  PageHeader
Level 2:  Premium operation status surface (gradient or bordered)
Level 3:  Lifecycle timeline panel (white, bordered)
Level 4:  Tenant/result context + guidance (white/tinted panels)
Level 5:  Actions bar (white, bordered)
```

Avoid nested card stacks (card-inside-card-inside-card).

---

## 36. Premium Blue System

OneVerz Blue dominates:

- Running/pending status surface (gradient)
- Primary CTA buttons
- Active lifecycle node (border + bg)
- Focus rings
- Status badge on active states

### Brand color preservation

The application must feel BLUE overall. Semantic colors support specific states but do not replace brand identity.

---

## 37. Semantic Color System

| Semantic | Usage | Rule |
| --- | --- | --- |
| Success (green) | Completed icon, completed timeline node, success badge | Selective only — do NOT turn the page green |
| Warning (amber) | Payment pending, poll error badge, pending guidance | Restrained — pending ≠ failure |
| Danger (red) | Failure icon, failed timeline node, failure guidance, retry context | Selective — do NOT flood the page red |

---

## 38. Typography

| Level | Usage | Token direction |
| --- | --- | --- |
| H1 | Page title | `--text-primary`, `clamp(1.35rem, 2.2vw, 1.75rem)` |
| H2 | Status headline | `1.25rem`, bold |
| H3 | Section headings (timeline, context, guidance) | `0.8125rem–0.9375rem`, bold |
| Body | Subcopy, guidance text | `0.875rem` |
| Small | Metadata, timeline node state, operation ID | `0.75rem–0.8125rem` |
| Eyebrow | PageHeader context | `0.6875rem`, uppercase, letter-spaced |

Use existing UI-1 typography tokens. Do not create a competing type scale.

---

## 39. Spacing / Density

Target density: **COMFORTABLE**

UI-3C is not a dense table page (contrast UI-3B). Give status and lifecycle enough breathing room without creating huge empty sections.

Page padding: `1.25rem 1.5rem 2rem` (desktop), `1rem` (≤768).

---

## 40. Iconography

Use approved professional icon set (consistent with UI-3A / UI-3B family):

| Context | Icon type |
| --- | --- |
| Processing | Spinner (CSS animated) |
| Success | Checkmark |
| Failure | X / cross |
| Warning / poll error | Triangle warning |
| Not found | Question mark |
| Refresh | Refresh / reload |
| View tenant | External link / arrow |

**Prohibited:** emoji, Unicode symbol hacks, random initials as icons.

---

## 41. Micro-Interactions

Approved restrained interactions:

- Soft spinner on running/long-running icon
- Pulse animation on active timeline node marker
- Button hover state transitions
- `focus-visible` outline on interactive elements
- Status surface transition on state change (layout stability preserved)

**Prohibited:** dramatic animations, confetti, fake deployment animations.

---

## 42. Dynamic Accessibility

### Status announcements

| Trigger | Announce? | Method |
| --- | --- | --- |
| Meaningful state change (PROCESSING → SUCCEEDED) | YES | `aria-live="polite"` region or equivalent |
| Identical poll response (same status) | NO | Suppress |
| Poll error | YES | `role="alert"` banner |

### Page structure

- Single H1 (page title)
- Status surface: `aria-labelledby` linking to headline
- Timeline: ordered list with `role="list"`, items with `role="listitem"`
- Actions: `aria-label` on actions section
- All buttons: accessible label text
- Focus-visible on all interactive elements

### Reduced motion

Implementation should respect `prefers-reduced-motion`. Do not depend on animation to explain state.

---

## 43. Polling Accessibility

**Hard rule:** Do NOT announce every 5-second poll response.

Only announce meaningful state transitions:

```text
PROCESSING → SUCCEEDED   → announce
PROCESSING → PROCESSING  → suppress
PROCESSING → FAILED_*    → announce
Poll error                → announce (role="alert")
```

Planning Audit: **Polling Announcement Risk: LOW normally, MEDIUM if PROCESSING persists.**

---

## 44. Responsive — 1440

```text
Wide but controlled content width
Premium status surface: 3-column grid (icon | copy | badge)
Lifecycle timeline: horizontal 4-column with connector lines
Context grid: 2-column (tenant context | guidance)
Actions bar: horizontal flex (hint left, buttons right)
```

---

## 45. Responsive — 1280

Same hierarchy as 1440 with slightly tighter widths. Reduce decorative spacing before reducing clarity.

---

## 46. Responsive — 1024

```text
Timeline: 2-column grid, connector lines hidden
Context grid: stacked single-column
Status surface: preserved 3-column
Actions: may wrap cleanly
```

---

## 47. Responsive — 768

```text
Sidebar: hidden
Status surface: single-column stacked, badge left-aligned
Timeline: vertical single-column with vertical connectors
Context grid: single-column
Actions bar: stacked full-width buttons
Page padding: reduced to 1rem
```

No horizontal page overflow. No tiny timeline labels.

---

## 48. Horizontal Overflow Contract

```text
1440: NONE
1280: NONE
1024: NONE
768:  NONE
```

Hard acceptance criterion.

---

## 49. Permissions / Action Visibility

| Action | Frontend gate | Backend gate | Notes |
| --- | --- | --- | --- |
| View route | `platform.tenants.create` | — | F-SA-UI3C-P-001: mismatch with API |
| GET operation | (implicit via route) | `platform.tenants.view` | |
| Retry | `platform.billing.manage` | `tenants.update` OR `billing.manage` | F-SA-UI3C-P-006 |
| Activate tenant | `platform.tenants.activate` | backend activate API | |
| Resend invitation | `platform.tenants.update` | backend + idempotency | |
| View tenant | `platform.tenants.view` | tenant API | |

Do NOT invent new permission codes. Backend remains authoritative.

---

## 50. Polling Contract / Visual Implications

| Property | Value | Visual implication |
| --- | --- | --- |
| Initial request | Immediate | Show loading skeleton initially |
| Interval | 5 000 ms | Do not show countdown between polls |
| Stop on SUCCEEDED/FAILED_FINAL | YES | Switch to terminal state visual |
| Continue on FAILED_RETRYABLE | YES | Maintain running visual with retry context |
| Error stops stream | YES | Switch to poll error state |
| Post-success dimension updates | NOT polled | Manual refresh required |
| Backoff/jitter | None | Fixed interval — acceptable for single-operation |

Visual Direction does NOT change polling behavior. Document the nuance that lifecycle dimensions may evolve after operation success.

---

## 51. Success Truthfulness

| UI claim | Backend guarantees? | Truthful? |
| --- | --- | --- |
| Tenant created | YES on successful finalize | YES |
| Payment pending / paid | YES via `paymentStatus` | YES |
| Activation pending / active | YES via projection | YES |
| Invitation queued | YES when `PENDING` | YES |
| Invitation sent | Only if `invitationStatus === 'SENT'` | PARTIAL — use exact status |
| Notification delivered | Not exposed | Do not claim |
| "Tenant setup complete" | Only when all 4 dimensions are terminal | Use carefully |

---

## 52. Failure / Recovery Truthfulness

| Failure class | Detectable state | Safe message | Tenant exists? | Retry possible? | Primary action | Secondary action |
| --- | --- | --- | --- | --- | --- | --- |
| Operation FAILED_RETRYABLE | `status === 'FAILED_RETRYABLE'` | Tenant setup needs attention | Likely YES | YES (`retryable`) | Retry Processing | View Tenant |
| Operation FAILED_FINAL | `status === 'FAILED_FINAL'` | Tenant provisioning could not fully complete | Possibly | NO | View Tenant / Back | Back to Tenants |
| Outbox failure (silent) | Not reflected in operation status | Not detectable via operation API | YES | NO (button hidden) | View Tenant | Refresh Status |

---

## 53. Sensitive Data / Error Safety

Never expose:

```text
invite token, password, secret, payment token, connection string,
encrypted delivery secret, stack trace, raw exception details,
internal infrastructure data, SanitizedFailureDetails hash
```

Failure UI must use safe mapped error text via `ApiErrorService.toSafeMessage`. Raw backend exception messages must NOT become primary user-facing copy.

---

## 54. Deep-Link / Refresh

```text
Direct refresh on /admin/tenants/onboarding/operations/:operationId
must reconstruct the screen from server data.
```

Do not depend on UI-3A navigation memory. The page must work from a cold URL load.

Planning Audit: **Deep-Link / Refresh Reliability: PASS**

---

## 55. Prototype → Production Mapping

| Prototype Element | Production Decision |
| --- | --- |
| State Preview Toolbar | **PROTOTYPE ONLY — MUST NOT SHIP** |
| Viewport Width Switcher | **PROTOTYPE ONLY** |
| Sample tenant data | **PROTOTYPE ONLY — use live state** |
| Super Admin Shell | REUSE EXISTING |
| PageHeader | APPROVED |
| Premium Status Surface | APPROVED |
| Lifecycle Timeline | APPROVED |
| Context Grid | APPROVED |
| Guidance Panel | APPROVED |
| Actions Bar | APPROVED |
| Numeric Progress | **REJECTED** |
| Manual Refresh | APPROVED |
| Retry | CONDITIONAL |
| Cancel | **REJECTED** |
| View Tenant | APPROVED when `tenantId` exists |
| Operation History | **REJECTED / OUT OF SCOPE** |

---

## 56. Data Truthfulness Matrix

| UI Element | Backend Source | Required? | Render Rule |
| --- | --- | --- | --- |
| Operation status | `status` | YES | Always — drives state machine |
| Provisioning status | `provisioningStatus` | YES | Always — timeline dimension 1 |
| Tenant name | Tenant projection (via `tenantId`) | CONDITIONAL | Render only when projection available |
| Tenant code | Tenant projection | CONDITIONAL | Render only when available |
| Tenant ID | `tenantId` | CONDITIONAL | Required for View Tenant action |
| Payment status | `paymentStatus` | YES | Always — timeline dimension 2 |
| Activation status | Tenant/payment projection | YES | Always — timeline dimension 3 |
| Invitation status | `invitationStatus` | YES | Always — timeline dimension 4 |
| Failure code | `failureCode` | CONDITIONAL | Only in failure states, as support reference |
| Updated timestamp | `updatedAt` | YES | Always shown |
| Retryable | `retryable` | YES | Controls retry button visibility |
| Attempt count | `attemptCount` | NO | Not required for MVP visual |
| Next retry at | `nextRetryAt` | NO | Not required for MVP visual |
| Draft ID | `draftId` | NO | Not shown |
| Version | `version` | NO | Internal concurrency only |

---

## 57. Success Truthfulness Matrix

| Claim | Backend source | Rule |
| --- | --- | --- |
| Tenant created | `provisioningStatus` + `tenantId` present | Safe when finalize succeeded |
| Tenant active | Tenant projection `status === 'active'` | Only claim when confirmed |
| Subscription assigned | Finalize atomically commits subscription | Safe on SUCCEEDED |
| Entitlements provisioned | Finalize atomically commits entitlements | Safe on SUCCEEDED |
| Admin user created | Finalize atomically creates admin | Safe on SUCCEEDED |
| Invitation queued | `invitationStatus === 'PENDING'` | Use "Queued" not "Sent" |
| Invitation delivered | Not exposed by operation GET | Never claim |
| Payment completed | `paymentStatus === 'PAID'` | Only when confirmed |
| Billing email sent | Outbox — delivery not confirmed | Never claim |

---

## 58. Failure / Recovery Matrix

| Failure class | Operation status | `retryable` | Tenant likely exists? | Safe primary action | Safe secondary | Prohibited |
| --- | --- | --- | --- | --- | --- | --- |
| Retryable | `FAILED_RETRYABLE` | `true` | YES | Retry Processing | View Tenant | Create Tenant replay |
| Final | `FAILED_FINAL` | `false` | Possibly | View Tenant | Back to Tenants | Retry |
| Silent outbox | `SUCCEEDED` | `false` | YES | View Tenant | Refresh Status | Mark as failed |

---

## 59. Action Matrix

| State | Primary | Secondary | Prohibited |
| --- | --- | --- | --- |
| Initial Loading | — | — | All actions |
| Running | — | Refresh Status, Back to Tenants | Cancel |
| Payment Pending | Context-dependent | Refresh Status | Fake retry |
| Activation Pending | View Tenant (if valid) | Refresh Status | Cancel |
| Long Running | — | Refresh Status | Cancel, fake ETA |
| Success | View Tenant | Back to Tenants, Create Another | Retry |
| Failure Retryable | Retry Processing | View Tenant, Back to Tenants | Create Tenant replay |
| Failure Non-Retryable | View Tenant / Back | Back to Tenants | Retry |
| Poll Error | Refresh Status | Back to Tenants | Mark operation failed |
| Not Found | Back to Tenants | — | Retry |
| Permission Denied | Back to Tenants | — | Retry |

---

## 60. State Matrix

| State | Overall Surface | Lifecycle | Main Message | Badge | Actions |
| --- | --- | --- | --- | --- | --- |
| Initial Loading | Loading skeleton | Hidden/skeleton | Loading skeleton | — | Disabled |
| Running | Blue gradient | Provisioning active | Tenant setup is in progress | Processing | Refresh |
| Payment Pending | Blue gradient | Payment active | Tenant created — payment pending | Payment pending | Refresh |
| Activation Pending | Blue gradient | Activation active | Payment approved — activation pending | Activation pending | View Tenant, Refresh |
| Invitation Pending | Blue gradient | Invitation active | Activation complete — invitation pending | Invitation pending | View Tenant, Refresh |
| Long Running | Blue gradient | Provisioning active (pulse) | Taking longer than usual | Still processing | Refresh |
| Success | White + success border | All complete | Tenant setup complete | Complete | View Tenant, Back |
| Failure Retryable | White + danger border | Shows failed dimension | Needs attention | Retry eligible | Retry, View Tenant |
| Failure Non-Retryable | White + danger border | Shows failed dimension | Could not fully complete | Failed | View Tenant, Back |
| Poll Error | White + neutral border | Last known state | Unable to refresh status | Refresh needed | Refresh, Back |
| Not Found | White + neutral border | All unavailable | Operation not found | Not found | Back |
| Permission Denied | White + neutral border | Hidden | No permission | — | Back |

---

## 61. Responsive Matrix

| Area | 1440 | 1280 | 1024 | 768 |
| --- | --- | --- | --- | --- |
| Sidebar | Visible (16.5rem) | Visible | Visible | Hidden |
| PageHeader | Full width, flex row | Same | Same | Stacked |
| Status surface | 3-col grid | 3-col grid | 3-col grid | 1-col stacked |
| Lifecycle | 4-col horizontal + connectors | 4-col + connectors | 2-col, no connectors | 1-col vertical + vertical connectors |
| Context grid | 2-col (1.2fr + 0.8fr) | 2-col | 1-col stacked | 1-col stacked |
| Failure detail | Inline in context | Same | Same | Same |
| Actions bar | Flex row | Flex row | Flex row, may wrap | Stacked full-width |
| Horizontal overflow | NONE | NONE | NONE | NONE |

---

## 62. Accessibility Matrix

| Concern | Production Requirement |
| --- | --- |
| H1 | Single H1 — page title via PageHeader |
| Overall status | `aria-labelledby` linking status surface to headline |
| Poll updates | `aria-live="polite"` — announce meaningful transitions only |
| Poll error | `role="alert"` banner |
| Lifecycle timeline | `<ol>` with `role="list"`, each item has text label + text state |
| Running animation | `aria-hidden="true"` on spinner; text status accessible |
| Failure message | Semantically exposed heading + text; not color-only |
| Focus system | `focus-visible` on all interactive elements |
| Buttons | Accessible text labels; no icon-only without label |
| 404/403 | Clear text message + safe navigation action |
| Reduced motion | Respect `prefers-reduced-motion`; no animation-dependent state communication |
| Color independence | All timeline states have text labels, not color-only |

---

## 63. UI-1 Mapping Matrix

| Need | Existing Primitive / Pattern | Rule |
| --- | --- | --- |
| Header | PageHeader | REUSE |
| Primary/secondary actions | Button | REUSE |
| Semantic status | StatusBadge | REUSE where appropriate |
| Loading | LoadingSkeleton | REUSE |
| Error | ErrorState | REUSE / adapt |
| Empty / not found | EmptyState or established equivalent | REUSE where semantically appropriate |
| Focus | Design system focus tokens | REUSE |
| Typography | Design system type tokens | REUSE |
| Spacing | Design system spacing tokens | REUSE |
| Lifecycle visualization | Page-local composition | ALLOWED |
| Status surface | Page-local composition | ALLOWED |
| Guidance panel | Page-local composition | ALLOWED |

---

## 64. Style-Budget Strategy

| Metric | Value |
| --- | --- |
| Current UI-3C SCSS | ~3156 B |
| Angular warning threshold | 6 kB |
| Angular error threshold | 12 kB |
| Budget change | NONE |
| Target | UI-3C component warning: **NONE** |

Strategy:

- Maximize UI-1 token reuse to minimize page-local CSS
- Compact page-local SCSS for lifecycle/status surface only
- No budget evasion (do not move page-specific CSS to `styles.scss` or shell)
- Pre-existing warnings on other components (Login, Permission Catalog, Create Subscription Plan) are NOT in UI-3C scope

---

## 65. Frontend Test Requirements

Planning Audit: **Frontend Test Coverage: THIN (3 cases)**

Implementation MUST strengthen to cover at minimum:

| Test area | Required? |
| --- | --- |
| Route render | YES |
| Initial operation request | YES |
| Running state | YES |
| Payment pending state | YES |
| Activation/invitation pending | YES |
| Success state | YES |
| Failure retryable | YES |
| Failure non-retryable | YES |
| Retry eligible (button visible) | YES |
| Retry unavailable (button absent) | YES |
| Manual refresh | YES |
| Poll error state | YES |
| Not found state | YES |
| Permission denied state | YES |
| View Tenant navigation | YES |
| No Cancel button | YES |
| No numeric progress | YES |
| No fake progress | YES |
| Dynamic accessibility (status text present) | YES |
| Responsive structural classes | RECOMMENDED |

---

## 66. Polling Test Requirements

Planning Audit: **Polling Test Coverage: NONE**

Implementation MUST add focused polling tests:

| Test area | Required? |
| --- | --- |
| `timer(0, 5000)` initial immediate request | YES |
| Subsequent poll at interval | YES |
| Terminal stop on SUCCEEDED | YES |
| Terminal stop on FAILED_FINAL | YES |
| Continue on FAILED_RETRYABLE | YES |
| HTTP error stops stream | YES |
| Cleanup on component destroy | YES |
| Duplicate poller prevention | YES |
| Manual refresh triggers new request | YES |
| No create replay on refresh/poll | YES |

---

## 67. Backend / API / DB Preservation

| Check | Value |
| --- | --- |
| Backend change required for MVP | NO |
| API additions | NONE |
| API modifications | NONE |
| DB migration | NONE |
| Business logic change | NONE |
| Polling semantics change | NONE |

Implementation uses existing `GET /api/v1/platform-admin/tenant-onboarding/operations/{operationId}` and `POST .../retry` only.

---

## 68. Regression Boundaries

Do NOT regress:

| Boundary | Scope |
| --- | --- |
| UI-3A Create Tenant Wizard | Route, wizard flow, finalize handoff |
| UI-3B Onboarding Drafts | Route, table, draft management |
| Dashboard | Route, layout |
| Tenant List | Route, table |
| Tenant Detail | Route, detail view |
| Global Super Admin Shell | Sidebar, topbar, routing |
| UI-3A → UI-3C handoff | `finalize → receipt.operationId → navigate` |

---

## 69. Must-Look-Like Contract

Production UI-3C must feel like:

```text
Premium OneVerz enterprise SaaS
Trustworthy async provisioning experience
Calm operational lifecycle tracker
Modern tenant outcome page
Clear next-action experience
```

---

## 70. Must-Not-Look-Like Contract

Reject/refine implementation if it looks like:

```text
Spinner + plain text
Basic success/error alert
Bootstrap status page
Marketing success page
Dashboard KPI page
Wizard stepper
Fake cloud-deployment animation
Full green success page
Full red failure page
Generic internal admin tool
```

---

## 71. Planning Findings Carry-Forward

| Finding | Severity | Visual Direction Impact | Implementation Impact | Carry Forward? |
| --- | --- | --- | --- | --- |
| F-SA-UI3C-P-001 | Medium | Documented in §49 | Align route guard or ensure create implies view | YES |
| F-SA-UI3C-P-002 | Medium | Resolved — §33 mandates UI-1 reuse | Implementation must replace bespoke components | YES |
| F-SA-UI3C-P-003 | Medium | Resolved — §34 mandates removal | Implementation must remove competing tokens | YES |
| F-SA-UI3C-P-004 | Medium | Documented in §50 | Document; consider extended poll rule if approved | YES |
| F-SA-UI3C-P-005 | Medium | No direct visual impact | Optimize projection refetch if PROCESSING persists | YES |
| F-SA-UI3C-P-006 | Medium | Documented in §22 | Retry rarely visible; non-blocking backend gap | YES |
| F-SA-UI3C-P-007 | Medium | No direct visual impact | §65–66 mandate test improvement | YES |
| F-SA-UI3C-P-008 | Medium | No direct visual impact | Backend test gap — out of UI-3C visual scope | YES |
| F-SA-UI3C-P-009 | Low | No direct visual impact | Replace `confirm()` with `ConfirmationDialog` if applicable | YES |
| F-SA-UI3C-P-010 | Low | Resolved — §18 defines long-running state | Implementation must add long-running copy | YES |
| F-SA-UI3C-P-011 | Low | Resolved — §24 defines 404/403 states | Implementation must add dedicated empty states | YES |
| F-SA-UI3C-P-012 | Info | Resolved — §12 relegates operation ID to tertiary | Implementation must demote GUID from hero | YES |

**All 12 findings carried. None silently closed.**

---

## 72. Controlled Implementation Scope

Future UI-3C implementation must include:

- Shared PageHeader with approved copy
- Premium Blue status surface (gradient for active, bordered for terminal)
- Real 4-dimension lifecycle timeline
- Running state (spinner, no fake progress)
- Payment Pending state
- Activation Pending state
- Invitation Pending state (within activation context)
- Long-Running state
- Success state with View Tenant primary action
- Failure Retryable state with conditional Retry
- Failure Non-Retryable state
- Poll Error state (distinct from operation failure)
- Not Found state
- Permission Denied state
- Manual Refresh
- View Tenant action (when `tenantId` exists)
- UI-1 primitive reuse (remove competing local system)
- Responsive 1440 / 1280 / 1024 / 768
- Dynamic accessibility (meaningful announcements only)
- Polling test coverage
- Frontend state test coverage
- Style-budget discipline (warning: NONE target)

---

## 73. Explicit Out-of-Scope

Must explicitly exclude:

- New backend API
- DB migration
- Numeric progress / fake progress / fake ETA
- UI-3A wizard steps reuse
- UI-3B drafts redesign
- Operation history / list
- Cancel operation
- New retry semantics beyond existing outbox retry
- New payment flow / activation workflow / invitation workflow
- New billing behavior
- Persistent Operations sidebar entry
- Global async operation framework
- UI-4
- Prototype state switcher in production
- Prototype sample data in production

---

## 74. Implementation Acceptance Criteria

Future implementation must satisfy:

1. Approved Premium Blue composition preserved
2. Premium Status + Lifecycle pattern preserved
3. No fake percentage / progress / ETA
4. No UI-3A wizard steps
5. Prototype state switcher absent from production
6. Production sample/mock data absent
7. Actual lifecycle dimensions only
8. Running state truthful
9. Payment pending truthful (distinct from failure)
10. Activation/invitation pending truthful
11. Success truthful (do not overclaim completion)
12. Partial failure truthful
13. Retry conditional only (never universal)
14. No Cancel
15. Poll error distinct from operation failure
16. Manual refresh works
17. View Tenant works when `tenantId` exists
18. Deep-link/refresh works from cold URL
19. UI-1 reuse PASS
20. Competing local UI system removed
21. Dynamic accessibility improved (no 5-second announcements)
22. Responsive 1440 / 1280 / 1024 / 768
23. No horizontal overflow
24. Angular style budget unchanged
25. UI-3C component warning: preferably NONE
26. API unchanged
27. Business logic unchanged
28. DB unchanged
29. Polling semantics preserved unless separately approved
30. Dedicated frontend tests added
31. Dedicated polling tests added
32. UI-3A / UI-3B / UI-2 / global shell regressions absent

---

## 75. Independent Verification Criteria

Future independent verification must prove:

1. Exact implementation commit identified
2. Real browser route loads correctly
3. Premium Blue visual match to approved prototype direction
4. All supported production states render correctly
5. Real operation API usage (no mocks in production)
6. No numeric/fake progress
7. Timeline derived only from real lifecycle dimensions
8. Polling interval confirmed (5 000 ms)
9. Terminal stop behavior confirmed
10. Poll cleanup on destroy confirmed
11. No duplicate pollers
12. No overlapping requests
13. Manual refresh triggers new request
14. Poll error distinct from operation failure
15. Retry permission/eligibility gating verified
16. No Create Tenant replay
17. Tenant link works
18. 404/403 UX renders
19. Dynamic accessibility (meaningful announcements, no noise)
20. UI-1 reuse verified
21. Competing local system removed
22. Responsive 1440 / 1280 / 1024 / 768 verified
23. No horizontal overflow
24. Style budget verified
25. Frontend tests pass
26. Polling tests pass
27. UI-3A / UI-3B / UI-2 / global shell regressions absent

---

## 76. UI-3 Aggregate Boundary

```text
UI-3A: CLOSED
UI-3B: CLOSED
UI-3C: Visual Direction APPROVED → awaiting implementation + verification + closure
```

After UI-3C implementation passes verification and controlled merge:

```text
UI-3A CLOSED + UI-3B CLOSED + UI-3C CLOSED
→ UI-3 AGGREGATE CLOSURE AUDIT
→ only then may UI-4 be authorized
```

---

## 77. Final Visual Direction Verdict

```text
SUPER ADMIN UI-3C PREMIUM BLUE VISUAL DIRECTION APPROVED WITH NON-BLOCKING GAPS —
READY FOR CONTROLLED IMPLEMENTATION
```

Non-blocking gaps carried from Planning Audit (F-SA-UI3C-P-001 through P-012) do not block visual direction or implementation. They are documented and carried forward.

---

## 78. Required Next Action

Merge the approved UI-3C Premium Blue Visual Direction Specification through the controlled Second Brain documentation PR process.

After the specification is integrated, implement only UI-3C Tenant Onboarding Operation Status on a dedicated Platform Admin feature branch using the Planning Audit, approved HTML prototype, and this Visual Direction Specification as mandatory contracts.

The implementation must preserve the existing operation API and polling/business semantics; use actual lifecycle dimensions only; prohibit numeric/fake progress and fake ETA; implement truthful Running, Payment Pending, Activation/Invitation Pending, Success, Partial Failure, Long-Running, Poll Error, Not Found and permission states; restrict Retry to real eligibility; never expose Cancel; improve UI-1 reuse, responsive behavior, dynamic accessibility, and frontend/polling test coverage; and require independent read-only verification before merge.
