<!-- status: Active next-phase handoff -->
<!-- last_updated: 2026-08-15 -->
# Tenant Admin Add/Edit Brand — Backend/API/RBAC P0 Handoff

Next phase is **Backend / API / RBAC P0 Gap Closure**, not Flutter implementation.

1. Close initial-logo authorization outcome: create-authorized user completes initial attachment without broad update authority.
2. Define and implement recoverable create-success/logo-failure semantics and logo-only retry.
3. Add permission/API tests for create-only+logo, manage, denied, replacement and cross-tenant IDs.
4. Return stable field-addressable Brand validation using the shared error envelope.
5. Map unsupported Brand media to HTTP 415.
6. Select the shared optimistic-concurrency mechanism and prevent silent stale overwrite.
7. Translate code/slug database uniqueness races safely.
8. Add explicit structured Brand mutation/audit events.
9. Add real PostgreSQL tests for tenant code/slug uniqueness, sort check, tenant-safe Product FK, RESTRICT behavior, migration and uniqueness races.

Preserve existing CRUD, detail response, tenant filters, same-code exclusion, BrandSlug derivation, media validation, Brand configuration, migration and list/read-only details.

Backend gate must pass before Flutter integration: Create, Update, Detail, server slug, SortOrder, tenant isolation, initial-logo authorization, partial-success recovery, approved validation contract, RBAC tests and PostgreSQL tests.
