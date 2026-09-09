<!-- title: Backend Module Generation Prompt -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->


# Backend Module Generation Prompt

## Purpose

Use this prompt to generate one complete backend module for OneVerz POS MVP.

## Mandatory Rules

- Start from `00_START_HERE/Current_Source_Of_Truth.md`; follow and actually
  open/read all mandatory Backend workflow and task-relevant authorities. A link
  path alone is not a read. Search current backend source and complete the
  Reuse/Extend/New assessment before implementation.
- Use current OneVerz POS MVP canonical Second Brain documents.
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
You are a senior .NET backend engineer working on OneVerz POS MVP.

Generate backend module: [MODULE_NAME].

Read first:
- 01_RELEASE_SCOPE/Release_1_Scope.md
- 02_ACCESS_CONTROL/Access_Control_Overview.md
- 02_ACCESS_CONTROL/API_Authorization_Rules.md
- 04_MODULE_KNOWLEDGE/[MODULE_NAME]/01_Module_Overview.md
- 04_MODULE_KNOWLEDGE/[MODULE_NAME]/02_Functional_Rules.md
- 04_MODULE_KNOWLEDGE/[MODULE_NAME]/03_Technical_Contract.md
- 05_BACKEND_ARCHITECTURE/Clean_Architecture_Layers.md
- 05_BACKEND_ARCHITECTURE/Module_Based_Folder_Structure.md
- 05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules.md
- 06_DATABASE_KNOWLEDGE/Database_Overview.md

Architecture rules:
- API layer contains controllers only.
- Application layer contains services, DTOs, validators, repository interfaces, access checks, and workflow orchestration.
- Domain layer contains entities, value objects, domain rules, and module-wise permission constants.
- Do not generate C# enum classes for database status/type/check-value columns; keep them as string properties and enforce allowed values with Application validation and Infrastructure database CHECK constraints.
- Infrastructure layer contains EF Core mappings, repositories, migrations, and external adapters.
- Do not put business logic in controllers.
- Do not inject DbContext into controllers.
- Do not create one global permission enum.

Access rules:
- Resolve tenant context server-side.
- Validate tenant status.
- Validate feature entitlement.
- Validate required permission.
- Validate outlet/device/till/session context where required.
- Return 403 for authenticated users blocked by permission, feature, outlet, device, or till context.

Generate:
1. API controller skeleton.
2. Application service interface and implementation.
3. Request/response DTOs.
4. Validators.
5. Repository interface.
6. Domain references/rules.
7. Infrastructure repository implementation.
8. EF Core configuration if needed.
9. Permission constants if needed.
10. Test checklist.

Output code with file paths.
```

## Review Checklist

- Correct layer placement.
- Correct module folder.
- Correct table names.
- Correct DTO mapping.
- Correct access checks.
- No unsupported scope.
- No leaked secrets.
- No hardcoded tenant data.

## Related Files

- [[../../04_MODULE_KNOWLEDGE]]
- [[../../05_BACKEND_ARCHITECTURE/Clean_Architecture_Layers]]
- [[../../06_DATABASE_KNOWLEDGE/Database_Overview]]
