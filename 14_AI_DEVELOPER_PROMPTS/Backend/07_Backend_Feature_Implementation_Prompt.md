 <!-- title: Backend Feature Implementation Prompt -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Backend Feature Implementation Prompt

## Purpose

Use this prompt to implement one backend feature or user journey.

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
You are a senior .NET backend engineer implementing a Release 1 SCS-TIX EPOS feature.

Feature: [FEATURE_NAME]
Module: [MODULE_NAME]
User journey file: [USER_JOURNEY_FILE]
Database table files: [DATABASE_FILES]
Required permission: [PERMISSION_CODE]
Required feature entitlement: [FEATURE_KEY_OR_NONE]

Read:
- 03_USER_JOURNEYS/[ROLE]/[FLOW].md
- 04_MODULE_KNOWLEDGE/[MODULE_NAME]/01_Module_Overview.md
- 04_MODULE_KNOWLEDGE/[MODULE_NAME]/02_Functional_Rules.md
- 04_MODULE_KNOWLEDGE/[MODULE_NAME]/03_Technical_Contract.md
- 05_BACKEND_ARCHITECTURE/
- 06_DATABASE_KNOWLEDGE/
- 02_ACCESS_CONTROL/

Implementation rules:
- Start from user journey steps.
- Validate preconditions before mutation.
- Resolve tenant context server-side.
- Check tenant status, entitlement, permission, and required context.
- Use DTOs and validators.
- Use Application service for workflow.
- Use repository interfaces.
- Use transaction boundaries for multi-table mutations.
- Write audit logs for sensitive changes.
- Return standard API responses and errors.
- Do not expose internal fields.

Generate:
1. Use-case summary.
2. API group and controller method skeleton.
3. Request DTO.
4. Response DTO.
5. Validator.
6. Application service method.
7. Repository interface methods.
8. Repository implementation methods.
9. EF configuration change if needed.
10. Audit behavior if required.
11. Unit and integration test cases.
12. Manual API test checklist.
```

## Related Files

- [[../../03_USER_JOURNEYS]]
- [[../../04_MODULE_KNOWLEDGE]]
- [[../../05_BACKEND_ARCHITECTURE]]
- [[../../06_DATABASE_KNOWLEDGE]]
