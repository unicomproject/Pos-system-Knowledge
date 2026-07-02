<!-- title: Tenant Admin Outlet Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Outlet Management Flow

## Purpose

Defines how Tenant Admin creates or updates outlets and optional collection points.

## Actor

Tenant Admin

## Source

Derived from `Slide 4 - Outlet Management Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens outlet management.

## Preconditions

- Tenant Admin has outlet management permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open outlet management | System opens outlet list. |
| 2 | View outlet list | System displays existing outlets. |
| 3 | Click add outlet | System opens outlet form. |
| 4 | Enter outlet details | Tenant Admin enters outlet data. |
| 5 | Set operating hours | Tenant Admin defines operating hours. |
| 6 | Enable collection point if needed | Tenant Admin enables pickup collection point for click and collect. |
| 7 | Set outlet status | Tenant Admin sets active/inactive. |
| 8 | Validate outlet details | System validates data. |
| 9 | Save outlet | System saves outlet. |
| 10 | Outlet ready for till assignment | Outlet can be used for tills and pickup operations. |

## Data Used Or Captured

- Outlet name
- Outlet code
- Address
- Contact
- Operating hours
- Collection point flag
- Status

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Collection point is active MVP scope for Click & Collect.
- Outlet code must be tenant-unique.

## Validation And Error Cases

- Validation error
- Duplicate outlet code
- Invalid operating hours
- Permission denied

## Outcome

Outlet is created/updated and ready for till assignment.

## Related Modules

- 07_Outlet_Till_POS_Device_Foundation
- 23_Fulfilment_Pickup_ClickCollect

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/08_Outlet_Till_And_POS_Device_Foundation.md
