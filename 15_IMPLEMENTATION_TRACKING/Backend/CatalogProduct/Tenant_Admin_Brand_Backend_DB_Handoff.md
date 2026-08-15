<!-- status: Active implementation handoff; no implementation performed -->
# Tenant Admin Brand — Backend/Database Handoff

Use `04_Tenant_Admin_Brand_Management_Fresh_Source_Truth.md` as canonical baseline. Execute later in this order:

1. Return full Description in detail and prove safe edit preservation.
2. Align Name required/trim/max 150; add Description max 255.
3. Preflight orphan/cross-tenant Product BrandIds, then add nullable composite FK `products(tenant_id,brand_id) -> brands(tenant_id,id)`, `ON DELETE RESTRICT`, and index `(tenant_id,brand_id)`. Fail migration safely; never silently delete/reassign data.
4. Add Brand `sort_order integer NOT NULL DEFAULT 0`, check >=0, DTO/entity/config/snapshot/migration, and list ordering SortOrder then code. Optional list index requires query-plan approval.
5. Add set-based ProductCount: same tenant/Brand; include DRAFT, ACTIVE, INACTIVE; exclude ARCHIVED; do not persist.
6. Complete paging with totalPages and validate query behavior.
7. Fix logo post-mutation internal reload for Update/Manage users without weakening public detail View authorization.
8. Enforce Brand-only JPEG/PNG max 2 MB while retaining signature/MIME/extension/tenant ownership/cleanup.
9. Resolve platform-wide concurrency standard; do not invent a Brand-only token.
10. Add backend and database tests from the canonical test contract.
11. Verify model snapshot/pending changes/migration ordering and false historical SortOrder claim removal.
12. Run migrations and integrity tests against real PostgreSQL.

BrandSlug is **UNRESOLVED — KEEP CURRENT BEHAVIOR UNTIL DECISION**. Code allowed characters, deleted-code reuse and restore semantics also require decisions.

Handoff readiness: **READY FOR BACKEND/DB IMPLEMENTATION** as a documentation contract; implementation remains NOT STARTED.
