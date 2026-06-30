<!-- title: Outlet And Collection Point Setup Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Outlet And Collection Point Setup Flow

## Purpose

Defines how Platform Admin creates tenant outlets and marks outlets as pickup collection points for click and collect.

## Actor

Platform Admin

## Source

Derived from `Slide 4 - Outlet / Collection Point Setup Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens outlet setup for a selected tenant.

## Preconditions

- Tenant exists.
- Platform Admin has tenant setup permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open tenant detail | System opens selected tenant detail. |
| 2 | Go to setup outlets | Platform Admin opens setup > outlets. |
| 3 | Click add outlet | System opens add outlet form. |
| 4 | Enter outlet details | Platform Admin provides outlet name, code, address, and contact number. |
| 5 | Set operating details | Platform Admin configures operating days and hours. |
| 6 | Enable collection point if needed | Platform Admin marks outlet as customer pickup point for click and collect. |
| 7 | Save outlet | System validates and saves outlet. |
| 8 | Outlet created or active | System makes outlet available for till assignment and pickup setup. |

## Data Used Or Captured

- Outlet name
- Outlet code
- Address
- Contact number
- Opening hours
- Active/inactive status
- Collection point flag

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Outlet code must be unique within tenant.
- Collection point must belong to same tenant.

## Validation And Error Cases

- Duplicate outlet code
- Missing address/contact
- Invalid operating hours
- Tenant not active for setup

## Outcome

Outlet is ready for till assignment and may act as click-and-collect pickup point.

## Related Modules

- 02_Tenant_Foundation
- 07_Outlet_Till_POS_Device_Foundation
- 23_Fulfilment_Pickup_ClickCollect

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/08_Outlet_Till_And_POS_Device_Foundation.md
