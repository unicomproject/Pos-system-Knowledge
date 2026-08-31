<!-- title: Flutter Open Till Screen Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-11 -->

# Flutter Open Till Screen Implementation Specification

## Decision Summary

| Decision | Canonical result |
|---|---|
| Existing Open Till feature folders | **MODIFY / ALIGN** |
| Duplicate Open Till-specific top bar | **NOT ALLOWED** |
| Dashboard Top Bar reuse | **REQUIRED** |
| OneVerz primary action colour for this screen | **ORANGE** (not blue/purple/violet) |
| White parent/background surface | **REQUIRED** |
| Component-wise decomposition | **REQUIRED** |
| New API / permission / table / column / migration | **NO** |
| Offline authoritative Open Till | **NOT ALLOWED** |

Functional, API, DB and permission authority:
[[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/04_Open_Till_Feature]].

## Purpose

Define the approved Flutter UI/architecture contract for Open Till so
implementation can proceed from Second Brain without inventing layout, theme or
shell behaviour.

## Approved UI Contract

1. **Top bar** — Reuse the existing Dashboard Top Bar / POS shell header
   (`PosDashboardTopBarContent` / shell top-bar path). Do not keep a private
   Open Till-only `_OneVerzAppHeader`.
2. **Theme** — OneVerz **orange** primary for this screen. Replace inappropriate
   blue/purple/violet action styling. Use existing theme tokens (for example
   `TenantAdminColors.posHomeAccentOrange`, `posHomeOrangeStart` /
   `posHomeOrangeEnd`, or equivalent shared orange CTA tokens). Do not hardcode
   one-off colours when tokens exist.
3. **Surface** — Main content sits inside a full **white** parent/background
   card/container; existing Open Till cards/components sit on that surface.
4. **Text** — Important text uses clear **dark** colour and strong/bold weight
   for headings, entered cash, keypad digits and summary values. Follow existing
   typography tokens.
5. **No other redesign** — Preserve existing functional controls (float field,
   quick amounts, keypad, clear/backspace, optional note, till summary, CTA)
   unless they contradict this contract.

## Component Composition (preserve)

```text
TillOpenScreen (composition + navigation)
├── Existing Dashboard / POS shell Top Bar (reused — not duplicated)
└── White parent surface
    └── OpenTillForm (and focused child widgets)
        ├── Opening float / Starting cash
        ├── Quick amounts
        ├── Numeric keypad + clear/backspace
        ├── Optional opening note
        ├── Till summary (outlet / till / device / opener)
        └── Open Till CTA
```

Do not collapse into one giant widget/file. Widgets must not call HTTP.
Preserve `till/{application,data,domain,presentation}` boundaries and providers.

## Responsive Behaviour

Requirement: The Open Till screen must responsively adapt across supported
**phone**, **tablet** and **desktop** sizes without overflow, clipping,
overlapping, inaccessible controls, broken alignment, or unusable touch/click
targets.

| Breakpoint | Expectation |
|---|---|
| Phone | Reflow; do not merely shrink desktop/tablet UI |
| Tablet | Touch-friendly targets; usable keypad and CTA |
| Desktop | Readable; do not excessively stretch controls |

Layout may adapt by width. Scrolling is allowed where required. Reuse project
responsive utilities/breakpoints (`TenantAdminBreakpoints`, density helpers).

## State Management Expectations

| Concern | Rule |
|---|---|
| Bootstrap | Device context from existing activation/current-device providers |
| Defaults | Prefill opening float from device/till `defaultOpeningFloatAmount` when available |
| Submit | Provider/use-case → repository → `POST /api/v1/tills/open` |
| Success | Update POS/session state from backend response; then navigate into POS |
| Failure | Surface safe API/validation errors; never fake OPEN |
| In flight | `isSubmitting` (or equivalent) blocks repeated CTA |

## Opening Note UI Constraint

If the field shows `0/100`, that is an **existing UI maxLength: 100** only.
Backend does not currently enforce 100 characters. Do not treat it as a backend
business rule in this screen’s contract.

## Current Implementation Assessment — 2026-08-11 (post Chunk 2)

| Area | Status | Notes |
|---|---|---|
| Feature folders + open/close/current-session wiring | **COMPLETE** | Backend reuse integrated |
| Dashboard Top Bar reuse | **COMPLETE** | `PosShellScaffold` + `isDashboard: true`; private header removed |
| Orange theme | **COMPLETE** | `posHomeAccentOrange` / orange CTA gradient tokens |
| White parent surface | **COMPLETE** | White content surface on Open Till |
| Phone + Tablet + Desktop | **COMPLETE** | Authenticated runtime evidence at 390×844, tablet, 1920×1080 |
| Offline fake OPEN | **FORBIDDEN / VERIFIED** | Network failure shows error; no new OPEN session |

## Implementation Acceptance

Chunk 1 UI alignment and Chunk 2 production runtime/E2E acceptance **PASSED**
on 2026-08-11 against this specification and
[[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/04_Open_Till_Feature]].

## Related Files

- [[Flutter_App_Architecture]]
- [[Flutter_Folder_Structure]]
- [[../07_UI_UX_KNOWLEDGE/Design_System]]
- [[../07_UI_UX_KNOWLEDGE/POS_App_UI_Rules]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Till/Open_Till_Screen_Layout_Implementation_Status]]
