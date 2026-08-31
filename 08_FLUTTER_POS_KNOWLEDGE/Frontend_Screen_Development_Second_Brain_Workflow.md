<!-- title: Frontend Screen Development Second Brain Workflow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

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
10. Confirm Design Tokens / Shared Components
11. Define State / Data Flow
12. Implement Screen
13. Check Responsive Runtime
14. Test loading / empty / errors / permission / validation / double-submit / network / hardware
15. Run flutter analyze + focused tests + flutter test
16. Update Second Brain if new reusable knowledge was introduced
```

No frontend implementation should start before steps 1–11 have been
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
