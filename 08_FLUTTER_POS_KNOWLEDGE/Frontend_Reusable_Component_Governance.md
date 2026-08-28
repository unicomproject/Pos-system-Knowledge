<!-- title: Frontend Reusable Component Governance -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-19 -->

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

If an approved shared component exists: **REUSE IT**. Do not recreate it.

Search by visual role, behaviour, class name, labels, tokens, and usage—not only
by the proposed new name. Record the result in the screen Reuse Matrix.

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

Registry entries must reflect actual source. Never mark a proposed class as
implemented. Existing feature catalogues such as
[[Tenant_Admin_Settings_Component_Catalogue]] remain valid specialised
catalogues and should link to this governance standard.

## Review Checklist

- Second Brain and Flutter source searches recorded.
- Reuse Matrix completed.
- No equivalent class or copied widget tree exists.
- Tokens, interactive states, semantics, and responsive behaviour align.
- Shared change has focused regression tests for existing consumers.
- Registry and relevant screen specification are updated.

## Related Files

- [[Frontend_Engineering_Canonical_Standard]]
- [[Frontend_Screen_Development_Second_Brain_Workflow]]
- [[Frontend_Screen_Implementation_Specification_Template]]
- [[../07_UI_UX_KNOWLEDGE/Design_System]]
- [[Flutter_Folder_Structure]]
