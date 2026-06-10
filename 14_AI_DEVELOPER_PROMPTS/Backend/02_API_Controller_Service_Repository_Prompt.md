<!-- title: API Controller Service Repository Prompt -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# API Controller Service Repository Prompt

## Purpose

Use this prompt to generate controller, service, DTO, validator, and repository code for one use case.

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
You are a senior .NET backend engineer for SCS-TIX EPOS Release 1.

Generate API controller, Application service, repository interface, and Infrastructure repository for:

Use case: [USE_CASE_NAME]
Module: [MODULE_NAME]
API group: [API_GROUP]
Required permission: [PERMISSION_CODE]
Required feature entitlement: [FEATURE_KEY_OR_NONE]
Tenant context required: [YES/NO]
Outlet/device/till/session context: [DETAILS]

Read:
- 04_MODULE_KNOWLEDGE/[MODULE_NAME]/03_Technical_Contract.md
- 05_BACKEND_ARCHITECTURE/API_Standards.md
- 05_BACKEND_ARCHITECTURE/Authorization_And_Permissions.md
- 05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules.md
- 05_BACKEND_ARCHITECTURE/Error_Response_Standards.md
- 06_DATABASE_KNOWLEDGE/Database_Overview.md

Generate these files:
- SCS.Api/Modules/[MODULE_NAME]/[Controller].cs
- SCS.Application/Modules/[MODULE_NAME]/DTOs/
- SCS.Application/Modules/[MODULE_NAME]/Validators/
- SCS.Application/Modules/[MODULE_NAME]/[Service].cs
- SCS.Application/Modules/[MODULE_NAME]/Repositories/[RepositoryInterface].cs
- SCS.Infrastructure/Modules/[MODULE_NAME]/[Repository].cs

Rules:
- Controller is thin and uses DTOs only.
- Service validates access and business rules.
- Repository applies tenant filters.
- Use AsNoTracking for read-only queries.
- Use projections for list endpoints.
- Use transaction boundaries for multi-table mutation.
- Return standard success/error response.
- Do not expose EF entities directly.

Output complete code with paths.
```

## Related Files

- [[../../05_BACKEND_ARCHITECTURE/API_Standards]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
