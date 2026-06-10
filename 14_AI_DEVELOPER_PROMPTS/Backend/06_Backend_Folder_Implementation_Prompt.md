<!-- title: Backend Folder Implementation Prompt -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Backend Folder Implementation Prompt

## Purpose

Use this prompt to create or correct backend folder structure.

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
You are a senior .NET backend architect working on SCS-TIX EPOS Release 1.

Create or correct backend folder structure for module:

Module: [MODULE_NAME]

Read:
- 05_BACKEND_ARCHITECTURE/Clean_Architecture_Layers.md
- 05_BACKEND_ARCHITECTURE/Module_Based_Folder_Structure.md
- 04_MODULE_KNOWLEDGE/[MODULE_NAME]/03_Technical_Contract.md

Use this solution structure:

src/
  SCS.Api/
  SCS.Application/
  SCS.Domain/
  SCS.Infrastructure/
tests/
  SCS.UnitTests/
  SCS.IntegrationTests/
  SCS.ApiTests/

Rules:
- Module folder exists inside each required layer.
- No generic dumping folders for all services/controllers.
- No business logic in SCS.Api.
- No EF Core code in SCS.Application or SCS.Domain.
- Permission constants go in Domain module folder.
- Repository interface goes in Application.
- Repository implementation goes in Infrastructure.
- DTOs and validators go in Application.
- Controllers go in API.
- EF configurations go in Infrastructure persistence config.

Generate:
1. Folder tree.
2. File placement explanation.
3. Skeleton files if requested.
4. What not to create.
5. Review checklist.
```

## Related Files

- [[../../05_BACKEND_ARCHITECTURE/Module_Based_Folder_Structure]]
- [[../../04_MODULE_KNOWLEDGE]]
