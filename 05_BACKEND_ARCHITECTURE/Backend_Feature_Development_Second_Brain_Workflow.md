<!-- title: Backend Feature Development Second Brain Workflow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

# Backend Feature Development Second Brain Workflow

## Mandatory Flow

Start by opening and reading [[../00_START_HERE/Current_Source_Of_Truth]]. Every
mandatory/required authority discovered through this workflow must itself be
opened and read; finding a link or path is not equivalent to reading its
content. Follow required references only until the current feature's authority
set is resolved. Load the applicable architecture, journey, module, API,
permission/RBAC, database, state, integration/offline and testing authorities,
but do not load unrelated Second Brain content. Current backend source search
remains mandatory before a Reuse/Extend/New decision, specification, or
implementation.

```text
1. Identify Feature
2. Read Current Source of Truth + Release Scope
3. Read Backend Canonical Standard
4. Read Backend Reusable Service Logic Governance
5. Read Backend Architecture
6. Read User Journey + Module Rules + API Contract + Permission + Database Rules
7. Search current backend code
8. Create Reuse Matrix
9. Fill Backend Feature Specification
10. Define API Contract
11. Define Data Flow
12. Check Tenant + Permission + Security
13. Check Transaction + Constraints + Concurrency + Idempotency
14. Implement Feature
15. Run Tests
16. Build + Regression
17. Update Second Brain
```

Do not begin implementation before steps 1–13 have been considered.

## Summary

```text
Read
→ Search
→ Reuse
→ Specify
→ Design
→ Implement
→ Test
→ Update
```

## Example Data Flow

```text
Create Outlet Screen
→ POST /outlets
→ Controller
→ Application Service
→ Domain Rules
→ Repository
→ PostgreSQL
→ Response
```

Define validation, authorization, tenant context, transaction ownership, audit,
failure/rollback, concurrency, duplicate-request/idempotency, mapping, logging,
and response behaviour at the correct layers before coding.

## Reuse Matrix Minimum

| Responsibility | Existing documentation | Existing backend source | Reuse / Extend / New | Owner / evidence |
|---|---|---|---|---|

## Completion Gate

Completion needs scoped unit/integration/API tests, tenant and permission tests,
build/regression evidence, migration validation when applicable, and an honest
Second Brain update. Documentation or compilation alone does not prove runtime
or external integration acceptance.

## Required Reads

- [[../00_START_HERE/Current_Source_Of_Truth]]
- [[Backend_Engineering_Canonical_Standard]]
- [[Backend_Reusable_Service_Logic_Governance]]
- [[Backend_Feature_Implementation_Specification_Template]]
- [[Backend_Overview]]
- [[Clean_Architecture_Layers]]
