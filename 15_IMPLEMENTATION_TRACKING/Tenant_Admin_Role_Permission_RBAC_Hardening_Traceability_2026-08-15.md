<!-- title: Tenant Admin Role Permission RBAC Hardening Traceability -->
<!-- status: Active -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Role Permission RBAC Hardening Traceability

## Summary

This traceability record closes Second Brain contradictions around Tenant Admin Roles & Access and documents verified implementation gaps.

## Evidence Matrix

| Requirement | Verified Evidence | Status |
|---|---|---|
| RBAC schema includes tenant roles/direct permissions. | Backend DbContext and domain entities. | Implemented |
| RBAC schema includes outlet roles/direct permissions. | Backend DbContext and domain entities. | Implemented |
| Role templates are versioned. | `role_templates`, `role_template_versions`, `role_template_version_permissions`. | Implemented |
| Effective permission algorithm is documented. | `02_ACCESS_CONTROL/Tenant_Effective_Permission_Resolution.md`. | Documented |
| Backend session resolver filters all revoked rows. | Auth/context source inspection. | Gap |
| Backend session resolver includes outlet grants. | Auth/context source inspection. | Gap |
| Tenant Admin role APIs exist. | No controllers found for `/api/v1/tenant-admin/roles` or `/api/v1/tenant-admin/permission-catalog`. | Gap |
| Flutter role datasource exists. | Flutter role permission remote datasource. | Partial |
| Five-step role setup flow is canonical. | Updated journey and technical docs. | Documented |
| Six-step contradiction removed from active docs. | Focused scan found no stale six-step implementation claim in active Tenant Admin role docs. | Completed |

## Implementation Order

1. Harden effective permission resolvers to filter revoked rows.
2. Decide outlet-context resolver/token strategy.
3. Implement Tenant Admin permission catalog API.
4. Implement Tenant Admin role CRUD/lifecycle APIs.
5. Implement role permission replacement with audit/concurrency.
6. Implement role user assignment/scope APIs.
7. Add last-admin/super-admin protection.
8. Run backend API tests and Flutter runtime verification.

