<!-- title: Backend Reusable Service Logic Governance -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-19 -->

# Backend Reusable Service Logic Governance

## Reuse-First Rule

Before writing backend logic, search both the current Second Brain and current
backend source for an existing service, repository, validator, policy,
permission service, tenant context, audit service, mapper, utility, domain rule,
integration client, idempotency helper, or transaction helper.

Record the search and ownership decision in the feature Reuse Matrix. If an
approved implementation exists, reuse it through its existing contract.

## Single Logic Ownership Rule

One business rule has one canonical owner. Do not reproduce it in multiple
controllers, services, repositories, or modules.

```text
Create Tenant ─┐
               ├─> Permission Service
Create Outlet ─┘
```

The same rule applies to tenant resolution, audit logging, authorization,
validation, money calculations, tax, number generation, idempotency,
concurrency, and external integration handling.

Controllers may enforce endpoint access and Application services may orchestrate
policy use, but neither should copy the policy's internal decision logic.

## Extend Before Duplicate

When existing logic is almost suitable:

```text
REUSE
or
EXTEND
```

before creating parallel logic. Extend the canonical contract only when the new
behaviour belongs to the same responsibility and does not weaken existing
consumers. Otherwise create a distinct, clearly owned rule and document why it
is not equivalent.

## Reuse Matrix

| Required responsibility | Existing Second Brain authority | Existing source owner/path | Reuse / Extend / New | Reason and tests |
|---|---|---|---|---|

Every `New` entry must show search evidence and an ownership boundary.

## Governance Checks

- No duplicated permission strings or tenant-resolution logic.
- No repeated financial/tax/total calculations in controllers or clients.
- No competing number sequence or idempotency implementation.
- No repository-owned business rule already owned by Application/Domain.
- No new integration client for an existing provider contract.
- Shared change preserves tenant isolation, authorization, error contracts,
  transactions, observability, and backward compatibility.
- Tests cover all existing and new consumers.
- Canonical owner and relevant module documentation are updated.

## Related Files

- [[Backend_Engineering_Canonical_Standard]]
- [[Backend_Feature_Development_Second_Brain_Workflow]]
- [[Backend_Feature_Implementation_Specification_Template]]
- [[Clean_Architecture_Layers]]
- [[Module_Based_Folder_Structure]]
