<!-- title: Authentication Authorization Prompt -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Authentication Authorization Prompt

## Purpose

Use this prompt to generate or review authentication and authorization code.

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
You are a senior backend security engineer working on SCS-TIX EPOS Release 1.

Implement or review authentication/authorization for:

Area: [AUTH_OR_AUTHZ_AREA]
Module/use case: [MODULE_OR_USE_CASE]

Read:
- 02_ACCESS_CONTROL/Access_Control_Overview.md
- 02_ACCESS_CONTROL/Permission_Code_List.md
- 02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md
- 02_ACCESS_CONTROL/API_Authorization_Rules.md
- 05_BACKEND_ARCHITECTURE/Authentication.md
- 05_BACKEND_ARCHITECTURE/Authorization_And_Permissions.md
- 05_BACKEND_ARCHITECTURE/Multi_Tenant_Handling.md

Authentication rules:
- Platform users and tenant users are separate.
- Passwords and POS PINs are hash-only.
- Setup, invite, reset, refresh, payment link, and activation tokens are hash-only.
- Refresh tokens rotate.
- Logout revokes active session/token chain.

Authorization rules:
- JWT is necessary but not sufficient.
- Resolve tenant context server-side.
- Validate tenant status, entitlement, permission, outlet access, trusted device, till assignment, and open till session where required.
- Return 403 for authenticated blocked users.

Permission strategy:
- Do not create one global PermissionCode enum.
- Use module-wise permission constants.
- Database permissions remain source of truth.

Generate:
1. Auth/session service changes.
2. Permission checker.
3. Feature entitlement checker.
4. Tenant context resolver.
5. Authorization attribute/filter or service usage pattern.
6. Example protected endpoint.
7. Unit tests for allowed/denied scenarios.
```

## Related Files

- [[../../02_ACCESS_CONTROL/Access_Control_Overview]]
- [[../../05_BACKEND_ARCHITECTURE/Authentication]]
- [[../../05_BACKEND_ARCHITECTURE/Authorization_And_Permissions]]
