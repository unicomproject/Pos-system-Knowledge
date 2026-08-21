<!-- title: ADR 009 - Tenant Effective Permission Resolution -->
<!-- status: Accepted for product contract; implementation gaps open -->
<!-- date: 2026-08-15 -->

# ADR 009 - Tenant Effective Permission Resolution

## Context

Tenant Admin role and permission management requires a clear effective permission contract across:

- tenant roles
- direct tenant user permissions
- outlet roles
- direct outlet user permissions
- role templates and template versions
- feature entitlements
- backend authorization
- Flutter permission-based UI

The database already contains tables for these sources. Runtime resolvers and Tenant Admin role APIs are only partially implemented.

## Decision

Release 1 uses additive allow-based effective permissions.

```text
effective permissions =
  tenant direct grants
  UNION tenant role grants
  UNION outlet direct grants where outlet context applies
  UNION outlet role grants where outlet context applies
```

All grant and assignment rows must be active and not revoked. Permission definitions and roles must be active. Plan-controlled features must be entitled before permissions are considered usable.

Explicit deny is not part of Release 1 because no deny storage or precedence model is implemented.

## Role Templates

Tenant role creation from a template is snapshot-based. A tenant role stores source template/version identity for traceability, but later template changes do not automatically mutate tenant roles.

## Consequences

- Multiple roles are supported by union semantics.
- Duplicate permissions collapse to one effective permission.
- Direct permissions are additive exceptions only.
- No implementation may claim deny semantics without a new ADR.
- Tenant role mutation APIs must write audit logs.
- Auth/session permission resolvers must be hardened to filter revoked rows.
- Outlet-scoped grants must be included in resource-context authorization where required.

## Verified Implementation Status

| Area | Status |
|---|---|
| Database schema | Implemented / verified |
| Role template schema | Implemented / verified |
| Tenant user access summary | Partial, closest current resolver |
| Auth/session effective permission resolver | Partial, missing revoked filters and outlet sources |
| Tenant Admin role APIs | Missing |
| Flutter role-permission datasource | Implemented but points to missing backend endpoints |
| Explicit deny | Not implemented |
| Audit for role mutations | Not verified / missing until endpoints exist |

## Required Follow-Up

1. Implement Tenant Admin role/permission catalog APIs.
2. Harden effective permission resolvers.
3. Add outlet-context authorization where required.
4. Add audit persistence for role mutations.
5. Add tests for revocation, multiple roles, direct grants, outlet scope, tenant isolation, entitlements, and missing permission denial.
