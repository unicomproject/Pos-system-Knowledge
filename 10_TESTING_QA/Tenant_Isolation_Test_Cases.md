<!-- title: Tenant Isolation Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Isolation Test Cases

## Purpose

This file defines tenant isolation tests for TM-EPOS MVP backend features.

## Tenant Isolation Rule

Tenant-owned data must never be read, modified, deleted, counted, exported, or inferred across tenants.

## Standard Cases

| Case | Expected Result |
|---|---|
| Tenant A user reads Tenant A data | allowed |
| Tenant A user reads Tenant B data by id | denied or not found |
| Tenant A user updates Tenant B data by id | denied or not found |
| Tenant A user deletes Tenant B data by id | denied or not found |
| Tenant A list endpoint | only Tenant A rows returned |
| Tenant A duplicate business code | checks duplicate only inside Tenant A unless globally scoped |
| Suspended tenant accesses protected endpoint | blocked according to tenant status rules |

## Required Test Data

Each tenant isolation test should use:

- Tenant A.
- Tenant B.
- User A assigned to Tenant A.
- User B assigned to Tenant B if needed.
- Same-looking business records in both tenants where useful.

## Database Checks

Integration tests must confirm tenant-owned tables use `tenant_id` where required by database rules and repository queries do not bypass tenant filters.

## Cross-Scope Exceptions

Platform-owned reference data may be global only when documented as platform-owned. Tenant-owned workflows must not treat tenant data as global.

## Related Files

- [[../05_BACKEND_ARCHITECTURE/Multi_Tenant_Handling]]
- [[../06_DATABASE_KNOWLEDGE/Tenant_Id_Rules]]
- [[Testing_Strategy]]