<!-- title: Pull Request Rules -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Pull Request Rules

## Purpose

This file defines pull request rules for SCS-TIX EPOS Release 1.

A pull request must prove that the change is correct, scoped, safe, and
reviewable.

## Pull Request Principle

A PR should be small enough to review.

Avoid mixing unrelated backend, frontend, database, and documentation changes
unless the feature requires it.

## PR Title Format

Use this style:

```text
[type](area): short description
```

Examples:

```text
feat(backend): add till activation service
fix(angular): clear tenant state on tenant switch
docs(db): update grouped payment tables
test(access): add feature entitlement denial tests
```

## PR Description Must Include

| Section | Required Content |
|---|---|
| Summary | What changed |
| Release 1 scope | Why this is in Release 1 |
| Modules affected | Backend/frontend/db/docs modules |
| User journey | Related journey file |
| Database impact | Tables/migrations touched |
| Access control | Permissions/features/context checks |
| Tests | What was tested |
| Screenshots | Required for UI changes |
| Risks | Known risks or limitations |

## Required Checks Before PR

- Code builds.
- Relevant tests pass.
- No secrets committed.
- No unsupported scope added.
- Tenant isolation is preserved.
- Permission and feature checks are present.
- DTOs are used for API responses.
- UI has loading/error/empty states where relevant.
- Documentation updated where architecture or behavior changed.

## Backend PR Rules

Backend PR must confirm correct Clean Architecture layer placement, thin
controllers, service-owned use-case logic, tenant-filtered repositories, database
design aligned migrations, standard errors, and audit logs where required.

## Angular PR Rules

Angular PR must confirm lazy routes where applicable, guards, typed API services,
no hardcoded API URLs, no hardcoded role checks, tenant state cleanup, and
reusable components.

## Flutter PR Rules

Flutter PR must confirm Riverpod/GoRouter/Dio pattern, secure token storage,
permission-based UI rendering, tenant/outlet/device/till context, safe POS flow
state, and confirmed hardware/payment scope.

## Database PR Rules

Database PR must confirm tenant-owned tables include `tenant_id`, tenant-aware
unique constraints, append-only ledger behavior, deterministic seed data, and no
raw secrets or real tenant data.

## Review Outcome

| Outcome | Meaning |
|---|---|
| Approved | Safe to merge |
| Approved with minor fixes | Fix small issues before merge |
| Changes requested | Must fix before merge |
| Rejected | Wrong scope or unsafe architecture |

## Related Files

- [[Git_Branching_Rules]]
- [[Code_Review_Checklist]]
- [[../05_BACKEND_ARCHITECTURE/Backend_Coding_Principles]]
- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Angular_Module_Implementation_Guide]]
