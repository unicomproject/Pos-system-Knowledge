<!-- title: Seed Data Prompt -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Seed Data Prompt

## Purpose

Use this prompt to generate or review Release 1 seed data.

## Mandatory Rules

- Use only SCS-TIX EPOS Release 1 Second Brain documents.
- Do not add unsupported scope.
- Do not invent APIs, tables, roles, permissions, integrations, or modules.
- Follow updated database design table and column names exactly.
- Use Clean Architecture and module-based folders.
- No CQRS, no MediatR, no Redis for Release 1.
- Do not hardcode tenant-specific business data.
- Resolve tenant context server-side.
- Enforce entitlement, permission, tenant, outlet, device, till, and session checks where required.
- Never expose passwords, POS PINs, raw tokens, hashes, provider secrets, or card data.


## Prompt

```text
You are a senior backend engineer generating SCS-TIX EPOS Release 1 seed data.

Seed area: [SEED_AREA]

Read:
- 05_BACKEND_ARCHITECTURE/Seed_Data_Standards.md
- 06_DATABASE_KNOWLEDGE/Database_Overview.md
- 06_DATABASE_KNOWLEDGE/Migration_Rules.md
- 02_ACCESS_CONTROL/Permission_Code_List.md
- 02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md

Allowed seed areas:
- Platform roles.
- Platform permissions.
- Platform modules.
- Platform features.
- Subscription plans.
- Subscription plan features.
- Tenant permission catalog.
- Payment method types.
- Discount types.
- Discount scopes.
- Stock movement types.
- Cash movement types.
- Required system roles/permissions.
- Safe reference/status values from updated database design.

Rules:
- Do not seed tenant-specific production data.
- Do not seed real passwords, raw tokens, raw activation codes, provider secrets, AWS keys, or card data.
- Do not enable unsupported scope as active behavior.
- Permission codes must match module constants and API checks.
- Feature keys must match entitlement checks.
- Seeds must be deterministic and repeatable.

Generate:
1. EF Core seed data or migration-safe seed method.
2. Seed constants where appropriate.
3. Idempotency strategy.
4. Review checklist.
5. Test checklist.
```

## Related Files

- [[../../05_BACKEND_ARCHITECTURE/Seed_Data_Standards]]
- [[../../06_DATABASE_KNOWLEDGE/Migration_Rules]]
