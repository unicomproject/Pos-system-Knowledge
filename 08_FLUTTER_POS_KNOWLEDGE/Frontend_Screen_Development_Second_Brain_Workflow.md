<!-- title: Frontend Screen Development Second Brain Workflow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-01 -->

# Frontend Screen Development Second Brain Workflow

## Mandatory Flow

Start by opening and reading [[../00_START_HERE/Current_Source_Of_Truth]]. Every
mandatory/required authority discovered through this workflow must itself be
opened and read; finding a link or path is not equivalent to reading its
content. Follow required references only until the current screen/feature's
authority set is resolved. Load the relevant journey, module, screen, API,
permission, design/reuse, state, integration/offline, database and testing
authorities as applicable, but do not load unrelated Second Brain content.
Current Flutter source search remains mandatory before a Reuse/Extend/New
decision or implementation.

```text
1. Identify Screen / Feature
2. Read Current Source of Truth
3. Read Frontend Canonical Standard
4. Read Reusable Component Governance
5. Read Design System + relevant POS/Tenant Admin UI rules
6. Read relevant User Journey + Module Rules + Screen Spec + API + Permission
7. Search current Flutter code
8. Create Reuse Matrix
9. Fill Screen Implementation Specification
10. Audit screen/action/route/notification permissions and 0/1/many-item reflow
11. Confirm backend theme, semantic, typography and layout token mappings
12. Confirm Design Tokens / Shared Components against
    [[../07_UI_UX_KNOWLEDGE/POS_Reusable_Component_Specifications]]
13. Define State / Data Flow
14. Implement Screen
15. Check Responsive Runtime
16. Test loading / empty / errors / permission / validation / double-submit / network / hardware
17. Run flutter analyze + focused tests + flutter test
18. Update Second Brain if new reusable knowledge was introduced
```

No frontend implementation should start before steps 1–13 have been
considered. A target image does not replace journey, API, permission, responsive,
state, accessibility, or reuse analysis.

## Summary

```text
Read
→ Search
→ Reuse
→ Specify
→ Implement
→ Test
→ Update
```

## Reuse Matrix Minimum

| Required UI/behaviour | Existing Second Brain entry | Existing Flutter implementation | Decision: reuse/extend/new | Evidence/path |
|---|---|---|---|---|

Every `new` decision needs a reason. New shared components require a registry
entry; reused components should be referenced rather than redocumented.

Before implementation, record screen access, every business action, route/deep
link, and notification feature/domain permission. Verify zero, one, and
multiple visible-action layouts without empty reserved gaps. Record which
elements use backend theme tokens versus semantic tokens, and map typography
and repeated dimensions to canonical styles/tokens.

For every card, button, field, chip, dialog, image, row and navigation element,
record:

```text
Component → existing Flutter path → REUSE / EXTEND / SHARED/NEW / FEATURE-LOCAL
→ implemented variant → canonical dimension reference → colour authority
→ typography token → spacing token/rule
```

The workflow is search registry and source → REUSE → EXTEND when required →
SHARED/NEW only with a genuine reusable owner → FEATURE-LOCAL only for genuine
screen-specific composition. Screenshot/prototype pixels do not override the
component specification.

## Data Flow Definition

Record screen event → provider/controller → use case → repository → remote/local
datasource → mapped state → UI. Identify backend-final decisions, offline-safe
operations, retry/cancellation, duplicate-submit protection, and cache
invalidation before implementation.

## Completion Gate

Completion requires runtime-responsive evidence where layout matters, relevant
state/error/permission coverage, analysis and tests, and an honest Second Brain
update. Build/analyze alone do not prove authenticated or physical-hardware
runtime acceptance.

## Required Reads

- [[../00_START_HERE/Current_Source_Of_Truth]]
- [[Frontend_Engineering_Canonical_Standard]]
- [[Frontend_Reusable_Component_Governance]]
- [[Frontend_Screen_Implementation_Specification_Template]]
- [[../07_UI_UX_KNOWLEDGE/Design_System]]
- [[../07_UI_UX_KNOWLEDGE/POS_Reusable_Component_Specifications]]
