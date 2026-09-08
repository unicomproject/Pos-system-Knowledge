<!-- title: Frontend Reusable Component Governance -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-01 -->

# Frontend Reusable Component Governance

## Purpose

This document prevents duplicate Flutter UI implementations and makes shared
behaviour changeable in one place.

## Reuse-First Rule

Before implementing any UI element, every developer, AI assistant, and Codex
agent must search both:

```text
Second Brain reusable component catalogue
+
current Flutter source code
```

The canonical implemented POS dimension/path registry is
[[../07_UI_UX_KNOWLEDGE/POS_Reusable_Component_Specifications]]. A screen must
reference the registry entry and variant; it must not re-measure an approved
component from a prototype or screenshot.

If an approved shared component exists: **REUSE IT**. Do not recreate it.

Search by visual role, behaviour, class name, labels, tokens, and usage—not only
by the proposed new name. Record the result in the screen Reuse Matrix.

Every candidate is classified before implementation:

| Classification | Meaning |
|---|---|
| `REUSE` | Existing component is used unchanged |
| `EXTEND` | Existing owner is safely enhanced without duplicated ownership |
| `SHARED/NEW` | A genuinely reusable cross-feature component is newly owned in the approved shared location |
| `FEATURE-LOCAL` | New component is specific to one feature/screen and remains under that feature |

Search shared widgets, current feature widgets, design-system components, and
similar screen implementations before selecting a classification.

## Single Implementation Rule

A reusable visual component has one canonical Flutter implementation. Feature
screens configure it only through parameters, callbacks, state, and content;
they must not duplicate its internal UI code.

This applies to primary buttons, text fields, cards, dialogs, tables, page
headers, search fields, status badges, wizard footers, and other repeated UI.

## Change Once — Apply Everywhere

The same component type shares height, padding, radius, typography, icon size,
colors, loading/disabled state, hover/focus behaviour, and accessibility
behaviour. A change belongs in the canonical component or token, not in every
screen.

Correct:

```dart
PosPrimaryActionButton(
  label: 'Save & Next',
  onPressed: saveOutletAndNext,
)

PosPrimaryActionButton(
  label: 'Save & Next',
  onPressed: saveTenantAndNext,
)
```

Wrong: separate `CreateOutletSaveNextButton` and
`CreateTenantSaveNextButton` implementations that duplicate the same UI.

## Extend Before Duplicate

If a shared component is almost suitable:

1. Verify the difference is a legitimate reusable variant.
2. Extend the canonical API without breaking existing consumers.
3. Use approved tokens and typed parameters.
4. Add tests for the new variant.
5. Update its registry entry.

Create a feature-owned component only when its behaviour is genuinely
feature-specific. Do not add arbitrary flags that make a shared component a
feature-specific monolith.

## Ownership and Placement

- Cross-feature components belong in the repository's approved shared/core UI
  location.
- Feature-specific composition belongs under that feature's presentation
  widgets.
- Design tokens have one canonical owner.
- A feature wrapper may translate feature state into shared parameters, but may
  not copy shared visual internals.

## Reusable Component Registry

Use this format in the relevant component catalogue:

| Field | Required content |
|---|---|
| Component ID | Stable unique identifier |
| Component Name | Human-readable role |
| Flutter Class | Exact class name |
| Source Path | Current repository path |
| Purpose | What problem it owns |
| Variants | Approved visual/behaviour variants |
| Parameters | Public configuration contract |
| Design Tokens | Token dependencies; no copied magic values |
| Behaviour | Loading, disabled, error, hover, focus, submit behaviour |
| Accessibility | Semantics, labels, focus, keyboard, contrast, touch target |
| Used By | Known screens/features |
| Status | Proposed / Approved / Implemented / Deprecated |

An implemented registry entry must also record, where source proves them:
width/height behaviour, padding, internal and inter-component gaps, border,
radius, elevation, icon/container sizes, typography, colour authority and
responsive standard/compact rules. Unowned or contradictory values are marked
`GAP`; they are never silently normalized.

Registry entries must reflect actual source. Never mark a proposed class as
implemented. Existing feature catalogues such as
[[Tenant_Admin_Settings_Component_Catalogue]] remain valid specialised
catalogues and should link to this governance standard.

## Review Checklist

- Second Brain and Flutter source searches recorded.
- Reuse Matrix completed.
- No equivalent class or copied widget tree exists.
- Tokens, interactive states, semantics, and responsive behaviour align.
- Permission-hidden children are filtered before collection layout and do not
  preserve blank slots.
- Shared components consume canonical theme/typography tokens and do not own an
  independent feature colour system.
- Shared change has focused regression tests for existing consumers.
- Registry and relevant screen specification are updated.
- Component dimensions, variant, colour authority, typography and spacing link
  to the canonical component specification instead of screenshot literals.

## Related Files

- [[Frontend_Engineering_Canonical_Standard]]
- [[Frontend_Screen_Development_Second_Brain_Workflow]]
- [[Frontend_Screen_Implementation_Specification_Template]]
- [[../07_UI_UX_KNOWLEDGE/Design_System]]
- [[../07_UI_UX_KNOWLEDGE/POS_Reusable_Component_Specifications]]
- [[Flutter_Folder_Structure]]
