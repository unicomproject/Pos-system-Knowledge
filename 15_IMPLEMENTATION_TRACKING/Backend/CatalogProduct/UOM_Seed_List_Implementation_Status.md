<!-- title: UOM Seed List Implementation Status -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: UOM Seed/List -->
<!-- last_updated: 2026-07-03 -->

# UOM Seed/List Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | UOM Seed/List |
| Module | CatalogProduct |
| Platform | Backend |
| Status | Completed |
| Completed Date | 2026-07-03 |
| Tests | Passed |
| PR / Commit | - |

## Implemented Scope

- `GET /api/v1/unit-of-measures` tenant-protected API.
- Uses server-side tenant context from JWT claims.
- Requires `catalog.products.view` permission.
- Returns DTOs only, not EF entities.
- `unit_of_measures.tenant_id` supports `NULL` for global UOM rows.
- Global UOM seed rows: `PCS`, `KG`, `G`, `L`, `ML`, `BOX`, `PACK`.
- Global and tenant-scoped unique indexes for `uom_code`.

## Not Included

- UOM create/update/delete APIs.
- Separate `catalog.uom.*` permissions.
- UOM conversion calculation rules.