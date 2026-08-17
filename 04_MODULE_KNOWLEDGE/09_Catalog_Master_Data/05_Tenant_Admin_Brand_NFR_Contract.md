<!-- status: Active canonical target; implementation partial -->
<!-- last_updated: 2026-08-15 -->
# Tenant Admin Add/Edit Brand — NFR Contract

| Category | Locked target | Current implementation |
|---|---|---|
| Security | Backend authority, tenant isolation, safe files; create-authorized initial logo without broad update | Tenant isolation/file security IMPLEMENTED; initial logo FAIL/P0 |
| Reliability | Recoverable create/logo partial success; stale-write protection; submit guard | P0 recovery MISSING; concurrency MISSING; form MISSING |
| Idempotency | UI submit lock; duplicate transport remains distinct; server strategy shared/open | Server MISSING |
| Accessibility | Labels, focus/tab order, semantics, announced errors, contrast, shared touch sizes | Add/Edit MISSING |
| Performance | One detail fetch, no unchanged-logo upload, targeted list/detail invalidation, indexed ordering | Backend PARTIAL/IMPLEMENTED; form MISSING |
| Maintainability | Common shell reuse, content-only ownership, one shared form, existing data layers reused | LOCKED TARGET; form MISSING |
| Observability | Structured safe create/update/status/logo/delete failure and success events | Explicit Brand events/logging MISSING |
| Responsiveness | Tablet-first scrolling/keyboard/action/breadcrumb/logo behavior | Add/Edit MISSING |
| Errors | Stable field identifiers; 400/401/403/404/409/413/415/500 handling | Field errors MISSING; unsupported media currently 400 |
| Audit | Explicit audit event trail, distinct from created_by/updated_by columns | MISSING |

Last-write-wins is not acceptable target behavior. The technical concurrency mechanism is an OPEN DECISION. Brand creation and optional logo upload must never be documented as one transaction while they are separate requests.
