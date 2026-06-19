<!-- title: Code Review Checklist -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Code Review Checklist

## Purpose

This file defines the SCS-TIX EPOS Release 1 code review checklist.

Reviewers must check correctness, scope, architecture, security, tenant safety,
and maintainability.

## Scope Review

| Check | Required |
|---|---|
| Change is Release 1 scope | Yes |
| No unsupported module added | Yes |
| User journey exists or change is clearly justified | Yes |
| Module knowledge matches implementation | Yes |
| Database tables match updated design | Yes |

## Backend Architecture Review

| Check | Required |
|---|---|
| Controller is thin | Yes |
| Application service owns use case | Yes |
| Domain has stable business rules only | Yes |
| Infrastructure owns EF/repository/provider details | Yes |
| No CQRS/MediatR/Redis introduced | Yes |
| DTOs used for API contracts | Yes |
| EF entities not returned directly | Yes |

## Access Control Review

| Check | Required |
|---|---|
| Tenant context resolved server-side | Yes |
| Tenant status checked | Yes |
| Feature entitlement checked where required | Yes |
| Permission checked | Yes |
| Outlet access checked where required | Yes |
| Trusted device checked for POS device actions | Yes |
| Open till session checked where required | Yes |
| 403 used for authenticated blocked user | Yes |

## Database Review

| Check | Required |
|---|---|
| Tenant-owned tables filter by `tenant_id` | Yes |
| Unique constraints are tenant-aware | Yes |
| Table names match updated DB design | Yes |
| Column names match updated DB design | Yes |
| Append-only ledgers are not updated/deleted incorrectly | Yes |
| Raw tokens/secrets are not stored | Yes |
| Migrations are deterministic | Yes |

## Angular Review

| Check | Required |
|---|---|
| Proper feature folder | Yes |
| Lazy route where applicable | Yes |
| Auth/permission/feature/tenant guards | Yes |
| Typed API services | Yes |
| No hardcoded API URLs | Yes |
| No hardcoded role checks | Yes |
| Reactive forms | Yes |
| Reusable components used | Yes |
| Loading/error/empty states | Yes |
| Tenant-scoped state clears on tenant switch | Yes |

## Flutter Review

| Check | Required |
|---|---|
| Feature-first structure followed | Yes |
| Riverpod/GoRouter/Dio pattern followed | Yes |
| Secure storage for tokens | Yes |
| Permission-based UI | Yes |
| Tenant/outlet/device/till context validated | Yes |
| POS flow state is safe | Yes |
| Hardware/payment scope matches confirmed rules | Yes |

## Security Review

| Check | Required |
|---|---|
| No passwords in logs | Yes |
| No POS PIN exposed | Yes |
| No raw tokens exposed | Yes |
| No token hashes exposed | Yes |
| No provider secrets in frontend | Yes |
| No card data stored unsafely | Yes |
| No stack traces returned to clients | Yes |
| No cross-tenant data leak | Yes |

## Testing Review

| Check | Required |
|---|---|
| Happy path tested | Yes |
| Validation failure tested | Yes |
| Permission denied tested | Yes |
| Feature disabled tested | Yes |
| Tenant isolation tested | Yes |
| Conflict/duplicate tested | Yes |
| UI error state tested where relevant | Yes |
| Regression risk considered | Yes |

## Final Review Decision

Use one of these:

```text
Approved
Approved with minor fixes
Changes requested
Rejected
```

Reject immediately if the PR adds unsupported scope, breaks tenant isolation, or
exposes secrets.

## Related Files

- [[Pull_Request_Rules]]
- [[Git_Branching_Rules]]
- [[../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../05_BACKEND_ARCHITECTURE/Backend_Coding_Principles]]
