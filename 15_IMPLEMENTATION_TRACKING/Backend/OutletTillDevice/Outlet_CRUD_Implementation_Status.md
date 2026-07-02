<!-- title: Outlet CRUD Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->

# Outlet CRUD Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | Outlet CRUD |
| Module | OutletTillDevice |
| Platform | Backend |
| Status | Completed |
| Completed Date | 2026-07-02 |
| Tests | Passed |
| PR / Commit | - |

## Notes

- Implements tenant-protected full profile Outlet CRUD under `/api/v1/outlets`.
- Uses server-side tenant context with `tenant.outlets.view` for reads and `tenant.outlets.manage` for writes.
- Adds outlet profile columns, address detail columns, business hours handling, and optional pickup collection-point mapping through existing fulfillment tables.
- EF migration applied locally: `20260702064117_AddOutletFullProfile`.